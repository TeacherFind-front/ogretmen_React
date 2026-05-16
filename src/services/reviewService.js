import { apiFetch } from "./api";

/**
 * Yorum (Review) servisi
 *
 * GET  /api/reviews/{listingId}          → İlana ait yorumlar
 * POST /api/reviews/{listingId}          → Yorum ekle
 * GET  /api/reviews/{listingId}/average  → Ortalama puan
 */

/**
 * Belirli bir ilana ait yorumları getir
 * @param {string} listingId
 */
export async function getReviews(listingId) {
  const res = await apiFetch(`/api/reviews/${listingId}`);
  if (!res || !res.ok) return [];
  return res.json();
}

/**
 * Yorum ekle (giriş yapılmış kullanıcı)
 * @param {string} listingId
 * @param {{ rating: number, comment: string }} data
 */
export async function addReview(listingId, { rating, comment }) {
  const res = await apiFetch(`/api/reviews/${listingId}`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Yorum eklenemedi.");
  }

  return res.json();
}

/**
 * Ortalama puanı getir
 * @param {string} listingId
 * @returns {number}
 */
export async function getAverageRating(listingId) {
  const res = await apiFetch(`/api/reviews/${listingId}/average`);
  if (!res || !res.ok) return 0;
  return res.json();
}
