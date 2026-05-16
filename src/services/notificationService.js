import { apiFetch } from "./api";

/**
 * Bildirimleri getir
 */
export async function getNotifications() {
  const res = await apiFetch("/api/notifications");
  if (!res || !res.ok) throw new Error("Bildirimler yüklenemedi.");
  return res.json(); // [{ id, type, title, message, senderName, link, isRead, createdAt }]
}

/**
 * Bildirimi okundu olarak işaretle
 * @param {string} id 
 */
export async function markAsRead(id) {
  const res = await apiFetch(`/api/notifications/${id}/read`, {
    method: "PUT"
  });
  return res && res.ok;
}

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export async function markAllAsRead() {
  const res = await apiFetch("/api/notifications/read-all", {
    method: "PUT"
  });
  return res && res.ok;
}
