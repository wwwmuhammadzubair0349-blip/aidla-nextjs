"use client";
// app/user/resources/page.jsx

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function useSEO(title) {
  useEffect(() => {
    document.title = title;
    let rob = document.querySelector('meta[name="robots"]');
    if (!rob) { rob = document.createElement("meta"); rob.setAttribute("name","robots"); document.head.appendChild(rob); }
    rob.setAttribute("content","noindex,nofollow");
    return () => { rob.setAttribute("content","index,follow"); };
  }, [title]);
}

const CATEGORIES = [
  { value:"",              label:"All",           icon:"🗂️" },
  { value:"notes",         label:"Notes",         icon:"📝" },
  { value:"past_papers",   label:"Past Papers",   icon:"📋" },
  { value:"thesis",        label:"Thesis",        icon:"🎓" },
  { value:"templates",     label:"Templates",     icon:"📐" },
  { value:"books",         label:"Books",         icon:"📚" },
  { value:"video_link",    label:"Videos",        icon:"🎥" },
  { value:"external_link", label:"Links",         icon:"🔗" },
  { value:"other",         label:"Other",         icon:"📦" },
];

const UPLOAD_CATEGORIES = CATEGORIES.filter(c => c.value !== "");

const FILE_ICONS = {
  pdf:  { icon:"📄", color:"#dc2626", bg:"rgba(239,68,68,0.1)"  },
  doc:  { icon:"📝", color:"#2563eb", bg:"rgba(59,130,246,0.1)" },
  ppt:  { icon:"📊", color:"#d97706", bg:"rgba(245,158,11,0.1)" },
  xls:  { icon:"📈", color:"#059669", bg:"rgba(16,185,129,0.1)" },
  zip:  { icon:"🗜️", color:"#7c3aed", bg:"rgba(139,92,246,0.1)" },
  mp4:  { icon:"🎥", color:"#db2777", bg:"rgba(236,72,153,0.1)" },
  link: { icon:"🔗", color:"#0284c7", bg:"rgba(14,165,233,0.1)" },
};

const CAT_COLORS = {
  notes:"#3b82f6", past_papers:"#f59e0b", thesis:"#8b5cf6",
  templates:"#06b6d4", books:"#10b981", video_link:"#ef4444",
  external_link:"#f97316", other:"#6366f1",
};

const STATUS_STYLE = {
  pending:  { bg:"rgba(245,158,11,0.08)",  color:"#b45309", border:"rgba(245,158,11,0.25)", label:"⏳ Pending" },
  approved: { bg:"rgba(22,163,74,0.08)",   color:"#15803d", border:"rgba(22,163,74,0.2)",  label:"✅ Approved" },
  rejected: { bg:"rgba(239,68,68,0.08)",   color:"#dc2626", border:"rgba(239,68,68,0.2)",  label:"❌ Rejected" },
};

function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b/1024).toFixed(1) + " KB";
  return (b/1048576).toFixed(1) + " MB";
}

function getFileType(n) {
  if (!n) return "link";
  const e = n.split(".").pop()?.toLowerCase();
  if (["doc","docx"].includes(e)) return "doc";
  if (["ppt","pptx"].includes(e)) return "ppt";
  if (["xls","xlsx","csv"].includes(e)) return "xls";
  if (["zip","rar","7z"].includes(e)) return "zip";
  if (["mp4","mov","avi"].includes(e)) return "mp4";
  if (e === "pdf") return "pdf";
  return "link";
}

function slugify(str) {
  return String(str||"").toLowerCase().trim()
    .replace(/['"]/g,"").replace(/[^a-z0-9]+/g,"-")
    .replace(/-+/g,"-").replace(/^-|-$/g,"") || `material-${Date.now()}`;
}

const LIMIT = 15;

const EMPTY_UPLOAD = {
  title:"", category:"notes", subject:"", class_level:"", university:"",
  year:"", description:"", tags:"", file_url:"", file_path:"", file_type:"",
  file_size_bytes:null, external_url:"", is_free:true, coin_price:"",
};

function SkeletonRow() {
  return (
    <div className="res-card" style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:38, height:38, borderRadius:9, background:"#f1f5f9", flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ height:12, background:"#f1f5f9", borderRadius:5, marginBottom:6, width:"60%" }}/>
        <div style={{ height:10, background:"#f1f5f9", borderRadius:5, width:"40%" }}/>
      </div>
      <div style={{ width:80, height:30, background:"#f1f5f9", borderRadius:7 }}/>
    </div>
  );
}

function MaterialRow({ item, onDownload, downloading, purchased, onBuy, buying, userBalance }) {
  const ft          = FILE_ICONS[item.file_type] || FILE_ICONS.link;
  const cat         = CATEGORIES.find(c => c.value === item.category);
  const accentColor = CAT_COLORS[item.category] || "#6366f1";
  const isVideo     = item.category === "video_link";
  const isExternal  = item.category === "external_link";
  const isPaid      = !item.is_free && Number(item.coin_price) > 0;
  const isOwned     = purchased || !isPaid;
  const canAfford   = Number(userBalance || 0) >= Number(item.coin_price || 0);

  return (
    <div className="res-card res-mat-row">
      <div style={{ position:"relative", flexShrink:0 }}>
        <div style={{ width:38, height:38, borderRadius:9, background:ft.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{ft.icon}</div>
        <div style={{ position:"absolute", bottom:-2, right:-2, width:13, height:13, borderRadius:"50%", background:accentColor, border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:6 }}>{cat?.icon}</div>
      </div>
      <div className="res-mat-info">
        <Link href={`/resources/${item.slug}`} className="res-mat-title">{item.title}</Link>
        <div className="res-mat-meta">
          {item.subject      && <span>📖 {item.subject}</span>}
          {item.university   && <span>🏛 {item.university}</span>}
          {item.class_level  && <span>🎓 {item.class_level}</span>}
          {item.year         && <span>📅 {item.year}</span>}
          {item.file_size_bytes && <span>💾 {formatBytes(item.file_size_bytes)}</span>}
        </div>
      </div>
      <div className="res-mat-actions">
        {isPaid ? (
          isOwned ? (
            <>
              <span className="badge badge-green">✅ Owned</span>
              <button onClick={() => onDownload(item)} disabled={downloading===item.id} className="btn-dl btn-green">
                {downloading===item.id?"✅ Done!":isVideo?"▶ Watch":isExternal?"🔗 Open":"⬇ Download"}
              </button>
            </>
          ) : (
            <>
              <span className="badge badge-amber">💰 {item.coin_price}</span>
              <button onClick={() => onBuy(item)} disabled={buying===item.id || !canAfford}
                className={`btn-dl ${!canAfford?"btn-disabled":"btn-amber"}`}>
                {buying===item.id?"Buying…":!canAfford?"Need coins":"🛒 Buy"}
              </button>
            </>
          )
        ) : (
          <>
            <span className="badge badge-green">🌐 Free</span>
            <button onClick={() => onDownload(item)} disabled={downloading===item.id} className="btn-dl btn-blue">
              {downloading===item.id?"✅ Done!":isVideo?"▶ Watch":isExternal?"🔗 Open":"⬇ Download"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function FormField({ label, required, hint, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>
        {label}{required && <span style={{ color:"#ef4444", marginLeft:3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize:11, color:"#94a3b8" }}>{hint}</div>}
    </div>
  );
}

const inputSt = { width:"100%", padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, color:"#0f172a", background:"#fff", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
const selSt   = { ...inputSt, cursor:"pointer" };

export default function ResourcesPage() {
  const router = useRouter();

  const [user,         setUser]         = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tab,          setTab]          = useState("browse");
  const [balance,      setBalance]      = useState(0);
  const [fullName,     setFullName]     = useState("");
  const [uploadReward, setUploadReward] = useState(null);
  const [coinsEarned,  setCoinsEarned]  = useState(0);
  const [coinsSpent,   setCoinsSpent]   = useState(0);

  // Browse
  const [materials,    setMaterials]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("");
  const [downloading,  setDownloading]  = useState(null);
  const [buying,       setBuying]       = useState(null);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const [buyMsg,       setBuyMsg]       = useState("");
  const [stats,        setStats]        = useState({ total:0, free:0, paid:0 });

  // My Uploads
  const [myUploads,      setMyUploads]      = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadForm,     setUploadForm]     = useState(EMPTY_UPLOAD);
  const [fileUploading,  setFileUploading]  = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMsg,      setUploadMsg]      = useState({ text:"", type:"" });
  const fileRef = useRef(null);

  // Purchased
  const [purchased,        setPurchased]        = useState([]);
  const [purchasedLoading, setPurchasedLoading] = useState(false);

  const debounceRef = useRef(null);
  useSEO("My Resources — AIDLA");

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { router.replace("/login?redirect=/user/resources"); return; }
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, []); // eslint-disable-line

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadBalance = useCallback(async (uid) => {
    const { data } = await supabase.from("users_profiles").select("total_aidla_coins,full_name").eq("user_id",uid).single();
    setBalance(Number(data?.total_aidla_coins || 0));
    if (data?.full_name) setFullName(data.full_name);
  }, []);

  const loadPurchasedIds = useCallback(async (uid) => {
    const { data } = await supabase.from("user_resource_purchases").select("material_id").eq("user_id",uid);
    setPurchasedIds(new Set((data||[]).map(r => r.material_id)));
  }, []);

  const loadCoinsEarned = useCallback(async (uid) => {
    const { data } = await supabase.from("users_transactions")
      .select("amount").eq("user_id",uid).like("txn_no","RES-APR%");
    setCoinsEarned((data||[]).reduce((s,r) => s + Number(r.amount||0), 0));
  }, []);

  const loadCoinsSpent = useCallback(async (uid) => {
    const { data } = await supabase.from("user_resource_purchases")
      .select("coins_spent").eq("user_id",uid);
    setCoinsSpent((data||[]).reduce((s,r) => s + Number(r.coins_spent||0), 0));
  }, []);

  const loadMaterials = useCallback(async (q=search, cat=category, p=page) => {
    setLoading(true);
    let query = supabase
      .from("study_materials")
      .select("id,title,slug,category,subject,university,class_level,year,file_type,file_size_bytes,file_url,external_url,is_free,coin_price", { count:"exact" })
      .eq("status","published").eq("approval_status","approved").is("deleted_at",null);
    if (q)   query = query.ilike("title", `%${q}%`);
    if (cat) query = query.eq("category", cat);
    const { data, error, count } = await query.order("created_at",{ ascending:false }).range((p-1)*LIMIT, p*LIMIT-1);
    if (!error && data) { setMaterials(data); setTotal(count||0); }
    setLoading(false);
  }, [search, category, page]);

  const loadStats = useCallback(async () => {
    const { data } = await supabase.from("study_materials")
      .select("is_free,coin_price").eq("status","published").eq("approval_status","approved").is("deleted_at",null);
    if (data) setStats({
      total: data.length,
      free:  data.filter(m => m.is_free || !m.coin_price).length,
      paid:  data.filter(m => !m.is_free && Number(m.coin_price) > 0).length,
    });
  }, []);

  const loadMyUploads = useCallback(async (uid) => {
    setUploadsLoading(true);
    const { data } = await supabase.from("study_materials")
      .select("id,title,category,approval_status,coin_price,is_free,rejection_note,created_at")
      .eq("uploaded_by_user_id",uid).order("created_at",{ ascending:false });
    setMyUploads(data || []);
    setUploadsLoading(false);
  }, []);

  const loadPurchased = useCallback(async (uid) => {
    setPurchasedLoading(true);
    const { data } = await supabase.from("user_resource_purchases")
      .select("coins_spent,purchased_at,material_id,study_materials(id,title,category,file_url,external_url,file_type,file_size_bytes,slug)")
      .eq("user_id",uid).order("purchased_at",{ ascending:false });
    setPurchased(data || []);
    setPurchasedLoading(false);
  }, []);

  const loadUploadReward = useCallback(async () => {
    const { data } = await supabase.from("resource_settings").select("upload_reward_coins").eq("id",1).single();
    if (data) setUploadReward(Number(data.upload_reward_coins));
  }, []);

  useEffect(() => {
    if (!checkingAuth && user) {
      loadMaterials(); loadStats(); loadBalance(user.id); loadPurchasedIds(user.id);
      loadUploadReward(); loadCoinsEarned(user.id); loadCoinsSpent(user.id);
    }
  }, [checkingAuth, user]); // eslint-disable-line

  useEffect(() => {
    if (!checkingAuth && user && tab === "uploads")   loadMyUploads(user.id);
    if (!checkingAuth && user && tab === "purchased") loadPurchased(user.id);
  }, [tab, checkingAuth, user]); // eslint-disable-line

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); loadMaterials(val,category,1); }, 350);
  };

  const handleCategory = (cat) => { setCategory(cat); setPage(1); loadMaterials(search,cat,1); };

  const handleDownload = async (item) => {
    setDownloading(item.id);
    await supabase.rpc("study_materials_increment_download", { p_material_id:item.id, p_user_id:user?.id||null });
    const url = item.file_url || item.external_url;
    if (url) {
      const a = document.createElement("a");
      a.href=url; a.target="_blank"; a.rel="noopener noreferrer";
      if (item.file_url) a.download = item.title;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
    setTimeout(() => setDownloading(null), 2500);
  };

  const handleBuy = async (item) => {
    setBuying(item.id);
    const { data, error } = await supabase.rpc("resource_purchase", { p_material_id:item.id });
    setBuying(null);
    if (error || !data?.ok) {
      setBuyMsg(error?.message || data?.error || "Purchase failed");
      setTimeout(() => setBuyMsg(""), 4000);
      return;
    }
    await Promise.all([loadBalance(user.id), loadCoinsSpent(user.id)]);
    setPurchasedIds(prev => new Set([...prev, item.id]));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileUploading(true);
    try {
      const path = `user-uploads/${user.id}/${Date.now()}-${file.name.replace(/\s+/g,"-")}`;
      const { error: upErr } = await supabase.storage.from("study-materials").upload(path, file, { upsert:true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("study-materials").getPublicUrl(path);
      setUploadForm(f => ({ ...f, file_url:pub.publicUrl, file_path:path, file_type:getFileType(file.name), file_size_bytes:file.size }));
    } catch (e) {
      setUploadMsg({ text:"File upload failed: " + e.message, type:"err" });
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmitUpload = async () => {
    if (!uploadForm.title.trim())     { setUploadMsg({ text:"Title is required", type:"err" }); return; }
    if (!uploadForm.category)         { setUploadMsg({ text:"Category is required", type:"err" }); return; }
    if (!uploadForm.file_url && !uploadForm.external_url) { setUploadMsg({ text:"Upload a file or provide a URL", type:"err" }); return; }

    const { data, error } = await supabase.rpc("resource_user_upload", {
      p_title:           uploadForm.title.trim(),
      p_slug:            slugify(uploadForm.title),
      p_description:     uploadForm.description.trim() || null,
      p_language:        "en",
      p_category:        uploadForm.category,
      p_subject:         uploadForm.subject.trim()     || null,
      p_class_level:     uploadForm.class_level.trim() || null,
      p_university:      uploadForm.university.trim()  || null,
      p_year:            uploadForm.year.trim()         || null,
      p_tags:            uploadForm.tags.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean),
      p_file_url:        uploadForm.file_url     || null,
      p_file_path:       uploadForm.file_path    || null,
      p_file_type:       uploadForm.file_type    || null,
      p_file_size_bytes: uploadForm.file_size_bytes || null,
      p_external_url:    uploadForm.external_url.trim() || null,
      p_coin_price:      0,
      p_is_free:         true,
    });

    if (error || !data?.ok) { setUploadMsg({ text:error?.message || data?.error || "Submission failed", type:"err" }); return; }
    setUploadMsg({ text:"Submitted! Pending admin approval. You'll earn coins once approved.", type:"ok" });
    setUploadForm(EMPTY_UPLOAD);
    setShowUploadForm(false);
    await loadMyUploads(user.id);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const userName   = fullName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  if (checkingAuth) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:8 }}>🔐</div>
        <div style={{ color:"#64748b", fontSize:14 }}>Checking authentication…</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        /* ── base (320 px) ─────────────────── */
        .res-page{min-height:100vh;background:#f8fafc;font-family:'DM Sans',sans-serif;}
        .res-header{background:linear-gradient(135deg,#0b1437 0%,#1a3a8f 70%,#3b82f6 100%);padding:14px 12px 18px;}
        .res-header-inner{max-width:1100px;margin:0 auto;}
        .res-header-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;}
        .res-user-label{font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:2px;}
        .res-user-name{margin:0 0 2px;font-size:clamp(1.05rem,5vw,1.8rem);font-weight:900;color:#fff;}
        .res-user-email{font-size:11px;color:rgba(255,255,255,0.5);}
        .res-balance-chip{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:7px;padding:5px 10px;font-size:12px;font-weight:700;color:#fff;white-space:nowrap;}
        .res-browse-link{padding:6px 12px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.85);border-radius:7px;text-decoration:none;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.18);white-space:nowrap;}
        .res-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px;}
        .res-stat-card{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.14);border-radius:10px;padding:10px 10px;}
        .res-stat-icon{font-size:15px;margin-bottom:3px;}
        .res-stat-val{font-size:17px;font-weight:900;color:#fff;line-height:1.1;}
        .res-stat-label{font-size:9px;color:rgba(255,255,255,0.6);margin-top:2px;text-transform:uppercase;letter-spacing:0.04em;}
        .res-tabs{background:#fff;border-bottom:1px solid #f1f5f9;overflow-x:auto;-webkit-overflow-scrolling:touch;}
        .res-tabs-inner{max-width:1100px;margin:0 auto;padding:0 8px;display:flex;}
        .res-tab-btn{padding:10px 10px;border:none;background:none;font-weight:700;font-size:11px;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all 0.15s;border-bottom:2px solid transparent;color:#64748b;flex:1;min-width:0;}
        .res-tab-btn.active{color:#1a3a8f;border-bottom-color:#1a3a8f;}
        .res-content{max-width:1100px;margin:0 auto;padding:14px 10px 60px;}
        .res-card{background:#fff;border:1px solid #f1f5f9;border-radius:12px;padding:10px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);}
        .res-mat-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;transition:all 0.18s;}
        .res-mat-row:hover{box-shadow:0 4px 16px rgba(26,58,143,0.08);border-color:#dce7fb;}
        .res-mat-info{flex:1;min-width:120px;}
        .res-mat-title{font-size:12px;font-weight:700;color:#0f172a;text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .res-mat-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:3px;font-size:10px;color:#94a3b8;}
        .res-mat-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0;}
        .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;border:1px solid;}
        .badge-green{background:rgba(22,163,74,0.08);color:#15803d;border-color:rgba(22,163,74,0.2);}
        .badge-amber{background:rgba(245,158,11,0.08);color:#b45309;border-color:rgba(245,158,11,0.25);}
        .btn-dl{padding:6px 12px;border:none;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
        .btn-green{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;}
        .btn-blue{background:linear-gradient(135deg,#1a3a8f,#3b82f6);color:#fff;}
        .btn-amber{background:linear-gradient(135deg,#b45309,#f59e0b);color:#fff;}
        .btn-disabled{background:#f1f5f9;color:#94a3b8;cursor:not-allowed;}
        .res-search{width:100%;padding:9px 12px 9px 36px;border:1px solid #e2e8f0;border-radius:9px;font-size:13px;color:#0f172a;background:#fff;outline:none;font-family:inherit;}
        .res-cat-pills{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}
        .res-cat-btn{padding:4px 8px;border-radius:20px;font-size:10px;font-weight:700;cursor:pointer;border:1px solid;font-family:inherit;}
        .res-empty{text-align:center;padding:36px 14px;border:2px dashed #e2e8f0;border-radius:14px;}
        .res-empty-icon{font-size:34px;margin-bottom:7px;}
        .res-upload-grid{display:grid;grid-template-columns:1fr;gap:12px;}
        .res-upload-form{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;margin-bottom:20px;box-shadow:0 3px 16px rgba(0,0,0,0.06);}
        /* ── ≥ 480 px ─────────────────────── */
        @media(min-width:480px){
          .res-header{padding:18px 16px 22px;}
          .res-stat-val{font-size:19px;}
          .res-stat-icon{font-size:17px;}
          .res-stat-label{font-size:10px;}
          .res-tab-btn{padding:11px 13px;font-size:12px;}
          .res-content{padding:16px 12px 60px;}
          .res-mat-title{font-size:13px;}
          .res-mat-meta{font-size:11px;gap:6px;}
          .res-cat-btn{padding:5px 10px;font-size:11px;}
          .btn-dl{padding:7px 14px;font-size:12px;}
          .badge{font-size:10px;padding:2px 8px;}
        }
        /* ── ≥ 640 px ─────────────────────── */
        @media(min-width:640px){
          .res-stats-grid{grid-template-columns:repeat(4,1fr);gap:10px;}
          .res-upload-grid{grid-template-columns:1fr 1fr;}
          .res-stat-card{padding:12px 14px;}
          .res-tab-btn{flex:unset;padding:12px 18px;font-size:12px;}
        }
        /* ── ≥ 768 px ─────────────────────── */
        @media(min-width:768px){
          .res-header{padding:26px 20px 30px;}
          .res-tab-btn{padding:14px 20px;font-size:13px;}
          .res-content{padding:20px 16px 60px;}
          .res-stat-val{font-size:22px;}
          .res-stat-icon{font-size:20px;}
          .res-stat-label{font-size:11px;}
          .res-mat-title{font-size:14px;}
          .res-card{padding:12px 16px;}
          .res-upload-form{padding:22px;}
        }
      `}</style>
      <div className="res-page">

        {/* ── Header ── */}
        <div className="res-header">
          <div className="res-header-inner">
            <div className="res-header-top">
              <div>
                <div className="res-user-label">Welcome back 👋</div>
                <h1 className="res-user-name">{userName}</h1>
                <div className="res-user-email">{user?.email}</div>
              </div>
              <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                <div className="res-balance-chip">💰 {Number(balance).toFixed(2)}</div>

              </div>
            </div>

            {/* 4 stat cards */}
            <div className="res-stats-grid">
              {[
                { icon:"📚", label:"Library",      value:stats.total },
                { icon:"🎁", label:"Coins Earned",  value:coinsEarned.toLocaleString() },
                { icon:"💸", label:"Coins Spent",   value:coinsSpent.toLocaleString() },
                { icon:"🔓", label:"Unlocked",      value:purchasedIds.size },
              ].map(s => (
                <div key={s.label} className="res-stat-card">
                  <div className="res-stat-icon">{s.icon}</div>
                  <div className="res-stat-val">{s.value}</div>
                  <div className="res-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="res-tabs">
          <div className="res-tabs-inner">
            {[
              { id:"browse",    label:"📚 Browse" },
              { id:"uploads",   label:"⬆️ Uploads" },
              { id:"purchased", label:"🛒 Purchased" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`res-tab-btn${tab===t.id?" active":""}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="res-content">

          {/* ════════════════════════════════
              BROWSE TAB
          ════════════════════════════════ */}
          {tab === "browse" && (
            <>
              {buyMsg && (
                <div style={{ padding:"10px 14px", borderRadius:9, marginBottom:14, background:"#fee2e2", color:"#991b1b", border:"1px solid #fecaca", fontSize:13, fontWeight:600 }}>
                  ⚠️ {buyMsg}
                </div>
              )}

              <div style={{ position:"relative", marginBottom:12 }}>
                <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>🔍</span>
                <input placeholder="Search materials…" onChange={e=>handleSearch(e.target.value)} className="res-search"/>
              </div>

              <div className="res-cat-pills">
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => handleCategory(c.value)} className="res-cat-btn"
                    style={{
                      background: category===c.value?"linear-gradient(135deg,#1a3a8f,#3b82f6)":"#fff",
                      color:       category===c.value?"#fff":"#475569",
                      borderColor: category===c.value?"#1a3a8f":"#e2e8f0",
                    }}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:10 }}>
                {loading?"Loading…":`${total.toLocaleString()} Material${total!==1?"s":""}`}
              </div>

              {loading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {Array.from({length:5}).map((_,i) => <SkeletonRow key={i}/>)}
                </div>
              ) : materials.length === 0 ? (
                <div className="res-empty">
                  <div className="res-empty-icon">📭</div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#334155", marginBottom:4 }}>Nothing found</div>
                  <div style={{ color:"#94a3b8", fontSize:12 }}>Try a different search or filter</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {materials.map(m => (
                    <MaterialRow key={m.id} item={m}
                      onDownload={handleDownload} downloading={downloading}
                      purchased={purchasedIds.has(m.id)}
                      onBuy={handleBuy} buying={buying}
                      userBalance={balance}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && !loading && (
                <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:5, marginTop:24, flexWrap:"wrap" }}>
                  <button onClick={() => { const p=Math.max(1,page-1); setPage(p); loadMaterials(search,category,p); }} disabled={page===1}
                    style={{ padding:"7px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:page===1?"not-allowed":"pointer", color:page===1?"#cbd5e1":"#334155", fontWeight:600, fontSize:12, fontFamily:"inherit" }}>
                    ← Prev
                  </button>
                  {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p => (
                    <button key={p} onClick={() => { setPage(p); loadMaterials(search,category,p); }}
                      style={{ width:32, height:32, border:"1px solid", borderRadius:7, cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"inherit",
                        background: page===p?"linear-gradient(135deg,#1a3a8f,#3b82f6)":"#fff",
                        color:      page===p?"#fff":"#334155",
                        borderColor: page===p?"#1a3a8f":"#e2e8f0",
                      }}>{p}</button>
                  ))}
                  <button onClick={() => { const p=Math.min(totalPages,page+1); setPage(p); loadMaterials(search,category,p); }} disabled={page===totalPages}
                    style={{ padding:"7px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:page===totalPages?"not-allowed":"pointer", color:page===totalPages?"#cbd5e1":"#334155", fontWeight:600, fontSize:12, fontFamily:"inherit" }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ════════════════════════════════
              MY UPLOADS TAB
          ════════════════════════════════ */}
          {tab === "uploads" && (
            <div>
              {/* Info banner */}
              <div style={{ background:"rgba(26,58,143,0.05)", border:"1px solid rgba(26,58,143,0.15)", borderRadius:11, padding:"12px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:20 }}>💡</span>
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1a3a8f" }}>Upload & Earn Coins</div>
                  <div style={{ fontSize:11, color:"#334155", marginTop:1 }}>Submit a resource for admin review. Once approved it goes live and you earn coins.</div>
                </div>
                {!showUploadForm && (
                  <button onClick={() => setShowUploadForm(true)}
                    style={{ padding:"8px 16px", background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                    + Upload
                  </button>
                )}
              </div>

              {/* Upload form */}
              {showUploadForm && (
                <div className="res-upload-form">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:"#0b1437" }}>📤 Submit a Resource</div>
                    <button onClick={() => { setShowUploadForm(false); setUploadMsg({ text:"",type:"" }); setUploadForm(EMPTY_UPLOAD); }}
                      style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#94a3b8" }}>×</button>
                  </div>

                  {uploadMsg.text && (
                    <div style={{ padding:"9px 12px", borderRadius:8, marginBottom:14, fontSize:12, fontWeight:600,
                      background:uploadMsg.type==="err"?"#fee2e2":"#dcfce7",
                      color:uploadMsg.type==="err"?"#991b1b":"#166534",
                      border:`1px solid ${uploadMsg.type==="err"?"#fecaca":"#86efac"}`
                    }}>
                      {uploadMsg.type==="err"?"⚠️":"✅"} {uploadMsg.text}
                    </div>
                  )}

                  <div className="res-upload-grid">
                    <div style={{ gridColumn:"1/-1" }}>
                      <FormField label="Title" required>
                        <input value={uploadForm.title} onChange={e=>setUploadForm(f=>({...f,title:e.target.value}))}
                          placeholder="e.g. Physics Notes Chapter 5" style={inputSt}/>
                      </FormField>
                    </div>
                    <FormField label="Category" required>
                      <select value={uploadForm.category} onChange={e=>setUploadForm(f=>({...f,category:e.target.value}))} style={selSt}>
                        {UPLOAD_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Subject">
                      <input value={uploadForm.subject} onChange={e=>setUploadForm(f=>({...f,subject:e.target.value}))}
                        placeholder="e.g. Physics, Urdu" style={inputSt}/>
                    </FormField>
                    <FormField label="Class / Level">
                      <input value={uploadForm.class_level} onChange={e=>setUploadForm(f=>({...f,class_level:e.target.value}))}
                        placeholder="e.g. Grade 10" style={inputSt}/>
                    </FormField>
                    <FormField label="University / Institution">
                      <input value={uploadForm.university} onChange={e=>setUploadForm(f=>({...f,university:e.target.value}))}
                        placeholder="e.g. University of Karachi" style={inputSt}/>
                    </FormField>
                    <FormField label="Year">
                      <input value={uploadForm.year} onChange={e=>setUploadForm(f=>({...f,year:e.target.value}))}
                        placeholder="e.g. 2024" style={inputSt}/>
                    </FormField>
                    <div style={{ gridColumn:"1/-1" }}>
                      <FormField label="Tags" hint="Comma separated">
                        <input value={uploadForm.tags} onChange={e=>setUploadForm(f=>({...f,tags:e.target.value}))}
                          placeholder="physics, notes, matric" style={inputSt}/>
                      </FormField>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <FormField label="Description">
                        <textarea value={uploadForm.description} onChange={e=>setUploadForm(f=>({...f,description:e.target.value}))}
                          placeholder="What does this resource cover?" rows={3}
                          style={{ ...inputSt, resize:"vertical", lineHeight:1.6 }}/>
                      </FormField>
                    </div>

                    <div style={{ gridColumn:"1/-1" }}>
                      <FormField label="File Upload">
                        {uploadForm.file_url ? (
                          <div style={{ background:"rgba(22,163,74,0.05)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:9, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:18 }}>✅</span>
                            <div style={{ flex:1, fontSize:12, fontWeight:600, color:"#15803d" }}>
                              File ready · {uploadForm.file_type?.toUpperCase()} · {formatBytes(uploadForm.file_size_bytes)}
                            </div>
                            <button onClick={() => setUploadForm(f=>({...f,file_url:"",file_path:"",file_type:"",file_size_bytes:null}))}
                              style={{ padding:"3px 9px", border:"1px solid rgba(239,68,68,0.2)", borderRadius:5, background:"rgba(239,68,68,0.05)", cursor:"pointer", fontSize:11, color:"#dc2626", fontFamily:"inherit" }}>
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label style={{ display:"block", border:"2px dashed #e2e8f0", borderRadius:9, padding:"18px 14px", textAlign:"center", cursor:fileUploading?"not-allowed":"pointer", background:"#fafafa" }}>
                            <div style={{ fontSize:24, marginBottom:4 }}>📤</div>
                            <div style={{ fontWeight:700, color:"#334155", fontSize:12 }}>{fileUploading?"Uploading…":"Click to upload"}</div>
                            <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>PDF, DOC, PPT, XLS, ZIP, MP4</div>
                            <input type="file" style={{ display:"none" }} disabled={fileUploading} ref={fileRef}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.csv"
                              onChange={e => handleFileUpload(e.target.files?.[0])}/>
                          </label>
                        )}
                      </FormField>
                    </div>

                    <div style={{ gridColumn:"1/-1" }}>
                      <FormField label="Or External URL" hint="Google Drive, YouTube, Dropbox, etc.">
                        <input value={uploadForm.external_url} onChange={e=>setUploadForm(f=>({...f,external_url:e.target.value}))}
                          placeholder="https://drive.google.com/…" style={inputSt}/>
                      </FormField>
                    </div>

                    {/* Upload reward */}
                    <div style={{ gridColumn:"1/-1" }}>
                      <div style={{ background:"rgba(22,163,74,0.06)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:20 }}>🎁</span>
                        <div>
                          <div style={{ fontSize:11, fontWeight:700, color:"#15803d", textTransform:"uppercase", letterSpacing:"0.05em" }}>Upload Reward</div>
                          <div style={{ fontSize:20, fontWeight:900, color:"#15803d", lineHeight:1.2, marginTop:1 }}>
                            {uploadReward !== null ? `💰 ${uploadReward} coins` : "Loading…"}
                          </div>
                          <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>Earned automatically when admin approves your upload</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:8, marginTop:16 }}>
                    <button onClick={() => { setShowUploadForm(false); setUploadForm(EMPTY_UPLOAD); setUploadMsg({ text:"",type:"" }); }}
                      style={{ flex:1, padding:"10px", border:"1px solid #e2e8f0", borderRadius:9, background:"#f8fafc", fontWeight:600, fontSize:13, cursor:"pointer", color:"#64748b", fontFamily:"inherit" }}>
                      Cancel
                    </button>
                    <button onClick={handleSubmitUpload} disabled={fileUploading}
                      style={{ flex:2, padding:"10px", border:"none", borderRadius:9, background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", opacity:fileUploading?0.6:1, fontFamily:"inherit" }}>
                      📤 Submit for Approval
                    </button>
                  </div>
                </div>
              )}

              {/* My uploads list */}
              {uploadsLoading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {Array.from({length:3}).map((_,i) => <SkeletonRow key={i}/>)}
                </div>
              ) : myUploads.length === 0 ? (
                <div className="res-empty">
                  <div className="res-empty-icon">📤</div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#334155", marginBottom:4 }}>No uploads yet</div>
                  <div style={{ color:"#94a3b8", fontSize:12, marginBottom:12 }}>Share your knowledge and earn coins when approved</div>
                  {!showUploadForm && (
                    <button onClick={() => setShowUploadForm(true)}
                      style={{ padding:"9px 20px", background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", border:"none", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                      + Upload First Resource
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {myUploads.map(m => {
                    const sc  = STATUS_STYLE[m.approval_status] || STATUS_STYLE.pending;
                    const cat = CATEGORIES.find(c => c.value === m.category);
                    return (
                      <div key={m.id} className="res-card" style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                        <div style={{ width:38, height:38, borderRadius:9, background:"rgba(26,58,143,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                          {cat?.icon || "📄"}
                        </div>
                        <div style={{ flex:1, minWidth:130 }}>
                          <div style={{ fontWeight:700, fontSize:13, color:"#0f172a", marginBottom:2 }}>{m.title}</div>
                          <div style={{ fontSize:10, color:"#94a3b8" }}>
                            {cat?.label} · {m.is_free ? "🌐 Free" : `💰 ${m.coin_price} coins`} · {new Date(m.created_at).toLocaleDateString()}
                          </div>
                          {m.approval_status === "rejected" && m.rejection_note && (
                            <div style={{ fontSize:10, color:"#dc2626", marginTop:2, fontWeight:600 }}>Reason: {m.rejection_note}</div>
                          )}
                        </div>
                        <span style={{ fontSize:9, fontWeight:700, padding:"3px 10px", borderRadius:20, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, whiteSpace:"nowrap" }}>
                          {sc.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════
              PURCHASED TAB
          ════════════════════════════════ */}
          {tab === "purchased" && (
            <div>
              <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:11, padding:"11px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>🛒</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#b45309" }}>Purchased Resources</div>
                  <div style={{ fontSize:11, color:"#334155", marginTop:1 }}>Resources you've unlocked with coins. Download anytime.</div>
                </div>
              </div>

              {purchasedLoading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {Array.from({length:3}).map((_,i) => <SkeletonRow key={i}/>)}
                </div>
              ) : purchased.length === 0 ? (
                <div className="res-empty">
                  <div className="res-empty-icon">🛒</div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#334155", marginBottom:4 }}>No purchases yet</div>
                  <div style={{ color:"#94a3b8", fontSize:12, marginBottom:12 }}>Browse resources and unlock paid ones with your coins</div>
                  <button onClick={() => setTab("browse")}
                    style={{ padding:"9px 20px", background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", border:"none", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    Browse Resources
                  </button>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {purchased.map(p => {
                    const m = p.study_materials;
                    if (!m) return null;
                    const ft         = FILE_ICONS[m.file_type] || FILE_ICONS.link;
                    const isVideo    = m.category === "video_link";
                    const isExternal = m.category === "external_link";
                    return (
                      <div key={p.material_id} className="res-card" style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                        <div style={{ width:38, height:38, borderRadius:9, background:ft.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{ft.icon}</div>
                        <div style={{ flex:1, minWidth:130 }}>
                          <Link href={`/resources/${m.slug}`} style={{ fontSize:13, fontWeight:700, color:"#0f172a", textDecoration:"none", display:"block" }}>{m.title}</Link>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>
                            {new Date(p.purchased_at).toLocaleDateString()} · 💰 {p.coins_spent} coins
                          </div>
                        </div>
                        <span className="badge badge-green">✅ Owned</span>
                        <button onClick={() => handleDownload(m)} disabled={downloading===m.id} className={`btn-dl btn-green`}>
                          {downloading===m.id?"✅ Done!":isVideo?"▶ Watch":isExternal?"🔗 Open":"⬇ Download"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
