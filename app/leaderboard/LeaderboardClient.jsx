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

function getDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
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

// ✅ ACCESSIBILITY FIX: Added aria-label for screen readers
function RankBadge({ rank }) {
  const cls = rank === 1 ? styles.r1 : rank === 2 ? styles.r2 : rank === 3 ? styles.r3 : styles.rn;
  const label = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
  const ariaLabel = rank <= 3 ? `Rank ${rank}` : `#${rank}`;
  return (
    <div className={`${styles.rankBadge} ${cls}`} aria-label={ariaLabel} role="img">
      {label}
    </div>
  );
}

function SkeletonRows({ n = 5 }) {
  return Array.from({ length: n }).map((_, i) => (
    // ✅ ACCESSIBILITY FIX: Added role and aria-label for skeleton loaders
    <div key={i} className={styles.rankRow} role="status" aria-label="Loading...">
      <div className={styles.skelBg} style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0 }} aria-hidden="true" />
      <div>
        <div className={styles.skelBg} style={{ height: 13, width: 120, marginBottom: 5 }} aria-hidden="true" />
        <div className={styles.skelBg} style={{ height: 10, width: 70 }} aria-hidden="true" />
      </div>
      <div className={styles.skelBg} style={{ height: 18, width: 40 }} aria-hidden="true" />
      <div className={styles.skelBg} style={{ height: 12, width: 36 }} aria-hidden="true" />
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
      <section className={styles.lbSection} aria-label="Live Leaderboard">
        <div className={styles.lbSectionHeader}>
          <h2 className={styles.lbSectionTitle}>
            <span aria-hidden="true">🏁</span> Live Leaderboard
            <span className={styles.liveBadge} role="status" aria-live="polite">
              <span className={styles.liveDot} aria-hidden="true" />Live
            </span>
          </h2>
        </div>
        <div className={styles.lbEmpty} role="status">
          <span className={styles.lbEmptyIcon} aria-hidden="true">🏁</span>
          No live tests running right now. Check back soon!
        </div>
      </section>
    );
  }

  return (
    <section className={styles.lbSection} aria-label="Live Leaderboard">
      <div className={styles.lbSectionHeader}>
        <h2 className={styles.lbSectionTitle}>
          <span aria-hidden="true">🏁</span> Live Leaderboard
          <span className={styles.liveBadge} role="status" aria-live="polite">
            <span className={styles.liveDot} aria-hidden="true" />Live
          </span>
        </h2>
      </div>
      {tests.length > 1 && (
        // ✅ ACCESSIBILITY FIX: role="group" with label for pill selectors
        <div className={styles.testSelector} role="group" aria-label="Select a test">
          {tests.map(t => (
            <button key={t.id}
              className={`${styles.testPill} ${selectedTest?.id === t.id ? styles.active : ""}`}
              onClick={() => setSelectedTest(t)}
              aria-pressed={selectedTest?.id === t.id}>
              {t.title || "Untitled Test"}
            </button>
          ))}
        </div>
      )}
      {selectedTest && (
        <div className={styles.eventStrip} aria-label={`Current test: ${selectedTest.title}`}>
          <span aria-hidden="true">📋</span> {selectedTest.title || "Untitled Test"}
        </div>
      )}
      {error && <div className={styles.lbError} role="alert">{error}</div>}
      {/* ✅ ACCESSIBILITY FIX: ol instead of ul for ordered rankings */}
      <ol className={styles.rankList} aria-label="Live leaderboard rankings" aria-live="polite">
        {loading ? <SkeletonRows n={5} /> :
          rows.length === 0 ? (
            <li className={styles.lbEmpty} role="status">
              <span className={styles.lbEmptyIcon} aria-hidden="true">⏳</span>
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
                    aria-label={`Rank ${i + 1}: ${r.user_name}, ${r.score} points, ${r.correct_count} correct`}
                  >
                    <RankBadge rank={i + 1} />
                    <div>
                      <div className={styles.rankName}>{r.user_name}</div>
                      <div className={styles.rankSub} aria-label={`${r.correct_count} correct answers, ${r.status === "finished" ? "finished" : "in progress"}`}>
                        {r.correct_count} correct · {r.status === "finished" ? "Finished" : "In Progress"}
                      </div>
                    </div>
                    <div aria-label={`${r.score} points`}>
                      <div className={styles.rankScore}>{r.score}</div>
                      <div className={styles.rankScoreLabel} aria-hidden="true">pts</div>
                    </div>
                    <div className={styles.rankTime} aria-label={`Time: ${fmtTime(r.total_time_ms)}`}>{fmtTime(r.total_time_ms)}</div>
                    {move && (
                      <span
                        className={`${styles.rankArrow} ${move === "up" ? styles.up : styles.down}`}
                        aria-label={move === "up" ? "Moved up" : "Moved down"}
                      >
                        {move === "up" ? "▲" : "▼"}
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          )}
      </ol>
    </section>
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
    <section className={styles.lbSection} aria-label="Test Results">
      <div className={styles.lbSectionHeader}>
        <h2 className={styles.lbSectionTitle}><span aria-hidden="true">🏆</span> Test Results</h2>
        <Link href="/user/test" className={styles.sectionLink}>Register now →</Link>
      </div>
      {tests.length > 0 && (
        <div className={styles.testSelector} role="group" aria-label="Select a test">
          {tests.map(t => (
            <button key={t.id}
              className={`${styles.testPill} ${selectedTest?.id === t.id ? styles.active : ""}`}
              onClick={() => setSelectedTest(t)}
              aria-pressed={selectedTest?.id === t.id}>
              {t.title || "Untitled Test"}
            </button>
          ))}
        </div>
      )}
      {selectedTest && (
        <div className={styles.eventStrip}>
          <span aria-hidden="true">📋</span> {selectedTest.title || "Untitled Test"}
        </div>
      )}
      {error && <div className={styles.lbError} role="alert">{error}</div>}
      {loading ? (
        <div style={{ padding: "20px 28px", display: "flex", gap: 12 }} role="status" aria-label="Loading results">
          {[1, 2, 3].map(n => <div key={n} style={{ flex: 1 }}><div className={styles.skelBg} style={{ height: 130, borderRadius: 18 }} aria-hidden="true" /></div>)}
        </div>
      ) : winners.length === 0 ? (
        <div className={styles.lbEmpty} role="status">
          <span className={styles.lbEmptyIcon} aria-hidden="true">🏆</span>
          No winners announced yet for this test.
        </div>
      ) : (
        <div className={styles.winnersGrid}>
          {winners.map((w, i) => (
            <motion.article key={w.id} className={rankCardClass(w.rank_no)}
              aria-label={`Rank ${w.rank_no}: ${w.user_name}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <span className={styles.winnerEmoji} aria-hidden="true">{rankEmoji(w.rank_no)}</span>
              <div className={styles.winnerRankLabel}>Rank #{w.rank_no}</div>
              <div className={styles.winnerName}>{w.user_name}</div>
              <div className={styles.winnerEvent}><span aria-hidden="true">📋</span> {selectedTest?.title || "Test"}</div>
              {w.prize_text && <div className={styles.winnerPrize}><span aria-hidden="true">🎁</span> {w.prize_text}</div>}
              {Number(w.coins_amount) > 0 && (
                <div className={`${styles.winnerPrize} ${styles.winnerPrizeBlue}`}>
                  <span aria-hidden="true">🪙</span> {fmtCoins(w.coins_amount)} coins
                </div>
              )}
              {w.note && <div className={styles.winnerNote}>{w.note}</div>}
              <time className={styles.winnerDate} dateTime={w.approved_at}>{fmtDate(w.approved_at)}</time>
            </motion.article>
          ))}
        </div>
      )}
    </section>
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
    <section className={styles.lbSection} aria-label="Lucky Draw Results">
      <div className={styles.lbSectionHeader}>
        <h2 className={styles.lbSectionTitle}><span aria-hidden="true">🎰</span> Lucky Draw Results</h2>
        <Link href="/user/lucky-draw" className={styles.sectionLink}>Draw now →</Link>
      </div>
      {draws.length > 0 && (
        <div className={styles.drawSelector} role="group" aria-label="Select a draw">
          {draws.map(d => (
            <button key={d.draw_id}
              className={`${styles.testPill} ${selectedDraw?.draw_id === d.draw_id ? styles.active : ""}`}
              onClick={() => setSelectedDraw(d)}
              aria-pressed={selectedDraw?.draw_id === d.draw_id}>
              {d.draw_title || "Draw"}
            </button>
          ))}
        </div>
      )}
      {selectedDraw && (
        <div className={styles.eventStrip}>
          <span aria-hidden="true">🎰</span> {selectedDraw.draw_title || "Lucky Draw"}
        </div>
      )}
      {error && <div className={styles.lbError} role="alert">{error}</div>}
      {loading ? (
        <div style={{ padding: "12px 0" }} role="status" aria-label="Loading results"><SkeletonRows n={4} /></div>
      ) : results.length === 0 ? (
        <div className={styles.lbEmpty} role="status">
          <span className={styles.lbEmptyIcon} aria-hidden="true">🎰</span>
          No lucky draw results yet.
        </div>
      ) : results.map((r, i) => (
        <motion.div key={r.id} className={styles.resultRow}
          aria-label={`Winner ${r.seq_no}: ${r.winner_name}`}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}>
          <div className={styles.resultSeq} aria-hidden="true">{r.seq_no}</div>
          <div className={styles.resultInfo}>
            <div className={styles.resultName}>{r.winner_name}</div>
            <div className={styles.resultSub}>
              <span aria-hidden="true">🎰</span> {r.draw_title || selectedDraw?.draw_title || "Lucky Draw"} · <time dateTime={r.announced_at}>{fmtDate(r.announced_at)}</time>
            </div>
          </div>
          <div className={`${styles.resultPrize} ${styles.gold}`}>{fmtDrawPrize(r)}</div>
        </motion.div>
      ))}
    </section>
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
        .limit(10);
      if (wheelErr) { setError(wheelErr.message); setLoading(false); return; }
      if (!wheelData || wheelData.length === 0) { setResults([]); setLoading(false); return; }
      const userIds = [...new Set(wheelData.map(r => r.user_id).filter(Boolean))];
      if (userIds.length === 0) { setResults(wheelData.map(r => ({ ...r, full_name: "—" }))); setLoading(false); return; }
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
    <section className={styles.lbSection} aria-label="Spin and Win Results">
      <div className={styles.lbSectionHeader}>
        <h2 className={styles.lbSectionTitle}><span aria-hidden="true">🎡</span> Spin &amp; Win</h2>
        <Link href="/user/lucky-wheel" className={styles.sectionLink}>Spin now →</Link>
      </div>
      <div className={styles.eventStrip}><span aria-hidden="true">🎡</span> Latest 10 Spin &amp; Win results</div>
      {error && <div className={styles.lbError} role="alert">{error}</div>}
      {loading ? (
        <div style={{ padding: "12px 0" }} role="status" aria-label="Loading results"><SkeletonRows n={5} /></div>
      ) : results.length === 0 ? (
        <div className={styles.lbEmpty} role="status">
          <span className={styles.lbEmptyIcon} aria-hidden="true">🎡</span>
          No Spin &amp; Win results yet.
        </div>
      ) : results.map((r, i) => (
        <motion.div key={r.id} className={styles.resultRow}
          aria-label={`${r.full_name} won ${resultLabel(r.result_type)}`}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.4) }}>
          <div className={styles.resultIcon} aria-hidden="true">{wheelIcon(r.result_type)}</div>
          <div className={styles.resultInfo}>
            <div className={styles.resultName}>{r.full_name || "—"}</div>
            <div className={styles.resultSub}>
              <span aria-hidden="true">🎡</span> Spin &amp; Win · <time dateTime={r.created_at}>{fmtDate(r.created_at)}</time> · {r.entry_type === "paid" ? "Paid Spin" : "Free Spin"}
            </div>
          </div>
          <div className={`${styles.resultPrize} ${styles.blue}`}>
            {resultLabel(r.result_type)}
            {r.result_type === "coins" && Number(r.coins_won) > 0 ? ` · ${fmtCoins(r.coins_won)}` : ""}
          </div>
        </motion.div>
      ))}
    </section>
  );
}

/* ── Tabs ── */
const TABS = [
  { id: "live",    label: "🏁 Live Board"   },
  { id: "daily",   label: "🧠 Daily Quiz"   },
  { id: "battle",  label: "⚔️ Battle"       },
  { id: "results", label: "🏆 Test Results" },
  { id: "draw",    label: "🎰 Lucky Draw"   },
  { id: "wheel",   label: "Spin & Win"  },
];

export default function LeaderboardClient() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className={styles.lbRoot}>
      <div className={styles.bgOrbs} aria-hidden="true">
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
      </div>
      <div className={styles.lbContainer}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className={styles.secLabel}>Community</span>
          {/* ✅ ACCESSIBILITY FIX: h1 is the page title */}
          <h1 className={styles.secTitle}>AIDLA <span>Leaderboard</span></h1>
          <p className={styles.secDesc}>Daily quiz results, battle champions, test winners, lucky draw and wheel winners.</p>
        </motion.div>

        {/* ✅ ACCESSIBILITY FIX: nav + role="tablist" for proper tab semantics */}
        <nav aria-label="Leaderboard sections">
          <motion.div
            className={styles.lbTabs}
            role="tablist"
            aria-label="Leaderboard sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {TABS.map(t => (
              <button key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={activeTab === t.id}
                aria-controls={`panel-${t.id}`}
                className={`${styles.lbTab} ${activeTab === t.id ? styles.active : ""}`}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </motion.div>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "live"    && <LiveLeaderboard />}
            {activeTab === "daily"   && <DailyQuizResults />}
            {activeTab === "battle"  && <BattleLeaderboard />}
            {activeTab === "results" && <TestResults />}
            {activeTab === "draw"    && <LuckyDrawResults />}
            {activeTab === "wheel"   && <LuckyWheelHistory />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DailyQuizResults() {
  const [data, setData] = useState({ winners: [], all_attempts: [], winner_date: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      const yDate = getDateKey(-1);
      const today = getDateKey(0);
      const [wRes, tRes] = await Promise.all([
        supabase.rpc("daily_quiz_leaderboard", { p_date: yDate }),
        supabase.rpc("daily_quiz_leaderboard", { p_date: today }),
      ]);
      if (wRes.error || tRes.error) setError(wRes.error?.message || tRes.error?.message);
      setData({
        winners: wRes.data?.winners || [],
        all_attempts: tRes.data?.all_attempts || [],
        winner_date: yDate,
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section className={styles.lbSection} aria-label="Daily Quiz Results">
      <div className={styles.lbSectionHeader}>
        <h2 className={styles.lbSectionTitle}><span aria-hidden="true">🧠</span> Daily Quiz Results</h2>
        <Link href="/user/dailyquizz" className={styles.sectionLink}>Play quiz →</Link>
      </div>
      <div className={styles.eventStrip}><span aria-hidden="true">🏆</span> Yesterday winners {data.winner_date ? `· ${data.winner_date}` : ""}</div>
      {error && <div className={styles.lbError} role="alert">{error}</div>}
      {loading ? (
        <div style={{ padding: "12px 0" }} role="status" aria-label="Loading daily quiz results"><SkeletonRows n={5} /></div>
      ) : (
        <>
          {data.winners.length === 0 ? (
            <div className={styles.lbEmpty} role="status"><span className={styles.lbEmptyIcon} aria-hidden="true">🏆</span>No daily quiz winners yet.</div>
          ) : data.winners.map((w, i) => (
            <motion.div key={`${w.user_id}-${i}`} className={styles.resultRow}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <div className={styles.resultSeq} aria-hidden="true">{w.rank || i + 1}</div>
              <div className={styles.resultInfo}>
                <div className={styles.resultName}>{w.full_name || "AIDLA Learner"}</div>
                <div className={styles.resultSub}>{w.score}/{w.total_questions} correct {w.streak_days >= 3 ? `· 🔥 ${w.streak_days}` : ""}</div>
              </div>
              <div className={`${styles.resultPrize} ${styles.gold}`}>+{fmtCoins(w.coins_earned || 0)} coins</div>
            </motion.div>
          ))}
        </>
      )}
    </section>
  );
}

function BattleLeaderboard() {
  const [period, setPeriod] = useState("daily");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.rpc("battle_leaderboard", { p_period: period }).then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error.message);
      setRows(data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [period]);

  return (
    <section className={styles.lbSection} aria-label="Battle Leaderboard">
      <div className={styles.lbSectionHeader}>
        <h2 className={styles.lbSectionTitle}><span aria-hidden="true">⚔️</span> Battle Leaderboard</h2>
        <Link href="/user/battle" className={styles.sectionLink}>Start battle →</Link>
      </div>
      <div className={styles.testSelector} role="group" aria-label="Battle leaderboard period">
        {["daily", "weekly", "monthly"].map(p => (
          <button key={p} className={`${styles.testPill} ${period === p ? styles.active : ""}`} onClick={() => { setLoading(true); setError(""); setPeriod(p); }} aria-pressed={period === p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <div className={styles.eventStrip}><span aria-hidden="true">⚔️</span> Top 1v1 battle champions</div>
      {error && <div className={styles.lbError} role="alert">{error}</div>}
      {loading ? (
        <div style={{ padding: "12px 0" }} role="status" aria-label="Loading battle leaderboard"><SkeletonRows n={5} /></div>
      ) : rows.length === 0 ? (
        <div className={styles.lbEmpty} role="status"><span className={styles.lbEmptyIcon} aria-hidden="true">⚔️</span>No battle data yet.</div>
      ) : rows.slice(0, 20).map((r, i) => (
        <motion.div key={`${r.user_id || r.full_name}-${i}`} className={styles.resultRow}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
          <div className={styles.resultSeq} aria-hidden="true">{i + 1}</div>
          <div className={styles.resultInfo}>
            <div className={styles.resultName}>{r.full_name || "Battle Player"}</div>
            <div className={styles.resultSub}>{r.wins || 0} wins</div>
          </div>
          <div className={`${styles.resultPrize} ${styles.blue}`}>{r.wins || 0} wins</div>
        </motion.div>
      ))}
    </section>
  );
}
