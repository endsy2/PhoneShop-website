import axios from "axios";
import { useEffect, useState } from "react";
import { COMMONENDPOINT, NETWORK_CONFIG } from "../../network/Network_EndPoint";

const NotificationCard = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios
      .get(`${NETWORK_CONFIG.apiBaseUrl}${COMMONENDPOINT.GET_NOTIFICATIONS}`)
      .then((response) => setNotifications(response.data.data || []))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="card mt-2 w-80 overflow-hidden shadow-float">
      <div className="flex h-11 items-center justify-between border-b border-line px-4">
        <h2 className="text-sm font-medium">Notifications</h2>
        <span className="price text-xs text-ink-3">{notifications.length}</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-ink">{notification.title || "Message"}</p>
                <span className="shrink-0 text-xs text-ink-3">{notification.last_upload}</span>
              </div>
              <p className="mt-1 text-[13px] leading-5 text-ink-2">{notification.label}</p>
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-center text-sm text-ink-3">No notifications yet</p>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
