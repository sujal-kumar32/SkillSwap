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
  const [sidebarCounts, setSidebarCounts] = useState({});

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

    Apiservices.getSidebarCounts().then((res) => {
      if (res.data?.success) setSidebarCounts(res.data.data || {});
    }).catch(() => {});

    const backendUrl = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin;
    const s = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    s.on("notification", (data) => {
      setLatestNotifications((prev) => [data, ...prev].slice(0, 3));
      setUnreadCount((c) => c + 1);
      if (data.type !== "system") {
        showToast.info(data.message, { autoClose: 4000 });
      }
    });

    s.on("unread_count", (count) => {
      setUnreadCount(count);
    });

    s.on("new_message", () => {
      refreshUnreadChatCount();
    });

    s.on("sidebar_update", () => {
      Apiservices.getSidebarCounts().then((res) => {
        if (res.data?.success) setSidebarCounts(res.data.data || {});
      }).catch(() => {});
    });

    s.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    s.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    });

    setSocket(s);

    const pollInterval = setInterval(() => {
      Apiservices.getSidebarCounts().then((res) => {
        if (res.data?.success) setSidebarCounts(res.data.data || {});
      }).catch(() => {});
    }, 60000);

    return () => {
      s.close();
      clearInterval(pollInterval);
    };
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

  const refreshSidebarCounts = useCallback(() => {
    Apiservices.getSidebarCounts().then((res) => {
      if (res.data?.success) setSidebarCounts(res.data.data || {});
    }).catch(() => {});
  }, []);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, unreadChatCount, latestNotifications, onlineUsers, sidebarCounts, setUnreadCount, refreshUnreadCount, refreshNotifications, refreshUnreadChatCount, refreshSidebarCounts }}>
      {children}
    </SocketContext.Provider>
  );
}
