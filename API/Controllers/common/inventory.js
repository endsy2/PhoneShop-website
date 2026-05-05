import pool from "../../db/db_handle.js";

// Reserve inventory when order is placed
export const reserveInventory = async (req, res) => {
    const { items } = req.body; // items = [{spec_id, quantity}, ...]

    try {
        const updates = [];

        for (const item of items) {
            const { spec_id, quantity } = item;

            // Check available stock
            const stockQuery = `
                SELECT stock, reserved_stock FROM specifications WHERE spec_id = ?
            `;
            const [[stock]] = await pool.promise().query(stockQuery, [spec_id]);

            const availableStock = stock.stock - stock.reserved_stock;

            if (availableStock < quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for item ${spec_id}. Available: ${availableStock}, Requested: ${quantity}`
                });
            }

            // Reserve stock
            const reserveQuery = `
                UPDATE specifications 
                SET reserved_stock = reserved_stock + ?
                WHERE spec_id = ?
            `;
            await pool.promise().query(reserveQuery, [quantity, spec_id]);
            updates.push(spec_id);
        }

        return res.status(200).json({
            message: "Inventory reserved successfully",
            reserved_items: updates
        });
    } catch (error) {
        console.error("Error reserving inventory:", error);
        return res.status(500).json({ message: "Error reserving inventory", error: error.message });
    }
};

// Release reserved inventory
export const releaseInventory = async (req, res) => {
    const { items } = req.body; // items = [{spec_id, quantity}, ...]

    try {
        for (const item of items) {
            const { spec_id, quantity } = item;

            const releaseQuery = `
                UPDATE specifications 
                SET reserved_stock = GREATEST(0, reserved_stock - ?)
                WHERE spec_id = ?
            `;
            await pool.promise().query(releaseQuery, [quantity, spec_id]);
        }

        return res.status(200).json({ message: "Inventory released successfully" });
    } catch (error) {
        console.error("Error releasing inventory:", error);
        return res.status(500).json({ message: "Error releasing inventory", error: error.message });
    }
};

// Confirm inventory (convert reserved to actual sold)
export const confirmInventory = async (req, res) => {
    const { items } = req.body; // items = [{spec_id, quantity}, ...]

    try {
        for (const item of items) {
            const { spec_id, quantity } = item;

            const confirmQuery = `
                UPDATE specifications 
                SET stock = stock - ?, reserved_stock = GREATEST(0, reserved_stock - ?)
                WHERE spec_id = ? AND (stock - reserved_stock) >= ?
            `;
            const [result] = await pool.promise().query(confirmQuery, [quantity, quantity, spec_id, quantity]);

            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: `Failed to confirm inventory for spec_id ${spec_id}`
                });
            }
        }

        return res.status(200).json({ message: "Inventory confirmed successfully" });
    } catch (error) {
        console.error("Error confirming inventory:", error);
        return res.status(500).json({ message: "Error confirming inventory", error: error.message });
    }
};

// Get current inventory status
export const getInventoryStatus = async (req, res) => {
    const { spec_id } = req.params;

    try {
        const query = `
            SELECT 
                spec_id,
                stock,
                reserved_stock,
                (stock - reserved_stock) as available_stock,
                CASE 
                    WHEN (stock - reserved_stock) <= 0 THEN 'Out of Stock'
                    WHEN (stock - reserved_stock) <= 5 THEN 'Low Stock'
                    ELSE 'In Stock'
                END as status,
                CASE
                    WHEN (stock - reserved_stock) <= 0 THEN 0
                    WHEN (stock - reserved_stock) <= 5 THEN 1
                    ELSE 2
                END as urgency_level
            FROM specifications
            WHERE spec_id = ?
        `;
        const [[inventory]] = await pool.promise().query(query, [spec_id]);

        if (!inventory) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            message: "Inventory status retrieved",
            inventory
        });
    } catch (error) {
        console.error("Error getting inventory status:", error);
        return res.status(500).json({ message: "Error getting inventory status", error: error.message });
    }
};

// Get low stock alerts (admin)
export const getLowStockAlerts = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.spec_id,
                p.name,
                pv.color,
                s.storage,
                s.stock,
                s.reserved_stock,
                (s.stock - s.reserved_stock) as available_stock
            FROM specifications s
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            WHERE (s.stock - s.reserved_stock) <= 5
            ORDER BY available_stock ASC
        `;
        const [lowStockItems] = await pool.promise().query(query);

        return res.status(200).json({
            message: "Low stock alerts retrieved",
            count: lowStockItems.length,
            items: lowStockItems
        });
    } catch (error) {
        console.error("Error getting low stock alerts:", error);
        return res.status(500).json({ message: "Error getting low stock alerts", error: error.message });
    }
};

// Get inventory report by product
export const getInventoryReport = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.phone_id,
                p.name,
                SUM(s.stock) as total_stock,
                SUM(s.reserved_stock) as total_reserved,
                SUM(s.stock - s.reserved_stock) as total_available,
                COUNT(DISTINCT pv.idphone_variants) as variant_count
            FROM specifications s
            JOIN phone_variants pv ON s.phone_variant_id = pv.idphone_variants
            JOIN phones p ON pv.phone_id = p.phone_id
            GROUP BY p.phone_id, p.name
            ORDER BY total_stock DESC
        `;
        const [report] = await pool.promise().query(query);

        return res.status(200).json({
            message: "Inventory report retrieved",
            report
        });
    } catch (error) {
        console.error("Error getting inventory report:", error);
        return res.status(500).json({ message: "Error getting inventory report", error: error.message });
    }
};
