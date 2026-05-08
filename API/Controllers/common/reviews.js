import pool from "../../db/db_handle.js";

// Resolve customer_id from JWT token username
const resolveCustomerId = async (req) => {
    const tokenPayload = req?.user?.user || {};
    const username = typeof tokenPayload.username === "object"
        ? tokenPayload.username.username || tokenPayload.username.name || ""
        : tokenPayload.username || tokenPayload.name || "";

    if (!username) return null;

    const [rows] = await pool.promise().query(
        `SELECT customer_id FROM customers WHERE username = ? LIMIT 1`,
        [username]
    );
    return rows[0]?.customer_id || null;
};

// GET /common/reviews/:spec_id  — fetches all reviews for the product (by phone_id)
export const getProductReviews = async (req, res) => {
    const { spec_id } = req.params;
    const { sortBy = "recent", filterRating = null } = req.query;

    try {
        // Get the phone_id from spec_id so we can show all reviews for the product
        const [[specRow]] = await pool.promise().query(
            `SELECT pv.phone_id FROM specifications s
             JOIN phone_variants pv ON pv.idphone_variants = s.phone_variant_id
             WHERE s.spec_id = ? LIMIT 1`,
            [spec_id]
        );

        if (!specRow) {
            return res.status(200).json({ message: "No reviews", stats: { total_reviews: 0, avg_rating: 0 }, reviews: [] });
        }

        const phone_id = specRow.phone_id;

        // Get all spec_ids for this product
        const [specRows] = await pool.promise().query(
            `SELECT s.spec_id FROM specifications s
             JOIN phone_variants pv ON pv.idphone_variants = s.phone_variant_id
             WHERE pv.phone_id = ?`,
            [phone_id]
        );
        const specIds = specRows.map(r => r.spec_id);
        if (specIds.length === 0) {
            return res.status(200).json({ message: "No reviews", stats: { total_reviews: 0, avg_rating: 0 }, reviews: [] });
        }

        const placeholders = specIds.map(() => '?').join(',');

        let query = `
            SELECT 
                pr.review_id, pr.spec_id, pr.rating, pr.title, pr.comment,
                pr.helpful_count, pr.unhelpful_count, pr.is_verified_purchase,
                pr.created_at, c.username, c.profile_picture
            FROM product_reviews pr
            JOIN customers c ON pr.customer_id = c.customer_id
            WHERE pr.spec_id IN (${placeholders})
        `;

        const params = [...specIds];

        if (filterRating) {
            query += ` AND pr.rating = ?`;
            params.push(Number(filterRating));
        }

        if (sortBy === "helpful") {
            query += ` ORDER BY (pr.helpful_count - pr.unhelpful_count) DESC`;
        } else if (sortBy === "highest") {
            query += ` ORDER BY pr.rating DESC`;
        } else if (sortBy === "lowest") {
            query += ` ORDER BY pr.rating ASC`;
        } else {
            query += ` ORDER BY pr.created_at DESC`;
        }

        const [reviews] = await pool.promise().query(query, params);

        const [[stats]] = await pool.promise().query(`
            SELECT 
                COUNT(*) as total_reviews,
                ROUND(AVG(rating), 1) as avg_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM product_reviews WHERE spec_id IN (${placeholders})
        `, specIds);

        return res.status(200).json({
            message: "Reviews retrieved successfully",
            stats: stats || { total_reviews: 0, avg_rating: 0 },
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

    if (!spec_id || !rating || !comment) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        const customer_id = await resolveCustomerId(req);
        if (!customer_id) {
            return res.status(401).json({ message: "Please log in to leave a review" });
        }

        // Check verified purchase
        const [[purchaseData]] = await pool.promise().query(`
            SELECT COUNT(*) as purchase_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.customer_id = ? AND oi.spec_id = ?
        `, [customer_id, spec_id]);
        const is_verified_purchase = purchaseData.purchase_count > 0 ? 1 : 0;

        // Get all spec_ids for this product so we enforce one review per user per product
        const [[specRow]] = await pool.promise().query(
            `SELECT pv.phone_id FROM specifications s
             JOIN phone_variants pv ON pv.idphone_variants = s.phone_variant_id
             WHERE s.spec_id = ? LIMIT 1`,
            [spec_id]
        );

        // Always insert a new review — multiple reviews per user allowed
        await pool.promise().query(`
            INSERT INTO product_reviews (spec_id, customer_id, rating, title, comment, is_verified_purchase)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [spec_id, customer_id, rating, title || null, comment, is_verified_purchase]);

        return res.status(201).json({ message: "Review added successfully" });
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ message: "Error adding review", error: error.message });
    }
};

// Mark review as helpful/unhelpful
export const voteReview = async (req, res) => {
    const { review_id, vote_type } = req.body;

    if (!["helpful", "unhelpful"].includes(vote_type)) {
        return res.status(400).json({ message: "Invalid vote type" });
    }

    try {
        const customer_id = await resolveCustomerId(req);
        if (!customer_id) {
            return res.status(401).json({ message: "Please log in to vote" });
        }

        const [existingVote] = await pool.promise().query(
            `SELECT vote_id FROM review_votes WHERE review_id = ? AND customer_id = ?`,
            [review_id, customer_id]
        );

        if (existingVote.length > 0) {
            return res.status(400).json({ message: "You have already voted on this review" });
        }

        await pool.promise().query(
            `INSERT INTO review_votes (review_id, customer_id, vote_type) VALUES (?, ?, ?)`,
            [review_id, customer_id, vote_type]
        );

        const column = vote_type === "helpful" ? "helpful_count" : "unhelpful_count";
        await pool.promise().query(
            `UPDATE product_reviews SET ${column} = ${column} + 1 WHERE review_id = ?`,
            [review_id]
        );

        return res.status(200).json({ message: "Vote recorded successfully" });
    } catch (error) {
        console.error("Error voting review:", error);
        return res.status(500).json({ message: "Error voting review", error: error.message });
    }
};

// Delete review
export const deleteReview = async (req, res) => {
    const { review_id } = req.params;

    try {
        const customer_id = await resolveCustomerId(req);
        if (!customer_id) {
            return res.status(401).json({ message: "Please log in" });
        }

        const [[review]] = await pool.promise().query(
            `SELECT customer_id FROM product_reviews WHERE review_id = ?`,
            [review_id]
        );

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.customer_id !== customer_id) {
            return res.status(403).json({ message: "You can only delete your own reviews" });
        }

        await pool.promise().query(`DELETE FROM product_reviews WHERE review_id = ?`, [review_id]);
        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Error deleting review", error: error.message });
    }
};
