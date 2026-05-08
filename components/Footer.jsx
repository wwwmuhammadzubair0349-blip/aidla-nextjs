"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Ensure this matches your Next.js path

// Import professional icons
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaTiktok, 
  FaInstagram, 
  FaWhatsappSquare 
} from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubscribe = async () => {
    const val = email.trim().toLowerCase();
    if (!val || !val.includes("@")) return;
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: val });
        
      if (error?.code === "23505") setStatus("exists");
      else if (error) setStatus("err");
      else { setStatus("ok"); setEmail(""); }
    } catch { 
      setStatus("err"); 
    }
    setTimeout(() => setStatus(null), 4000);
  };

  const pageLinks =[
    { label: "Home",          href: "/" },
    { label: "Blogs",         href: "/blogs" },
    { label: "News",          href: "/news" },
    { label: "FAQs",          href: "/faqs" },
    { label: "Leaderboard",   href: "/leaderboard" },
    { label: "About Us",      href: "/about" },
    { label: "Privacy Policy",href: "/privacy-policy" },
    { label: "Login",         href: "/login" },
    { label: "Sign Up",       href: "/signup" },
  ];

  const featureLinks =[
    { label: "Courses",      href: "/courses" },
    { label: "Leaderboard",  href: "/leaderboard" },
    { label: "Free Tools",   href: "/tools" },
    { label: "Resources",    href: "/resources" },
  ];

  const supportLinks =[
    { label: "Help & Support", href: "/contact" },
    { label: "Terms of Use",   href: "/terms" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Contact Us",     href: "/contact" },
  ];

  // Original CSS with Gold/Yellow colors restored
  // You can move this string back to a separate `footer.css` file if you prefer!
  const css = `
    :root {
      --ft-bg:       #0d1117;
      --ft-surface:  #13181f;
      --ft-border:   rgba(255,255,255,0.06);
      --ft-text:     rgba(255,255,255,0.75); 
      --ft-text-md:  rgba(255,255,255,0.85); 
      --ft-white:    #ffffff;
      --ft-gold:     #f59e0b;
      --ft-gold-dim: rgba(245,158,11,0.12);
    }

    .ft-root {
      background: var(--ft-bg);
      color: var(--ft-text);
      font-family: 'Mulish', system-ui, -apple-system, sans-serif;
      border-top: 1px solid var(--ft-border);
      margin-top: 0;
    }

    .ft-accent {
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, var(--ft-gold) 40%, #3b82f6 70%, transparent 100%);
    }

    .ft-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px 0;
    }

    /* ── Main grid: brand col + 3 link cols ── */
    .ft-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--ft-border);
    }

    /* Brand column */
    .ft-logo {
      font-family: 'Syne', system-ui, sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--ft-white);
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 10px;
    }

    /* 🟡 RESTORED ORIGINAL YELLOW BACKGROUND */
    .ft-logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, var(--ft-gold), #fcd34d);
      border-radius: 7px;
      font-size: 1.1rem;
    }

    .ft-logo-icon img {
      width: 34px;
      height: auto;
      max-height: 34px;
      object-fit: contain;
      display: block;
    }

    .ft-tagline {
      font-size: 0.85rem;
      line-height: 1.65;
      color: var(--ft-text);
      margin-bottom: 12px;
      max-width: 250px;
    }

    .ft-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--ft-gold);
      background: var(--ft-gold-dim);
      border: 1px solid rgba(245,158,11,0.18);
      padding: 3px 9px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 18px;
    }

    /* Newsletter */
    .ft-nl-label {
      font-family: 'Syne', system-ui, sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.75); 
      margin-bottom: 7px;
    }

    .ft-nl-row {
      display: flex;
      width: 100%;
      max-width: 360px;
    }

    .ft-nl-row input {
      flex: 1;
      background: var(--ft-surface);
      border: 1px solid rgba(255,255,255,0.2); 
      border-right: none;
      border-radius: 4px 0 0 4px;
      padding: 10px 12px;
      color: var(--ft-white);
      font-size: 0.85rem;
      outline: none;
      font-family: 'Mulish', sans-serif;
      transition: border-color 0.2s;
      min-width: 0;
    }

    .ft-nl-row input::placeholder { color: rgba(255,255,255,0.6); } 
    
    /* 🟡 RESTORED YELLOW BORDER FOCUS */
    .ft-nl-row input:focus { border-color: var(--ft-gold); }

    /* 🟡 RESTORED YELLOW BUTTON */
    .ft-nl-row button {
      background: var(--ft-gold);
      color: #0d1117;
      border: none;
      border-radius: 0 4px 4px 0;
      padding: 10px 14px;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      font-family: 'Syne', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      transition: background 0.2s;
      white-space: nowrap;
    }

    .ft-nl-row button:hover { background: #fcd34d; }
    .ft-nl-ok   { font-size: 0.85rem; color: #6ee7b7; font-weight: 700; }
    .ft-nl-note { font-size: 0.8rem; color: var(--ft-text); margin-top: 4px; }
    .ft-nl-err  { color: #f87171; }

    /* ── Link column headings ── */
    .ft-col-h {
      font-family: 'Syne', system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--ft-white);
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--ft-gold); /* 🟡 RESTORED YELLOW BORDER */
      display: inline-block;
    }

    .ft-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }

    .ft-col ul li a {
      color: var(--ft-text-md);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 400;
      padding: 8px 0; 
      transition: color 0.18s, padding-left 0.18s;
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .ft-col ul li a::before {
      content: '';
      display: inline-block;
      width: 5px;
      height: 5px;
      border: 1px solid rgba(245,158,11,0.5); /* 🟡 RESTORED YELLOW ACCENT DOT */
      border-radius: 1px;
      flex-shrink: 0;
      transition: background 0.18s, border-color 0.18s;
    }

    /* 🟡 RESTORED YELLOW HOVER */
    .ft-col ul li a:hover {
      color: var(--ft-gold);
      padding-left: 3px;
    }

    .ft-col ul li a:hover::before {
      background: var(--ft-gold);
      border-color: var(--ft-gold);
    }

    /* Socials */
    .ft-socials-h {
      font-family: 'Syne', system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--ft-white);
      margin: 20px 0 10px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--ft-gold); /* 🟡 RESTORED YELLOW */
      display: inline-block;
    }

    .ft-socials {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ft-socials a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px; 
      height: 44px;
      background: var(--ft-surface);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      font-size: 1.1rem;
      color: var(--ft-white);
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s, color 0.2s;
    }

    /* 🟡 RESTORED YELLOW HOVER STATE */
    .ft-socials a:hover {
      border-color: var(--ft-gold);
      background: var(--ft-gold-dim);
    }

    /* ── Bottom bar ── */
    .ft-bottom {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
      font-size: 0.75rem;
      color: var(--ft-text); 
    }

    .ft-bottom strong { color: var(--ft-gold); } /* 🟡 RESTORED YELLOW */

    .ft-bottom-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
    }

    .ft-bottom-links a {
      color: var(--ft-text);
      text-decoration: none;
      font-size: 0.75rem;
      padding: 12px 14px; 
      transition: color 0.2s;
      border-right: 1px solid rgba(255,255,255,0.15);
    }

    .ft-bottom-links a:first-child { padding-left: 0; }
    .ft-bottom-links a:last-child  { border-right: none; }
    .ft-bottom-links a:hover       { color: var(--ft-gold); } /* 🟡 RESTORED YELLOW */

    /* ── Desktop ── */
    @media (min-width: 768px) {
      .ft-inner { padding: 44px 40px 0; }

      .ft-grid {
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 48px;
      }

      .ft-bottom {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    @media (min-width: 480px) and (max-width: 767px) {
      .ft-grid {
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .ft-brand { grid-column: 1 / -1; }
    }

    @media (max-width: 480px) {
      .ft-bottom {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .ft-bottom-links {
        justify-content: center;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      

      <footer className="ft-root">
        <div className="ft-accent" aria-hidden="true" />
        <div className="ft-inner">

          {/* Main grid */}
          <div className="ft-grid">

            {/* Brand column */}
            <div className="ft-brand">
              <div className="ft-logo">
                <span className="ft-logo-icon">
                  {/* Changed standard img to pull from Next.js public folder */}
                  <img src="/logo.webp" alt="AIDLA Logo" width="34" height="34" loading="lazy" decoding="async" />
                </span>
                AIDLA
              </div>
              <p className="ft-tagline">
                Pakistan's #1 education platform. Learn, earn coins &amp; win real prizes.
              </p>
              <div className="ft-badge">🇵🇰 Made in Pakistan</div>

              <div className="ft-nl-label">Newsletter</div>
              {status === "ok" ? (
                <div className="ft-nl-ok" role="alert">✅ Subscribed successfully!</div>
              ) : (
                <div className="ft-nl-row">
                  <input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                    aria-label="Email for newsletter"
                    autoComplete="email"
                    suppressHydrationWarning
                  />
                  <button onClick={handleSubscribe} aria-label="Subscribe to newsletter" suppressHydrationWarning>Subscribe</button>
                </div>
              )}
              {status === "exists" && <p className="ft-nl-note" role="alert">Already subscribed.</p>}
              {status === "err"    && <p className="ft-nl-note ft-nl-err" role="alert">Something went wrong.</p>}
            </div>

            {/* Pages column */}
            <nav className="ft-col" aria-label="Footer Pages">
              <div className="ft-col-h">Pages</div>
              <ul>
                {pageLinks.map(l => (
                  <li key={`${l.href}-${l.label}`}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Features column */}
            <nav className="ft-col" aria-label="Footer Features">
              <div className="ft-col-h">Features</div>
              <ul>
                {featureLinks.map(l => (
                  <li key={`${l.href}-${l.label}`}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>

              <div className="ft-socials-h">Follow Us</div>
              <div className="ft-socials">
                <a href="https://www.facebook.com/profile.php?id=61586195563121" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Follow us on Facebook">
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="Follow us on X (Twitter)">
                  <FaTwitter />
                </a>
                <a href="https://www.linkedin.com/company/aidla" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="Follow us on LinkedIn">
                  <FaLinkedinIn />
                </a>
                <a href="https://www.tiktok.com/@aidla_official" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="Follow us on TikTok">
                  <FaTiktok />
                </a>
                <a href="https://www.instagram.com/aidla_official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Follow us on Instagram">
                  <FaInstagram />
                </a>
                <a href="https://whatsapp.com/channel/0029VbC6yju0rGiV5JaCqj42" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="Join our WhatsApp Channel">
                  <FaWhatsappSquare />
                </a>
              </div>
            </nav>

            {/* Support column */}
            <nav className="ft-col" aria-label="Footer Support">
              <div className="ft-col-h">Support</div>
              <ul>
                {supportLinks.map(l => (
                  <li key={`${l.href}-${l.label}`}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

          </div>

          {/* Bottom bar */}
          <div className="ft-bottom">
            <span>© {new Date().getFullYear()} <strong>AIDLA</strong>. All Rights Reserved. Made with ❤️ in Pakistan.</span>
            <div className="ft-bottom-links">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms &amp; Conditions</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}