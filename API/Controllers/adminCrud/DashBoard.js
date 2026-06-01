import pool from "../../db/db_handle.js";

export const dashboardHeader = (req, res) => {
  const { date } = req.query;

  const value = [date, date, date];
  const query = `SELECT 'Total Revenue' AS label,  
                    COALESCE(SUM(total_amount), 0) AS total
                    FROM orders
                    WHERE order_date >= CURDATE() - INTERVAL ? MONTH

                    UNION ALL

                    SELECT 'Total Order' AS label, COUNT(o.order_id) AS total
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.order_id
                    WHERE o.order_date >= CURDATE() - INTERVAL ? MONTH
                    

                    UNION ALL

                    SELECT 'Total Customer' AS label, 
                        COUNT(DISTINCT c.customer_id) AS total
                    FROM customers c
                    WHERE EXISTS (
                    SELECT 1
                    FROM orders o
                    WHERE o.customer_id = c.customer_id
                    AND o.order_date >= CURDATE() - INTERVAL ? MONTH
                    );

                    `;
  pool.query(query, value, (err, rows) => {
    if (err) {
      return res.status(400).json({ message: "something went wrong" });
    }
    res.status(200).json({
      data: rows,
      message: "successfully",
    });
  });
};
export const dashboardHeaderAll = (req, res) => {
  const query = `SELECT 'Total Revenue' AS label,  COALESCE(SUM(total_amount),0) AS total
                  FROM orders
  
                  UNION ALL
  
                  SELECT 'Total Order' AS label, COUNT(o.order_id) AS total
                  FROM order_items oi
                  JOIN orders o ON oi.order_id = o.order_id
  
                  UNION ALL
  
                  SELECT 'Total Customer' AS label, COUNT(DISTINCT c.customer_id) AS total
                  FROM customers c
                  WHERE EXISTS (
                    SELECT 1
                    FROM orders o
                    WHERE o.customer_id = c.customer_id
                    
                  );
                  `;
  pool.query(query, (err, rows) => {
    if (err) {
      return res.status(400).json({ message: "something went wrong" });
    }
    return res.status(200).json({
      data: rows,
      message: "sucessfully",
    });
  });
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
