import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { COMMONENDPOINT, NETWORK_CONFIG } from '../../network/Network_EndPoint';

const NotificationCard = () => {
  const [notifications, setNotifications] = useState([]);

  let getNotifications = async () => {
    await axios.get(`${NETWORK_CONFIG.apiBaseUrl}${COMMONENDPOINT.GET_NOTIFICATIONS}`).then(function (response) {
      if (response.status === 200) {
        setNotifications(response.data.data);
      }
    }).catch(function (error) {
      console.log(error);
    })
  };
  useEffect(() => {
    getNotifications()
  }, []);
  return (
    <div className="w-80 bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notifications ({notifications.length})</h2>
      </div>
      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center justify-between bg-gray-100 rounded-lg p-3"
          >
            <div className="flex items-center">
              <div
                className="w-10 h-10 rounded-full bg-red-500 mr-3 flex-shrink-0 flex-grow-0"
              ></div>
              <div>
                <p className="font-semibold text-sm">សារជូនដំណឹង {notification.id}</p>
                <p className="text-xs text-gray-500">
                  {notification.label}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400">{notification.last_upload}</div>
          </div>
        )) : <p>No notifications</p>}

      </div>
    </div>
  );
};

export default NotificationCard;
