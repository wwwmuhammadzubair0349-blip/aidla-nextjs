"use client";
// components/FloatingAssistant.jsx
// Premium floating AI assistant — reusable component
//
// Usage:
//   import FloatingAssistant from "@/components/FloatingAssistant";
//   const [isOpen, setIsOpen] = useState(false);
//   <FloatingAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} userName="John" />
//
// Props:
//   isOpen    — controls visibility
//   onClose   — called when user closes the panel
//   userName  — (optional) user's first name for greeting
//   apiUrl    — (optional) custom AI endpoint URL
//
// Architecture:
//   - Renders via React Portal to document.body
//   - Desktop: 380px floating panel, bottom-right
//   - Mobile: Bottom sheet, 82vh max-height
//   - No Supabase dependency — all data passed via props
//   - Zero backdrop-filter (GPU optimized)
//   - Auto-loads pages manifest for site-aware responses

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const DEFAULT_API_URL = "https://eyhpcztyznrpwnytvakw.supabase.co/functions/v1/chat";

/* ── Helper Functions ── */

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateLabel = fmtDate(msg.created_at || new Date().toISOString());
    if (dateLabel !== lastDate) {
      groups.push({ type: "date", label: dateLabel, id: "date-" + dateLabel });
      lastDate = dateLabel;
    }
    groups.push({ type: "message", ...msg });
  }
  return groups;
}

function renderMarkdown(text, isUser) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  let keyCounter = 0;
  const k = () => keyCounter++;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "code";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const code = codeLines.join("\n");
      elements.push(
        <div key={k()} className="bot-code-block">
          <div className="bot-code-header">
            <span className="bot-code-lang">{lang}</span>
            <CodeCopyBtn code={code} />
          </div>
          <pre className="bot-code-pre"><code>{code}</code></pre>
        </div>
      );
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      elements.push(<hr key={k()} className="bot-hr" />);
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const Tag = `h${Math.min(level + 2, 6)}`;
      elements.push(
        <Tag key={k()} className={`bot-heading bot-h${level}`}>
          {inlineFormat(headingMatch[2], isUser)}
        </Tag>
      );
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={k()} className="bot-blockquote">
          {quoteLines.map((ql, qi) => (
            <p key={qi}>{inlineFormat(ql, isUser)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (/^(\s*[-*+]\s)/.test(line)) {
      const items = [];
      while (i < lines.length && /^(\s*[-*+]\s)/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={k()} className="bot-ul">
          {items.map((item, ii) => (
            <li key={ii}>{inlineFormat(item, isUser)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={k()} className="bot-ol">
          {items.map((item, ii) => (
            <li key={ii}>{inlineFormat(item, isUser)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={k()} className="bot-spacer" />);
      i++;
      continue;
    }

    elements.push(
      <p key={k()} className="bot-p">
        {inlineFormat(line, isUser)}
      </p>
    );
    i++;
  }
  return elements;
}

function inlineFormat(text, isUser) {
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|(https?:\/\/[^\s\)\]\>"']+))/g;
  const parts = [];
  let last = 0, match, idx = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={idx++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={idx++}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={idx++}>{match[3]}</em>);
    else if (match[4])
      parts.push(
        <code key={idx++} className={`bot-inline-code${isUser ? " bot-inline-code-user" : ""}`}>
          {match[4]}
        </code>
      );
    else if (match[5] && match[6])
      parts.push(
        <a
          key={idx++}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className={`bot-link ${isUser ? "bot-link-user" : "bot-link-bot"}`}
        >
          {match[5]}
        </a>
      );
    else if (match[7])
      parts.push(
        <a
          key={idx++}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className={`bot-link ${isUser ? "bot-link-user" : "bot-link-bot"}`}
        >
          {match[7]}
        </a>
      );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={idx++}>{text.slice(last)}</span>);
  return parts.length === 0 ? text : parts;
}

/* ── Sub-components ── */

function CodeCopyBtn({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button className="bot-code-copy" onClick={copy}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="bot-typing-wrap">
      <div className="bot-avatar-sm">🤖</div>
      <div className="bot-typing-bubble">
        <span className="bot-dot" style={{ animationDelay: "0ms" }} />
        <span className="bot-dot" style={{ animationDelay: "160ms" }} />
        <span className="bot-dot" style={{ animationDelay: "320ms" }} />
      </div>
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button className="bot-copy-btn" onClick={copy} title="Copy message">
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`bot-msg-row ${isUser ? "bot-msg-row-user" : "bot-msg-row-bot"}`}>
      {!isUser && <div className="bot-avatar-sm">🤖</div>}
      <div className={`bot-bubble ${isUser ? "bot-bubble-user" : "bot-bubble-bot"}`}>
        <div className="bot-bubble-text">
          {isUser ? inlineFormat(msg.content, true) : renderMarkdown(msg.content, false)}
        </div>
        <div className="bot-bubble-footer">
          <span className="bot-bubble-time">{fmtTime(msg.created_at)}</span>
          <CopyBtn text={msg.content} />
        </div>
      </div>
      {isUser && <div className="bot-avatar-sm bot-avatar-user">👤</div>}
    </div>
  );
}

const CHIPS = [
  "Write me a Python function to reverse a string 🐍",
  "Help me write a professional CV 📄",
  "How do I earn coins on AIDLA? 🪙",
  "Explain photosynthesis simply 🌿",
  "Write an Instagram caption for a study post 📱",
  "How to prepare for a job interview? 💼",
];

/* ── Main Component ── */

export default function FloatingAssistant({
  isOpen = false,
  onClose,
  userName = "",
  apiUrl = DEFAULT_API_URL,
  userId = null,
}) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [error, setError] = useState("");
  const [pagesManifest, setPagesManifest] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // Ensure component only renders on client (SSR safe)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load pages manifest for site-aware responses
  useEffect(() => {
    if (!mounted) return;
    fetch("/pages-manifest.json")
      .then((res) => res.json())
      .then((data) => setPagesManifest(data))
      .catch(() => {
        // Silently fail — manifest is optional enhancement
      });
  }, [mounted]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Close on Escape key or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // Send message to AI
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");
    setLoading(true);

    if (inputRef.current) inputRef.current.style.height = "auto";

    const userMsg = {
      id: "local-u-" + Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const historyForContext = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Build site context from pages manifest
      let siteContext = "";
      if (pagesManifest?.pages) {
        const publicPages = pagesManifest.pages
          .filter((p) => p.category === "public")
          .map((p) => `- ${p.title}: ${p.route}`)
          .join("\n");
        const userPages = pagesManifest.pages
          .filter((p) => p.category === "user")
          .map((p) => `- ${p.title}: ${p.route}`)
          .join("\n");

        siteContext = `You are AIDLA Bot, an AI assistant for the AIDLA platform. You have knowledge of the following site pages:

PUBLIC PAGES (accessible to everyone):
${publicPages}

USER PAGES (require login):
${userPages}

When answering questions, you can reference these pages and guide users to the correct URL. If a user asks about a feature, suggest the relevant page. If they ask how to do something, provide step-by-step instructions based on the available pages.`;
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          user_id: userId || "anonymous",
          history: historyForContext,
          site_context: siteContext,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError("Bot error: " + data.error);
      } else {
        const botMsg = {
          id: "local-b-" + Date.now(),
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages, apiUrl, userId, pagesManifest]);

  // Keyboard shortcut
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear all messages
  const clearChat = () => {
    setMessages([]);
    setShowClearConfirm(false);
  };

  const grouped = groupByDate(messages);

  // Don't render anything until mounted (prevents SSR hydration mismatch)
  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <style>{CSS}</style>

      <div className="bot-overlay" aria-hidden="true" onClick={onClose} />

      <div className="bot-panel" ref={panelRef} role="dialog" aria-label="AIDLA Bot assistant" aria-modal="true">
        {/* ── Header ── */}
        <div className="bot-header">
          <div className="bot-header-left">
            <div className="bot-header-avatar" aria-hidden="true">
              🤖
            </div>
            <div>
              <div className="bot-header-name">AIDLA Bot</div>
              <div className="bot-header-status">
                <span className="bot-status-dot" aria-hidden="true" />
                Always online
              </div>
            </div>
          </div>
          <div className="bot-header-actions">
            <button
              className="bot-clear-btn"
              onClick={() => setShowClearConfirm(true)}
              title="Clear chat history"
              disabled={messages.length === 0}
              aria-label="Clear chat history"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              <span className="bot-clear-text">Clear</span>
            </button>
            <button className="bot-close-btn" onClick={onClose} aria-label="Close assistant" title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Clear Confirm Modal ── */}
        {showClearConfirm && (
          <div
            className="bot-confirm-overlay"
            onClick={() => setShowClearConfirm(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm clear chat"
          >
            <div className="bot-confirm-box" onClick={(e) => e.stopPropagation()}>
              <div className="bot-confirm-icon" aria-hidden="true">
                🗑️
              </div>
              <div className="bot-confirm-title">Clear all messages?</div>
              <div className="bot-confirm-sub">This action cannot be undone. All messages will be permanently deleted.</div>
              <div className="bot-confirm-actions">
                <button className="bot-confirm-cancel" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </button>
                <button className="bot-confirm-delete" onClick={clearChat}>
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        <div className="bot-messages" aria-live="polite" aria-label="Chat messages">
          {messages.length === 0 ? (
            <div className="bot-empty">
              <div className="bot-empty-icon" aria-hidden="true">
                🤖
              </div>
              <div className="bot-empty-title">
                Hi{userName ? `, ${userName}` : ""}! I&apos;m AIDLA Bot 👋
              </div>
              <div className="bot-empty-sub">
                Your all-in-one AI assistant. Ask me anything — coding, writing, research, study help, career advice, social media, and more. I speak all languages! 🌍
              </div>
              <div className="bot-empty-chips" role="list" aria-label="Suggested questions">
                {CHIPS.map((q) => (
                  <button
                    key={q}
                    className="bot-suggestion-chip"
                    role="listitem"
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {grouped.map((item) =>
                item.type === "date" ? (
                  <div key={item.id} className="bot-date-divider">
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <MessageBubble key={item.id} msg={item} />
                )
              )}
              {loading && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bot-error" role="alert">
            ⚠️ {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              ×
            </button>
          </div>
        )}

        {/* ── Input ── */}
        <div className="bot-input-wrap">
          <div className="bot-input-box">
            <label
              htmlFor="bot-input"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
              }}
            >
              Message AIDLA Bot
            </label>
            <textarea
              id="bot-input"
              ref={inputRef}
              className="bot-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder="Ask me anything…"
              rows={1}
              disabled={loading}
              aria-label="Type your message"
            />
            <button
              className={`bot-send-btn${input.trim() && !loading ? " bot-send-btn-active" : ""}`}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              title="Send (Enter)"
              aria-label="Send message"
            >
              {loading ? (
                <div className="bot-send-spinner" aria-hidden="true" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ── CSS (performance optimized, no backdrop-filter, no Supabase) ── */
const CSS = `
  /* Overlay */
  .bot-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.15);
    z-index: 9998;
    animation: botFadeIn 0.2s ease both;
  }
  @keyframes botFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Floating panel */
  .bot-panel {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    width: 380px;
    height: 600px;
    max-height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid rgba(15,23,42,0.08);
    box-shadow: 0 8px 40px rgba(15,23,42,0.1), 0 2px 8px rgba(15,23,42,0.06);
    overflow: hidden;
    animation: botPanelIn 0.2s cubic-bezier(0.16,1,0.3,1) both;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  @keyframes botPanelIn {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Header */
  .bot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #ffffff;
    border-bottom: 1px solid rgba(15,23,42,0.06);
    flex-shrink: 0;
    gap: 8px;
  }
  .bot-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .bot-header-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #eff6ff;
    border: 1px solid rgba(59,130,246,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .bot-header-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #0f172a;
    letter-spacing: -0.2px;
    line-height: 1.2;
  }
  .bot-header-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    margin-top: 1px;
  }
  .bot-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
  }
  .bot-header-actions {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .bot-clear-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.15);
    background: transparent;
    color: #dc2626;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    white-space: nowrap;
    font-family: inherit;
  }
  .bot-clear-btn:hover:not(:disabled) {
    background: rgba(239,68,68,0.06);
    border-color: rgba(239,68,68,0.25);
  }
  .bot-clear-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .bot-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
    padding: 0;
  }
  .bot-close-btn:hover {
    background: rgba(15,23,42,0.05);
    color: #475569;
  }

  /* Messages area */
  .bot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    scroll-behavior: smooth;
    content-visibility: auto;
    contain-intrinsic-size: 0 500px;
  }
  .bot-messages::-webkit-scrollbar {
    width: 3px;
  }
  .bot-messages::-webkit-scrollbar-thumb {
    background: rgba(15,23,42,0.1);
    border-radius: 100px;
  }
  .bot-messages::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Date divider */
  .bot-date-divider {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0 4px;
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    text-align: center;
    justify-content: center;
  }
  .bot-date-divider span {
    padding: 2px 10px;
    background: rgba(15,23,42,0.04);
    border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.06);
  }

  /* Message row */
  .bot-msg-row {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    margin-bottom: 4px;
    animation: botMsgIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes botMsgIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bot-msg-row-user { flex-direction: row-reverse; }
  .bot-msg-row-bot  { flex-direction: row; }

  /* Avatar */
  .bot-avatar-sm {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #eff6ff;
    border: 1px solid rgba(59,130,246,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }
  .bot-avatar-user {
    background: #f1f5f9;
    border-color: rgba(71,85,105,0.12);
  }

  /* Bubble */
  .bot-bubble {
    max-width: 82%;
    padding: 9px 12px 7px;
    border-radius: 14px;
    line-height: 1.5;
    font-size: 0.85rem;
    position: relative;
  }
  .bot-bubble-bot {
    background: #f8fafc;
    border: 1px solid rgba(15,23,42,0.06);
    border-bottom-left-radius: 4px;
    color: #1e293b;
  }
  .bot-bubble-user {
    background: #1e3a8a;
    color: #ffffff;
    border-bottom-right-radius: 4px;
  }
  .bot-bubble-text {
    font-weight: 500;
    word-break: break-word;
  }
  .bot-bubble-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 4px;
  }
  .bot-bubble-time {
    font-size: 9px;
    font-weight: 600;
    opacity: 0.45;
  }

  /* Copy button */
  .bot-copy-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    opacity: 0.4;
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s ease;
    border-radius: 4px;
  }
  .bot-copy-btn:hover { opacity: 0.8; }

  /* Typography */
  .bot-p { margin: 0 0 3px 0; line-height: 1.55; }
  .bot-spacer { height: 4px; }
  .bot-ul, .bot-ol { margin: 3px 0 5px 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; }
  .bot-ul li, .bot-ol li { line-height: 1.5; }
  .bot-heading { margin: 5px 0 2px 0; font-weight: 700; color: #0f172a; line-height: 1.3; }
  .bot-h1 { font-size: 1rem; }
  .bot-h2 { font-size: 0.95rem; }
  .bot-h3 { font-size: 0.9rem; }
  .bot-h4 { font-size: 0.87rem; }
  .bot-hr { border: none; border-top: 1px solid rgba(15,23,42,0.08); margin: 6px 0; }
  .bot-blockquote {
    border-left: 2px solid rgba(59,130,246,0.3);
    margin: 3px 0;
    padding: 3px 8px;
    background: rgba(59,130,246,0.03);
    border-radius: 0 5px 5px 0;
    font-style: italic;
    color: #475569;
  }
  .bot-blockquote p { margin: 0; }
  .bot-inline-code {
    font-family: 'Courier New', Consolas, monospace;
    font-size: 0.82em;
    background: rgba(15,23,42,0.06);
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 4px;
    padding: 1px 4px;
    color: #1e3a8a;
    font-style: normal;
  }
  .bot-inline-code-user {
    background: rgba(255,255,255,0.18);
    border-color: rgba(255,255,255,0.25);
    color: #fff;
  }

  /* Code block */
  .bot-code-block {
    margin: 5px 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(15,23,42,0.1);
    background: #0f172a;
    font-size: 0.78rem;
  }
  .bot-code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .bot-code-lang {
    font-size: 0.68rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-family: 'Courier New', monospace;
  }
  .bot-code-copy {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: #cbd5e1;
    font-size: 0.68rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .bot-code-copy:hover {
    background: rgba(255,255,255,0.15);
    color: #fff;
  }
  .bot-code-pre {
    margin: 0;
    padding: 10px 12px;
    overflow-x: auto;
    font-family: 'Courier New', Consolas, 'Fira Code', monospace;
    font-size: 0.78rem;
    line-height: 1.55;
    color: #e2e8f0;
    white-space: pre;
  }
  .bot-code-pre::-webkit-scrollbar { height: 3px; }
  .bot-code-pre::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.12);
    border-radius: 3px;
  }

  /* Links */
  .bot-link {
    text-decoration: underline;
    text-underline-offset: 2px;
    word-break: break-all;
    transition: opacity 0.15s ease;
  }
  .bot-link:hover { opacity: 0.7; }
  .bot-link-bot { color: #2563eb; }
  .bot-link-user { color: #bfdbfe; }

  /* Typing indicator */
  .bot-typing-wrap {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    animation: botMsgIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .bot-typing-bubble {
    display: flex;
    align-items: center;
    gap: 3px;
    background: #f8fafc;
    border: 1px solid rgba(15,23,42,0.06);
    border-bottom-left-radius: 4px;
    border-radius: 14px;
    padding: 10px 14px;
  }
  .bot-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3b82f6;
    animation: botDotBounce 1.2s ease infinite;
    display: block;
  }
  @keyframes botDotBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
    30%           { transform: translateY(-5px); opacity: 1; }
  }

  /* Empty state */
  .bot-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 20px 16px;
    text-align: center;
    gap: 8px;
  }
  .bot-empty-icon { font-size: 40px; }
  .bot-empty-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 2px;
  }
  .bot-empty-sub {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
    max-width: 320px;
    line-height: 1.5;
  }
  .bot-empty-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    margin-top: 4px;
  }
  .bot-suggestion-chip {
    padding: 7px 12px;
    border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.1);
    background: #f8fafc;
    color: #1e3a8a;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    text-align: left;
    font-family: inherit;
  }
  .bot-suggestion-chip:hover {
    background: #eff6ff;
    border-color: rgba(59,130,246,0.2);
  }

  /* Error */
  .bot-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    background: rgba(239,68,68,0.05);
    border-top: 1px solid rgba(239,68,68,0.1);
    color: #dc2626;
    font-size: 0.78rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  .bot-error button {
    background: transparent;
    border: none;
    color: #dc2626;
    font-size: 16px;
    cursor: pointer;
    font-weight: 700;
    padding: 0 4px;
    font-family: inherit;
  }

  /* Input area */
  .bot-input-wrap {
    padding: 10px 14px 12px;
    background: #ffffff;
    border-top: 1px solid rgba(15,23,42,0.06);
    flex-shrink: 0;
  }
  .bot-input-box {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #f8fafc;
    border: 1.5px solid rgba(15,23,42,0.08);
    border-radius: 14px;
    padding: 7px 8px 7px 14px;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
  .bot-input-box:focus-within {
    border-color: rgba(59,130,246,0.3);
    background: #ffffff;
  }
  .bot-textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-size: 0.88rem;
    font-weight: 500;
    color: #0f172a;
    line-height: 1.5;
    max-height: 100px;
    overflow-y: auto;
    font-family: inherit;
    padding: 3px 0;
  }
  .bot-textarea::placeholder { color: #94a3b8; }
  .bot-textarea:disabled { opacity: 0.6; cursor: not-allowed; }
  .bot-send-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: none;
    background: #e2e8f0;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: not-allowed;
    flex-shrink: 0;
    transition: background-color 0.2s ease, color 0.2s ease;
    padding: 0;
  }
  .bot-send-btn-active {
    background: #1e3a8a;
    color: #fff;
    cursor: pointer;
  }
  .bot-send-btn-active:hover { background: #1e40af; }
  .bot-send-btn-active:active { background: #1e3a8a; opacity: 0.9; }
  .bot-send-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: botSpin 0.7s linear infinite;
  }
  @keyframes botSpin { to { transform: rotate(360deg); } }

  /* Confirm modal */
  .bot-confirm-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15,23,42,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    border-radius: 20px;
    padding: 16px;
  }
  .bot-confirm-box {
    background: #fff;
    border-radius: 16px;
    padding: 24px 22px;
    text-align: center;
    max-width: 300px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(15,23,42,0.15);
    animation: botConfirmIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes botConfirmIn {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .bot-confirm-icon { font-size: 36px; margin-bottom: 8px; }
  .bot-confirm-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
  .bot-confirm-sub { font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-bottom: 18px; }
  .bot-confirm-actions { display: flex; gap: 8px; justify-content: center; }
  .bot-confirm-cancel {
    padding: 8px 18px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: transparent;
    color: #475569;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .bot-confirm-cancel:hover { background: #f8fafc; }
  .bot-confirm-delete {
    padding: 8px 18px;
    border-radius: 10px;
    border: none;
    background: #dc2626;
    color: #fff;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .bot-confirm-delete:hover:not(:disabled) { background: #b91c1c; }
  .bot-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Mobile: bottom sheet */
  @media (max-width: 640px) {
    .bot-panel {
      bottom: 0;
      right: 0;
      left: 0;
      width: 100%;
      height: 82vh;
      max-height: 82vh;
      border-radius: 20px 20px 0 0;
      border-bottom: none;
      animation: botPanelInMobile 0.25s cubic-bezier(0.16,1,0.3,1) both;
    }
    @keyframes botPanelInMobile {
      from { opacity: 0; transform: translateY(100%); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .bot-header { padding: 10px 14px; }
    .bot-header-avatar { width: 32px; height: 32px; font-size: 16px; border-radius: 9px; }
    .bot-header-name { font-size: 0.85rem; }
    .bot-header-status { font-size: 10px; }
    .bot-clear-text { display: none; }
    .bot-clear-btn { padding: 6px 8px; }

    .bot-messages { padding: 10px; gap: 2px; }
    .bot-bubble { font-size: 0.82rem; padding: 8px 10px 6px; max-width: 85%; }
    .bot-code-block { font-size: 0.74rem; }
    .bot-code-pre { padding: 8px 10px; }

    .bot-empty-icon { font-size: 34px; }
    .bot-empty-title { font-size: 0.9rem; }
    .bot-empty-sub { font-size: 0.76rem; }
    .bot-suggestion-chip { font-size: 0.72rem; padding: 6px 10px; }

    .bot-input-wrap { padding: 8px 12px 10px; }
    .bot-input-box { border-radius: 12px; padding: 6px 7px 6px 12px; }
    .bot-textarea { font-size: 0.84rem; }
    .bot-send-btn { width: 30px; height: 30px; border-radius: 8px; }

    .bot-confirm-overlay { border-radius: 20px 20px 0 0; }
    .bot-confirm-box { padding: 20px 18px; }
    .bot-confirm-icon { font-size: 30px; }
    .bot-confirm-title { font-size: 0.95rem; }
  }

  /* Small phones */
  @media (max-width: 380px) {
    .bot-panel { height: 80vh; max-height: 80vh; }
    .bot-bubble { font-size: 0.8rem; max-width: 88%; }
    .bot-messages { padding: 8px; }
    .bot-input-wrap { padding: 6px 10px 8px; }
  }
`;