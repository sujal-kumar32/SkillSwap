import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user) {
      if (socket) socket.close();
      setSocket(null);
      setUnreadCount(0);
      setUnreadChatCount(0);
      setLatestNotifications([]);
      setOnlineUsers(new Set());
      return;
    }

    Apiservices.getNotifications({ page: 1, limit: 3 }).then((res) => {
      setLatestNotifications(res.data.data || []);
    }).catch(() => {});

    Apiservices.getUnreadCount().then((res) => {
      setUnreadCount(res.data.data?.count || 0);
    }).catch(() => {});

    Apiservices.getUnreadChatCount().then((res) => {
      setUnreadChatCount(res.data.data?.count || 0);
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

    s.on("new_message", () => {
      refreshUnreadChatCount();
    });

    s.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    s.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
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

  const refreshUnreadChatCount = useCallback(() => {
    Apiservices.getUnreadChatCount().then((res) => {
      setUnreadChatCount(res.data.data?.count || 0);
    }).catch(() => {});
  }, []);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, unreadChatCount, latestNotifications, onlineUsers, setUnreadCount, refreshUnreadCount, refreshNotifications, refreshUnreadChatCount }}>
      {children}
    </SocketContext.Provider>
  );
}
