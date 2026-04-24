import pool from "../../db/db_handle.js";


export const offerInsert = async (req, res) => {
    const {
        phone_name,
        promo_name,
        storage,
        discount_percent,
        start_date,
        end_date,
        color,
    } = req.body;
    console.log(req.body);

    const normalizedPhoneName = phone_name?.trim();
    const normalizedPromoName = promo_name?.trim();
    const normalizedStorage = storage?.trim();
    const normalizedColor = color?.trim();
    const normalizedDiscount = Number(String(discount_percent ?? "").replace("%", "").trim());

    if (
        !normalizedPhoneName ||
        !normalizedPromoName ||
        Number.isNaN(normalizedDiscount) ||
        !start_date ||
        !end_date ||
        !normalizedColor ||
        !normalizedStorage
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const findPhoneQuery = `SELECT pv.idphone_variants 
                            FROM phones p
                            INNER JOIN phone_variants pv ON pv.phone_id = p.phone_id
                            WHERE p.name = ? AND pv.color = ?`;

    const findSpec = `SELECT spec_id 
                      FROM specifications 
                      WHERE phone_variant_id = ? AND storage = ?`;

    const findExistingPromotion = `SELECT promo_id FROM promotions WHERE spec_id = ? LIMIT 1`;

    const insertPromote = `INSERT INTO promotions (spec_id, promo_name, discount_percentage, start_date, end_date) 
                           VALUES (?, ?, ?, ?, ?)`;

    const updatePromote = `UPDATE promotions
                           SET promo_name = ?,
                               discount_percentage = ?,
                               start_date = ?,
                               end_date = ?
                           WHERE promo_id = ?`;

    try {
        // Step 1: Find phone variant ID
        const [phoneRows] = await pool.promise().query(findPhoneQuery, [
            normalizedPhoneName,
            normalizedColor,
        ]);

        if (phoneRows.length === 0) {
            return res.status(404).json({ message: "No matching phones found" });
        }

        const phone_variants_id = phoneRows[0].idphone_variants;

        // Step 2: Find specification ID
        const [specRows] = await pool.promise().query(findSpec, [
            phone_variants_id,
            normalizedStorage,
        ]);

        if (specRows.length === 0) {
            return res.status(404).json({ message: "Specification not found" });
        }

        const spec_id = specRows[0].spec_id;

        // Step 3: Insert or update promotion for this spec
        const [existingRows] = await pool.promise().query(findExistingPromotion, [spec_id]);

        let result;
        if (existingRows.length > 0) {
            const promo_id = existingRows[0].promo_id;
            [result] = await pool.promise().query(updatePromote, [
                normalizedPromoName,
                normalizedDiscount,
                start_date,
                end_date,
                promo_id,
            ]);
        } else {
            [result] = await pool.promise().query(insertPromote, [
                spec_id,
                normalizedPromoName,
                normalizedDiscount,
                start_date,
                end_date,
            ]);
        }

        res.status(200).json({
            message: "Promotion saved successfully",
            data: result,
        });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({
            message: error?.message || "Something went wrong",
            error: error.message,
        });
    }
};



export const offerUpdate = async (req, res) => {
    const { offerID } = req.params;
    const { phone_id } = req.query;
    const { promo_name, discount_percent, start_date, end_date } = req.body;

    if (!offerID, !phone_id, !promo_name, !discount_percent, !start_date, !end_date) {
        return res.status(500).json({
            message: "fill all the blank"
        })
    }

    const queryUpdate = `
    UPDATE promotions
    SET promo_name=?,
        discount_percentage=?,
        price_discount=?,
        start_date=?,
        end_date=?
    WHERE promo_id=?
    `
    const queryFind = `
    SELECT price
    FROM phones
    WHERE phone_id=?
`;

    try {
        const [phone] = await pool.promise().query(queryFind, [phone_id]);
        const old_price = phone[0].price
        console.log(old_price);

        const new_price = old_price * (100 - discount_percent) / 100
        console.log(new_price);

        const value = [
            promo_name,
            discount_percent,
            new_price,
            start_date,
            end_date,
            offerID
        ]

        await pool.promise().query(queryUpdate, value).then(([rows]) => {
            console.log(rows);
            res.status(200).json({
                message: 'successfully',
                data: rows
            })
        }).catch((error) => {
            console.log(error);
            res.status(400).json({
                message: "something went wrong"
            })
        })
    } catch (error) {
        console.log(error);
    }
}
export const offerDelete = async (req, res) => {
    const { offerID } = req.params;

    const queryDelete = `
    DELETE FROM promotions
    WHERE promo_id=?
    `
    await pool.promise().query(queryDelete, [offerID]).then(([rows]) => {
        console.log(rows)
        res.status(200).json({
            message: 'successfully',
            data: rows
        })
    }).catch((error) => {
        console.log(error);
        res.status(400).json({
            message: "something went wrong"
        })
    })
}
