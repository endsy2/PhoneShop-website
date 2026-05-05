import pool from "../../db/db_handle.js";

// Advanced product search with multiple filters
export const advancedSearch = async (req, res) => {
    const {
        searchTerm = "",
        category = null,
        brand = null,
        minPrice = null,
        maxPrice = null,
        minRating = null,
        processor = null,
        minRam = null,
        minStorage = null,
        minCamera = null,
        minBattery = null,
        releaseYear = null,
        inStock = false,
        onSale = false,
        sortBy = "featured",
        page = 1,
        limit = 20
    } = req.query;

    try {
        let whereConditions = [];
        let params = [];

        // Text search
        if (searchTerm) {
            whereConditions.push(`(p.name LIKE ? OR p.description LIKE ?)`);
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Category filter
        if (category) {
            whereConditions.push(`c.category_id = ?`);
            params.push(category);
        }

        // Brand filter
        if (brand) {
            whereConditions.push(`b.brand_id = ?`);
            params.push(brand);
        }

        // Price range
        if (minPrice !== null) {
            whereConditions.push(`s.price >= ?`);
            params.push(minPrice);
        }
        if (maxPrice !== null) {
            whereConditions.push(`s.price <= ?`);
            params.push(maxPrice);
        }

        // Processor filter
        if (processor) {
            whereConditions.push(`s.processor LIKE ?`);
            params.push(`%${processor}%`);
        }

        // RAM filter
        if (minRam !== null) {
            whereConditions.push(`CAST(s.ram AS UNSIGNED) >= ?`);
            params.push(minRam);
        }

        // Storage filter
        if (minStorage !== null) {
            whereConditions.push(`CAST(s.storage AS UNSIGNED) >= ?`);
            params.push(minStorage);
        }

        // Camera filter
        if (minCamera !== null) {
            whereConditions.push(`CAST(s.camera AS UNSIGNED) >= ?`);
            params.push(minCamera);
        }

        // Battery filter
        if (minBattery !== null) {
            whereConditions.push(`CAST(s.battery AS UNSIGNED) >= ?`);
            params.push(minBattery);
        }

        // Release year filter
        if (releaseYear) {
            whereConditions.push(`YEAR(p.release_date) = ?`);
            params.push(releaseYear);
        }

        // In stock filter
        if (inStock === "true" || inStock === true) {
            whereConditions.push(`(s.stock - COALESCE(s.reserved_stock, 0)) > 0`);
        }

        // On sale filter
        if (onSale === "true" || onSale === true) {
            whereConditions.push(`s.price_discount IS NOT NULL AND s.price_discount > 0`);
        }

        // Minimum rating filter
        let ratingJoin = "";
        if (minRating !== null) {
            ratingJoin = `
                LEFT JOIN (
                    SELECT spec_id, AVG(rating) as avg_rating, COUNT(*) as review_count
                    FROM product_reviews
                    GROUP BY spec_id
                ) pr ON s.spec_id = pr.spec_id
            `;
            whereConditions.push(`COALESCE(pr.avg_rating, 0) >= ?`);
            params.push(minRating);
        }

        // Build sort clause
        let orderClause = "p.phone_id DESC"; // default: featured (newest)
        if (sortBy === "price-asc") {
            orderClause = "s.price ASC";
        } else if (sortBy === "price-desc") {
            orderClause = "s.price DESC";
        } else if (sortBy === "rating") {
            orderClause = "COALESCE(pr.avg_rating, 0) DESC";
        } else if (sortBy === "newest") {
            orderClause = "p.release_date DESC";
        } else if (sortBy === "name-asc") {
            orderClause = "p.name ASC";
        } else if (sortBy === "name-desc") {
            orderClause = "p.name DESC";
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build full query
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

        const countQuery = `
            SELECT COUNT(DISTINCT s.spec_id) as total
            FROM specifications s
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            JOIN categories c ON p.category_id = c.category_id
            JOIN brands b ON p.brand_id = b.brand_id
            ${ratingJoin}
            ${whereClause}
        `;

        const searchQuery = `
            SELECT DISTINCT
                s.spec_id,
                p.phone_id,
                p.name,
                pv.color,
                s.storage,
                s.price,
                s.price_discount,
                ROUND(((s.price - s.price_discount) / s.price * 100), 0) as discount_percentage,
                s.processor,
                s.ram,
                s.camera,
                s.battery,
                GROUP_CONCAT(DISTINCT pi.image SEPARATOR ',') as images,
                b.brand_name,
                c.category_name,
                COALESCE(pr.avg_rating, 0) as avg_rating,
                COALESCE(pr.review_count, 0) as review_count,
                (s.stock - COALESCE(s.reserved_stock, 0)) as available_stock
            FROM specifications s
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            JOIN categories c ON p.category_id = c.category_id
            JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN productimage pi ON pv.idphone_variants = pi.phone_variant_id
            ${ratingJoin}
            ${whereClause}
            GROUP BY s.spec_id, p.phone_id, p.name, pv.color, s.storage, s.price
            ORDER BY ${orderClause}
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);

        const [[countResult]] = await pool.promise().query(countQuery, params.slice(0, -2));
        const [products] = await pool.promise().query(searchQuery, params);

        const totalPages = Math.ceil(countResult.total / limit);

        return res.status(200).json({
            message: "Products found",
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalProducts: countResult.total,
                totalPages
            },
            filters: {
                searchTerm,
                category,
                brand,
                priceRange: { min: minPrice, max: maxPrice },
                inStock,
                onSale,
                sortBy
            },
            products
        });
    } catch (error) {
        console.error("Error in advanced search:", error);
        return res.status(500).json({ message: "Error performing search", error: error.message });
    }
};

// Get available filter options
export const getFilterOptions = async (req, res) => {
    try {
        // Get price range
        const priceQuery = `
            SELECT 
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM specifications
        `;
        const [[priceRange]] = await pool.promise().query(priceQuery);

        // Get processors
        const processorQuery = `
            SELECT DISTINCT processor
            FROM specifications
            WHERE processor IS NOT NULL AND processor != ''
            ORDER BY processor ASC
            LIMIT 20
        `;
        const [processors] = await pool.promise().query(processorQuery);

        // Get unique values for filters
        const ramQuery = `
            SELECT DISTINCT ram
            FROM specifications
            WHERE ram IS NOT NULL AND ram != ''
            ORDER BY CAST(ram AS UNSIGNED) ASC
        `;
        const [ramOptions] = await pool.promise().query(ramQuery);

        const storageQuery = `
            SELECT DISTINCT storage
            FROM specifications
            WHERE storage IS NOT NULL AND storage != ''
            ORDER BY CAST(storage AS UNSIGNED) ASC
        `;
        const [storageOptions] = await pool.promise().query(storageQuery);

        const cameraQuery = `
            SELECT DISTINCT camera
            FROM specifications
            WHERE camera IS NOT NULL AND camera != ''
            ORDER BY CAST(camera AS UNSIGNED) ASC
        `;
        const [cameraOptions] = await pool.promise().query(cameraQuery);

        const batteryQuery = `
            SELECT DISTINCT battery
            FROM specifications
            WHERE battery IS NOT NULL AND battery != ''
            ORDER BY CAST(battery AS UNSIGNED) ASC
        `;
        const [batteryOptions] = await pool.promise().query(batteryQuery);

        const yearsQuery = `
            SELECT DISTINCT YEAR(release_date) as release_year
            FROM phones
            ORDER BY release_year DESC
        `;
        const [years] = await pool.promise().query(yearsQuery);

        return res.status(200).json({
            message: "Filter options retrieved",
            filters: {
                priceRange,
                processors: processors.map(p => p.processor),
                ram: ramOptions.map(r => r.ram),
                storage: storageOptions.map(s => s.storage),
                camera: cameraOptions.map(c => c.camera),
                battery: batteryOptions.map(b => b.battery),
                releaseYears: years.map(y => y.release_year)
            }
        });
    } catch (error) {
        console.error("Error getting filter options:", error);
        return res.status(500).json({ message: "Error getting filter options", error: error.message });
    }
};
