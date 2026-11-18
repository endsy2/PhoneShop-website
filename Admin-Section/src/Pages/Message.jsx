import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { createNotification, deleteNotification, getNotifications } from "../Fetch/FetchAPI";
import Notice from "../Component/Notice";
import PageHeader from "../Component/PageHeader";

const Message = () => {
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [notifications, setNotifications] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response?.data || []);
    } catch (error) {
      setStatusMessage({ ok: false, text: error?.response?.data?.message || "Couldn\u2019t load messages" });
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
    setStatusMessage(null);

    try {
      await createNotification({
        title: formData.title,
        message: formData.message,
      });

      setFormData({ title: "", message: "" });
      setStatusMessage({ ok: true, text: "Sent. Customers see it under the bell icon" });
      await loadNotifications();
    } catch (error) {
      setStatusMessage({ ok: false, text: error?.response?.data?.message || error?.message || "Couldn\u2019t send the message" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this message? Customers will no longer see it.");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteNotification(id);
      setStatusMessage({ ok: true, text: "Message deleted" });
      await loadNotifications();
    } catch (error) {
      setStatusMessage({ ok: false, text: error?.response?.data?.message || error?.message || "Couldn\u2019t delete the message" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Announcements customers see in the storefront notification bell" />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
          <h2 className="text-base font-medium">New message</h2>
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Weekend discount" className="input" />
          </div>
          <div>
            <label htmlFor="message" className="label">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              placeholder="A sale, new stock, opening hours"
              className="input h-auto resize-y py-2"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-dark">{loading ? "Sending" : "Send to customers"}</button>
          {statusMessage && <Notice tone={statusMessage.ok ? "ok" : "error"}>{statusMessage.text}</Notice>}
        </form>

        <section className="card">
          <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
            <h2 className="text-sm font-medium">Sent</h2>
            <span className="price text-[13px] text-ink-3">{notifications.length}</span>
          </div>
          {notifications.length > 0 ? (
            <ul className="divide-y divide-line">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{notification.title || "Message"}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-2">{notification.label}</p>
                    <p className="mt-1 text-xs text-ink-3">{notification.last_upload}</p>
                  </div>
                  <button type="button" onClick={() => handleDelete(notification.id)} className="icon-btn h-8 w-8 shrink-0 hover:bg-danger-soft hover:text-danger" aria-label="Delete message">
                    <FiTrash2 size={14} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-ink-3">No messages sent yet</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Message;
