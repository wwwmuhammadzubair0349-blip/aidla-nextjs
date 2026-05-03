"use client";
// app/user/resources/page.jsx

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── SEO ──────────────────────────────────────────────────────────────────────
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
  { value:"",              label:"All Types",      icon:"🗂️" },
  { value:"notes",         label:"Notes",          icon:"📝" },
  { value:"past_papers",   label:"Past Papers",    icon:"📋" },
  { value:"thesis",        label:"Thesis",         icon:"🎓" },
  { value:"templates",     label:"Templates",      icon:"📐" },
  { value:"books",         label:"Books",          icon:"📚" },
  { value:"video_link",    label:"Video Links",    icon:"🎥" },
  { value:"external_link", label:"External Links", icon:"🔗" },
  { value:"other",         label:"Other",          icon:"📦" },
];

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

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + " KB";
  return (bytes/1048576).toFixed(1) + " MB";
}

const LIMIT = 15;

function SkeletonRow() {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"14px 16px", border:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:10, background:"#f1f5f9", flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ height:13, background:"#f1f5f9", borderRadius:6, marginBottom:7, width:"60%" }}/>
        <div style={{ height:11, background:"#f1f5f9", borderRadius:6, width:"40%" }}/>
      </div>
      <div style={{ width:90, height:34, background:"#f1f5f9", borderRadius:8 }}/>
    </div>
  );
}

function MaterialRow({ item, onDownload, downloading }) {
  const ft         = FILE_ICONS[item.file_type] || FILE_ICONS.link;
  const cat        = CATEGORIES.find(c => c.value === item.category);
  const accentColor = CAT_COLORS[item.category] || "#6366f1";
  const isVideo    = item.category === "video_link";
  const isExternal = item.category === "external_link";

  return (
    <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:13, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"all 0.18s" }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 6px 20px rgba(26,58,143,0.09)"; e.currentTarget.style.borderColor="#dce7fb"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor="#f1f5f9"; }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:10, background:ft.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{ft.icon}</div>
          <div style={{ position:"absolute", bottom:-2, right:-2, width:14, height:14, borderRadius:"50%", background:accentColor, border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7 }}>{cat?.icon}</div>
        </div>
        <div style={{ flex:1, minWidth:160 }}>
          <Link href={`/resources/${item.slug}`}
            style={{ fontSize:14, fontWeight:700, color:"#0f172a", textDecoration:"none", lineHeight:1.3, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100%" }}>
            {item.title}
          </Link>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4, fontSize:11, color:"#94a3b8" }}>
            {item.subject     && <span>📖 {item.subject}</span>}
            {item.university  && <span>🏛 {item.university}</span>}
            {item.class_level && <span>🎓 {item.class_level}</span>}
            {item.year        && <span>📅 {item.year}</span>}
            {item.file_size_bytes && <span>💾 {formatBytes(item.file_size_bytes)}</span>}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:"rgba(22,163,74,0.08)", color:"#15803d", border:"1px solid rgba(22,163,74,0.2)" }}>✅ Unlocked</span>
          {item.file_type && (
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:ft.bg, color:ft.color, textTransform:"uppercase" }}>{item.file_type}</span>
          )}
          <button onClick={()=>onDownload(item)} disabled={downloading===item.id}
            style={{ padding:"8px 16px", background:downloading===item.id?"rgba(22,163,74,0.1)":"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:downloading===item.id?"#15803d":"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap", fontFamily:"inherit" }}>
            {downloading===item.id?"✅ Done!":isVideo?"▶ Watch":isExternal?"🔗 Open":"⬇ Download"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserResources() {
  const router = useRouter();

  const [user,         setUser]         = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [materials,    setMaterials]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("");
  const [downloading,  setDownloading]  = useState(null);
  const [stats,        setStats]        = useState({ total:0, free:0, protected:0 });

  const debounceRef = useRef(null);
  const searchRef   = useRef(null);

  useSEO("My Resources — AIDLA");

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.replace("/login?redirect=/user/resources");
        return;
      }
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load materials ──────────────────────────────────────────────────────────
  const load = useCallback(async (q=search, cat=category, p=page) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("study_materials_public_list", {
      p_search:      q   || null,
      p_category:    cat || null,
      p_subject:     null,
      p_class_level: null,
      p_university:  null,
      p_year:        null,
      p_limit:       LIMIT,
      p_offset:      (p-1)*LIMIT,
    });
    if (!error && data) { setMaterials(data); setTotal(data[0]?.total_count || 0); }
    setLoading(false);
  }, [search, category, page]);

  const loadStats = useCallback(async () => {
    const { data } = await supabase.from("study_materials").select("access,status")
      .eq("status","published").is("deleted_at",null);
    if (data) {
      setStats({
        total:     data.length,
        free:      data.filter(m=>m.access==="free").length,
        protected: data.filter(m=>m.access==="login_required").length,
      });
    }
  }, []);

  useEffect(() => { if (!checkingAuth && user) { load(); loadStats(); } }, [checkingAuth, user]); // eslint-disable-line

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); load(val,category,1); }, 350);
  };

  const handleCategory = (cat) => { setCategory(cat); setPage(1); load(search,cat,1); };

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const totalPages = Math.ceil(total / LIMIT);
  const userEmail  = user?.email || "";
  const userName   = user?.user_metadata?.full_name || userEmail.split("@")[0] || "User";

  if (checkingAuth) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🔐</div>
          <div style={{ color:"#64748b" }}>Checking authentication…</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        @media(max-width:600px){
          .dash-stats{grid-template-columns:repeat(2,1fr)!important;}
          .dash-cat-pills{gap:5px!important;}
          .dash-cat-pills button{font-size:10px!important;padding:5px 8px!important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif" }}>

        {/* Header banner */}
        <div style={{ background:"linear-gradient(135deg,#0b1437 0%,#1a3a8f 70%,#3b82f6 100%)", padding:"28px 16px 32px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:4 }}>Welcome back 👋</div>
                <h1 style={{ margin:"0 0 4px", fontSize:"clamp(1.3rem,4vw,1.8rem)", fontWeight:900, color:"#fff" }}>{userName}</h1>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>{userEmail}</div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <Link href="/resources"
                  style={{ padding:"8px 16px", background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.9)", borderRadius:8, textDecoration:"none", fontSize:13, fontWeight:600, border:"1px solid rgba(255,255,255,0.2)" }}>
                  📚 Browse Resources
                </Link>
                <button onClick={handleSignOut}
                  style={{ padding:"8px 16px", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="dash-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }}>
              {[
                { icon:"📚", label:"Total Materials", value:stats.total },
                { icon:"🌐", label:"Free Access",     value:stats.free },
                { icon:"🔓", label:"Now Unlocked",    value:stats.protected, note:"(login required — you're in!)" },
              ].map(s=>(
                <div key={s.label} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{s.label}</div>
                  {s.note && <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{s.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"22px 14px 48px" }}>

          {/* Unlocked notice */}
          <div style={{ background:"rgba(22,163,74,0.07)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:18 }}>🔓</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#15803d" }}>All materials unlocked!</div>
              <div style={{ fontSize:12, color:"#166534" }}>As a logged-in user you can download everything — including login-required materials.</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:"1 1 240px" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
              <input ref={searchRef} placeholder="Search materials…"
                onChange={e=>handleSearch(e.target.value)}
                aria-label="Search study materials"
                style={{ width:"100%", padding:"10px 12px 10px 38px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, color:"#0f172a", background:"#fff", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
            </div>
          </div>

          {/* Category pills */}
          <div className="dash-cat-pills" style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:18 }} role="group" aria-label="Filter by category">
            {CATEGORIES.map(c=>(
              <button key={c.value} onClick={()=>handleCategory(c.value)}
                aria-pressed={category===c.value}
                style={{ padding:"6px 13px", borderRadius:24, fontSize:12, fontWeight:700, cursor:"pointer", border:"1px solid", fontFamily:"inherit",
                  background: category===c.value?"linear-gradient(135deg,#1a3a8f,#3b82f6)":"#fff",
                  color:       category===c.value?"#fff":"#475569",
                  borderColor: category===c.value?"#1a3a8f":"#e2e8f0",
                  transition:"all 0.15s",
                }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Results header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>
              {loading?"Loading…":`${total.toLocaleString()} Material${total!==1?"s":""}`}
            </span>
          </div>

          {/* Materials list */}
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {Array.from({length:6}).map((_,i)=><SkeletonRow key={i}/>)}
            </div>
          ) : materials.length===0 ? (
            <div style={{ textAlign:"center", padding:"52px 20px", border:"2px dashed #e2e8f0", borderRadius:16 }}>
              <div style={{ fontSize:44, marginBottom:10 }}>📭</div>
              <div style={{ fontWeight:700, fontSize:17, color:"#334155", marginBottom:6 }}>Nothing found</div>
              <div style={{ color:"#94a3b8", fontSize:13 }}>Try a different search or filter</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {materials.map(m=>(
                <MaterialRow key={m.id} item={m} onDownload={handleDownload} downloading={downloading}/>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages>1&&!loading&&(
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6, marginTop:28, flexWrap:"wrap" }}>
              <button onClick={()=>{ const p=Math.max(1,page-1); setPage(p); load(search,category,p); }} disabled={page===1}
                style={{ padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:page===1?"not-allowed":"pointer", color:page===1?"#cbd5e1":"#334155", fontWeight:600, fontSize:13, fontFamily:"inherit" }}>
                ← Prev
              </button>
              {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>{ setPage(p); load(search,category,p); }}
                  style={{ width:34, height:34, border:"1px solid", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"inherit",
                    background: page===p?"linear-gradient(135deg,#1a3a8f,#3b82f6)":"#fff",
                    color:      page===p?"#fff":"#334155",
                    borderColor: page===p?"#1a3a8f":"#e2e8f0",
                  }}>{p}
                </button>
              ))}
              <button onClick={()=>{ const p=Math.min(totalPages,page+1); setPage(p); load(search,category,p); }} disabled={page===totalPages}
                style={{ padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:page===totalPages?"not-allowed":"pointer", color:page===totalPages?"#cbd5e1":"#334155", fontWeight:600, fontSize:13, fontFamily:"inherit" }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
