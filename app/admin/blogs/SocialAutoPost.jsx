// app/admin/social-auto-post/page.jsx
"use client";

/**
 * SocialAutoPost.jsx — AIDLA Blog Admin
 * ─────────────────────────────────────
 * • Generates branded poster via Canvas
 * • Auto-generates caption + first comment
 * • Each share button: copies caption → opens platform in new tab
 * • All major platforms: Facebook, Instagram, Twitter/X,
 *   WhatsApp, LinkedIn, Telegram, Pinterest, Threads
 */

import React, { useState, useCallback } from "react";

// ── Brand config ──────────────────────────────────────────
const BRAND = {
  name:     "AIDLA",
  color:    "#6C3FE8",
  url:      "aidla.online",
  logoPath: "/logo.webp",
  siteBase: "https://www.aidla.online/blogs",
};

// ─────────────────────────────────────────────────────────
//  Caption generator
// ─────────────────────────────────────────────────────────
function generateCaption({ title, tags = [] }) {
  const hashTags = tags.slice(0, 6).map(t => `#${t.replace(/\s+/g,"")}`).join(" ");
  const openers = [
    "📢 New on AIDLA Insights!",
    "🚀 Just published on AIDLA!",
    "📚 Fresh blog alert!",
    "💡 New insight from AIDLA!",
    "🔥 Don't miss this one!",
  ];
  const ctas = [
    "👇 Read the full article — link in first comment!",
    "📖 Full article in the first comment below!",
    "🔗 Tap the link in the first comment to read more!",
    "👀 Full read available — check the first comment!",
  ];
  const opener = openers[Math.floor(Math.random() * openers.length)];
  const cta    = ctas[Math.floor(Math.random() * ctas.length)];
  return `${opener}\n\n"${title}"\n\n${cta}\n\n${hashTags}\n\n#AIDLA #Education #Pakistan #EdTech #Learning`;
}

// ─────────────────────────────────────────────────────────
//  Canvas poster generator
// ─────────────────────────────────────────────────────────
async function generatePosterBase64({ title, coverImageUrl, badgeLabel, size = "square" }) {
  const SIZES = {
    square:    { w: 1080, h: 1080 },
    portrait:  { w: 1080, h: 1350 },
    landscape: { w: 1280, h: 720  },
  };
  const { w, h } = SIZES[size] || SIZES.square;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const imgH = Math.floor(h * 0.58);
  const textAreaH = h - imgH - Math.floor(h * 0.072);
  const barW = Math.floor(w * 0.006);
  const pad = Math.floor(w * 0.038);
  const fontSize = Math.floor(w * 0.038);
  const bottomH = Math.floor(h * 0.072);

  const loadImg = src => new Promise(res => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => res(img); img.onerror = () => res(null); img.src = src;
  });

  if (coverImageUrl) {
    const img = await loadImg(coverImageUrl);
    if (img) {
      const scale = Math.max(w / img.naturalWidth, imgH / img.naturalHeight);
      const sw = w / scale, sh = imgH / scale;
      ctx.drawImage(img, (img.naturalWidth-sw)/2, (img.naturalHeight-sh)/2, sw, sh, 0, 0, w, imgH);
    } else { ctx.fillStyle="#1a1a2e"; ctx.fillRect(0,0,w,imgH); }
  } else { ctx.fillStyle="#1a1a2e"; ctx.fillRect(0,0,w,imgH); }

  const grad = ctx.createLinearGradient(0, imgH-imgH*0.3, 0, imgH);
  grad.addColorStop(0,"rgba(0,0,0,0)"); grad.addColorStop(1,"rgba(0,0,0,0.55)");
  ctx.fillStyle=grad; ctx.fillRect(0,imgH-imgH*0.3,w,imgH*0.3);

  const bt=badgeLabel||"New Blog", bFsz=Math.floor(w*0.022), bPadX=Math.floor(w*0.028), bPadY=Math.floor(h*0.012);
  const bH=bFsz+bPadY*2; ctx.font=`700 ${bFsz}px 'Segoe UI',sans-serif`;
  const bW=ctx.measureText(bt).width+bPadX*2, bX=(w-bW)/2, bY=imgH-bH/2, bR=bFsz*0.25;
  ctx.fillStyle=BRAND.color;
  ctx.beginPath(); ctx.moveTo(bX+bR,bY); ctx.lineTo(bX+bW-bR,bY);
  ctx.quadraticCurveTo(bX+bW,bY,bX+bW,bY+bR); ctx.lineTo(bX+bW,bY+bH-bR);
  ctx.quadraticCurveTo(bX+bW,bY+bH,bX+bW-bR,bY+bH); ctx.lineTo(bX+bR,bY+bH);
  ctx.quadraticCurveTo(bX,bY+bH,bX,bY+bH-bR); ctx.lineTo(bX,bY+bR);
  ctx.quadraticCurveTo(bX,bY,bX+bR,bY); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(bt, w/2, bY+bH/2);

  ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,imgH,w,textAreaH);
  ctx.fillStyle=BRAND.color; ctx.fillRect(0,imgH,barW,textAreaH);
  ctx.fillStyle="#fff"; ctx.font=`700 ${fontSize}px 'Segoe UI',sans-serif`;
  ctx.textAlign="left"; ctx.textBaseline="top";
  const maxW=w-barW-pad*2, lineH=fontSize*1.3, words=title.split(" ");
  const lines=[]; let cur="";
  for (const word of words) {
    const test=cur?`${cur} ${word}`:word;
    if(ctx.measureText(test).width>maxW){if(cur)lines.push(cur);cur=word;}else cur=test;
  }
  if(cur)lines.push(cur);
  const tH=lines.length*lineH, tY=imgH+(textAreaH-tH)/2;
  lines.forEach((line,i)=>ctx.fillText(line,barW+pad,tY+i*lineH));

  const boty=imgH+textAreaH;
  ctx.fillStyle=BRAND.color; ctx.fillRect(0,boty,w,bottomH);
  ctx.font=`700 ${Math.floor(bottomH*0.42)}px 'Segoe UI',sans-serif`;
  ctx.fillStyle="#fff"; ctx.textAlign="left"; ctx.textBaseline="middle";
  ctx.fillText(BRAND.name,pad,boty+bottomH/2);
  ctx.font=`400 ${Math.floor(bottomH*0.32)}px 'Segoe UI',sans-serif`;
  ctx.fillStyle="rgba(255,255,255,0.85)"; ctx.textAlign="right";
  ctx.fillText(BRAND.url,w-pad,boty+bottomH/2);

  const logo=await loadImg(BRAND.logoPath);
  if(logo){const lH=Math.floor(h*0.055),lW=Math.floor((logo.naturalWidth/logo.naturalHeight)*lH);ctx.drawImage(logo,barW+pad,imgH+Math.floor(pad*0.5),lW,lH);}

  return canvas.toDataURL("image/png");
}

// ─────────────────────────────────────────────────────────
//  Copy to clipboard
// ─────────────────────────────────────────────────────────
async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const el=document.createElement("textarea"); el.value=text;
    document.body.appendChild(el); el.select(); document.execCommand("copy");
    document.body.removeChild(el);
  }
}

// ─────────────────────────────────────────────────────────
//  All platforms config
// ─────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id:"facebook", name:"Facebook", color:"#1877F2", textColor:"#fff",
    hint:"Caption copied — paste into your Facebook post",
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    getUrl:(u)=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    id:"instagram", name:"Instagram", color:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", textColor:"#fff",
    hint:"Caption + link copied — open Instagram & paste",
    copyExtra:true,
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    getUrl:()=>"https://www.instagram.com/",
  },
  {
    id:"twitter", name:"Twitter / X", color:"#000", textColor:"#fff",
    hint:"Caption copied — opens tweet composer",
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    getUrl:(u,c)=>`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(c.slice(0,200))}`,
  },
  {
    id:"whatsapp", name:"WhatsApp", color:"#25D366", textColor:"#fff",
    hint:"Opens WhatsApp with caption + link pre-filled",
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    getUrl:(u,c)=>`https://wa.me/?text=${encodeURIComponent(c.slice(0,300)+"\n\n"+u)}`,
  },
  {
    id:"linkedin", name:"LinkedIn", color:"#0A66C2", textColor:"#fff",
    hint:"Caption copied — paste into your LinkedIn post",
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    getUrl:(u)=>`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    id:"telegram", name:"Telegram", color:"#26A5E4", textColor:"#fff",
    hint:"Caption copied — opens Telegram share",
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    getUrl:(u,c)=>`https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(c.slice(0,200))}`,
  },
  {
    id:"pinterest", name:"Pinterest", color:"#E60023", textColor:"#fff",
    hint:"Caption copied — use downloaded poster as image",
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
    getUrl:(u,c)=>`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u)}&description=${encodeURIComponent(c.slice(0,500))}`,
  },
  {
    id:"threads", name:"Threads", color:"#101010", textColor:"#fff",
    hint:"Caption copied — paste into Threads post",
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.848 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.397-.904l-.028-.002c-.8 0-2.04.202-2.951 1.2l-1.498-1.33C8.183 5.89 9.76 5.22 12.03 5.22h.073c3.417.065 5.47 2.026 5.568 5.397.033 1.15.023 2.29-.03 3.323-.041.806-.084 1.642-.084 2.457 0 1.08.198 2.168.626 3.092.79 1.71 2.342 2.693 4.5 2.706V24H12.186zm-.87-6.43c.765-.037 1.36-.307 1.772-.804.484-.584.742-1.48.766-2.664a12.083 12.083 0 0 0-2.55-.1c-.807.048-1.466.27-1.91.639-.386.32-.576.73-.544 1.163.04.707.477 1.267 1.233 1.579.38.157.793.213 1.233.187z"/></svg>,
    getUrl:()=>"https://www.threads.net/",
  },
];

// ─────────────────────────────────────────────────────────
//  ShareButton
// ─────────────────────────────────────────────────────────
function ShareButton({ platform, caption, firstComment, blogUrl }) {
  const [state, setState] = useState("idle"); // idle | copying | done

  const handleClick = async () => {
    setState("copying");
    const text = platform.copyExtra
      ? `${caption}\n\n${firstComment}`
      : caption;
    await copyToClipboard(text);
    setTimeout(() => {
      window.open(platform.getUrl(blogUrl, caption), "_blank");
      setState("done");
      setTimeout(() => setState("idle"), 3000);
    }, 200);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"10px 14px", width:"100%",
          background: state==="done" ? "rgba(74,222,128,0.12)" : platform.color,
          color: state==="done" ? "#4ade80" : platform.textColor,
          border: state==="done" ? "1px solid rgba(74,222,128,0.3)" : "none",
          borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600,
          opacity: state==="copying" ? 0.7 : 1,
          transition:"opacity 0.15s",
        }}
        onMouseEnter={e=>{ if(state==="idle") e.currentTarget.style.opacity="0.85"; }}
        onMouseLeave={e=>{ if(state==="idle") e.currentTarget.style.opacity="1"; }}
      >
        {state === "done"
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          : state === "copying"
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H10c-1.1 0-2 .9-2 2v4H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4 16H4V10h10v8zm4-6h-2v-2c0-1.1-.9-2-2-2h-2V4h6v8z"/></svg>
          : platform.icon}
        <span>
          {state === "done" ? "✓ Opened!" : state === "copying" ? "Copying..." : platform.name}
        </span>
      </button>
      {state === "done" && (
        <div style={{ fontSize:10, color:"#64748b", marginTop:3, paddingLeft:4 }}>
          {platform.hint}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────
export default function SocialAutoPost({ post }) {
  const [step,         setStep]        = useState("idle");
  const [posterB64,    setPosterB64]   = useState(null);
  const [caption,      setCaption]     = useState("");
  const [firstComment, setFirstComment]= useState("");
  const [badgeLabel,   setBadgeLabel]  = useState("New Blog");
  const [posterSize,   setPosterSize]  = useState("square");
  const [error,        setError]       = useState("");
  const [cpCaption,    setCpCaption]   = useState(false);
  const [cpComment,    setCpComment]   = useState(false);

  const blogUrl = `${BRAND.siteBase}/${post?.slug || ""}`;

  const handleGenerate = useCallback(async () => {
    if (!post?.title) return;
    setStep("generating"); setError(""); setPosterB64(null);
    try {
      const b64 = await generatePosterBase64({
        title: post.title, coverImageUrl: post.cover_image_url,
        badgeLabel, size: posterSize,
      });
      setPosterB64(b64);
      setCaption(generateCaption({ title: post.title, tags: post.tags || [] }));
      setFirstComment(`🔗 Read the full article here:\n${blogUrl}`);
      setStep("ready");
    } catch(e) { setError(e.message); setStep("error"); }
  }, [post, badgeLabel, posterSize, blogUrl]);

  const handleReset = () => {
    setStep("idle"); setPosterB64(null); setCaption(""); setFirstComment(""); setError("");
  };

  const S = {
    root:{ background:"#0f0f14", border:"1px solid rgba(108,63,232,0.2)", borderRadius:16, padding:24, color:"#e2e8f0", fontFamily:"'Segoe UI',sans-serif" },
    lbl:{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6, display:"block" },
    sel:{ width:"100%", background:"#1a1a24", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e2e8f0", padding:"8px 10px", fontSize:13, cursor:"pointer" },
    inp:{ width:"100%", background:"#1a1a24", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e2e8f0", padding:"8px 10px", fontSize:13, boxSizing:"border-box" },
    genBtn:{ width:"100%", background:"linear-gradient(135deg,#6C3FE8,#9333ea)", color:"#fff", border:"none", borderRadius:10, padding:"13px 0", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:20 },
    card:{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"14px 16px", marginBottom:14 },
    cardHd:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
    cardTtl:{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" },
    cpBtn:(ok)=>({ fontSize:11, fontWeight:700, border:`1px solid ${ok?"rgba(74,222,128,0.4)":"rgba(255,255,255,0.15)"}`, borderRadius:6, padding:"3px 10px", cursor:"pointer", background:"transparent", color:ok?"#4ade80":"#a78bfa" }),
    ta:{ width:"100%", background:"#1a1a24", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#e2e8f0", padding:"10px", fontSize:13, lineHeight:1.6, fontFamily:"'Segoe UI',sans-serif", resize:"vertical", boxSizing:"border-box" },
    regenBtn:{ fontSize:12, color:"#94a3b8", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 14px", cursor:"pointer", marginBottom:16 },
    err:{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:10, padding:"12px 14px", fontSize:13, color:"#f87171", marginBottom:14 },
    hint:{ fontSize:11, color:"#475569", marginTop:8, lineHeight:1.6 },
  };

  return (
    <div style={S.root}>

      {/* Header */}
      <div style={{ marginBottom:20, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:3 }}>📣 Social Media Post</div>
        <div style={{ fontSize:12, color:"#64748b" }}>Generate poster &amp; caption → copy &amp; share to all platforms</div>
        {post?.title && <div style={{ marginTop:8, fontSize:13, color:"#a78bfa", fontStyle:"italic" }}>"{post.title}"</div>}
      </div>

      {/* IDLE */}
      {step === "idle" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div>
              <span style={S.lbl}>Poster Size</span>
              <select style={S.sel} value={posterSize} onChange={e=>setPosterSize(e.target.value)}>
                <option value="square">Square 1:1 — Instagram</option>
                <option value="portrait">Portrait 4:5 — Feed</option>
                <option value="landscape">Landscape 16:9 — Facebook</option>
              </select>
            </div>
            <div>
              <span style={S.lbl}>Badge Label</span>
              <input style={S.inp} value={badgeLabel} onChange={e=>setBadgeLabel(e.target.value)} placeholder="New Blog"/>
            </div>
          </div>
          <button style={S.genBtn} onClick={handleGenerate} disabled={!post?.title}>
            ✨ Generate Poster + Caption
          </button>
        </>
      )}

      {/* GENERATING */}
      {step === "generating" && (
        <div style={{ textAlign:"center", padding:"36px 0", color:"#a78bfa" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🎨</div>
          <div style={{ fontSize:14, fontWeight:600 }}>Generating your poster...</div>
        </div>
      )}

      {/* ERROR */}
      {step === "error" && (
        <><div style={S.err}>⚠️ {error}</div><button style={S.regenBtn} onClick={handleReset}>↩ Try again</button></>
      )}

      {/* READY */}
      {step === "ready" && (
        <>
          <button style={S.regenBtn} onClick={handleReset}>🔄 Re-generate</button>

          {/* Poster */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginBottom:20 }}>
            <img src={posterB64} alt="poster" style={{ maxWidth:"100%", maxHeight:320, borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", objectFit:"contain" }}/>
            <a href={posterB64} download={`poster-${post?.slug||"post"}.png`}
              style={{ fontSize:12, color:"#a78bfa", textDecoration:"none", border:"1px solid rgba(108,63,232,0.3)", borderRadius:6, padding:"5px 14px", background:"rgba(108,63,232,0.08)" }}>
              ⬇ Download Poster
            </a>
          </div>

          {/* Caption */}
          <div style={S.card}>
            <div style={S.cardHd}>
              <span style={S.cardTtl}>📝 Caption</span>
              <button style={S.cpBtn(cpCaption)} onClick={async()=>{ await copyToClipboard(caption); setCpCaption(true); setTimeout(()=>setCpCaption(false),2000); }}>
                {cpCaption?"✅ Copied!":"📋 Copy"}
              </button>
            </div>
            <textarea style={{ ...S.ta, minHeight:160 }} value={caption} onChange={e=>setCaption(e.target.value)}/>
          </div>

          {/* First comment */}
          <div style={S.card}>
            <div style={S.cardHd}>
              <span style={S.cardTtl}>💬 First Comment (Blog Link)</span>
              <button style={S.cpBtn(cpComment)} onClick={async()=>{ await copyToClipboard(firstComment); setCpComment(true); setTimeout(()=>setCpComment(false),2000); }}>
                {cpComment?"✅ Copied!":"📋 Copy"}
              </button>
            </div>
            <textarea style={{ ...S.ta, minHeight:76 }} value={firstComment} onChange={e=>setFirstComment(e.target.value)}/>
            <div style={S.hint}>After posting, paste this as the first comment to share your blog link.</div>
          </div>

          {/* Share buttons */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>
              🚀 Share To Platform
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {PLATFORMS.map(p => (
                <ShareButton key={p.id} platform={p} caption={caption} firstComment={firstComment} blogUrl={blogUrl}/>
              ))}
            </div>
            <div style={{ ...S.hint, marginTop:12, background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"10px 12px" }}>
              <strong style={{ color:"#94a3b8" }}>How it works:</strong> Each button copies your caption to clipboard then opens the platform. Just paste &amp; post!
              For <strong>Instagram &amp; Threads</strong> — download the poster first, then attach it manually.
            </div>
          </div>
        </>
      )}
    </div>
  );
}