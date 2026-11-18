-- ============================================================================
-- One-time import: old schema (LEGACY_DB) -> new Prisma schema (current database)
-- ============================================================================
-- Both databases must live on the same MySQL 8 server.
--
--   1. Create the new DB and apply the schema:   npx prisma migrate deploy
--   2. Replace LEGACY_DB with the old database name, e.g.
--        sed 's/LEGACY_DB/phone_shop/g' prisma/legacy/import_from_legacy.sql > /tmp/import.sql
--   3. Run PART A. Every query must return 0 rows; fix the old data first if not.
--   4. Run PART B against the NEW database:  mysql -u root -p new_db < /tmp/import.sql
--
-- IDs are kept (product, color, variant = old spec_id, order, review...), so carts in
-- localStorage, uploaded image names and links keep working. Admins are merged into
-- `users` with id = old admin_id + (max customer id).
--
-- Assumptions about the old schema (not in the repo, inferred from the code):
--   admin PK is `admin_id`; customers.created_at exists; specifications.reserved_stock exists;
--   admin.role exists (run migrations/add_admin_role.sql on the old DB first).
-- ============================================================================


-- ─── PART A: pre-flight checks (each must return 0 rows) ────────────────────

-- A1 duplicate product names (new column is UNIQUE, case-insensitive)
SELECT LOWER(TRIM(name)) AS name, COUNT(*) FROM LEGACY_DB.phones GROUP BY 1 HAVING COUNT(*) > 1;
-- A2 duplicate colors within a product
SELECT phone_id, LOWER(TRIM(color)) AS color, COUNT(*) FROM LEGACY_DB.phone_variants GROUP BY 1, 2 HAVING COUNT(*) > 1;
-- A3 duplicate RAM/storage combos within a color
SELECT phone_variant_id, ram, storage, COUNT(*) FROM LEGACY_DB.specifications GROUP BY 1, 2, 3 HAVING COUNT(*) > 1;
-- A4 RAM / storage values that are not "<number>GB|TB"
SELECT spec_id, ram, storage FROM LEGACY_DB.specifications
WHERE REGEXP_SUBSTR(ram, '[0-9]+') IS NULL OR REGEXP_SUBSTR(storage, '[0-9]+') IS NULL;
-- A5 admin and customer sharing an email or username (they now share one table)
SELECT a.email FROM LEGACY_DB.admin a JOIN LEGACY_DB.customers c ON c.email = a.email OR c.username = a.adminname;
-- A6 orders whose customer no longer exists
SELECT o.order_id FROM LEGACY_DB.orders o LEFT JOIN LEGACY_DB.customers c ON c.customer_id = o.customer_id WHERE c.customer_id IS NULL;
-- A7 duplicate brand / category names
SELECT brand_name, COUNT(*) FROM LEGACY_DB.brands GROUP BY 1 HAVING COUNT(*) > 1;
SELECT category_name, COUNT(*) FROM LEGACY_DB.categories GROUP BY 1 HAVING COUNT(*) > 1;
-- A8 orphan rows (would break the new foreign keys)
SELECT 'phone', phone_id FROM LEGACY_DB.phones WHERE brand_id NOT IN (SELECT brand_id FROM LEGACY_DB.brands) OR category_id NOT IN (SELECT category_id FROM LEGACY_DB.categories)
UNION ALL SELECT 'variant', idphone_variants FROM LEGACY_DB.phone_variants WHERE phone_id NOT IN (SELECT phone_id FROM LEGACY_DB.phones)
UNION ALL SELECT 'spec', spec_id FROM LEGACY_DB.specifications WHERE phone_variant_id NOT IN (SELECT idphone_variants FROM LEGACY_DB.phone_variants);


-- ─── PART B: import ─────────────────────────────────────────────────────────

START TRANSACTION;

-- Users ----------------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, role, phone_number, avatar_url, created_at, updated_at)
SELECT customer_id, username, email, password, 'customer', phone_number, profile_picture,
       COALESCE(created_at, NOW(3)), NOW(3)
FROM LEGACY_DB.customers;

SET @admin_offset = (SELECT COALESCE(MAX(id), 0) FROM users);

INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
SELECT admin_id + @admin_offset, adminname, email, password, role, NOW(3), NOW(3)
FROM LEGACY_DB.admin;

-- The single address that lived on `customers` becomes the default address.
INSERT INTO addresses (user_id, province_city, district, street, house_no, detail, is_default, created_at, updated_at)
SELECT customer_id, province_city, district, street, house_no, address, TRUE, NOW(3), NOW(3)
FROM LEGACY_DB.customers
WHERE COALESCE(address, province_city, district, street, house_no) IS NOT NULL;

-- Catalog --------------------------------------------------------------------
INSERT INTO brands (id, name, logo_url, created_at)
SELECT brand_id, TRIM(brand_name), img, NOW(3) FROM LEGACY_DB.brands;

INSERT INTO categories (id, name, created_at)
SELECT category_id, TRIM(category_name), NOW(3) FROM LEGACY_DB.categories;

-- Model-level specs (screen, chip, battery, camera) were repeated on every spec row;
-- take them from each product's first spec row.
INSERT INTO products (id, name, description, brand_id, category_id, release_date,
                      screen_size_in, processor, battery_mah, camera, is_active, created_at, updated_at)
SELECT p.phone_id, TRIM(p.name), p.description, p.brand_id, p.category_id, p.release_date,
       -- "+ 0" first: MySQL truncates the fraction when casting REGEXP_SUBSTR straight to DECIMAL
       ROUND(REGEXP_SUBSTR(fs.screen_size, '[0-9]+(\\.[0-9]+)?') + 0, 1),
       fs.processor,
       CAST(REGEXP_SUBSTR(fs.battery, '[0-9]+') AS UNSIGNED),
       fs.camera, TRUE, NOW(3), NOW(3)
FROM LEGACY_DB.phones p
LEFT JOIN (
    SELECT pv.phone_id, s.screen_size, s.processor, s.battery, s.camera,
           ROW_NUMBER() OVER (PARTITION BY pv.phone_id ORDER BY s.spec_id) AS rn
    FROM LEGACY_DB.specifications s
    JOIN LEGACY_DB.phone_variants pv ON pv.idphone_variants = s.phone_variant_id
) fs ON fs.phone_id = p.phone_id AND fs.rn = 1;

INSERT INTO product_colors (id, product_id, name)
SELECT idphone_variants, phone_id, TRIM(color) FROM LEGACY_DB.phone_variants;

INSERT INTO product_images (color_id, url, sort_order)
SELECT phone_variant_id, image,
       ROW_NUMBER() OVER (PARTITION BY phone_variant_id ORDER BY image) - 1
FROM LEGACY_DB.productimage
WHERE phone_variant_id IN (SELECT id FROM product_colors);

-- Stock now lives only on the variant (phone_variants.stock was a duplicate and is dropped).
INSERT INTO product_variants (id, color_id, ram_gb, storage_gb, price, stock, reserved_stock,
                              is_active, created_at, updated_at)
SELECT spec_id, phone_variant_id,
       CAST(REGEXP_SUBSTR(ram, '[0-9]+') AS UNSIGNED),
       CAST(REGEXP_SUBSTR(storage, '[0-9]+') AS UNSIGNED) * IF(UPPER(storage) LIKE '%TB%', 1024, 1),
       price, GREATEST(COALESCE(stock, 0), 0), LEAST(COALESCE(reserved_stock, 0), GREATEST(COALESCE(stock, 0), 0)),
       TRUE, NOW(3), NOW(3)
FROM LEGACY_DB.specifications;

-- Old `status` column was a stale snapshot; liveness is now derived from the dates.
INSERT INTO promotions (id, variant_id, name, discount_percent, starts_at, ends_at, is_active, created_at, updated_at)
SELECT promo_id, spec_id, promo_name, discount_percentage,
       TIMESTAMP(DATE(start_date)), TIMESTAMP(DATE(end_date), '23:59:59'),
       TRUE, NOW(3), NOW(3)
FROM LEGACY_DB.promotions
WHERE spec_id IN (SELECT id FROM product_variants);

-- Orders ---------------------------------------------------------------------
-- Totals are filled in after the items are copied.
INSERT INTO orders (id, user_id, status, payment_method, payment_status, delivery_method,
                    recipient_name, shipping_address, subtotal, discount_total, total,
                    paid_at, created_at, updated_at)
SELECT o.order_id, o.customer_id,
       IF(LOWER(o.status) IN ('pending', 'completed', 'shipping', 'delivered', 'canceled'), LOWER(o.status), 'pending'),
       IF(o.payment = 'Bakong QR', 'bakong_qr', 'cash_on_delivery'),
       IF(o.payment_verified = 1, 'paid', 'unpaid'),
       COALESCE(NULLIF(TRIM(o.delivery), ''), 'Delivery'),
       COALESCE(NULLIF(TRIM(o.recipient_name), ''), c.username),
       COALESCE(o.location, ''),
       0, 0, 0,
       IF(o.payment_verified = 1, o.order_date, NULL),
       o.order_date, NOW(3)
FROM LEGACY_DB.orders o
JOIN LEGACY_DB.customers c ON c.customer_id = o.customer_id;

-- Historical unit price = trigger-computed amount / quantity when available, else today's price.
INSERT INTO order_items (id, order_id, variant_id, product_name, color_name, ram_gb, storage_gb,
                         unit_price, discount_percent, quantity, line_total)
SELECT oi.order_item_id, oi.order_id, pvn.id,
       COALESCE(p.name, '(deleted product)'),
       COALESCE(pv.color, ''),
       COALESCE(pvn.ram_gb, 0), COALESCE(pvn.storage_gb, 0),
       COALESCE(oi.amount / NULLIF(oi.quantity, 0), s.price, 0),
       0,
       oi.quantity,
       COALESCE(oi.amount, s.price * oi.quantity, 0)
FROM LEGACY_DB.order_items oi
JOIN orders o2 ON o2.id = oi.order_id
LEFT JOIN LEGACY_DB.specifications s ON s.spec_id = oi.spec_id
LEFT JOIN LEGACY_DB.phone_variants pv ON pv.idphone_variants = s.phone_variant_id
LEFT JOIN LEGACY_DB.phones p ON p.phone_id = pv.phone_id
LEFT JOIN product_variants pvn ON pvn.id = oi.spec_id
WHERE oi.quantity > 0;

UPDATE orders o
JOIN (SELECT order_id, SUM(line_total) AS sum_total FROM order_items GROUP BY order_id) t ON t.order_id = o.id
SET o.subtotal = t.sum_total, o.total = t.sum_total;

-- Reviews (per product now; if a user reviewed several variants of one product keep the latest)
INSERT INTO reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase, created_at, updated_at)
SELECT review_id, product_id, customer_id, rating, title, comment, is_verified_purchase, created_at, COALESCE(updated_at, created_at)
FROM (
    SELECT pr.*, pv.phone_id AS product_id,
           ROW_NUMBER() OVER (PARTITION BY pv.phone_id, pr.customer_id ORDER BY pr.created_at DESC, pr.review_id DESC) AS rn
    FROM LEGACY_DB.product_reviews pr
    JOIN LEGACY_DB.specifications s ON s.spec_id = pr.spec_id
    JOIN LEGACY_DB.phone_variants pv ON pv.idphone_variants = s.phone_variant_id
) r
WHERE r.rn = 1;

INSERT INTO review_votes (review_id, user_id, type, created_at)
SELECT rv.review_id, rv.customer_id, rv.vote_type, rv.created_at
FROM LEGACY_DB.review_votes rv
JOIN reviews r ON r.id = rv.review_id;

-- Recommendations ------------------------------------------------------------
INSERT INTO product_views (id, user_id, variant_id, viewed_at)
SELECT bh.history_id, bh.customer_id, bh.spec_id, bh.viewed_at
FROM LEGACY_DB.browsing_history bh
JOIN product_variants v ON v.id = bh.spec_id
JOIN users u ON u.id = bh.customer_id;

-- Chat -----------------------------------------------------------------------
INSERT INTO chat_conversations (id, customer_id, admin_id, room_code, status, started_at, closed_at)
SELECT cc.conversation_id, cc.customer_id,
       IF(cc.admin_id IS NULL, NULL, cc.admin_id + @admin_offset),
       cc.room_code, cc.status, cc.started_at, cc.closed_at
FROM LEGACY_DB.chat_conversations cc
JOIN users u ON u.id = cc.customer_id;

INSERT INTO chat_messages (id, conversation_id, sender_id, body, attachment_url, read_at, created_at)
SELECT cm.message_id, cm.conversation_id,
       IF(cm.sender_type = 'admin', cm.sender_id + @admin_offset, cm.sender_id),
       cm.message, cm.attachment_url,
       IF(cm.is_read, cm.created_at, NULL),
       cm.created_at
FROM LEGACY_DB.chat_messages cm
JOIN chat_conversations c ON c.id = cm.conversation_id;

COMMIT;

-- Quick sanity check: row counts old vs new
SELECT 'products', (SELECT COUNT(*) FROM LEGACY_DB.phones), (SELECT COUNT(*) FROM products)
UNION ALL SELECT 'variants', (SELECT COUNT(*) FROM LEGACY_DB.specifications), (SELECT COUNT(*) FROM product_variants)
UNION ALL SELECT 'orders', (SELECT COUNT(*) FROM LEGACY_DB.orders), (SELECT COUNT(*) FROM orders)
UNION ALL SELECT 'order_items', (SELECT COUNT(*) FROM LEGACY_DB.order_items), (SELECT COUNT(*) FROM order_items)
UNION ALL SELECT 'users', (SELECT COUNT(*) FROM LEGACY_DB.customers) + (SELECT COUNT(*) FROM LEGACY_DB.admin), (SELECT COUNT(*) FROM users);
