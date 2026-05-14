// Fetches real aggregate rating from user_reviews (is_approved = true).
// Returns a schema.org AggregateRating object, or null if no approved reviews.

import { serverFetch } from "./supabaseServer";

const SITE_URL = "https://www.aidla.online";

/**
 * @param {{ revalidate?: number }} opts
 * @returns {Promise<{ aggregateRating: object | null, reviews: object[] }>}
 */
export async function fetchReviews({ revalidate = 3600 } = {}) {
  const { data, error } = await serverFetch(
    "user_reviews",
    {
      select: "id,full_name,rating,review_text,created_at,avatar_url",
      "is_approved": "eq.true",
      order: "created_at.desc",
    },
    { revalidate }
  );

  if (error || !data || data.length === 0) return { aggregateRating: null, reviews: [] };

  const total = data.reduce((sum, r) => sum + r.rating, 0);
  const avg = (total / data.length).toFixed(1);

  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: avg,
    reviewCount: data.length,
    bestRating: "5",
    worstRating: "1",
  };

  const reviews = data.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.full_name },
    reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
    reviewBody: r.review_text,
    datePublished: r.created_at ? r.created_at.slice(0, 10) : undefined,
  }));

  return { aggregateRating, reviews };
}
