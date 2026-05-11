"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: "",              label: "All Types",      icon: "🗂️" },
  { value: "notes",         label: "Notes",          icon: "📝" },
  { value: "past_papers",   label: "Past Papers",    icon: "📋" },
  { value: "thesis",        label: "Thesis",         icon: "🎓" },
  { value: "templates",     label: "Templates",      icon: "📐" },
  { value: "books",         label: "Books",          icon: "📚" },
  { value: "video_link",    label: "Video Links",    icon: "🎥" },
  { value: "external_link", label: "External Links", icon: "🔗" },
  { value: "other",         label: "Other",          icon: "📦" },
];

const FILE_TYPE_ICONS = {
  pdf:  { icon: "📄", color: "#dc2626", bg: "rgba(239,68,68,0.1)"  },
  doc:  { icon: "📝", color: "#d97706", bg: "rgba(245,158,11,0.1)" },
  ppt:  { icon: "📊", color: "#d97706", bg: "rgba(245,158,11,0.1)" },
  xls:  { icon: "📈", color: "#059669", bg: "rgba(16,185,129,0.1)" },
  zip:  { icon: "🗜️", color: "#92400e", bg: "rgba(245,158,11,0.1)" },
  mp4:  { icon: "🎥", color: "#db2777", bg: "rgba(236,72,153,0.1)" },
  link: { icon: "🔗", color: "#d97706", bg: "rgba(245,158,11,0.1)" },
};

const CAT_COLORS = {
  notes:         "#f59e0b",
  past_papers:   "#d97706",
  thesis:        "#059669",
  templates:     "#06b6d4",
  books:         "#10b981",
  video_link:    "#ef4444",
  external_link: "#f97316",
  other:         "#6366f1",
};

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

const LIMIT = 12;

function SkeletonCard() {
  return (
    <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:"1px solid rgba(245,158,11,0.14)" }}>
      <div style={{ height:5, background:"#fde68a" }}/>
      <div style={{ padding:16 }}>
        <div style={{ height:10, background:"#fef3c7", borderRadius:6, marginBottom:10, width:"35%" }}/>
        <div style={{ height:16, background:"#fef3c7", borderRadius:6, marginBottom:8 }}/>
        <div style={{ height:13, background:"#fef3c7", borderRadius:6, width:"75%", marginBottom:14 }}/>
        <div style={{ display:"flex", gap:6 }}>
          <div style={{ height:22, width:55, background:"#fef3c7", borderRadius:20 }}/>
          <div style={{ height:22, width:70, background:"#fef3c7", borderRadius:20 }}/>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, text }) {
  return (
    <span style={{
      fontSize:10, fontWeight:600, color:"#78350f",
      background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.18)",
      borderRadius:20, padding:"2px 7px",
      display:"inline-flex", alignItems:"center", gap:3,
      whiteSpace:"nowrap", maxWidth:110,
      overflow:"hidden", textOverflow:"ellipsis",
    }}>
      {icon} {text}
    </span>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 10px", background:"rgba(245,158,11,0.1)",
      color:"#92400e", border:"1px solid rgba(245,158,11,0.3)",
      borderRadius:20, fontSize:12, fontWeight:600,
    }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", color:"#d97706", fontSize:14, padding:0, lineHeight:1 }}>✕</button>
    </span>
  );
}

function MaterialCard({ item }) {
  const ft  = FILE_TYPE_ICONS[item.file_type] || FILE_TYPE_ICONS.link;
  const cat = CATEGORIES.find(c => c.value === item.category);
  const isLink = ["video_link","external_link"].includes(item.category);
  const accentColor = CAT_COLORS[item.category] || "#f59e0b";

  return (
    <Link href={`/resources/${item.slug}`} style={{ textDecoration:"none", display:"flex", flexDirection:"column" }}>
      <article style={{
        background:"#fff", borderRadius:14, border:"1px solid rgba(245,158,11,0.14)",
        overflow:"hidden", cursor:"pointer", transition:"all 0.2s",
        boxShadow:"0 1px 4px rgba(15,23,42,0.04)",
        display:"flex", flexDirection:"column", height:"100%",
      }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,158,11,0.18)";
          e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.04)";
          e.currentTarget.style.borderColor = "rgba(245,158,11,0.14)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ height:4, background: accentColor, flexShrink:0 }}/>
        <div style={{ padding:"14px 14px 12px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:32, height:32, borderRadius:8, background: ft.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                {isLink ? cat?.icon : ft.icon}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color: ft.color, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                  {isLink ? (item.category==="video_link" ? "Video" : "Link") : (item.file_type?.toUpperCase() || "File")}
                </div>
                <div style={{ fontSize:10, color:"#94a3b8" }}>{cat?.label}</div>
              </div>
            </div>
            <span style={{
              fontSize:9, fontWeight:800, padding:"3px 7px", borderRadius:20, flexShrink:0,
              background: item.access==="free" ? "rgba(22,163,74,0.08)" : "rgba(245,158,11,0.1)",
              color:      item.access==="free" ? "#15803d"              : "#92400e",
              border:     `1px solid ${item.access==="free" ? "rgba(22,163,74,0.25)" : "rgba(245,158,11,0.3)"}`,
              textTransform:"uppercase", letterSpacing:"0.04em",
            }}>
              {item.access==="free" ? "Free" : "Login"}
            </span>
          </div>
          <h3 style={{
            margin:0, fontSize:13, fontWeight:700, color:"#0f172a", lineHeight:1.4,
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
          }}>
            {item.title}
          </h3>
          {item.description && (
            <p style={{
              margin:0, fontSize:11, color:"#64748b", lineHeight:1.5,
              display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
            }}>
              {item.description}
            </p>
          )}
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:"auto", paddingTop:4 }}>
            {item.subject     && <Chip icon="📖" text={item.subject}/>}
            {item.class_level && <Chip icon="🎓" text={item.class_level}/>}
            {item.university  && <Chip icon="🏛" text={item.university}/>}
            {item.year        && <Chip icon="📅" text={item.year}/>}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:8, borderTop:"1px solid rgba(245,158,11,0.1)", marginTop:4 }}>
            <div style={{ display:"flex", gap:10, fontSize:11, color:"#94a3b8" }}>
              <span>⬇ {(item.download_count||0).toLocaleString()}</span>
              <span>👁 {(item.view_count||0).toLocaleString()}</span>
              {item.file_size_bytes && <span>{formatBytes(item.file_size_bytes)}</span>}
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:"#d97706" }}>View →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FilterSidebar({ filters, options, onChange, onReset, total, isMobile, onClose }) {
  const hasActive = filters.category || filters.subject || filters.university || filters.class_level || filters.year;
  const selectStyle = {
    width:"100%", padding:"8px 10px", border:"1px solid rgba(245,158,11,0.2)",
    borderRadius:8, fontSize:13, color:"#334155",
    background:"#fff", cursor:"pointer", outline:"none",
  };
  return (
    <aside style={{ background:"#fff", borderRadius:16, border:"1px solid rgba(245,158,11,0.14)", padding:18, boxShadow:"0 1px 6px rgba(15,23,42,0.04)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <div style={{ fontWeight:800, fontSize:15, color:"#0f172a" }}>🔍 Filters</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {hasActive && (
            <button onClick={onReset} style={{ fontSize:11, color:"#dc2626", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontWeight:700 }}>
              ✕ Clear
            </button>
          )}
          {isMobile && (
            <button onClick={onClose} style={{ fontSize:20, background:"none", border:"none", cursor:"pointer", color:"#64748b", lineHeight:1 }}>✕</button>
          )}
        </div>
      </div>
      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:14 }}>{total.toLocaleString()} materials total</div>
      <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>Type</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => onChange("category", c.value)}
            style={{
              padding:"5px 10px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer", border:"1px solid",
              background:  filters.category === c.value ? "#0f172a" : "#fffbeb",
              color:       filters.category === c.value ? "#f59e0b" : "#475569",
              borderColor: filters.category === c.value ? "#0f172a" : "rgba(245,158,11,0.2)",
            }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      {options.subjects?.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>Subject</div>
          <select style={selectStyle} value={filters.subject} onChange={e => onChange("subject", e.target.value)}>
            <option value="">All Subjects</option>
            {options.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      {options.universities?.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>University</div>
          <select style={selectStyle} value={filters.university} onChange={e => onChange("university", e.target.value)}>
            <option value="">All Institutions</option>
            {options.universities.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      )}
      {options.classes?.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>Class / Level</div>
          <select style={selectStyle} value={filters.class_level} onChange={e => onChange("class_level", e.target.value)}>
            <option value="">All Levels</option>
            {options.classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      {options.years?.length > 0 && (
        <div style={{ marginBottom:4 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>Year</div>
          <select style={selectStyle} value={filters.year} onChange={e => onChange("year", e.target.value)}>
            <option value="">All Years</option>
            {options.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}
    </aside>
  );
}

export default function ResourcesClient({ initialMaterials = [], initialTotal = 0, initialOptions = { subjects:[], universities:[], classes:[], years:[] } }) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [materials,  setMaterials]  = useState(initialMaterials);
  const [total,      setTotal]      = useState(initialTotal);
  const [options,    setOptions]    = useState(initialOptions);
  const [loading,    setLoading]    = useState(false);
  const [page,       setPage]       = useState(parseInt(searchParams.get("page")) || 1);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    search:      searchParams.get("q")          || "",
    category:    searchParams.get("category")   || "",
    subject:     searchParams.get("subject")    || "",
    university:  searchParams.get("university") || "",
    class_level: searchParams.get("class")      || "",
    year:        searchParams.get("year")       || "",
  });

  const searchInputRef = useRef(null);
  const debounceRef    = useRef(null);

  const load = useCallback(async (f, p = 1) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("study_materials_public_list", {
      p_search:      f.search      || null,
      p_category:    f.category    || null,
      p_subject:     f.subject     || null,
      p_class_level: f.class_level || null,
      p_university:  f.university  || null,
      p_year:        f.year        || null,
      p_limit:       LIMIT,
      p_offset:      (p - 1) * LIMIT,
    });
    if (!error && data) {
      setMaterials(data);
      setTotal(data[0]?.total_count || 0);
    }
    setLoading(false);
  }, []);

  const pushParams = (f, p = 1) => {
    const params = new URLSearchParams();
    if (f.search)      params.set("q",          f.search);
    if (f.category)    params.set("category",   f.category);
    if (f.subject)     params.set("subject",    f.subject);
    if (f.university)  params.set("university", f.university);
    if (f.class_level) params.set("class",      f.class_level);
    if (f.year)        params.set("year",       f.year);
    if (p > 1)         params.set("page",       p.toString());
    const qs = params.toString();
    router.replace(`/resources${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const applyFilters = (newFilters, newPage = 1) => {
    setFilters(newFilters);
    setPage(newPage);
    pushParams(newFilters, newPage);
    load(newFilters, newPage);
  };

  const handleFilterChange = (key, value) => {
    applyFilters({ ...filters, [key]: value });
    setShowFilter(false);
  };

  const handleSearch = (value) => {
    const next = { ...filters, search: value };
    setFilters(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFilters(next), 400);
  };

  const handleReset = () => {
    const empty = { search:"", category:"", subject:"", university:"", class_level:"", year:"" };
    router.replace("/resources", { scroll: false });
    setFilters(empty);
    setPage(1);
    if (searchInputRef.current) searchInputRef.current.value = "";
    load(empty, 1);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = filters.search || filters.category || filters.subject || filters.university || filters.class_level || filters.year;
  const CAT_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        .res-layout{display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:start;}
        .res-sidebar-desktop{display:block;}
        .res-filter-fab{display:none;}
        .res-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
        .res-filter-drawer{display:none;}
        .res-filter-overlay{display:none;}
        @media(max-width:900px){
          .res-layout{grid-template-columns:1fr!important;}
          .res-sidebar-desktop{display:none!important;}
          .res-filter-fab{display:flex!important;}
          .res-filter-drawer{display:block!important;}
          .res-filter-overlay{display:block!important;}
        }
        @media(max-width:520px){
          .res-cards{grid-template-columns:1fr!important;}
          .res-hero-pills{gap:6px!important;}
          .res-hero-pills .cat-pill{font-size:10px!important;padding:5px 9px!important;}
        }
        @media(min-width:1100px){
          .res-cards{grid-template-columns:repeat(3,1fr)!important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#fffbeb", fontFamily:"'DM Sans',sans-serif", color:"#0f172a" }}>

        {/* ── Hero ── */}
        <section style={{
          background:"linear-gradient(135deg,#fffbeb 0%,#fef3c7 55%,#fde68a 100%)",
          borderBottom:"1px solid #f0c96a",
          padding:"clamp(28px,4vw,48px) clamp(16px,4vw,28px)",
          textAlign:"center", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(15,23,42,0.03) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }}/>
          <div style={{ maxWidth:680, margin:"0 auto", position:"relative", zIndex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(15,23,42,0.07)", border:"1px solid rgba(15,23,42,0.13)", borderRadius:24, padding:"4px 14px", fontSize:11, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color:"#0f172a", marginBottom:16 }}>
              📚 Free Study Resources
            </div>
            <h1 style={{ margin:"0 0 10px", fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,5vw,2.8rem)", fontWeight:900, color:"#0f172a", lineHeight:1.1, letterSpacing:"-.02em" }}>
              Study Materials &amp; <em style={{ fontStyle:"italic", color:"#d97706" }}>Resources</em>
            </h1>
            <p style={{ margin:"0 0 24px", fontSize:"clamp(13px,2.5vw,15px)", color:"rgba(15,23,42,0.65)", lineHeight:1.7, maxWidth:520, marginLeft:"auto", marginRight:"auto" }}>
              Notes, past papers, thesis, books — organized by subject, university and class level.
            </p>
            <div style={{ position:"relative", maxWidth:540, margin:"0 auto 20px" }}>
              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:17, pointerEvents:"none" }}>🔍</div>
              <input
                ref={searchInputRef}
                defaultValue={filters.search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search notes, books, past papers…"
                style={{ width:"100%", padding:"13px 14px 13px 44px", border:"2px solid rgba(245,158,11,0.3)", borderRadius:12, fontSize:14, background:"#fff", color:"#0f172a", outline:"none", boxShadow:"0 4px 20px rgba(15,23,42,0.08)" }}
              />
              {filters.search && (
                <button onClick={handleReset} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:17, color:"#94a3b8" }}>✕</button>
              )}
            </div>
            <div className="res-hero-pills" style={{ display:"flex", flexWrap:"wrap", gap:7, justifyContent:"center" }}>
              {CATEGORIES.filter(c => c.value).map(c => {
                const isActive = filters.category === c.value;
                const newParams = new URLSearchParams(searchParams.toString());
                if (isActive) newParams.delete("category"); else newParams.set("category", c.value);
                return (
                  <Link key={c.value} href={`/resources?${newParams.toString()}`} prefetch={false} style={{ textDecoration:"none" }}
                    onClick={e => { e.preventDefault(); handleFilterChange("category", isActive ? "" : c.value); }}>
                    <div className="cat-pill" style={{
                      padding:"6px 12px", borderRadius:24, fontSize:11, fontWeight:700, cursor:"pointer", border:"1px solid",
                      background:  isActive ? "#0f172a" : "rgba(15,23,42,0.07)",
                      color:       isActive ? "#f59e0b" : "#0f172a",
                      borderColor: isActive ? "#0f172a" : "rgba(15,23,42,0.15)",
                      transition:"all 0.15s",
                    }}>
                      {c.icon} {c.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <div style={{ maxWidth:1300, margin:"0 auto", padding:"20px 14px 48px" }}>

          {/* Mobile filter FAB */}
          <button className="res-filter-fab"
            onClick={() => setShowFilter(true)}
            style={{ width:"100%", padding:"11px 0", background:"#fff", border:"1px solid rgba(245,158,11,0.25)", borderRadius:10, fontSize:14, fontWeight:700, color:"#0f172a", cursor:"pointer", marginBottom:14, alignItems:"center", justifyContent:"center", gap:8 }}>
            🔍 Filters
            {hasFilters && <span style={{ background:"#f59e0b", color:"#0f172a", borderRadius:12, padding:"1px 7px", fontSize:11, fontWeight:800 }}>●</span>}
          </button>

          {/* Mobile drawer overlay */}
          <div className="res-filter-overlay"
            onClick={() => setShowFilter(false)}
            style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.4)", opacity:showFilter?1:0, pointerEvents:showFilter?"all":"none", transition:"opacity 0.25s" }}
          />
          <div className="res-filter-drawer" style={{ position:"fixed", left:0, top:0, bottom:0, width:"min(88vw,310px)", zIndex:1000, overflowY:"auto", padding:14, background:"#fffbeb", transform:showFilter?"translateX(0)":"translateX(-100%)", transition:"transform 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
            <FilterSidebar filters={filters} options={options} onChange={handleFilterChange} onReset={handleReset} total={total} isMobile onClose={() => setShowFilter(false)} />
          </div>

          <div className="res-layout">
            {/* Desktop sidebar */}
            <div className="res-sidebar-desktop" style={{ position:"sticky", top:20 }}>
              <FilterSidebar filters={filters} options={options} onChange={handleFilterChange} onReset={handleReset} total={total} isMobile={false} />
            </div>

            <div>
              {/* Result count + active chips */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                <span style={{ fontWeight:700, color:"#0f172a", fontSize:15 }}>
                  {loading ? "Loading…" : `${total.toLocaleString()} Material${total !== 1 ? "s" : ""}`}
                </span>
                {hasFilters && (
                  <button onClick={handleReset} style={{ fontSize:12, color:"#dc2626", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontWeight:700 }}>
                    ✕ Clear all filters
                  </button>
                )}
              </div>

              {hasFilters && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                  {filters.search      && <ActiveChip label={`"${filters.search}"`}       onRemove={() => handleFilterChange("search",      "")} />}
                  {filters.category    && <ActiveChip label={CAT_LABELS[filters.category]} onRemove={() => handleFilterChange("category",   "")} />}
                  {filters.subject     && <ActiveChip label={filters.subject}              onRemove={() => handleFilterChange("subject",    "")} />}
                  {filters.university  && <ActiveChip label={filters.university}           onRemove={() => handleFilterChange("university", "")} />}
                  {filters.class_level && <ActiveChip label={filters.class_level}          onRemove={() => handleFilterChange("class_level","")} />}
                  {filters.year        && <ActiveChip label={filters.year}                 onRemove={() => handleFilterChange("year",       "")} />}
                </div>
              )}

              {loading ? (
                <div className="res-cards">{Array.from({length:6}).map((_,i) => <SkeletonCard key={i}/>)}</div>
              ) : materials.length === 0 ? (
                <div style={{ textAlign:"center", padding:"52px 20px", border:"2px dashed rgba(245,158,11,0.25)", borderRadius:16, background:"#fff" }}>
                  <div style={{ fontSize:44, marginBottom:10 }}>📭</div>
                  <div style={{ fontWeight:700, fontSize:17, color:"#0f172a", marginBottom:6 }}>No materials found</div>
                  <div style={{ color:"#94a3b8", marginBottom:18, fontSize:13 }}>Try adjusting your filters or search</div>
                  <button onClick={handleReset} style={{ padding:"10px 24px", background:"#0f172a", color:"#f59e0b", border:"none", borderRadius:10, fontWeight:800, cursor:"pointer", fontSize:14 }}>Clear filters</button>
                </div>
              ) : (
                <div className="res-cards">{materials.map(m => <MaterialCard key={m.id} item={m} />)}</div>
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6, marginTop:28, flexWrap:"wrap" }}>
                  {page > 1 ? (
                    <Link href={`/resources?${new URLSearchParams({...filters, page: page-1}).toString()}`} prefetch={false} style={{ textDecoration:"none" }}
                      onClick={e => { e.preventDefault(); applyFilters(filters, Math.max(1, page-1)); }}>
                      <div style={{ padding:"8px 16px", border:"1px solid rgba(245,158,11,0.25)", borderRadius:8, background:"#fff", cursor:"pointer", color:"#0f172a", fontWeight:600, fontSize:13 }}>← Prev</div>
                    </Link>
                  ) : (
                    <div style={{ padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:"not-allowed", color:"#cbd5e1", fontWeight:600, fontSize:13 }}>← Prev</div>
                  )}

                  {Array.from({length: Math.min(totalPages,7)}, (_,i) => i+1).map(p => {
                    const pp = new URLSearchParams({...filters});
                    if (p > 1) pp.set("page", p); else pp.delete("page");
                    return (
                      <Link key={p} href={`/resources?${pp.toString()}`} prefetch={false} style={{ textDecoration:"none" }}
                        onClick={e => { e.preventDefault(); applyFilters(filters, p); }}>
                        <div style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13, background:page===p?"#0f172a":"#fff", color:page===p?"#f59e0b":"#0f172a", borderColor:page===p?"#0f172a":"rgba(245,158,11,0.25)" }}>
                          {p}
                        </div>
                      </Link>
                    );
                  })}

                  {page < totalPages ? (
                    <Link href={`/resources?${new URLSearchParams({...filters, page: page+1}).toString()}`} prefetch={false} style={{ textDecoration:"none" }}
                      onClick={e => { e.preventDefault(); applyFilters(filters, Math.min(totalPages, page+1)); }}>
                      <div style={{ padding:"8px 16px", border:"1px solid rgba(245,158,11,0.25)", borderRadius:8, background:"#fff", cursor:"pointer", color:"#0f172a", fontWeight:600, fontSize:13 }}>Next →</div>
                    </Link>
                  ) : (
                    <div style={{ padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:"not-allowed", color:"#cbd5e1", fontWeight:600, fontSize:13 }}>Next →</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
