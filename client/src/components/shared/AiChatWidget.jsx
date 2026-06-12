import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { aiGuide } from "../../utils/aiGuideService";
import { useAuth } from "../../App";

const BOT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234285F4'/%3E%3Ctext x='50' y='62' text-anchor='middle' fill='white' font-size='32' font-weight='bold'%3ES%3C/text%3E%3C/svg%3E";

const AUTH_PAGES = ["/login", "/forgot-password", "/reset-password"];

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 0,
    right: 0,
    zIndex: 99999,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4285F4, #34A853)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(66,133,244,0.4)",
    transition: "all 0.2s ease",
    border: "none",
    outline: "none",
    margin: "0 24px 24px 0",
    marginLeft: "auto",
    position: "relative",
  },
  bubbleIcon: {
    color: "white",
    fontSize: 24,
    lineHeight: 1,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#ef4444",
    border: "2px solid white",
  },
  window: {
    width: 380,
    height: 560,
    maxHeight: "calc(100vh - 140px)",
    background: "white",
    borderRadius: "16px 16px 0 0",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    margin: "0 16px 0 auto",
    animation: "slideUp 0.25s ease",
    position: "relative",
  },
  windowMobile: {
    width: "100vw",
    height: "100dvh",
    maxHeight: "100dvh",
    borderRadius: 0,
    margin: 0,
  },
  header: {
    background: "linear-gradient(135deg, #4285F4, #34A853)",
    color: "white",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  headerName: {
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.2,
  },
  headerStatus: {
    fontSize: 12,
    opacity: 0.85,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#4ade80",
    display: "inline-block",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: 20,
    cursor: "pointer",
    padding: "4px 8px",
    opacity: 0.85,
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    background: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  messageRow: {
    display: "flex",
    gap: 8,
    maxWidth: "85%",
  },
  messageAi: {
    alignSelf: "flex-start",
  },
  messageUser: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  messageBubble: {
    padding: "10px 14px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  bubbleAi: {
    background: "white",
    color: "#333",
    borderBottomLeftRadius: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  bubbleUser: {
    background: "#4285F4",
    color: "white",
    borderBottomRightRadius: 4,
  },
  messageTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    paddingLeft: 4,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    flexShrink: 0,
    alignSelf: "flex-end",
    marginBottom: 2,
  },
  actionsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  actionBtn: {
    background: "#e8f0fe",
    color: "#4285F4",
    border: "1px solid #d2e3fc",
    padding: "7px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  inputArea: {
    padding: "12px 16px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
    background: "white",
  },
  input: {
    flex: 1,
    border: "1px solid #e0e0e0",
    borderRadius: 24,
    padding: "10px 16px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4285F4, #34A853)",
    border: "none",
    color: "white",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    transition: "opacity 0.15s",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "10px 14px",
    background: "white",
    borderRadius: "16px 16px 16px 4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#999",
    animation: "bounce 1.4s infinite",
  },
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function isAuthPage(pathname) {
  return AUTH_PAGES.includes(pathname) || pathname.startsWith("/reset-password/") || pathname.startsWith("/verify-email/");
}

function AiChatWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState("not_started");
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initializedRef = useRef(false);
  const prevUserIdRef = useRef(null);
  const pendingAuthRefreshRef = useRef(false);

  const isOnAuthPage = isAuthPage(location.pathname);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const loadWelcome = useCallback(async (forceRefresh = false) => {
    if (hasWelcomed && !forceRefresh) return;
    try {
      const data = await aiGuide.getWelcome();
      if (!data) return;
      setMessages([{
        id: "welcome",
        sender: "ai",
        text: data.reply,
        actions: data.actions || [],
        timestamp: new Date(),
      }]);
      setOnboardingStatus(data.onboardingStatus || "not_started");
      setHasWelcomed(true);
      pendingAuthRefreshRef.current = false;
    } catch {
      setMessages([{
        id: "welcome",
        sender: "ai",
        text: "Hi! I'm SwapMind, your guide. How can I help you today?",
        actions: [],
        timestamp: new Date(),
      }]);
      setHasWelcomed(true);
      pendingAuthRefreshRef.current = false;
    }
  }, [hasWelcomed]);

  useEffect(() => {
    if (isOpen) {
      if (pendingAuthRefreshRef.current) {
        setMessages([]);
        setHasWelcomed(false);
        initializedRef.current = false;
        loadWelcome(true);
      } else if (!initializedRef.current) {
        initializedRef.current = true;
        loadWelcome(false);
      }
    }
  }, [isOpen, loadWelcome]);

  useEffect(() => {
    const currentUserId = user?._id || user?.id || null;
    const prevUserId = prevUserIdRef.current;

    if (prevUserIdRef.current === null && currentUserId !== null) {
      // Guest → logged in
      pendingAuthRefreshRef.current = true;
      if (isOpen) {
        setMessages([]);
        setHasWelcomed(false);
        initializedRef.current = false;
        setTimeout(() => {
          loadWelcome(true);
        }, 100);
      }
    } else if (prevUserIdRef.current !== null && currentUserId === null) {
      // Logged in → logged out
      setMessages([]);
      setHasWelcomed(false);
      setOnboardingStatus("not_started");
      initializedRef.current = false;
      pendingAuthRefreshRef.current = false;
    }

    prevUserIdRef.current = currentUserId;
  }, [user, isOpen, loadWelcome]);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const history = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const data = await aiGuide.sendMessage(text.trim(), onboardingStatus, history);
      if (!data) throw new Error("No response");

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply,
        actions: data.actions || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (data.onboardingStatus) {
        setOnboardingStatus(data.onboardingStatus);
        if (data.onboardingStatus === "completed") {
          aiGuide.updateOnboarding("completed").catch(() => {});
        }
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, I'm having trouble connecting. Please try again!",
        actions: [],
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (action) => {
    if (action.action === "navigate") {
      setIsOpen(false);
      setTimeout(() => navigate(action.path), 200);
    } else if (action.action === "onboarding") {
      sendMessage(action.label);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleOpen = () => {
    if (isOnAuthPage) {
      if (!isOpen) return;
    }
    setIsOpen((prev) => !prev);
  };

  if (isOnAuthPage && !isOpen) {
    return (
      <div style={styles.wrapper} className="swapmind-widget">
        <button
          className="swapMind-bubble"
          style={styles.bubble}
          onClick={toggleOpen}
          aria-label="Open AI Guide"
          title="Need help? Ask SwapMind!"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="12" y1="7" x2="12" y2="13" />
          </svg>
          {pendingAuthRefreshRef.current && <div style={styles.unreadDot} />}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper} className="swapmind-widget">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .swapmind-widget * { box-sizing: border-box; }
        .swapmind-widget ::-webkit-scrollbar { width: 4px; }
        .swapmind-widget ::-webkit-scrollbar-track { background: transparent; }
        .swapmind-widget ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .swapmind-action-btn:hover { background: #d2e3fc !important; transform: scale(1.02); }
        .swapmind-send-btn:active { transform: scale(0.92); }
        .swapMind-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(66,133,244,0.5); }
        .swapmind-input:focus { border-color: #4285F4; box-shadow: 0 0 0 2px rgba(66,133,244,0.15); }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {isOpen ? (
        <div
          className="swapmind-window"
          style={{
            ...styles.window,
            ...(isMobile ? styles.windowMobile : {}),
          }}
        >
          <div style={styles.header}>
            <img src={BOT_AVATAR} alt="SwapMind" style={styles.headerAvatar} />
            <div style={styles.headerInfo}>
              <div style={styles.headerName}>SwapMind Guide</div>
              <div style={styles.headerStatus}>
                <span style={styles.statusDot} />
                Online
              </div>
            </div>
            <button onClick={toggleOpen} style={styles.closeBtn} aria-label="Close chat">
              <i className="fa fa-times" />
            </button>
          </div>

          <div style={styles.messagesContainer}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#999", fontSize: 13, padding: 40 }}>
                Loading...
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  style={{
                    ...styles.messageRow,
                    ...(msg.sender === "ai" ? styles.messageAi : styles.messageUser),
                  }}
                >
                  {msg.sender === "ai" && (
                    <img src={BOT_AVATAR} alt="AI" style={styles.messageAvatar} />
                  )}
                  <div>
                    <div
                      style={{
                        ...styles.messageBubble,
                        ...(msg.sender === "ai" ? styles.bubbleAi : styles.bubbleUser),
                      }}
                    >
                      {msg.text}
                    </div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div style={styles.actionsContainer}>
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            className="swapmind-action-btn"
                            style={styles.actionBtn}
                            onClick={() => handleAction(act)}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div style={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={styles.typingIndicator}>
                <div className="typing-dot" style={styles.typingDot} />
                <div className="typing-dot" style={{ ...styles.typingDot, animationDelay: "0.2s" }} />
                <div className="typing-dot" style={{ ...styles.typingDot, animationDelay: "0.4s" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              ref={inputRef}
              className="swapmind-input"
              style={styles.input}
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className="swapmind-send-btn"
              style={{
                ...styles.sendBtn,
                opacity: input.trim() && !isTyping ? 1 : 0.5,
              }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              aria-label="Send"
            >
              <i className="fa fa-paper-plane" style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      ) : null}

      <button
        className="swapMind-bubble"
        style={styles.bubble}
        onClick={toggleOpen}
        aria-label="Open AI Guide"
      >
        {isOpen ? (
          <i className="fa fa-times" style={styles.bubbleIcon} />
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
              <line x1="12" y1="7" x2="12" y2="13" />
            </svg>
            {pendingAuthRefreshRef.current && <div style={styles.unreadDot} />}
          </>
        )}
      </button>
    </div>
  );
}

export default AiChatWidget;
