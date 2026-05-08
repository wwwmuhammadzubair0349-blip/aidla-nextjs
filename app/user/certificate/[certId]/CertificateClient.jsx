"use client";
// app/user/certificate/[certId]/page.jsx  →  use as CertificateClient.jsx
// Converted from React Router Certificate.jsx
//
// Changes:
//   1. "use client" directive
//   2. import { useParams, Link } from "react-router-dom"
//      → import { useParams } from "next/navigation"; import Link from "next/link"
//   3. All other logic, CSS, sub-components 100% identical

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const C = {
  blue:'#0056D2',blueDark:'#003A8C',ink:'#1A1A2E',slate:'#475569',muted:'#94A3B8',
  border:'#E8EDF5',bg:'#F7F9FC',white:'#FFFFFF',amber:'#F5A623',success:'#12B76A',
};

const SEAL_SVG = `
<svg viewBox="0 0 90 90" width="90" height="90" xmlns="http://www.w3.org/2000/svg" style="display:block;">
  <defs><radialGradient id="sg" cx="38%" cy="36%" r="65%"><stop offset="0%" stop-color="#FFD85C"/><stop offset="55%" stop-color="#F5A623"/><stop offset="100%" stop-color="#D4860A"/></radialGradient></defs>
  <circle cx="45" cy="46" r="43" fill="rgba(0,0,0,0.08)"/>
  <circle cx="45" cy="45" r="43" fill="url(#sg)"/>
  <circle cx="45" cy="45" r="43" fill="none" stroke="white" stroke-width="3" opacity="0.85"/>
  <circle cx="45" cy="45" r="40" fill="none" stroke="#D4860A" stroke-width="1"/>
  <circle cx="45" cy="45" r="33" fill="none" stroke="#78350F" stroke-width="1" stroke-dasharray="3 2.5" opacity="0.4"/>
  <text x="45" y="37" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="900" fill="#78350F" letter-spacing="1.5">AIDLA</text>
  <text x="45" y="50" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="#78350F">&#10003;</text>
  <text x="45" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" font-weight="900" fill="#78350F" letter-spacing="2">CERT</text>
  <circle cx="45" cy="4" r="2.2" fill="#D4860A"/>
  <circle cx="45" cy="86" r="2.2" fill="#D4860A"/>
  <circle cx="4" cy="45" r="2.2" fill="#D4860A"/>
  <circle cx="86" cy="45" r="2.2" fill="#D4860A"/>
</svg>`;

function buildCertHTML({ studentName, courseTitle, courseLevel, courseCategory, issued, certNumber, verifyUrl }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verifyUrl)}&bgcolor=FFFEF9&color=003A8C&margin=4`;
  return `
<div style="width:100%;height:100%;background:#FFFEF9;position:relative;overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;">
  <div style="position:absolute;inset:0;z-index:0;opacity:0.06;display:flex;flex-wrap:wrap;align-content:flex-start;overflow:hidden;transform:rotate(-30deg) scale(1.6);transform-origin:center center;">
    ${Array(80).fill('<span style="font-weight:900;font-size:28px;color:#003A8C;letter-spacing:4px;padding:18px 22px;white-space:nowrap;display:inline-block;">AIDLA</span>').join('')}
  </div>
  <div style="position:absolute;inset:0;border:28px solid #003A8C;pointer-events:none;z-index:1;"></div>
  <div style="position:absolute;inset:32px;border:1.5px solid #F5A623;pointer-events:none;z-index:1;"></div>
  <div style="position:absolute;top:40px;left:40px;width:56px;height:56px;border-top:2.5px solid #F5A623;border-left:2.5px solid #F5A623;z-index:2;"></div>
  <div style="position:absolute;top:40px;right:40px;width:56px;height:56px;border-top:2.5px solid #F5A623;border-right:2.5px solid #F5A623;z-index:2;"></div>
  <div style="position:absolute;bottom:40px;left:40px;width:56px;height:56px;border-bottom:2.5px solid #F5A623;border-left:2.5px solid #F5A623;z-index:2;"></div>
  <div style="position:absolute;bottom:40px;right:40px;width:56px;height:56px;border-bottom:2.5px solid #F5A623;border-right:2.5px solid #F5A623;z-index:2;"></div>
  <div style="position:absolute;top:52px;left:56px;z-index:4;">
    <div style="width:82px;height:82px;border-radius:50%;background:white;border:2.5px solid #F5A623;box-shadow:0 0 0 4px rgba(245,166,35,0.18),0 4px 14px rgba(0,58,140,0.14);display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <img src="/logo.png" alt="AIDLA" style="width:64px;height:64px;object-fit:contain;display:block;">
    </div>
  </div>
  <div style="position:absolute;top:52px;left:0;right:0;display:flex;flex-direction:column;align-items:center;z-index:4;">
    <div style="font-weight:900;font-size:28px;letter-spacing:6px;color:#003A8C;text-transform:uppercase;line-height:1.1;margin-bottom:4px;">AIDLA</div>
    <div style="font-size:9px;color:#94A3B8;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-align:center;">Artificial Intelligence Digital Learning Academy</div>
  </div>
  <div style="position:relative;z-index:3;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:130px 130px 96px;">
    <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:#94A3B8;margin-bottom:10px;">Certificate of Completion</div>
    <div style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:54px;color:#003A8C;line-height:1;margin-bottom:20px;">Verified Achievement</div>
    <div style="display:flex;align-items:center;gap:14px;width:100%;max-width:300px;margin-bottom:18px;"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#F5A623,transparent);"></div><div style="width:8px;height:8px;background:#F5A623;transform:rotate(45deg);flex-shrink:0;"></div><div style="flex:1;height:1px;background:linear-gradient(90deg,#F5A623,transparent);"></div></div>
    <div style="font-size:13px;color:#475569;margin-bottom:10px;">This is to proudly certify that</div>
    <div style="font-family:'Instrument Serif',Georgia,serif;font-size:44px;color:#1A1A2E;line-height:1.1;border-bottom:1.5px solid #E8EDF5;padding-bottom:12px;margin-bottom:12px;min-width:50%;">${studentName}</div>
    <div style="font-size:10px;color:#94A3B8;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">has successfully completed all requirements for</div>
    <div style="font-family:'Instrument Serif',Georgia,serif;font-size:24px;color:#0056D2;line-height:1.3;margin-bottom:${courseLevel||courseCategory?'12px':'24px'};">${courseTitle}</div>
    ${courseLevel||courseCategory?`<div style="display:flex;align-items:center;gap:10px;font-size:9px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:22px;">${courseLevel?`<span>${courseLevel}</span>`:''}${courseLevel&&courseCategory?'<div style="width:3px;height:3px;border-radius:50%;background:#E8EDF5;"></div>':''}${courseCategory?`<span>${courseCategory}</span>`:''}</div>`:''}
    <div style="display:flex;align-items:flex-end;justify-content:space-between;width:100%;gap:20px;margin-top:auto;">
      <div style="display:flex;flex-direction:column;align-items:center;flex:1;"><div style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:22px;color:#003A8C;border-bottom:1.5px solid #CBD5E1;padding-bottom:4px;min-width:160px;text-align:center;margin-bottom:5px;">AIDLA Director</div><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94A3B8;">Program Director</div></div>
      <div style="width:90px;height:90px;flex-shrink:0;">${SEAL_SVG}</div>
      <div style="display:flex;flex-direction:column;align-items:center;flex:1;"><div style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:22px;color:#003A8C;border-bottom:1.5px solid #CBD5E1;padding-bottom:4px;min-width:160px;text-align:center;margin-bottom:5px;">${issued}</div><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94A3B8;">Date of Issue</div></div>
    </div>
  </div>
  <div style="position:absolute;bottom:52px;right:76px;z-index:4;display:flex;flex-direction:column;align-items:center;gap:5px;"><img src="${qrUrl}" width="86" height="86" alt="QR" style="border-radius:4px;display:block;"><div style="font-size:7px;color:#94A3B8;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Scan to verify</div></div>
  <div style="position:absolute;bottom:52px;left:76px;font-size:8px;color:#94A3B8;font-family:monospace;line-height:1.9;z-index:3;">Certificate No: ${certNumber}<br>Verify: ${verifyUrl}</div>
</div>`;
}

function buildCaption({ studentName, courseTitle, verifyUrl, platform }) {
  if (platform==='twitter') return `🎉 Just earned my verified certificate in "${courseTitle}" from @AIDLA! 🏆🚀\n\nSo proud of this milestone!\n${verifyUrl}\n\n#AIDLA #AI #Certificate #Achievement`;
  if (platform==='whatsapp') return `🎉 I just earned a verified certificate in *"${courseTitle}"* from *AIDLA*! 🏆\n\nVerify it here: ${verifyUrl}`;
  const pool=[
    `🎉 Thrilled to share that I've officially completed "${courseTitle}" at AIDLA! 🚀\n\n🔗 Verify: ${verifyUrl}\n\n#AIDLA #AILearning #CertificateOfCompletion`,
    `🏆 Big milestone unlocked! I just completed "${courseTitle}" on AIDLA and earned my verified certificate! 🎓✨\n\n🔗 Verify: ${verifyUrl}\n\n#AIDLA #AI #Achievement`,
    `📜 Excited to announce I've earned my certificate in "${courseTitle}" from AIDLA! 🌟\n\n✅ Verify: ${verifyUrl}\n\n#AIDLA #AIEducation #CertifiedProfessional`,
  ];
  return pool[studentName.charCodeAt(0)%pool.length];
}

let h2cP=null;
function loadH2C() {
  if(!h2cP) h2cP=new Promise((res,rej)=>{ if(window.html2canvas)return res(window.html2canvas); const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.onload=()=>res(window.html2canvas); s.onerror=rej; document.head.appendChild(s); });
  return h2cP;
}
let pdfP=null;
function loadPDF() {
  if(!pdfP) pdfP=new Promise((res,rej)=>{ if(window.jspdf)return res(window.jspdf.jsPDF); const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload=()=>res(window.jspdf.jsPDF); s.onerror=rej; document.head.appendChild(s); });
  return pdfP;
}
async function renderCertToCanvas(certHTML) {
  const h2c=await loadH2C(); const el=document.createElement('div');
  el.style.cssText='position:fixed;left:-9999px;top:-9999px;width:980px;height:693px;overflow:hidden;background:#FFFEF9;';
  el.innerHTML=certHTML; document.body.appendChild(el);
  const imgs=el.querySelectorAll('img');
  await Promise.all(Array.from(imgs).map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r;})));
  await new Promise(r=>setTimeout(r,350));
  const canvas=await h2c(el,{width:980,height:693,scale:2,useCORS:true,allowTaint:true,backgroundColor:'#FFFEF9',logging:false});
  document.body.removeChild(el); return canvas;
}
async function trackShare(certId, platform) {
  try{ await supabase.from('cert_share_events').insert({certificate_id:certId,platform,shared_at:new Date().toISOString()}); }catch(_){}
}

const PLATFORMS = [
  { id:'linkedin',  label:'LinkedIn',    bg:'#0077B5', color:'#fff', icon:<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { id:'twitter',   label:'Twitter / X', bg:'#000',    color:'#fff', icon:<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg> },
  { id:'whatsapp',  label:'WhatsApp',    bg:'#25D366', color:'#fff', icon:<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
  { id:'facebook',  label:'Facebook',    bg:'#1877F2', color:'#fff', icon:<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { id:'instagram', label:'Instagram',   bg:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color:'#fff', icon:<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
];

function ShareModal({ cert, verifyUrl, certHTML, onClose }) {
  const [caption, setCaption]  = useState('');
  const [active, setActive]    = useState('linkedin');
  const [img, setImg]          = useState(null);
  const [rendering, setRender] = useState(false);
  const [status, setStatus]    = useState({});
  useEffect(() => { setCaption(buildCaption({ studentName:cert.student_name, courseTitle:cert.course_title, verifyUrl, platform:active })); }, [active]);
  useEffect(() => { (async()=>{ setRender(true); try{ const c=await renderCertToCanvas(certHTML); setImg(c.toDataURL('image/png')); }catch(e){ console.error(e); } setRender(false); })(); }, []);
  const copyCaption = () => navigator.clipboard.writeText(caption);
  const doShare = async (pid) => {
    setStatus(s=>({...s,[pid]:'loading'}));
    await trackShare(cert.id, pid);
    const eu=encodeURIComponent(verifyUrl); const ec=encodeURIComponent(caption);
    const dl=()=>{ if(img){ const a=document.createElement('a'); a.href=img; a.download=`AIDLA-Certificate-${cert.certificate_number}.png`; a.click(); }};
    if(pid==='linkedin')  { dl(); await new Promise(r=>setTimeout(r,700)); copyCaption(); window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${eu}`,'_blank'); }
    else if(pid==='twitter')  { window.open(`https://twitter.com/intent/tweet?text=${ec}`,'_blank'); }
    else if(pid==='whatsapp') { window.open(`https://wa.me/?text=${ec}`,'_blank'); }
    else if(pid==='facebook') { window.open(`https://www.facebook.com/sharer/sharer.php?u=${eu}&quote=${ec}`,'_blank'); }
    else if(pid==='instagram'){ dl(); copyCaption(); window.open('https://www.instagram.com/','_blank'); }
    setStatus(s=>({...s,[pid]:'done'})); setTimeout(()=>setStatus(s=>({...s,[pid]:undefined})), 3000);
  };
  const p=PLATFORMS.find(pl=>pl.id===active); const st=status[active];
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(26,26,46,0.72)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:C.white,borderRadius:18,width:'100%',maxWidth:600,boxShadow:'0 28px 72px rgba(0,0,0,0.22)',overflow:'hidden',maxHeight:'92vh',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'20px 24px 16px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div><div style={{ fontWeight:800,fontSize:17,color:C.ink }}>🎉 Share Your Achievement</div><div style={{ fontSize:12,color:C.muted,marginTop:2 }}>Certificate image auto-downloads for image-based platforms</div></div>
          <button onClick={onClose} style={{ background:C.bg,border:'none',borderRadius:8,width:34,height:34,cursor:'pointer',fontSize:18,color:C.slate }}>×</button>
        </div>
        <div style={{ padding:'20px 24px',overflowY:'auto',flex:1 }}>
          <div style={{ width:'100%',height:148,borderRadius:10,overflow:'hidden',marginBottom:18,border:`1px solid ${C.border}`,background:'#FFFEF9',display:'flex',alignItems:'center',justifyContent:'center',position:'relative' }}>
            {rendering?<div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8 }}><div style={{ width:24,height:24,border:`3px solid ${C.border}`,borderTopColor:C.blue,borderRadius:'50%',animation:'spin .8s linear infinite' }}/><div style={{ fontSize:11,color:C.muted }}>Rendering certificate…</div></div>
              :img?<img src={img} alt="preview" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
              :<div style={{ fontSize:12,color:C.muted }}>Preview unavailable</div>}
            {img&&<div style={{ position:'absolute',top:6,right:6,background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:9,fontWeight:700,borderRadius:4,padding:'2px 7px',textTransform:'uppercase',letterSpacing:1 }}>PNG ready</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:8 }}>Select platform</div>
            <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
              {PLATFORMS.map(pl=>(
                <button key={pl.id} onClick={()=>setActive(pl.id)} style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'none',cursor:'pointer',fontSize:11.5,fontWeight:700,background:active===pl.id?pl.bg:C.bg,backgroundImage:active===pl.id&&pl.bg.includes('gradient')?pl.bg:undefined,color:active===pl.id?pl.color:C.slate,outline:active===pl.id?`2px solid ${C.blue}`:'none',outlineOffset:2 }}>{pl.icon} {pl.label}</button>
              ))}
            </div>
          </div>
          {(active==='linkedin'||active==='instagram')&&<div style={{ background:active==='linkedin'?'#EFF6FF':'#FDF4FF',border:`1px solid ${active==='linkedin'?'#BFDBFE':'#E9D5FF'}`,borderRadius:8,padding:'9px 13px',marginBottom:14,fontSize:11.5,color:active==='linkedin'?'#1E40AF':'#6B21A8',lineHeight:1.6 }}><strong>How it works:</strong> {active==='linkedin'?'PNG downloads + caption copied. LinkedIn will open — paste caption and attach the image. 🎯':'PNG downloads + caption copied. Instagram will open — create a post and paste. 📸'}</div>}
          <div style={{ marginBottom:18 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7 }}>
              <div style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:1 }}>Caption (editable)</div>
              <button onClick={copyCaption} style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,padding:'3px 9px',fontSize:11,fontWeight:700,cursor:'pointer',color:C.slate }}>Copy</button>
            </div>
            <textarea value={caption} onChange={e=>setCaption(e.target.value)} rows={6} style={{ width:'100%',border:`1.5px solid ${C.border}`,borderRadius:9,padding:'11px 13px',fontSize:12.5,lineHeight:1.65,color:C.ink,resize:'vertical',fontFamily:'inherit',background:C.bg,outline:'none' }}/>
          </div>
          <button onClick={()=>doShare(active)} disabled={rendering} style={{ width:'100%',padding:'12px 20px',borderRadius:9,border:'none',cursor:rendering?'not-allowed':'pointer',fontWeight:800,fontSize:13.5,background:st==='done'?C.success:p.bg,backgroundImage:st!=='done'&&p.bg.includes('gradient')?p.bg:undefined,color:'#fff',boxShadow:'0 4px 14px rgba(0,0,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:rendering?0.6:1 }}>
            {st==='loading'?<><div style={{ width:15,height:15,border:'2.5px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .8s linear infinite' }}/> Preparing…</>
              :st==='done'?<>&#10003; Shared on {p.label}!</>
              :<>{p.icon} Share on {p.label}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CertificateClient() {
  const params              = useParams();
  const certId              = params.certId;
  const [cert, setCert]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShare, setShare] = useState(false);
  const [exporting, setExport] = useState(null);
  const wrapRef             = useRef(null);
  const [scale, setScale]   = useState(1);

  useEffect(() => { load(); }, [certId]);
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(entries => { for (let e of entries) setScale(e.contentRect.width/980); });
    obs.observe(wrapRef.current); return () => obs.disconnect();
  }, [cert]);

  const load = async () => {
    try {
      const { data, error } = await supabase.from('course_certificates').select('*').eq('id',certId).single();
      if (error||!data) throw new Error('Certificate not found or has been revoked.');
      const { data:course }  = await supabase.from('course_courses').select('title,level,category').eq('id',data.course_id).single();
      const { data:profile } = await supabase.from('users_profiles').select('full_name').eq('user_id',data.user_id).single();
      let name = profile?.full_name||'';
      if (!name) { const { data:{ session } } = await supabase.auth.getSession(); name=session?.user?.user_metadata?.full_name||session?.user?.email?.split('@')[0]||'A Dedicated Learner'; }
      setCert({ ...data, course_title:course?.title||'—', course_level:course?.level||'', course_category:course?.category||'', student_name:name });
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14,fontFamily:'system-ui',background:C.bg }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={{ width:38,height:38,border:`3px solid ${C.border}`,borderTopColor:C.blue,borderRadius:'50%',animation:'spin .8s linear infinite' }}/>
      <p style={{ color:C.muted,fontWeight:600,fontSize:14 }}>Verifying certificate…</p>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,fontFamily:'system-ui',background:C.bg }}>
      <div style={{ fontSize:48 }}>❌</div>
      <h2 style={{ color:'#B91C1C' }}>Invalid Certificate</h2>
      <p style={{ color:C.muted }}>{error}</p>
      <Link href="/user/courses" style={{ background:C.blue,color:C.white,padding:'10px 22px',borderRadius:8,textDecoration:'none',fontWeight:700 }}>← Back to Courses</Link>
    </div>
  );

  const issued    = new Date(cert.issued_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const verifyUrl = typeof window!=='undefined'?`${window.location.origin}/verify/${cert.id}`:`/verify/${cert.id}`;
  const certHTML  = buildCertHTML({ studentName:cert.student_name, courseTitle:cert.course_title, courseLevel:cert.course_level, courseCategory:cert.course_category, issued, certNumber:cert.certificate_number, verifyUrl });

  const copyLink  = () => { navigator.clipboard.writeText(verifyUrl); setCopied(true); setTimeout(()=>setCopied(false),2500); };
  const downloadPNG = async () => { if(!cert) return; setExport('png'); try{ const c=await renderCertToCanvas(certHTML); const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download=`AIDLA-Certificate-${cert.certificate_number}.png`; a.click(); }catch(e){ alert('PNG export failed.'); } setExport(null); };
  const downloadPDF = async () => { if(!cert) return; setExport('pdf'); try{ const [canvas,jsPDF]=await Promise.all([renderCertToCanvas(certHTML),loadPDF()]); const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'}); pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,297,210); pdf.save(`AIDLA-Certificate-${cert.certificate_number}.pdf`); }catch(e){ alert('PDF export failed.'); } setExport(null); };
  const printCert = () => { if(!cert) return; const win=window.open('','_blank'); win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>AIDLA Certificate</title><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"><style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box;margin:0;padding:0}html,body{width:100vw;height:100vh;background:#FFFEF9;overflow:hidden;display:flex;align-items:center;justify-content:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}#pw{width:980px;height:693px;transform-origin:center;transform:scale(min(calc(100vw/980),calc(100vh/693)))}</style></head><body onload="setTimeout(()=>{window.print();window.close()},500)"><div id="pw">${buildCertHTML({studentName:cert.student_name,courseTitle:cert.course_title,courseLevel:cert.course_level,courseCategory:cert.course_category,issued,certNumber:cert.certificate_number,verifyUrl})}</div></body></html>`); win.document.close(); };
  const Spin = () => <div style={{ width:10,height:10,border:`2px solid ${C.border}`,borderTopColor:C.blue,borderRadius:'50%',animation:'spin .7s linear infinite',flexShrink:0 }}/>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:${C.bg};}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cert-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:20px 16px 40px;animation:fadeIn .5s ease;}
        .toolbar{width:100%;max-width:980px;background:${C.white};border:1px solid ${C.border};border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.05);padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:8px;overflow:hidden;}
        .tb-el{display:inline-flex;align-items:center;justify-content:center;gap:5px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;cursor:pointer;transition:all .13s;border:none;white-space:nowrap;text-decoration:none;}
        .tb-back{padding:7px 13px;border-radius:7px;font-size:11.5px;border:1.5px solid ${C.blue}!important;background:${C.white};color:${C.blue};flex-shrink:0;}
        .tb-back:hover{background:#EFF6FF;}
        .tb-div{width:1px;height:20px;background:${C.border};flex-shrink:0;}
        .btn-group{display:flex;gap:2px;align-items:center;background:${C.bg};border:1px solid ${C.border};border-radius:7px;padding:3px;flex-shrink:0;}
        .tb-exp{padding:5px 9px;border-radius:5px;font-size:11px;font-weight:700;background:transparent;color:${C.slate};font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:4px;cursor:pointer;border:none;white-space:nowrap;transition:background .12s;}
        .tb-exp:hover{background:${C.white};}
        .tb-exp:disabled{opacity:.45;cursor:not-allowed;}
        .tb-copy{padding:7px 13px;border-radius:7px;font-size:11.5px;border:1.5px solid ${C.border}!important;background:${C.white};color:${C.slate};flex-shrink:0;}
        .tb-copy:hover{border-color:${C.blue}!important;color:${C.blue};}
        .tb-copy-done{background:${C.success}!important;color:#fff!important;border-color:${C.success}!important;}
        .tb-share{margin-left:auto;flex-shrink:0;padding:7px 16px;border-radius:8px;font-size:11.5px;background:${C.blue};color:#fff;box-shadow:0 3px 10px rgba(0,86,210,.22);}
        .tb-share:hover{background:${C.blueDark};}
        @media(max-width:560px){
          .cert-page{padding:12px 10px 28px;}
          .toolbar{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:10px;}
          .tb-back{grid-column:1;grid-row:1;width:100%;font-size:10.5px;padding:8px 4px;}
          .btn-group{grid-column:2;grid-row:1;width:100%;justify-content:space-evenly;}
          .tb-exp{flex:1;font-size:9.5px;padding:5px 2px;}
          .tb-copy{grid-column:1;grid-row:2;width:100%;font-size:10.5px;padding:8px 4px;}
          .tb-share{grid-column:2;grid-row:2;width:100%;margin-left:0;font-size:10.5px;padding:8px 4px;}
          .tb-div{display:none;}
        }
        .cert-wrap{width:100%;max-width:980px;aspect-ratio:980/693;border-radius:3px;box-shadow:0 18px 52px rgba(26,26,46,.12),0 0 0 1px rgba(0,0,0,.04);overflow:hidden;background:#FFFEF9;position:relative;}
        .cert-scaler{width:980px;height:693px;position:absolute;top:0;left:0;transform-origin:top left;}
        .info-strip{background:${C.white};border-radius:10px;margin-top:12px;padding:12px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,.04);border:1px solid ${C.border};max-width:980px;width:100%;}
        @media(max-width:440px){.info-strip{flex-direction:column;align-items:flex-start;gap:4px;}.info-right{margin-left:0!important;text-align:left!important;}}
      `}</style>

      <div className="cert-page">
        <div className="toolbar">
          {/* ← Link from next/link replaces Link from react-router-dom */}
          <Link href="/user/courses" className="tb-el tb-back">← Dashboard</Link>
          <div className="tb-div"/>
          <div className="btn-group">
            <button className="tb-exp" onClick={downloadPNG} disabled={!!exporting}>{exporting==='png'?<><Spin/> PNG…</>:'⬇ PNG'}</button>
            <button className="tb-exp" onClick={downloadPDF} disabled={!!exporting}>{exporting==='pdf'?<><Spin/> PDF…</>:'⬇ PDF'}</button>
            <button className="tb-exp" onClick={printCert}>🖨 Print</button>
          </div>
          <button className={`tb-el tb-copy${copied?' tb-copy-done':''}`} onClick={copyLink}>{copied?'✓ Copied!':'🔗 Copy Link'}</button>
          <button className="tb-el tb-share" onClick={()=>setShare(true)}>🚀 Share Certificate</button>
        </div>

        <div className="cert-wrap" ref={wrapRef}>
          <div className="cert-scaler" style={{ transform:`scale(${scale})` }} dangerouslySetInnerHTML={{ __html:certHTML }}/>
        </div>

        <div className="info-strip">
          <div>
            <div style={{ fontWeight:700,fontSize:13,color:C.ink }}>🏆 {cert.student_name}</div>
            <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{cert.course_title}</div>
          </div>
          <div className="info-right" style={{ fontSize:11,color:C.muted,marginLeft:'auto',textAlign:'right' }}>
            Issued {issued}<br/>
            <span style={{ fontFamily:'monospace',fontSize:10 }}>№ {cert.certificate_number}</span>
          </div>
        </div>
      </div>

      {showShare&&<ShareModal cert={cert} verifyUrl={verifyUrl} certHTML={certHTML} onClose={()=>setShare(false)}/>}
    </>
  );
}