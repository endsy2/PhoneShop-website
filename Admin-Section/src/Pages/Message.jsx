import { useEffect, useState } from "react";
import { createNotification, deleteNotification, getNotifications } from "../Fetch/FetchAPI";

const Message = () => {
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [notifications, setNotifications] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response?.data || []);
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || "Failed to load notifications.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage("");

    try {
      await createNotification({
        title: formData.title,
        message: formData.message,
      });

      setFormData({ title: "", message: "" });
      setStatusMessage("Message sent to user notifications.");
      await loadNotifications();
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || error?.message || "Failed to create message.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this message from user notifications?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteNotification(id);
      setStatusMessage("Message deleted successfully.");
      await loadNotifications();
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || error?.message || "Failed to delete message.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Message</h1>
        <p className="mt-2 text-sm text-gray-500">
          Write a message here and it will appear in the user notification bell.
        </p>

        <form className="mt-6 grid gap-4 max-w-2xl" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="h-12 rounded-lg border border-gray-300 px-4 outline-none focus:border-green-600"
              placeholder="Example: Weekend Discount"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              placeholder="Write anything about discount, new stock, opening hours, or other alerts..."
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
            {statusMessage ? (
              <span className="text-sm text-gray-600">{statusMessage}</span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent notifications</h2>
          <span className="text-sm text-gray-500">{notifications.length} items</span>
        </div>

        <div className="mt-6 space-y-3">
          {notifications.length > 0 ? notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    {notification.title || "Message"}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{notification.label}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">{notification.last_upload}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(notification.id)}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          )) : (
            <p className="text-sm text-gray-500">No messages yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Message;