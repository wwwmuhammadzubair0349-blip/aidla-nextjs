"use client";
// app/user/notifications/page.jsx — Notification Center

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const TYPE_ICONS = {
  coins:       "🪙",
  rank:        "📈",
  content:     "📰",
  reply:       "💬",
  quiz:        "📝",
  certificate: "🎓",
  battle:      "⚔️",
  system:      "🔔",
  info:        "ℹ️",
};

const CSS = `
.nc-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
.nc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.nc-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; color: #0f172a; }
.nc-mark-btn { background: none; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 6px 14px; color: #64748b; font-size: 0.76rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.nc-mark-btn:hover { border-color: #1a3a8f; color: #1a3a8f; }
.nc-group-label { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin: 20px 0 8px; }
.nc-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px; border-radius: 12px; border: 1px solid #f1f5f9;
  background: #fff; margin-bottom: 6px; cursor: pointer; transition: all 0.15s;
  text-decoration: none; color: inherit;
}
.nc-item.unread { background: #f0f4ff; border-color: rgba(26,58,143,0.12); }
.nc-item:hover { box-shadow: 0 4px 14px rgba(15,23,42,0.08); border-color: #cbd5e1; }
.nc-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 1px; }
.nc-body { flex: 1; min-width: 0; }
.nc-notif-title { font-size: 0.87rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; line-height: 1.35; }
.nc-notif-body { font-size: 0.78rem; color: #475569; margin-bottom: 3px; line-height: 1.4; }
.nc-notif-time { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
.nc-unread-dot { width: 7px; height: 7px; border-radius: 50%; background: #1a3a8f; flex-shrink: 0; margin-top: 6px; }
.nc-empty { text-align: center; padding: 56px 20px; }
.nc-empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
.nc-empty-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.nc-empty-sub { font-size: 0.84rem; color: #64748b; }
.nc-spinner { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #e2e8f0; border-top-color: #1a3a8f; animation: nc-spin 0.6s linear infinite; margin: 48px auto; }
@keyframes nc-spin { to { transform: rotate(360deg); } }
`;

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByTime(items) {
  const today     = [];
  const yesterday = [];
  const week      = [];
  const older     = [];
  const now = Date.now();
  for (const n of items) {
    const age = now - new Date(n.created_at).getTime();
    if      (age < 86400000)       today.push(n);
    else if (age < 172800000)      yesterday.push(n);
    else if (age < 86400000 * 7)   week.push(n);
    else                           older.push(n);
  }
  return [
    { label: "Today",     items: today },
    { label: "Yesterday", items: yesterday },
    { label: "This Week", items: week },
    { label: "Older",     items: older },
  ].filter(g => g.items.length > 0);
}

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId,  setUserId]  = useState(null);

  useEffect(() => {
    let channel;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      setUserId(uid);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(60);
      setNotifs(data || []);
      setLoading(false);

      // Realtime: prepend new notifications as they arrive
      channel = supabase
        .channel(`notifs:${uid}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${uid}`,
        }, payload => {
          setNotifs(prev => [payload.new, ...prev]);
        })
        .subscribe();
    })();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const markRead = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllRead = async () => {
    if (!userId) return;
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true })
      .eq("user_id", userId).eq("is_read", false);
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;
  const groups = groupByTime(notifs);

  return (
    <div className="nc-wrap">
      <style>{CSS}</style>
      <div className="nc-header">
        <div className="nc-title">Notifications {unreadCount > 0 && <span style={{ fontSize: "0.8rem", background: "#1a3a8f", color: "#fff", borderRadius: 20, padding: "2px 8px", marginLeft: 8, verticalAlign: "middle" }}>{unreadCount}</span>}</div>
        {unreadCount > 0 && (
          <button className="nc-mark-btn" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      {loading && <div className="nc-spinner" />}

      {!loading && notifs.length === 0 && (
        <div className="nc-empty">
          <span className="nc-empty-icon">🔔</span>
          <div className="nc-empty-title">No notifications yet</div>
          <div className="nc-empty-sub">You'll be notified about coins, rank changes, quiz results, and more.</div>
        </div>
      )}

      {!loading && groups.map(g => (
        <div key={g.label}>
          <div className="nc-group-label">{g.label}</div>
          {g.items.map(n => (
            <div
              key={n.id}
              className={`nc-item${!n.is_read ? " unread" : ""}`}
              onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
              role={n.link ? "link" : "article"}
              tabIndex={0}
            >
              <span className="nc-icon" aria-hidden="true">{TYPE_ICONS[n.type] || TYPE_ICONS.info}</span>
              <div className="nc-body">
                <div className="nc-notif-title">{n.title}</div>
                {n.body && <div className="nc-notif-body">{n.body}</div>}
                <div className="nc-notif-time">{timeAgo(n.created_at)}</div>
              </div>
              {!n.is_read && <div className="nc-unread-dot" aria-label="Unread" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
