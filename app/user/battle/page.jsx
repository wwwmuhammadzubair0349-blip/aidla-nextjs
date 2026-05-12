"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const MODES = [
  { id:"free",  label:"Free",    stake:0,   prize:10,  tax:0,  color:"#059669" },
  { id:"25",    label:"25 🪙",   stake:25,  prize:45,  tax:5,  color:"#6366f1" },
  { id:"50",    label:"50 🪙",   stake:50,  prize:90,  tax:10, color:"#f59e0b" },
  { id:"100",   label:"100 🪙",  stake:100, prize:180, tax:20, color:"#ef4444" },
];

const HINT_COSTS = [2.5, 5, 10, 20, 40];

export default function BattlePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("lobby"); // lobby|waiting|selecting|in_progress|result|history
  const [activeTab, setActiveTab] = useState("play"); // play|open|history|leaderboard
  const [msg, setMsg] = useState("");

  // Room state
  const [room, setRoom] = useState(null);
  const [myRole, setMyRole] = useState(null); // player1|player2
  const [openRooms, setOpenRooms] = useState([]);

  // Selection state
  const [categories, setCategories] = useState([]);
  const [selCategory, setSelCategory] = useState(null);
  const [selDifficulty, setSelDifficulty] = useState("medium");
  const [selQuestions, setSelQuestions] = useState(10);
  const [submittingSelection, setSubmittingSelection] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [eliminated, setEliminated] = useState([]);
  const [generatingQ, setGeneratingQ] = useState(false);

  // Result
  const [result, setResult] = useState(null);
  const [showShare, setShowShare] = useState(false);

  // History/LB
  const [history, setHistory] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbPeriod, setLbPeriod] = useState("daily");

  const pollRef = useRef(null);
  const roomSyncRef = useRef(null);
  const roomChannelRef = useRef(null);
  const botTimerRef = useRef(null);
  const timerRef = useRef(null);
  const submitLock = useRef(false);
  const channelRef = useRef(null);
  const lookupTimerRef = useRef(null);
  const roomTimeoutRef = useRef(null);
  const tabHideTimerRef = useRef(null);
  const sessionRef = useRef(null);
  const roomRef = useRef(null);
  const currentRoomIdRef = useRef(null);
  const myRoleRef = useRef(null);
  const viewRef = useRef("lobby");
  const startedRoundsRef = useRef(new Set());
  const completedRoundsRef = useRef(new Set());
  const forfeitLockRef = useRef(false);

  // Invite state
  const [pendingInvite, setPendingInvite] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteeInfo, setInviteeInfo] = useState(null); // { found, name } | null
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [joinRoomInput, setJoinRoomInput] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    init();
    return () => {
      clearAllTimers();
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (roomChannelRef.current) supabase.removeChannel(roomChannelRef.current);
    };
  }, []);

  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { currentRoomIdRef.current = currentRoomId; }, [currentRoomId]);
  useEffect(() => { myRoleRef.current = myRole; }, [myRole]);
  useEffect(() => { viewRef.current = view; }, [view]);

  function clearAllTimers() {
    clearInterval(pollRef.current);
    clearInterval(botTimerRef.current);
    clearInterval(timerRef.current);
    clearTimeout(roomTimeoutRef.current);
    clearTimeout(tabHideTimerRef.current);
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }
  }

  function roundFromRoom(r) {
    return Number(r?.current_round) || (r?.round2_category ? 2 : 1);
  }

  function myRoundScore(r, round = currentRound) {
    if (!r || !myRoleRef.current) return 0;
    return Number(r[`${myRoleRef.current}_round${round}_score`]) || 0;
  }

  async function goLobby() {
    const r = roomRef.current;
    const role = myRoleRef.current;
    clearAllTimers();
    if ((r?.id || currentRoomIdRef.current) && viewRef.current === "waiting") await supabase.rpc("battle_cancel_room", { p_room_id: r?.id || currentRoomIdRef.current });
    if (r?.id && role && ["selecting", "in_progress"].includes(viewRef.current)) await supabase.rpc("battle_forfeit", { p_room_id: r.id, p_role: role });
    setRoom(null);
    setCurrentRoomId(null);
    startedRoundsRef.current.clear();
    completedRoundsRef.current.clear();
    forfeitLockRef.current = false;
    setView("lobby");
    setActiveTab("play");
  }

  async function forfeitNow() {
    const r = roomRef.current;
    const role = myRoleRef.current;
    if (!r?.id || !role || forfeitLockRef.current) return;
    forfeitLockRef.current = true;
    await supabase.rpc("battle_forfeit", { p_room_id: r.id, p_role: role });
    clearAllTimers();
    const { data: finalRoom } = await supabase.rpc("battle_get_room", { p_room_id: r.id });
    if (finalRoom) handleResult(finalRoom);
    else { flash("Eliminated — opponent wins."); setView("lobby"); }
  }

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }
    sessionRef.current = session;
    setUser(session.user);
    const { data: prof } = await supabase.from("users_profiles").select("*").eq("user_id", session.user.id).single();
    setProfile(prof);
    const { data: cats } = await supabase.from("battle_categories").select("*").eq("is_active", true).order("name");
    setCategories(cats || []);
    await loadOpenRooms();
    await loadHistory();
    setLoading(false);

    // Broadcast channel — inviter sends directly to this channel for instant popup
    // No publication/replication setup needed unlike postgres_changes
    const ch = supabase
      .channel(`battle-invite:${session.user.id}`)
      .on("broadcast", { event: "new_invite" }, ({ payload }) => {
        if (payload && new Date(payload.expires_at) > new Date()) {
          setPendingInvite(payload);
        }
      })
      .subscribe();
    channelRef.current = ch;

    // Check pending invites by email (for users who weren't online when invited)
    const userEmail = prof?.email || session.user.email;
    if (userEmail) {
      const { data: pending } = await supabase
        .from("battle_invites")
        .select("*")
        .eq("invitee_email", userEmail)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      if (pending?.[0]) setPendingInvite(pending[0]);
    }

    // Handle URL params: ?room=<id> to auto-show join prompt
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");
    if (urlRoom) setJoinRoomInput(urlRoom);
  }

  async function loadOpenRooms() {
    const { data } = await supabase.rpc("battle_open_rooms");
    const { data: invites } = await supabase.from("battle_invites").select("room_id").eq("status", "pending");
    const privateIds = new Set((invites || []).map(i => i.room_id));
    setOpenRooms((data || []).filter(r => !privateIds.has(r.id)));
  }

  async function loadHistory() {
    const { data } = await supabase.rpc("battle_my_stats");
    if (data?.ok) {
      setMyStats(data);
      setHistory(data.history || []);
    }
  }

  async function loadLeaderboard(period = lbPeriod) {
    const { data } = await supabase.rpc("battle_leaderboard", { p_period: period });
    setLeaderboard(data || []);
  }

  // ── FIND / CREATE ROOM ──
  async function findBattle(mode) {
    const modeObj = MODES.find(m => m.id === mode);
    if (modeObj.stake > 0 && profile?.total_aidla_coins < modeObj.stake) {
      flash("Insufficient coins"); return;
    }
    setView("waiting");
    setRoom(null);
    startedRoundsRef.current.clear();
    completedRoundsRef.current.clear();
    forfeitLockRef.current = false;
    const { data, error } = await supabase.rpc("battle_find_or_create", { p_mode: mode });
    if (error || !data?.ok) { flash(data?.error || error?.message); setView("lobby"); return; }
    setMyRole(data.role);
    setCurrentRoomId(data.room_id);
    watchRoom(data.room_id);
    await pollRoom(data.room_id, true);
  }

  async function joinRoom(roomId) {
    const { data, error } = await supabase.rpc("battle_join_room", { p_room_id: roomId });
    if (error || !data?.ok) { flash(data?.error || error?.message); return; }
    setMyRole("player2");
    setCurrentRoomId(data.room_id);
    startedRoundsRef.current.clear();
    completedRoundsRef.current.clear();
    forfeitLockRef.current = false;
    watchRoom(data.room_id);
    await pollRoom(data.room_id, false);
  }

  async function pollRoom(roomId, startBotTimer) {
    clearInterval(pollRef.current);
    clearInterval(roomSyncRef.current);
    // Start bot timer if player1 and no match in 12s
    if (startBotTimer) {
      botTimerRef.current = setTimeout(async () => {
        const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: roomId });
        if (r?.status === "waiting") {
          await supabase.rpc("battle_add_bot", { p_room_id: roomId });
        }
      }, 12000);
    }

    // Poll every 2s
    pollRef.current = setInterval(async () => {
      const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: roomId });
      if (!r) return;
      setRoom(r);
      const rn = roundFromRoom(r);
      setCurrentRound(rn);
      setMyScore(myRoundScore(r, rn));
      if (r.status === "selecting") {
        // Keep polling so non-selector detects in_progress
        clearTimeout(botTimerRef.current);
        clearTimeout(roomTimeoutRef.current);
        setView("selecting");
      }
      if (r.status === "in_progress") {
        clearTimeout(roomTimeoutRef.current);
        if (!startedRoundsRef.current.has(rn) && !completedRoundsRef.current.has(rn)) {
          clearInterval(pollRef.current);
          await startRound(r, rn);
        }
      }
      if (r.status === "completed") {
        clearInterval(pollRef.current);
        clearTimeout(roomTimeoutRef.current);
        handleResult(r);
      }
    }, 2000);
  }

  // ── ROUND SELECTION ──
  // Round 1 → player1 picks. Round 2 → player2 picks.
  function isMySelectorTurn() {
    if (!room) return false;
    const isRound2 = !!room.round1_category;
    return isRound2 ? myRole === "player2" : myRole === "player1";
  }

  function isOpponentSelectorTurn() {
    if (!room) return false;
    const isRound2 = !!room.round1_category;
    return isRound2 ? myRole === "player1" : myRole === "player2";
  }

  async function submitSelection() {
    if (!selCategory) { flash("Pick a category"); return; }
    setSubmittingSelection(true);
    const round = room.round1_category ? 2 : 1;
    const { error: setErr } = await supabase.rpc("battle_set_round", {
      p_room_id: room.id, p_round: round,
      p_category_id: selCategory.id, p_category: selCategory.name,
      p_difficulty: selDifficulty, p_questions: selQuestions,
    });
    if (setErr) { flash(setErr.message); setSubmittingSelection(false); return; }

    // Generate questions via edge function
    setGeneratingQ(true);
    await supabase.functions.invoke("battle-generate", {
      body: { room_id: room.id, round, category: selCategory.name, difficulty: selDifficulty, total_questions: selQuestions }
    });
    setGeneratingQ(false);
    setSubmittingSelection(false);

    // If bot, simulate bot selection for round 2
    if (room.is_bot && round === 1) {
      setTimeout(async () => {
        const botCat = categories[Math.floor(Math.random() * categories.length)];
        const diffs = ["easy","medium","hard"];
        const qs = [5,10,15,20];
        const botDifficulty = diffs[Math.floor(Math.random()*3)];
        const botQuestions = qs[Math.floor(Math.random()*4)];
        await supabase.rpc("battle_set_round", {
          p_room_id: room.id, p_round: 2,
          p_category_id: botCat.id, p_category: botCat.name,
          p_difficulty: botDifficulty,
          p_questions: botQuestions,
        });
        await supabase.functions.invoke("battle-generate", {
          body: { room_id: room.id, round: 2, category: botCat.name, difficulty: botDifficulty, total_questions: botQuestions }
        });
      }, 3000 + Math.random() * 4000);
    }

    // Clear any stale poll (from pollRoom's selecting branch) before starting fresh
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
      if (!r) return;
      setRoom(r);
      if (r.status === "in_progress") {
        clearInterval(pollRef.current);
        await startRound(r, round);
      }
    }, 2000);
  }

  // ── QUIZ ROUND ──
  async function startRound(r, roundNum) {
    if (startedRoundsRef.current.has(roundNum) || completedRoundsRef.current.has(roundNum)) return;
    startedRoundsRef.current.add(roundNum);
    setCurrentRound(roundNum);
    setMyScore(0);
    setQIndex(0);
    setFeedback(null);
    setSelected(null);
    setHintsUsed(0);
    setEliminated([]);
    submitLock.current = false;
    setView("in_progress");

    const { data } = await supabase.rpc("battle_get_questions", { p_room_id: r.id, p_round: roundNum });
    if (!data?.ok || !data.questions?.length) {
      startedRoundsRef.current.delete(roundNum);
      flash("Failed to load questions");
      return;
    }
    setQuestions(data.questions);
    const diff = r[`round${roundNum}_difficulty`];
    const secPerQ = diff === "hard" ? 10 : diff === "easy" ? 15 : 12;
    startTimer(secPerQ);

    // Poll opponent score every 2s during round
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const { data: rd } = await supabase.rpc("battle_get_room", { p_room_id: r.id });
      if (rd?.status === "completed") {
        clearInterval(pollRef.current);
        clearInterval(timerRef.current);
        handleResult(rd);
      } else if (rd) {
        setRoom(rd);
        setMyScore(myRoundScore(rd, roundNum));
      }
    }, 2000);

    // Bot plays too
    if (r.is_bot) simulateBotRound(r, roundNum, data.questions);
  }

  async function syncRoom(roomId) {
    const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: roomId });
    if (!r) return;
    setRoom(r);
    const rn = roundFromRoom(r);
    setCurrentRound(rn);
    setMyScore(myRoundScore(r, rn));
    if (r.status === "completed") {
      clearAllTimers();
      handleResult(r);
    }
  }

  function watchRoom(roomId) {
    clearInterval(roomSyncRef.current);
    if (roomChannelRef.current) supabase.removeChannel(roomChannelRef.current);
    roomSyncRef.current = setInterval(() => syncRoom(roomId), 1000);
    roomChannelRef.current = supabase
      .channel(`battle-room:${roomId}`)
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"battle_rooms", filter:`id=eq.${roomId}` }, ({ new: r }) => {
        setRoom(r);
        const rn = roundFromRoom(r);
        setCurrentRound(rn);
        setMyScore(myRoundScore(r, rn));
        if (r.status === "completed") { clearAllTimers(); handleResult(r); }
      })
      .subscribe();
  }

  function startTimer(sec) {
    clearInterval(timerRef.current);
    setTimeLeft(sec);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (timeLeft === 0 && view === "in_progress" && !feedback && !submitLock.current) {
      handleAnswer(null);
    }
  }, [timeLeft]);

  async function handleAnswer(optionIdx) {
    if (submitLock.current || !room) return;
    submitLock.current = true;
    clearInterval(timerRef.current);
    const q = questions[qIndex];
    const roundSec = room[`round${currentRound}_difficulty`] === "hard" ? 10 : room[`round${currentRound}_difficulty`] === "easy" ? 15 : 12;
    const timeTaken = roundSec - timeLeft;
    setSelected(optionIdx);

    const { data } = await supabase.rpc("battle_submit_answer", {
      p_room_id: room.id, p_round: currentRound,
      p_question_order: qIndex + 1,
      p_question_text: q.question_text,
      p_selected: optionIdx, p_correct_index: q.correct_option_index,
      p_time_taken: timeTaken, p_is_bot: false,
    });

    const correct = data?.is_correct;
    const { data: scoreRoom } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
    if (scoreRoom) {
      setRoom(scoreRoom);
      setMyScore(myRoundScore(scoreRoom, currentRound));
    } else if (correct) setMyScore(s => s + 1);
    setFeedback({ correct, correctIndex: q.correct_option_index });
    await new Promise(r => setTimeout(r, 1000));

    const next = qIndex + 1;
    if (next >= questions.length) {
      completedRoundsRef.current.add(currentRound);
      clearInterval(pollRef.current);
      await supabase.rpc("battle_finish_round", { p_room_id: room.id, p_round: currentRound, p_is_bot: false });
      if (currentRound === 1) {
        // Round 1 done — go to round 2 selection
        setView("selecting");
        setSelCategory(null);
        setQIndex(0);
        setFeedback(null);
        setSelected(null);
        submitLock.current = false;
        // Poll for round 2 questions
        pollRef.current = setInterval(async () => {
          const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
          if (!r) return;
          setRoom(r);
          if (r.round2_category && r.status === "in_progress" && !completedRoundsRef.current.has(2)) {
            // Check questions cached
            const { data: qd } = await supabase.rpc("battle_get_questions", { p_room_id: r.id, p_round: 2 });
            if (qd?.questions?.length) {
              clearInterval(pollRef.current);
              await startRound(r, 2);
            }
          }
        }, 2000);
      } else {
        // Both rounds done
        clearInterval(pollRef.current);
        const { data: comp } = await supabase.rpc("battle_complete", { p_room_id: room.id });
        if (comp?.already_done || comp?.ok) {
          const { data: finalRoom } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
          handleResult(finalRoom || { ...room });
        }
      }
    } else {
      setQIndex(next);
      setSelected(null);
      setFeedback(null);
      // DO NOT reset hintsUsed — price persists per round
      setEliminated([]);
      submitLock.current = false;
      const curDiff = room?.[`round${currentRound}_difficulty`];
      const secPerQ = curDiff === "hard" ? 10 : curDiff === "easy" ? 15 : 12;
      startTimer(secPerQ);
    }
  }

  // ── TAB SWITCH DETECTION ──
  useEffect(() => {
    if (view !== "in_progress" || !room?.id) return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        submitLock.current = true;
        forfeitNow();
      } else {
        clearTimeout(tabHideTimerRef.current);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(tabHideTimerRef.current);
    };
  }, [view, room?.id, myRole, qIndex]);

  useEffect(() => {
    if (view !== "in_progress" || !room?.id) return;
    const fail = () => forfeitNow();
    window.addEventListener("blur", fail);
    return () => window.removeEventListener("blur", fail);
  }, [view, room?.id, myRole]);

  // ── WINDOW CLOSE / NAVIGATE AWAY ──
  useEffect(() => {
    if (!room?.id || !["in_progress", "selecting"].includes(view)) return;

    const onUnload = () => {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/battle_forfeit`,
        {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${sessionRef.current?.access_token || ""}`,
          },
          body: JSON.stringify({ p_room_id: room.id, p_role: myRole }),
        }
      );
    };

    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [view, room?.id, myRole]);

  async function simulateBotRound(r, roundNum, qs) {
    const totalQ = qs.length;
    for (let i = 0; i < totalQ; i++) {
      const delay = 2000 + Math.random() * (r[`round${roundNum}_difficulty`] === "hard" ? 12000 : 8000);
      await new Promise(res => setTimeout(res, delay));
      // Bot wins most — 80% correct
      const botCorrect = Math.random() < 0.8;
      const q = qs[i];
      const chosen = botCorrect ? q.correct_option_index : (q.correct_option_index + 1) % 4;
      await supabase.rpc("battle_submit_answer", {
        p_room_id: r.id, p_round: roundNum,
        p_question_order: i + 1, p_question_text: q.question_text,
        p_selected: chosen, p_correct_index: q.correct_option_index,
        p_time_taken: Math.floor(delay / 1000), p_is_bot: true,
      });
    }
    await supabase.rpc("battle_finish_round", { p_room_id: r.id, p_round: roundNum, p_is_bot: true });
  }

  function handleResult(r) {
    const isMe = myRole === "player1" ? r.player1_id : r.player2_id;
    const iWon = r.winner_id === (myRole === "player1" ? r.player1_id : r.player2_id);
    const myTotal = myRole === "player1"
      ? (r.player1_round1_score || 0) + (r.player1_round2_score || 0)
      : (r.player2_round1_score || 0) + (r.player2_round2_score || 0);
    const oppTotal = myRole === "player1"
      ? (r.player2_round1_score || 0) + (r.player2_round2_score || 0)
      : (r.player1_round1_score || 0) + (r.player1_round2_score || 0);
    const modeObj = MODES.find(m => m.id === r.mode);
    setResult({
      won: r.is_tie ? null : iWon,
      tie: r.is_tie,
      myScore: myTotal,
      oppScore: oppTotal,
      oppName: myRole === "player1" ? (r.bot_name || r.player2_name) : r.player1_name,
      coinsChange: r.is_tie ? -(modeObj.tax / 2) : iWon ? modeObj.prize : -modeObj.stake,
      prize: modeObj.prize,
      mode: r.mode,
      isBot: r.is_bot,
    });
    setView("result");
    loadHistory();
  }

  async function useHint() {
    const cost = HINT_COSTS[hintsUsed] || 40;
    if ((profile?.total_aidla_coins || 0) < cost) { flash("Insufficient coins"); return; }
    const q = questions[qIndex];
    // Only eliminate 1 wrong option per hint
    const wrong = [0,1,2,3].filter(i => i !== q.correct_option_index && !eliminated.includes(i));
    if (wrong.length === 0) return;
    const toElim = wrong[Math.floor(Math.random() * wrong.length)];
    setEliminated(prev => [...prev, toElim]);
    setHintsUsed(h => h + 1);
    const newBal = (profile?.total_aidla_coins || 0) - cost;
    setProfile(prev => ({ ...prev, total_aidla_coins: newBal }));
    // Deduct from user + add to admin pool via two inserts
    const txnNo = "HINT-BTL-" + Date.now();
    const poolBal = await supabase.from("admin_pool").select("total_aidla_coins").eq("id",1).single().then(r => r.data?.total_aidla_coins || 0);
    await supabase.from("users_transactions").insert({
      txn_no: txnNo+"-U", user_id: user.id,
      user_email: profile?.email || user.email,
      txn_type: "battle_hint", direction: "OUT", amount: cost,
      balance_before: profile?.total_aidla_coins || 0,
      balance_after: newBal,
      note: "Battle hint used",
    });
    await supabase.from("admin_pool_transactions").insert({
      txn_no: txnNo+"-A", txn_type: "battle_hint", direction: "IN", amount: cost,
      admin_email: "system@battle",
      target_user_id: user.id,
      target_user_email: profile?.email || user.email,
      target_user_name: profile?.full_name || "User",
      pool_balance_before: poolBal,
      pool_balance_after: poolBal + cost,
      user_balance_before: profile?.total_aidla_coins || 0,
      user_balance_after: newBal,
      note: "Hint fee collected from battle",
    });
  }

  function flash(text) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  // ── INVITE FUNCTIONS ──
  function handleInviteEmailChange(val) {
    setInviteEmail(val);
    setInviteeInfo(null);
    clearTimeout(lookupTimerRef.current);
    if (!val.trim() || !val.includes("@")) return;
    lookupTimerRef.current = setTimeout(() => lookupInvitee(val.trim().toLowerCase()), 700);
  }

  async function lookupInvitee(email) {
    const { data } = await supabase
      .from("users_profiles").select("full_name").eq("email", email).maybeSingle();
    setInviteeInfo(data ? { found: true, name: data.full_name || email } : { found: false });
  }

  // Shared helper — insert invite record + fire broadcast for instant popup
  async function _insertAndBroadcast(roomId, email) {
    const { data: inviteeProf } = await supabase
      .from("users_profiles").select("user_id").eq("email", email).maybeSingle();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { data: inv, error } = await supabase
      .from("battle_invites")
      .insert({
        room_id:       roomId,
        inviter_id:    user.id,
        inviter_name:  profile?.full_name || user.email,
        invitee_email: email,
        invitee_id:    inviteeProf?.user_id || null,
        expires_at:    expiresAt,
      })
      .select()
      .single();

    if (error) return { ok: false };

    // Broadcast directly to invitee's personal channel for instant popup
    if (inviteeProf?.user_id) {
      await supabase
        .channel(`battle-invite:${inviteeProf.user_id}`)
        .httpSend({
          type: "broadcast", event: "new_invite",
          payload: { ...inv, inviter_name: profile?.full_name || user.email },
        });
    }
    return { ok: true, inviteeFound: !!inviteeProf?.user_id };
  }

  // Send invite to an already-created room (from waiting screen)
  async function sendInvite() {
    if (!inviteEmail.trim() || !currentRoomId) return;
    setInviteSending(true);
    setInviteMsg("");
    const { ok, inviteeFound } = await _insertAndBroadcast(
      currentRoomId, inviteEmail.trim().toLowerCase()
    );
    setInviteSending(false);
    if (!ok) { setInviteMsg("Failed to send. Check email."); return; }
    setInviteMsg(inviteeFound ? "Invite sent — they'll get a popup!" : "Invite sent — they'll see it next time they open Battle.");
    setInviteEmail(""); setInviteeInfo(null);
  }

  // Create room + send invite + skip bot timer (from pre_waiting screen)
  async function sendInviteAndWait() {
    if (!inviteEmail.trim() || !selectedMode) return;
    setInviteSending(true);
    const modeObj = selectedMode;
    if (modeObj.stake > 0 && profile?.total_aidla_coins < modeObj.stake) {
      flash("Insufficient coins"); setInviteSending(false); return;
    }
    const { data, error } = await supabase.rpc("battle_find_or_create", { p_mode: modeObj.id, p_is_open: false });
    if (error || !data?.ok) {
      flash(data?.error || "Failed to create room"); setInviteSending(false); return;
    }
    if (data.role !== "player1") {
      flash("Invite room unavailable. Try again.");
      setInviteSending(false);
      return;
    }
    const roomId = data.room_id;
    setMyRole(data.role);
    setCurrentRoomId(roomId);
    watchRoom(roomId);

    const { ok } = await _insertAndBroadcast(roomId, inviteEmail.trim().toLowerCase());
    if (!ok) flash("Room created but invite failed — share the Room ID manually.");

    setInviteSending(false);
    setInviteEmail(""); setInviteeInfo(null);
    setView("waiting");

    // Cancel room if nobody joins within 30s
    roomTimeoutRef.current = setTimeout(async () => {
      const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: roomId });
      if (r?.status === "waiting") {
        clearInterval(pollRef.current);
        await supabase.rpc("battle_cancel_room", { p_room_id: roomId });
        flash("Nobody joined — room cancelled.");
        setView("pre_waiting");
        setCurrentRoomId(null);
      }
    }, 30000);

    await pollRoom(roomId, false); // no bot timer — waiting for specific person
  }

  async function acceptInvite(invite) {
    setPendingInvite(null);
    setView("waiting");
    const roomId = invite.room_id;
    setCurrentRoomId(roomId);
    const { data, error } = await supabase.rpc("battle_join_room", { p_room_id: roomId });
    if (error || !data?.ok) {
      flash(data?.error || error?.message || "Room no longer available");
      setView("lobby");
      return;
    }
    await supabase.from("battle_invites").update({ status: "accepted" }).eq("id", invite.id);
    setMyRole("player2");
    watchRoom(roomId);
    await pollRoom(roomId, false);
  }

  async function declineInvite(invite) {
    await supabase.from("battle_invites").update({ status: "declined" }).eq("id", invite.id);
    setPendingInvite(null);
  }

  async function joinByRoomId() {
    if (!joinRoomInput.trim()) return;
    const rid = joinRoomInput.trim();
    setView("waiting");
    setCurrentRoomId(rid);
    const { data, error } = await supabase.rpc("battle_join_room", { p_room_id: rid });
    if (error || !data?.ok) {
      flash(data?.error || error?.message || "Room not found or full");
      setView("lobby");
      return;
    }
    setMyRole("player2");
    watchRoom(rid);
    await pollRoom(rid, false);
  }

  function copyRoomId() {
    if (!currentRoomId) return;
    navigator.clipboard.writeText(currentRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyRoomLink() {
    if (!currentRoomId) return;
    const link = `${window.location.origin}/user/battle?room=${currentRoomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const q = questions[qIndex];
  const secPerQ = room ? (room[`round${currentRound}_difficulty`] === "hard" ? 10 : room[`round${currentRound}_difficulty`] === "easy" ? 15 : 12) : 12;
  const timePct = timeLeft / secPerQ * 100;
  const opponentName = room ? (room.is_bot ? room.bot_name : myRole === "player1" ? room.player2_name : room.player1_name) : "—";
  const opponentScore = room ? (Number(myRole === "player1" ? room[`player2_round${currentRound}_score`] : room[`player1_round${currentRound}_score`]) || 0) : 0;

  if (loading) return <div style={{ textAlign:"center", padding:80, fontFamily:"sans-serif" }}>Loading...</div>;

  return (
    <div style={S.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Share Card */}
      {showShare && result && (
        <BattleShareCard profile={profile} result={result} onClose={() => setShowShare(false)} />
      )}

      {/* Header */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={goLobby}>←</button>
        <span style={S.headerTitle}>⚔️ 1v1 Battle</span>
        <span style={S.coins}>🪙 {(profile?.total_aidla_coins||0).toLocaleString()}</span>
      </div>

      {msg && <div style={S.toast}>{msg}</div>}

      {/* INVITE POPUP */}
      {pendingInvite && (
        <div style={S.inviteOverlay}>
          <div style={S.invitePopup}>
            <div style={{ fontSize:40, marginBottom:8 }}>⚔️</div>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:6 }}>Battle Invite!</div>
            <div style={{ fontSize:13, color:"#475569", marginBottom:4 }}>
              <strong>{pendingInvite.inviter_name}</strong> challenged you to a 1v1 battle!
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:20 }}>
              Expires {new Date(pendingInvite.expires_at).toLocaleTimeString()}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ ...S.btn, flex:1 }} onClick={() => acceptInvite(pendingInvite)}>Accept ⚔️</button>
              <button style={{ ...S.btnGhost, flex:1 }} onClick={() => declineInvite(pendingInvite)}>Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* LOBBY */}
      {view === "lobby" && (
        <div style={{ padding:16 }}>
          {/* Tabs */}
          <div style={S.tabs}>
            {[["play","⚔️ Play"],["open","🔓 Open"],["history","📜 History"],["leaderboard","🏆 Board"]].map(([id,label]) => (
              <button key={id} style={{ ...S.tab, ...(activeTab===id ? S.tabActive : {}) }}
                onClick={() => {
                  setActiveTab(id);
                  if (id==="open") loadOpenRooms();
                  if (id==="leaderboard") loadLeaderboard();
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* PLAY TAB */}
          {activeTab === "play" && (
            <div>
              {/* Stats */}
              {myStats && (
                <div style={S.card}>
                  <div style={S.cardTitle}>My Stats</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                    {[["Battles",myStats.total],["Wins",myStats.wins],["Losses",myStats.losses],["Earned",`+${myStats.coins_earned}🪙`]].map(([l,v]) => (
                      <div key={l} style={S.statBox}>
                        <div style={S.statVal}>{v}</div>
                        <div style={S.statKey}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode selection */}
              <div style={S.card}>
                <div style={S.cardTitle}>Choose Mode</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {MODES.map(m => (
                    <button key={m.id} style={{ ...S.modeBtn, borderColor: m.color }} onClick={() => { setSelectedMode(m); setView("pre_waiting"); }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:15 }}>{m.label}</div>
                          <div style={{ fontSize:12, color:"#64748b" }}>
                            {m.stake === 0 ? "Free entry" : `Stake: ${m.stake} coins`} · Winner gets {m.prize} 🪙
                          </div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color: m.color }}>
                          {m.stake === 0 ? "FREE" : `${m.stake}🪙`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize:12, color:"#94a3b8", textAlign:"center", padding:"8px 0" }}>
                💡 Hints: 1st=2.5🪙, 2nd=5🪙, 3rd=10🪙...
              </div>
            </div>
          )}

          {/* OPEN ROOMS TAB */}
          {activeTab === "open" && (
            <div>
              {/* Join by Room ID */}
              <div style={S.card}>
                <div style={S.cardTitle}>🔗 Join by Room ID</div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:10 }}>
                  Have a room ID or invite link? Paste and join directly.
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input
                    style={S.input}
                    placeholder="Paste room ID here..."
                    value={joinRoomInput}
                    onChange={e => setJoinRoomInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && joinByRoomId()}
                  />
                  <button
                    style={{ ...S.smBtn, background:"#6366f1", color:"white", whiteSpace:"nowrap" }}
                    onClick={joinByRoomId}
                    disabled={!joinRoomInput.trim()}>
                    Join →
                  </button>
                </div>
              </div>

              {/* Open rooms list */}
              <div style={S.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={S.cardTitle}>Open Battles</div>
                  <button style={S.smBtn} onClick={loadOpenRooms}>↻ Refresh</button>
                </div>
                {openRooms.length === 0 ? (
                  <p style={S.empty}>No open battles. Create one from Play tab!</p>
                ) : openRooms.map((r, i) => {
                  const m = MODES.find(md => md.id === r.mode);
                  return (
                    <div key={i} style={S.lbRow}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{r.player1_name}</div>
                        <div style={{ fontSize:12, color:"#64748b" }}>Mode: {m?.label} · Stake: {m?.stake}🪙</div>
                      </div>
                      <button style={{ ...S.smBtn, background:"#6366f1", color:"white" }} onClick={() => joinRoom(r.id)}>
                        Join
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div style={S.card}>
              <div style={S.cardTitle}>Battle History</div>
              {history.length === 0 ? <p style={S.empty}>No battles yet.</p> : history.map((h, i) => (
                <div key={i} style={S.lbRow}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background: h.result==="won"?"#dcfce7":h.result==="tie"?"#fef9c3":"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                    {h.result==="won"?"🏆":h.result==="tie"?"🤝":"💔"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{h.opponent_name} {h.is_bot ? "" : ""}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{h.my_score} vs {h.opp_score} · {h.mode==="free"?"Free":h.mode+"🪙"}</div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:13, color: h.coins_change>=0?"#059669":"#dc2626" }}>
                    {h.coins_change>=0?"+":""}{h.coins_change}🪙
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === "leaderboard" && (
            <div style={S.card}>
              <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                {["daily","weekly","monthly"].map(p => (
                  <button key={p} style={{ ...S.smBtn, ...(lbPeriod===p?{background:"#6366f1",color:"white"}:{}) }}
                    onClick={() => { setLbPeriod(p); loadLeaderboard(p); }}>
                    {p.charAt(0).toUpperCase()+p.slice(1)}
                  </button>
                ))}
              </div>
              {leaderboard.length === 0 ? <p style={S.empty}>No data yet.</p> : leaderboard.slice(0,20).map((l, i) => (
                <div key={i} style={S.lbRow}>
                  <span style={{ fontWeight:800, width:28, color:i<3?["#f59e0b","#94a3b8","#92400e"][i]:"#475569" }}>#{i+1}</span>
                  {l.avatar_url
  ? <img src={l.avatar_url} alt="" style={S.avatar} />
  : <div style={{ width:28, height:28, borderRadius:"50%", background:l.is_bot?"#f1f5f9":"#e0e7ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{l.is_bot?"":"👤"}</div>}
<span style={{ flex:1, fontWeight:600, fontSize:13 }}>{l.full_name}{l.is_bot?" ":""}</span>
<span style={{ fontSize:12, color:"#64748b" }}>{l.wins} Wins</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRE-WAITING — mode selected, choose to search or invite */}
      {view === "pre_waiting" && selectedMode && (
        <div style={{ padding:16 }}>
          {/* Mode summary */}
          <div style={{ ...S.card, border:`2px solid ${selectedMode.color}33`, marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>{selectedMode.label} Mode</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>
                  {selectedMode.stake === 0 ? "Free entry" : `Stake: ${selectedMode.stake} coins`} · Winner gets {selectedMode.prize} 🪙
                </div>
              </div>
              <div style={{ fontWeight:900, fontSize:24, color: selectedMode.color }}>
                {selectedMode.stake === 0 ? "FREE" : `${selectedMode.stake}🪙`}
              </div>
            </div>
          </div>

          {/* Find public match */}
          <button style={{ ...S.btn, marginBottom:16 }} onClick={() => findBattle(selectedMode.id)}>
            ⚔️ Find Public Match
          </button>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:"#e2e8f0" }}/>
            <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>or invite a friend</span>
            <div style={{ flex:1, height:1, background:"#e2e8f0" }}/>
          </div>

          {/* Invite by email */}
          <div style={S.card}>
            <div style={S.cardTitle}>📨 Invite by Email</div>
            <div style={S.label}>Friend's Email</div>
            <input
              style={{ ...S.input, width:"100%", marginBottom:8 }}
              type="email"
              placeholder="friend@email.com"
              value={inviteEmail}
              onChange={e => handleInviteEmailChange(e.target.value)}
            />
            {inviteeInfo && (
              <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color: inviteeInfo.found ? "#059669" : "#dc2626" }}>
                {inviteeInfo.found ? `✓ ${inviteeInfo.name}` : "✗ User not found on AIDLA"}
              </div>
            )}
            <button
              style={{ ...S.btn, opacity: (!inviteEmail.trim() || inviteSending) ? 0.55 : 1 }}
              onClick={sendInviteAndWait}
              disabled={!inviteEmail.trim() || inviteSending}>
              {inviteSending ? "Setting up..." : "Send Invite & Wait ✉️"}
            </button>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:8 }}>
              They'll get a popup if logged in, or see it next time they open Battle.
            </div>
          </div>

          <button style={{ ...S.btnGhost, marginTop:4 }} onClick={() => { setView("lobby"); setInviteEmail(""); setInviteeInfo(null); }}>
            ← Back
          </button>
        </div>
      )}

      {/* WAITING */}
      {view === "waiting" && (
        <div style={{ padding:16 }}>
          <div style={{ ...S.card, textAlign:"center", padding:"48px 24px" }}>
            <div style={{ fontSize:56, marginBottom:16, animation:"wobble 1s ease-in-out infinite" }}>⚔️</div>
            <div style={{ fontSize:20, fontWeight:800, marginBottom:8, color:"#0f172a" }}>Searching for Opponent</div>
            <div style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Matching you with the best available challenger...</div>
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:24 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1", animation:`bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />
              ))}
            </div>
            <style>{`
              @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
              @keyframes wobble{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
            `}</style>
            <button style={{ ...S.btnGhost, maxWidth:200, margin:"0 auto" }} onClick={goLobby}>Cancel</button>
          </div>

          {/* Invite panel — visible while waiting */}
          {currentRoomId && (
            <div style={S.card}>
              <div style={S.cardTitle}>📨 Invite Someone</div>

              {/* Room ID + copy */}
              <div style={{ background:"#f8fafc", borderRadius:10, padding:"10px 12px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                <div>
                  <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Room ID</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", fontFamily:"monospace", wordBreak:"break-all" }}>{currentRoomId}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <button style={S.smBtn} onClick={copyRoomId}>{copied ? "✓" : "📋"} ID</button>
                  <button style={S.smBtn} onClick={copyRoomLink}>{copied ? "✓" : "🔗"} Link</button>
                </div>
              </div>

              {/* Invite by email */}
              <div style={S.label}>Invite by Email</div>
              <div style={{ display:"flex", gap:8, marginBottom:4 }}>
                <input
                  style={S.input}
                  type="email"
                  placeholder="opponent@email.com"
                  value={inviteEmail}
                  onChange={e => handleInviteEmailChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendInvite()}
                />
                <button
                  style={{ ...S.smBtn, background:"#6366f1", color:"white", whiteSpace:"nowrap" }}
                  onClick={sendInvite}
                  disabled={inviteSending || !inviteEmail.trim()}>
                  {inviteSending ? "..." : "Send"}
                </button>
              </div>
              {inviteeInfo && (
                <div style={{ fontSize:12, fontWeight:700, marginBottom:4, color: inviteeInfo.found ? "#059669" : "#dc2626" }}>
                  {inviteeInfo.found ? `✓ ${inviteeInfo.name}` : "✗ User not found on AIDLA"}
                </div>
              )}
              {inviteMsg && (
                <div style={{ fontSize:12, color: inviteMsg.startsWith("Failed") ? "#dc2626" : "#059669", fontWeight:600 }}>
                  {inviteMsg}
                </div>
              )}
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:6 }}>
                They'll get a popup if logged in, or see the invite when they visit Battle.
              </div>
            </div>
          )}
        </div>
      )}

      {/* SELECTING */}
      {view === "selecting" && room && (
        <div style={{ padding:16 }}>
          <div style={{ ...S.card, background:"#f0f9ff", border:"1px solid #bae6fd", marginBottom:12, padding:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#0369a1" }}>
              vs {opponentName} {room.is_bot ? "" : ""}
            </div>
            <div style={{ fontSize:12, color:"#0284c7" }}>Round {currentRound} of 2</div>
          </div>

          {isMySelectorTurn() ? (
            <div style={S.card}>
              <div style={S.cardTitle}>You Pick Round {currentRound}</div>

              <div style={{ marginBottom:12 }}>
                <div style={S.label}>Category</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {categories.map(c => (
                    <button key={c.id} style={{ ...S.catBtn, ...(selCategory?.id===c.id ? S.catBtnActive : {}) }}
                      onClick={() => setSelCategory(c)}>
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:12 }}>
                <div style={S.label}>Difficulty</div>
                <div style={{ display:"flex", gap:8 }}>
                  {["easy","medium","hard"].map(d => (
                    <button key={d} style={{ ...S.smBtn, flex:1, ...(selDifficulty===d?{background:"#6366f1",color:"white"}:{}) }}
                      onClick={() => setSelDifficulty(d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={S.label}>Questions</div>
                <div style={{ display:"flex", gap:8 }}>
                  {[5,10,15,20].map(n => (
                    <button key={n} style={{ ...S.smBtn, flex:1, ...(selQuestions===n?{background:"#6366f1",color:"white"}:{}) }}
                      onClick={() => setSelQuestions(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button style={S.btn} onClick={submitSelection} disabled={!selCategory || submittingSelection}>
                {generatingQ ? "Generating..." : submittingSelection ? "Submitting..." : "Confirm Selection ✓"}
              </button>
            </div>
          ) : (
            <div style={{ ...S.card, textAlign:"center", padding:40 }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{opponentName} is picking Round {currentRound}...</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:8 }}>
                {room[`round${currentRound === 1 ? 1 : 2}_category`]
                  ? `Category: ${room[`round${currentRound === 1 ? 1 : 2}_category`]}`
                  : "Waiting for selection..."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IN PROGRESS */}
      {view === "in_progress" && q && (
        <div style={{ padding:16 }}>
          {/* Scoreboard */}
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <div style={{ flex:1, background:"#eff6ff", borderRadius:10, padding:"8px 12px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#64748b" }}>You</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#6366f1" }}>{myScore}</div>
            </div>
            <div style={{ flex:1, background:"#f8fafc", borderRadius:10, padding:"8px 12px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#64748b" }}>Round {currentRound}/2</div>
              <div style={{ fontSize:14, fontWeight:700 }}>Q{qIndex+1}/{questions.length}</div>
            </div>
            <div style={{ flex:1, background:"#fef2f2", borderRadius:10, padding:"8px 12px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#64748b" }}>{opponentName}</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#ef4444" }}>{opponentScore}</div>
            </div>
          </div>

          {/* Timer */}
          <div style={S.timerBar}><div style={{ ...S.timerFill, width:`${timePct}%`, background:timeLeft<=5?"#ef4444":"#6366f1" }} /></div>
          <div style={{ textAlign:"center", fontSize:24, fontWeight:800, marginBottom:10, color:timeLeft<=5?"#ef4444":"#0f172a" }}>{timeLeft}s</div>

          <div style={S.card} onContextMenu={e => e.preventDefault()}>
            <div style={{ fontSize:11, color:"#6366f1", fontWeight:700, marginBottom:6 }}>
              {room?.[`round${currentRound}_category`]} · {room?.[`round${currentRound}_difficulty`]}
            </div>
            <p style={{ fontWeight:700, fontSize:15, lineHeight:1.5, margin:"0 0 12px", userSelect:"none" }}>{q.question_text}</p>
            {q.options?.map((opt, i) => {
              let bg="white", border="1px solid #e2e8f0", color="#0f172a";
              if (feedback) {
                if (i===feedback.correctIndex) { bg="#dcfce7"; border="1px solid #10b981"; color="#065f46"; }
                else if (i===selected && !feedback.correct) { bg="#fee2e2"; border="1px solid #ef4444"; color="#991b1b"; }
              } else if (selected===i) { bg="#eef2ff"; border="1px solid #6366f1"; }
              const elim = eliminated.includes(i);
              return (
                <button key={i} disabled={!!feedback || elim}
                  onClick={() => { if (!feedback) { setSelected(i); handleAnswer(i); } }}
                  style={{ width:"100%", padding:"11px 14px", margin:"4px 0", borderRadius:10, textAlign:"left", fontSize:14, fontFamily:"inherit", cursor:"pointer", background:bg, border, color, opacity:elim?0.25:1, textDecoration:elim?"line-through":"none", userSelect:"none", display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontWeight:800, minWidth:20 }}>{String.fromCharCode(65+i)}</span>{opt}
                </button>
              );
            })}
            {feedback && (
              <div style={{ textAlign:"center", marginTop:10, fontWeight:700, color:feedback.correct?"#059669":"#dc2626" }}>
                {feedback.correct ? "✅ Correct!" : `❌ Answer: ${String.fromCharCode(65+feedback.correctIndex)}`}
              </div>
            )}
          </div>

          {/* Hint button */}
          {!feedback && hintsUsed < HINT_COSTS.length && (
            <button style={S.hintBtn} onClick={useHint}>
              💡 Hint #{hintsUsed+1} — costs {HINT_COSTS[Math.min(hintsUsed, HINT_COSTS.length-1)]}🪙 (eliminates 1 wrong option)
            </button>
          )}
        </div>
      )}

      {/* RESULT */}
      {view === "result" && result && (
        <div style={{ padding:16 }}>
          <div style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontSize:56 }}>{result.tie?"🤝":result.won?"🏆":"💔"}</div>
            <div style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>
              {result.tie ? "It's a Tie!" : result.won ? "You Won!" : "You Lost!"}
            </div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>vs {result.oppName} {result.isBot?"":""}</div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
              <div style={S.statBox}><div style={S.statVal}>{result.myScore}</div><div style={S.statKey}>Your Score</div></div>
              <div style={S.statBox}><div style={S.statVal}>{result.oppScore}</div><div style={S.statKey}>Their Score</div></div>
              <div style={{ ...S.statBox, background: result.coinsChange>=0?"#dcfce7":"#fee2e2" }}>
                <div style={{ ...S.statVal, color:result.coinsChange>=0?"#059669":"#dc2626" }}>
                  {result.coinsChange>=0?"+":""}{result.coinsChange}🪙
                </div>
                <div style={S.statKey}>Coins</div>
              </div>
            </div>

            {result.won && (
              <button style={{ ...S.btn, background:"#059669", marginBottom:10 }} onClick={() => setShowShare(true)}>
                📤 Share Victory
              </button>
            )}
            <button style={S.btnGhost} onClick={() => { setView("lobby"); setResult(null); loadHistory(); }}>
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SHARE CARD ──
function BattleShareCard({ profile, result, onClose }) {
  const cardRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const name = profile?.full_name || "Player";
  const date = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  useEffect(() => {
    if (!cardRef.current) return;
    const t = setTimeout(() => {
      import("html-to-image").then(({ toPng }) => {
        toPng(cardRef.current, { pixelRatio:2, skipFonts:true }).then(setImgUrl).catch(() => {});
      });
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const caption = [
    `⚔️ I just WON a 1v1 Battle on AIDLA!`,
    ``,
    `🏆 vs ${result.oppName}${result.isBot?" (Bot)":""}`,
    `📊 Score: ${result.myScore} vs ${result.oppScore}`,
    `🪙 Earned: +${result.coinsChange} coins`,
    ``,
    `Can you beat me? Challenge now 👇`,
    `👉 www.aidla.online/user/battle`,
    ``,
    `#AIDLA #1v1Battle #LearnAndEarn`,
  ].join("\n");

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:400, display:"flex", flexDirection:"column", gap:10 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontWeight:700 }}>✕</button>
        </div>
        <div ref={cardRef} style={{ borderRadius:16, overflow:"hidden", background:"white" }}>
          <div style={{ background:"#1e1b4b", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <img src="/logo.png" alt="AIDLA" style={{ width:30, height:30, borderRadius:8 }} />
              <div>
                <div style={{ fontSize:14, fontWeight:900, color:"white" }}>AIDLA</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)" }}>1v1 Battle</div>
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.15)", color:"white", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>⚔️ Winner</div>
          </div>
          <div style={{ background:"#f8faff", padding:"24px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid #6366f1" }} crossOrigin="anonymous" />
              : <div style={{ width:80, height:80, borderRadius:"50%", background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, color:"white" }}>{name[0]}</div>}
            <div style={{ fontSize:18, fontWeight:800, color:"#0f172a" }}>{name}</div>
            <div style={{ padding:"4px 16px", borderRadius:20, fontSize:12, fontWeight:700, color:"white", background:"#6366f1" }}>⚔️ Battle Champion</div>
          </div>
          <div style={{ display:"flex", borderTop:"1px solid #f1f5f9" }}>
            {[["Score",`${result.myScore} vs ${result.oppScore}`],["Earned",`+${result.coinsChange}🪙`],["Date",date]].map(([l,v],i) => (
              <div key={l} style={{ flex:1, padding:"12px 8px", textAlign:"center", borderRight:i<2?"1px solid #f1f5f9":"none" }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>{v}</div>
                <div style={{ fontSize:9, color:"#94a3b8", marginTop:2, textTransform:"uppercase", letterSpacing:0.5 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#1e1b4b", padding:"9px", textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>
            www.aidla.online · Earn While You Learn 🪙
          </div>
        </div>
        <div style={{ background:"#1e293b", borderRadius:12, padding:14 }}>
          <div style={{ fontSize:11, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Caption</div>
          <div style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"monospace" }}>{caption}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {imgUrl
            ? <a href={imgUrl} download="aidla-battle.png" style={{ flex:1, padding:"11px", background:"#6366f1", color:"white", borderRadius:10, fontWeight:700, fontSize:13, textDecoration:"none", textAlign:"center" }}>⬇ Download</a>
            : <div style={{ flex:1, padding:"11px", background:"#e2e8f0", color:"#94a3b8", borderRadius:10, fontSize:13, textAlign:"center" }}>Generating…</div>}
          <button style={{ flex:1, padding:"11px", background:"#059669", color:"white", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
            onClick={() => navigator.clipboard.writeText(caption).then(() => alert("Copied!"))}>
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  wrap: { fontFamily:"'DM Sans',sans-serif", maxWidth:560, margin:"0 auto", minHeight:"100vh", background:"#f9fafb" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"white", borderBottom:"1px solid #e2e8f0" },
  backBtn: { background:"none", border:"none", color:"#6366f1", fontWeight:700, fontSize:20, cursor:"pointer", padding:0 },
  headerTitle: { fontWeight:800, fontSize:16 },
  coins: { fontWeight:800, fontSize:14, color:"#0f172a" },
  toast: { background:"#1e293b", color:"white", padding:"10px 16px", fontSize:13, fontWeight:600 },
  tabs: { display:"flex", gap:4, marginBottom:12, background:"white", borderRadius:12, padding:4 },
  tab: { flex:1, padding:"8px 4px", border:"none", background:"transparent", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit", color:"#64748b", borderRadius:8 },
  tabActive: { background:"#6366f1", color:"white" },
  card: { background:"white", borderRadius:14, padding:20, marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" },
  cardTitle: { fontWeight:800, fontSize:14, marginBottom:12, color:"#0f172a" },
  label: { fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.04em" },
  btn: { width:"100%", padding:"13px", background:"#6366f1", color:"white", border:"none", borderRadius:12, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" },
  btnGhost: { width:"100%", padding:"12px", background:"#f1f5f9", color:"#334155", border:"none", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
  smBtn: { padding:"8px 12px", border:"1px solid #e2e8f0", background:"white", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", color:"#334155" },
  modeBtn: { width:"100%", padding:"14px 16px", border:"2px solid #e2e8f0", borderRadius:12, background:"white", textAlign:"left", cursor:"pointer", fontFamily:"inherit", transition:"border-color 0.15s" },
  catBtn: { padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:8, background:"white", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", color:"#334155", textAlign:"left" },
  catBtnActive: { border:"2px solid #6366f1", background:"#eef2ff", color:"#4338ca" },
  statBox: { background:"#f8fafc", borderRadius:10, padding:"10px 8px", textAlign:"center" },
  statVal: { fontWeight:800, fontSize:16 },
  statKey: { fontSize:10, color:"#94a3b8", marginTop:2 },
  lbRow: { display:"flex", alignItems:"center", gap:8, padding:"9px 0", borderBottom:"1px solid #f1f5f9" },
  avatar: { width:28, height:28, borderRadius:"50%", objectFit:"cover" },
  empty: { textAlign:"center", color:"#94a3b8", padding:20, fontSize:13 },
  progressBar: { width:"100%", height:6, background:"#e2e8f0", borderRadius:20, overflow:"hidden" },
  progressFill: { height:"100%", background:"#6366f1", borderRadius:20, width:"60%" },
  timerBar: { width:"100%", height:4, background:"#e2e8f0", borderRadius:4, overflow:"hidden", marginBottom:6 },
  timerFill: { height:"100%", borderRadius:4, transition:"width 1s linear" },
  hintBtn: { width:"100%", padding:"10px", background:"#fffbeb", border:"1px solid #fde047", borderRadius:10, color:"#854d0e", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginTop:4 },
  inviteOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 },
  invitePopup: { background:"white", borderRadius:20, padding:"28px 24px", maxWidth:320, width:"100%", textAlign:"center", boxShadow:"0 24px 64px rgba(0,0,0,0.25)" },
  input: { flex:1, border:"1px solid #e2e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", fontFamily:"inherit", minWidth:0 },
};
