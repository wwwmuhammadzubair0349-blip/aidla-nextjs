"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserCampaignPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [tickerWinners, setTickerWinners] = useState([]);
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [images, setImages] = useState([]);
  const [captions, setCaptions] = useState({});

  // Submission Flow State
  const [step, setStep] = useState(1);
  const [subPlatform, setSubPlatform] = useState("");
  const [subFormat, setSubFormat] = useState("");
  const [subPayMethod, setSubPayMethod] = useState("");
  const [subAccNumber, setSubAccNumber] = useState("");
  const [subAccName, setSubAccName] = useState("");
  const [subLink, setSubLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const PLATFORMS = ["TikTok", "Facebook", "Instagram", "YouTube", "Snapchat", "LinkedIn", "Twitter", "WhatsApp", "Pinterest", "Telegram"];
  const FORMATS = [{ id: "video", label: "Video 🎥" }, { id: "image", label: "Image 🖼️" }, { id: "text", label: "Text 📝" }];
  const PAY_METHODS = ["EasyPaisa", "JazzCash", "Bank Account"];
  const PREBUILT_NAMES = ["Asad", "Fatima", "Umar", "Ayesha", "Hassan", "Zara", "Ali", "Sana", "Bilal", "Maria", "Kamran", "Hira", "Tariq", "Nimra", "Faisal", "Amna", "Raheel", "Dua", "Waheed", "Mahnoor", "Imran", "Saba", "Danish", "Iqra", "Shoaib", "Laiba", "Adnan", "Maryam", "Zubair", "Noor"];

  useEffect(() => {
    loadData();
    const interval = setInterval(() => setCurrentTickerIdx((prev) => prev + 1), 4000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return window.location.href = "/login";
      const currentUser = session.user;
      setUser(currentUser);

      const { data: prof } = await supabase.from("users_profiles").select("full_name, email, my_refer_code, my_referals").eq("user_id", currentUser.id).single();
      setProfile(prof);

      const { data: sets } = await supabase.from("campaign_settings").select("*").order("created_at", { ascending: false }).limit(1).single();
      setSettings(sets);

      const { data: subs } = await supabase.from("campaign_submissions").select("*").eq("user_id", currentUser.id).order("submitted_at", { ascending: false });
      setMySubmissions(subs || []);

      const { data: imgs } = await supabase.from("campaign_images").select("*");
      setImages(imgs || []);

      const { data: caps } = await supabase.from("campaign_captions").select("*");
      const capMap = {};
      (caps || []).forEach(c => capMap[c.id] = c.caption_template);
      setCaptions(capMap);

      const { data: realWinners } = await supabase.from("campaign_winners").select("*").eq("show_on_ticker", true);
      const generated = Array.from({ length: 25 }).map(() => ({
        name: PREBUILT_NAMES[Math.floor(Math.random() * PREBUILT_NAMES.length)],
        prize: Math.floor(Math.random() * (10000 - 500 + 1)) + 500,
        platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)]
      }));
      
      const combined = [...generated, ...(realWinners || []).map(rw => ({ name: rw.name, prize: rw.prize_amount, platform: rw.platform }))].sort(() => Math.random() - 0.5);
      setTickerWinners(combined);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const getCaption = () => {
    const key = `${subPlatform}_${subFormat}`.toLowerCase();
    const tpl = captions[key] || `Join AIDLA today using my referral code: {refer_code} !`;
    return tpl.replace(/{refer_code}/g, profile?.my_refer_code || "N/A");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleSubmit = async () => {
    if (!subLink || !subAccNumber || !subAccName || !subPayMethod) return alert("Please fill all fields");
    setSubmitting(true);
    const { error } = await supabase.from("campaign_submissions").insert({
      user_id: user.id,
      platform: subPlatform,
      format: subFormat,
      post_link: subLink,
      payment_method: subPayMethod,
      account_number: subAccNumber,
      account_name: subAccName,
    });
    setSubmitting(false);
    if (error) alert(error.message);
    else {
      setSuccessMsg("Submission Successful!");
      setStep(1); setSubPlatform(""); setSubFormat(""); setSubLink("");
      loadData();
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  if (loading) return <div className="loading">Loading Campaign Data...</div>;

  const activeWinner = tickerWinners.length > 0 ? tickerWinners[currentTickerIdx % tickerWinners.length] : null;

  return (
    <div className="page-wrapper">
      <style>{CSS}</style>

      {activeWinner && (
        <div className="ticker-bar">
          <div className="ticker-content" key={currentTickerIdx}>
            🎉 <strong>{activeWinner.name}</strong> just won <strong>₨{activeWinner.prize}</strong> for sharing on {activeWinner.platform}!
          </div>
        </div>
      )}

      <div className="container">
        {settings && (
          <div className="banner card">
            <h1>{settings.title}</h1>
            <p>{settings.description}</p>
            <div className="prize-range">Prize Pool: ₨{settings.prize_min} - ₨{settings.prize_max} per post</div>
            {!settings.is_active && <div className="ended-badge">Campaign Ended</div>}
            {settings.end_date && settings.is_active && <div className="countdown">Ends: {new Date(settings.end_date).toLocaleDateString()}</div>}
          </div>
        )}

        {settings?.is_active && (
          <div className="card step-container">
            <h2>Submit Your Post</h2>
            
            {successMsg && <div className="success-msg">{successMsg}</div>}

            {step === 1 && (
              <div className="fade-in">
                <h3>Step 1: Choose Platform</h3>
                <div className="grid">
                  {PLATFORMS.map(p => (
                    <div key={p} className="btn-outline" onClick={() => { setSubPlatform(p); setStep(2); }}>{p}</div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="fade-in">
                <h3>Step 2: Post Format for {subPlatform}</h3>
                <div className="grid">
                  {FORMATS.map(f => (
                    <div key={f.id} className="btn-outline" onClick={() => { setSubFormat(f.id); setStep(3); }}>{f.label}</div>
                  ))}
                </div>
                <div className="btn-back" onClick={() => setStep(1)}>← Back</div>
              </div>
            )}

            {step === 3 && (
              <div className="fade-in">
                <h3>Step 3: Instructions & Content</h3>
                <div className="instructions-box">
                  <p><strong>Your Caption / Text:</strong></p>
                  <div className="caption-text">{getCaption()}</div>
                  <div className="btn" onClick={() => copyToClipboard(getCaption())}>Copy Caption</div>

                  {subFormat === "image" && (
                    <div className="image-assets">
                      <p><strong>Available Images:</strong></p>
                      <div className="img-grid">
                        {images.filter(img => img.platform.toLowerCase() === subPlatform.toLowerCase()).map(img => (
                          <div key={img.id} className="img-card">
                            <img src={img.image_url} alt={img.title} />
                            <a href={img.image_url} download className="btn-small" target="_blank">Download</a>
                          </div>
                        ))}
                      </div>
                      <p>Or use your own creative image!</p>
                    </div>
                  )}

                  {subFormat === "video" && (
                    <div className="video-instructions">
                      <p>1. Record a short video talking about how AIDLA helps students.</p>
                      <p>2. Show your screen using AIDLA if possible.</p>
                      <p>3. Mention your referral code clearly.</p>
                      <p>4. Post on {subPlatform} and copy the link.</p>
                    </div>
                  )}
                </div>
                <div className="actions">
                  <div className="btn-back" onClick={() => setStep(2)}>← Back</div>
                  <div className="btn" onClick={() => setStep(4)}>Next: Payment Details →</div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="fade-in">
                <h3>Step 4: Payment Details</h3>
                <p className="hint">Where should we send your prize?</p>
                <div className="grid">
                  {PAY_METHODS.map(pm => (
                    <div key={pm} className={`btn-outline ${subPayMethod === pm ? 'active' : ''}`} onClick={() => setSubPayMethod(pm)}>{pm}</div>
                  ))}
                </div>
                {subPayMethod && (
                  <div className="input-group">
                    <input className="input" placeholder="Account Number" value={subAccNumber} onChange={e => setSubAccNumber(e.target.value)} />
                    <input className="input" placeholder="Account Title/Name" value={subAccName} onChange={e => setSubAccName(e.target.value)} />
                  </div>
                )}
                <div className="actions">
                  <div className="btn-back" onClick={() => setStep(3)}>← Back</div>
                  <div className="btn" onClick={() => { if(subAccNumber && subAccName) setStep(5); else alert("Fill details"); }}>Next: Submit Link →</div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="fade-in">
                <h3>Step 5: Final Submission</h3>
                <p className="hint">Paste the public link to your {subPlatform} post.</p>
                <input className="input" placeholder="https://..." value={subLink} onChange={e => setSubLink(e.target.value)} />
                <div className="actions">
                  <div className="btn-back" onClick={() => setStep(4)}>← Back</div>
                  <div className="btn" onClick={handleSubmit}>
                    {submitting ? "Submitting..." : "Submit Entry 🚀"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h2>My Submissions</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Platform</th>
                  <th>Format</th>
                  <th>Link</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map(sub => (
                  <tr key={sub.id}>
                    <td>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                    <td>{sub.platform}</td>
                    <td>{sub.format}</td>
                    <td><a href={sub.post_link} target="_blank" className="link">View Post</a></td>
                    <td>{sub.payment_method}</td>
                    <td>
                      <span className={`badge status-${sub.status}`}>
                        {sub.status === 'winner' ? '🏆 Winner' : sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {mySubmissions.length === 0 && <tr><td colSpan="6">No submissions yet. Start earning!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
:root {
  --primary: #3b82f6; --primary-dark: #1e3a8a; --bg: #f4f7f6; --surface: #ffffff;
  --text: #1f2937; --text-light: #6b7280;
}
* { box-sizing: border-box; }
.page-wrapper { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); min-height: 100vh; padding-bottom: 50px; color: var(--text); }
.ticker-bar { background: linear-gradient(90deg, var(--primary-dark), var(--primary)); color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 15px; position: sticky; top: 0; z-index: 50; }
.ticker-content { animation: slideIn 0.5s ease-out; }
@keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.container { max-width: 900px; margin: 0 auto; padding: 20px; }
.card { background: var(--surface); border-radius: 18px; padding: 30px; margin-bottom: 24px; box-shadow: 8px 8px 24px #d1d9e6, -8px -8px 24px #ffffff; transition: transform 0.3s; animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.banner { text-align: center; background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6)); border: 1px solid rgba(255,255,255,0.8); }
.banner h1 { margin: 0 0 10px 0; color: var(--primary-dark); font-size: 28px; }
.banner p { color: var(--text-light); font-size: 16px; margin-bottom: 15px; }
.prize-range { display: inline-block; background: rgba(59, 130, 246, 0.1); color: var(--primary); padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 10px; }
.ended-badge { color: #ef4444; font-weight: 600; margin-top: 10px; }
.countdown { color: #f59e0b; font-weight: 600; margin-top: 10px; }
.step-container h2 { margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; }
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-top: 15px; }
.btn-outline { background: var(--surface); border: 2px solid #e5e7eb; color: var(--text); padding: 12px; text-align: center; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff; }
.btn-outline:hover, .btn-outline.active { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
.btn { display: inline-block; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); transition: transform 0.2s; text-align: center; }
.btn:active { transform: translateY(2px); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4); }
.btn-back { display: inline-block; padding: 12px; color: var(--text-light); cursor: pointer; font-weight: 600; margin-top: 20px; }
.btn-back:hover { color: var(--text); }
.actions { display: flex; justify-content: space-between; align-items: center; margin-top: 25px; }
.instructions-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 15px 0; border: 1px solid #e2e8f0; }
.caption-text { background: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; margin: 10px 0; white-space: pre-wrap; word-break: break-word; border: 1px solid #e2e8f0; }
.input-group { margin-top: 20px; display: flex; flex-direction: column; gap: 15px; }
.input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e5e7eb; outline: none; font-size: 16px; background: #f9fafb; transition: border 0.2s; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05); font-family: inherit; }
.input:focus { border-color: var(--primary); }
.success-msg { background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; text-align: center; }
.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
.table th { font-weight: 600; color: var(--text-light); }
.badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
.status-pending { background: #fef3c7; color: #d97706; }
.status-confirmed { background: #dbeafe; color: #2563eb; }
.status-winner { background: #dcfce7; color: #166534; }
.link { color: var(--primary); text-decoration: none; font-weight: 600; }
.link:hover { text-decoration: underline; }
.loading { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 20px; font-weight: bold; color: var(--primary); background: var(--bg); }
.img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin: 15px 0; }
.img-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: white; text-align: center; }
.img-card img { width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px; }
.btn-small { background: var(--primary); color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block; }
@media(max-width: 600px) { .actions { flex-direction: column-reverse; gap: 15px; } .btn-back { margin-top: 0; } .btn { width: 100%; } }
`;