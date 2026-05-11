-- ============================================
-- DATABASE MIGRATION: Add 'canceled' Status
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Open MySQL command line or phpMyAdmin
-- 2. Select your database
-- 3. Run this command
-- 
-- ============================================

ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'completed', 'shipping', 'delivered', 'canceled') 
DEFAULT 'pending';

-- Verify the change worked:
DESCRIBE orders;

-- You should see status column with:
-- enum('pending','completed','shipping','delivered','canceled')
