import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../App";
import Apiservices from "../../Apiservices";
import { showToast } from "../utils/toastUtils";

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) socket.close();
      setSocket(null);
      setUnreadCount(0);
      setLatestNotifications([]);
      return;
    }

    Apiservices.getNotifications({ page: 1, limit: 3 }).then((res) => {
      setLatestNotifications(res.data.data || []);
    }).catch(() => {});

    Apiservices.getUnreadCount().then((res) => {
      setUnreadCount(res.data.data?.count || 0);
    }).catch(() => {});

    const s = io(window.location.origin, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    s.on("notification", (data) => {
      setLatestNotifications((prev) => [data, ...prev].slice(0, 3));
      setUnreadCount((c) => c + 1);
      showToast.info(data.message, { autoClose: 4000 });
    });

    s.on("unread_count", (count) => {
      setUnreadCount(count);
    });

    setSocket(s);

    return () => { s.close(); };
  }, [user]);

  const refreshUnreadCount = () => {
    Apiservices.getUnreadCount().then((res) => {
      setUnreadCount(res.data.data?.count || 0);
    }).catch(() => {});
  };

  const refreshNotifications = () => {
    Apiservices.getNotifications({ page: 1, limit: 3 }).then((res) => {
      setLatestNotifications(res.data.data || []);
    }).catch(() => {});
  };

  return (
    <SocketContext.Provider value={{ socket, unreadCount, latestNotifications, setUnreadCount, refreshUnreadCount, refreshNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}
