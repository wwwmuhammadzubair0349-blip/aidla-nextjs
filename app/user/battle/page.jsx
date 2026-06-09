"use client";
/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, @next/next/no-img-element, @next/next/no-page-custom-font */
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";

const MODES = [
  { id:"free",  label:"Free",       stake:0,   prize:10,  tax:0,  color:"#059669", glow:"rgba(5,150,105,0.25)",  icon:"🎮", badge:"FREE" },
  { id:"25",    label:"25 Coins",   stake:25,  prize:45,  tax:5,  color:"#6366f1", glow:"rgba(99,102,241,0.25)", icon:"⚔️", badge:"25" },
  { id:"50",    label:"50 Coins",   stake:50,  prize:90,  tax:10, color:"#f59e0b", glow:"rgba(245,158,11,0.25)", icon:"🔥", badge:"50" },
  { id:"100",   label:"100 Coins",  stake:100, prize:180, tax:20, color:"#ef4444", glow:"rgba(239,68,68,0.25)",  icon:"👑", badge:"100" },
];

const HINT_COSTS  = [2.5, 5, 10, 20, 40];
const CHAT_EMOJIS = ["😀","😂","😎","😡","😭","🔥","💯","👍","👎","❤️","🎉"];
const STUN        = { iceServers:[
  { urls:"stun:stun.l.google.com:19302" },
  { urls:"stun:stun1.l.google.com:19302" },
  { urls:"turn:openrelay.metered.ca:80",     username:"openrelayproject", credential:"openrelayproject" },
  { urls:"turn:openrelay.metered.ca:443",    username:"openrelayproject", credential:"openrelayproject" },
  { urls:"turn:openrelay.metered.ca:443?transport=tcp", username:"openrelayproject", credential:"openrelayproject" },
] };

function AvatarCircle({ url, name, size = 44, ring = "#6366f1" }) {
  if (url) {
    return (
      <img src={url} alt={name || "Player"}
        style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover",
          border:`3px solid ${ring}`, flexShrink:0, display:"block" }} />
    );
  }
  const initials = (name || "?").split(" ").filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
  const palette   = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#059669","#0284c7","#dc2626","#d97706"];
  const bg        = palette[(name || "?").charCodeAt(0) % palette.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size * 0.33, fontWeight:800, color:"white",
      border:`3px solid ${ring}`, flexShrink:0 }}>
      {initials}
    </div>
  );
}

function diffBadge(diff) {
  const map = { easy:["#dcfce7","#166534"], medium:["#fef9c3","#854d0e"], hard:["#fee2e2","#991b1b"] };
  return map[diff] || ["#f1f5f9","#475569"];
}

export default function BattlePage() {
  const [user,       setUser]       = useState(null);
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("lobby");
  const [activeTab,  setActiveTab]  = useState("play");
  const [msg,        setMsg]        = useState("");

  const [room,    setRoom]    = useState(null);
  const [myRole,  setMyRole]  = useState(null);
  const [openRooms, setOpenRooms] = useState([]);

  const [categories,         setCategories]         = useState([]);
  const [selCategory,        setSelCategory]        = useState(null);
  const [selDifficulty,      setSelDifficulty]      = useState("medium");
  const [selQuestions,       setSelQuestions]       = useState(10);
  const [submittingSelection,setSubmittingSelection]= useState(false);

  const [questions,    setQuestions]    = useState([]);
  const [qIndex,       setQIndex]       = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(30);
  const [selected,     setSelected]     = useState(null);
  const [feedback,     setFeedback]     = useState(null);
  const [myScore,      setMyScore]      = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [hintsUsed,    setHintsUsed]    = useState(0);
  const [eliminated,   setEliminated]   = useState([]);
  const [generatingQ,  setGeneratingQ]  = useState(false);

  const [result,    setResult]    = useState(null);
  const [showShare, setShowShare] = useState(false);

  const [history,     setHistory]     = useState([]);
  const [myStats,     setMyStats]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbPeriod,    setLbPeriod]    = useState("daily");

  // NEW
  const [opponentProfile,  setOpponentProfile]  = useState(null);

  // Voice + emoji
  const [micOn,           setMicOn]           = useState(false);
  const [speakerOn,       setSpeakerOn]       = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sentEmoji,       setSentEmoji]       = useState(null);
  const [receivedEmoji,   setReceivedEmoji]   = useState(null);

  // UI state
  const [lbLoading,         setLbLoading]         = useState(false);
  const [lbLoaded,          setLbLoaded]          = useState(false);
  const [joiningRoomId,     setJoiningRoomId]     = useState(null);
  const [selectionTimeLeft, setSelectionTimeLeft] = useState(0);
  const [confirmForfeit,    setConfirmForfeit]    = useState(false);
  const [botWaitSecs,       setBotWaitSecs]       = useState(12);
  const [copiedId,          setCopiedId]          = useState(false);
  const [copiedLink,        setCopiedLink]        = useState(false);

  const pollRef           = useRef(null);
  const roomSyncRef       = useRef(null);
  const roomChannelRef    = useRef(null);
  const roomChannelReadyRef = useRef(false);
  const openRoomsPollRef  = useRef(null);
  const botTimerRef       = useRef(null);
  const timerRef          = useRef(null);
  const submitLock        = useRef(false);
  const roomTimeoutRef    = useRef(null);
  const sessionRef        = useRef(null);
  const roomRef           = useRef(null);
  const currentRoomIdRef  = useRef(null);
  const myRoleRef         = useRef(null);
  const viewRef           = useRef("lobby");
  const startedRoundsRef  = useRef(new Set());
  const completedRoundsRef= useRef(new Set());
  const forfeitLockRef    = useRef(false);
  const botAnsweredRef    = useRef(new Set());
  const roundTotalsRef        = useRef({ 1:0, 2:0 });
  const opponentFetchedRef    = useRef(false);

  // Voice + emoji refs
  const pcRef                 = useRef(null);
  const localStreamRef        = useRef(null);
  const remoteAudioRef        = useRef(null);
  const speakerOnRef          = useRef(true);
  const iceCandidateQueueRef  = useRef([]);
  const emojiTimeoutRef       = useRef(null);
  const sentEmojiTimeoutRef   = useRef(null);
  const mediaRecorderRef      = useRef(null);
  const voiceSliceTimerRef    = useRef(null);
  const realtimeVoiceActiveRef= useRef(false);
  const audioChunkQueueRef    = useRef([]);
  const audioChunkPlayingRef  = useRef(false);
  const audioContextRef       = useRef(null);
  const audioUnlockedRef      = useRef(false);
  const nextAudioPlayTimeRef  = useRef(0);
  const webrtcConnectedRef    = useRef(false);

  // New refs for fixes
  const botR2TimerRef         = useRef(null);
  const flashTimeoutRef       = useRef(null);
  const emojiRateLimitRef     = useRef(0);
  const hintLockRef           = useRef(false);
  const selectionTimerRef     = useRef(null);
  const botCountdownTimerRef  = useRef(null);
  const sentEmojiIdRef        = useRef(0);
  const receivedEmojiIdRef    = useRef(0);
  const selectionResetKeyRef  = useRef("");

  const [selectedMode,   setSelectedMode]   = useState(null);
  const [joinRoomInput,  setJoinRoomInput]  = useState("");
  const [currentRoomId,  setCurrentRoomId]  = useState(null);
  const [isPrivateRoom,  setIsPrivateRoom]  = useState(false);

  useEffect(() => {
    init();
    return () => {
      clearAllTimers();
      if (roomChannelRef.current) supabase.removeChannel(roomChannelRef.current);
    };
  }, []);

  useEffect(() => { roomRef.current       = room;         }, [room]);
  useEffect(() => { currentRoomIdRef.current = currentRoomId; }, [currentRoomId]);
  useEffect(() => { myRoleRef.current     = myRole;       }, [myRole]);
  useEffect(() => { viewRef.current       = view;         }, [view]);

  useEffect(() => { speakerOnRef.current = speakerOn; }, [speakerOn]);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once:true });
    window.addEventListener("keydown", unlock, { once:true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Auto-refresh open rooms every 1 s while on that tab
  useEffect(() => {
    if (view === "lobby" && activeTab === "open") {
      loadOpenRooms();
      clearInterval(openRoomsPollRef.current);
      openRoomsPollRef.current = setInterval(loadOpenRooms, 5000);
    } else {
      clearInterval(openRoomsPollRef.current);
    }
    return () => clearInterval(openRoomsPollRef.current);
  }, [activeTab, view]);

  function clearAllTimers() {
    clearInterval(pollRef.current);
    clearInterval(botTimerRef.current);
    clearInterval(timerRef.current);
    clearInterval(openRoomsPollRef.current);
    clearInterval(selectionTimerRef.current);
    clearTimeout(roomTimeoutRef.current);
    clearTimeout(botR2TimerRef.current);
    clearTimeout(flashTimeoutRef.current);
    clearTimeout(emojiTimeoutRef.current);
    clearTimeout(sentEmojiTimeoutRef.current);
    clearTimeout(botCountdownTimerRef.current);
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }
    roomChannelReadyRef.current = false;
    cleanupVoiceResources();
  }

  function roundFromRoom(r) {
    return Number(r?.current_round) || (r?.round2_category ? 2 : 1);
  }

  function myRoundScore(r, round = currentRound) {
    if (!r || !myRoleRef.current) return 0;
    return Number(r[`${myRoleRef.current}_round${round}_score`]) || 0;
  }

  async function fetchOpponentProfile(r) {
    if (r.is_bot) return;
    const oppId = myRoleRef.current === "player1" ? r.player2_id : r.player1_id;
    if (!oppId) return;
    const { data } = await supabase.from("users_profiles")
      .select("full_name, avatar_url").eq("user_id", oppId).maybeSingle();
    if (data) setOpponentProfile(data);
  }

  async function goLobby() {
    const r    = roomRef.current;
    const role = myRoleRef.current;
    clearAllTimers();
    setConfirmForfeit(false);
    setSelectionTimeLeft(0);
    setBotWaitSecs(12);
    if ((r?.id || currentRoomIdRef.current) && viewRef.current === "waiting")
      await supabase.rpc("battle_cancel_room", { p_room_id: r?.id || currentRoomIdRef.current });
    if (r?.id && role && ["selecting","in_progress","waiting_round","waiting_round2"].includes(viewRef.current))
      await supabase.rpc("battle_forfeit", { p_room_id: r.id, p_role: role });
    setRoom(null);
    setCurrentRoomId(null);
    setIsPrivateRoom(false);
    startedRoundsRef.current.clear();
    completedRoundsRef.current.clear();
    botAnsweredRef.current.clear();
    forfeitLockRef.current    = false;
    opponentFetchedRef.current= false;
    roundTotalsRef.current    = { 1:0, 2:0 };
    hintLockRef.current       = false;
    setOpponentProfile(null);
    resetSelectionState();
    cleanupVoice();
    setView("lobby");
    setActiveTab("play");
  }

  async function forfeitNow() {
    const r    = roomRef.current;
    const role = myRoleRef.current;
    if (!r?.id || !role || forfeitLockRef.current) return;
    forfeitLockRef.current = true;
    await supabase.rpc("battle_forfeit", { p_room_id: r.id, p_role: role });
    clearAllTimers();
    const { data: finalRoom } = await supabase.rpc("battle_get_room", { p_room_id: r.id });
    if (finalRoom) handleResult(finalRoom);
    else { flash("Eliminated - opponent wins."); setView("lobby"); }
  }

  // ── Voice + emoji helpers ───────────────────────────────────────────────────

  function cleanupVoiceResources() {
    stopRealtimeVoice();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (_) {}
      pcRef.current = null;
    }
    iceCandidateQueueRef.current = [];
    audioChunkQueueRef.current = [];
    audioChunkPlayingRef.current = false;
    nextAudioPlayTimeRef.current = 0;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    audioUnlockedRef.current = false;
    webrtcConnectedRef.current = false;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  }

  function cleanupVoice() {
    cleanupVoiceResources();
    setMicOn(false);
    setShowEmojiPicker(false);
    setSentEmoji(null);
    setReceivedEmoji(null);
    emojiRateLimitRef.current = 0;
    hintLockRef.current = false;
  }

  function resetSelectionState() {
    setSelCategory(null);
    setSubmittingSelection(false);
    setGeneratingQ(false);
  }

  function createPC() {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(STUN);
    pcRef.current = pc;
    try { pc.addTransceiver("audio", { direction:"sendrecv" }); } catch (_) {}
    pc.onicecandidate = async (e) => {
      if (!e.candidate || !roomChannelRef.current) return;
      if (!(await waitForRoomChannel(5000))) return;
      await roomChannelRef.current.send({
        type:"broadcast", event:"webrtc-ice",
        payload:{ from:myRoleRef.current, candidate:e.candidate.toJSON() },
      });
    };
    pc.ontrack = (e) => {
      console.log("[WebRTC] ontrack", e.track.kind, "streams:", e.streams.length);
      if (!remoteAudioRef.current) return;
      const stream = e.streams?.[0] || new MediaStream([e.track]);
      remoteAudioRef.current.srcObject = stream;
      remoteAudioRef.current.muted = !speakerOnRef.current;
      remoteAudioRef.current.play().catch(() => {
        const tryPlay = () => { remoteAudioRef.current?.play().catch(() => {}); };
        window.addEventListener("pointerdown", tryPlay, { once: true });
        window.addEventListener("keydown", tryPlay, { once: true });
      });
    };
    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] connectionState:", pc.connectionState);
      webrtcConnectedRef.current = pc.connectionState === "connected";
    };
    pc.oniceconnectionstatechange = () => {
      console.log("[WebRTC] iceState:", pc.iceConnectionState);
      webrtcConnectedRef.current = ["connected", "completed"].includes(pc.iceConnectionState);
    };
    pc.onnegotiationneeded = async () => {
      if (myRoleRef.current !== "player1" || !localStreamRef.current) return;
      console.log("[WebRTC] onnegotiationneeded, signalingState:", pc.signalingState);
      await initiateOffer();
    };
    return pc;
  }

  function addLocalTracks(pc) {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(track => {
      const audioSender = pc.getSenders().find(s => s.track?.kind === "audio");
      if (audioSender) {
        audioSender.replaceTrack(track).catch(() => {});
      } else {
        // addTrack reuses the sendrecv transceiver from addTransceiver and triggers onnegotiationneeded
        pc.addTrack(track, localStreamRef.current);
      }
    });
  }

  function detachLocalTracks() {
    pcRef.current?.getSenders()
      .filter(s => s.track?.kind === "audio")
      .forEach(s => s.replaceTrack(null).catch(() => {}));
  }

  async function waitForRoomChannel(timeout = 5000) {
    let waited = 0;
    while (!roomChannelReadyRef.current && waited < timeout) {
      await new Promise(r => setTimeout(r, 100));
      waited += 100;
    }
    return roomChannelReadyRef.current;
  }

  function getAudioMimeType() {
    if (typeof MediaRecorder === "undefined") return "";
    return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
      .find(t => MediaRecorder.isTypeSupported(t)) || "";
  }

  async function unlockAudio() {
    if (audioUnlockedRef.current || typeof window === "undefined") return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        // latencyHint:'interactive' minimises AudioContext output buffering
        audioContextRef.current ||= new AC({ latencyHint: "interactive" });
        await audioContextRef.current.resume();
      }
      audioUnlockedRef.current = true;
    } catch (_) {}
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || "").split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function base64ToBlob(data, mime) {
    const raw = atob(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    return new Blob([bytes], { type: mime || "audio/webm" });
  }

  function stopRealtimeVoice() {
    realtimeVoiceActiveRef.current = false;
    clearTimeout(voiceSliceTimerRef.current);
    if (mediaRecorderRef.current?.state && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    mediaRecorderRef.current = null;
  }

  function startRealtimeVoice(stream) {
    if (!stream || realtimeVoiceActiveRef.current || typeof MediaRecorder === "undefined") return;
    realtimeVoiceActiveRef.current = true;
    const mimeType = getAudioMimeType();
    const SLICE_MS = 200; // 200ms slices → ~300ms end-to-end latency vs 900ms before
    const recordSlice = () => {
      if (!realtimeVoiceActiveRef.current || !stream.getAudioTracks().some(t => t.readyState === "live")) return;
      const chunks = [];
      let recorder;
      try {
        recorder = new MediaRecorder(stream, {
          ...(mimeType ? { mimeType } : {}),
          audioBitsPerSecond: 32000,
        });
      } catch (_) {
        return;
      }
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
      recorder.onstop = async () => {
        if (!webrtcConnectedRef.current && chunks.length && roomChannelRef.current && await waitForRoomChannel(1000)) {
          const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
          const data = await blobToBase64(blob).catch(() => "");
          if (data) {
            console.log("[Voice] fallback chunk tx size:", data.length, "type:", blob.type);
            await roomChannelRef.current.send({
              type:"broadcast", event:"voice-chunk",
              payload:{ from:myRoleRef.current, mime:blob.type, data },
            }).catch(() => {});
          }
        }
        if (realtimeVoiceActiveRef.current)
          voiceSliceTimerRef.current = setTimeout(recordSlice, 10);
      };
      recorder.start();
      voiceSliceTimerRef.current = setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, SLICE_MS);
    };
    recordSlice();
  }

  // Direct AudioContext scheduling — no queue, no lock, no gap between chunks.
  // Each chunk is decoded as it arrives and scheduled at an exact future time.
  // The AudioContext scheduler (running on the audio thread) handles gapless
  // playback with sample-accurate timing regardless of JS main-thread jank.
  async function enqueueAudioChunk(payload) {
    if (!payload?.data || !speakerOnRef.current) return;
    await unlockAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    try {
      const blob = base64ToBlob(payload.data, payload.mime);
      const arrayBuf = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuf);
      const now = ctx.currentTime;
      // If scheduled clock drifted >150ms into the past (network gap / tab hidden),
      // reset it so we play immediately instead of dumping stale audio.
      if (nextAudioPlayTimeRef.current < now - 0.15) nextAudioPlayTimeRef.current = 0;
      const startAt = Math.max(now + 0.01, nextAudioPlayTimeRef.current);
      nextAudioPlayTimeRef.current = startAt + audioBuffer.duration;
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(startAt);
    } catch (_) {}
  }

  async function initiateOffer() {
    if (!(await waitForRoomChannel())) return;
    const pc = createPC();
    addLocalTracks(pc);
    if (pc.signalingState !== "stable") {
      console.log("[WebRTC] offer skipped, signalingState:", pc.signalingState);
      return;
    }
    console.log("[WebRTC] creating offer, senders:", pc.getSenders().map(s => s.track?.kind ?? "null"));
    try {
      const offer = await pc.createOffer({ voiceActivityDetection: false });
      await pc.setLocalDescription(offer);
      console.log("[WebRTC] offer sent");
      await roomChannelRef.current?.send({
        type:"broadcast", event:"webrtc-offer",
        payload:{ from:myRoleRef.current, sdp:pc.localDescription.sdp },
      });
    } catch (err) {
      console.error("[WebRTC] offer error:", err);
    }
  }

  async function toggleMic() {
    if (micOn) {
      stopRealtimeVoice();
      detachLocalTracks();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      setMicOn(false);
    } else {
      try {
        const perm = await navigator.permissions.query({ name:"microphone" }).catch(() => null);
        if (perm?.state === "denied") {
          flash("Microphone blocked — click the lock 🔒 in your address bar to allow it");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: { ideal: 16000 },
          },
          video: false,
        });
        localStreamRef.current = stream;
        console.log("[Mic] acquired (toggle), tracks:", stream.getAudioTracks().map(t => `${t.label} ${t.readyState}`));
        startRealtimeVoice(stream);
        setMicOn(true);
        if (pcRef.current) addLocalTracks(pcRef.current);
        if (await waitForRoomChannel())
          await roomChannelRef.current?.send({ type:"broadcast", event:"mic-on", payload:{ from:myRoleRef.current } });
        if (myRoleRef.current === "player1") await initiateOffer();
      } catch (err) {
        if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
          flash("Microphone blocked — click the lock 🔒 in your address bar to allow it");
        } else {
          flash("Could not access microphone");
        }
      }
    }
  }

  function toggleSpeaker() {
    setSpeakerOn(s => {
      const next = !s;
      speakerOnRef.current = next;
      if (remoteAudioRef.current) remoteAudioRef.current.muted = !next;
      if (next) {
        unlockAudio();
        remoteAudioRef.current?.play().catch(() => {});
      }
      return next;
    });
  }

  async function sendEmoji(emoji) {
    const now = Date.now();
    if (now - emojiRateLimitRef.current < 800) return;
    emojiRateLimitRef.current = now;
    setShowEmojiPicker(false);
    sentEmojiIdRef.current += 1;
    setSentEmoji(emoji);
    clearTimeout(sentEmojiTimeoutRef.current);
    sentEmojiTimeoutRef.current = setTimeout(() => setSentEmoji(null), 2500);
    const ch = roomChannelRef.current;
    if (!ch) return;
    if (!(await waitForRoomChannel())) return;
    await ch.send({ type:"broadcast", event:"emoji", payload:{ from:myRoleRef.current, emoji } });
  }

  // ───────────────────────────────────────────────────────────────────────────

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
    const params  = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");
    if (urlRoom) { setJoinRoomInput(urlRoom); return; }
    // Reconnect: rejoin any room left in progress after a browser crash/refresh
    const uid = session.user.id;
    const { data: active } = await supabase
      .from("battle_rooms")
      .select("*")
      .or(`player1_id.eq.${uid},player2_id.eq.${uid}`)
      .in("status", ["selecting","in_progress"])
      .order("created_at", { ascending: false })
      .limit(1);
    const activeRoom = active?.[0];
    if (activeRoom) {
      const role = activeRoom.player1_id === uid ? "player1" : "player2";
      myRoleRef.current = role;
      setMyRole(role);
      setCurrentRoomId(activeRoom.id);
      setRoom(activeRoom);
      startedRoundsRef.current.clear();
      completedRoundsRef.current.clear();
      botAnsweredRef.current.clear();
      forfeitLockRef.current    = false;
      opponentFetchedRef.current= false;
      fetchOpponentProfile(activeRoom);
      watchRoom(activeRoom.id);
      await pollRoom(activeRoom.id, false);
    }
  }

  async function loadOpenRooms() {
    const { data } = await supabase.rpc("battle_open_rooms");
    setOpenRooms(data || []);
  }

  async function loadHistory() {
    const { data } = await supabase.rpc("battle_my_stats");
    if (data?.ok) { setMyStats(data); setHistory(data.history || []); }
  }

  async function loadLeaderboard(period = lbPeriod) {
    if (lbLoaded && period === lbPeriod) return;
    setLbLoading(true);
    const { data } = await supabase.rpc("battle_leaderboard", { p_period: period });
    setLeaderboard(data || []);
    setLbLoaded(true);
    setLbLoading(false);
  }

  async function findBattle(mode) {
    const modeObj = MODES.find(m => m.id === mode);
    if (modeObj.stake > 0 && profile?.total_aidla_coins < modeObj.stake) { flash("Insufficient coins"); return; }
    setView("waiting");
    setIsPrivateRoom(false);
    setRoom(null);
    resetSelectionState();
    startedRoundsRef.current.clear();
    completedRoundsRef.current.clear();
    botAnsweredRef.current.clear();
    forfeitLockRef.current = false;
    const { data, error } = await supabase.rpc("battle_find_or_create", { p_mode: mode });
    if (error || !data?.ok) { flash(data?.error || error?.message); setView("lobby"); return; }
    myRoleRef.current = data.role;
    setMyRole(data.role);
    setCurrentRoomId(data.room_id);
    watchRoom(data.room_id);
    await pollRoom(data.room_id, true);
  }

  async function joinRoom(roomId) {
    if (joiningRoomId) return;
    setJoiningRoomId(roomId);
    resetSelectionState();
    const { data, error } = await supabase.rpc("battle_join_room", { p_room_id: roomId });
    if (error || !data?.ok) { flash(data?.error || error?.message); setJoiningRoomId(null); return; }
    myRoleRef.current = "player2";
    setMyRole("player2");
    setCurrentRoomId(data.room_id);
    setIsPrivateRoom(false);
    startedRoundsRef.current.clear();
    completedRoundsRef.current.clear();
    botAnsweredRef.current.clear();
    forfeitLockRef.current    = false;
    opponentFetchedRef.current= false;
    setOpponentProfile(null);
    setJoiningRoomId(null);
    setView("waiting");
    watchRoom(data.room_id);
    await pollRoom(data.room_id, false);
  }

  async function pollRoom(roomId, startBotTimer) {
    clearInterval(pollRef.current);
    clearInterval(roomSyncRef.current);
    if (startBotTimer) {
      botTimerRef.current = setTimeout(async () => {
        const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: roomId });
        if (r?.status === "waiting") await supabase.rpc("battle_add_bot", { p_room_id: roomId });
      }, 12000);
    }
    pollRef.current = setInterval(async () => {
      const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: roomId });
      if (!r) return;
      setRoom(r);
      const rn = roundFromRoom(r);
      setCurrentRound(rn);
      setMyScore(myRoundScore(r, rn));
      if (r.status === "selecting") {
        if (!opponentFetchedRef.current) {
          opponentFetchedRef.current = true;
          fetchOpponentProfile(r);
        }
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

  useEffect(() => {
    const round = room?.round1_category ? 2 : 1;
    const key = view === "selecting" && room?.id && isMySelectorTurn()
      ? `${room.id}:${round}:${myRole}`
      : "";
    if (!key || selectionResetKeyRef.current === key) return;
    selectionResetKeyRef.current = key;
    resetSelectionState();
  }, [view, room?.id, room?.round1_category, myRole]);

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
    setGeneratingQ(true);
    const { data: prep, error: prepErr } = await supabase.rpc("battle_prepare_round", {
      p_room_id: room.id, p_round: round
    });
    setGeneratingQ(false);
    if (prepErr || !prep?.ok) {
      flash(prep?.error || prepErr?.message || "No questions found");
      setSubmittingSelection(false);
      return;
    }
    // Keep submittingSelection=true so the Lock button does not re-appear while waiting for in_progress
    if (room.is_bot && round === 1) {
      clearTimeout(botR2TimerRef.current);
      botR2TimerRef.current = setTimeout(async () => {
        const botCat = categories[Math.floor(Math.random() * categories.length)];
        const diffs  = ["easy","medium","hard"];
        const qs     = [5,10,15,20];
        await supabase.rpc("battle_set_round", {
          p_room_id: room.id, p_round: 2,
          p_category_id: botCat.id, p_category: botCat.name,
          p_difficulty: diffs[Math.floor(Math.random()*3)],
          p_questions:  qs[Math.floor(Math.random()*4)],
        });
        await supabase.rpc("battle_prepare_round", { p_room_id: room.id, p_round: 2 });
      }, 3000 + Math.random() * 4000);
    }
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
    // Track total questions for this round (for score display + result breakdown)
    roundTotalsRef.current[roundNum] = data.questions.length;
    const diff    = r[`round${roundNum}_difficulty`];
    const secPerQ = diff === "hard" ? 10 : diff === "easy" ? 15 : 12;
    startTimer(secPerQ);
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
  }

  async function syncRoom(roomId) {
    const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: roomId });
    if (!r) return;
    setRoom(r);
    const rn = roundFromRoom(r);
    setCurrentRound(rn);
    setMyScore(myRoundScore(r, rn));
    if (r.status === "completed") {
      // Don't interrupt the local player if they are still actively playing round 2
      if (viewRef.current === "in_progress" && !completedRoundsRef.current.has(rn)) return;
      clearAllTimers();
      handleResult(r);
    }
  }

  function watchRoom(roomId) {
    clearInterval(roomSyncRef.current);
    if (roomChannelRef.current) supabase.removeChannel(roomChannelRef.current);
    roomChannelReadyRef.current = false;
    roomSyncRef.current = setInterval(() => syncRoom(roomId), 5000);
    roomChannelRef.current = supabase
      .channel(`battle-room:${roomId}`, { config: { broadcast: { ack: false, self: false } } })
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"battle_rooms", filter:`id=eq.${roomId}` }, ({ new: r }) => {
        setRoom(r);
        const rn = roundFromRoom(r);
        setCurrentRound(rn);
        setMyScore(myRoundScore(r, rn));
        if (r.status === "completed") {
          // Don't interrupt the local player if they are still actively playing round 2
          if (viewRef.current === "in_progress" && !completedRoundsRef.current.has(rn)) return;
          clearAllTimers();
          handleResult(r);
        }
      })
      // ── Emoji broadcast ───────────────────────────────────────────────────
      .on("broadcast", { event:"emoji" }, ({ payload }) => {
        if (!payload || payload.from === myRoleRef.current) return;
        receivedEmojiIdRef.current += 1;
        setReceivedEmoji(payload.emoji);
        clearTimeout(emojiTimeoutRef.current);
        emojiTimeoutRef.current = setTimeout(() => setReceivedEmoji(null), 2500);
      })
      .on("broadcast", { event:"voice-chunk" }, ({ payload }) => {
        if (!payload || payload.from === myRoleRef.current) return;
        console.log("[Voice] chunk rx size:", payload.data?.length, "webrtc:", webrtcConnectedRef.current);
        enqueueAudioChunk(payload);
      })
      // ── WebRTC signaling broadcasts ───────────────────────────────────────
      .on("broadcast", { event:"mic-on" }, ({ payload }) => {
        if (!payload || payload.from === myRoleRef.current) return;
        console.log("[WebRTC] mic-on from", payload.from, "myRole:", myRoleRef.current);
        if (myRoleRef.current === "player1") {
          // Offer now (will include our mic if we have it) and retry in 2.5s
          // in case first offer/answer cycle is still in flight
          initiateOffer();
          setTimeout(() => initiateOffer(), 2500);
        } else {
          createPC();
        }
      })
      .on("broadcast", { event:"webrtc-offer" }, async ({ payload }) => {
        if (!payload || payload.from === myRoleRef.current) return;
        console.log("[WebRTC] offer rx from", payload.from);
        const pc = createPC();
        addLocalTracks(pc);
        try {
          await pc.setRemoteDescription({ type:"offer", sdp:payload.sdp });
          for (const c of iceCandidateQueueRef.current)
            await pc.addIceCandidate(c).catch(() => {});
          iceCandidateQueueRef.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log("[WebRTC] answer sent, senders:", pc.getSenders().map(s => s.track?.kind ?? "null"));
          await roomChannelRef.current?.send({
            type:"broadcast", event:"webrtc-answer",
            payload:{ from:myRoleRef.current, sdp:pc.localDescription.sdp },
          });
        } catch (err) {
          console.error("[WebRTC] offer-handle error:", err);
        }
      })
      .on("broadcast", { event:"webrtc-answer" }, async ({ payload }) => {
        if (!payload || payload.from === myRoleRef.current) return;
        console.log("[WebRTC] answer rx from", payload.from, "signalingState:", pcRef.current?.signalingState);
        if (pcRef.current?.signalingState === "have-local-offer") {
          try {
            await pcRef.current.setRemoteDescription({ type:"answer", sdp:payload.sdp });
            for (const c of iceCandidateQueueRef.current)
              await pcRef.current.addIceCandidate(c).catch(() => {});
            iceCandidateQueueRef.current = [];
            console.log("[WebRTC] answer applied, iceState:", pcRef.current?.iceConnectionState);
          } catch (err) {
            console.error("[WebRTC] answer error:", err);
          }
        }
      })
      .on("broadcast", { event:"webrtc-ice" }, async ({ payload }) => {
        if (!payload || payload.from === myRoleRef.current) return;
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(payload.candidate).catch(() => {});
        } else {
          iceCandidateQueueRef.current.push(payload.candidate);
        }
      })
      .subscribe((status) => {
        console.log("[Channel] status:", status, "role:", myRoleRef.current);
        roomChannelReadyRef.current = status === "SUBSCRIBED";
        // Intentionally NOT offering here — offer only after mic is acquired
        // so the SDP actually contains an audio track.
      });
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
    if (timeLeft === 0 && view === "in_progress" && !feedback && !submitLock.current)
      handleAnswer(null);
  }, [timeLeft]);

  async function handleAnswer(optionIdx) {
    if (submitLock.current || !room) return;
    submitLock.current = true;
    clearInterval(timerRef.current);
    const q        = questions[qIndex];
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
    if (scoreRoom) { setRoom(scoreRoom); setMyScore(myRoundScore(scoreRoom, currentRound)); }
    else if (correct) setMyScore(s => s + 1);
    setFeedback({ correct, correctIndex: q.correct_option_index });
    if (room.is_bot) await submitBotAnswerForQuestion(room, currentRound, qIndex, q, scoreRoom, correct);
    await new Promise(r => setTimeout(r, 1000));
    const next = qIndex + 1;
    if (next >= questions.length) {
      completedRoundsRef.current.add(currentRound);
      clearInterval(pollRef.current);
      await supabase.rpc("battle_finish_round", { p_room_id: room.id, p_round: currentRound, p_is_bot: false });
      if (room.is_bot) await supabase.rpc("battle_finish_round", { p_room_id: room.id, p_round: currentRound, p_is_bot: true });
      if (currentRound === 1) {
        resetSelectionState();
        setQIndex(0);
        setFeedback(null);
        setSelected(null);
        submitLock.current = false;
        const { data: latestRoom } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
        if (latestRoom) setRoom(latestRoom);
        const bothDone = latestRoom?.player1_round1_done && latestRoom?.player2_round1_done;
        setView(bothDone ? "selecting" : "waiting_round");
        pollRef.current = setInterval(async () => {
          const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
          if (!r) return;
          setRoom(r);
          if (viewRef.current === "waiting_round" && r.player1_round1_done && r.player2_round1_done)
            setView("selecting");
          if (r.round2_category && r.status === "in_progress" && !completedRoundsRef.current.has(2)) {
            const { data: qd } = await supabase.rpc("battle_get_questions", { p_room_id: r.id, p_round: 2 });
            if (qd?.questions?.length) { clearInterval(pollRef.current); await startRound(r, 2); }
          }
        }, 2000);
      } else {
        clearInterval(pollRef.current);
        const { data: latestRoom } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
        if (latestRoom) setRoom(latestRoom);
        if (latestRoom?.status === "completed") {
          handleResult(latestRoom);
          return;
        }
        const bothDone = latestRoom?.player1_round2_done && latestRoom?.player2_round2_done;
        if (bothDone) {
          const { data: comp } = await supabase.rpc("battle_complete", { p_room_id: room.id });
          if (comp?.ok || comp?.already_done) {
            const { data: finalRoom } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
            handleResult(finalRoom || latestRoom);
          }
        } else {
          setView("waiting_round2");
          pollRef.current = setInterval(async () => {
            const { data: r } = await supabase.rpc("battle_get_room", { p_room_id: room.id });
            if (!r) return;
            setRoom(r);
            if (r.status === "completed") {
              clearInterval(pollRef.current);
              handleResult(r);
            } else if (r.player1_round2_done && r.player2_round2_done) {
              clearInterval(pollRef.current);
              const { data: comp } = await supabase.rpc("battle_complete", { p_room_id: r.id });
              if (comp?.ok || comp?.already_done) {
                const { data: finalRoom } = await supabase.rpc("battle_get_room", { p_room_id: r.id });
                handleResult(finalRoom || r);
              }
            }
          }, 2000);
        }
      }
    } else {
      setQIndex(next);
      setSelected(null);
      setFeedback(null);
      setEliminated([]);
      submitLock.current = false;
      const curDiff = room?.[`round${currentRound}_difficulty`];
      const secPerQ = curDiff === "hard" ? 10 : curDiff === "easy" ? 15 : 12;
      startTimer(secPerQ);
    }
  }

  useEffect(() => {
    if (view !== "in_progress" || !room?.id) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") { submitLock.current = true; forfeitNow(); }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { document.removeEventListener("visibilitychange", onVisibility); };
  }, [view, room?.id, myRole, qIndex]);


  useEffect(() => {
    if (!room?.id || !["in_progress","selecting"].includes(view)) return;
    const onUnload = () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      try { if (pcRef.current) pcRef.current.close(); } catch (_) {}
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/battle_forfeit`, {
        method: "POST", keepalive: true,
        headers: { "Content-Type":"application/json", apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${sessionRef.current?.access_token || ""}` },
        body: JSON.stringify({ p_room_id: room.id, p_role: myRole }),
      });
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [view, room?.id, myRole]);

  // Auto-request mic permission when battle becomes active
  useEffect(() => {
    if (view !== "in_progress") return;
    const run = async () => {
      try {
        const perm = await navigator.permissions.query({ name:"microphone" }).catch(() => null);
        if (perm?.state === "denied") return;
        // Small delay to ensure Supabase channel is subscribed
        await new Promise(r => setTimeout(r, 800));
        if (viewRef.current !== "in_progress") return;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: { ideal: 16000 },
          },
          video: false,
        });
        localStreamRef.current = stream;
        console.log("[Mic] auto-acquired, role:", myRoleRef.current, "tracks:", stream.getAudioTracks().length);
        startRealtimeVoice(stream);
        setMicOn(true);
        if (pcRef.current) addLocalTracks(pcRef.current);
        if (await waitForRoomChannel())
          await roomChannelRef.current?.send({ type:"broadcast", event:"mic-on", payload:{ from:myRoleRef.current } });
        if (myRoleRef.current === "player1") await initiateOffer();
      } catch (err) {
        console.error("[Mic] auto-acquire error:", err?.name, err?.message);
      }
    };
    run();
  }, [view]);

  // H9: Selection countdown — auto-forfeit if selector doesn't pick in 60s
  useEffect(() => {
    clearInterval(selectionTimerRef.current);
    const start = setTimeout(() => {
      if (view !== "selecting" || !isMySelectorTurn()) {
        setSelectionTimeLeft(0);
        return;
      }
      setSelectionTimeLeft(60);
      selectionTimerRef.current = setInterval(() => {
        setSelectionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(selectionTimerRef.current);
            goLobby();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 0);
    return () => {
      clearTimeout(start);
      clearInterval(selectionTimerRef.current);
    };
  }, [view, myRole, room?.round1_category]);

  // M14: Bot wait countdown
  useEffect(() => {
    clearTimeout(botCountdownTimerRef.current);
    const start = setTimeout(() => {
      setBotWaitSecs(12);
      if (view !== "waiting" || isPrivateRoom) return;
      const tick = () => {
        setBotWaitSecs(prev => {
          if (prev <= 1) return 0;
          botCountdownTimerRef.current = setTimeout(tick, 1000);
          return prev - 1;
        });
      };
      botCountdownTimerRef.current = setTimeout(tick, 1000);
    }, 0);
    return () => {
      clearTimeout(start);
      clearTimeout(botCountdownTimerRef.current);
    };
  }, [view, isPrivateRoom]);

  async function submitBotAnswerForQuestion(r, roundNum, index, q, latestRoom, userCorrect) {
    const key = `${r.id}:${roundNum}:${index + 1}`;
    if (botAnsweredRef.current.has(key)) return;
    botAnsweredRef.current.add(key);
    await new Promise(res => setTimeout(res, 600 + Math.random() * 900));
    const sourceRoom = latestRoom || roomRef.current || r;
    const userScore  = Number(sourceRoom[`player1_round${roundNum}_score`]) || 0;
    const botScore   = Number(sourceRoom[`player2_round${roundNum}_score`]) || 0;
    const gap = userScore - botScore;
    const botAcc = gap > 2 ? 0.72 : gap > 0 ? 0.60 : 0.50;
    const botCorrect = Math.random() < botAcc;
    const chosen     = botCorrect ? q.correct_option_index : (q.correct_option_index + 1) % 4;
    await supabase.rpc("battle_submit_answer", {
      p_room_id: r.id, p_round: roundNum,
      p_question_order: index + 1, p_question_text: q.question_text,
      p_selected: chosen, p_correct_index: q.correct_option_index,
      p_time_taken: Math.max(1, Math.floor((r[`round${roundNum}_difficulty`] === "hard" ? 8 : 5) + Math.random() * 4)),
      p_is_bot: true,
    });
  }

  function handleResult(r) {
    clearAllTimers();
    cleanupVoice();
    const iWon    = r.winner_id === (myRole === "player1" ? r.player1_id : r.player2_id);
    const myTotal = myRole === "player1"
      ? (r.player1_round1_score||0) + (r.player1_round2_score||0)
      : (r.player2_round1_score||0) + (r.player2_round2_score||0);
    const oppTotal = myRole === "player1"
      ? (r.player2_round1_score||0) + (r.player2_round2_score||0)
      : (r.player1_round1_score||0) + (r.player1_round2_score||0);
    const modeObj   = MODES.find(m => m.id === r.mode);
    const r1Total   = roundTotalsRef.current[1];
    const r2Total   = roundTotalsRef.current[2];
    setResult({
      won:        r.is_tie ? null : iWon,
      tie:        r.is_tie,
      myScore:    myTotal,
      oppScore:   oppTotal,
      oppName:    myRole === "player1" ? (r.bot_name || r.player2_name) : r.player1_name,
      oppAvatar:  opponentProfile?.avatar_url || null,
      oppIsBot:   r.is_bot,
      coinsChange:r.is_tie ? -(modeObj.tax / 2) : iWon ? modeObj.prize : -modeObj.stake,
      prize:      modeObj.prize,
      mode:       r.mode,
      isBot:      r.is_bot,
      round1: {
        my:    myRole === "player1" ? (r.player1_round1_score||0) : (r.player2_round1_score||0),
        opp:   myRole === "player1" ? (r.player2_round1_score||0) : (r.player1_round1_score||0),
        total: r1Total,
      },
      round2: {
        my:    myRole === "player1" ? (r.player1_round2_score||0) : (r.player2_round2_score||0),
        opp:   myRole === "player1" ? (r.player2_round2_score||0) : (r.player1_round2_score||0),
        total: r2Total,
      },
      totalQuestions: r1Total + r2Total,
    });
    setView("result");
    loadHistory();
    // Refresh coin balance shown in header
    if (sessionRef.current?.user?.id) {
      supabase.from("users_profiles").select("*").eq("user_id", sessionRef.current.user.id).single()
        .then(({ data: prof }) => { if (prof) setProfile(prof); });
    }
  }

  async function useHint() {
    if (hintLockRef.current || submitLock.current) return;
    hintLockRef.current = true;
    const cost = HINT_COSTS[hintsUsed] || 40;
    if ((profile?.total_aidla_coins || 0) < cost) { flash("Insufficient coins"); hintLockRef.current = false; return; }
    const q    = questions[qIndex];
    const wrong= [0,1,2,3].filter(i => i !== q.correct_option_index && !eliminated.includes(i));
    if (wrong.length === 0) return;
    const toElim = wrong[Math.floor(Math.random() * wrong.length)];
    setEliminated(prev => [...prev, toElim]);
    setHintsUsed(h => h + 1);
    const newBal = (profile?.total_aidla_coins || 0) - cost;
    setProfile(prev => ({ ...prev, total_aidla_coins: newBal }));
    const txnNo  = "HINT-BTL-" + Date.now();
    const poolBal= await supabase.from("admin_pool").select("total_aidla_coins").eq("id",1).single().then(r => r.data?.total_aidla_coins || 0);
    await supabase.from("users_transactions").insert({
      txn_no: txnNo+"-U", user_id: user.id, user_email: profile?.email || user.email,
      txn_type:"battle_hint", direction:"OUT", amount: cost,
      balance_before: profile?.total_aidla_coins || 0, balance_after: newBal, note:"Battle hint used",
    });
    await supabase.from("admin_pool_transactions").insert({
      txn_no: txnNo+"-A", txn_type:"battle_hint", direction:"IN", amount: cost,
      admin_email:"system@battle", target_user_id: user.id, target_user_email: profile?.email || user.email,
      target_user_name: profile?.full_name || "User",
      pool_balance_before: poolBal, pool_balance_after: poolBal + cost,
      user_balance_before: profile?.total_aidla_coins || 0, user_balance_after: newBal, note:"Hint fee collected from battle",
    });
    hintLockRef.current = false;
  }

  function flash(text) {
    clearTimeout(flashTimeoutRef.current);
    setMsg(text);
    flashTimeoutRef.current = setTimeout(() => setMsg(""), 3500);
  }

  async function createPrivateRoom() {
    if (!selectedMode) return;
    const modeObj = selectedMode;
    if (modeObj.stake > 0 && profile?.total_aidla_coins < modeObj.stake) { flash("Insufficient coins"); return; }
    setView("waiting");
    setIsPrivateRoom(true);
    setRoom(null);
    resetSelectionState();
    startedRoundsRef.current.clear();
    completedRoundsRef.current.clear();
    forfeitLockRef.current = false;
    const { data, error } = await supabase.rpc("battle_find_or_create", { p_mode: modeObj.id, p_is_open: false });
    if (error || !data?.ok || data.role !== "player1") {
      flash(data?.error || error?.message || "Failed to create room");
      setView("pre_waiting");
      setIsPrivateRoom(false);
      return;
    }
    myRoleRef.current = "player1";
    setMyRole("player1");
    setCurrentRoomId(data.room_id);
    setIsPrivateRoom(true);
    watchRoom(data.room_id);
    await pollRoom(data.room_id, false);
  }

  async function joinByRoomId() {
    if (!joinRoomInput.trim()) return;
    const rid = joinRoomInput.trim();
    setView("waiting");
    setIsPrivateRoom(false);
    resetSelectionState();
    const { data, error } = await supabase.rpc("battle_join_room", { p_room_id: rid });
    if (error || !data?.ok) { flash(data?.error || error?.message || "Room not found or full"); setView("lobby"); return; }
    myRoleRef.current = "player2";
    setMyRole("player2");
    setCurrentRoomId(rid);
    opponentFetchedRef.current = false;
    setOpponentProfile(null);
    watchRoom(rid);
    await pollRoom(rid, false);
  }

  function copyRoomId() {
    if (!currentRoomId) return;
    navigator.clipboard.writeText(currentRoomId)
      .then(() => { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); })
      .catch(() => flash("Copy failed — try manually"));
  }

  function copyRoomLink() {
    if (!currentRoomId) return;
    const link = `${window.location.origin}/user/battle?room=${currentRoomId}`;
    navigator.clipboard.writeText(link)
      .then(() => { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); })
      .catch(() => flash("Copy failed — try manually"));
  }

  // ── Derived values ──────────────────────────────────────────────
  const q             = questions[qIndex];
  const secPerQ       = room ? (room[`round${currentRound}_difficulty`] === "hard" ? 10 : room[`round${currentRound}_difficulty`] === "easy" ? 15 : 12) : 12;
  const timePct       = timeLeft / secPerQ * 100;
  const opponentName  = room ? (room.is_bot ? room.bot_name : myRole === "player1" ? room.player2_name : room.player1_name) : "-";
  const opponentScore = room ? (Number(myRole === "player1" ? room[`player2_round${currentRound}_score`] : room[`player1_round${currentRound}_score`]) || 0) : 0;
  const myFirstName   = (profile?.full_name || "You").split(" ")[0];
  const oppFirstName  = (opponentName || "Opponent").split(" ")[0];
  const quoteIdx      = useMemo(() => Math.floor(Math.random() * 4), []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:40, marginBottom:20, animation:"spin 1s linear infinite" }}>⚔️</div>
      <div style={{ color:"rgba(255,255,255,0.7)", fontSize:15, fontWeight:600 }}>Loading Battle Arena...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={S.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes wobble{0%,100%{transform:rotate(-6deg) scale(1.05)}50%{transform:rotate(6deg) scale(1.1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes timerPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes hbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes hbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        @keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(90px) rotate(360deg);opacity:0}}
        @keyframes liveBlip{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(99,102,241,0.4)}50%{box-shadow:0 0 24px rgba(99,102,241,0.7)}}
        .cat-icon{display:block}
        @media(max-width:380px){.cat-icon{display:none}}
        @keyframes emojiPop{0%{opacity:0;transform:translateX(-50%) scale(0.4) translateY(0)}20%{opacity:1;transform:translateX(-50%) scale(1.2) translateY(-4px)}80%{opacity:1;transform:translateX(-50%) scale(1) translateY(-8px)}100%{opacity:0;transform:translateX(-50%) scale(0.8) translateY(-16px)}}
      `}</style>

      {/* Hidden audio element for opponent voice */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display:"none" }} />

      {/* Share Card */}
      {showShare && result && (
        <BattleShareCard profile={profile} result={result} onClose={() => setShowShare(false)} />
      )}

      {/* Forfeit confirm dialog */}
      {confirmForfeit && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9000, padding:20 }}>
          <div style={{ background:"#1e1b4b", borderRadius:16, padding:"24px 20px", maxWidth:300, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🏳️</div>
            <div style={{ color:"white", fontWeight:800, fontSize:17, marginBottom:8 }}>Forfeit Battle?</div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:20 }}>Your opponent wins and you lose any coins at stake.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ flex:1, padding:"10px 0", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"white", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }} onClick={() => setConfirmForfeit(false)}>Stay</button>
              <button style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:"#ef4444", color:"white", fontWeight:800, cursor:"pointer", fontFamily:"inherit" }} onClick={() => { setConfirmForfeit(false); goLobby(); }}>Forfeit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => { if (["selecting","in_progress","waiting_round","waiting_round2"].includes(view)) { setConfirmForfeit(true); } else { goLobby(); } }}>←</button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>⚔️</span>
          <span style={S.headerTitle}>1v1 Battle Arena</span>
        </div>
        <div style={S.coinsBadge}>
          <span style={{ fontSize:14 }}>🪙</span>
          <span style={{ fontWeight:800, fontSize:13 }}>{(profile?.total_aidla_coins||0).toLocaleString()}</span>
        </div>
      </div>

      {msg && (
        <div style={{ position:"fixed", top:64, left:"50%", transform:"translateX(-50%)", background:"#1e293b", color:"white", padding:"10px 20px", borderRadius:24, fontSize:13, fontWeight:700, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.3)", animation:"fadeUp 0.2s ease" }}>
          {msg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          LOBBY
      ══════════════════════════════════════════════════════════ */}
      {view === "lobby" && (
        <div style={{ padding:"16px 14px" }}>
          {/* Tabs */}
          <div style={S.tabs}>
            {[["play","⚔️ Play"],["open","🌐 Open"],["history","📜 History"],["leaderboard","🏆 Board"]].map(([id,label]) => (
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
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              {/* Stats */}
              {myStats && (
                <div style={{ ...S.card, background:"linear-gradient(135deg,#1e1b4b,#312e81)", marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>My Battle Stats</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                    {[
                      ["⚔️","Battles", myStats.total,    "#a5b4fc"],
                      ["🏆","Wins",    myStats.wins,     "#6ee7b7"],
                      ["💀","Losses",  myStats.losses,   "#fca5a5"],
                      ["🪙","Earned", `+${myStats.coins_earned}`,"#fcd34d"],
                    ].map(([icon,label,val,color]) => (
                      <div key={label} style={{ background:"rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
                        <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
                        <div style={{ fontWeight:900, fontSize:15, color }}>{val}</div>
                        <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", marginTop:2, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode selection */}
              <div style={{ ...S.card, marginBottom:10 }}>
                <div style={S.cardTitle}>Choose Battle Mode</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {MODES.map(m => (
                    <button key={m.id}
                      style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1.5px solid ${m.color}44`, background:`linear-gradient(135deg,${m.glow},transparent)`, textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:12 }}
                      onClick={() => { setSelectedMode(m); setView("pre_waiting"); }}>
                      <div style={{ width:42, height:42, borderRadius:12, background:`${m.color}22`, border:`1.5px solid ${m.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                        {m.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800, fontSize:15, color:"#0f172a", marginBottom:2 }}>{m.label}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>
                          {m.stake === 0 ? "Free entry" : `Stake ${m.stake} coins`} · Win <strong style={{ color: m.color }}>{m.prize} coins</strong>
                        </div>
                      </div>
                      <div style={{ background: m.color, color:"white", fontSize:11, fontWeight:900, padding:"4px 10px", borderRadius:20, flexShrink:0 }}>
                        {m.badge}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:"10px 14px", fontSize:12, color:"#92400e", fontWeight:600 }}>
                💡 Hints: 1st=2.5 · 2nd=5 · 3rd=10 · 4th=20 · 5th=40 coins — eliminates one wrong option
              </div>
            </div>
          )}

          {/* OPEN ROOMS TAB */}
          {activeTab === "open" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={S.card}>
                <div style={S.cardTitle}>Join by Room ID</div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:10 }}>Enter a private room ID shared by a friend.</div>
                <div style={{ display:"flex", gap:8 }}>
                  <input style={S.input} placeholder="Paste room ID here..." value={joinRoomInput}
                    onChange={e => setJoinRoomInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && joinByRoomId()} />
                  <button style={{ ...S.smBtn, background:"#6366f1", color:"white", border:"none" }} onClick={joinByRoomId} disabled={!joinRoomInput.trim()}>
                    Join
                  </button>
                </div>
              </div>
              <div style={S.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={S.cardTitle}>Live Open Battles</div>
                  <button style={S.smBtn} onClick={loadOpenRooms}>↻ Refresh</button>
                </div>
                {openRooms.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"32px 0" }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🎮</div>
                    <div style={{ color:"#94a3b8", fontSize:13 }}>No open battles right now.</div>
                    <div style={{ color:"#cbd5e1", fontSize:12, marginTop:4 }}>Create one from the Play tab!</div>
                  </div>
                ) : openRooms.filter(r => r.player1_id !== user?.id).map((r, i) => {
                  const m = MODES.find(md => md.id === r.mode);
                  return (
                    <div key={r.id || i} style={{ ...S.lbRow, padding:"10px 0" }}>
                      <AvatarCircle name={r.player1_name} size={36} ring={m?.color || "#6366f1"} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{r.player1_name}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{m?.label} mode · Win {m?.prize} coins</div>
                      </div>
                      <button style={{ ...S.smBtn, background: joiningRoomId === r.id ? "#94a3b8" : "#6366f1", color:"white", border:"none" }} disabled={!!joiningRoomId} onClick={() => joinRoom(r.id)}>
                        {joiningRoomId === r.id ? "Joining..." : "Join ⚔️"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div style={{ ...S.card, animation:"fadeUp 0.3s ease" }}>
              <div style={S.cardTitle}>Battle History</div>
              {history.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>⚔️</div>
                  <div style={{ color:"#94a3b8", fontSize:13 }}>No battles yet. Go win some!</div>
                </div>
              ) : history.map((h, i) => {
                const resColor = h.result==="won" ? "#059669" : h.result==="tie" ? "#d97706" : "#dc2626";
                const resBg    = h.result==="won" ? "#dcfce7" : h.result==="tie" ? "#fef9c3" : "#fee2e2";
                return (
                  <div key={i} style={S.lbRow}>
                    <div style={{ width:36, height:36, borderRadius:10, background:resBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:resColor, flexShrink:0 }}>
                      {h.result==="won"?"W":h.result==="tie"?"T":"L"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{h.opponent_name}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{h.my_score} vs {h.opp_score} · {h.mode==="free"?"Free":h.mode+" coins"}</div>
                    </div>
                    <div style={{ fontWeight:900, fontSize:14, color: h.coins_change>=0?"#059669":"#dc2626" }}>
                      {h.coins_change>=0?"+":""}{h.coins_change} 🪙
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === "leaderboard" && (
            <div style={{ ...S.card, animation:"fadeUp 0.3s ease" }}>
              <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                {["daily","weekly","monthly"].map(p => (
                  <button key={p} style={{ ...S.smBtn, ...(lbPeriod===p?{background:"#6366f1",color:"white",border:"1px solid #6366f1"}:{}) }}
                    onClick={() => { setLbPeriod(p); setLbLoaded(false); loadLeaderboard(p); }}>
                    {p.charAt(0).toUpperCase()+p.slice(1)}
                  </button>
                ))}
              </div>
              {lbLoading ? (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>No data yet.</div>
              ) : leaderboard.slice(0,20).map((l, i) => {
                const medals = ["🥇","🥈","🥉"];
                return (
                  <div key={i} style={{ ...S.lbRow, background: i<3 ? "linear-gradient(90deg,rgba(245,158,11,0.06),transparent)" : "none", borderRadius:10, padding:"8px 6px" }}>
                    <span style={{ fontWeight:900, fontSize:16, width:28, textAlign:"center", flexShrink:0 }}>
                      {i < 3 ? medals[i] : <span style={{ color:"#94a3b8", fontSize:13 }}>#{i+1}</span>}
                    </span>
                    {l.avatar_url
                      ? <img src={l.avatar_url} alt="" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:"2px solid #e2e8f0" }} />
                      : <AvatarCircle name={l.full_name} size={32} ring="#e2e8f0" />}
                    <span style={{ flex:1, fontWeight:700, fontSize:13, color:"#0f172a" }}>{l.full_name}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#6366f1" }}>{l.wins} W</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PRE-WAITING — mode selected, pick match type
      ══════════════════════════════════════════════════════════ */}
      {view === "pre_waiting" && selectedMode && (
        <div style={{ padding:"16px 14px", animation:"fadeUp 0.3s ease" }}>
          {/* Mode hero */}
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:18, padding:"22px 20px", marginBottom:16, textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:`${selectedMode.color}22` }} />
            <div style={{ fontSize:44, marginBottom:8 }}>{selectedMode.icon}</div>
            <div style={{ fontSize:24, fontWeight:900, color:"white", marginBottom:4 }}>{selectedMode.label} Mode</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:16 }}>
              {selectedMode.stake === 0 ? "Free to play" : `Stake: ${selectedMode.stake} coins`} · Winner takes <span style={{ color:"#fbbf24", fontWeight:800 }}>{selectedMode.prize} coins</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[["Entry",selectedMode.stake===0?"Free":`${selectedMode.stake}`],["Prize",`${selectedMode.prize}`],["Tax",`${selectedMode.tax}`]].map(([l,v]) => (
                <div key={l} style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:"8px 4px" }}>
                  <div style={{ fontWeight:800, fontSize:16, color:"white" }}>{v}</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.05em", marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <button style={{ ...S.btn, marginBottom:10 }} onClick={() => findBattle(selectedMode.id)}>
            🌐 Find Public Match
          </button>
          <button style={{ ...S.btnGhost, marginBottom:14 }} onClick={createPrivateRoom}>
            🔒 Create Private Room
          </button>

          <div style={S.card}>
            <div style={S.cardTitle}>Join Private Room</div>
            <div style={{ display:"flex", gap:8 }}>
              <input style={S.input} placeholder="Paste room ID..." value={joinRoomInput}
                onChange={e => setJoinRoomInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && joinByRoomId()} />
              <button style={{ ...S.smBtn, background:"#6366f1", color:"white", border:"none" }} onClick={joinByRoomId} disabled={!joinRoomInput.trim()}>
                Join
              </button>
            </div>
          </div>

          <button style={S.btnGhost} onClick={() => setView("lobby")}>← Back</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          WAITING — searching for opponent
      ══════════════════════════════════════════════════════════ */}
      {view === "waiting" && (
        <div style={{ padding:"16px 14px", animation:"fadeUp 0.3s ease" }}>
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:20, padding:"36px 20px", textAlign:"center", marginBottom:14 }}>
            {/* Players row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, marginBottom:28 }}>
              {/* You */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ position:"relative" }}>
                  <AvatarCircle url={profile?.avatar_url} name={profile?.full_name||"You"} size={64} ring="#818cf8" />
                  <div style={{ position:"absolute", bottom:-2, right:-2, width:18, height:18, borderRadius:"50%", background:"#22c55e", border:"2px solid #1e1b4b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>✓</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.8)", maxWidth:80, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{myFirstName}</div>
              </div>

              <div style={{ fontSize:22, fontWeight:900, color:"#f59e0b", animation:"wobble 1.5s ease-in-out infinite" }}>VS</div>

              {/* Opponent */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"3px dashed rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
                  ?
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.45)" }}>Searching...</div>
              </div>
            </div>

            <div style={{ fontSize:14, color:"rgba(255,255,255,0.6)", marginBottom:20 }}>
              Matching you with the best challenger...
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:24 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#818cf8", animation:`bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />
              ))}
            </div>
            <button style={{ ...S.btnGhost, maxWidth:200, margin:"0 auto", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.15)" }} onClick={goLobby}>
              Cancel
            </button>
          </div>

          {/* Private room share card */}
          {currentRoomId && isPrivateRoom && (
            <div style={S.card}>
              <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:14 }}>🔒</span>
                <div style={S.cardTitle}>Private Room Ready</div>
              </div>
              <div style={{ background:"#f8fafc", borderRadius:12, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Room ID</div>
                <div style={{ fontSize:13, fontWeight:800, color:"#0f172a", fontFamily:"monospace", wordBreak:"break-all" }}>{currentRoomId}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ ...S.smBtn, flex:1, justifyContent:"center" }} onClick={copyRoomId}>{copiedId ? "✓ Copied!" : "Copy ID"}</button>
                <button style={{ ...S.smBtn, flex:1, background:"#6366f1", color:"white", border:"none" }} onClick={copyRoomLink}>{copiedLink ? "✓ Copied!" : "Copy Link"}</button>
              </div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:8 }}>Share the link or ID with your opponent</div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SELECTING
      ══════════════════════════════════════════════════════════ */}
      {view === "selecting" && room && (
        <div style={{ padding:"16px 14px", animation:"fadeUp 0.3s ease" }}>
          {/* Battle header */}
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:16, padding:"14px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
            <AvatarCircle url={profile?.avatar_url} name={profile?.full_name||"You"} size={36} ring="#818cf8" />
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Round {currentRound} of 2</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#f59e0b", letterSpacing:"0.04em" }}>⚔️ VS ⚔️</div>
            </div>
            <AvatarCircle url={opponentProfile?.avatar_url} name={opponentName} size={36} ring="#f87171" />
          </div>

          {isMySelectorTurn() ? (
            <div style={{ ...S.card, padding:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <div style={{ background:"#eff0ff", color:"#4338ca", fontSize:11, fontWeight:800, padding:"4px 12px", borderRadius:20 }}>Your Pick</div>
                <div style={S.cardTitle}>Round {currentRound} — Choose Category</div>
                {selectionTimeLeft > 0 && (
                  <div style={{ marginLeft:"auto", background: selectionTimeLeft <= 10 ? "#fef2f2" : "#f0fdf4", color: selectionTimeLeft <= 10 ? "#dc2626" : "#16a34a", fontSize:11, fontWeight:900, padding:"2px 10px", borderRadius:20, flexShrink:0 }}>
                    {selectionTimeLeft}s
                  </div>
                )}
              </div>

              {/* Category grid */}
              <div style={{ fontSize:10, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Category</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4, marginBottom:12 }}>
                {categories.map(c => (
                  <button key={c.id}
                    style={{ padding:"5px 2px", border: selCategory?.id===c.id ? "2px solid #6366f1" : "1.5px solid #e2e8f0", borderRadius:8, background: selCategory?.id===c.id ? "#eff0ff" : "white", fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit", color: selCategory?.id===c.id ? "#4338ca" : "#334155", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:1, transition:"all 0.15s", minWidth:0 }}
                    onClick={() => setSelCategory(c)}>
                    <span className="cat-icon" style={{ fontSize:13, lineHeight:1.3 }}>{c.icon}</span>
                    <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%", display:"block" }}>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Difficulty + Questions */}
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>Difficulty</div>
                  <div style={{ display:"flex", gap:4 }}>
                    {[["easy","🟢"],["medium","🟡"],["hard","🔴"]].map(([d,dot]) => (
                      <button key={d} style={{ flex:1, padding:"7px 2px", border:"1.5px solid #e2e8f0", borderRadius:8, background: selDifficulty===d ? "#6366f1" : "white", color: selDifficulty===d ? "white" : "#334155", fontSize:10, fontWeight:800, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}
                        onClick={() => setSelDifficulty(d)}>
                        {dot} {d.charAt(0).toUpperCase()+d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>Questions</div>
                  <div style={{ display:"flex", gap:4 }}>
                    {[5,10,15,20].map(n => (
                      <button key={n} style={{ flex:1, padding:"7px 2px", border:"1.5px solid #e2e8f0", borderRadius:8, background: selQuestions===n ? "#6366f1" : "white", color: selQuestions===n ? "white" : "#334155", fontSize:10, fontWeight:800, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}
                        onClick={() => setSelQuestions(n)}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button style={{ ...S.btn, opacity: (!selCategory||submittingSelection) ? 0.6 : 1 }} onClick={submitSelection} disabled={!selCategory||submittingSelection}>
                {generatingQ ? "⚙️ Generating Questions..." : submittingSelection ? "⏳ Confirming..." : "⚔️ Lock In Selection"}
              </button>
            </div>
          ) : (
            <div style={{ ...S.card, textAlign:"center", padding:"44px 20px" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                <AvatarCircle url={opponentProfile?.avatar_url} name={opponentName} size={56} ring="#f87171" />
              </div>
              <div style={{ fontSize:17, fontWeight:800, color:"#0f172a", marginBottom:6 }}>
                {oppFirstName} is picking Round {currentRound}
              </div>
              {room[`round${currentRound}_category`] ? (
                <div style={{ display:"inline-block", background:"#eff0ff", color:"#4338ca", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:16 }}>
                  Category: {room[`round${currentRound}_category`]}
                </div>
              ) : (
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:20 }}>Waiting for their selection...</div>
              )}
              <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1", animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          WAITING FOR OPPONENT ROUND 1
      ══════════════════════════════════════════════════════════ */}
      {(view === "waiting_round" || view === "waiting_round2") && (
        <div style={{ padding:"16px 14px", animation:"fadeUp 0.3s ease" }}>
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:20, padding:"40px 20px", textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:12, animation:"hbFloat 2s ease-in-out infinite" }}>✅</div>
            <div style={{ fontSize:20, fontWeight:900, color:"white", marginBottom:6 }}>Round {currentRound} Complete!</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:24 }}>
              Waiting for <strong style={{ color:"#fbbf24" }}>{oppFirstName}</strong> to finish...
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:20 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#818cf8", animation:`bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />
              ))}
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>
              {view === "waiting_round2" ? "Calculating final results once both finish..." : "Round 2 selection begins once both players finish"}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          IN PROGRESS — Battle HUD
      ══════════════════════════════════════════════════════════ */}
      {view === "in_progress" && !q && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"50vh", gap:12 }}>
          <div style={{ fontSize:32, animation:"spin 1s linear infinite" }}>⚔️</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600 }}>Loading question...</div>
        </div>
      )}

      {view === "in_progress" && q && (
        <div style={{ padding:"6px 10px" }}>
          {/* ── Battle HUD ── */}
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:14, padding:"8px 12px", marginBottom:8 }}>
            {/* Round + question info bar */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}>
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:20, padding:"2px 12px", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"#22c55e", animation:"liveBlip 1.2s ease-in-out infinite", flexShrink:0 }} />
                <span style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.8)", letterSpacing:"0.04em" }}>
                  ROUND {currentRound}/2 &nbsp;·&nbsp; Q {qIndex+1}/{questions.length}
                </span>
              </div>
            </div>

            {/* Players + timer row */}
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              {/* You */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative" }}>
                {sentEmoji && (
                  <div key={`sent-${sentEmojiIdRef.current}`} style={{ position:"absolute", top:-22, left:"50%", fontSize:20, animation:"emojiPop 2.5s ease-out forwards", pointerEvents:"none" }}>
                    {sentEmoji}
                  </div>
                )}
                <AvatarCircle url={profile?.avatar_url} name={profile?.full_name||"You"} size={34} ring="#818cf8" />
                <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.65)", maxWidth:72, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {myFirstName}
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:1 }}>
                  <span style={{ fontSize:22, fontWeight:900, color:"#a5b4fc", lineHeight:1 }}>{myScore}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"rgba(165,180,252,0.55)", lineHeight:1 }}>/{questions.length}</span>
                </div>
                {/* Inline comms controls */}
                <div style={{ position:"relative" }}>
                  {showEmojiPicker && (
                    <div style={{ position:"absolute", bottom:"100%", left:"50%", transform:"translateX(-50%)", marginBottom:4, background:"rgba(15,15,26,0.97)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"6px 7px", display:"flex", flexWrap:"wrap", gap:4, width:168, boxShadow:"0 -4px 20px rgba(0,0,0,0.6)", zIndex:200 }}>
                      {CHAT_EMOJIS.map(e => (
                        <button key={e} onClick={() => sendEmoji(e)}
                          style={{ width:26, height:26, borderRadius:6, border:"none", background:"rgba(255,255,255,0.07)", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                          onMouseEnter={ev => ev.currentTarget.style.background="rgba(255,255,255,0.16)"}
                          onMouseLeave={ev => ev.currentTarget.style.background="rgba(255,255,255,0.07)"}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <button onClick={toggleMic} title={micOn?"Mute":"Unmute"}
                      style={{ width:24, height:24, borderRadius:"50%", border:`1.5px solid ${micOn?"#22c55e":"rgba(255,255,255,0.2)"}`, background:micOn?"rgba(34,197,94,0.22)":"rgba(255,255,255,0.08)", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                      {micOn?"🎤":"🎙️"}
                    </button>
                    <button onClick={toggleSpeaker} title={speakerOn?"Mute speaker":"Unmute speaker"}
                      style={{ width:24, height:24, borderRadius:"50%", border:`1.5px solid ${speakerOn?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.2)"}`, background:speakerOn?"rgba(99,102,241,0.18)":"rgba(255,255,255,0.08)", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                      {speakerOn?"🔊":"🔇"}
                    </button>
                    <button onClick={() => setShowEmojiPicker(v => !v)}
                      style={{ width:24, height:24, borderRadius:"50%", border:`1.5px solid ${showEmojiPicker?"#f59e0b55":"rgba(255,255,255,0.2)"}`, background:showEmojiPicker?"rgba(245,158,11,0.18)":"rgba(255,255,255,0.08)", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                      😀
                    </button>
                    {micOn && <span style={{ width:5, height:5, borderRadius:"50%", background:"#22c55e", animation:"liveBlip 1s ease-in-out infinite", flexShrink:0 }} />}
                  </div>
                </div>
              </div>

              {/* Center timer circle */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0 }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%",
                  border:`2.5px solid ${timeLeft<=5?"#ef4444":timeLeft<=10?"#f59e0b":"rgba(255,255,255,0.25)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: timeLeft<=5?"rgba(239,68,68,0.18)":"rgba(255,255,255,0.06)",
                  animation: timeLeft<=5?"timerPulse 0.6s ease-in-out infinite":"none",
                  transition:"border-color 0.3s, background 0.3s",
                }}>
                  <span style={{ fontSize:16, fontWeight:900, color:timeLeft<=5?"#f87171":timeLeft<=10?"#fbbf24":"white", lineHeight:1 }}>{timeLeft}</span>
                </div>
                <span style={{ fontSize:9, fontWeight:700, color:"#f59e0b", letterSpacing:"0.05em" }}>VS</span>
              </div>

              {/* Opponent */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative" }}>
                {receivedEmoji && (
                  <div key={`recv-${receivedEmojiIdRef.current}`} style={{ position:"absolute", top:-22, left:"50%", fontSize:20, animation:"emojiPop 2.5s ease-out forwards", pointerEvents:"none" }}>
                    {receivedEmoji}
                  </div>
                )}
                <AvatarCircle url={opponentProfile?.avatar_url} name={opponentName} size={34} ring="#f87171" />
                <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.65)", maxWidth:72, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {oppFirstName}
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:1 }}>
                  <span style={{ fontSize:22, fontWeight:900, color:"#fca5a5", lineHeight:1 }}>{opponentScore}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"rgba(252,165,165,0.55)", lineHeight:1 }}>/{questions.length}</span>
                </div>
              </div>
            </div>

            {/* Timer progress bar */}
            <div style={{ marginTop:8, height:2, background:"rgba(255,255,255,0.1)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${timePct}%`, background:timeLeft<=5?"#ef4444":timeLeft<=10?"#f59e0b":"#818cf8", borderRadius:4, transition:"width 1s linear" }} />
            </div>
          </div>

          {/* ── Question Card ── */}
          <div style={{ background:"white", borderRadius:12, padding:"10px 12px", boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }} onContextMenu={e => e.preventDefault()}>
            {/* Badges + inline hint */}
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:7, flexWrap:"wrap" }}>
              <span style={{ background:"#eff0ff", color:"#4338ca", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.04em" }}>
                {room?.[`round${currentRound}_category`]}
              </span>
              {(() => {
                const diff  = room?.[`round${currentRound}_difficulty`];
                const [bg,  color] = diffBadge(diff);
                return (
                  <span style={{ background:bg, color, fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20, textTransform:"capitalize" }}>
                    {diff}
                  </span>
                );
              })()}
              <div style={{ flex:1 }} />
              {!feedback && hintsUsed < HINT_COSTS.length && (
                <button onClick={useHint}
                  style={{ padding:"2px 8px", background:"#fffbeb", border:"1px solid #fde068", borderRadius:20, fontSize:9, fontWeight:800, color:"#92400e", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:3, flexShrink:0 }}>
                  💡 {HINT_COSTS[Math.min(hintsUsed, HINT_COSTS.length-1)]}🪙
                </button>
              )}
            </div>

            <p style={{ fontWeight:700, fontSize:13, lineHeight:1.5, margin:"0 0 8px", color:"#0f172a", userSelect:"none" }}>
              {q.question_text}
            </p>

            {q.options?.map((opt, i) => {
              let bg="#fff", border="1.5px solid #e2e8f0", color="#0f172a", shadow="none", letterBg="#f1f5f9", letterColor="#64748b";
              if (feedback) {
                if (i===feedback.correctIndex) { bg="#f0fdf4"; border="1.5px solid #22c55e"; color="#166534"; letterBg="#22c55e"; letterColor="white"; }
                else if (i===selected && !feedback.correct) { bg="#fef2f2"; border="1.5px solid #ef4444"; color="#991b1b"; letterBg="#ef4444"; letterColor="white"; }
              } else if (selected===i) {
                bg="#eff0ff"; border="1.5px solid #6366f1"; color="#4338ca"; shadow="0 0 0 3px rgba(99,102,241,0.12)"; letterBg="#6366f1"; letterColor="white";
              }
              const elim = eliminated.includes(i);
              return (
                <button key={i} disabled={!!feedback||elim}
                  onClick={() => { if (!feedback) { setSelected(i); handleAnswer(i); } }}
                  style={{ width:"100%", padding:"7px 10px", margin:"3px 0", borderRadius:10, textAlign:"left", fontSize:13, fontFamily:"inherit", cursor:elim?"default":"pointer", background:bg, border, color, opacity:elim?0.25:1, textDecoration:elim?"line-through":"none", userSelect:"none", display:"flex", gap:8, alignItems:"center", boxShadow:shadow, transition:"all 0.15s" }}>
                  <span style={{ width:22, height:22, borderRadius:6, background:letterBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:letterColor, flexShrink:0, transition:"all 0.15s" }}>
                    {String.fromCharCode(65+i)}
                  </span>
                  <span style={{ flex:1, lineHeight:1.35 }}>{opt}</span>
                  {feedback && i===feedback.correctIndex && <span style={{ flexShrink:0 }}>✓</span>}
                  {feedback && i===selected && !feedback.correct && <span style={{ flexShrink:0 }}>✗</span>}
                </button>
              );
            })}

            {feedback && (
              <div style={{ textAlign:"center", marginTop:8, fontWeight:900, fontSize:13, color:feedback.correct?"#059669":"#dc2626" }}>
                {feedback.correct ? "✓ Correct!" : `✗ Correct answer: ${String.fromCharCode(65+feedback.correctIndex)}`}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          RESULT
      ══════════════════════════════════════════════════════════ */}
      {view === "result" && result && (
        <div style={{ padding:"16px 14px" }}>
          {/* ── WIN ── */}
          {result.won && (
            <div style={{ background:"linear-gradient(145deg,#064e3b,#065f46,#047857)", borderRadius:20, padding:"28px 18px", textAlign:"center", position:"relative", overflow:"hidden", animation:"fadeUp 0.4s ease" }}>
              <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(52,211,153,0.15)" }} />
              <div style={{ position:"absolute", bottom:-15, left:-15, width:80, height:80, borderRadius:"50%", background:"rgba(16,185,129,0.12)" }} />
              <div style={{ fontSize:58, marginBottom:8, animation:"hbFloat 2s ease-in-out infinite" }}>🏆</div>
              <div style={{ fontSize:32, fontWeight:900, color:"#fff", marginBottom:4, letterSpacing:"-0.02em" }}>You Won!</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginBottom:20 }}>vs {result.oppName}{""}</div>

              {/* Round breakdown */}
              <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:14, padding:"14px 16px", marginBottom:14, textAlign:"left" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Score Breakdown</div>
                <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:4 }}>
                  <div />
                  <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.4)", textAlign:"center", textTransform:"uppercase", letterSpacing:"0.06em" }}>You</div>
                  <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.4)", textAlign:"center", textTransform:"uppercase", letterSpacing:"0.06em" }}>Opponent</div>
                </div>
                {result.round1.total > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:6, alignItems:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.55)" }}>Round 1</div>
                    <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round1.my}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>/{result.round1.total}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round1.opp}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>/{result.round1.total}</span>
                    </div>
                  </div>
                )}
                {result.round2.total > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:10, alignItems:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.55)" }}>Round 2</div>
                    <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round2.my}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>/{result.round2.total}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round2.opp}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>/{result.round2.total}</span>
                    </div>
                  </div>
                )}
                <div style={{ height:1, background:"rgba(255,255,255,0.12)", marginBottom:8 }} />
                <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, alignItems:"center" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.75)" }}>Total</div>
                  <div style={{ background:"rgba(52,211,153,0.2)", borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                    <span style={{ fontWeight:900, fontSize:18, color:"#6ee7b7" }}>{result.myScore}</span>
                    {result.totalQuestions>0&&<span style={{ fontSize:12, color:"rgba(110,231,183,0.6)" }}>/{result.totalQuestions}</span>}
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                    <span style={{ fontWeight:900, fontSize:18, color:"#fff" }}>{result.oppScore}</span>
                    {result.totalQuestions>0&&<span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>/{result.totalQuestions}</span>}
                  </div>
                </div>
              </div>

              <div style={{ background:"rgba(52,211,153,0.15)", borderRadius:12, padding:"12px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ fontSize:22 }}>🪙</span>
                <span style={{ fontWeight:900, fontSize:22, color:"#6ee7b7" }}>+{result.coinsChange}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>coins earned</span>
              </div>

              <button style={{ ...S.btn, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", marginBottom:8 }} onClick={() => setShowShare(true)}>
                Share Victory 🎉
              </button>
              <button style={{ ...S.btnGhost, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.12)" }} onClick={() => { setView("lobby"); setResult(null); loadHistory(); }}>
                Back to Lobby
              </button>
            </div>
          )}

          {/* ── LOSE ── */}
          {!result.won && !result.tie && (
            <div style={{ background:"linear-gradient(145deg,#1a0533,#4a044e 35%,#7f1d1d 70%,#1e1b4b)", borderRadius:20, padding:"28px 18px", textAlign:"center", position:"relative", overflow:"hidden", animation:"fadeUp 0.4s ease" }}>
              <div style={{ position:"absolute", top:-20, left:-20, width:100, height:100, borderRadius:"50%", background:"rgba(220,38,38,0.18)" }} />
              {[...Array(6)].map((_,i) => (
                <div key={i} style={{ position:"absolute", top:0, left:`${8+i*16}%`, width:6, height:6, borderRadius:2, background:["#f87171","#c084fc","#fb923c","#e879f9","#f472b6","#a78bfa"][i], animation:`confettiFall ${1.5+i*0.3}s ease-in ${i*0.2}s infinite`, opacity:0 }} />
              ))}
              <div style={{ fontSize:58, marginBottom:8, animation:"hbPulse 1.4s ease-in-out infinite" }}>💔</div>
              <div style={{ fontSize:30, fontWeight:900, color:"#fff", marginBottom:4, letterSpacing:"-0.02em" }}>You Lost</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", marginBottom:16 }}>vs {result.oppName}{""}</div>

              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:12, padding:"10px 14px", marginBottom:14, border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontStyle:"italic", lineHeight:1.6 }}>
                  {["Every champion was once a challenger. Get back up! 🔥","The road to victory is paved with losses. Keep going! 💪","Defeat is just a detour, not a dead end. Try again! ⚡","Your next battle starts now. Don't stop! 🚀"][Math.floor(Math.random()*4)]}
                </div>
              </div>

              {/* Round breakdown */}
              <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:14, padding:"14px 16px", marginBottom:14, textAlign:"left" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Score Breakdown</div>
                <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:4 }}>
                  <div />
                  <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.35)", textAlign:"center", textTransform:"uppercase" }}>You</div>
                  <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.35)", textAlign:"center", textTransform:"uppercase" }}>Opponent</div>
                </div>
                {result.round1.total > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:6, alignItems:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>Round 1</div>
                    <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round1.my}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round1.total}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round1.opp}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round1.total}</span>
                    </div>
                  </div>
                )}
                {result.round2.total > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:10, alignItems:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>Round 2</div>
                    <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round2.my}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round2.total}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round2.opp}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round2.total}</span>
                    </div>
                  </div>
                )}
                <div style={{ height:1, background:"rgba(255,255,255,0.1)", marginBottom:8 }} />
                <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, alignItems:"center" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.7)" }}>Total</div>
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                    <span style={{ fontWeight:900, fontSize:18, color:"#fff" }}>{result.myScore}</span>
                    {result.totalQuestions>0&&<span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>/{result.totalQuestions}</span>}
                  </div>
                  <div style={{ background:"rgba(239,68,68,0.2)", borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                    <span style={{ fontWeight:900, fontSize:18, color:"#fca5a5" }}>{result.oppScore}</span>
                    {result.totalQuestions>0&&<span style={{ fontSize:12, color:"rgba(252,165,165,0.5)" }}>/{result.totalQuestions}</span>}
                  </div>
                </div>
              </div>

              <div style={{ background:"rgba(239,68,68,0.18)", borderRadius:12, padding:"12px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>🪙</span>
                <span style={{ fontWeight:900, fontSize:22, color:"#fca5a5" }}>{result.coinsChange}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>coins lost</span>
              </div>

              <button style={{ ...S.btn, background:"linear-gradient(135deg,#7c3aed,#db2777)", border:"none", marginBottom:8 }} onClick={() => { setView("lobby"); setResult(null); loadHistory(); }}>
                Try Again 🔁
              </button>
              <button style={{ ...S.btnGhost, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.1)" }} onClick={() => { setView("lobby"); setResult(null); loadHistory(); }}>
                Back to Lobby
              </button>
            </div>
          )}

          {/* ── TIE ── */}
          {result.tie && (
            <div style={{ background:"linear-gradient(135deg,#1e3a5f,#1e40af,#0369a1)", borderRadius:20, padding:"28px 18px", textAlign:"center", position:"relative", overflow:"hidden", animation:"fadeUp 0.4s ease" }}>
              <div style={{ position:"absolute", top:-15, right:-15, width:80, height:80, borderRadius:"50%", background:"rgba(96,165,250,0.2)" }} />
              <div style={{ fontSize:54, marginBottom:8 }}>🤝</div>
              <div style={{ fontSize:30, fontWeight:900, color:"#fff", marginBottom:4 }}>It&apos;s a Tie!</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginBottom:20 }}>vs {result.oppName}{""}</div>

              {/* Round breakdown */}
              <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:14, padding:"14px 16px", marginBottom:14, textAlign:"left" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Score Breakdown</div>
                <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:4 }}>
                  <div />
                  <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.35)", textAlign:"center", textTransform:"uppercase" }}>You</div>
                  <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.35)", textAlign:"center", textTransform:"uppercase" }}>Opponent</div>
                </div>
                {result.round1.total > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:6, alignItems:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>Round 1</div>
                    <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round1.my}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round1.total}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round1.opp}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round1.total}</span>
                    </div>
                  </div>
                )}
                {result.round2.total > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, marginBottom:10, alignItems:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>Round 2</div>
                    <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round2.my}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round2.total}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                      <span style={{ fontWeight:900, fontSize:15, color:"#fff" }}>{result.round2.opp}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>/{result.round2.total}</span>
                    </div>
                  </div>
                )}
                <div style={{ height:1, background:"rgba(255,255,255,0.12)", marginBottom:8 }} />
                <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr", gap:6, alignItems:"center" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.75)" }}>Total</div>
                  <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                    <span style={{ fontWeight:900, fontSize:18, color:"#fff" }}>{result.myScore}</span>
                    {result.totalQuestions>0&&<span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>/{result.totalQuestions}</span>}
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                    <span style={{ fontWeight:900, fontSize:18, color:"#fff" }}>{result.oppScore}</span>
                    {result.totalQuestions>0&&<span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>/{result.totalQuestions}</span>}
                  </div>
                </div>
              </div>

              <div style={{ background:"rgba(251,191,36,0.15)", borderRadius:12, padding:"12px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>🪙</span>
                <span style={{ fontWeight:900, fontSize:22, color:"#fcd34d" }}>{result.coinsChange < 0 ? result.coinsChange : `+${result.coinsChange}`}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>coins</span>
              </div>

              <button style={{ ...S.btnGhost, background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)" }} onClick={() => { setView("lobby"); setResult(null); loadHistory(); }}>
                Back to Lobby
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SHARE CARD (unchanged) ──────────────────────────────────────────
function BattleShareCard({ profile, result, onClose }) {
  const cardRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [captionCopied, setCaptionCopied] = useState(false);
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
    `I just WON a 1v1 Battle on AIDLA!`,``,
    `vs ${result.oppName}`,
    `Score: ${result.myScore} vs ${result.oppScore}`,
    `Earned: +${result.coinsChange} coins`,``,
    `Can you beat me? Challenge now`,
    `www.aidla.online/user/battle`,``,
    `#AIDLA #1v1Battle #LearnAndEarn`,
  ].join("\n");

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:400, display:"flex", flexDirection:"column", gap:10 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontWeight:800, fontSize:16 }}>✕</button>
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
            <div style={{ background:"rgba(255,255,255,0.15)", color:"white", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>Winner</div>
          </div>
          <div style={{ background:"#f8faff", padding:"24px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid #6366f1" }} crossOrigin="anonymous" />
              : <div style={{ width:80, height:80, borderRadius:"50%", background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, color:"white" }}>{name[0]}</div>}
            <div style={{ fontSize:18, fontWeight:800, color:"#0f172a" }}>{name}</div>
            <div style={{ padding:"4px 16px", borderRadius:20, fontSize:12, fontWeight:700, color:"white", background:"#6366f1" }}>Battle Champion</div>
          </div>
          <div style={{ display:"flex", borderTop:"1px solid #f1f5f9" }}>
            {[["Score",`${result.myScore} vs ${result.oppScore}`],["Earned",`+${result.coinsChange}`],["Date",date]].map(([l,v],i) => (
              <div key={l} style={{ flex:1, padding:"12px 8px", textAlign:"center", borderRight:i<2?"1px solid #f1f5f9":"none" }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>{v}</div>
                <div style={{ fontSize:9, color:"#94a3b8", marginTop:2, textTransform:"uppercase", letterSpacing:0.5 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#1e1b4b", padding:"9px", textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>
            www.aidla.online — Earn While You Learn
          </div>
        </div>
        <div style={{ background:"#1e293b", borderRadius:12, padding:14 }}>
          <div style={{ fontSize:11, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Caption</div>
          <div style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"monospace" }}>{caption}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {imgUrl
            ? <a href={imgUrl} download="aidla-battle.png" style={{ flex:1, padding:"11px", background:"#6366f1", color:"white", borderRadius:10, fontWeight:700, fontSize:13, textDecoration:"none", textAlign:"center" }}>Download</a>
            : <div style={{ flex:1, padding:"11px", background:"#e2e8f0", color:"#94a3b8", borderRadius:10, fontSize:13, textAlign:"center" }}>Generating...</div>}
          <button style={{ flex:1, padding:"11px", background: captionCopied ? "#16a34a" : "#059669", color:"white", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
            onClick={() => navigator.clipboard.writeText(caption).then(() => { setCaptionCopied(true); setTimeout(() => setCaptionCopied(false), 2000); }).catch(() => {})}>
            {captionCopied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────
const S = {
  wrap:       { fontFamily:"'DM Sans',sans-serif", maxWidth:560, margin:"0 auto", minHeight:"100vh", background:"#f0f2ff" },
  header:     { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"linear-gradient(135deg,#1e1b4b,#312e81)", position:"sticky", top:0, zIndex:100 },
  backBtn:    { background:"rgba(255,255,255,0.12)", border:"none", color:"white", fontWeight:800, fontSize:18, cursor:"pointer", width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" },
  headerTitle:{ fontWeight:800, fontSize:15, color:"white", letterSpacing:"-0.01em" },
  coinsBadge: { background:"rgba(245,158,11,0.2)", border:"1px solid rgba(245,158,11,0.4)", borderRadius:20, padding:"5px 10px", display:"flex", alignItems:"center", gap:5 },
  tabs:       { display:"flex", gap:4, marginBottom:14, background:"white", borderRadius:14, padding:4, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  tab:        { flex:1, padding:"8px 4px", border:"none", background:"transparent", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", color:"#64748b", borderRadius:10, transition:"all 0.15s" },
  tabActive:  { background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"white", boxShadow:"0 2px 8px rgba(99,102,241,0.35)" },
  card:       { background:"white", borderRadius:16, padding:18, marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  cardTitle:  { fontWeight:800, fontSize:14, marginBottom:12, color:"#0f172a" },
  btn:        { width:"100%", padding:"13px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"white", border:"none", borderRadius:13, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 15px rgba(99,102,241,0.35)" },
  btnGhost:   { width:"100%", padding:"12px", background:"white", color:"#334155", border:"1.5px solid #e2e8f0", borderRadius:13, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
  smBtn:      { padding:"8px 14px", border:"1.5px solid #e2e8f0", background:"white", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", color:"#334155", display:"flex", alignItems:"center", justifyContent:"center" },
  lbRow:      { display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid #f1f5f9" },
  input:      { flex:1, border:"1.5px solid #e2e8f0", borderRadius:11, padding:"10px 12px", fontSize:13, outline:"none", fontFamily:"inherit", minWidth:0, background:"#fafafa" },
};
