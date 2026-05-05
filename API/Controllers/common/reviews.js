import pool from "../../db/db_handle.js";

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
    const { spec_id } = req.params;
    const { sortBy = "recent", filterRating = null } = req.query;

    try {
        let query = `
            SELECT 
                pr.review_id,
                pr.spec_id,
                pr.rating,
                pr.title,
                pr.comment,
                pr.helpful_count,
                pr.unhelpful_count,
                pr.is_verified_purchase,
                pr.created_at,
                c.username,
                c.profile_picture
            FROM product_reviews pr
            JOIN customers c ON pr.customer_id = c.customer_id
            WHERE pr.spec_id = ?
        `;

        const params = [spec_id];

        if (filterRating) {
            query += ` AND pr.rating = ?`;
            params.push(filterRating);
        }

        if (sortBy === "recent") {
            query += ` ORDER BY pr.created_at DESC`;
        } else if (sortBy === "helpful") {
            query += ` ORDER BY (pr.helpful_count - pr.unhelpful_count) DESC`;
        } else if (sortBy === "highest") {
            query += ` ORDER BY pr.rating DESC`;
        } else if (sortBy === "lowest") {
            query += ` ORDER BY pr.rating ASC`;
        }

        const [reviews] = await pool.promise().query(query, params);

        // Get average rating and review count
        const statsQuery = `
            SELECT 
                COUNT(*) as total_reviews,
                AVG(pr.rating) as avg_rating,
                SUM(CASE WHEN pr.rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN pr.rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN pr.rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN pr.rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN pr.rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM product_reviews
            WHERE spec_id = ?
        `;

        const [stats] = await pool.promise().query(statsQuery, [spec_id]);

        return res.status(200).json({
            message: "Reviews retrieved successfully",
            stats: stats[0] || { total_reviews: 0, avg_rating: 0 },
            reviews
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Error fetching reviews", error: error.message });
    }
};

// Add a new review
export const addProductReview = async (req, res) => {
    const { spec_id, rating, title, comment } = req.body;
    const customer_id = req.user?.user?.customer_id || req.user?.customer_id;

    if (!spec_id || !rating || !comment) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        // Check if customer purchased this product
        const purchaseQuery = `
            SELECT COUNT(*) as purchase_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.customer_id = ? AND oi.spec_id = ?
        `;

        const [[purchaseData]] = await pool.promise().query(purchaseQuery, [customer_id, spec_id]);
        const is_verified_purchase = purchaseData.purchase_count > 0;

        // Check if review already exists
        const existingReview = `SELECT review_id FROM product_reviews WHERE spec_id = ? AND customer_id = ?`;
        const [existing] = await pool.promise().query(existingReview, [spec_id, customer_id]);

        let result;
        if (existing.length > 0) {
            // Update existing review
            const updateQuery = `
                UPDATE product_reviews 
                SET rating = ?, title = ?, comment = ?, is_verified_purchase = ?
                WHERE review_id = ?
            `;
            result = await pool.promise().query(updateQuery, [rating, title, comment, is_verified_purchase, existing[0].review_id]);
        } else {
            // Insert new review
            const insertQuery = `
                INSERT INTO product_reviews (spec_id, customer_id, rating, title, comment, is_verified_purchase)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            result = await pool.promise().query(insertQuery, [spec_id, customer_id, rating, title, comment, is_verified_purchase]);
        }

        return res.status(201).json({ message: "Review added/updated successfully" });
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ message: "Error adding review", error: error.message });
    }
};

// Mark review as helpful/unhelpful
export const voteReview = async (req, res) => {
    const { review_id, vote_type } = req.body;
    const customer_id = req.user?.user?.customer_id || req.user?.customer_id;

    if (!["helpful", "unhelpful"].includes(vote_type)) {
        return res.status(400).json({ message: "Invalid vote type" });
    }

    try {
        // Check if already voted
        const checkVote = `SELECT vote_id FROM review_votes WHERE review_id = ? AND customer_id = ?`;
        const [existingVote] = await pool.promise().query(checkVote, [review_id, customer_id]);

        if (existingVote.length > 0) {
            return res.status(400).json({ message: "You have already voted on this review" });
        }

        // Insert vote
        const insertVote = `
            INSERT INTO review_votes (review_id, customer_id, vote_type)
            VALUES (?, ?, ?)
        `;
        await pool.promise().query(insertVote, [review_id, customer_id, vote_type]);

        // Update review counts
        const column = vote_type === "helpful" ? "helpful_count" : "unhelpful_count";
        const updateReview = `
            UPDATE product_reviews 
            SET ${column} = ${column} + 1
            WHERE review_id = ?
        `;
        await pool.promise().query(updateReview, [review_id]);

        return res.status(200).json({ message: "Vote recorded successfully" });
    } catch (error) {
        console.error("Error voting review:", error);
        return res.status(500).json({ message: "Error voting review", error: error.message });
    }
};

// Delete review
export const deleteReview = async (req, res) => {
    const { review_id } = req.params;
    const customer_id = req.user?.user?.customer_id || req.user?.customer_id;

    try {
        // Check ownership
        const checkOwner = `SELECT customer_id FROM product_reviews WHERE review_id = ?`;
        const [[review]] = await pool.promise().query(checkOwner, [review_id]);

        if (!review || review.customer_id !== customer_id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Delete review (votes cascade delete)
        const deleteQuery = `DELETE FROM product_reviews WHERE review_id = ?`;
        await pool.promise().query(deleteQuery, [review_id]);

        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Error deleting review", error: error.message });
    }
};
