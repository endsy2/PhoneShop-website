import pool from "../../db/db_handle.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../Utils/generateToken.js";
import { cookieConfig } from "../../Utils/handleCookies.js";

const resolveUsername = (req) => {
    const tokenPayload = req?.user?.user || {};
    if (typeof tokenPayload.username === "object") {
        return tokenPayload.username.username || tokenPayload.username.name || "";
    }
    return tokenPayload.username || tokenPayload.name || "";
};

export const getUserInformation = async (req, res) => {
    try {
        const username = resolveUsername(req);
        // console.log(username);



        if (!username) {
            return res.status(400).json({
                message: "Missing required parameter: username",
            });
        }

        const query = `SELECT customer_id, username, email, phone_number, address, profile_picture, province_city, district, street, house_no, is_default_address, created_at FROM customers WHERE username = ?`;


        const [rows] = await pool.promise().query(query, [username]);

        return res.status(200).json({
            data: rows,
            message: "Successfully retrieved user information",
        });
    } catch (err) {
        console.error("Error fetching user information:", err);
        return res.status(500).json({
            error: err.message,
            message: "Something went wrong",
        });
    }
};

export const updateUserInformation = async (req, res) => {
    try {
        const currentUsername = resolveUsername(req);
        const { username, email, phone_number, address, province_city, district, street, house_no, is_default_address } = req.body || {};

        if (!currentUsername) {
            return res.status(400).json({ message: "Missing required parameter: username" });
        }

        const nextUsername = username?.trim() || currentUsername;
        const nextEmail = email?.trim() || "";
        const nextPhoneNumber = phone_number?.trim() || null;
        const nextAddress = address?.trim() || null;
        const nextProfilePicture = req.file?.filename || null;

        if (!nextUsername || !nextEmail) {
            return res.status(400).json({ message: "Full name and email are required" });
        }

        const [currentRows] = await pool.promise().query(
            `SELECT customer_id, profile_picture FROM customers WHERE username = ?`,
            [currentUsername]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const customer = currentRows[0];

        const [duplicateEmailRows] = await pool.promise().query(
            `SELECT customer_id FROM customers WHERE email = ? AND customer_id <> ?`,
            [nextEmail, customer.customer_id]
        );

        if (duplicateEmailRows.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const [duplicateUsernameRows] = await pool.promise().query(
            `SELECT customer_id FROM customers WHERE username = ? AND customer_id <> ?`,
            [nextUsername, customer.customer_id]
        );

        if (duplicateUsernameRows.length > 0) {
            return res.status(409).json({ message: "Full name already exists" });
        }

        const profilePictureValue = nextProfilePicture || req.body.existing_profile_picture || customer.profile_picture || null;
        const nextProvinceCity = province_city?.trim() || null;
        const nextDistrict = district?.trim() || null;
        const nextStreet = street?.trim() || null;
        const nextHouseNo = house_no?.trim() || null;
        const nextIsDefaultAddress = is_default_address === "1" || is_default_address === "true" || is_default_address === 1;

        await pool.promise().query(
            `UPDATE customers
             SET username = ?, email = ?, phone_number = ?, address = ?, profile_picture = ?, province_city = ?, district = ?, street = ?, house_no = ?, is_default_address = ?
             WHERE customer_id = ?`,
            [nextUsername, nextEmail, nextPhoneNumber, nextAddress, profilePictureValue, nextProvinceCity, nextDistrict, nextStreet, nextHouseNo, nextIsDefaultAddress ? 1 : 0, customer.customer_id]
        );

        const payload = { username: nextUsername, role: 2 };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie("access-token", accessToken, cookieConfig);
        res.cookie("refresh-token", refreshToken, cookieConfig);

        return res.status(200).json({
            message: "Profile updated successfully",
            token: accessToken,
            data: {
                username: nextUsername,
                email: nextEmail,
                phone_number: nextPhoneNumber,
                address: nextAddress,
                profile_picture: profilePictureValue,
                province_city: nextProvinceCity,
                district: nextDistrict,
                street: nextStreet,
                house_no: nextHouseNo,
                is_default_address: nextIsDefaultAddress,
            },
        });
    } catch (err) {
        console.error("Error updating user information:", err);
        return res.status(500).json({
            error: err.message,
            message: "Something went wrong",
        });
    }
};

export const uploadProfilePhoto = async (req, res) => {
    try {
        const currentUsername = resolveUsername(req);

        if (!currentUsername) {
            return res.status(400).json({ message: "Missing required parameter: username" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        await pool.promise().query(
            `UPDATE customers SET profile_picture = ? WHERE username = ?`,
            [req.file.filename, currentUsername]
        );

        return res.status(200).json({
            message: "Profile photo uploaded successfully",
            data: { profile_picture: req.file.filename },
        });
    } catch (err) {
        console.error("Error uploading profile photo:", err);
        return res.status(500).json({
            error: err.message,
            message: "Something went wrong",
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const currentUsername = resolveUsername(req);
        const { oldPassword, newPassword } = req.body || {};

        if (!currentUsername) {
            return res.status(400).json({ message: "Missing required parameter: username" });
        }

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old password and new password are required" });
        }

        const [rows] = await pool.promise().query(
            `SELECT customer_id, password FROM customers WHERE username = ?`,
            [currentUsername]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.promise().query(
            `UPDATE customers SET password = ? WHERE customer_id = ?`,
            [hashedPassword, user.customer_id]
        );

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        return res.status(500).json({
            error: err.message,
            message: "Something went wrong",
        });
    }
};
export const getOrderByName = async (req, res) => {
    const username = resolveUsername(req);
    const queryOrderItems = `SELECT 
    o.order_id,
    c.username,
    o.order_date,
    o.status,
    ot.order_item_id,
    ot.quantity,
    ot.amount AS amount_per_total_orderItem,
    pv.color,
    pv.idphone_variants,
    s.spec_id,
    s.price AS price_per_unit,
    pm.discount_percentage,
    GROUP_CONCAT(DISTINCT pdm.image ORDER BY pdm.image SEPARATOR ',') AS images,
    p.name AS phone_name,
    CASE
        WHEN pm.status = "Active" THEN ROUND(s.price * (100 - pm.discount_percentage) / 100, 2)
        ELSE s.price
    END AS discount_price_per_unit,
    o.total_amount AS total_before_discount,
    CASE
        WHEN pm.status = "Active" THEN ROUND(s.price * (100 - pm.discount_percentage) / 100, 2) * ot.quantity
        ELSE s.price * ot.quantity
    END AS total_after_discount
FROM 
    orders o  
INNER JOIN 
    order_items ot ON ot.order_id = o.order_id
LEFT JOIN 
    specifications s ON s.spec_id = ot.spec_id
INNER JOIN 
    phone_variants pv ON pv.idphone_variants = s.phone_variant_id
INNER JOIN 
    phones p ON p.phone_id = pv.phone_id
LEFT JOIN 
    productimage pdm ON pdm.phone_variant_id = pv.idphone_variants
LEFT JOIN 
    promotions pm ON pm.spec_id = s.spec_id
INNER JOIN 
	customers c ON c.customer_id=o.customer_id
WHERE 
	c.username=?
GROUP BY 
    o.order_id, 
    o.order_date,
    o.status,
    ot.order_item_id,
    ot.quantity,
    ot.amount,
    pv.color,
    pv.idphone_variants,
    s.spec_id,
    s.price,
    pm.discount_percentage,
    p.name,
    pm.status,
    o.total_amount
`
    try {

        const [response] = await pool.promise().query(queryOrderItems, [username]);
        console.log(response);
        return res.status(200).json({
            message: "successfully",
            data: response
        })
    } catch (error) {
        console.error(error);
    }

}