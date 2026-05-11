"use client";

import { useState } from "react";

const CARD_GRADIENTS = [
  "linear-gradient(160deg,#f59e0b 0%,#fcd34d 100%)",
  "linear-gradient(160deg,#1e293b 0%,#334155 100%)",
  "linear-gradient(160deg,#374151 0%,#6b7280 100%)",
];

function Stars({ rating }) {
  return (
    <div className="hp-reviews-featured-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true" className={i < rating ? "hp-star-filled" : "hp-star-empty"}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection({ reviews }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!reviews?.length) return null;

  const featured = reviews[activeIdx];
  const sideCards = reviews
    .map((r, i) => ({ ...r, origIdx: i }))
    .filter((_, i) => i !== activeIdx)
    .slice(0, 2);

  return (
    <section className="hp-reviews-section" aria-labelledby="proof-heading">
      <div className="hp-reviews-inner">
        <h2 id="proof-heading" className="hp-reviews-heading">Our Successful Learners Say</h2>

        <div className="hp-reviews-body">

          {/* LEFT — animated quote, re-mounts on activeIdx change */}
          <div className="hp-reviews-left" key={activeIdx}>
            <span className="hp-reviews-openquote" aria-hidden="true">❝</span>
            <p className="hp-reviews-featured-text">{featured.review_text}</p>
            <Stars rating={featured.rating} />
            <p className="hp-reviews-reviewer-name">— {featured.full_name}</p>
          </div>

          {/* RIGHT — portrait cards */}
          <div className="hp-reviews-right">

            {/* Main featured card — not a button */}
            <div
              className="hp-portrait-card hp-portrait-main"
              style={{ "--pc-bg": CARD_GRADIENTS[activeIdx % CARD_GRADIENTS.length] }}
              aria-label={`${featured.full_name} — featured`}
            >
              {featured.avatar_url
                ? <img src={featured.avatar_url} alt={featured.full_name} className="hp-portrait-img" loading="lazy" />
                : <span className="hp-portrait-initial">{featured.full_name?.[0]?.toUpperCase() || "L"}</span>
              }
              <div className="hp-portrait-badge-main">{featured.full_name?.split(" ")[0] || "Learner"}</div>
            </div>

            {/* Side cards — clickable buttons */}
            <div className="hp-portrait-side-stack">
              {sideCards.map((review) => (
                <button
                  key={review.id}
                  className="hp-portrait-card hp-portrait-side hp-portrait-btn"
                  style={{ "--pc-bg": CARD_GRADIENTS[review.origIdx % CARD_GRADIENTS.length] }}
                  onClick={() => setActiveIdx(review.origIdx)}
                  aria-label={`Show review by ${review.full_name}`}
                >
                  {review.avatar_url
                    ? <img src={review.avatar_url} alt={review.full_name} className="hp-portrait-img" loading="lazy" />
                    : <span className="hp-portrait-initial hp-portrait-initial--sm">
                        {review.full_name?.[0]?.toUpperCase() || "L"}
                      </span>
                  }
                  <div className="hp-portrait-badge-side">{review.full_name?.split(" ")[0] || "Learner"}</div>
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
