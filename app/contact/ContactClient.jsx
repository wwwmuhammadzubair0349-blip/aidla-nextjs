"use client";

import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./contact.module.css";

/* ── Bot Knowledge Base ── */
const BOT_KB = [
  { keywords: ["hello", "hi", "hey", "salam"], answer: "Welcome to AIDLA support! How can I help you today?" },
  { keywords: ["what is aidla", "about aidla", "aidla platform"], answer: "AIDLA is an educational platform where you can learn, take tests, participate in lucky draws and wheel spins, and earn digital coin rewards!" },
  { keywords: ["register", "signup", "sign up", "create account", "join"], answer: "To register:\n1. Click Sign Up on the home page\n2. Enter your name, email, and password\n3. Verify your email\n4. Start learning and earning!" },
  { keywords: ["login", "log in", "sign in", "cant login", "login problem"], answer: "Having trouble logging in? Try:\n1. Check your email and password\n2. Use Forgot Password to reset\n3. Make sure your email is verified\n4. Contact support if the issue persists" },
  { keywords: ["coins", "earn coins", "how to earn", "rewards"], answer: "You can earn coins on AIDLA by:\n- Completing tests and quizzes\n- Spinning the Lucky Wheel\n- Winning Lucky Draws\n- Participating in events\nCoins can be redeemed for prizes!" },
  { keywords: ["lucky wheel", "wheel", "spin"], answer: "The Lucky Wheel gives you a chance to win coins, gifts, or bonus spins!\n- Free spin available daily\n- Paid spins available anytime\n- Results are instant" },
  { keywords: ["lucky draw", "draw", "raffle"], answer: "Lucky Draws are special events where participants can win big prizes!\n- Eligibility varies per draw\n- Winners are announced officially\n- Check the Leaderboard for results" },
  { keywords: ["test", "quiz", "exam"], answer: "AIDLA tests are scored by correct answers and speed.\n- Faster and more accurate = higher rank\n- Live leaderboard updates in real time\n- Results and winners are posted on the Leaderboard page" },
  { keywords: ["leaderboard", "ranking", "rank"], answer: "The AIDLA Leaderboard shows:\n- Live Board: real-time test rankings\n- Test Results: official winners\n- Lucky Draw: draw winners\n- Lucky Wheel: recent wins" },
  { keywords: ["password", "forgot password", "reset password"], answer: "To reset your password:\n1. Go to the login page\n2. Click Forgot Password\n3. Enter your registered email\n4. Check your inbox for a reset link" },
  { keywords: ["contact", "support", "help", "email"], answer: "You can reach AIDLA support at support@aidla.online or use the contact form on this page!" },
];

function getBotAnswer(message) {
  const lower = message.toLowerCase();
  for (const entry of BOT_KB) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.answer;
  }
  return "I'm not sure about that yet. For detailed help, please use the contact form or email support@aidla.online!";
}

const QUICK_REPLIES = ["What is AIDLA?", "How to earn coins?", "Lucky Wheel help", "Reset password", "Contact support"];

/* ── Contact Form ── */
function ContactForm() {
  // ✅ ACCESSIBILITY FIX: useId for unique label/input associations
  const nameId    = useId();
  const emailId   = useId();
  const subjectId = useId();
  const messageId = useId();

  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending"); setErrMsg("");
    const { error } = await supabase.from("contact_messages").insert([{
      name: form.name.trim(), email: form.email.trim(),
      subject: form.subject || "General", message: form.message.trim(),
    }]);
    if (error) { setErrMsg(error.message); setStatus("error"); }
    else setStatus("success");
  };

  if (status === "success") {
    return (
      <div className={styles.ctSuccess} role="status" aria-live="polite">
        <div className={styles.ctSuccessIcon} aria-hidden="true">✓</div>
        <h3>Message Received!</h3>
        <p>Thank you for reaching out. Our team will reply to <strong>{form.email}</strong> within 24–48 hours.</p>
      </div>
    );
  }

  return (
    // ✅ ACCESSIBILITY FIX: proper <form> with onSubmit (not onClick on button)
    <form className={styles.ctCardBody} onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {status === "error" && (
        <div className={styles.ctErr} role="alert" aria-live="assertive">
          {errMsg || "Something went wrong. Please try again."}
        </div>
      )}

      <div className={styles.ctField}>
        <label className={styles.ctLabel} htmlFor={nameId}>Your Name</label>
        <input
          id={nameId}
          className={styles.ctInput}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
          autoComplete="name"
          aria-required="true"
        />
      </div>

      <div className={styles.ctField}>
        <label className={styles.ctLabel} htmlFor={emailId}>Email Address</label>
        <input
          id={emailId}
          className={styles.ctInput}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          autoComplete="email"
          aria-required="true"
        />
      </div>

      <div className={styles.ctField}>
        <label className={styles.ctLabel} htmlFor={subjectId}>Subject</label>
        <select
          id={subjectId}
          className={styles.ctSelect}
          name="subject"
          value={form.subject}
          onChange={handleChange}
          aria-label="Select a subject"
        >
          <option value="">Select a subject...</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Account Issue">Account Issue</option>
          <option value="Reward / Prize">Reward / Prize</option>
          <option value="Technical Problem">Technical Problem</option>
          <option value="Partnership">Partnership</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className={styles.ctField}>
        <label className={styles.ctLabel} htmlFor={messageId}>Message</label>
        <textarea
          id={messageId}
          className={styles.ctTextarea}
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Describe your question or issue..."
          rows={4}
          required
          aria-required="true"
        />
      </div>

      {/* ✅ ACCESSIBILITY FIX: type="submit" so Enter key works + screen readers announce it */}
      <button
        type="submit"
        className={styles.ctBtn}
        disabled={status === "sending" || !form.name || !form.email || !form.message}
        aria-busy={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

/* ── Help Bot ── */
function HelpBot() {
  const [isOpen, setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: "Assalamu Alaikum! I am the AIDLA Help Bot. Ask me anything about the platform!" }
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const endRef              = useRef(null);
  const inputRef            = useRef(null);
  const msgsId              = useId();

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      // ✅ ACCESSIBILITY FIX: focus input when chat opens
      inputRef.current?.focus();
    }
  }, [messages, typing, isOpen]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: msg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const answer = getBotAnswer(msg);
    setTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: answer }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMessages([
    { id: 1, role: "bot", text: "Assalamu Alaikum! I am the AIDLA Help Bot. Ask me anything about the platform!" }
  ]);

  if (!isOpen) {
    return (
      <motion.button
        className={styles.botCollapsed}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsOpen(true)}
        // ✅ ACCESSIBILITY FIX: was a <div>, now a <button> — keyboard accessible
        aria-label="Open AIDLA Help Bot chat"
        aria-expanded={false}
        aria-haspopup="dialog"
      >
        <div className={styles.botCollapsedIcon} aria-hidden="true">🤖</div>
        <div className={styles.botCollapsedText}>Need help? Tap here.</div>
      </motion.button>
    );
  }

  return (
    // ✅ ACCESSIBILITY FIX: role="dialog" with aria-label for screen readers
    <motion.div
      className={styles.botCard}
      role="dialog"
      aria-label="AIDLA Help Bot"
      aria-modal="false"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.botHd}>
        <div className={styles.botHdLeft}>
          <div className={styles.botAv} aria-hidden="true">AI</div>
          <div>
            <div className={styles.botTitle}>AIDLA Help Bot</div>
            {/* ✅ ACCESSIBILITY FIX: aria-live so screen readers announce status changes */}
            <div className={styles.botOnline} aria-live="polite">
              <span className={styles.botDot} aria-hidden="true" />Online
            </div>
          </div>
        </div>
        <div className={styles.botHdActions}>
          <button className={styles.botClearBtn} onClick={clearChat} aria-label="Clear chat history">
            <span aria-hidden="true">🗑</span>
          </button>
          <button className={styles.botCloseBtn} onClick={() => setIsOpen(false)} aria-label="Minimize chat">
            <span aria-hidden="true">−</span>
          </button>
        </div>
      </div>

      {/* ✅ ACCESSIBILITY FIX: aria-live="polite" so new messages are read aloud */}
      <div
        id={msgsId}
        className={styles.botMsgs}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              className={`${styles.botMsg} ${msg.role === "user" ? styles.user : styles.bot}`}
              initial={{ opacity: 0, y: 7, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              // ✅ ACCESSIBILITY FIX: role distinguishes bot vs user messages
              role="article"
              aria-label={msg.role === "bot" ? "AIDLA Help Bot" : "You"}
            >
              <div className={styles.botMsgAv} aria-hidden="true">{msg.role === "bot" ? "AI" : "U"}</div>
              <div className={styles.botBubble}>{msg.text}</div>
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              className={styles.botTypingWrap}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              aria-label="AIDLA Help Bot is typing"
              role="status"
            >
              <div className={styles.botMsgAv} aria-hidden="true">AI</div>
              <div className={styles.botTyping} aria-hidden="true"><span /><span /><span /></div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} aria-hidden="true" />
      </div>

      {/* ✅ ACCESSIBILITY FIX: role="group" groups quick reply buttons */}
      <div className={styles.botQuick} role="group" aria-label="Quick reply options">
        {QUICK_REPLIES.map(q => (
          <button
            key={q}
            className={styles.botQbtn}
            onClick={() => send(q)}
            aria-label={`Quick reply: ${q}`}
          >
            {q}
          </button>
        ))}
      </div>

      <div className={styles.botInputRow} role="group" aria-label="Type a message">
        <label htmlFor="bot-input" className={styles.srOnly}>Type your message</label>
        <input
          id="bot-input"
          ref={inputRef}
          className={styles.botInp}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question…"
          disabled={typing}
          aria-disabled={typing}
          aria-label="Chat message input"
          autoComplete="off"
        />
        <button
          className={styles.botSend}
          onClick={() => send()}
          disabled={typing || !input.trim()}
          aria-label="Send message"
          aria-disabled={typing || !input.trim()}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main Contact Client ── */
export default function ContactClient() {
  return (
    <div className={styles.ctRoot}>
      {/* ✅ ACCESSIBILITY FIX: decorative orbs hidden from screen readers */}
      <div className={styles.bgOrbs} aria-hidden="true">
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
      </div>

      <div className={styles.ctWrap}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className={styles.ctBadge}>Get In Touch</span>
          <h1 className={styles.ctTitle}>Contact <span className={styles.ctTitleAccent}>AIDLA</span></h1>
          <p className={styles.ctDesc}>Have questions, suggestions, or partnership inquiries? We would love to hear from you.</p>
        </motion.div>

        <div className={styles.ctGrid}>
          {/* ✅ ACCESSIBILITY FIX: <section> with aria-label instead of bare <div> */}
          <motion.section
            className={styles.ctCard}
            aria-label="Send a message"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <div className={styles.ctCardHd}>
              <div className={styles.ctCardIcon} aria-hidden="true">@</div>
              <h2 className={styles.ctCardTitle}>Send a Message</h2>
            </div>
            <ContactForm />
          </motion.section>

          <motion.section
            className={styles.ctCard}
            aria-label="Official contact information"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          >
            <div className={styles.ctCardHd}>
              <div className={styles.ctCardIcon} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }} aria-hidden="true">i</div>
              <h2 className={styles.ctCardTitle}>Official Contact</h2>
            </div>
            <div className={styles.ctCardBody}>
              {/* ✅ ACCESSIBILITY FIX: <dl> (description list) is semantic for label/value pairs */}
              <dl>
                {[
                  { icon: "@", label: "Email",         val: "support@aidla.online" },
                  { icon: "W", label: "Platform",      val: "AIDLA Learning & Rewards" },
                  { icon: "T", label: "Response Time", val: "Within 24–48 hours" },
                  { icon: "H", label: "Support Hours", val: "Daily, 9 AM – 9 PM" },
                ].map(item => (
                  <div key={item.label} className={styles.ctInfoRow}>
                    <div className={styles.ctInfoIcon} aria-hidden="true">{item.icon}</div>
                    <div>
                      <dt className={styles.ctInfoLbl}>{item.label}</dt>
                      <dd className={styles.ctInfoVal}>{item.val}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </motion.section>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <HelpBot />
        </motion.div>
      </div>
    </div>
  );
}