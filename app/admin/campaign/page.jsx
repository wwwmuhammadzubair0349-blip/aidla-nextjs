"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminCampaignPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("settings");

  // Data states
  const [settings, setSettings] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [images, setImages] = useState([]);
  const [winners, setWinners] = useState([]);
  const [captions, setCaptions] = useState([]);
  
  // Filters
  const [subFilterStatus, setSubFilterStatus] = useState("all");
  const [subFilterPlatform, setSubFilterPlatform] = useState("all");

  const PLATFORMS = ["TikTok", "Facebook", "Instagram", "YouTube", "Snapchat", "LinkedIn", "Twitter", "WhatsApp", "Pinterest", "Telegram"];
  const FORMATS = ["video", "image", "text"];

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || session.user.email !== "zkafridi317@gmail.com") {
      alert("Access Denied");
      return window.location.href = "/";
    }
    setIsAdmin(true);
    await loadAllData();
    setLoading(false);
  }

  async function loadAllData() {
    const [setRes, imgRes, winRes, capRes] = await Promise.all([
      supabase.from("campaign_settings").select("*").order("created_at", { ascending: false }).limit(1).single(),
      supabase.from("campaign_images").select("*").order("uploaded_at", { ascending: false }),
      supabase.from("campaign_winners").select("*").order("created_at", { ascending: false }),
      supabase.from("campaign_captions").select("*")
    ]);

    const subRes = await supabase.from("campaign_submissions").select("*").order("submitted_at", { ascending: false });
    let submissionsData = subRes.data || [];

    if (subRes.error) {
      console.error("[AdminCampaign] submission fetch error:", subRes.error);
    }

    const userIds = Array.from(new Set(submissionsData.map((item) => item.user_id).filter(Boolean)));
    let profileMap = {};

    if (userIds.length > 0) {
      const { data: profiles, error: profileErr } = await supabase
        .from("users_profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      if (profileErr) {
        console.error("[AdminCampaign] profile fetch error:", profileErr);
      } else {
        profileMap = (profiles || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
      }
    }

    submissionsData = submissionsData.map((item) => ({
      ...item,
      users_profiles: profileMap[item.user_id] || null,
    }));

    if (setRes.data) setSettings(setRes.data);
    if (submissionsData) setSubmissions(submissionsData);
    if (imgRes.data) setImages(imgRes.data);
    if (winRes.data) setWinners(winRes.data);
    
    // Ensure all platform+format captions exist in state
    let caps = capRes.data || [];
    const fullCaps = [];
    PLATFORMS.forEach(p => {
      FORMATS.forEach(f => {
        const id = `${p}_${f}`.toLowerCase();
        const existing = caps.find(c => c.id === id);
        fullCaps.push(existing || { id, caption_template: "Join AIDLA today! Code: {refer_code}" });
      });
    });
    setCaptions(fullCaps);
  }

  // --- Handlers ---
  const handleSaveSettings = async () => {
    await supabase.from("campaign_settings").upsert({ id: settings.id, ...settings });
    alert("Settings Saved");
  };

  const handleUpdateSubmission = async (id, status, admin_note, userEmail, userName, platform) => {
    await supabase.from("campaign_submissions").update({ status, admin_note }).eq("id", id);

    if (status === "confirmed" || status === "winner") {
      if (!userEmail) {
        alert(`Status updated to ${status}, but email was not sent because the user email is missing.`);
        loadAllData();
        return;
      }

      let emailSuccess = false;
      let emailError = null;

      const payload = {
        to: userEmail,
        user_email: userEmail,
        name: userName,
        user_name: userName,
        status: status,
        platform: platform,
        prize_min: settings.prize_min,
        prize_max: settings.prize_max,
      };

      try {
        // This edge function is public (no auth required)
        const { data: fnData, error: fnErr } = await supabase.functions.invoke('campaign-notify', {
          body: payload,
        });

        if (fnErr) {
          emailError = fnErr;
          console.error("[AdminCampaign] campaign-notify invoke error:", fnErr, payload, fnData);
        } else if (fnData?.error) {
          emailError = fnData.error;
          console.error("[AdminCampaign] campaign-notify response error:", fnData, payload);
        } else {
          emailSuccess = true;
        }
      } catch (err) {
        emailError = err;
        console.error("[AdminCampaign] campaign-notify invoke exception:", err, payload);
      }

       if (!emailSuccess) {
         try {
           // This edge function is public (no auth required)
           const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/campaign-notify`;
           const fallbackRes = await fetch(url, {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
             },
             body: JSON.stringify(payload),
           });

          const text = await fallbackRes.text();
          if (fallbackRes.ok) {
            emailSuccess = true;
            console.log("[AdminCampaign] campaign-notify fallback success", text);
          } else {
            emailError = `Fallback function call failed: ${fallbackRes.status} ${text}`;
            console.error("[AdminCampaign] campaign-notify fallback error:", emailError);
          }
        } catch (fallbackErr) {
          emailError = fallbackErr;
          console.error("[AdminCampaign] campaign-notify fallback exception:", fallbackErr);
        }
      }

      if (emailSuccess) {
        alert(`Status updated to ${status} and email sent!`);
      } else {
        alert(`Status updated to ${status}, but email failed. See console for details.`);
      }
    } else {
      alert("Status updated");
    }
    loadAllData();
  };

  const [newImg, setNewImg] = useState({ platform: "TikTok", url: "", title: "" });
  const handleAddImage = async () => {
    if (!newImg.url) return;
    await supabase.from("campaign_images").insert({ platform: newImg.platform, image_url: newImg.url, title: newImg.title });
    setNewImg({ platform: "TikTok", url: "", title: "" });
    loadAllData();
  };
  const handleDeleteImage = async (id) => {
    await supabase.from("campaign_images").delete().eq("id", id);
    loadAllData();
  };

  const [newWinner, setNewWinner] = useState({ name: "", prize: "", platform: "TikTok", show: true });
  const handleAddWinner = async () => {
    if (!newWinner.name || !newWinner.prize) return;
    await supabase.from("campaign_winners").insert({ name: newWinner.name, prize_amount: parseInt(newWinner.prize), platform: newWinner.platform, show_on_ticker: newWinner.show, is_prebuilt: true });
    setNewWinner({ name: "", prize: "", platform: "TikTok", show: true });
    loadAllData();
  };
  const handleDeleteWinner = async (id) => {
    await supabase.from("campaign_winners").delete().eq("id", id);
    loadAllData();
  };

  const handleSaveCaption = async (id, text) => {
    await supabase.from("campaign_captions").upsert({ id, caption_template: text });
    alert("Caption saved!");
  };

  if (loading) return <div className="loading">Loading Admin Panel...</div>;
  if (!isAdmin) return null;

  const filteredSubs = submissions.filter(s => {
    if (subFilterStatus !== "all" && s.status !== subFilterStatus) return false;
    if (subFilterPlatform !== "all" && s.platform !== subFilterPlatform) return false;
    return true;
  });

  return (
    <div className="page-wrapper">
      <style>{CSS}</style>
      <div className="admin-header">
        <h1>Admin Campaign Dashboard</h1>
      </div>
      <div className="container-admin">
        <div className="tabs">
          {["settings", "submissions", "images", "ticker", "captions"].map(t => (
            <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.toUpperCase()}
            </div>
          ))}
        </div>

        <div className="card">
          {activeTab === "settings" && (
            <div>
              <h2>Campaign Settings</h2>
              <div className="form-grid">
                <label>Title <input className="input" value={settings.title || ''} onChange={e => setSettings({...settings, title: e.target.value})} /></label>
                <label>Description <textarea className="input" value={settings.description || ''} onChange={e => setSettings({...settings, description: e.target.value})} /></label>
                <label>Prize Min (₨) <input type="number" className="input" value={settings.prize_min || 0} onChange={e => setSettings({...settings, prize_min: e.target.value})} /></label>
                <label>Prize Max (₨) <input type="number" className="input" value={settings.prize_max || 0} onChange={e => setSettings({...settings, prize_max: e.target.value})} /></label>
                <label>End Date <input type="date" className="input" value={settings.end_date || ''} onChange={e => setSettings({...settings, end_date: e.target.value})} /></label>
                <label className="checkbox-label"><input type="checkbox" checked={settings.is_active || false} onChange={e => setSettings({...settings, is_active: e.target.checked})} /> Is Active</label>
              </div>
              <div className="btn" onClick={handleSaveSettings}>Save Settings</div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div>
              <h2>Manage Submissions</h2>
              <div className="filters">
                <select className="input" value={subFilterStatus} onChange={e => setSubFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="winner">Winner</option>
                </select>
                <select className="input" value={subFilterPlatform} onChange={e => setSubFilterPlatform(e.target.value)}>
                  <option value="all">All Platforms</option>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Post</th>
                      <th>Payment</th>
                      <th>Status & Note</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.map(s => (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.users_profiles?.full_name || s.user_id || 'N/A'}</strong><br/>
                          <span style={{fontSize: '12px', color:'#6b7280'}}>{s.users_profiles?.email || 'No email available'}</span>
                        </td>
                        <td>
                          <span className="badge">{s.platform}</span> ({s.format})<br/>
                          <a href={s.post_link} target="_blank" className="link">Link</a>
                        </td>
                        <td>{s.payment_method}<br/>{s.account_number}<br/>{s.account_name}</td>
                        <td>
                          <select className="input input-sm" defaultValue={s.status} id={`status-${s.id}`}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="winner">Winner</option>
                          </select>
                          <input className="input input-sm" defaultValue={s.admin_note || ''} placeholder="Note" id={`note-${s.id}`} style={{marginTop: '5px'}} />
                        </td>
                        <td>
                          <div className="btn btn-sm" onClick={() => {
                            const stat = document.getElementById(`status-${s.id}`).value;
                            const note = document.getElementById(`note-${s.id}`).value;
                            handleUpdateSubmission(s.id, stat, note, s.users_profiles?.email, s.users_profiles?.full_name, s.platform);
                          }}>Update</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div>
              <h2>Image Assets</h2>
              <div className="add-box">
                <select className="input" value={newImg.platform} onChange={e => setNewImg({...newImg, platform: e.target.value})}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className="input" placeholder="Image URL" value={newImg.url} onChange={e => setNewImg({...newImg, url: e.target.value})} />
                <input className="input" placeholder="Title" value={newImg.title} onChange={e => setNewImg({...newImg, title: e.target.value})} />
                <div className="btn" onClick={handleAddImage}>Add Image</div>
              </div>
              <div className="img-admin-grid">
                {images.map(img => (
                  <div key={img.id} className="img-card">
                    <img src={img.image_url} alt={img.title}/>
                    <p style={{fontSize:'12px', margin:'5px 0'}}><strong>{img.platform}</strong></p>
                    <div className="btn-sm btn-del" onClick={() => handleDeleteImage(img.id)}>Delete</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ticker" && (
            <div>
              <h2>Ticker Winners Manager</h2>
              <p>Real winners are auto-added to the ticker. You can add pre-built ones here.</p>
              <div className="add-box">
                <input className="input" placeholder="Name" value={newWinner.name} onChange={e => setNewWinner({...newWinner, name: e.target.value})} />
                <input type="number" className="input" placeholder="Prize Amount" value={newWinner.prize} onChange={e => setNewWinner({...newWinner, prize: e.target.value})} />
                <select className="input" value={newWinner.platform} onChange={e => setNewWinner({...newWinner, platform: e.target.value})}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="btn" onClick={handleAddWinner}>Add to Ticker</div>
              </div>
              <table className="table">
                <thead><tr><th>Name</th><th>Prize</th><th>Platform</th><th>Type</th><th>Action</th></tr></thead>
                <tbody>
                  {winners.map(w => (
                    <tr key={w.id}>
                      <td>{w.name}</td><td>₨{w.prize_amount}</td><td>{w.platform}</td>
                      <td>{w.is_prebuilt ? 'Manual' : 'Real Winner'}</td>
                      <td><div className="btn-sm btn-del" onClick={() => handleDeleteWinner(w.id)}>Delete</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "captions" && (
            <div>
              <h2>Caption Templates</h2>
              <p>Use <strong>{'{refer_code}'}</strong> where you want the user's referral code to appear.</p>
              <div className="caps-list">
                {captions.map(c => (
                  <div key={c.id} className="cap-item" style={{marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
                    <h3 style={{textTransform:'uppercase', fontSize:'14px'}}>{c.id.replace('_', ' - ')}</h3>
                    <textarea className="input" style={{minHeight:'80px', marginBottom:'10px'}} id={`cap-${c.id}`} defaultValue={c.caption_template}></textarea>
                    <div className="btn btn-sm" onClick={() => handleSaveCaption(c.id, document.getElementById(`cap-${c.id}`).value)}>Save</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
:root { --primary: #3b82f6; --primary-dark: #1e3a8a; --bg: #f4f7f6; --surface: #ffffff; --text: #1f2937; }
* { box-sizing: border-box; }
.page-wrapper { font-family: 'Inter', sans-serif; background: var(--bg); min-height: 100vh; padding-bottom: 50px; color: var(--text); }
.admin-header { background: var(--primary-dark); color: white; padding: 20px; text-align: center; font-size: 20px; font-weight: bold; }
.container-admin { max-width: 1100px; margin: 20px auto; padding: 0 20px; }
.tabs { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; }
.tab { padding: 12px 20px; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; border: 1px solid #e2e8f0; white-space: nowrap; }
.tab.active { background: var(--primary); color: white; border-color: var(--primary); }
.card { background: var(--surface); border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 20px; }
label { font-weight: 600; font-size: 14px; display: flex; flex-direction: column; gap: 5px; }
.checkbox-label { flex-direction: row; align-items: center; gap: 10px; cursor: pointer; }
.input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; outline: none; font-family: inherit; font-size: 14px; background: #f9fafb; }
.input:focus { border-color: var(--primary); }
.input-sm { padding: 8px; font-size: 12px; }
.btn { display: inline-block; background: var(--primary); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; text-align: center; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-del { background: #ef4444; }
.filters { display: flex; gap: 15px; margin-bottom: 20px; }
.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 13px; vertical-align: top; }
.badge { background: #e5e7eb; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.link { color: var(--primary); text-decoration: none; font-weight: bold; }
.add-box { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
.add-box .input { flex: 1; min-width: 150px; }
.img-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; }
.img-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: white; text-align: center; }
.img-card img { width: 100%; height: 100px; object-fit: cover; border-radius: 4px; }
.loading { text-align: center; padding: 50px; font-size: 20px; font-weight: bold; color: var(--primary); }
`;