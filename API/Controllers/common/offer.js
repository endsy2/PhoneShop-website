import pool from "../../db/db_handle.js";

// Live promotions, one row per phone (its most expensive promoted spec).
// extraCondition narrows the promotions before ranking, e.g. " AND pm.promo_name LIKE ?".
const activeOffersQuery = (extraCondition = "") => `WITH RankedPhones AS (
    SELECT
        pm.promo_id,
        p.phone_id,
        p.name,
        pm.promo_name,
        c.category_name,
        p.description,
        ROUND(s.price * (100 - pm.discount_percentage) / 100, 2) AS price_discount,
        s.price AS price,
        s.stock,
        p.release_date,
        pv.color,
        pm.discount_percentage,
        pm.end_date,
        pi.image AS images,
        s.spec_id,
        s.screen_size,
        s.processor,
        s.ram,
        s.storage,
        s.battery,
        s.camera,
        b.brand_name,
        b.img AS brand_img,
        ROUND(AVG(pr.rating), 1) AS avg_rating,
        COUNT(pr.review_id) AS review_count,
        ROW_NUMBER() OVER (PARTITION BY p.phone_id ORDER BY s.price DESC) AS row_num
    FROM phones p
    INNER JOIN brands b ON p.brand_id = b.brand_id
    INNER JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN phone_variants pv ON pv.phone_id = p.phone_id
    LEFT JOIN specifications s ON s.phone_variant_id = pv.idphone_variants
    INNER JOIN promotions pm ON pm.spec_id = s.spec_id 
    LEFT JOIN productimage pi ON pi.phone_variant_id = pv.idphone_variants 
    LEFT JOIN product_reviews pr ON pr.spec_id = s.spec_id
    WHERE CURDATE() BETWEEN DATE(pm.start_date) AND DATE(pm.end_date)${extraCondition}
    GROUP BY 
        pm.promo_id, 
        p.phone_id, 
        p.name, 
        pm.promo_name, 
        c.category_name, 
        p.description, 
        s.spec_id,
        s.price, 
        s.stock, 
        p.release_date, 
        pv.color, 
        pm.discount_percentage, 
        pm.end_date, 
        s.screen_size, 
        s.processor, 
        s.ram, 
        s.storage, 
        s.battery, 
        s.camera, 
        b.brand_name, 
        b.img,
        pi.image
)
SELECT * FROM RankedPhones
WHERE RankedPhones.row_num = 1;
`;

const sendOffers = (res, query, params = []) =>
    pool.promise().query(query, params).then(([offer]) =>
        res.status(200).json({ message: "successfully", data: offer })
    );

export const offerDisplay = (req, res) => sendOffers(res, activeOffersQuery());

// Admin promotion search: same rows as offerDisplay, filtered by promotion name.
export const offerDisplayByName = (req, res) => {
    const { promo_name = "" } = req.query;
    return sendOffers(res, activeOffersQuery(" AND pm.promo_name LIKE ?"), [`%${promo_name}%`]);
};
export const offerDisplayByID = (req, res) => {
    const { id } = req.params;

    const query = `WITH RankedPhones AS (
    SELECT
        pm.promo_id,
        p.phone_id,
        p.name,
        pm.promo_name,
        c.category_name,
        p.description,
        ROUND(s.price * (100 - pm.discount_percentage) / 100, 2) AS price_discount,
        s.price AS price,
        s.stock,
        p.release_date,
        pv.idphone_variants,
        pv.color,
        pv.stock AS color_stock,
        pm.discount_percentage,
        pm.end_date,
        GROUP_CONCAT(DISTINCT pi.image SEPARATOR ', ') AS images,
        s.spec_id,
        s.screen_size,
        s.processor,
        s.ram,
        s.storage,
        s.battery,
        s.camera,
        s.stock AS spec_stock,
        b.brand_name,
        b.img AS brand_img,
        ROUND(AVG(pr.rating), 1) AS avg_rating,
        COUNT(pr.review_id) AS review_count,
        ROW_NUMBER() OVER (PARTITION BY p.phone_id ORDER BY s.price DESC) AS row_num
    FROM phones p
    INNER JOIN brands b ON p.brand_id = b.brand_id
    INNER JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN phone_variants pv ON pv.phone_id = p.phone_id
    LEFT JOIN specifications s ON s.phone_variant_id = pv.idphone_variants
    INNER JOIN promotions pm ON pm.spec_id = s.spec_id
    LEFT JOIN productimage pi ON pi.phone_variant_id = pv.idphone_variants
    LEFT JOIN product_reviews pr ON pr.spec_id = s.spec_id
    WHERE CURDATE() BETWEEN DATE(pm.start_date) AND DATE(pm.end_date)
    GROUP BY 
        pm.promo_id, 
        p.phone_id, 
        p.name, 
        pm.promo_name, 
        c.category_name, 
        p.description, 
        s.spec_id,
        s.price, 
        s.stock, 
        p.release_date, 
        pv.color, 
        pm.discount_percentage, 
        pm.end_date, 
        s.screen_size, 
        s.processor, 
        s.ram, 
        s.storage, 
        s.battery, 
        s.camera, 
        b.brand_name, 
        b.img
)
SELECT * FROM RankedPhones
WHERE RankedPhones.phone_id=?
                    `
    return sendOffers(res, query, [id]);
}

