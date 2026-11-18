import pool from "../../db/db_handle.js";
import crypto from "crypto";
import { resolveCustomerId, resolveStaffId } from "../../Utils/currentUser.js";

// Generate unique room code
const generateRoomCode = () => crypto.randomBytes(8).toString("hex");

// Who is talking: a customer (may only touch their own conversations) or staff (chat:manage, any conversation).
const resolveSender = async (req) => {
    const customerId = await resolveCustomerId(req);
    if (customerId) return { id: customerId, type: "customer" };
    const staffId = resolveStaffId(req);
    if (staffId) return { id: staffId, type: "admin" };
    return null;
};

// Returns the conversation if the sender may access it, otherwise sends 403/404 and returns null.
const findConversationFor = async (sender, conversationId, res) => {
    const [[conversation]] = await pool.promise().query(
        `SELECT conversation_id, customer_id, status FROM chat_conversations WHERE conversation_id = ?`,
        [conversationId]
    );
    if (!conversation) {
        res.status(404).json({ message: "Conversation not found" });
        return null;
    }
    if (sender.type === "customer" && conversation.customer_id !== sender.id) {
        res.status(403).json({ message: "This conversation belongs to another customer" });
        return null;
    }
    return conversation;
};

// Start a new chat conversation (customers)
export const startChat = async (req, res) => {
    const customer_id = await resolveCustomerId(req);
    if (!customer_id) {
        return res.status(403).json({ message: "Only customers can start a chat" });
    }

    const [openChat] = await pool.promise().query(
        `SELECT conversation_id, room_code FROM chat_conversations
         WHERE customer_id = ? AND status IN ('open', 'waiting')
         LIMIT 1`,
        [customer_id]
    );

    if (openChat.length > 0) {
        return res.status(200).json({
            message: "Existing chat found",
            conversation_id: openChat[0].conversation_id,
            room_code: openChat[0].room_code
        });
    }

    const room_code = generateRoomCode();
    const [result] = await pool.promise().query(
        `INSERT INTO chat_conversations (customer_id, room_code, status) VALUES (?, ?, 'waiting')`,
        [customer_id, room_code]
    );

    return res.status(201).json({
        message: "Chat started successfully",
        conversation_id: result.insertId,
        room_code
    });
};

// Send a message (customer in their own conversation, or staff in any)
export const sendMessage = async (req, res) => {
    const { conversation_id, message } = req.body;
    if (!conversation_id || !message) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sender = await resolveSender(req);
    if (!sender) {
        return res.status(401).json({ message: "Please log in again" });
    }
    const conversation = await findConversationFor(sender, conversation_id, res);
    if (!conversation) return;
    if (conversation.status === "closed") {
        return res.status(400).json({ message: "This conversation is closed" });
    }

    const [result] = await pool.promise().query(
        `INSERT INTO chat_messages (conversation_id, sender_id, sender_type, message, is_read)
         VALUES (?, ?, ?, ?, FALSE)`,
        [conversation_id, sender.id, sender.type, message]
    );

    // First message opens a waiting conversation
    await pool.promise().query(
        `UPDATE chat_conversations SET status = 'open' WHERE conversation_id = ? AND status = 'waiting'`,
        [conversation_id]
    );

    return res.status(201).json({
        message: "Message sent successfully",
        message_id: result.insertId
    });
};

// Get chat messages; marks the other side's messages as read
export const getChatMessages = async (req, res) => {
    const { conversation_id } = req.params;

    const sender = await resolveSender(req);
    if (!sender) {
        return res.status(401).json({ message: "Please log in again" });
    }
    if (!(await findConversationFor(sender, conversation_id, res))) return;

    const [messages] = await pool.promise().query(
        `SELECT message_id, sender_id, sender_type, message, attachment_url, is_read, created_at
         FROM chat_messages
         WHERE conversation_id = ?
         ORDER BY created_at ASC`,
        [conversation_id]
    );

    await pool.promise().query(
        `UPDATE chat_messages SET is_read = TRUE
         WHERE conversation_id = ? AND is_read = FALSE AND sender_type <> ?`,
        [conversation_id, sender.type]
    );

    return res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    });
};

// Get all chat conversations (staff view)
export const getAdminChats = async (req, res) => {
    const [chats] = await pool.promise().query(
        `SELECT
            cc.conversation_id,
            cc.customer_id,
            cc.admin_id,
            cc.room_code,
            cc.status,
            cc.started_at,
            c.username,
            c.email,
            (SELECT COUNT(*) FROM chat_messages
             WHERE conversation_id = cc.conversation_id AND is_read = FALSE AND sender_type = 'customer') AS unread_count
         FROM chat_conversations cc
         JOIN customers c ON cc.customer_id = c.customer_id
         ORDER BY
            CASE WHEN cc.status = 'waiting' THEN 1 ELSE 2 END,
            cc.started_at DESC`
    );

    return res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    });
};

// Close chat conversation (staff)
export const closeChat = async (req, res) => {
    const { conversation_id } = req.params;

    const [result] = await pool.promise().query(
        `UPDATE chat_conversations SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE conversation_id = ?`,
        [conversation_id]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Conversation not found" });
    }

    return res.status(200).json({ message: "Chat closed successfully" });
};

// Assign the calling staff member to a chat
export const assignAdmin = async (req, res) => {
    const { conversation_id } = req.params;
    const admin_id = resolveStaffId(req);
    if (!admin_id) {
        return res.status(401).json({ message: "Please log in again" });
    }

    const [result] = await pool.promise().query(
        `UPDATE chat_conversations SET admin_id = ?, status = 'open' WHERE conversation_id = ?`,
        [admin_id, conversation_id]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Conversation not found" });
    }

    return res.status(200).json({ message: "Admin assigned successfully" });
};

// Get the calling customer's chat history
export const getChatHistory = async (req, res) => {
    const customer_id = await resolveCustomerId(req);
    if (!customer_id) {
        return res.status(403).json({ message: "Only customers have a chat history" });
    }

    const [chats] = await pool.promise().query(
        `SELECT conversation_id, room_code, status, started_at, closed_at
         FROM chat_conversations
         WHERE customer_id = ?
         ORDER BY started_at DESC`,
        [customer_id]
    );

    return res.status(200).json({
        message: "Chat history retrieved successfully",
        chats
    });
};
