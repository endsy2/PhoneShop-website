import pool from "../../db/db_handle.js";

// Track browsing history
export const trackBrowsing = async (req, res) => {
    const { spec_id } = req.body;
    const customer_id = req.user?.user?.customer_id || req.user?.customer_id;

    if (!spec_id) {
        return res.status(400).json({ message: "spec_id required" });
    }

    try {
        // Only track if customer is logged in
        if (customer_id) {
            const insertQuery = `
                INSERT INTO browsing_history (customer_id, spec_id, viewed_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `;
            await pool.promise().query(insertQuery, [customer_id, spec_id]);
        }

        return res.status(200).json({ message: "Browsing tracked" });
    } catch (error) {
        console.error("Error tracking browsing:", error);
        return res.status(500).json({ message: "Error tracking browsing", error: error.message });
    }
};

// Get "Customers who viewed this also viewed" recommendations
export const getCoViewedProducts = async (req, res) => {
    const { spec_id } = req.params;
    const limit = req.query.limit || 4;

    try {
        const query = `
            SELECT DISTINCT
                s.spec_id,
                p.phone_id,
                p.name,
                pv.color,
                s.storage,
                s.price,
                s.price_discount,
                s.discount_percentage,
                GROUP_CONCAT(pi.image SEPARATOR ',') as images,
                (SELECT AVG(rating) FROM product_reviews WHERE spec_id = s.spec_id) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE spec_id = s.spec_id) as review_count
            FROM browsing_history bh1
            JOIN browsing_history bh2 ON bh1.customer_id = bh2.customer_id 
                AND bh1.viewed_at < bh2.viewed_at
                AND TIMESTAMPDIFF(HOUR, bh1.viewed_at, bh2.viewed_at) < 24
            JOIN specifications s ON bh2.spec_id = s.spec_id
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            LEFT JOIN productimage pi ON pv.idphone_variants = pi.phone_variant_id
            WHERE bh1.spec_id = ? AND bh2.spec_id != ?
            GROUP BY s.spec_id, p.phone_id, p.name, pv.color, s.storage, s.price
            ORDER BY COUNT(*) DESC
            LIMIT ?
        `;

        const [products] = await pool.promise().query(query, [spec_id, spec_id, parseInt(limit)]);

        return res.status(200).json({
            message: "Co-viewed products retrieved",
            products
        });
    } catch (error) {
        console.error("Error getting co-viewed products:", error);
        return res.status(500).json({ message: "Error getting co-viewed products", error: error.message });
    }
};

// Get similar products by price point
export const getSimilarPriceProducts = async (req, res) => {
    const { spec_id } = req.params;
    const limit = req.query.limit || 4;
    const priceRange = req.query.range || 100; // ±$100

    try {
        // Get target product price
        const priceQuery = `SELECT price FROM specifications WHERE spec_id = ?`;
        const [[priceData]] = await pool.promise().query(priceQuery, [spec_id]);

        if (!priceData) {
            return res.status(404).json({ message: "Product not found" });
        }

        const targetPrice = priceData.price;
        const minPrice = targetPrice - priceRange;
        const maxPrice = targetPrice + priceRange;

        const query = `
            SELECT
                s.spec_id,
                p.phone_id,
                p.name,
                pv.color,
                s.storage,
                s.price,
                s.price_discount,
                s.discount_percentage,
                GROUP_CONCAT(DISTINCT pi.image SEPARATOR ',') as images,
                (SELECT AVG(rating) FROM product_reviews WHERE spec_id = s.spec_id) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE spec_id = s.spec_id) as review_count,
                ABS(s.price - ?) as price_diff
            FROM specifications s
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            LEFT JOIN productimage pi ON pv.idphone_variants = pi.phone_variant_id
            WHERE s.spec_id != ?
                AND s.price BETWEEN ? AND ?
                AND (s.stock - COALESCE(s.reserved_stock, 0)) > 0
            GROUP BY s.spec_id, p.phone_id, p.name, pv.color, s.storage, s.price
            ORDER BY price_diff ASC
            LIMIT ?
        `;

        const [products] = await pool.promise().query(query, [
            targetPrice,
            spec_id,
            minPrice,
            maxPrice,
            parseInt(limit)
        ]);

        return res.status(200).json({
            message: "Similar price products retrieved",
            targetPrice,
            priceRange: { min: minPrice, max: maxPrice },
            products
        });
    } catch (error) {
        console.error("Error getting similar price products:", error);
        return res.status(500).json({ message: "Error getting similar price products", error: error.message });
    }
};

// Get top rated products in category
export const getTopRatedInCategory = async (req, res) => {
    const { spec_id } = req.params;
    const limit = req.query.limit || 4;

    try {
        // Get category of target product
        const categoryQuery = `
            SELECT p.category_id
            FROM specifications s
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            WHERE s.spec_id = ?
        `;
        const [[categoryData]] = await pool.promise().query(categoryQuery, [spec_id]);

        if (!categoryData) {
            return res.status(404).json({ message: "Product not found" });
        }

        const query = `
            SELECT
                s.spec_id,
                p.phone_id,
                p.name,
                pv.color,
                s.storage,
                s.price,
                s.price_discount,
                GROUP_CONCAT(DISTINCT pi.image SEPARATOR ',') as images,
                AVG(pr.rating) as avg_rating,
                COUNT(pr.review_id) as review_count
            FROM specifications s
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            LEFT JOIN productimage pi ON pv.idphone_variants = pi.phone_variant_id
            LEFT JOIN product_reviews pr ON s.spec_id = pr.spec_id
            WHERE p.category_id = ? AND s.spec_id != ?
                AND (s.stock - COALESCE(s.reserved_stock, 0)) > 0
            GROUP BY s.spec_id, p.phone_id, p.name, pv.color, s.storage, s.price
            HAVING COUNT(pr.review_id) > 0
            ORDER BY AVG(pr.rating) DESC
            LIMIT ?
        `;

        const [products] = await pool.promise().query(query, [
            categoryData.category_id,
            spec_id,
            parseInt(limit)
        ]);

        return res.status(200).json({
            message: "Top rated products retrieved",
            products
        });
    } catch (error) {
        console.error("Error getting top rated products:", error);
        return res.status(500).json({ message: "Error getting top rated products", error: error.message });
    }
};

// Get personalized recommendations for user
export const getPersonalizedRecommendations = async (req, res) => {
    const customer_id = req.user?.user?.customer_id || req.user?.customer_id;
    const limit = req.query.limit || 6;

    if (!customer_id) {
        return res.status(401).json({ message: "Customer not authenticated" });
    }

    try {
        // Get recently viewed categories
        const query = `
            SELECT DISTINCT
                s.spec_id,
                p.phone_id,
                p.name,
                pv.color,
                s.storage,
                s.price,
                s.price_discount,
                GROUP_CONCAT(DISTINCT pi.image SEPARATOR ',') as images,
                (SELECT AVG(rating) FROM product_reviews WHERE spec_id = s.spec_id) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE spec_id = s.spec_id) as review_count
            FROM browsing_history bh
            JOIN specifications s ON bh.spec_id = s.spec_id
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            LEFT JOIN productimage pi ON pv.idphone_variants = pi.phone_variant_id
            WHERE bh.customer_id = ?
                AND (s.stock - COALESCE(s.reserved_stock, 0)) > 0
                AND bh.spec_id NOT IN (
                    SELECT spec_id FROM order_items oi 
                    JOIN orders o ON oi.order_id = o.order_id 
                    WHERE o.customer_id = ?
                )
            GROUP BY s.spec_id, p.phone_id, p.name, pv.color, s.storage, s.price
            ORDER BY bh.viewed_at DESC
            LIMIT ?
        `;

        const [products] = await pool.promise().query(query, [
            customer_id,
            customer_id,
            parseInt(limit)
        ]);

        return res.status(200).json({
            message: "Personalized recommendations retrieved",
            products
        });
    } catch (error) {
        console.error("Error getting personalized recommendations:", error);
        return res.status(500).json({ message: "Error getting recommendations", error: error.message });
    }
};
