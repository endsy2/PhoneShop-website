import pool from "../../db/db_handle.js";



export const offerDisplay = async (req, res) => {
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
        p.stock,
        p.release_date,
        pv.color,
        pm.discount_percentage,
        pm.end_date,
        pi.image AS images,
        s.screen_size,
        s.processor,
        s.ram,
        s.storage,
        s.battery,
        s.camera,
        b.brand_name,
        b.img AS brand_img,
        ROW_NUMBER() OVER (PARTITION BY p.phone_id ORDER BY s.price DESC) AS row_num
    FROM phones p
    INNER JOIN brands b ON p.brand_id = b.brand_id
    INNER JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN phone_variants pv ON pv.phone_id = p.phone_id
    LEFT JOIN specifications s ON s.phone_variant_id = pv.idphone_variants
    INNER JOIN promotions pm ON pm.spec_id = s.spec_id -- Corrected join condition
    LEFT JOIN productimage pi ON pi.phone_variant_id = pv.idphone_variants -- Join for product images
    WHERE pm.status = "Active"
    GROUP BY 
        pm.promo_id, 
        p.phone_id, 
        p.name, 
        pm.promo_name, 
        c.category_name, 
        p.description, 
        s.price, 
        p.stock, 
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
 `
    await pool.promise().query(query)
        .then(([offer]) => {
            res.status(200).json({
                message: "successfully",
                data: offer
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(400).json({
                message: "something went wrong "
            })
        })
}
export const offerDisplayByName = async (req, res) => {
    const { promo_name } = req.query;
    const query = `SELECT
                    pm.promo_id,
                    p.phone_id,
                    p.name,
                    pm.promo_name,
                    c.category_name,
                    p.description,
                    ROUND(pv.price * (100 - pm.discount_percentage) / 100, 2)  AS price,
                    p.stock,
                    p.release_date,
                    pv.color,
                    GROUP_CONCAT(DISTINCT pi.image SEPARATOR ', ') AS images, -- Combines distinct images into a single string
                    s.screen_size,
                    s.processor,
                    s.ram,
                    s.storage,
                    s.battery,
                    s.camera,
                    b.brand_name,
                    b.img AS brand_img,
                    c.category_name 
                    FROM phones p 
                    LEFT JOIN specifications s ON p.phone_id = s.phone_id 
                    INNER JOIN brands b ON p.brand_id = b.brand_id 
                    INNER JOIN categories c ON p.category_id = c.category_id
                    INNER JOIN promotions pm ON pm.phone_id = p.phone_id
                    LEFT JOIN productimage pi ON pi.phone_id = p.phone_id -- Join for product images
                    LEFT JOIN phone_variants pv ON pv.phone_id=p.phone_id
                    WHERE pm.promo_name=?
                    GROUP BY pm.promo_id,p.phone_id, p.name,pm.promo_name,c.category_name, p.description, p.stock, p.release_date, pv.color,pv.price,
                    s.screen_size, s.processor, s.ram, s.storage, s.battery, s.camera,
                    b.brand_name, b.img, c.category_name, pm.status, pm.discount_percentage;
                    
                    `
    await pool.promise().query(query, [promo_name])
        .then(([offer]) => {
            res.status(200).json({
                message: "successfully",
                data: offer
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(400).json({
                message: "something went wrong "
            })
        })
}
export const offerDisplayByID = async (req, res) => {
    const { id } = req.params;
    console.log(id);

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
        p.stock,
        p.release_date,
        pv.idphone_variants,
        pv.color,
        pv.stock AS color_stock,
        pm.discount_percentage,
        pm.end_date,
        GROUP_CONCAT(DISTINCT pi.image SEPARATOR ', ') AS images, -- Combines distinct images into a single string
        s.screen_size,
        s.processor,
        s.ram,
        s.storage,
        s.battery,
        s.camera,
        s.stock AS spec_stock,
        b.brand_name,
        b.img AS brand_img,
        ROW_NUMBER() OVER (PARTITION BY p.phone_id ORDER BY s.price DESC) AS row_num
    FROM phones p
    INNER JOIN brands b ON p.brand_id = b.brand_id
    INNER JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN phone_variants pv ON pv.phone_id = p.phone_id
    LEFT JOIN specifications s ON s.phone_variant_id = pv.idphone_variants
    INNER JOIN promotions pm ON pm.spec_id = s.spec_id-- Corrected join condition
    LEFT JOIN productimage pi ON pi.phone_variant_id = pv.idphone_variants -- Join for product images
    WHERE pm.status = "Active"
    GROUP BY 
        pm.promo_id, 
        p.phone_id, 
        p.name, 
        pm.promo_name, 
        c.category_name, 
        p.description, 
        s.price, 
        p.stock, 
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
    await pool.promise().query(query, [id])
        .then(([offer]) => {
            res.status(200).json({
                message: "successfully",
                data: offer
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(400).json({
                message: "something went wrong "
            })
        })
}
