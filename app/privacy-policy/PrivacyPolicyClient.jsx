"use client";

import React from "react";
import { motion } from "framer-motion";

import styles from "./privacy.module.css";

// You can set this dynamically from a CMS or environment variable
const LAST_UPDATED = "March 17, 2026";

const CANONICAL_URL = "https://www.aidla.online/privacy-policy";

const sections = [
  { n: 1, title: "Introduction", body: "Welcome to AIDLA. Your privacy is important to us. This Privacy Policy explains how AIDLA collects, uses, and protects your information when you use our website and services." },
  { n: 2, title: "Information We Collect", list: ["Name and email address during signup", "Account activity and learning progress", "Device information and IP address", "Cookies and usage analytics"] },
  { n: 3, title: "How We Use Your Information", body: "We use collected data to provide learning services, improve user experience, manage accounts, prevent fraud, and develop new features." },
  { n: 4, title: "Cookies", body: "AIDLA uses cookies to enhance user experience and analyze website traffic. You can disable cookies through your browser settings at any time." },
  { n: 5, title: "Data Sharing", body: "We do not sell user data. Information may be shared with trusted service providers such as authentication, hosting, or analytics partners." },
  { n: 6, title: "Data Security", body: "We implement industry-standard security measures including encryption, secure servers, and access control to protect user data." },
  { n: 7, title: "User Rights", body: "Users may request access, correction, or deletion of their personal data by contacting us at any time." },
  { n: 8, title: "Third-Party Links", body: "Our website may contain external links. AIDLA is not responsible for the privacy practices of third-party websites." },
  { n: 9, title: "Changes to Policy", body: "We may update this Privacy Policy periodically. Continued use of the platform constitutes acceptance of any updates." },
  { n: 10, title: "Contact Us", email: true },
];

// JSON-LD structured data for a WebPage
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "AIDLA Privacy Policy",
  "description": "Learn how AIDLA collects, uses, and protects your personal information.",
  "url": CANONICAL_URL,
  "lastReviewed": LAST_UPDATED,
  "inLanguage": "en",
  "isPartOf": {
    "@type": "WebSite",
    "name": "AIDLA",
    "url": "https://www.aidla.online"
  }
};

export default function PrivacyPolicyClient() {
  return (
    <>
      <div className={styles.ppRoot}>
        <div className={styles.bgOrbs}>
          <div className={styles.bgOrb1} />
          <div className={styles.bgOrb2} />
        </div>

        <div className={styles.ppWrap}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className={styles.ppBadge}>Legal</span>
            <h1 className={styles.ppTitle}>
              Privacy <span className={styles.ppTitleAccent}>Policy</span>
            </h1>
            <p className={styles.ppMeta}>Last Updated: {LAST_UPDATED}</p>
          </motion.div>

          <motion.div
            className={styles.ppCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {sections.map((s, i) => (
              <motion.div
                key={s.n}
                className={styles.ppSec}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <div className={styles.ppSecHead}>
                  <div className={styles.ppNum}>{s.n}</div>
                  <div className={styles.ppSecTitle}>{s.title}</div>
                </div>
                {s.body && <p>{s.body}</p>}
                {s.list && (
                  <ul className={styles.ppList}>
                    {s.list.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
                {s.email && (
                  <a className={styles.ppEmailLink} href="mailto:support@aidla.online">
                    support@aidla.online
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}