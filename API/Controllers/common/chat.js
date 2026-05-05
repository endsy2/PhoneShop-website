import pool from "../../db/db_handle.js";
import crypto from "crypto";

// Generate unique room code
const generateRoomCode = () => crypto.randomBytes(8).toString("hex");

// Start a new chat conversation
export const startChat = async (req, res) => {
    const customer_id = req.user?.user?.customer_id || req.user?.customer_id;

    try {
        // Check if customer has open chat
        const checkOpen = `
            SELECT conversation_id, room_code FROM chat_conversations 
            WHERE customer_id = ? AND status IN ('open', 'waiting')
            LIMIT 1
        `;
        const [openChat] = await pool.promise().query(checkOpen, [customer_id]);

        if (openChat.length > 0) {
            return res.status(200).json({
                message: "Existing chat found",
                conversation_id: openChat[0].conversation_id,
                room_code: openChat[0].room_code
            });
        }

        // Create new chat
        const room_code = generateRoomCode();
        const insertChat = `
            INSERT INTO chat_conversations (customer_id, room_code, status)
            VALUES (?, ?, 'waiting')
        `;
        const [result] = await pool.promise().query(insertChat, [customer_id, room_code]);

        return res.status(201).json({
            message: "Chat started successfully",
            conversation_id: result.insertId,
            room_code
        });
    } catch (error) {
        console.error("Error starting chat:", error);
        return res.status(500).json({ message: "Error starting chat", error: error.message });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    const { conversation_id, message } = req.body;
    const sender_id = req.user?.user?.customer_id || req.user?.customer_id;
    const sender_type = req.body.sender_type || "customer";

    if (!conversation_id || !message || !sender_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const insertMessage = `
            INSERT INTO chat_messages (conversation_id, sender_id, sender_type, message, is_read)
            VALUES (?, ?, ?, ?, FALSE)
        `;
        const [result] = await pool.promise().query(insertMessage, [conversation_id, sender_id, sender_type, message]);

        // Update chat status to open if first message
        const updateStatus = `
            UPDATE chat_conversations 
            SET status = 'open'
            WHERE conversation_id = ? AND status = 'waiting'
        `;
        await pool.promise().query(updateStatus, [conversation_id]);

        return res.status(201).json({
            message: "Message sent successfully",
            message_id: result.insertId
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ message: "Error sending message", error: error.message });
    }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
    const { conversation_id } = req.params;

    try {
        const query = `
            SELECT 
                message_id,
                sender_id,
                sender_type,
                message,
                attachment_url,
                is_read,
                created_at
            FROM chat_messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        `;
        const [messages] = await pool.promise().query(query, [conversation_id]);

        // Mark as read
        const updateRead = `
            UPDATE chat_messages 
            SET is_read = TRUE 
            WHERE conversation_id = ? AND is_read = FALSE
        `;
        await pool.promise().query(updateRead, [conversation_id]);

        return res.status(200).json({
            message: "Messages retrieved successfully",
            messages
        });
    } catch (error) {
        console.error("Error retrieving messages:", error);
        return res.status(500).json({ message: "Error retrieving messages", error: error.message });
    }
};

// Get all chat conversations (admin view)
export const getAdminChats = async (req, res) => {
    try {
        const query = `
            SELECT 
                cc.conversation_id,
                cc.customer_id,
                cc.room_code,
                cc.status,
                cc.started_at,
                c.username,
                c.email,
                (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = cc.conversation_id AND is_read = FALSE AND sender_type = 'customer') as unread_count
            FROM chat_conversations cc
            JOIN customers c ON cc.customer_id = c.customer_id
            ORDER BY 
                CASE WHEN cc.status = 'waiting' THEN 1 ELSE 2 END,
                cc.started_at DESC
        `;
        const [chats] = await pool.promise().query(query);

        return res.status(200).json({
            message: "Chats retrieved successfully",
            chats
        });
    } catch (error) {
        console.error("Error retrieving chats:", error);
        return res.status(500).json({ message: "Error retrieving chats", error: error.message });
    }
};

// Close chat conversation
export const closeChat = async (req, res) => {
    const { conversation_id } = req.params;

    try {
        const closeQuery = `
            UPDATE chat_conversations 
            SET status = 'closed', closed_at = CURRENT_TIMESTAMP
            WHERE conversation_id = ?
        `;
        await pool.promise().query(closeQuery, [conversation_id]);

        return res.status(200).json({ message: "Chat closed successfully" });
    } catch (error) {
        console.error("Error closing chat:", error);
        return res.status(500).json({ message: "Error closing chat", error: error.message });
    }
};

// Assign admin to chat
export const assignAdmin = async (req, res) => {
    const { conversation_id } = req.params;
    const admin_id = req.user?.user?.user_id || req.user?.user_id;

    try {
        const assignQuery = `
            UPDATE chat_conversations 
            SET admin_id = ?, status = 'open'
            WHERE conversation_id = ?
        `;
        await pool.promise().query(assignQuery, [admin_id, conversation_id]);

        return res.status(200).json({ message: "Admin assigned successfully" });
    } catch (error) {
        console.error("Error assigning admin:", error);
        return res.status(500).json({ message: "Error assigning admin", error: error.message });
    }
};

// Get customer chat history
export const getChatHistory = async (req, res) => {
    const customer_id = req.user?.user?.customer_id || req.user?.customer_id;

    try {
        const query = `
            SELECT 
                conversation_id,
                room_code,
                status,
                started_at,
                closed_at
            FROM chat_conversations
            WHERE customer_id = ?
            ORDER BY started_at DESC
        `;
        const [chats] = await pool.promise().query(query, [customer_id]);

        return res.status(200).json({
            message: "Chat history retrieved successfully",
            chats
        });
    } catch (error) {
        console.error("Error retrieving chat history:", error);
        return res.status(500).json({ message: "Error retrieving chat history", error: error.message });
    }
};
