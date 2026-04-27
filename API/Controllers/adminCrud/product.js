import { query } from "express";
import pool from "../../db/db_handle.js";
import { reject } from "bcrypt/promises.js";
import { deleteOrder } from "./Order.js";


export const addNewProduct = async (req, res) => {

    try {
        // console.log("Files received:", req.files); // Debugging files
        if (!req.files || req.files.length === 0) {
            throw new Error("No files uploaded. Please upload images.");
        }

        const {
            name,
            brand,
            price,
            date,
            colors,
            processor,
            storage,
            camera,
            category,
            description,
            stock,
            screenSize,
            ram,
            battery,
        } = req.body;

        // Process image filenames (multer saves files in 'uploads/')
        const images = req.files.map((file) => file.filename);

        // Handle database operations

        const category_query = `SELECT category_id FROM categories WHERE category_name=?`;
        const brand_query = "SELECT brand_id FROM brands WHERE brand_name=?";
        const addProductQuery =
            "INSERT INTO phones (name, description, category_id, brand_id, release_date) VALUES(?,?,?,?,?)";

        const addSpecificationsQuery =
            "INSERT INTO specifications (phone_variant_id, screen_size, processor, ram, storage, battery, camera,Price,stock) VALUES(?,?,?,?,?,?,?,?,?)";
        // const addColorsQuery =
        //   "INSERT INTO phone_colors (phone_id, color) VALUES (?,?)";
        const addColorQuery =
            "INSERT INTO phone_variants (phone_id,color) VALUES (?,?)"
        const addImageQuery =
            "INSERT INTO productimage(phone_variant_id, image) VALUES (?,?)";

        // Database operations (same as your previous code)
        const [categoryRows] = await pool.promise().query(category_query, [category]);
        if (!categoryRows.length) throw new Error("Category not found");
        const category_id = categoryRows[0].category_id;

        const [brandRows] = await pool.promise().query(brand_query, [brand]);
        if (!brandRows.length) throw new Error("Brand not found");
        const brand_id = brandRows[0].brand_id;

        const productValues = [
            name,
            description,
            category_id,
            brand_id,
            date
        ];

        const [productRows] = await pool.promise().query(addProductQuery, productValues);
        const phone_id = productRows.insertId;


        let variantID = [];
        console.log(colors);

        await pool.promise().query(addColorQuery, [phone_id, colors])
            .then(([rows]) => {
                variantID.push(rows.insertId)
            })
            .catch((err) => {
                console.log(err);
            })
        const specificationValues = [
            variantID,
            screenSize,
            processor,
            ram,
            storage,
            battery,
            camera,
            price,
            stock
        ];
        await pool.promise().query(addSpecificationsQuery, specificationValues);

        console.log(price);


        for (let image of images) {
            await pool.promise().query(addImageQuery, [variantID, image]);
        }


        res.status(201).json({ message: "Product added successfully" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
}

export const updateProduct = async (req, res) => {
    try {

        const { product_id } = req.query;

        if (!product_id) {
            throw new Error("Product ID is required to update the product.");
        }
        const {
            name,
            brand,
            date,
            processor,
            color,
            storage,
            camera,
            category,
            description,
            screenSize,
            ram,
            battery,
        } = req.body;

        // Process image filenames (multer saves files in 'uploads/')
        // Handle database operations
        const category_query = `SELECT category_id FROM categories WHERE category_name=?`;
        const brand_query = "SELECT brand_id FROM brands WHERE brand_name=?";
        const updateProductQuery =
            "UPDATE phones SET name=?, description=?, category_id=?, brand_id=?, release_date=? WHERE phone_id=?";
        const updateSpecificationsQuery =
            "UPDATE specifications SET screen_size=?, processor=?, ram=?, storage=?, battery=?, camera=? WHERE phone_id=?";

        const [categoryRows] = await pool.promise().query(category_query, [category]);


        if (!categoryRows.length) throw new Error("Category not found");
        const category_id = categoryRows[0].category_id;


        const [brandRows] = await pool.promise().query(brand_query, [brand]);
        if (!brandRows.length) throw new Error("Brand not found");
        const brand_id = brandRows[0].brand_id;

        const productValues = [
            name,
            description,
            category_id,
            brand_id,
            date,
            product_id,
        ];
        await pool.promise().query(updateProductQuery, productValues);

        const specificationValues = [
            screenSize,
            processor,
            ram,
            storage,
            battery,
            camera,
            product_id,
        ];
        await pool.promise().query(updateSpecificationsQuery, specificationValues);
        res.status(200).json({ message: "Product updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { deleteid } = req.query;

    if (!deleteid) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    const deleteImageQuery = `DELETE FROM productimage WHERE phone_variant_id=?`;
    const variantQuery = "SELECT idphone_variants FROM phone_variants WHERE phone_id=?";
    const specQuery = "SELECT spec_id FROM specifications WHERE phone_variant_id=?";
    const deleteSpecQuery = "DELETE FROM specifications WHERE spec_id=?";
    const deleteOrderItemsQuery = "DELETE FROM order_items WHERE spec_id=?";
    const deletePromotionsQuery = "DELETE FROM promotions WHERE spec_id=?";
    const deleteVariantsQuery = "DELETE FROM phone_variants WHERE phone_id=?";
    const deleteProductQuery = "DELETE FROM phones WHERE phone_id=?";

    try {
        // Fetch all variant IDs for the given product ID
        const [variantRows] = await pool.promise().query(variantQuery, [deleteid]);

        if (!variantRows.length) {
            return res.status(404).json({ message: "No variants found for the given product ID" });
        }

        // Collect all spec IDs associated with the variants
        let specIds = [];
        for (const variant of variantRows) {
            const [specRows] = await pool.promise().query(specQuery, [variant.idphone_variants]);
            specIds.push(...specRows.map(row => row.spec_id));
        }

        // Delete associated records for each spec ID
        for (const specId of specIds) {
            await pool.promise().query(deleteOrderItemsQuery, [specId]);
            await pool.promise().query(deletePromotionsQuery, [specId]);
            await pool.promise().query(deleteSpecQuery, [specId]);
        }

        // Delete product images and variants
        for (const variant of variantRows) {
            await pool.promise().query(deleteImageQuery, [variant.idphone_variants]);
        }

        await pool.promise().query(deleteVariantsQuery, [deleteid]);

        // Finally, delete the product itself
        await pool.promise().query(deleteProductQuery, [deleteid]);

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        return res.status(500).json({ message: "An error occurred while deleting the product" });
    }
};


export const deleteVariants = async (req, res) => {
    const { variants_id } = req.query;

    const selectSpecQuery = `SELECT spec_id FROM specifications WHERE phone_variant_id = ?`;
    const queries = [
        { query: `DELETE FROM productimage WHERE phone_variant_id = ?`, errorMsg: `Error deleting product images` },

        { query: `DELETE FROM specifications WHERE phone_variant_id = ?`, errorMsg: `Error deleting specifications` },
        { query: `DELETE FROM phone_variants WHERE idphone_variants = ?`, errorMsg: `Error deleting phone variants` },
    ];
    const queries2 = [
        { query: `DELETE FROM order_items WHERE spec_id = ?`, errorMsg: `Error deleting product order items` },
        { query: `DELETE FROM promotions WHERE spec_id = ?`, errorMsg: `Error deleting promotions` },
        { query: `DELETE FROM specifications WHERE spec_id = ?`, errorMsg: `Error deleting specifications` },
    ];

    try {
        // Check if specifications exist for the variant
        const [specRows] = await pool.promise().query(selectSpecQuery, [variants_id]);
        if (specRows.length === 0) {
            return res.status(404).json({
                message: `No specifications found for variant ID ${variants_id}`,
            });
        }

        // Delete related data for each spec_id
        for (const spec of specRows) {
            for (const { query, errorMsg } of queries2) {
                await pool
                    .promise()
                    .query(query, [spec.spec_id])
                    .catch((err) => {
                        console.error(errorMsg, err);
                        throw new Error(errorMsg);
                    });
            }
        }

        // Execute deletion queries for other related data
        for (const { query, errorMsg } of queries) {
            await pool
                .promise()
                .query(query, [variants_id])
                .catch((err) => {
                    console.error(errorMsg, err);
                    throw new Error(errorMsg);
                });
        }

        return res.status(200).json({
            message: "Variant and all associated data deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting variant:", error);
        return res.status(500).json({
            message: "An error occurred while deleting the variant",
            error: error.message,
        });
    }
};






export const addNewBrand = (req, res) => {
    const images = req.file;  // Use req.file for the uploaded image
    console.log(images);
    const { brand } = req.body;
    if (!images) {
        return res.status(400).json({ message: 'Image is required' });
    }

    // SQL query to insert brand name and image path into the database
    const query = `INSERT INTO brands(brand_name, img) VALUES(?, ?)`;

    pool.query(query, [brand, images.filename], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ message: "Something went wrong" });
        }
        return res.status(200).json({ message: "Insert successfully", data: result });
    });
};

export const addNewCategory = (req, res) => {
    const { category } = req.body;
    console.log(category);

    if (!category || category.trim() === "") {
        return res.status(400).json({ message: "Category is required" });
    }

    const query = `INSERT INTO categories (category_name) VALUES(?)`;

    pool.query(query, [category], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(400).json({ message: "Something went wrong", error: err });
        }

        return res.status(200).json({ message: "Insert Successfully", data: rows });
    });
};

export const deleteBrand = async (req, res) => {
    const { brand } = req.query;

    if (!brand || brand.trim() === "") {
        return res.status(400).json({ message: "Brand is required" });
    }

    const findBrandQuery = `SELECT brand_id FROM brands WHERE brand_name = ?`;
    const checkUsageQuery = `SELECT COUNT(*) AS count FROM phones WHERE brand_id = ?`;
    const deleteQuery = `DELETE FROM brands WHERE brand_name = ?`;

    try {
        const [brandRows] = await pool.promise().query(findBrandQuery, [brand]);
        if (brandRows.length === 0) {
            return res.status(404).json({ message: "Brand not found" });
        }

        const brandId = brandRows[0].brand_id;
        const [usageRows] = await pool.promise().query(checkUsageQuery, [brandId]);
        if (usageRows[0].count > 0) {
            return res.status(400).json({ message: "Cannot delete brand. It is used by products." });
        }

        const [result] = await pool.promise().query(deleteQuery, [brand]);
        return res.status(200).json({ message: "Brand deleted successfully", data: result });
    } catch (error) {
        console.error("Error deleting brand:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    const { category } = req.query;

    if (!category || category.trim() === "") {
        return res.status(400).json({ message: "Category is required" });
    }

    const findCategoryQuery = `SELECT category_id FROM categories WHERE category_name = ?`;
    const checkUsageQuery = `SELECT COUNT(*) AS count FROM phones WHERE category_id = ?`;
    const deleteQuery = `DELETE FROM categories WHERE category_name = ?`;

    try {
        const [categoryRows] = await pool.promise().query(findCategoryQuery, [category]);
        if (categoryRows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        const categoryId = categoryRows[0].category_id;
        const [usageRows] = await pool.promise().query(checkUsageQuery, [categoryId]);
        if (usageRows[0].count > 0) {
            return res.status(400).json({ message: "Cannot delete category. It is used by products." });
        }

        const [result] = await pool.promise().query(deleteQuery, [category]);
        return res.status(200).json({ message: "Category deleted successfully", data: result });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const CountHeaderData = (req, res) => {
    const query = `
      SELECT 'Product' AS label, COUNT(phone_id) AS quantity
      FROM phones
      UNION ALL
      SELECT 'Category' AS label, COUNT(category_id) AS quantity
      FROM categories
      UNION ALL
      SELECT 'Inventory' AS label, SUM(stock) AS quantity
      FROM phones;
    `;

    pool.query(query, (error, rows) => {
        if (error) {
            return res.status(400).json({ message: "Something went wrong" });
        }
        // Since you are selecting counts, the result will have a single row, so access rows[0]
        return res.status(200).json({
            data: rows, // Access the first row
            message: "Successfully retrieved counts"
        });
    });
};
export const updateProductVariants = async (req, res) => {
    const { color } = req.body;
    // console.log(req.user.user.username.name);
    // const { name } = req.user.user.username;
    // console.log(name);


    const File = req.files;
    const productImages = [];
    for (let file of File) {
        productImages.push(file.path)
    }

    const { productVariantID } = req.params;


    const queryUpdateVariants = `UPDATE phone_variants
                                    SET color=?
                                    WHERE idphone_variants=?`
    const queryDeleteImage = `DELETE FROM productimage
                            WHERE phone_variant_id=?`
    const queryInsertImage = `INSERT INTO productimage(phone_variant_id,image)
                            VALUES(?,?)`
    try {
        const [variantsRow] = await pool.promise().query(queryUpdateVariants, [color, productVariantID])
        const [DeleteRow] = await pool.promise().query(queryDeleteImage, [productVariantID])
        for (let image of productImages) {
            const [InsertRow] = await pool.promise().query(queryInsertImage, [productVariantID, image])
            if (!InsertRow.length === 0) {
                return res.status(400).json({
                    message: "something went wrong"
                })
            }
        }
        if (!variantsRow.length === 0, !DeleteRow.length === 0) {
            return res.status(400).json({
                message: "something went wrong"
            })
        }
        return res.status(200).json({
            message: "sucessfully"
        })
    } catch (error) {
        console.log(error);

        return res.status(400).json({
            message: "something went wrong",
            error: error
        })
    }
}

export const addVariants = async (req, res) => {
    const { productName, color, stock } = req.body;
    const productImages = req.files;

    // Input Validation
    if (!productName || !color || !productImages) {
        return res.status(400).json({
            message: "Fill ALL fields"
        });
    }

    try {
        // Extract image filenames
        const images = productImages.map((element) => element.filename);
        console.log("Uploaded Images:", images);

        // Database Queries
        const findPhoneIDQuery = `SELECT phone_id FROM phones WHERE name=?`;
        const insertVariantsQuery = `
            INSERT INTO phone_variants(phone_id, color, stock)
            VALUES(?, ?, ?)
        `;
        const insertImageQuery = `
            INSERT INTO productimage(phone_variant_id, image)
            VALUES(?, ?)
        `;

        // Retrieve phone ID
        const [phone] = await pool.promise().query(findPhoneIDQuery, [productName]);
        if (phone.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        const phone_id = phone[0].phone_id;

        // Insert variant
        const variantValues = [phone_id, color, stock || 0];
        const [variantResult] = await pool.promise().query(insertVariantsQuery, variantValues);
        const variantID = variantResult.insertId;

        // Insert images
        for (let image of images) {
            await pool.promise().query(insertImageQuery, [variantID, image]);
        }

        // Success Response
        return res.status(201).json({
            message: "Variant added successfully",
            variantID,
            images,
        });
    } catch (error) {
        console.error("Error adding variant:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};
export const getProductOptions = async (req, res) => {
    const query = `SELECT phone_id, name FROM phones ORDER BY name ASC`;

    try {
        const [rows] = await pool.promise().query(query);

        return res.status(200).json({
            message: "Products fetched successfully",
            data: rows,
        });
    } catch (error) {
        console.error("Error fetching product options:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
export const addNewSpecificate = async (req, res) => {
    const payload = req.body.formdata || req.body;
    const {
        product_id,
        product_name,
        color,
        screen_size,
        processor,
        ram,
        storage,
        battery,
        camera,
        price,
        stock,
    } = payload;
    // console.log(req.body.formdata);

    // Input Validation
    // if (!product_name || !color || !screen_size || !processor || !ram || !storage || !battery || !camera || !price || !stock) {
    //     return res.status(400).json({
    //         message: "Fill all fields"
    //     });
    // }
    console.log(req.body);

    try {
        let productID = product_id;

        // Backward-compatible fallback for old UI that sends product_name.
        if (!productID) {
            const findProductIDQuery = `SELECT phone_id FROM phones WHERE name=?`;
            const [productResult] = await pool.promise().query(findProductIDQuery, [product_name]);
            if (productResult.length === 0) {
                return res.status(404).json({ message: "Product not found" });
            }
            productID = productResult[0].phone_id;
        }

        // Find Variant ID
        const findVariantsIDQuery = `SELECT idphone_variants FROM phone_variants WHERE phone_id=? AND color=?`;
        const [variantResult] = await pool.promise().query(findVariantsIDQuery, [productID, color]);
        if (variantResult.length === 0) {
            return res.status(404).json({ message: "Variant not found" });
        }
        const variantID = variantResult[0].idphone_variants;

        // Insert Specifications
        const insertSpecificationsQuery = `
            INSERT INTO specifications (phone_variant_id, screen_size, processor, ram, storage, battery, camera,price,stock)
            VALUES (?, ?, ?, ?, ?, ?, ?,?,?)
        `;
        const values = [variantID, screen_size, processor, ram, storage, battery, camera, price, stock];
        const [insertResult] = await pool.promise().query(insertSpecificationsQuery, values);

        // Success Response
        return res.status(201).json({
            message: "Specifications added successfully",
            data: insertResult,
        });
    } catch (error) {
        console.error("Error adding specifications:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
export const UpdateSpecification = async (req, res) => {
    const { variantID, oldStorage } = req.query;
    const { processor, newStorage, ram, battery, camera, screen_size, stock, price } = req.body;

    // Validate inputs
    if (!variantID || !processor || !newStorage || !ram || !battery || !camera || !screen_size || !stock || !price) {
        return res.status(400).json({
            message: "Please fill all fields"
        });
    }
    // console.log(req.body);
    // console.log(req.query);

    const queryUpdate = `UPDATE specifications
                        SET storage=?, screen_size=?, processor=?, ram=?, battery=?, camera=?, stock=?, price=?
                        WHERE phone_variant_id=? AND storage=?`;

    const value = [
        newStorage,
        screen_size,
        processor,
        ram,
        battery,
        camera,
        stock,
        price,
        variantID,
        oldStorage
    ];

    try {
        const [updateRows] = await pool.promise().query(queryUpdate, value);

        if (updateRows.affectedRows === 0) {
            return res.status(400).json({
                message: "No rows were updated. Check if the variantID and oldStorage are correct."
            });
        }

        return res.status(200).json({
            data: updateRows,
            message: "Successfully updated"
        });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const deleteSpecification = async (req, res) => {
    const { variantID, storage } = req.query;
    const queryDelete = `DELETE FROM specifications WHERE phone_variant_id=? AND storage=?`
    try {
        const [deleteRows] = await pool.promise().query(queryDelete, [variantID, storage])
        if (deleteRows.length === 0) {
            return res.status(400).json({
                message: "something went wrong"
            })
        }
        return res.status(200).json({
            message: "successfully",
            data: deleteRows
        })
    } catch (error) {
        console.log(error);

    }
}




