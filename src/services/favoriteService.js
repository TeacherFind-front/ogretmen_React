import { apiFetch } from "./api";

/**
 * Favoriler servisi
 *
 * GET  /api/favorites         → Kullanıcının favori listesi
 * POST /api/favorites/toggle  → Favori ekle/çıkar
 */

/**
 * Kullanıcının favori öğretmenlerini getir
 * @returns {Array}
 */
export async function getMyFavorites() {
  const res = await apiFetch("/api/favorites");
  if (!res || !res.ok) return [];
  return res.json();
}

/**
 * Favori toggle (ekle veya çıkar)
 * @param {string} tutorId - TeacherListing.Id (UUID)
 * @returns {{ isFavorite: boolean, message: string }}
 */
export async function toggleFavorite(tutorId) {
  const res = await apiFetch("/api/favorites/toggle", {
    method: "POST",
    body: JSON.stringify({ TutorId: tutorId }),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Favori işlemi başarısız.");
  }

  return res.json(); // { isFavorite, message }
}
