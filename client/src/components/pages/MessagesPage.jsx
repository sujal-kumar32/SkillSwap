import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import TopBar from "../layout/user/TopBar";
import Apiservices from "../../../Apiservices";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../App";
import { showToast } from "../../utils/toastUtils";
import { timeAgo, formatDayHeader } from "../../utils/timeUtils";
import { confirmAlert } from "../../utils/alertUtils";
import { LoadingState } from "../learner/LearnerUI";

const bounceKeyframes = `
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
.msg-row:hover .delete-msg-btn { opacity: 1 !important; }
`;

const MessagesPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { socket, refreshUnreadChatCount, onlineUsers } = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showMobileList, setShowMobileList] = useState(!chatId);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMsgResults, setSearchMsgResults] = useState(null);
  const searchTimerRef = useRef(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeQuery, setComposeQuery] = useState("");
  const [composeResults, setComposeResults] = useState([]);
  const composeTimerRef = useRef(null);
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const removeAttachment = (idx) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const res = await Apiservices.getConversations();
      setConversations(res.data.data || []);
    } catch {} finally {
      setConvLoading(false);
    }
  }, []);

  const loadChat = useCallback(async (id) => {
    setChatLoading(true);
    try {
      const res = await Apiservices.getChat(id);
      setActiveChat(res.data.data);
      Apiservices.markChatRead(id).catch(() => {});
      refreshUnreadChatCount();
    } catch {} finally {
      setChatLoading(false);
    }
  }, [refreshUnreadChatCount]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
      setShowMobileList(false);
    }
  }, [chatId, loadChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages?.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChat?._id]);

  useEffect(() => {
    if (!socket || !activeChat?._id) return;
    socket.emit("join_chat", { chatId: activeChat._id });
    return () => socket.emit("leave_chat", { chatId: activeChat._id });
  }, [socket, activeChat?._id]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), data.message],
        }));
        Apiservices.markChatRead(data.chatId).catch(() => {});
      }
      loadConversations();
    };

    const onMessagesRead = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        setActiveChat((prev) => {
          if (!prev) return prev;
          const updated = prev.messages.map((msg) => {
            if (msg.senderId?._id === user?._id && !msg.isSeen) {
              return { ...msg, isSeen: true };
            }
            return msg;
          });
          return { ...prev, messages: updated };
        });
      }
    };

    const onTyping = (data) => {
      if (activeChat && data.chatId === activeChat._id && data.userId !== user?._id) {
        setTypingUser(data.userId);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2500);
      }
    };

    const onStopTyping = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        setTypingUser(null);
      }
    };

    const onReaction = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        setActiveChat((prev) => {
          if (!prev) return prev;
          const updated = prev.messages.map((msg) => {
            if (msg._id === data.messageId) {
              return { ...msg, reactions: data.reactions };
            }
            return msg;
          });
          return { ...prev, messages: updated };
        });
      }
    };

    const onMessageDeleted = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        setActiveChat((prev) => {
          if (!prev) return prev;
          const updated = prev.messages.map((m) =>
            m._id === data.messageId ? { ...m, isDeleted: true, message: "", attachments: [], reactions: [] } : m
          );
          return { ...prev, messages: updated };
        });
      }
    };

    socket.on("new_message", onNewMessage);
    socket.on("messages_read", onMessagesRead);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("message_reaction", onReaction);
    socket.on("message_deleted", onMessageDeleted);

    return () => {
      clearTimeout(typingTimeoutRef.current);
      socket.off("new_message", onNewMessage);
      socket.off("messages_read", onMessagesRead);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("message_reaction", onReaction);
      socket.off("message_deleted", onMessageDeleted);
    };
  }, [socket, activeChat, loadConversations, user]);

  const lastTypingEmit = useRef(0);

  const emitTyping = useCallback((isTyping) => {
    if (!socket || !activeChat) return;
    if (isTyping) {
      const now = Date.now();
      if (now - lastTypingEmit.current > 2000) {
        lastTypingEmit.current = now;
        socket.emit("typing", { chatId: activeChat._id });
      }
    } else {
      socket.emit("stop_typing", { chatId: activeChat._id });
    }
  }, [socket, activeChat]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(true);
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || sending || !activeChat) return;
    setSending(true);
    emitTyping(false);
    const text = input.trim();
    const attach = [...attachments];
    setInput("");
    setAttachments([]);
    try {
      const res = await Apiservices.sendMessage({
        message: text,
        ...(attach.length > 0 && { attachments: attach }),
        ...(activeChat.requestId ? { requestId: activeChat.requestId } : { recipientId: otherUser(activeChat)?._id }),
      });
      setActiveChat(res.data.data);
      loadConversations();
    } catch {
      showToast.error("Failed to send message");
      setInput(text);
      setAttachments(attach);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const otherUser = (chat) => {
    if (!chat?.participants) return null;
    return chat.participants.find((p) => p._id !== user?._id) || chat.participants[0];
  };

  const typingName = () => {
    if (!typingUser || !activeChat) return "";
    const u = activeChat.participants.find((p) => p._id === typingUser);
    return u?.name || "Someone";
  };

  const isOnline = (userId) => onlineUsers.has(userId);

  const handleSearch = (val) => {
    setSearchQuery(val);
    clearTimeout(searchTimerRef.current);
    if (!val.trim()) { setSearchMsgResults(null); return; }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await Apiservices.searchMessages(val);
        setSearchMsgResults(res.data.data || []);
      } catch { setSearchMsgResults([]); }
    }, 300);
  };

  const handleComposeSearch = (val) => {
    setComposeQuery(val);
    clearTimeout(composeTimerRef.current);
    if (!val.trim()) { setComposeResults([]); return; }
    composeTimerRef.current = setTimeout(async () => {
      try {
        const res = await Apiservices.searchUsers(val);
        setComposeResults(res.data.data || []);
      } catch { setComposeResults([]); }
    }, 300);
  };

  const startChat = async (userId) => {
    try {
      const res = await Apiservices.getOrCreateDM(userId);
      setShowCompose(false);
      setComposeQuery("");
      setComposeResults([]);
      navigate(`/messages/${res.data.data._id}`);
      loadConversations();
    } catch {
      showToast.error("Could not start conversation");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await Apiservices.uploadChatFile(fd);
      const attachment = res.data.data;
      setAttachments((prev) => [...prev, attachment]);
    } catch {
      showToast.error("Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDoubleClick = async (msgId) => {
    if (!activeChat) return;
    try {
      const res = await Apiservices.toggleReaction(activeChat._id, msgId, "❤️");
      const { messageId, reactions } = res.data.data;
      setActiveChat((prev) => {
        if (!prev) return prev;
        const updated = prev.messages.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        );
        return { ...prev, messages: updated };
      });
    } catch {}
  };

  const handleDeleteMessage = async (msgId) => {
    const ok = await confirmAlert("Delete this message for everyone?");
    if (!ok || !activeChat) return;
    try {
      await Apiservices.deleteMessage(activeChat._id, msgId);
      setActiveChat((prev) => {
        if (!prev) return prev;
        const updated = prev.messages.map((m) =>
          m._id === msgId ? { ...m, isDeleted: true, message: "", attachments: [], reactions: [] } : m
        );
        return { ...prev, messages: updated };
      });
    } catch {
      showToast.error("Failed to delete message");
    }
  };

  const filteredConvs = searchQuery.trim()
    ? conversations.filter((c) => c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  return (
    <>
      <style>{bounceKeyframes}</style>
      <TopBar />
      <div className="bg-image" style={{ height: "calc(100vh - 64px)", display: "flex", overflow: "hidden" }}>
        <div className={`d-flex flex-column ${showMobileList || !chatId ? "d-flex" : "d-none d-md-flex"}`}
          style={{ width: 360, minWidth: 320, borderRight: "1px solid #eef2f7", background: "#fff" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef2f7" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold mb-0"><i className="fa fa-comments text-primary me-2" />Messages</h5>
              <button onClick={() => setShowCompose(true)} className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.75rem" }}>
                <i className="fa fa-pen me-1" />New
              </button>
            </div>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white" style={{ borderRight: "none", borderColor: "#e2e8f0" }}><i className="fa fa-search" style={{ fontSize: "0.7rem", color: "#94a3b8" }} /></span>
              <input className="form-control" placeholder="Search conversations & messages..." value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ fontSize: "0.78rem", borderLeft: "none", borderColor: "#e2e8f0", background: "#fff" }} />
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {convLoading ? (
              <LoadingState />
            ) : conversations.length === 0 ? (
              <div className="text-center py-5 px-3">
                <div style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 12px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
                  <i className="fa fa-comment" style={{ color: "#94a3b8", fontSize: "1.2rem" }} />
                </div>
                <p className="text-muted small mb-0">No conversations yet.<br />Message someone from their profile.</p>
              </div>
            ) : searchQuery.trim() ? (
              <>
                {filteredConvs.length > 0 && (
                  <>
                    <div style={{ padding: "10px 20px 4px", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Conversations</div>
                    {filteredConvs.map((c) => {
                      const ou = c.otherUser;
                      return (
                        <div key={c._id} onClick={() => { navigate(`/messages/${c._id}`); setSearchQuery(""); setShowMobileList(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer",
                            borderBottom: "1px solid #f8fafc", transition: "background 0.15s",
                            background: c._id === chatId ? "#f0f4ff" : "transparent",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = c._id === chatId ? "#f0f4ff" : "#f8fafc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = c._id === chatId ? "#f0f4ff" : "transparent"}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <img src={ou?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(ou?.name || "?")}&background=0d6efd&color=fff&size=40`}
                              alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                            {isOnline(ou?._id) && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff", position: "absolute", bottom: 0, right: 0 }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{ou?.name || "Unknown"}</div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                {searchMsgResults && searchMsgResults.length > 0 && (
                  <>
                    <div style={{ padding: "10px 20px 4px", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Messages</div>
                    {searchMsgResults.map((r) => (
                      <div key={r.messageId} onClick={() => { navigate(`/messages/${r.chatId}`); setSearchQuery(""); setShowMobileList(false); }}
                        style={{ padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid #f8fafc" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{r.otherUser?.name || "Unknown"}</div>
                        <div style={{ fontSize: "0.82rem", color: "#1e293b", marginTop: 1 }}>{r.content?.slice(0, 120)}</div>
                        <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2 }}>{timeAgo(r.createdAt)}</div>
                      </div>
                    ))}
                  </>
                )}
                {filteredConvs.length === 0 && (!searchMsgResults || searchMsgResults.length === 0) && (
                  <div className="text-center py-5 px-3">
                    <p className="text-muted small mb-0">No results for "{searchQuery}"</p>
                  </div>
                )}
              </>
            ) : (
              conversations.map((c) => {
                const ou = c.otherUser;
                return (
                  <div key={c._id} onClick={() => { navigate(`/messages/${c._id}`); setShowMobileList(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer",
                      borderBottom: "1px solid #f8fafc", transition: "background 0.15s",
                      background: c._id === chatId ? "#f0f4ff" : "transparent",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = c._id === chatId ? "#f0f4ff" : "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = c._id === chatId ? "#f0f4ff" : "transparent"}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img src={ou?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(ou?.name || "?")}&background=0d6efd&color=fff&size=40`}
                        alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                      {isOnline(ou?._id) && <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff", position: "absolute", bottom: 0, right: 0 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{ou?.name || "Unknown"}</span>
                        {c.lastMessage?.createdAt && <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{timeAgo(c.lastMessage.createdAt)}</span>}
                      </div>
                      <div className="d-flex justify-content-between align-items-center" style={{ marginTop: 2 }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                          {c.lastMessage?.content
                            ? `${c.lastMessage.senderId?._id === user?._id ? "You: " : ""}${c.lastMessage.content}`
                            : "No messages yet"}
                        </span>
                        {c.unread > 0 && (
                          <span style={{ background: "#0d6efd", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: 999, lineHeight: 1, flexShrink: 0 }}>
                            {c.unread > 99 ? "99+" : c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f7" }}>
              <button onClick={async () => {
                try {
                  const res = await Apiservices.getBlockedUsers();
                  setBlockedUsers(res.data.data || []);
                  setShowBlocked(true);
                } catch { showToast.error("Failed to load blocked users"); }
              }} style={{ background: "none", border: "none", fontSize: "0.72rem", color: "#94a3b8", cursor: "pointer", padding: 0 }}>
                <i className="fa fa-ban me-1" />Blocked users
              </button>
            </div>
          </div>
        </div>

        {showBlocked && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh" }}>
            <div onClick={() => { setShowBlocked(false); setBlockedUsers([]); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
            <div style={{ position: "relative", width: 400, maxWidth: "90vw", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6 className="fw-bold mb-0">Blocked Users</h6>
                <button onClick={() => { setShowBlocked(false); setBlockedUsers([]); }} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#94a3b8", cursor: "pointer", padding: 0 }}><i className="fa fa-times" /></button>
              </div>
              <div style={{ maxHeight: 320, overflow: "auto" }}>
                {blockedUsers.length === 0 ? (
                  <div className="text-center py-4"><small className="text-muted">No blocked users</small></div>
                ) : (
                  blockedUsers.map((u) => (
                    <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px" }}>
                      <img src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "?")}&background=0d6efd&color=fff&size=36`}
                        alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      <span className="fw-semibold" style={{ flex: 1, fontSize: "0.85rem" }}>{u.name}</span>
                      <button onClick={async () => {
                        try {
                          await Apiservices.unblockUser(u._id);
                          setBlockedUsers((prev) => prev.filter((b) => b._id !== u._id));
                          showToast.success("User unblocked");
                        } catch { showToast.error("Failed to unblock"); }
                      }} className="btn btn-sm btn-outline-primary rounded-pill fw-semibold" style={{ fontSize: "0.7rem" }}>Unblock</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {showCompose && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh" }}>
            <div onClick={() => { setShowCompose(false); setComposeQuery(""); setComposeResults([]); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
            <div style={{ position: "relative", width: 400, maxWidth: "90vw", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef2f7" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">New Message</h6>
                  <button onClick={() => { setShowCompose(false); setComposeQuery(""); setComposeResults([]); }} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#94a3b8", cursor: "pointer", padding: 0 }}><i className="fa fa-times" /></button>
                </div>
                <div className="input-group input-group-sm mt-2">
                  <span className="input-group-text bg-white" style={{ borderRight: "none", borderColor: "#e2e8f0" }}><i className="fa fa-search" style={{ fontSize: "0.7rem", color: "#94a3b8" }} /></span>
                  <input className="form-control" placeholder="Search users..." value={composeQuery} autoFocus
                    onChange={(e) => handleComposeSearch(e.target.value)}
                    style={{ fontSize: "0.82rem", borderLeft: "none", borderColor: "#e2e8f0" }} />
                </div>
              </div>
              <div style={{ maxHeight: 320, overflow: "auto" }}>
                {composeQuery.trim() && composeResults.length === 0 ? (
                  <div className="text-center py-4"><small className="text-muted">No users found</small></div>
                ) : (
                  composeResults.map((u) => (
                    <div key={u._id} onClick={() => startChat(u._id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <img src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "?")}&background=0d6efd&color=fff&size=36`}
                        alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{u.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`d-flex flex-column flex-grow-1 ${showMobileList ? "d-none d-md-flex" : "d-flex"}`}>
          {!chatId ? (
            <div className="d-flex align-items-center justify-content-center flex-grow-1" style={{ background: "#fafbfc" }}>
              <div className="text-center">
                <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
                  <i className="fa fa-comments" style={{ color: "#94a3b8", fontSize: "2rem" }} />
                </div>
                <h5 className="fw-bold mb-2">Your Messages</h5>
                <p className="text-muted small mb-0">Select a conversation to start chatting</p>
              </div>
            </div>
          ) : chatLoading ? (
            <div className="d-flex align-items-center justify-content-center flex-grow-1"><LoadingState /></div>
          ) : !activeChat ? (
            <div className="d-flex align-items-center justify-content-center flex-grow-1">
              <p className="text-muted">Chat not found</p>
            </div>
          ) : (
            <>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #eef2f7", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
                <button className="btn btn-sm d-md-none" onClick={() => setShowMobileList(true)} style={{ border: "none", background: "none" }}>
                  <i className="fa fa-arrow-left" />
                </button>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={otherUser(activeChat)?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser(activeChat)?.name || "?")}&background=0d6efd&color=fff&size=36`}
                    alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                  {isOnline(otherUser(activeChat)?._id) && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff", position: "absolute", bottom: 0, right: 0 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${otherUser(activeChat)?._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>{otherUser(activeChat)?.name || "Unknown"}</span>
                  </Link>
                  {isOnline(otherUser(activeChat)?._id) && <div style={{ fontSize: "0.65rem", color: "#22c55e", marginTop: -1 }}>Online</div>}
                </div>
                {!activeChat.theyBlockedMe && (
                <button onClick={async () => {
                  const targetId = otherUser(activeChat)?._id;
                  if (!targetId) return;
                  if (activeChat.blocked) {
                    try {
                      await Apiservices.unblockUser(targetId);
                      showToast.success("User unblocked");
                      setActiveChat((prev) => prev ? { ...prev, blocked: false } : prev);
                    } catch { showToast.error("Failed to unblock"); }
                  } else {
                    const ok = await confirmAlert("Block this user? They won't be able to message you.");
                    if (!ok) return;
                    try {
                      await Apiservices.blockUser(targetId);
                      showToast.success("User blocked");
                      setActiveChat((prev) => prev ? { ...prev, blocked: true } : prev);
                    } catch { showToast.error("Failed to block user"); }
                  }
                }} title={activeChat.blocked ? "Unblock user" : "Block user"} style={{ background: "none", border: "none", color: activeChat.blocked ? "#dc2626" : "#94a3b8", cursor: "pointer", padding: "6px 8px", fontSize: "1rem" }}>
                  <i className={`fa ${activeChat.blocked ? "fa-undo" : "fa-ban"}`} />
                </button>
                )}
              </div>

              {activeChat.theyBlockedMe && (
                <div style={{ padding: "10px 20px", background: "#fef2f2", borderBottom: "1px solid #fecaca", textAlign: "center", fontSize: "0.8rem", color: "#dc2626" }}>
                  <i className="fa fa-ban me-1" />This user blocked you.
                </div>
              )}
              {!activeChat.theyBlockedMe && activeChat.blocked && (
                <div style={{ padding: "10px 20px", background: "#fef2f2", borderBottom: "1px solid #fecaca", textAlign: "center", fontSize: "0.8rem", color: "#dc2626" }}>
                  <i className="fa fa-ban me-1" />You blocked this user. <button onClick={async () => {
                    const targetId = otherUser(activeChat)?._id;
                    if (!targetId) return;
                    try {
                      await Apiservices.unblockUser(targetId);
                      showToast.success("User unblocked");
                      setActiveChat((prev) => prev ? { ...prev, blocked: false } : prev);
                    } catch { showToast.error("Failed to unblock"); }
                  }} style={{ background: "none", border: "none", color: "#dc2626", textDecoration: "underline", cursor: "pointer", padding: 0 }}>Unblock</button>
                </div>
              )}
              <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", background: "#fafbfc" }}>
                {(!activeChat.messages || activeChat.messages.length === 0) ? (
                  <div className="d-flex align-items-center justify-content-center" style={{ height: "100%" }}>
                    <div className="text-center">
                      <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
                        <i className="fa fa-comment" style={{ color: "#94a3b8", fontSize: "1.3rem" }} />
                      </div>
                      <p className="text-muted small mb-0">Send a message to start chatting</p>
                    </div>
                  </div>
                ) : (() => {
                  let lastDate = null;
                  return activeChat.messages.map((msg, i) => {
                    const msgDate = new Date(msg.createdAt).toDateString();
                    const showDate = lastDate !== msgDate;
                    lastDate = msgDate;
                    const isMe = msg.senderId?._id === user?._id;
                    const hasReactions = msg.reactions?.length > 0;
                    const reactCounts = hasReactions ? msg.reactions.reduce((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {}) : {};
                    const isDeleted = msg.isDeleted;
                    return (
                      <React.Fragment key={msg._id || i}>
                        {showDate && (
                          <div style={{ textAlign: "center", margin: "16px 0 12px" }}>
                            <span style={{ fontSize: "0.7rem", color: "#94a3b8", background: "#eef2f7", padding: "4px 12px", borderRadius: 999, fontWeight: 600 }}>
                              {formatDayHeader(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className="msg-row" style={{
                          display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
                          alignItems: "center", gap: 4, marginBottom: hasReactions ? 4 : 8,
                        }}>
                          {isMe && !isDeleted && (
                            <button onClick={() => handleDeleteMessage(msg._id)}
                              title="Delete for everyone"
                              style={{ opacity: 0, transition: "opacity 0.15s", background: "none", border: "none", padding: 2, fontSize: "0.7rem", color: "#94a3b8", cursor: "pointer" }}
                              className="delete-msg-btn"
                            ><i className="fa fa-trash" /></button>
                          )}
                          <div onDoubleClick={() => !isDeleted && handleDoubleClick(msg._id)} title={!isDeleted ? new Date(msg.createdAt).toLocaleString() : ""} style={{
                            maxWidth: "70%", padding: isDeleted ? "8px 16px" : (msg.attachments?.length ? "6px 6px 6px 6px" : "10px 16px"), borderRadius: 18,
                            background: isMe ? "linear-gradient(135deg, #0d6efd, #6610f2)" : "#fff",
                            color: isMe ? "#fff" : "#1e293b",
                            border: isMe ? "none" : "1px solid #eef2f7",
                            fontSize: "0.85rem", lineHeight: 1.4, wordBreak: "break-word", whiteSpace: "pre-wrap",
                            cursor: isDeleted ? "default" : "pointer", userSelect: "none", opacity: isDeleted ? 0.6 : 1,
                          }}>
                            {isDeleted ? (
                              <em style={{ fontSize: "0.8rem" }}>Message deleted</em>
                            ) : (
                              <>
                                {msg.attachments?.map((att, ai) => (
                                  att.type === "image" ? (
                                    <img key={ai} src={att.url} alt={att.name} style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 12, display: "block", marginBottom: msg.message ? 6 : 0 }} />
                                  ) : (
                                    <div key={ai} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: msg.message ? 6 : 0, background: isMe ? "rgba(255,255,255,0.15)" : "#f1f5f9", borderRadius: 8 }}>
                                      <i className="fa fa-paperclip" />
                                      <a href={att.url} target="_blank" rel="noreferrer" style={{ color: isMe ? "#fff" : "#0d6efd", fontSize: "0.8rem" }}>{att.name || "File"}</a>
                                    </div>
                                  )
                                ))}
                                {msg.message && <div style={{ padding: msg.attachments?.length ? "0 4px" : "0" }}>{msg.message}</div>}
                                <div style={{ fontSize: "0.6rem", marginTop: 4, opacity: 0.6, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                                  <span>{timeAgo(msg.createdAt)}</span>
                                  {isMe && (
                                    <i className={`fa ${msg.isSeen ? "fa-check-double" : "fa-check"}`}
                                      style={{ fontSize: "0.55rem", color: msg.isSeen ? "#fff" : "inherit" }} />
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {hasReactions && !isDeleted && (
                          <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 8, marginTop: -8 }}>
                            <div style={{ display: "flex", gap: 2, background: "#fff", border: "1px solid #eef2f7", borderRadius: 12, padding: "2px 8px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                              {Object.entries(reactCounts).map(([emoji, count]) => (
                                <span key={emoji} style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 2 }}>
                                  {emoji}<span style={{ fontSize: "0.6rem", color: "#64748b" }}>{count}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}

                {typingUser && (
                  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                    <div style={{
                      maxWidth: "70%", padding: "10px 16px", borderRadius: 18,
                      background: "#fff", border: "1px solid #eef2f7",
                      fontSize: "0.82rem", color: "#64748b",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", animation: "typingBounce 1.2s ease-in-out infinite" }} />
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", animation: "typingBounce 1.2s ease-in-out 0.2s infinite" }} />
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", animation: "typingBounce 1.2s ease-in-out 0.4s infinite" }} />
                      </div>
                      {typingName()} is typing...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: "12px 20px", borderTop: "1px solid #eef2f7", background: "#fff" }}>
                {activeChat.blocked || activeChat.theyBlockedMe ? (
                  <div className="text-center py-3">
                    <small className="text-muted">{activeChat.theyBlockedMe ? "This user has blocked you" : "You can't send messages to this user"}</small>
                  </div>
                ) : (
                  <>
                {attachments.length > 0 && (
                  <div className="d-flex" style={{ gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    {attachments.map((att, i) => (
                      <div key={i} style={{ position: "relative", width: 60, height: 60, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        {att.type === "image" ? (
                          <img src={att.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "grid", placeItems: "center", height: "100%", background: "#f8fafc" }}>
                            <i className="fa fa-file" style={{ color: "#94a3b8" }} />
                          </div>
                        )}
                        <button onClick={() => removeAttachment(i)} style={{ position: "absolute", top: 1, right: 1, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", fontSize: "0.55rem", display: "grid", placeItems: "center", lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="d-flex" style={{ gap: 8, alignItems: "flex-end" }}>
                  <button className="btn btn-light rounded-circle" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{ width: 40, height: 40, display: "grid", placeItems: "center", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                    {uploading ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-paperclip" style={{ fontSize: "0.85rem", color: "#64748b" }} />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFileSelect} style={{ display: "none" }} />
                  <textarea
                    ref={inputRef}
                    className="form-control"
                    rows={1}
                    placeholder="Type a message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    style={{
                      fontSize: "0.85rem", border: "1px solid #e2e8f0", borderRadius: 12,
                      resize: "none", maxHeight: 120, flex: 1,
                    }}
                  />
                  <button className="btn btn-primary rounded-circle" onClick={sendMessage} disabled={sending || (!input.trim() && attachments.length === 0)}
                    style={{ width: 40, height: 40, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {sending ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-paper-plane" style={{ fontSize: "0.85rem" }} />}
                  </button>
                </div>
                </>)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MessagesPage;
