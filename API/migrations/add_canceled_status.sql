-- Migration: Add 'canceled' status to orders table
-- This allows orders to be marked as canceled without deleting data

-- Update the status ENUM to include 'canceled'
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'completed', 'shipping', 'delivered', 'canceled') 
DEFAULT 'pending';

-- Verify the change
DESCRIBE orders;
