"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function UserCampaignPage() {
  const[user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const[tickerWinners, setTickerWinners] = useState([]);
  const [images, setImages] = useState([]);
  const[captions, setCaptions] = useState({});
  const [coins, setCoins] = useState(0);
  const[displayCoins, setDisplayCoins] = useState(0);

  // Submission Flow State
  const[step, setStep] = useState(1);
  const [subPlatform, setSubPlatform] = useState("");
  const [subFormat, setSubFormat] = useState("");
  const [subPayMethod, setSubPayMethod] = useState("");
  const [subAccNumber, setSubAccNumber] = useState("");
  const[subAccName, setSubAccName] = useState("");
  const [subLink, setSubLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const[successMsg, setSuccessMsg] = useState("");

  // Premium AI & Gamification State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStepText, setAiStepText] = useState("");
  const [socialCounter, setSocialCounter] = useState(14892);
  const [viralScore, setViralScore] = useState(85);
  const[showConfetti, setShowConfetti] = useState(false);

  const PLATFORMS =["TikTok", "Facebook", "Instagram", "YouTube", "Snapchat", "LinkedIn", "Twitter", "WhatsApp", "Pinterest", "Telegram"];
  const FORMATS =[{ id: "video", label: "Video 🎥", boost: "4x", xp: 500 }, { id: "image", label: "Image 🖼️", boost: "2x", xp: 200 }, { id: "text", label: "Text 📝", boost: "1x", xp: 50 }];
  const PAY_METHODS =["EasyPaisa", "JazzCash", "Bank Account"];
  const PREBUILT_NAMES =["Asad", "Fatima", "Umar", "Ayesha", "Hassan", "Zara", "Ali", "Sana", "Bilal", "Maria", "Kamran", "Hira", "Tariq", "Nimra", "Faisal", "Amna", "Raheel", "Dua", "Waheed", "Mahnoor", "Imran", "Saba", "Danish", "Iqra", "Shoaib", "Laiba", "Adnan", "Maryam", "Zubair", "Noor"];
  const AI_PHRASES =["Analyzing viral trends...", "Optimizing reward algorithms...", "Generating strategy...", "Securing payout channels..."];

  useEffect(() => {
    loadData();
    // Fake social counter tick
    const counterInterval = setInterval(() => setSocialCounter(prev => prev + Math.floor(Math.random() * 5)), 6000);
    return () => clearInterval(counterInterval);
  },[]);

  // Animate Coin Counting
  useEffect(() => {
    if (coins > 0) {
      let start = 0;
      const duration = 2000;
      const increment = coins / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= coins) {
          clearInterval(timer);
          setDisplayCoins(coins);
        } else {
          setDisplayCoins(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [coins]);

  async function loadData() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return window.location.href = "/login";
      const currentUser = session.user;
      setUser(currentUser);

      const { data: prof } = await supabase.from("users_profiles")
        .select("full_name, email, my_refer_code, my_referals, total_aidla_coins")
        .eq("user_id", currentUser.id)
        .single();
      
      setProfile(prof);
      setCoins(prof?.total_aidla_coins || 0);

      const { data: sets } = await supabase.from("campaign_settings").select("*").order("created_at", { ascending: false }).limit(1).single();
      setSettings(sets);

      const { data: subs } = await supabase.from("campaign_submissions").select("*").eq("user_id", currentUser.id).order("submitted_at", { ascending: false });
      setMySubmissions(subs ||[]);

      const { data: imgs } = await supabase.from("campaign_images").select("*");
      setImages(imgs ||[]);

      const { data: caps } = await supabase.from("campaign_captions").select("*");
      const capMap = {};
      (caps ||[]).forEach(c => capMap[c.id] = c.caption_template);
      setCaptions(capMap);

      const { data: realWinners } = await supabase.from("campaign_winners").select("*").eq("show_on_ticker", true);
      const generated = Array.from({ length: 30 }).map(() => ({
        name: PREBUILT_NAMES[Math.floor(Math.random() * PREBUILT_NAMES.length)],
        prize: Math.floor(Math.random() * (10000 - 500 + 1)) + 500,
        platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
        time: Math.floor(Math.random() * 59) + 1
      }));
      
      const combined = [...generated, ...(realWinners || []).map(rw => ({ name: rw.name, prize: rw.prize_amount, platform: rw.platform, time: "Just now" }))].sort(() => Math.random() - 0.5);
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
    triggerConfetti();
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleNextStep = (nextStepNum) => {
    setIsTransitioning(true);
    setAiProgress(0);
    setAiStepText(AI_PHRASES[0]);

    setViralScore(prev => Math.min(99, prev + Math.floor(Math.random() * 5) + 2));

    let progress = 0;
    let phraseIdx = 0;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) progress = 100;
      
      setAiProgress(progress);
      
      if (progress > 25 && phraseIdx === 0) { phraseIdx = 1; setAiStepText(AI_PHRASES[1]); }
      if (progress > 50 && phraseIdx === 1) { phraseIdx = 2; setAiStepText(AI_PHRASES[2]); }
      if (progress > 75 && phraseIdx === 2) { phraseIdx = 3; setAiStepText(AI_PHRASES[3]); }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsTransitioning(false);
          setStep(nextStepNum);
          if (nextStepNum > 1) triggerConfetti();
        }, 400);
      }
    }, 150);
  };

  const handleSubmit = async () => {
    if (!subLink || !subAccNumber || !subAccName || !subPayMethod) return alert("⚠️ Please fill all payment details and link to secure your entry.");
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
      triggerConfetti();
      setSuccessMsg("🚀 Campaign Entry Locked In! Our AI is verifying your submission.");
      setTimeout(() => {
        setStep(1); setSubPlatform(""); setSubFormat(""); setSubLink("");
        loadData();
        setTimeout(() => setSuccessMsg(""), 6000);
      }, 3000);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = { TikTok: "🎵", Facebook: "📘", Instagram: "📸", YouTube: "📺", Snapchat: "👻", LinkedIn: "💼", Twitter: "🐦", WhatsApp: "💬", Pinterest: "📌", Telegram: "✈️" };
    return icons[platform] || "📱";
  };

  if (loading) return (
    <div className="premium-loading">
      <div className="loading-core">
        <div className="ai-rings">
          <div className="ring r1"></div>
          <div className="ring r2"></div>
          <div className="ring r3"></div>
        </div>
        <div className="loading-logo">AIDLA AI</div>
      </div>
      <div className="loading-text">Initializing Your Viral Dashboard...</div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <style>{CSS}</style>

      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="confetti" style={{ 
              left: `${Math.random() * 100}%`, 
              animationDelay: `${Math.random() * 0.2}s`,
              backgroundColor:['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 5)]
            }}></div>
          ))}
        </div>
      )}

      {/* Premium Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob a1"></div>
        <div className="aurora-blob a2"></div>
        <div className="aurora-blob a3"></div>
        <div className="grid-mesh"></div>
      </div>

      {/* Premium Glass Header */}
      <header className="glass-nav">
        <div className="nav-logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">AIDLA Viral</span>
        </div>
        <div className="coin-wallet">
          <div className="coin-glow"></div>
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{displayCoins.toLocaleString()}</span>
        </div>
      </header>

      {/* Infinite Marquee Winners Ticker */}
      {tickerWinners.length > 0 && (
        <div className="ticker-container">
          <div className="live-pill">
            <div className="pulse-dot"></div> LIVE
          </div>
          <div className="marquee-wrapper">
            <div className="marquee">
              {tickerWinners.map((winner, idx) => (
                <div className="ticker-card" key={idx}>
                  <div className="tc-avatar">{winner.name.charAt(0)}</div>
                  <div className="tc-info">
                    <span className="tc-name">{winner.name}</span> earned <span className="tc-prize">₨{winner.prize}</span>
                    <span className="tc-plat">{getPlatformIcon(winner.platform)}</span>
                    <span className="tc-time">{winner.time}{typeof winner.time === 'number' ? 'm ago' : ''}</span>
                  </div>
                </div>
              ))}
              {/* Duplicate for infinite effect */}
              {tickerWinners.map((winner, idx) => (
                <div className="ticker-card" key={`dup-${idx}`}>
                  <div className="tc-avatar">{winner.name.charAt(0)}</div>
                  <div className="tc-info">
                    <span className="tc-name">{winner.name}</span> earned <span className="tc-prize">₨{winner.prize}</span>
                    <span className="tc-plat">{getPlatformIcon(winner.platform)}</span>
                    <span className="tc-time">{winner.time}{typeof winner.time === 'number' ? 'm ago' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container relative-z">
        {settings && (
          <div className="hero-banner">
            <div className="social-proof-badge">
              <span className="sp-avatars">
                <div className="sp-av" style={{backgroundImage: 'url("https://i.pravatar.cc/100?img=1")'}}></div>
                <div className="sp-av" style={{backgroundImage: 'url("https://i.pravatar.cc/100?img=5")'}}></div>
                <div className="sp-av" style={{backgroundImage: 'url("https://i.pravatar.cc/100?img=9")'}}></div>
              </span>
              <strong>{socialCounter.toLocaleString()}</strong> creators earning now
            </div>
            <h1 className="hero-title">{settings.title}</h1>
            <p className="hero-subtitle">{settings.description}</p>
            <div className="prize-badge-container">
              <div className="prize-badge magnetic">
                <span className="badge-sparkle">✨</span> 
                Prize Pool: <span className="text-gradient">₨{settings.prize_min} - ₨{settings.prize_max}</span> / post
              </div>
            </div>
            {settings.end_date && settings.is_active && (
              <div className="urgency-bar">⏳ Campaign closes in {Math.ceil((new Date(settings.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days</div>
            )}
          </div>
        )}

        {settings?.is_active && (
          <div className="app-card step-container relative-container">
            
            {/* AI Loading Overlay */}
            {isTransitioning && (
              <div className="ai-overlay">
                <div className="ai-overlay-bg"></div>
                <div className="ai-scanner">
                  <div className="scan-line"></div>
                  <div className="ai-core-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-text">{aiProgress}%</div>
                  </div>
                </div>
                <h3 className="ai-status-text">{aiStepText}</h3>
                <div className="ai-progress-bar">
                  <div className="ai-progress-fill" style={{ width: `${aiProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Premium Progress & Gamification Header */}
            <div className="step-app-header">
              <div className="gamification-row">
                <div className="stat-pill">
                  <span className="stat-icon">🎯</span> Level {step}
                </div>
                <div className="stat-pill ai-score">
                  <span className="stat-icon">⚡</span> AI Score: {viralScore}
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
                <div className="progress-glow" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
              </div>
            </div>
            
            {successMsg && (
              <div className="success-banner pop-in">
                <span className="success-icon">🎉</span>
                <p>{successMsg}</p>
              </div>
            )}

            <div className={`step-content ${isTransitioning ? 'blur-out' : 'fade-in'}`}>
              
              {step === 1 && (
                <div className="step-pane">
                  <div className="pane-header">
                    <h3 className="step-title">Select Platform</h3>
                    <p className="hint">Where do you have the highest influence?</p>
                  </div>
                  <div className="grid platform-grid">
                    {PLATFORMS.map(p => (
                      <button key={p} className="app-btn-outline group magnetic" onClick={() => { 
                        setSubPlatform(p); 
                        handleNextStep(2); 
                      }}>
                        <div className="btn-content">
                          <span className="platform-icon group-hover:scale-125">{getPlatformIcon(p)}</span>
                          <span className="btn-text">{p}</span>
                        </div>
                        {['TikTok', 'Instagram', 'YouTube'].includes(p) && <div className="hot-badge">HOT</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="step-pane">
                  <div className="pane-header">
                    <h3 className="step-title">Select Format</h3>
                    <p className="hint">Video content generates <span className="text-green-500 font-bold">4x higher</span> rewards.</p>
                  </div>
                  <div className="format-list">
                    {FORMATS.map(f => (
                      <button key={f.id} className="format-card magnetic" onClick={() => { 
                        setSubFormat(f.id); 
                        handleNextStep(3); 
                      }}>
                        <div className="fc-left">
                          <span className="fc-icon">{f.id === 'video' ? '🎬' : f.id === 'image' ? '📸' : '📝'}</span>
                          <div className="fc-text">
                            <h4>{f.label.replace(/[^a-zA-Z]/g, '')}</h4>
                            <p>Potential XP: +{f.xp}</p>
                          </div>
                        </div>
                        <div className="fc-boost">
                          <span className="boost-tag">{f.boost} Boost</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="step-actions mobile-sticky-bottom">
                    <button className="btn-textual" onClick={() => setStep(1)}>← Back</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-pane">
                  <div className="pane-header">
                    <h3 className="step-title">Your AI Blueprint</h3>
                    <p className="hint">Use this AI-optimized content to maximize reach.</p>
                  </div>
                  <div className="instructions-box premium-box">
                    <div className="box-header">
                      <span className="pulse-dot-green"></span>
                      <span className="box-title">AI Optimized Caption</span>
                      <span className="copy-badge">High Conversion</span>
                    </div>
                    <div className="caption-text">{getCaption()}</div>
                    <button className="btn-primary w-full haptic-click" onClick={() => copyToClipboard(getCaption())}>
                      <span className="btn-glow"></span>
                      <span className="btn-content">📋 Copy Smart Caption</span>
                    </button>

                    {subFormat === "image" && (
                      <div className="image-assets mt-6">
                        <div className="section-title"><span className="sparkle">🔥</span> Trending Templates</div>
                        <div className="horizontal-scroll hide-scrollbar">
                          {images.filter(img => img.platform.toLowerCase() === subPlatform.toLowerCase()).map(img => (
                            <div key={img.id} className="img-card group">
                              <div className="img-wrapper">
                                <img src={img.image_url} alt={img.title} />
                                <div className="img-overlay">
                                  <a href={img.image_url} download className="dl-btn haptic-click" target="_blank">⬇ Save</a>
                                </div>
                              </div>
                              <div className="trending-tag">Trending #1</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {subFormat && (
                      <div className="video-instructions mt-6">
                        <div className="vid-step"><div className="vs-num">1</div> <div className="vs-text">Create authentic AIDLA content for {subPlatform}</div></div>
                        <div className="vid-step"><div className="vs-num">2</div> <div className="vs-text">Include a clear AIDLA screen view or screenshot (Boosts conversion)</div></div>
                        <div className="vid-step"><div className="vs-num">3</div> <div className="vs-text">Clearly state your referral code</div></div>
                        <div className="vid-step"><div className="vs-num">4</div> <div className="vs-text">Use a trending audio on {subPlatform} when possible</div></div>
                        <div className="vid-step"><div className="vs-num">5</div> <div className="vs-text">Mention / tag AIDLA Official account — mandatory</div></div>
                        <div className="vid-note mt-4">Official AIDLA profiles: TikTok <a href="https://www.tiktok.com/@aidla_official" target="_blank" rel="noopener noreferrer">@aidla_official</a>, Instagram <a href="https://www.instagram.com/aidla_official/" target="_blank" rel="noopener noreferrer">@aidla_official</a>, LinkedIn <a href="https://www.linkedin.com/company/aidla" target="_blank" rel="noopener noreferrer">AIDLA</a>, Facebook <a href="https://www.facebook.com/profile.php?id=61586195563121" target="_blank" rel="noopener noreferrer">AIDLA</a>, WhatsApp <a href="https://whatsapp.com/channel/0029VbC6yju0rGiV5JaCqj42" target="_blank" rel="noopener noreferrer">AIDLA Channel</a>.</div>
                      </div>
                    )}
                  </div>
                  <div className="step-actions mobile-sticky-bottom two-col">
                    <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                    <button className="btn-primary haptic-click shine-sweep" onClick={() => handleNextStep(4)}>
                      <span className="btn-glow"></span>
                      Next Step →
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="step-pane">
                  <div className="pane-header">
                    <h3 className="step-title">Secure Payout</h3>
                    <p className="hint">Where should we deposit your earnings?</p>
                  </div>
                  <div className="grid pay-grid">
                    {PAY_METHODS.map(pm => (
                      <button key={pm} className={`app-btn-outline ${subPayMethod === pm ? 'active-glow' : ''} magnetic`} onClick={() => setSubPayMethod(pm)}>
                        <span className="pm-icon">{pm === 'Bank Account' ? '🏦' : '📱'}</span> {pm}
                      </button>
                    ))}
                  </div>
                  {subPayMethod && (
                    <div className="input-group slide-up">
                      <div className="input-wrapper">
                        <span className="input-icon">💳</span>
                        <input className="app-input" placeholder="Account Number" value={subAccNumber} onChange={e => setSubAccNumber(e.target.value)} />
                      </div>
                      <div className="input-wrapper">
                        <span className="input-icon">👤</span>
                        <input className="app-input" placeholder="Exact Account Title" value={subAccName} onChange={e => setSubAccName(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <div className="step-actions mobile-sticky-bottom two-col">
                    <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
                    <button className="btn-primary haptic-click shine-sweep" onClick={() => { 
                      if(subAccNumber && subAccName) handleNextStep(5); 
                      else alert("⚠️ Please fill details to ensure you get paid."); 
                    }}>
                      <span className="btn-glow"></span>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="step-pane">
                  <div className="pane-header center-text">
                    <div className="launch-icon">🚀</div>
                    <h3 className="step-title">Final Launch</h3>
                    <p className="hint">Paste your live {subPlatform} post link to claim your spot.</p>
                  </div>
                  <div className="input-wrapper main-link-input mt-4">
                    <span className="input-icon">🔗</span>
                    <input className="app-input lg-input" placeholder={`https://www.${subPlatform.toLowerCase()}.com/...`} value={subLink} onChange={e => setSubLink(e.target.value)} />
                  </div>
                  <div className="step-actions mobile-sticky-bottom full-width mt-6">
                    <button className="btn-primary btn-lg haptic-click pulse-cta shine-sweep" onClick={handleSubmit} disabled={submitting}>
                      <span className="btn-glow"></span>
                      {submitting ? "Securing Entry..." : "Submit & Lock Entry 🚀"}
                    </button>
                    <button className="btn-textual mt-2" onClick={() => setStep(4)}>Review Payout Details</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="app-card mt-8">
          <div className="card-header-flex">
            <h2 className="section-title">My Journey</h2>
            <div className="stat-badge">{mySubmissions.length} Entries</div>
          </div>
          
          <div className="history-container">
            {mySubmissions.length === 0 ? (
              <div className="empty-state-premium">
                <div className="empty-icon-float">🏆</div>
                <h4>No entries yet</h4>
                <p>Submit your first campaign to start earning rewards and coins.</p>
              </div>
            ) : (
              <div className="history-list">
                {mySubmissions.map((sub, i) => (
                  <div key={sub.id} className="history-card slide-in-right" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="hc-left">
                      <div className="hc-icon">{getPlatformIcon(sub.platform)}</div>
                      <div className="hc-details">
                        <h4>{sub.platform} <span className="hc-format">• {sub.format}</span></h4>
                        <span className="hc-date">{new Date(sub.submitted_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                      </div>
                    </div>
                    <div className="hc-right">
                      <div className={`status-badge status-${sub.status}`}>
                        <div className="s-dot"></div>
                        {sub.status === 'winner' ? '🏆 Won' : sub.status}
                      </div>
                      <a href={sub.post_link} target="_blank" rel="noreferrer" className="view-btn haptic-click">↗</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #ec4899;
  --gold: #fbbf24;
  --success: #10b981;
  --bg: #f4f4f9;
  --surface: rgba(255, 255, 255, 0.85);
  --surface-solid: #ffffff;
  --text: #0f172a;
  --text-light: #64748b;
  --border: rgba(226, 232, 240, 0.8);
  --safe-bottom: env(safe-area-inset-bottom, 20px);
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { margin: 0; background: var(--bg); }
.page-wrapper { 
  font-family: 'Outfit', system-ui, sans-serif; 
  min-height: 100vh; 
  color: var(--text);
  overflow-x: hidden;
  position: relative;
  padding-bottom: calc(80px + var(--safe-bottom)); 
}

/* Confetti */
.confetti-container { position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden; }
.confetti { position: absolute; width: 10px; height: 10px; border-radius: 2px; top: -10px; animation: fall 2s ease-in forwards; }
@keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }

/* Premium Aurora Background */
.aurora-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; background: #f8fafc; }
.aurora-blob { position: absolute; filter: blur(90px); opacity: 0.4; border-radius: 50%; animation: float 15s infinite alternate ease-in-out; }
.a1 { top: -10%; left: -10%; width: 50vw; height: 50vw; background: var(--primary); }
.a2 { bottom: -20%; right: -10%; width: 60vw; height: 60vw; background: var(--secondary); animation-delay: -5s; }
.a3 { top: 30%; left: 50%; width: 40vw; height: 40vw; background: #38bdf8; animation-delay: -10s; }
.grid-mesh { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 30px 30px; opacity: 0.5; }
@keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }

/* Premium Glass Header */
.glass-nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding: 12px 20px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
}
.nav-logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
.logo-icon { font-size: 22px; }
.logo-text { background: linear-gradient(135deg, var(--text), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

/* Coin Wallet */
.coin-wallet {
  position: relative;
  display: flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 6px 14px; border-radius: 30px;
  font-weight: 700; color: #b45309;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15);
  overflow: hidden;
}
.coin-glow { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent); transform: translateX(-100%); animation: shineSweep 3s infinite; }
.coin-icon { animation: coinBounce 2s infinite; font-size: 16px; }
.coin-amount { font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
@keyframes coinBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

/* Infinite Marquee Ticker */
.ticker-container {
  display: flex; align-items: center;
  background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px);
  color: white; padding: 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  overflow: hidden; position: relative; z-index: 90;
}
.live-pill {
  position: absolute; left: 0; z-index: 2;
  display: flex; align-items: center; gap: 6px;
  background: #0f172a; padding: 12px 16px;
  font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #fca5a5;
  box-shadow: 10px 0 20px rgba(15,23,42,0.9);
}
.pulse-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulseRed 1.5s infinite; }
.marquee-wrapper { width: 100%; overflow: hidden; padding-left: 90px; }
.marquee { display: flex; gap: 20px; animation: marquee 30s linear infinite; width: max-content; padding: 8px 0; }
.ticker-card { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
.tc-avatar { width: 24px; height: 24px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
.tc-info { font-size: 13px; white-space: nowrap; color: #e2e8f0; }
.tc-name { font-weight: 700; color: white; }
.tc-prize { color: #34d399; font-weight: 800; }
.tc-plat { margin: 0 4px; }
.tc-time { color: #94a3b8; font-size: 11px; margin-left: 6px; }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

.relative-z { position: relative; z-index: 10; }
.container { max-width: 680px; margin: 0 auto; padding: 24px 16px; }

/* Hero Banner */
.hero-banner { text-align: center; margin-bottom: 30px; animation: fadeUp 0.6s ease-out; }
.social-proof-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); padding: 6px 16px 6px 6px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 16px; }
.sp-avatars { display: flex; margin-right: 4px; }
.sp-av { width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; background-size: cover; margin-left: -8px; }
.sp-av:first-child { margin-left: 0; }
.hero-title { font-size: 36px; font-weight: 800; line-height: 1.1; margin: 0 0 12px 0; background: linear-gradient(135deg, #0f172a, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { color: var(--text-light); font-size: 16px; margin: 0 0 24px 0; line-height: 1.5; }
.prize-badge-container { display: flex; justify-content: center; }
.prize-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid rgba(99, 102, 241, 0.2); padding: 12px 24px; border-radius: 20px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1); }
.text-gradient { background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
.urgency-bar { margin-top: 16px; color: #d97706; font-size: 13px; font-weight: 700; background: rgba(245, 158, 11, 0.1); display: inline-block; padding: 6px 14px; border-radius: 20px; }

/* Premium App Cards */
.app-card {
  background: var(--surface);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 28px;
  padding: 30px;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.5);
}
.relative-container { position: relative; overflow: hidden; }

/* AI Loading Overlay */
.ai-overlay { position: absolute; inset: 0; z-index: 50; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 28px; overflow: hidden; animation: overlayFadeIn 0.3s ease-out; }
.ai-overlay-bg { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.ai-scanner { position: relative; width: 120px; height: 120px; display: flex; justify-content: center; align-items: center; margin-bottom: 24px; z-index: 2; }
.scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--primary); box-shadow: 0 0 15px var(--primary); animation: scanDown 2s ease-in-out infinite alternate; z-index: 3; }
.ai-core-spinner { position: relative; width: 80px; height: 80px; display: flex; justify-content: center; align-items: center; }
.spinner-ring { position: absolute; inset: 0; border: 3px dashed var(--primary); border-radius: 50%; animation: spin 4s linear infinite; opacity: 0.5; }
.spinner-text { font-size: 18px; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; }
.ai-status-text { position: relative; z-index: 2; font-size: 18px; font-weight: 700; color: var(--text); background: linear-gradient(90deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.ai-progress-bar { position: relative; z-index: 2; width: 60%; height: 6px; background: #e2e8f0; border-radius: 10px; margin-top: 20px; overflow: hidden; }
.ai-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.3s linear; }

@keyframes scanDown { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

/* App Header & Gamification */
.step-app-header { margin-bottom: 24px; }
.gamification-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.stat-pill { display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; color: var(--text-light); }
.stat-pill.ai-score { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1)); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }
.stat-icon { font-size: 14px; }
.progress-track { position: relative; width: 100%; height: 8px; background: #e2e8f0; border-radius: 10px; }
.progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 10px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); z-index: 2; }
.progress-glow { position: absolute; top: 0; left: 0; height: 100%; background: var(--primary); border-radius: 10px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); filter: blur(6px); opacity: 0.6; z-index: 1; }

.blur-out { filter: blur(8px); opacity: 0; transition: all 0.3s ease; pointer-events: none; transform: scale(0.95); }
.fade-in { animation: scaleFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes scaleFadeIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.pane-header { margin-bottom: 24px; }
.pane-header.center-text { text-align: center; }
.step-title { font-size: 24px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px; }
.hint { color: var(--text-light); font-size: 15px; margin: 0; }

/* Grid Layouts */
.grid { display: grid; gap: 12px; }
.platform-grid { grid-template-columns: repeat(2, 1fr); }
.pay-grid { grid-template-columns: 1fr; }

/* App Buttons */
.app-btn-outline {
  position: relative; background: var(--surface-solid); border: 2px solid transparent; 
  padding: 16px; border-radius: 20px; cursor: pointer; text-align: left;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02), inset 0 0 0 1px #e2e8f0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px;
}
.btn-content { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.platform-icon { font-size: 32px; transition: transform 0.3s; }
.btn-text { font-weight: 700; font-size: 15px; }
.hot-badge { position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #ef4444, #f97316); color: white; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 12px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }
.app-btn-outline:active { transform: scale(0.97); }
.magnetic:hover { border-color: var(--primary); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15), inset 0 0 0 1px var(--primary); }
.active-glow { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), inset 0 0 0 1px var(--primary); }

/* Format Cards */
.format-list { display: flex; flex-direction: column; gap: 12px; }
.format-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--surface-solid); border-radius: 20px; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.02), inset 0 0 0 1px #e2e8f0; cursor: pointer; transition: all 0.2s; text-align: left; }
.fc-left { display: flex; align-items: center; gap: 16px; }
.fc-icon { font-size: 28px; }
.fc-text h4 { margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: var(--text); }
.fc-text p { margin: 0; font-size: 13px; color: var(--text-light); font-weight: 500; }
.boost-tag { background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 12px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
.format-card:active { transform: scale(0.98); }

/* Premium Blueprint Box */
.premium-box { background: rgba(248, 250, 252, 0.8); border: 1px solid var(--border); border-radius: 20px; padding: 24px; margin-bottom: 24px; }
.box-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.box-title { font-weight: 700; font-size: 15px; }
.copy-badge { margin-left: auto; background: #fef3c7; color: #d97706; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 8px; }
.pulse-dot-green { width: 10px; height: 10px; background: var(--success); border-radius: 50%; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
.caption-text { background: var(--surface-solid); padding: 16px; border-radius: 16px; font-family: ui-monospace, monospace; font-size: 14px; margin-bottom: 16px; border: 1px solid #e2e8f0; color: #334155; line-height: 1.6; }

/* Inputs */
.input-group { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.input-wrapper { position: relative; width: 100%; }
.input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; }
.app-input { width: 100%; padding: 18px 20px 18px 48px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface-solid); font-size: 16px; font-weight: 500; font-family: inherit; color: var(--text); outline: none; transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
.app-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), inset 0 2px 4px rgba(0,0,0,0.02); }
.lg-input { padding: 20px 20px 20px 50px; font-size: 16px; }

/* Buttons & Actions */
.step-actions { display: flex; align-items: center; gap: 12px; margin-top: 24px; }
.two-col { display: grid; grid-template-columns: 1fr 2fr; }
.full-width { flex-direction: column; }
.btn-primary, .btn-secondary, .btn-textual { border: none; padding: 16px 24px; border-radius: 20px; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: inline-flex; justify-content: center; align-items: center; position: relative; overflow: hidden; font-family: inherit; }
.btn-primary { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4); }
.btn-secondary { background: #f1f5f9; color: var(--text); box-shadow: inset 0 0 0 1px #e2e8f0; }
.btn-textual { background: transparent; color: var(--text-light); }
.btn-lg { padding: 20px; font-size: 18px; width: 100%; }
.w-full { width: 100%; }
.haptic-click:active { transform: scale(0.96); }
.shine-sweep::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); animation: shine 3s infinite; }
.pulse-cta { animation: ctaPulse 2s infinite; }
@keyframes ctaPulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
@keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }

/* Images Scroll */
.horizontal-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; scroll-snap-type: x mandatory; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.img-card { flex: 0 0 140px; scroll-snap-align: start; position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.img-wrapper { position: relative; padding-top: 130%; }
.img-wrapper img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.img-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s; }
.img-card:hover .img-overlay { opacity: 1; }
.dl-btn { background: white; color: var(--text); padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 800; text-decoration: none; transform: translateY(10px); transition: all 0.2s; }
.img-card:hover .dl-btn { transform: translateY(0); }
.trending-tag { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); color: white; backdrop-filter: blur(4px); font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 8px; }

/* Video Instructions */
.vid-step { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; background: white; padding: 12px; border-radius: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.vs-num { width: 28px; height: 28px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
.vs-text { font-size: 14.5px; font-weight: 500; }

/* History Section */
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.section-title { font-size: 20px; font-weight: 800; margin: 0; }
.stat-badge { background: #e0e7ff; color: var(--primary-dark); padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 800; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-card { display: flex; justify-content: space-between; align-items: center; background: white; padding: 16px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.02), inset 0 0 0 1px #e2e8f0; }
.hc-left { display: flex; align-items: center; gap: 16px; }
.hc-icon { font-size: 24px; background: #f8fafc; width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
.hc-details h4 { margin: 0 0 4px 0; font-size: 15px; font-weight: 700; }
.hc-format { color: var(--text-light); font-weight: 500; text-transform: capitalize; }
.hc-date { font-size: 13px; color: #94a3b8; font-weight: 500; }
.hc-right { display: flex; align-items: center; gap: 12px; }
.status-badge { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.s-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-pending { background: #fef3c7; color: #d97706; } .status-pending .s-dot { background: #d97706; }
.status-confirmed { background: #e0e7ff; color: #4f46e5; } .status-confirmed .s-dot { background: #4f46e5; }
.status-winner { background: #d1fae5; color: #059669; } .status-winner .s-dot { background: #059669; box-shadow: 0 0 8px rgba(5,150,105,0.4); }
.view-btn { width: 36px; height: 36px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; color: var(--text); font-weight: 800; transition: all 0.2s; }
.view-btn:hover { background: var(--primary); color: white; transform: rotate(45deg); }
.empty-state-premium { text-align: center; padding: 40px 20px; background: rgba(248,250,252,0.5); border-radius: 20px; border: 1px dashed #cbd5e1; }
.empty-icon-float { font-size: 48px; margin-bottom: 16px; animation: float 3s infinite ease-in-out; }
.empty-state-premium h4 { margin: 0 0 8px 0; font-size: 18px; font-weight: 700; }
.empty-state-premium p { margin: 0; color: var(--text-light); font-size: 14px; }

/* Loader */
.premium-loading { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: var(--bg); position: relative; z-index: 9999; }
.loading-core { position: relative; width: 120px; height: 120px; display: flex; justify-content: center; align-items: center; margin-bottom: 24px; }
.ai-rings { position: absolute; inset: 0; }
.ring { position: absolute; inset: 0; border: 2px solid transparent; border-radius: 50%; }
.r1 { border-top-color: var(--primary); animation: spin 1.5s linear infinite; }
.r2 { border-right-color: var(--secondary); animation: spin 2s linear infinite reverse; inset: 10px; }
.r3 { border-bottom-color: #38bdf8; animation: spin 2.5s linear infinite; inset: 20px; }
.loading-logo { font-weight: 800; font-size: 14px; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.loading-text { font-size: 16px; font-weight: 700; color: var(--text-light); letter-spacing: 0.5px; animation: pulse 1.5s infinite; }

/* Animations */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 50% { opacity: 0.5; } }
@keyframes overlayFadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(12px); } }
.slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.slide-in-right { animation: slideInR 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateX(20px); }
@keyframes slideInR { to { opacity: 1; transform: translateX(0); } }
.pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }

/* Success Banner */
.success-banner { display: flex; align-items: center; gap: 12px; background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15); }
.success-icon { font-size: 24px; animation: coinBounce 2s infinite; }
.success-banner p { margin: 0; color: #065f46; font-weight: 700; font-size: 15px; }

/* Mobile Optimizations - Mobile First Focus */
@media(max-width: 640px) {
  .app-card { padding: 20px; border-radius: 24px; }
  .mobile-sticky-bottom { 
    position: fixed; bottom: 0; left: 0; right: 0; 
    padding: 16px; padding-bottom: calc(16px + var(--safe-bottom)); 
    background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); 
    border-top: 1px solid rgba(0,0,0,0.05); z-index: 80; 
    margin: 0; box-shadow: 0 -10px 20px rgba(0,0,0,0.05); 
  }
  .app-btn-outline { flex-direction: row; justify-content: flex-start; padding: 16px; }
  .btn-content { flex-direction: row; gap: 16px; }
  .platform-icon { font-size: 24px; }
  .history-card { flex-direction: column; align-items: flex-start; gap: 16px; }
  .hc-right { width: 100%; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 12px; }
  .hero-title { font-size: 30px; }
  .prize-badge { font-size: 14px; padding: 10px 16px; }
  .format-card { flex-direction: column; align-items: flex-start; gap: 12px; }
  .fc-boost { align-self: flex-start; }
}
`;