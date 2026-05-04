// app/admin/blogs/page.jsx
"use client";

import { useEffect, useMemo, useState, useRef, useCallback, lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
const SocialAutoPost = lazy(() => import("./SocialAutoPost.jsx"));

function slugify(str) {
  const latin = String(str || "")
    .toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return latin || `post-${Date.now()}`;
}

const statusColors = {
  draft:     { bg: "rgba(100,116,139,0.1)", color: "#475569", border: "rgba(100,116,139,0.2)" },
  published: { bg: "rgba(22,163,74,0.1)",   color: "#15803d", border: "rgba(22,163,74,0.25)" },
  scheduled: { bg: "rgba(245,158,11,0.1)",  color: "#b45309", border: "rgba(245,158,11,0.3)" },
};

/* ══════════════════════════════════════════════════════════════
   PASTE CLEANER (unchanged)
   ══════════════════════════════════════════════════════════════ */
function cleanPastedHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  // Remove script/style/meta/
  const removeTags = ["script","style","meta","link","head","o:p","w:sdt","xml"];
  removeTags.forEach(tag =>
    tmp.querySelectorAll(tag).forEach(el => el.remove())
  );

  // Walk every element and strip inline styles + bad attributes
  tmp.querySelectorAll("*").forEach(el => {
    // Remove all style attributes (kills colors/fonts)
    el.removeAttribute("style");
    el.removeAttribute("class");
    el.removeAttribute("id");
    el.removeAttribute("lang");
    el.removeAttribute("dir");
    el.removeAttribute("data-pm-slice");
    el.removeAttribute("data-contrast");

    const tag = el.tagName.toLowerCase();

    // Keep <a> but clean up
    if (tag === "a") {
      const href = el.getAttribute("href") || "";
      el.removeAttribute("title");
      el.removeAttribute("target");
      if (href) { el.setAttribute("href", href); el.setAttribute("target","_blank"); el.setAttribute("rel","noopener noreferrer"); }
    }

    // Keep <img> src only
    if (tag === "img") {
      const src = el.getAttribute("src") || "";
      Array.from(el.attributes).forEach(a => el.removeAttribute(a.name));
      if (src) el.setAttribute("src", src);
      el.style.maxWidth = "100%";
    }

    // Keep semantic bold/italic
    if (tag === "b") {
      const strong = document.createElement("strong");
      strong.innerHTML = el.innerHTML;
      el.replaceWith(strong);
    }
    if (tag === "i") {
      const em = document.createElement("em");
      em.innerHTML = el.innerHTML;
      el.replaceWith(em);
    }

    // Safely unwrap useless spans/fonts
    if (tag === "span" || tag === "font") {
      if (!el.childNodes.length) {
        el.remove();
      } else {
        const frag = document.createDocumentFragment();
        while (el.firstChild) frag.appendChild(el.firstChild);
        el.replaceWith(frag);
      }
    }
  });

  // Convert <div> blocks to <p> where needed
  tmp.querySelectorAll("div").forEach(div => {
    // Only convert leaf divs (no block children)
    const hasBlockChild = Array.from(div.children).some(c =>["p","h1","h2","h3","h4","h5","h6","ul","ol","li","blockquote","table","div"].includes(c.tagName.toLowerCase())
    );
    if (!hasBlockChild) {
      const p = document.createElement("p");
      while (div.firstChild) p.appendChild(div.firstChild);
      div.replaceWith(p);
    }
  });

  // Fix spacing: collapse multiple empty <p> or <br> into one
  let result = tmp.innerHTML;
  result = result.replace(/(<br\s*\/?>){3,}/gi, "<br><br>");
  result = result.replace(/(<p[^>]*>\s*<\/p>){2,}/gi, "<p></p>");
  result = result.replace(/&nbsp;/gi, " ");

  return result.trim();
}

/* ══════════════════════════════════════════════════════════════
   AUTO-STRUCTURE (unchanged)
   ══════════════════════════════════════════════════════════════ */
function autoStructureHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  // 1. Remove consecutive empty paragraphs
  let prev = null;
  Array.from(tmp.children).forEach(el => {
    const isEmpty = el.tagName === "P" && !(el.innerText || el.textContent || "").trim();
    if (isEmpty && prev && prev.tagName === "P" && !(prev.innerText || prev.textContent || "").trim()) {
      el.remove();
    } else {
      prev = el;
    }
  });

  // 2. Wrap naked text nodes in <p>
  Array.from(tmp.childNodes).forEach(node => {
    if (node.nodeType === 3 && node.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = node.textContent;
      tmp.replaceChild(p, node);
    }
  });

  // 3. Fix heading capitalisation heuristic
  const hasHeadings = tmp.querySelectorAll("h1,h2,h3,h4").length > 0;
  if (!hasHeadings) {
    Array.from(tmp.querySelectorAll("p")).forEach(p => {
      const text = (p.innerText || p.textContent || "").trim();
      if (
        text.length > 0 && text.length <= 80 &&
        !text.endsWith(".") && !text.endsWith("،") &&
        /^[A-Z\u0600-\u06FF]/.test(text) &&
        p.innerHTML === p.textContent // no nested HTML = plain text
      ) {
        const h2 = document.createElement("h2");
        h2.textContent = text;
        p.replaceWith(h2);
      }
    });
  }

  return tmp.innerHTML;
}

/* ══════════════════════════════════════════════════════════════
   RICH EDITOR (unchanged)
   ══════════════════════════════════════════════════════════════ */
function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const wrapperRef = useRef(null);
  const [showLinkModal, setShowLinkModal]       = useState(false);
  const [linkUrl, setLinkUrl]                   = useState("");
  const [linkText, setLinkText]                 = useState("");
  const [showSourceModal, setShowSourceModal]   = useState(false);
  const [sourceHtml, setSourceHtml]             = useState("");
  const [showFontSizeDropdown, setShowFontSizeDropdown]     = useState(false);
  const[showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown]       = useState(false);
  const [showColorPicker, setShowColorPicker]   = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const[currentColor, setCurrentColor]         = useState("#000000");
  const[currentBgColor, setCurrentBgColor]     = useState("#ffff00");
  
  // Floating Toolbar State
  const[quickEditPos, setQuickEditPos]         = useState(null);

  const isInternalUpdate = useRef(false);

  const FONT_FAMILIES =[
    { label: "Default",           value: "" },
    { label: "Georgia",           value: "Georgia, serif" },
    { label: "Playfair Display",  value: "'Playfair Display', serif" },
    { label: "DM Sans",           value: "'DM Sans', sans-serif" },
    { label: "Merriweather",      value: "Merriweather, serif" },
    { label: "Lato",              value: "Lato, sans-serif" },
    { label: "Courier New",       value: "'Courier New', monospace" },
    { label: "Trebuchet MS",      value: "'Trebuchet MS', sans-serif" },
    { label: "Arial",             value: "Arial, sans-serif" },
  ];
  const FONT_SIZES =["10","12","14","16","18","20","22","24","28","32","36","48","64"];
  const PRESET_COLORS =[
    "#000000","#374151","#6B7280","#9CA3AF","#FFFFFF",
    "#EF4444","#F97316","#F59E0B","#10B981","#3B82F6",
    "#8B5CF6","#EC4899","#06B6D4","#84CC16","#1E40AF",
    "#7C3AED","#0F766E","#9A3412","#1D4ED8","#065F46",
  ];

  useEffect(() => {
    const el = editorRef.current; if (!el) return;
    if (isInternalUpdate.current) { isInternalUpdate.current = false; return; }
    if (el.innerHTML !== value) el.innerHTML = value || "";
  }, [value]);

  // Floating Selection Popup Logic
  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setQuickEditPos(null);
      return;
    }
    const range = sel.getRangeAt(0);
    
    // Only show popup if selection is inside the rich editor
    if (editorRef.current && wrapperRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      const text = sel.toString().trim();
      if (!text) {
        setQuickEditPos(null);
        return;
      }
      
      const rect = range.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      
      // Calculate exact absolute position inside the wrapper
      setQuickEditPos({
        top: rect.top - wrapperRect.top,
        left: (rect.left - wrapperRect.left) + (rect.width / 2)
      });
    } else {
      setQuickEditPos(null);
    }
  },[]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [handleSelection]);

  const handleInput = useCallback(() => {
    isInternalUpdate.current = true;
    onChange(editorRef.current?.innerHTML || "");
  }, [onChange]);

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  }, [handleInput]);

  /* ── Smart Paste Handler ── */
  const autoLinkUrls = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const walk = (node) => {
      if (node.nodeType === 3) {
        const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
        if (urlRegex.test(node.textContent)) {
          const span = document.createElement("span");
          span.innerHTML = node.textContent.replace(
            urlRegex,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
          );
          const frag = document.createDocumentFragment();
          while (span.firstChild) frag.appendChild(span.firstChild);
          node.replaceWith(frag);
        }
      } else if (node.nodeType === 1 && node.tagName !== "A") {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    Array.from(tmp.childNodes).forEach(walk);
    return tmp.innerHTML;
  };

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const cd = e.clipboardData || window.clipboardData;
    if (!cd) return;

    const html = cd.getData("text/html");
    const plain = cd.getData("text/plain");

    let cleaned = "";

    try {
      if (html && html.trim()) {
        cleaned = autoLinkUrls(cleanPastedHtml(html));
      }
    } catch (err) {
      console.error("Paste cleaning failed", err);
    }

    if (!cleaned && plain) {
      const withLinks = plain.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      cleaned = withLinks
        .split(/\n{2,}/)
        .map(para => para.trim())
        .filter(Boolean)
        .map(para => `<p>${para.replace(/\n/g, "<br>")}</p>`)
        .join("");
    }

    if (!cleaned) return;

    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("insertHTML", false, cleaned);
    isInternalUpdate.current = true;
    onChange(el.innerHTML || "");
  }, [onChange]);

  /* ── Auto-Structure ── */
  const handleAutoStructure = () => {
    const current = editorRef.current?.innerHTML || "";
    const structured = autoStructureHtml(current);
    if (editorRef.current) {
      editorRef.current.innerHTML = structured;
      handleInput();
    }
  };

  const insertLink = () => {
    const sel = window.getSelection();
    const selText = sel?.toString();
    const text = linkText || selText || linkUrl;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    if (!selText) {
      exec("insertHTML", `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    } else {
      exec("createLink", url);
      setTimeout(() => {
        editorRef.current?.querySelectorAll("a").forEach(a => {
          if (a.href === url) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        });
        handleInput();
      }, 10);
    }
    setShowLinkModal(false); setLinkUrl(""); setLinkText("");
  };

  const openLinkModal = () => {
    const sel = window.getSelection();
    setLinkText(sel?.toString() || "");
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const openSourceModal = () => {
    setSourceHtml(editorRef.current?.innerHTML || "");
    setShowSourceModal(true);
  };
  const applySource = () => {
    if (editorRef.current) { editorRef.current.innerHTML = sourceHtml; handleInput(); }
    setShowSourceModal(false);
  };

  const insertImage   = () => { const url = prompt("Enter image URL:"); if (url) exec("insertHTML", `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0;" />`); };
  const insertHR      = () => exec("insertHTML", "<hr style='border:none;border-top:2px solid #e2e8f0;margin:24px 0;' />");
  const insertBlockquote = () => { const sel = window.getSelection(); const text = sel?.toString() || "Quote text here"; exec("insertHTML", `<blockquote style="border-left:4px solid #f59e0b;padding:12px 18px;background:rgba(245,158,11,0.06);border-radius:0 10px 10px 0;font-style:italic;color:#64748b;margin:16px 0;">${text}</blockquote>`); };
  const insertCallout = () => exec("insertHTML", `<div style="background:rgba(59,130,246,0.07);border-left:4px solid #3b82f6;border-radius:0 12px 12px 0;padding:14px 18px;margin:16px 0;font-size:0.95em;"><strong>💡 Note:</strong> Write your callout here.</div>`);
  const insertTable   = () => exec("insertHTML", `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.9em;"><thead><tr><th style="background:#1a3a8f;color:#fff;padding:10px 14px;text-align:left;">Header 1</th><th style="background:#1a3a8f;color:#fff;padding:10px 14px;text-align:left;">Header 2</th><th style="background:#1a3a8f;color:#fff;padding:10px 14px;text-align:left;">Header 3</th></tr></thead><tbody><tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">Cell</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">Cell</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">Cell</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">Cell</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">Cell</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">Cell</td></tr></tbody></table>`);

  const applyHeading     = (tag)  => { exec("formatBlock", tag); setShowHeadingDropdown(false); };
  const applyFontSize    = (size) => { exec("insertHTML", `<span style="font-size:${size}px">${window.getSelection()?.toString() || ""}</span>`); setShowFontSizeDropdown(false); };
  const applyFontFamily  = (ff)   => { if (ff) exec("fontName", ff); setShowFontFamilyDropdown(false); };
  const applyTextColor   = (c)    => { setCurrentColor(c); exec("foreColor", c); setShowColorPicker(false); };
  const applyBgColor     = (c)    => { setCurrentBgColor(c); exec("hiliteColor", c); setShowBgColorPicker(false); };

  const closeAllDropdowns = () => { setShowHeadingDropdown(false); setShowFontSizeDropdown(false); setShowFontFamilyDropdown(false); setShowColorPicker(false); setShowBgColorPicker(false); };

  const ToolBtn = ({ onClick, title, children, active }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick(); }} title={title}
      style={{ padding:"5px 8px", border:"none", background: active ? "rgba(26,58,143,0.12)" : "transparent", borderRadius:6, cursor:"pointer", fontSize:"13px", color:"#334155", display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:28, transition:"background 0.15s" }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(26,58,143,0.08)"}
      onMouseLeave={e=>e.currentTarget.style.background=active?"rgba(26,58,143,0.12)":"transparent"}
    >{children}</button>
  );

  const ToolBtnDark = ({ onClick, title, children }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick(); }} title={title}
      style={{ padding:"6px 10px", border:"none", background:"transparent", borderRadius:6, cursor:"pointer", fontSize:"13px", color:"#f8fafc", fontWeight:700, transition:"background 0.15s" }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    >{children}</button>
  );

  const Divider = () => <span style={{ width:1, height:20, background:"rgba(0,0,0,0.1)", margin:"0 4px", display:"inline-block", verticalAlign:"middle" }} />;
  const DividerDark = () => <span style={{ width:1, height:18, background:"rgba(255,255,255,0.2)", margin:"0 4px", display:"inline-block", verticalAlign:"middle" }} />;

  const DropdownBtn = ({ label, isOpen, onToggle, children }) => (
    <div style={{ position:"relative", display:"inline-block" }}>
      <button type="button" onMouseDown={e => { e.preventDefault(); closeAllDropdowns(); onToggle(); }}
        style={{ padding:"5px 8px", border:"1px solid rgba(0,0,0,0.1)", background:"#fff", borderRadius:6, cursor:"pointer", fontSize:"12px", color:"#334155", display:"inline-flex", alignItems:"center", gap:3, whiteSpace:"nowrap" }}
      >{label} <span style={{ fontSize:9, opacity:0.5 }}>▼</span></button>
      {isOpen && (
        <div style={{ position:"absolute", top:"100%", left:0, zIndex:1000, background:"#fff", border:"1px solid rgba(0,0,0,0.1)", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", minWidth:140, padding:"4px 0", maxHeight:220, overflowY:"auto" }}>
          {children}
        </div>
      )}
    </div>
  );

  const DropItem = ({ label, onClick, style = {} }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick(); }}
      style={{ display:"block", width:"100%", padding:"7px 14px", border:"none", background:"transparent", cursor:"pointer", textAlign:"left", fontSize:"13px", color:"#334155", ...style }}
      onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    >{label}</button>
  );

  return (
    <div ref={wrapperRef} style={{ border:"1px solid rgba(26,58,143,0.2)", borderRadius:12, overflow:"hidden", background:"#fff", position:"relative" }}>
      
      <style>{`
        @keyframes qeIn { from { opacity: 0; transform: translate(-50%, -80%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -100%) scale(1); } }
      `}</style>

      {/* ── Quick Editor Floating Popup ── */}
      {quickEditPos && (
        <div style={{
          position: "absolute",
          top: Math.max(8, quickEditPos.top - 8),
          left: quickEditPos.left,
          transform: "translate(-50%, -100%)",
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "5px 6px",
          borderRadius: "10px",
          display: "flex",
          gap: "2px",
          zIndex: 99,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          alignItems: "center",
          animation: "qeIn 0.15s cubic-bezier(0.16,1,0.3,1) forwards",
          pointerEvents: "auto"
        }} onMouseDown={e => e.preventDefault()}>
          <ToolBtnDark onClick={()=>exec("bold")} title="Bold">B</ToolBtnDark>
          <ToolBtnDark onClick={()=>exec("italic")} title="Italic">I</ToolBtnDark>
          <ToolBtnDark onClick={()=>exec("underline")} title="Underline">U</ToolBtnDark>
          <DividerDark />
          <ToolBtnDark onClick={()=>applyHeading("h2")} title="Heading 2">H2</ToolBtnDark>
          <ToolBtnDark onClick={()=>applyHeading("h3")} title="Heading 3">H3</ToolBtnDark>
          <ToolBtnDark onClick={insertBlockquote} title="Quote">❝</ToolBtnDark>
          <DividerDark />
          <ToolBtnDark onClick={openLinkModal} title="Insert Link">🔗</ToolBtnDark>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ background:"linear-gradient(135deg,#f8fafc,#f1f5f9)", borderBottom:"1px solid rgba(26,58,143,0.12)", padding:"6px 10px", display:"flex", flexWrap:"wrap", gap:3, alignItems:"center" }}>

        {/* Heading */}
        <DropdownBtn label="Heading" isOpen={showHeadingDropdown} onToggle={()=>setShowHeadingDropdown(v=>!v)}>
          <DropItem label="Paragraph"   onClick={()=>applyHeading("p")} />
          <DropItem label="Heading 1"   onClick={()=>applyHeading("h1")} style={{ fontFamily:"serif", fontSize:18, fontWeight:900 }} />
          <DropItem label="Heading 2"   onClick={()=>applyHeading("h2")} style={{ fontFamily:"serif", fontSize:16, fontWeight:800 }} />
          <DropItem label="Heading 3"   onClick={()=>applyHeading("h3")} style={{ fontSize:14, fontWeight:700 }} />
          <DropItem label="Heading 4"   onClick={()=>applyHeading("h4")} style={{ fontSize:13, fontWeight:700 }} />
          <DropItem label="Preformatted" onClick={()=>applyHeading("pre")} style={{ fontFamily:"monospace" }} />
        </DropdownBtn>

        {/* Font Family */}
        <DropdownBtn label="Font" isOpen={showFontFamilyDropdown} onToggle={()=>setShowFontFamilyDropdown(v=>!v)}>
          {FONT_FAMILIES.map(ff => <DropItem key={ff.value} label={ff.label} onClick={()=>applyFontFamily(ff.value)} style={{ fontFamily:ff.value||"inherit" }} />)}
        </DropdownBtn>

        {/* Font Size */}
        <DropdownBtn label="Size" isOpen={showFontSizeDropdown} onToggle={()=>setShowFontSizeDropdown(v=>!v)}>
          {FONT_SIZES.map(sz => <DropItem key={sz} label={`${sz}px`} onClick={()=>applyFontSize(sz)} style={{ fontSize:Math.min(parseInt(sz),16) }} />)}
        </DropdownBtn>

        <Divider />

        <ToolBtn onClick={()=>exec("bold")}          title="Bold">          <strong>B</strong></ToolBtn>
        <ToolBtn onClick={()=>exec("italic")}        title="Italic">        <em>I</em></ToolBtn>
        <ToolBtn onClick={()=>exec("underline")}     title="Underline">     <u>U</u></ToolBtn>
        <ToolBtn onClick={()=>exec("strikeThrough")} title="Strikethrough"> <s>S</s></ToolBtn>
        <ToolBtn onClick={()=>exec("superscript")}   title="Superscript">   x²</ToolBtn>
        <ToolBtn onClick={()=>exec("subscript")}     title="Subscript">     x₂</ToolBtn>

        <Divider />

        {/* Text Color */}
        <div style={{ position:"relative" }}>
          <button type="button" onMouseDown={e=>{e.preventDefault();setShowColorPicker(v=>!v);setShowBgColorPicker(false);closeAllDropdowns();}} title="Text Color"
            style={{ padding:"5px 8px", border:"1px solid rgba(0,0,0,0.1)", background:"#fff", borderRadius:6, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:3 }}>
            <span style={{ fontWeight:700, color:currentColor }}>A</span>
            <span style={{ width:14, height:3, background:currentColor, borderRadius:2, display:"block" }} />
          </button>
          {showColorPicker && (
            <div style={{ position:"absolute", top:"100%", left:0, zIndex:1000, background:"#fff", border:"1px solid rgba(0,0,0,0.1)", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", padding:10, width:150 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginBottom:8 }}>
                {PRESET_COLORS.map(c=><button key={c} type="button" onMouseDown={e=>{e.preventDefault();applyTextColor(c);}} style={{ width:22, height:22, background:c, border:"2px solid rgba(0,0,0,0.1)", borderRadius:4, cursor:"pointer" }}/>)}
              </div>
              <input type="color" value={currentColor} onChange={e=>setCurrentColor(e.target.value)} onBlur={e=>applyTextColor(e.target.value)} style={{ width:"100%", height:28, cursor:"pointer", border:"1px solid #e2e8f0", borderRadius:6 }}/>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div style={{ position:"relative" }}>
          <button type="button" onMouseDown={e=>{e.preventDefault();setShowBgColorPicker(v=>!v);setShowColorPicker(false);closeAllDropdowns();}} title="Highlight Color"
            style={{ padding:"5px 8px", border:"1px solid rgba(0,0,0,0.1)", background:"#fff", borderRadius:6, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:3 }}>
            <span style={{ fontWeight:700, background:currentBgColor, padding:"0 3px" }}>H</span>
          </button>
          {showBgColorPicker && (
            <div style={{ position:"absolute", top:"100%", left:0, zIndex:1000, background:"#fff", border:"1px solid rgba(0,0,0,0.1)", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", padding:10, width:150 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginBottom:8 }}>
                {PRESET_COLORS.map(c=><button key={c} type="button" onMouseDown={e=>{e.preventDefault();applyBgColor(c);}} style={{ width:22, height:22, background:c, border:"2px solid rgba(0,0,0,0.1)", borderRadius:4, cursor:"pointer" }}/>)}
              </div>
              <input type="color" value={currentBgColor} onChange={e=>setCurrentBgColor(e.target.value)} onBlur={e=>applyBgColor(e.target.value)} style={{ width:"100%", height:28, cursor:"pointer", border:"1px solid #e2e8f0", borderRadius:6 }}/>
            </div>
          )}
        </div>

        <Divider />

        <ToolBtn onClick={()=>exec("justifyLeft")}   title="Align Left">⬜◀</ToolBtn>
        <ToolBtn onClick={()=>exec("justifyCenter")} title="Center">≡</ToolBtn>
        <ToolBtn onClick={()=>exec("justifyRight")}  title="Align Right">▶⬜</ToolBtn>
        <ToolBtn onClick={()=>exec("justifyFull")}   title="Justify">☰</ToolBtn>

        <Divider />

        <ToolBtn onClick={()=>exec("insertUnorderedList")} title="Bullet List">• ≡</ToolBtn>
        <ToolBtn onClick={()=>exec("insertOrderedList")}   title="Numbered List">1. ≡</ToolBtn>
        <ToolBtn onClick={()=>exec("outdent")}             title="Decrease Indent">⇤</ToolBtn>
        <ToolBtn onClick={()=>exec("indent")}              title="Increase Indent">⇥</ToolBtn>

        <Divider />

        <ToolBtn onClick={openLinkModal}          title="Insert Link">🔗</ToolBtn>
        <ToolBtn onClick={()=>exec("unlink")}     title="Remove Link">🚫🔗</ToolBtn>
        <ToolBtn onClick={insertImage}            title="Insert Image">🖼</ToolBtn>

        <Divider />

        <ToolBtn onClick={insertBlockquote} title="Blockquote">❝</ToolBtn>
        <ToolBtn onClick={insertCallout}    title="Callout Box">💡</ToolBtn>
        <ToolBtn onClick={insertTable}      title="Insert Table">⊞</ToolBtn>
        <ToolBtn onClick={insertHR}         title="Horizontal Rule">─</ToolBtn>

        <Divider />

        <ToolBtn onClick={()=>exec("removeFormat")} title="Clear Formatting">✕ fmt</ToolBtn>
        <ToolBtn onClick={openSourceModal}          title="HTML Source">{"</>"}</ToolBtn>

        <Divider />

        <ToolBtn onClick={()=>exec("undo")} title="Undo">↩</ToolBtn>
        <ToolBtn onClick={()=>exec("redo")} title="Redo">↪</ToolBtn>

        <Divider />

        {/* Auto-Structure button */}
        <button type="button" onMouseDown={e=>{e.preventDefault();handleAutoStructure();}} title="Auto-fix spacing and detect headings"
          style={{ padding:"5px 10px", border:"1px solid rgba(16,185,129,0.3)", background:"rgba(16,185,129,0.07)", borderRadius:6, cursor:"pointer", fontSize:"12px", color:"#065f46", fontWeight:700, display:"inline-flex", alignItems:"center", gap:4 }}>
          ✨ Auto-Fix
        </button>
      </div>

      {/* ── Editable Area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onScroll={handleSelection}
        style={{ minHeight:320, padding:"18px 20px", outline:"none", fontSize:15, lineHeight:1.8, color:"#1e293b", fontFamily:"'DM Sans',sans-serif", overflowY:"auto", maxHeight:540 }}
      />

      {/* Word Count */}
      <div style={{ padding:"6px 14px", borderTop:"1px solid rgba(0,0,0,0.05)", fontSize:11, color:"#94a3b8", background:"#fafafa", display:"flex", justifyContent:"space-between" }}>
        <span>Rich Text · Select text for Quick Formatting · Paste from Word/ChatGPT supported</span>
        <span>{(()=>{ const txt=editorRef.current?.innerText||""; const words=txt.trim().split(/\s+/).filter(Boolean).length; const mins=Math.max(1,Math.round(words/200)); return words>0?`${words.toLocaleString()} words · ~${mins} min read`:"Start writing…"; })()}</span>
      </div>

      {/* ── Link Modal ── */}
      {showLinkModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"min(420px,90vw)", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800, color:"#0b1437" }}>🔗 Insert Hyperlink</h3>
            <label style={{ fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:4 }}>Link Text (optional)</label>
            <input value={linkText} onChange={e=>setLinkText(e.target.value)} placeholder="Display text" style={{ width:"100%", padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, marginBottom:12, fontSize:14, boxSizing:"border-box" }}/>
            <label style={{ fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:4 }}>URL *</label>
            <input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://example.com" autoFocus style={{ width:"100%", padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, marginBottom:16, fontSize:14, boxSizing:"border-box" }} onKeyDown={e=>e.key==="Enter"&&insertLink()}/>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>{setShowLinkModal(false);setLinkUrl("");setLinkText("");}} style={{ padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"#f8fafc", cursor:"pointer", fontWeight:600 }}>Cancel</button>
              <button onClick={insertLink} style={{ padding:"8px 20px", border:"none", borderRadius:8, background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", cursor:"pointer", fontWeight:700 }}>Insert Link</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Source Modal ── */}
      {showSourceModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"min(700px,95vw)", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 12px", fontSize:15, fontWeight:800, color:"#0b1437" }}>{"</> HTML Source"}</h3>
            <textarea value={sourceHtml} onChange={e=>setSourceHtml(e.target.value)} style={{ width:"100%", height:320, fontFamily:"monospace", fontSize:12, padding:12, border:"1px solid #e2e8f0", borderRadius:8, resize:"vertical", boxSizing:"border-box", lineHeight:1.5 }}/>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
              <button onClick={()=>setShowSourceModal(false)} style={{ padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"#f8fafc", cursor:"pointer", fontWeight:600 }}>Cancel</button>
              <button onClick={applySource} style={{ padding:"8px 20px", border:"none", borderRadius:8, background:"linear-gradient(135deg,#0f766e,#14b8a6)", color:"#fff", cursor:"pointer", fontWeight:700 }}>Apply HTML</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN ADMIN BLOGS COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function Blogs() {
  const [loading, setLoading]           = useState(true);
  const [msg, setMsg]                   = useState("");
  const [msgType, setMsgType]           = useState("info");
  const[posts, setPosts]               = useState([]);
  const [editing, setEditing]           = useState(null);
  const [title, setTitle]               = useState("");
  const [authorName, setAuthorName]     = useState("");
  const [slug, setSlug]                 = useState("");
  const [excerpt, setExcerpt]           = useState("");
  const [contentHtml, setContentHtml]   = useState("");
  const[status, setStatus]             = useState("draft");
  const [scheduledAt, setScheduledAt]   = useState("");
  const [metaTitle, setMetaTitle]       = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [coverUrl, setCoverUrl]         = useState("");
  const[coverPath, setCoverPath]       = useState("");
  const [uploading, setUploading]       = useState(false);
  const [suggestingImage, setSuggestingImage] = useState(false);
const [suggestedImages, setSuggestedImages] = useState([]);
  const [tags, setTags]                 = useState("");
  const [activeTab, setActiveTab]       = useState("content");

  // Comments panel
  const [comments, setComments]         = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const showMsg = (text, type = "info") => { setMsg(text); setMsgType(type); };

  const resetForm = () => {
    setEditing(null);
    setTitle(""); setAuthorName(""); setSlug(""); setExcerpt(""); setContentHtml("");
    setStatus("draft"); setScheduledAt("");
    setMetaTitle(""); setMetaDescription("");
    setCanonicalUrl(""); setCoverUrl(""); setCoverPath(""); setTags("");
    setComments([]); setShowComments(false);
    setSuggestedImages([]);
    showMsg("", "info");
  };

  const load = async () => {
    setLoading(true); showMsg("", "info");
    const { data, error } = await supabase
      .from("blogs_posts")
      .select("id,title,author_name,slug,status,excerpt,cover_image_url,published_at,scheduled_at,updated_at,deleted_at,view_count")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) { showMsg(error.message, "error"); setPosts([]); setLoading(false); return; }
    setPosts(data ||[]); setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (editing) return; setSlug(slugify(title)); },[title, editing]);

  // Load comments for currently editing post
  const loadComments = async (postId) => {
    setCommentsLoading(true);
    const { data } = await supabase.from("blogs_comments")
      .select("*").eq("post_id", postId).order("created_at", { ascending: true });
    setComments(data ||[]);
    setCommentsLoading(false);
  };

  const onPickEdit = async (row) => {
    showMsg("", "info");
    const { data, error } = await supabase.from("blogs_posts").select("*").eq("id", row.id).maybeSingle();
    if (error) return showMsg(error.message, "error");
    if (!data)  return showMsg("Blog not found", "error");
    setEditing(data);
    setTitle(data.title || ""); setAuthorName(data.author_name || ""); setSlug(data.slug || ""); setExcerpt(data.excerpt || "");
    setContentHtml(data.content_html || data.content || "");
    setStatus(data.status || "draft");
    // scheduled_at: convert to datetime-local format for input
    if (data.scheduled_at) {
      const dt = new Date(data.scheduled_at);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset()*60000).toISOString().slice(0,16);
      setScheduledAt(local);
    } else {
      setScheduledAt("");
    }
    setMetaTitle(data.meta_title || ""); setMetaDescription(data.meta_description || "");
    setCanonicalUrl(data.canonical_url || ""); setCoverUrl(data.cover_image_url || "");
    setCoverPath(data.cover_image_path || "");
    setTags((data.tags ||[]).join(", "));
    setActiveTab("content"); setShowComments(false);
    await loadComments(data.id);
  };

  const onDelete = async (row) => {
    if (!confirm("Delete this blog post?")) return;
    showMsg("", "info");
    const { data, error } = await supabase.rpc("blogs_admin_delete_post", { p_id: row.id });
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Delete failed", "error");
    resetForm(); await load(); showMsg("Deleted ✅", "success");
  };

  // Duplicate post
  const onDuplicate = async () => {
    if (!editing) return;
    showMsg("", "info");
    const newSlug = `${slug}-copy-${Date.now()}`;
    const payload = {
      p_id: null,
      p_title: `${title} (Copy)`,
      p_author_name: authorName.trim(),
      p_slug: newSlug,
      p_excerpt: excerpt.trim(),
      p_content: "",
      p_content_html: contentHtml,
      p_cover_image_url: coverUrl || "",
      p_cover_image_path: coverPath || "",
      p_status: "draft",
      p_meta_title: metaTitle.trim(),
      p_meta_description: metaDescription.trim(),
      p_canonical_url: "",
      p_tags: (typeof tags === "string" ? tags : (tags || []).join(", ")).split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
      p_scheduled_at: null,
    };
    const { data, error } = await supabase.rpc("blogs_admin_upsert_post", payload);
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Duplicate failed", "error");
    await load(); showMsg("Post duplicated as draft ✅", "success");
  };

  const onSave = async () => {
    showMsg("", "info");
    if (!title.trim())       return showMsg("Title required", "error");
    if (!slug.trim())        return showMsg("Slug required", "error");
    if (!contentHtml.trim()) return showMsg("Content required", "error");
    if (status === "scheduled" && !scheduledAt) return showMsg("Please set a scheduled date & time", "error");

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = contentHtml;
    const plainText = tempDiv.innerText || tempDiv.textContent || "";

    // Convert datetime-local string to ISO for DB
    let scheduledIso = null;
    if (status === "scheduled" && scheduledAt) {
      scheduledIso = new Date(scheduledAt).toISOString();
    }

    const payload = {
      p_id: editing?.id || null,
      p_title: title.trim(),
      p_author_name: authorName.trim(),
      p_slug: slugify(slug),
      p_excerpt: excerpt.trim(),
      p_content: plainText,
      p_content_html: contentHtml,
      p_cover_image_url: coverUrl || "",
      p_cover_image_path: coverPath || "",
      p_status: status,
      p_meta_title: metaTitle.trim(),
      p_meta_description: metaDescription.trim(),
      p_canonical_url: canonicalUrl.trim(),
      p_tags: (typeof tags === "string" ? tags : (tags || []).join(", ")).split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
      p_scheduled_at: scheduledIso,
    };
    const { data, error } = await supabase.rpc("blogs_admin_upsert_post", payload);
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Save failed", "error");
    await load(); showMsg(editing ? "Updated ✅" : "Created ✅", "success"); resetForm();
  };

async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.80);
    };
    img.src = url;
  });
}

const suggestCoverImage = async (forceRefresh = false) => {
  if (!title.trim()) return showMsg("Enter a title first to get image suggestions", "error");
  setSuggestingImage(true);
  // Always clear old suggestions before fetching new ones
  setSuggestedImages([]);
  try {
    const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-blog`;
    const CRON_SECRET  = process.env.NEXT_PUBLIC_AUTO_BLOG_SECRET || "aidla_auto_blog_2025";

    // Add a cache-busting timestamp to force fresh API calls
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: CRON_SECRET,
        mode: "image_suggest",
        title: title,
        _t: Date.now()  // <-- This ensures browser doesn't cache the request
      })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Failed");
    setSuggestedImages(data.images || []);
    if (!data.images?.length) showMsg("No images found, try a different title", "info");
  } catch (e) {
    console.error("Suggest image error:", e);
    showMsg(`Error: ${e.message || "Could not fetch suggestions"}`, "error");
  }
  setSuggestingImage(false);
};
  const onUploadCover = async (file) => {
    showMsg("", "info"); if (!file) return; setUploading(true);
    try {
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr; if (!auth?.user) throw new Error("Not logged in");
      const uid = auth.user.id;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg","jpeg","png","webp"].includes(ext) ? ext : "jpg";
      const filePath = `covers/${uid}/${Date.now()}.${safeExt}`;
      const compressed = await compressImage(file);
const { error: upErr } = await supabase.storage.from("blogs").upload(filePath, compressed, { upsert:true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from("blogs").getPublicUrl(filePath);
      if (!pubData?.publicUrl) throw new Error("Public URL not generated");
      setCoverPath(filePath); setCoverUrl(pubData.publicUrl);
      showMsg("Image uploaded ✅  Click Save to publish.", "success");
    } catch(e) { showMsg("Upload failed: " + (e?.message || String(e)), "error"); }
    finally { setUploading(false); }
  };

  // Pin / Unpin comment
  const onPinComment = async (commentId) => {
    const { error } = await supabase.rpc("blogs_pin_comment", { p_comment_id: commentId, p_post_id: editing?.id });
    if (error) { showMsg(error.message, "error"); return; }
    // Refresh comments
    await loadComments(editing.id);
    showMsg("Comment pinned 📌", "success");
  };
  const onUnpinComment = async () => {
    // Unpin all = pin a non-existent ID trick: just update directly
    const { error } = await supabase.from("blogs_comments")
      .update({ is_pinned: false }).eq("post_id", editing?.id);
    if (!error) { await loadComments(editing.id); showMsg("Comment unpinned", "success"); }
  };
  const onDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("blogs_comments").delete().eq("id", commentId);
    if (!error) { await loadComments(editing.id); showMsg("Comment deleted", "success"); }
  };

  const previewUrl = useMemo(() => { const s = slugify(slug); return s ? `/blogs/${s}` : ""; }, [slug]);
  const sc = statusColors[status] || statusColors.draft;

  // Scheduled time display helper
  const scheduledDisplay = (dt) => {
    if (!dt) return "";
    return new Date(dt).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" });
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={()=>setActiveTab(id)}
      style={{ padding:"7px 16px", border:"none", borderRadius:8, background:activeTab===id?"linear-gradient(135deg,#1a3a8f,#3b82f6)":"transparent", color:activeTab===id?"#fff":"#64748b", fontWeight:700, fontSize:"0.78rem", cursor:"pointer", transition:"all 0.2s" }}>
      {label}
    </button>
  );

  return (
    <div style={{ padding:16, maxWidth:1400, margin:"0 auto" }}>
      <style>{CSS}</style>

      <div className="ab-header">
        <div className="ab-header-icon">✍️</div>
        <div>
          <h1 className="ab-title">Blog Management</h1>
          <div className="ab-sub">Create · Schedule · Publish · Manage Comments</div>
        </div>
      </div>

      {msg && (
        <div className={`ab-msg ab-msg-${msgType}`}>
          <span>{msg}</span>
          <button className="ab-msg-close" onClick={()=>setMsg("")}>×</button>
        </div>
      )}

      <div className="ab-grid">
        {/* ── LEFT: POST LIST ── */}
        <div className="ab-card ab-list-card">
          <div className="ab-list-header">
            <span className="ab-card-title">All Posts <span className="ab-count">{posts.length}</span></span>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={load} className="ab-btn ab-btn-ghost" title="Refresh">↻</button>
              <button onClick={resetForm} className="ab-btn ab-btn-primary">+ New</button>
            </div>
          </div>

          {loading ? (
            <div className="ab-loading"><div className="ab-spinner"/> Loading…</div>
          ) : posts.length === 0 ? (
            <div className="ab-empty">No blog posts yet.<br/>Create one!</div>
          ) : (
            <div className="ab-list-scroll">
              {posts.map(p => {
                const psc = statusColors[p.status] || statusColors.draft;
                return (
                  <div key={p.id} className={`ab-post-item${editing?.id===p.id?" ab-post-item-active":""}`} onClick={()=>onPickEdit(p)}>
                    {p.cover_image_url && <div className="ab-post-thumb"><img src={p.cover_image_url} alt=""/></div>}
                    <div className="ab-post-body">
                      <div className="ab-post-top">
                        <span className="ab-post-name">{p.title}</span>
                        <span className="ab-status-pill" style={{ background:psc.bg, color:psc.color, border:`1px solid ${psc.border}` }}>{p.status}</span>
                      </div>
                      <div className="ab-post-slug">/blogs/{p.slug}</div>
                      {p.status==="scheduled" && p.scheduled_at && (
                        <div style={{ fontSize:10, color:"#b45309", fontWeight:700, marginTop:3 }}>
                          🕐 {scheduledDisplay(p.scheduled_at)}
                        </div>
                      )}
                      {p.view_count > 0 && (
                        <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>👁 {p.view_count.toLocaleString()} views</div>
                      )}
                      {p.excerpt && <div className="ab-post-excerpt">{p.excerpt}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: EDITOR ── */}
        <div className="ab-card ab-editor-card">
          <div className="ab-editor-header">
            <div>
              <div className="ab-card-title">{editing ? "Edit Post" : "New Post"}</div>
              {editing && <div className="ab-id-badge">ID: {editing.id}</div>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              {editing && (
                <>
                  <button className="ab-btn ab-btn-ghost" onClick={onDuplicate} title="Duplicate as draft">⧉ Duplicate</button>
                  <button className="ab-btn" style={{ background:"rgba(245,158,11,0.1)", color:"#b45309", border:"1px solid rgba(245,158,11,0.25)" }}
                    onClick={()=>setShowComments(v=>!v)}>
                    💬 Comments {comments.length > 0 ? `(${comments.length})` : ""}
                  </button>
                  <button className="ab-btn ab-btn-danger" onClick={()=>onDelete(editing)}>🗑 Delete</button>
                </>
              )}
              <button className="ab-btn ab-btn-save" onClick={onSave} disabled={uploading}>
                💾 {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>

          {/* ── COMMENTS PANEL ── */}
          {showComments && editing && (
            <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:14, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#92400e", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>
                📌 Comment Management
              </div>
              {commentsLoading ? (
                <div className="ab-loading"><div className="ab-spinner"/> Loading comments…</div>
              ) : comments.length === 0 ? (
                <div style={{ color:"#94a3b8", fontSize:"0.83rem", textAlign:"center", padding:"14px 0" }}>No comments yet on this post.</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:340, overflowY:"auto" }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ background:"#fff", border:`1px solid ${c.is_pinned?"rgba(245,158,11,0.4)":"rgba(26,58,143,0.08)"}`, borderRadius:12, padding:"12px 14px", position:"relative" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:900, flexShrink:0 }}>
                            {(c.author_name||"?")[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight:800, fontSize:"0.82rem", color:"#0f172a" }}>{c.author_name}</span>
                            {c.is_pinned && <span style={{ marginLeft:6, fontSize:"0.58rem", background:"rgba(245,158,11,0.2)", color:"#78350f", border:"1px solid rgba(245,158,11,0.3)", padding:"1px 7px", borderRadius:10, fontWeight:800 }}>📌 Pinned</span>}
                            {c.is_flagged && <span style={{ marginLeft:6, fontSize:"0.58rem", background:"rgba(239,68,68,0.1)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.2)", padding:"1px 7px", borderRadius:10, fontWeight:800 }}>🚩 Flagged</span>}
                            {c.parent_id && <span style={{ marginLeft:6, fontSize:"0.58rem", color:"#94a3b8", fontWeight:600 }}>↩ Reply</span>}
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                          {!c.is_pinned
                            ? <button onClick={()=>onPinComment(c.id)} style={{ padding:"3px 10px", border:"1px solid rgba(245,158,11,0.25)", borderRadius:20, background:"rgba(245,158,11,0.07)", color:"#92400e", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>📌 Pin</button>
                            : <button onClick={onUnpinComment} style={{ padding:"3px 10px", border:"1px solid rgba(100,116,139,0.2)", borderRadius:20, background:"rgba(100,116,139,0.07)", color:"#475569", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>Unpin</button>
                          }
                          <button onClick={()=>onDeleteComment(c.id)} style={{ padding:"3px 10px", border:"1px solid rgba(239,68,68,0.2)", borderRadius:20, background:"rgba(239,68,68,0.07)", color:"#dc2626", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>🗑</button>
                        </div>
                      </div>
                      <p style={{ margin:0, fontSize:"0.85rem", color:"#374151", lineHeight:1.6 }}>{c.body}</p>
                      <div style={{ marginTop:6, fontSize:"0.62rem", color:"#94a3b8", fontWeight:600 }}>
                        {new Date(c.created_at).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" })}
                        {c.edited_at && " · (edited)"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FORM ── */}
          <div className="ab-form">
            <div className="ab-section-title">📝 Basic Info</div>
            <div className="ab-grid2">
              <div className="ab-field">
                <label className="ab-label">Title *</label>
                <input className="ab-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Enter post title…"/>
              </div>
              <div className="ab-field">
                <label className="ab-label">Author Name <span className="ab-label-opt">(optional)</span></label>
                <input className="ab-input" value={authorName} onChange={e=>setAuthorName(e.target.value)} placeholder="e.g., Muhammad Zubair Afridi"/>
              </div>
              <div className="ab-field">
                <label className="ab-label">Slug (SEO URL)</label>
                <input className="ab-input" value={slug} onChange={e=>setSlug(e.target.value)}/>
                {previewUrl && <div className="ab-hint">Preview: <strong>{previewUrl}</strong></div>}
              </div>

              {/* ── STATUS + SCHEDULE ── */}
              <div className="ab-field">
                <label className="ab-label">Status</label>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <select className="ab-input" value={status} onChange={e=>setStatus(e.target.value)} style={{ flex:1 }}>
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="scheduled">🕐 Scheduled</option>
                  </select>
                  <span className="ab-status-pill" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, flexShrink:0 }}>{status}</span>
                </div>
                {/* Date/time picker shown only when scheduled */}
                {status === "scheduled" && (
                  <div style={{ marginTop:10 }}>
                    <label className="ab-label">📅 Publish Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="ab-input"
                      value={scheduledAt}
                      onChange={e=>setScheduledAt(e.target.value)}
                      min={new Date(Date.now()+60000).toISOString().slice(0,16)}
                    />
                    {scheduledAt && (
                      <div className="ab-hint" style={{ color:"#b45309", fontWeight:700 }}>
                        🕐 Will auto-publish: {scheduledDisplay(scheduledAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="ab-field ab-col-2">
                <label className="ab-label">Tags <span className="ab-label-opt">(comma separated)</span></label>
                <input className="ab-input" value={tags} onChange={e=>setTags(e.target.value)} placeholder="urdu, education, technology…"/>
                {tags && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:6 }}>
                    {tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=>(
                      <span key={t} style={{ background:"rgba(26,58,143,0.08)", color:"#1a3a8f", border:"1px solid rgba(26,58,143,0.15)", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div className="ab-field ab-col-2">
                <label className="ab-label">Excerpt <span className="ab-label-opt">(short preview)</span></label>
                <textarea className="ab-input ab-textarea" value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={2} placeholder="Brief summary shown in listings…"/>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:4, margin:"20px 0 12px", padding:"4px", background:"#f1f5f9", borderRadius:10, width:"fit-content" }}>
              <TabBtn id="content" label="📝 Content"/>
              <TabBtn id="seo"     label="🔍 SEO"/>
              <TabBtn id="cover"   label="🖼 Cover"/>
<TabBtn id="social"  label="📣 Social"/>
            </div>

            {/* ── Content Tab ── */}
            {activeTab === "content" && (
              <div>
                <div className="ab-section-title">Rich Text Content *</div>
                <RichEditor value={contentHtml} onChange={setContentHtml}/>
              </div>
            )}

            {/* ── SEO Tab ── */}
            {activeTab === "seo" && (
              <div>
                <div className="ab-section-title">🔍 SEO Settings</div>
                <div className="ab-grid2">
                  <div className="ab-field">
                    <label className="ab-label">Meta Title <span className="ab-label-opt">(optional)</span></label>
                    <input className="ab-input" value={metaTitle} onChange={e=>setMetaTitle(e.target.value)} placeholder="Defaults to post title"/>
                    <div className="ab-hint">{metaTitle.length}/60 chars recommended</div>
                  </div>
                  <div className="ab-field">
                    <label className="ab-label">Meta Description <span className="ab-label-opt">(optional)</span></label>
                    <textarea className="ab-input ab-textarea" value={metaDescription} onChange={e=>setMetaDescription(e.target.value)} rows={3} placeholder="Defaults to excerpt (160 chars ideal)"/>
                    <div className="ab-hint">{metaDescription.length}/160 chars recommended</div>
                  </div>
                  <div className="ab-field ab-col-2">
                    <label className="ab-label">Canonical URL <span className="ab-label-opt">(optional)</span></label>
                    <input className="ab-input" value={canonicalUrl} onChange={e=>setCanonicalUrl(e.target.value)} placeholder="https://…"/>
                  </div>
                </div>
                {/* Google Preview */}
                <div style={{ marginTop:16, padding:16, background:"#fff", border:"1px solid #e2e8f0", borderRadius:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Google Preview</div>
                  <div style={{ fontSize:18, color:"#1a0dab", fontWeight:400, marginBottom:3, lineHeight:1.3 }}>{metaTitle||title||"Page Title"}</div>
                  <div style={{ fontSize:13, color:"#006621", marginBottom:4 }}>aidla.online{previewUrl}</div>
                  <div style={{ fontSize:13, color:"#545454", lineHeight:1.5 }}>{metaDescription||excerpt||"Page description will appear here…"}</div>
                </div>
              </div>
            )}

            {/* ── Cover Tab ── */}
            {activeTab === "cover" && (
              <div>
                <div className="ab-section-title">🖼 Cover Image</div>
                <div className="ab-cover-zone">
                  {coverUrl ? (
                    <div className="ab-cover-preview">
                      <img src={coverUrl} alt="cover"/>
                      <div className="ab-cover-actions">
                        <label className="ab-btn ab-btn-ghost" style={{ cursor:"pointer" }}>
                          ↑ Replace
                          <input type="file" accept="image/*" disabled={uploading} style={{ display:"none" }} onChange={e=>onUploadCover(e.target.files?.[0])}/>
                        </label>
                        <button className="ab-btn ab-btn-danger" onClick={()=>{setCoverUrl("");setCoverPath("");}}>✕ Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className={`ab-upload-area${uploading?" ab-upload-area-busy":""}`}>
                      <div className="ab-upload-icon">📷</div>
                      <div className="ab-upload-text">{uploading?"Uploading…":"Click to upload cover image"}</div>
                      <div className="ab-upload-hint">JPG, PNG, WebP · Recommended 1200×630px</div>
                      <input type="file" accept="image/*" disabled={uploading} style={{ display:"none" }} onChange={e=>onUploadCover(e.target.files?.[0])}/>
                    </label>
                  )}
                 {!coverUrl && (
  <div style={{ marginTop:12 }}>
    <label className="ab-label">Or enter image URL directly</label>
    <input 
      className="ab-input" 
      value={coverUrl} 
      onChange={e=>setCoverUrl(e.target.value)} 
      placeholder="https://images.unsplash.com/…"
    />

{/* AI Suggest Button + Refresh */}
<div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
  <button
    type="button"
    onClick={() => suggestCoverImage()}
    disabled={suggestingImage}
    style={{ padding:"8px 16px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:"0.8rem", cursor:suggestingImage?"not-allowed":"pointer", opacity:suggestingImage?0.7:1, flex:1 }}
  >
    {suggestingImage ? "✨ Finding images…" : "✨ AI Suggest Images"}
  </button>
  <button
    type="button"
    onClick={() => suggestCoverImage(true)}
    disabled={suggestingImage}
    style={{ padding:"8px 16px", background:"#f1f5f9", border:"1px solid #cbd5e1", borderRadius:8, fontWeight:700, fontSize:"0.8rem", cursor:suggestingImage?"not-allowed":"pointer", color:"#334155" }}
    title="Get new random images"
  >
    🔄 Refresh
  </button>
</div>

    {/* Suggested Images Grid */}
    {suggestedImages.length > 0 && (
      <div style={{ marginTop:14 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#7c3aed", marginBottom:8, textTransform:"uppercase", letterSpacing:"1px" }}>
          Click to use →
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {suggestedImages.map((img, i) => (
            <div
              key={i}
              onClick={() => { setCoverUrl(img.url); setSuggestedImages([]); showMsg("Image selected! Click Save to publish.", "success"); }}
              style={{ cursor:"pointer", borderRadius:10, overflow:"hidden", border:"2px solid transparent", transition:"border 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.border="2px solid #7c3aed"}
              onMouseLeave={e=>e.currentTarget.style.border="2px solid transparent"}
            >
              <img src={img.url} alt={img.description} style={{ width:"100%", height:80, objectFit:"cover", display:"block" }}/>
              <div style={{ padding:"4px 6px", background:"#f8faff", fontSize:"0.6rem", color:"#475569", fontWeight:600 }}>
                📷 {img.photographer}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
                </div>
              </div>
            )}
{/* ── Social Tab ── */}
            {activeTab === "social" && (
              <div>
                <Suspense fallback={<div style={{color:"#94a3b8",padding:20}}>Loading…</div>}>
                  <SocialAutoPost post={{
                    id:              editing?.id,
                    title:           title,
                    slug:            slug,
                    excerpt:         excerpt,
                    cover_image_url: coverUrl,
                    tags:            tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
                    status:          status,
                  }}/>
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800;900&display=swap');

/* Header animations */
.ab-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 8px 0 4px;
  animation: abIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes abIn {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: none; }
}

.ab-header-icon { font-size: clamp(24px,4vw,34px); }
.ab-title {
  font-size: clamp(1.2rem,3vw,1.7rem);
  font-weight: 900;
  letter-spacing: -0.5px;
  margin: 0;
  background: linear-gradient(135deg,#0b1437,#1a3a8f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.ab-sub {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* Messages */
.ab-msg {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
  animation: abMsgIn 0.3s ease;
}
@keyframes abMsgIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: none; }
}
.ab-msg-info {
  background: rgba(26,58,143,0.07);
  border: 1px solid rgba(26,58,143,0.2);
  color: #1a3a8f;
}
.ab-msg-success {
  background: rgba(22,163,74,0.08);
  border: 1px solid rgba(22,163,74,0.25);
  color: #15803d;
}
.ab-msg-error {
  background: rgba(239,68,68,0.07);
  border: 1px solid rgba(239,68,68,0.2);
  color: #dc2626;
}
.ab-msg-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #64748b;
  padding: 0 0 0 8px;
  font-weight: 700;
  line-height: 1;
}

/* Main grid */
.ab-grid {
  display: grid;
  grid-template-columns: 320px 1fr; /* Slightly widened the sidebar for better text fit */
  gap: 20px;
  align-items: start;
}
@media (max-width:860px) {
  .ab-grid { grid-template-columns: 1fr; }
}

/* Cards */
.ab-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 24px rgba(11,20,55,0.08);
  animation: abCardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
  opacity: 0;
}
@keyframes abCardIn {
  to { opacity: 1; }
}
.ab-list-card {
  position: sticky;
  top: 12px;
}
.ab-editor-card {
  min-width: 0;
}

/* Card title and counts */
.ab-card-title {
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ab-count {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  background: rgba(26,58,143,0.1);
  color: #1a3a8f;
  border: 1px solid rgba(26,58,143,0.2);
}

/* Post list container */
.ab-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.ab-list-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 74vh;
  overflow-y: auto;
  padding-right: 4px;
}
.ab-list-scroll::-webkit-scrollbar {
  width: 4px;
}
.ab-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(26,58,143,0.2);
  border-radius: 100px;
}

/* ============================================================
   FIXED: Individual Post Item (Flex Row Layout) 
   ============================================================ */
.ab-post-item {
  display: flex;           /* MAGIC FIX: Changed from stacked to horizontal flex */
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(26,58,143,0.1);
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 2px 2px 6px rgba(15,23,42,0.04);
}
.ab-post-item:hover {
  border-color: rgba(26,58,143,0.3);
  transform: translateX(4px);
}
.ab-post-item-active {
  background: linear-gradient(135deg,rgba(26,58,143,0.05),rgba(59,130,246,0.08)) !important;
  border-color: rgba(26,58,143,0.35) !important;
  box-shadow: 0 0 14px rgba(26,58,143,0.12) !important;
}

/* Fixed Thumbnail Size */
.ab-post-thumb {
  width: 64px;             /* Fixed width square */
  height: 64px;            /* Fixed height square */
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;          /* Prevents thumbnail from squishing */
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 1px solid rgba(0,0,0,0.05);
}
.ab-post-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Right side body */
.ab-post-body {
  flex: 1;
  min-width: 0;            /* CRITICAL: Allows text-overflow ellipsis to work */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ab-post-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 2px;
}

/* Truncated Texts */
.ab-post-name {
  font-weight: 800;
  font-size: 0.85rem;
  color: #0f172a;
  white-space: nowrap;     /* Prevents title from wrapping */
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.ab-post-slug {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ab-post-excerpt {
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ab-status-pill {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ============================================================
   EDITOR SECTION
   ============================================================ */
.ab-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 10px;
  flex-wrap: wrap;
}
.ab-section-title {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(26,58,143,0.07);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Form grid */
.ab-grid2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
.ab-col-2 {
  grid-column: 1 / -1;
}
.ab-field {
  display: flex;
  flex-direction: column;
}
.ab-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}
.ab-label-opt {
  font-weight: 400;
  opacity: 0.7;
}
.ab-hint {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}
.ab-hint strong {
  color: #1a3a8f;
}
.ab-input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(26,58,143,0.15);
  background: #f8fafc;
  font-size: 0.88rem;
  color: #0f172a;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
}
.ab-input:focus {
  background: #fff;
  border-color: rgba(26,58,143,0.45);
  box-shadow: 0 0 0 4px rgba(26,58,143,0.08);
}
.ab-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

/* Buttons */
.ab-btn {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ab-btn-primary {
  background: linear-gradient(135deg,#1a3a8f,#3b82f6);
  color: #fff;
  box-shadow: 0 3px 0 #1e3a8a;
}
.ab-btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 0 #1e3a8a;
}
.ab-btn-primary:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #1e3a8a;
}
.ab-btn-save {
  background: linear-gradient(135deg,#0f766e,#14b8a6);
  color: #fff;
  box-shadow: 0 3px 0 #0f766e;
}
.ab-btn-save:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 0 #0f766e;
}
.ab-btn-save:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #0f766e;
}
.ab-btn-save:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}
.ab-btn-danger {
  background: rgba(239,68,68,0.08);
  color: #dc2626;
  border: 1px solid rgba(239,68,68,0.2);
}
.ab-btn-danger:hover {
  background: rgba(239,68,68,0.14);
}
.ab-btn-ghost {
  background: rgba(100,116,139,0.08);
  color: #475569;
  border: 1px solid rgba(100,116,139,0.2);
}
.ab-btn-ghost:hover {
  background: rgba(100,116,139,0.14);
}

/* Cover upload */
.ab-cover-zone {
  margin-top: 4px;
}
.ab-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  border: 2px dashed rgba(26,58,143,0.25);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(26,58,143,0.02);
  width: 100%;
  box-sizing: border-box;
}
.ab-upload-area:hover {
  border-color: rgba(26,58,143,0.5);
  background: rgba(26,58,143,0.05);
}
.ab-upload-area-busy {
  opacity: 0.6;
  cursor: wait;
}
.ab-upload-icon {
  font-size: 32px;
}
.ab-upload-text {
  font-weight: 700;
  font-size: 0.9rem;
  color: #334155;
}
.ab-upload-hint {
  font-size: 11px;
  color: #94a3b8;
}
.ab-cover-preview {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(26,58,143,0.15);
}
.ab-cover-preview img {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  display: block;
}
.ab-cover-actions {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(248,250,252,0.9);
}

/* Loader and empty state */
.ab-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  justify-content: center;
}
.ab-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(26,58,143,0.2);
  border-top-color: #1a3a8f;
  border-radius: 50%;
  animation: abSpin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes abSpin {
  to { transform: rotate(360deg); }
}
.ab-empty {
  color: #64748b;
  font-size: 0.85rem;
  padding: 30px 0;
  font-weight: 600;
  text-align: center;
  line-height: 1.8;
}

/* Form fade-in */
.ab-form {
  animation: abFadeIn 0.3s ease;
}
@keyframes abFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}
`;