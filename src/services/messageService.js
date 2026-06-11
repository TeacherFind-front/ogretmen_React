import { apiFetch } from "./api";

/**
 * Mesajlaşma servisi
 *
 * GET  /api/messages/conversations  → Tüm konuşmalar
 * GET  /api/messages/{userId}        → Belirli kullanıcı ile mesajlar
 * POST /api/messages                 → Mesaj gönder
 */

/**
 * Kullanıcının tüm konuşmalarını getir
 */
export async function getConversations() {
  const res = await apiFetch("/api/messages/conversations");
  if (!res || !res.ok) return [];
  return res.json();
}

/**
 * Belirli bir kullanıcı ile olan mesajları getir
 * @param {string} userId - Diğer kullanıcının UUID'si
 */
export async function getMessages(userId) {
  const res = await apiFetch(`/api/messages/${userId}`);
  if (!res || !res.ok) return [];
  return res.json();
}

/**
 * Mesaj gönder
 * @param {{ receiverId: string, content: string }} data
 */
export async function sendMessage({ receiverId, content }) {
  const res = await apiFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify({ receiverId, content }),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    if (err.inner && import.meta.env.DEV) {
      console.error("SendMessage API Error Detail:", err.inner);
    }
    throw new Error(err.message || "Mesaj gönderilemedi.");
  }

  return res.json();
}
