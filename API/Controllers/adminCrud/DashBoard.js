import pool from "../../db/db_handle.js";

// Header cards: revenue (canceled orders excluded), number of orders, number of ordering customers.
// months limits it to orders from the last N months; omit it for all time.
const dashboardTotals = async (months) => {
  const limited = Number.isFinite(months) && months > 0;
  const [[row]] = await pool.promise().query(
    `SELECT COALESCE(SUM(CASE WHEN status <> 'canceled' THEN total_amount END), 0) AS revenue,
            COUNT(*) AS orders,
            COUNT(DISTINCT customer_id) AS customers
     FROM orders
     ${limited ? "WHERE order_date >= CURDATE() - INTERVAL ? MONTH" : ""}`,
    limited ? [months] : []
  );
  return [
    { label: "Total Revenue", total: row.revenue },
    { label: "Total Order", total: Number(row.orders) },
    { label: "Total Customer", total: Number(row.customers) },
  ];
};

export const dashboardHeader = async (req, res) => {
  const data = await dashboardTotals(Number(req.query.date));
  res.status(200).json({ data, message: "successfully" });
};

export const dashboardHeaderAll = async (req, res) => {
  const data = await dashboardTotals();
  res.status(200).json({ data, message: "sucessfully" });
};

export const displayByDate = (req, res) => {
  const { date } = req.query;

  const query = `
    SELECT phone_id, name, description, release_date, category_id,
           category_name, brand_name, idphone_variants, spec_id,
           price, color, stock, images, avg_rating, review_count
    FROM (
        SELECT
            p.phone_id, p.name, p.description, p.release_date, p.category_id,
            c.category_name, b.brand_name,
            pv.idphone_variants, s.spec_id, s.price,
            pv.color, pv.stock,
            GROUP_CONCAT(DISTINCT pm.image ORDER BY pm.image SEPARATOR ',') AS images,
            ROUND(AVG(pr.rating), 1) AS avg_rating,
            COUNT(DISTINCT pr.review_id) AS review_count,
            ROW_NUMBER() OVER (PARTITION BY p.phone_id ORDER BY s.price ASC) AS rn
        FROM phones p
        INNER JOIN categories c ON c.category_id = p.category_id
        INNER JOIN brands b ON b.brand_id = p.brand_id
        INNER JOIN phone_variants pv ON pv.phone_id = p.phone_id
        INNER JOIN specifications s ON s.phone_variant_id = pv.idphone_variants
        LEFT JOIN productimage pm ON pm.phone_variant_id = pv.idphone_variants
        LEFT JOIN product_reviews pr ON pr.spec_id = s.spec_id
        WHERE p.release_date >= CURRENT_DATE() - INTERVAL ? MONTH
        GROUP BY
            p.phone_id, p.name, p.description, p.release_date, p.category_id,
            c.category_name, b.brand_name,
            pv.idphone_variants, pv.color, pv.stock,
            s.spec_id, s.price
    ) AS ranked
    WHERE rn = 1
    ORDER BY release_date DESC;
  `;

  pool.query(query, [date], (err, rows) => {
    if (err) return res.status(400).json({ message: "something went wrong" });
    res.status(200).json({
      data: rows,
      message: "sucessfully",
    });
  });
};
