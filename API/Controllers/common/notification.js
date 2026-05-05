import { fake_notification } from "../../db/fake_db.js";

const buildNotification = ({ title, label }) => {
    const nextId = fake_notification.length > 0 ? Math.max(...fake_notification.map((item) => item.id)) + 1 : 1;

    return {
        id: nextId,
        title: title?.trim() || "Message",
        label: label?.trim() || "",
        last_upload: new Date().toLocaleString(),
    };
};

// get Notification from fake db
export const getNotification = async (req, res) => {
    return res.status(200).json({
        message: "successfully",
        data: fake_notification
    });
};

export const createNotification = async (req, res) => {
    const { title, label, message } = req.body || {};
    const content = (message ?? label ?? "").trim();

    if (!content) {
        return res.status(400).json({ message: "Message content is required" });
    }

    const notification = buildNotification({ title, label: content });
    fake_notification.unshift(notification);

    return res.status(201).json({
        message: "Notification created successfully",
        data: notification,
    });
};

export const deleteNotification = async (req, res) => {
    const notificationId = Number(req.params.id);

    if (!Number.isInteger(notificationId)) {
        return res.status(400).json({ message: "Valid notification id is required" });
    }

    const index = fake_notification.findIndex((item) => item.id === notificationId);

    if (index === -1) {
        return res.status(404).json({ message: "Notification not found" });
    }

    const deletedItem = fake_notification.splice(index, 1)[0];

    return res.status(200).json({
        message: "Notification deleted successfully",
        data: deletedItem,
    });
};
