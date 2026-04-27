"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./leaderboard.module.css";

/* ── Helpers ── */
function fmtTime(ms) {
  if (!ms) return "—";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtCoins(val) {
  const n = Number(val);
  if (!n && n !== 0) return null;
  return Math.floor(n).toLocaleString();
}

function fmtDrawPrize(r) {
  const coins = Number(r.coins_amount);
  if (coins > 0) return `🪙 ${fmtCoins(coins)}`;
  if (r.prize_text) {
    const numMatch = r.prize_text.trim().match(/^([\d.]+)(\s*coins?)?$/i);
    if (numMatch) return `🪙 ${fmtCoins(numMatch[1])}`;
    return `🎁 ${r.prize_text}`;
  }
  return "Prize";
}

function rankEmoji(r) {
  if (r === 1) return "🥇";
  if (r === 2) return "🥈";
  if (r === 3) return "🥉";
  return `#${r}`;
}

function RankBadge({ rank }) {
  const cls = rank === 1 ? styles.r1 : rank === 2 ? styles.r2 : rank === 3 ? styles.r3 : styles.rn;
  const label = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
  return <div className={`${styles.rankBadge} ${cls}`}>{label}</div>;
}

function SkeletonRows({ n = 5 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={i} className={styles.rankRow}>
      <div className={styles.skelBg} style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0 }} />
      <div>
        <div className={styles.skelBg} style={{ height: 13, width: 120, marginBottom: 5 }} />
        <div className={styles.skelBg} style={{ height: 10, width: 70 }} />
      </div>
      <div className={styles.skelBg} style={{ height: 18, width: 40 }} />
      <div className={styles.skelBg} style={{ height: 12, width: 36 }} />
    </div>
  ));
}

/* ── Live Leaderboard ── */
function LiveLeaderboard() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const channelRef = useRef(null);
  const prevPositions = useRef({});

  useEffect(() => {
    supabase
      .from("test_tests")
      .select("id,title,status")
      .not("status", "in", '("finished","out")')
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setError(error.message); setLoading(false); return; }
        const list = data || [];
        setTests(list);
        if (list.length > 0) setSelectedTest(list[0]);
        else setLoading(false);
      });
  }, []);

  const fetchRows = useCallback(async (testId) => {
    const { data, error } = await supabase
      .from("test_leaderboard")
      .select("user_id,user_name,score,correct_count,total_time_ms,status")
      .eq("test_id", testId)
      .order("score", { ascending: false })
      .order("total_time_ms", { ascending: true });
    if (error) { setError(error.message); return; }
    const newPos = {};
    (data || []).forEach((r, i) => { newPos[r.user_id] = i; });
    prevPositions.current = newPos;
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!selectedTest) return;
    setLoading(true); setError("");
    fetchRows(selectedTest.id);
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase
      .channel(`lb-live:${selectedTest.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "test_leaderboard",
        filter: `test_id=eq.${selectedTest.id}`,
      }, () => fetchRows(selectedTest.id))
      .subscribe();
    channelRef.current = ch;
    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    };
  }, [selectedTest, fetchRows]);

  const getMove = (userId, idx) => {
    const prev = prevPositions.current[userId];
    if (prev === undefined || prev === idx) return null;
    return prev > idx ? "up" : "down";
  };

  if (!loading && tests.length === 0 && !error) {
    return (
      <div className={styles.lbSection}>
        <div className={styles.lbSectionHeader}>
          <h3 className={styles.lbSectionTitle}>
            🏁 Live Leaderboard
            <span className={styles.liveBadge}><span className={styles.liveDot} />Live</span>
          </h3>
        </div>
        <div className={styles.lbEmpty}>
          <span className={styles.lbEmptyIcon}>🏁</span>
          No live tests running right now. Check back soon!
        </div>
      </div>
    );
  }

  return (
    <div className={styles.lbSection}>
      <div className={styles.lbSectionHeader}>
        <h3 className={styles.lbSectionTitle}>
          🏁 Live Leaderboard
          <span className={styles.liveBadge}><span className={styles.liveDot} />Live</span>
        </h3>
      </div>
      {tests.length > 1 && (
        <div className={styles.testSelector}>
          {tests.map(t => (
            <button key={t.id}
              className={`${styles.testPill} ${selectedTest?.id === t.id ? styles.active : ""}`}
              onClick={() => setSelectedTest(t)}>
              {t.title || "Untitled Test"}
            </button>
          ))}
        </div>
      )}
      {selectedTest && <div className={styles.eventStrip}>📋 {selectedTest.title || "Untitled Test"}</div>}
      {error && <div className={styles.lbError}>{error}</div>}
      <ul className={styles.rankList}>
        {loading ? <SkeletonRows n={5} /> :
          rows.length === 0 ? (
            <li className={styles.lbEmpty}>
              <span className={styles.lbEmptyIcon}>⏳</span>
              Waiting for participants to join...
            </li>
          ) : (
            <AnimatePresence initial={false}>
              {rows.map((r, i) => {
                const move = getMove(r.user_id, i);
                return (
                  <motion.li key={r.user_id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`${styles.rankRow} ${styles[`rank${i + 1}`] || ""} ${move === "up" ? styles.movedUp : move === "down" ? styles.movedDown : ""}`}
                  >
                    <RankBadge rank={i + 1} />
                    <div>
                      <div className={styles.rankName}>{r.user_name}</div>
                      <div className={styles.rankSub}>{r.correct_count} correct · {r.status === "finished" ? "Finished" : "In Progress"}</div>
                    </div>
                    <div>
                      <div className={styles.rankScore}>{r.score}</div>
                      <div className={styles.rankScoreLabel}>pts</div>
                    </div>
                    <div className={styles.rankTime}>{fmtTime(r.total_time_ms)}</div>
                    {move && <span className={`${styles.rankArrow} ${move === "up" ? styles.up : styles.down}`}>{move === "up" ? "▲" : "▼"}</span>}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          )}
      </ul>
    </div>
  );
}

/* ── Test Results ── */
function TestResults() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("test_tests").select("id,title")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = data || [];
        setTests(list);
        if (list.length > 0) setSelectedTest(list[0]);
        else setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedTest) return;
    setLoading(true); setError("");
    supabase.from("test_winners").select("*")
      .eq("test_id", selectedTest.id)
      .order("rank_no", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setWinners(data || []);
        setLoading(false);
      });
  }, [selectedTest]);

  const rankCardClass = (r) => {
    if (r === 1) return `${styles.winnerCard} ${styles.rank1Card}`;
    if (r === 2) return `${styles.winnerCard} ${styles.rank2Card}`;
    if (r === 3) return `${styles.winnerCard} ${styles.rank3Card}`;
    return styles.winnerCard;
  };

  return (
    <div className={styles.lbSection}>
      <div className={styles.lbSectionHeader}>
        <h3 className={styles.lbSectionTitle}>🏆 Test Results</h3>
      </div>
      {tests.length > 0 && (
        <div className={styles.testSelector}>
          {tests.map(t => (
            <button key={t.id}
              className={`${styles.testPill} ${selectedTest?.id === t.id ? styles.active : ""}`}
              onClick={() => setSelectedTest(t)}>
              {t.title || "Untitled Test"}
            </button>
          ))}
        </div>
      )}
      {selectedTest && <div className={styles.eventStrip}>📋 {selectedTest.title || "Untitled Test"}</div>}
      {error && <div className={styles.lbError}>{error}</div>}
      {loading ? (
        <div style={{ padding: "20px 28px", display: "flex", gap: 12 }}>
          {[1, 2, 3].map(n => <div key={n} style={{ flex: 1 }}><div className={styles.skelBg} style={{ height: 130, borderRadius: 18 }} /></div>)}
        </div>
      ) : winners.length === 0 ? (
        <div className={styles.lbEmpty}>
          <span className={styles.lbEmptyIcon}>🏆</span>
          No winners announced yet for this test.
        </div>
      ) : (
        <div className={styles.winnersGrid}>
          {winners.map((w, i) => (
            <motion.div key={w.id} className={rankCardClass(w.rank_no)}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <span className={styles.winnerEmoji}>{rankEmoji(w.rank_no)}</span>
              <div className={styles.winnerRankLabel}>Rank #{w.rank_no}</div>
              <div className={styles.winnerName}>{w.user_name}</div>
              <div className={styles.winnerEvent}>📋 {selectedTest?.title || "Test"}</div>
              {w.prize_text && <div className={styles.winnerPrize}>🎁 {w.prize_text}</div>}
              {Number(w.coins_amount) > 0 && (
                <div className={`${styles.winnerPrize} ${styles.winnerPrizeBlue}`}>
                  🪙 {fmtCoins(w.coins_amount)} coins
                </div>
              )}
              {w.note && <div className={styles.winnerNote}>{w.note}</div>}
              <div className={styles.winnerDate}>{fmtDate(w.approved_at)}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Lucky Draw Results ── */
function LuckyDrawResults() {
  const [draws, setDraws] = useState([]);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("luckydraw_results").select("draw_id,draw_title")
      .order("announced_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setError(error.message); setLoading(false); return; }
        const seen = new Set();
        const unique = (data || []).filter(d => {
          if (seen.has(d.draw_id)) return false;
          seen.add(d.draw_id); return true;
        });
        setDraws(unique);
        if (unique.length > 0) setSelectedDraw(unique[0]);
        else setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDraw) return;
    setLoading(true); setError("");
    supabase.from("luckydraw_results").select("*")
      .eq("draw_id", selectedDraw.draw_id)
      .order("seq_no", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setResults(data || []);
        setLoading(false);
      });
  }, [selectedDraw]);

  return (
    <div className={styles.lbSection}>
      <div className={styles.lbSectionHeader}>
        <h3 className={styles.lbSectionTitle}>🎰 Lucky Draw Results</h3>
      </div>
      {draws.length > 0 && (
        <div className={styles.drawSelector}>
          {draws.map(d => (
            <button key={d.draw_id}
              className={`${styles.testPill} ${selectedDraw?.draw_id === d.draw_id ? styles.active : ""}`}
              onClick={() => setSelectedDraw(d)}>
              {d.draw_title || "Draw"}
            </button>
          ))}
        </div>
      )}
      {selectedDraw && <div className={styles.eventStrip}>🎰 {selectedDraw.draw_title || "Lucky Draw"}</div>}
      {error && <div className={styles.lbError}>{error}</div>}
      {loading ? (
        <div style={{ padding: "12px 0" }}><SkeletonRows n={4} /></div>
      ) : results.length === 0 ? (
        <div className={styles.lbEmpty}>
          <span className={styles.lbEmptyIcon}>🎰</span>
          No lucky draw results yet.
        </div>
      ) : results.map((r, i) => (
        <motion.div key={r.id} className={styles.resultRow}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}>
          <div className={styles.resultSeq}>{r.seq_no}</div>
          <div className={styles.resultInfo}>
            <div className={styles.resultName}>{r.winner_name}</div>
            <div className={styles.resultSub}>
              🎰 {r.draw_title || selectedDraw?.draw_title || "Lucky Draw"} · {fmtDate(r.announced_at)}
            </div>
          </div>
          <div className={`${styles.resultPrize} ${styles.gold}`}>{fmtDrawPrize(r)}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Lucky Wheel History ── */
function LuckyWheelHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: wheelData, error: wheelErr } = await supabase
        .from("luckywheel_history")
        .select("id,user_id,created_at,result_type,coins_won,entry_type")
        .neq("result_type", "try_again_free")
        .order("created_at", { ascending: false })
        .limit(50);
      if (wheelErr) { setError(wheelErr.message); setLoading(false); return; }
      if (!wheelData || wheelData.length === 0) { setResults([]); setLoading(false); return; }
      const userIds = [...new Set(wheelData.map(r => r.user_id))];
      const { data: profileData } = await supabase
        .from("users_profiles").select("user_id,id,full_name").in("user_id", userIds);
      const nameMap = {};
      (profileData || []).forEach(p => { const key = p.user_id || p.id; if (key) nameMap[key] = p.full_name; });
      setResults(wheelData.map(r => ({ ...r, full_name: nameMap[r.user_id] || "—" })));
      setLoading(false);
    };
    load();
  }, []);

  const resultLabel = (type) => {
    if (type === "coins") return "🪙 Coins";
    if (type === "gift") return "🎁 Gift";
    if (type === "plus1_chance") return "➕ Bonus Spin";
    return type;
  };
  const wheelIcon = (type) => {
    if (type === "coins") return "🪙";
    if (type === "gift") return "🎁";
    if (type === "plus1_chance") return "🔄";
    return "🎡";
  };

  return (
    <div className={styles.lbSection}>
      <div className={styles.lbSectionHeader}>
        <h3 className={styles.lbSectionTitle}>🎡 Lucky Wheel Winners</h3>
        <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Last 50 wins</span>
      </div>
      <div className={styles.eventStrip}>🎡 Lucky Wheel</div>
      {error && <div className={styles.lbError}>{error}</div>}
      {loading ? (
        <div style={{ padding: "12px 0" }}><SkeletonRows n={5} /></div>
      ) : results.length === 0 ? (
        <div className={styles.lbEmpty}>
          <span className={styles.lbEmptyIcon}>🎡</span>
          No lucky wheel wins yet.
        </div>
      ) : results.map((r, i) => (
        <motion.div key={r.id} className={styles.resultRow}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.4) }}>
          <div className={styles.resultIcon}>{wheelIcon(r.result_type)}</div>
          <div className={styles.resultInfo}>
            <div className={styles.resultName}>{r.full_name || "—"}</div>
            <div className={styles.resultSub}>
              🎡 Lucky Wheel · {fmtDate(r.created_at)} · {r.entry_type === "paid" ? "Paid Spin" : "Free Spin"}
            </div>
          </div>
          <div className={`${styles.resultPrize} ${styles.blue}`}>
            {resultLabel(r.result_type)}
            {r.result_type === "coins" && Number(r.coins_won) > 0 ? ` · ${fmtCoins(r.coins_won)}` : ""}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Tabs ── */
const TABS = [
  { id: "live", label: "🏁 Live Board" },
  { id: "results", label: "🏆 Test Results" },
  { id: "draw", label: "🎰 Lucky Draw" },
  { id: "wheel", label: "🎡 Lucky Wheel" },
];

export default function LeaderboardClient() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className={styles.lbRoot}>
      <div className={styles.bgOrbs}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
      </div>
      <div className={styles.lbContainer}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className={styles.secLabel}>Community</span>
          <h1 className={styles.secTitle}>AIDLA <span>Leaderboard</span></h1>
          <p className={styles.secDesc}>Celebrate our top learners, test champions, lucky draw winners, and lucky wheel winners.</p>
        </motion.div>
        <motion.div className={styles.lbTabs} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${styles.lbTab} ${activeTab === t.id ? styles.active : ""}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {activeTab === "live" && <LiveLeaderboard />}
            {activeTab === "results" && <TestResults />}
            {activeTab === "draw" && <LuckyDrawResults />}
            {activeTab === "wheel" && <LuckyWheelHistory />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}