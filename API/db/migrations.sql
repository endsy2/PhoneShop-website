-- Migration: Add new tables for enhanced features
-- Date: 2026-05-04

-- 1. PRODUCT REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS product_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    spec_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    helpful_count INT DEFAULT 0,
    unhelpful_count INT DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spec_id) REFERENCES specifications(spec_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (spec_id, customer_id)
);

-- 2. REVIEW HELPFUL VOTES TABLE
CREATE TABLE IF NOT EXISTS review_votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    customer_id INT NOT NULL,
    vote_type ENUM('helpful', 'unhelpful') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES product_reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (review_id, customer_id)
);

-- 3. BROWSING HISTORY TABLE (for recommendations)
CREATE TABLE IF NOT EXISTS browsing_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    spec_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (spec_id) REFERENCES specifications(spec_id) ON DELETE CASCADE,
    INDEX idx_customer_viewed (customer_id, viewed_at),
    INDEX idx_spec_viewed (spec_id, viewed_at)
);

-- 4. CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS chat_conversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    admin_id INT,
    room_code VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('open', 'closed', 'waiting') DEFAULT 'waiting',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_customer_status (customer_id, status),
    INDEX idx_admin (admin_id)
);

-- 5. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('customer', 'admin') NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(conversation_id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_created (created_at)
);

-- 6. UPDATE order_items table to support inventory reservation
ALTER TABLE order_items ADD COLUMN reserved_quantity INT DEFAULT 0 AFTER quantity;
ALTER TABLE specifications ADD COLUMN reserved_stock INT DEFAULT 0 AFTER stock;

-- 7. CREATE INDEX for better filtering performance
CREATE INDEX idx_spec_price ON specifications(price);
CREATE INDEX idx_spec_processor ON specifications(processor);
CREATE INDEX idx_spec_ram ON specifications(ram);
CREATE INDEX idx_spec_storage ON specifications(storage);
CREATE INDEX idx_spec_camera ON specifications(camera);
CREATE INDEX idx_spec_battery ON specifications(battery);
CREATE INDEX idx_phone_release ON phones(release_date);
