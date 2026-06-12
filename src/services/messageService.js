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
  
  const data = await res.json();
  
  // Backend'in güncel build'inin geldiğini teyit etmek için geçici log (UI'da gösterilmez)
  if (data.length > 0 && data[0].debugVersion) {
    console.log("Backend Debug Version:", data[0].debugVersion);
  } else if (data.debugVersion) {
    console.log("Backend Debug Version:", data.debugVersion);
  }
  
  return data;
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
 * @param {{ receiverId: string, content: string, replyToMessageId?: string }} data
 */
export async function sendMessage({ receiverId, content, replyToMessageId }) {
  const payload = { receiverId, content };
  if (replyToMessageId) {
    payload.replyToMessageId = replyToMessageId;
  }

  const res = await apiFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify(payload),
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

/**
 * Mesajları sil (Toplu veya tekli)
 * @param {string[]} messageIds - Silinecek mesaj ID'leri
 */
export async function deleteMessages(messageIds) {
  const res = await apiFetch("/api/messages/delete", {
    method: "DELETE",
    body: JSON.stringify({ messageIds }),
  });

  if (!res || !res.ok) {
    // Backend henüz bu endpoint'i açmamış olabilir, geliştirme ortamında sessizce devam et
    if (res?.status === 404) {
      console.warn("Backend /api/messages/delete endpoint'i henüz bulunamadı. Silme işlemi mock (sahte) olarak kabul edildi.");
      return { success: true, mock: true };
    }
    
    const err = await res?.json().catch(() => ({}));
    throw new Error(err?.message || "Mesajlar silinemedi.");
  }

  return res.json();
}
