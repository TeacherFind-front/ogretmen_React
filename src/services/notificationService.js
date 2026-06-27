import { apiFetch } from "./api";

/**
 * Bildirimleri getir
 */
export async function getNotifications() {
  try {
    const res = await apiFetch("/api/notifications");
    if (!res || !res.ok) {
      if (res?.status >= 500) {
        console.warn("Notifications API returned 500, failing silently to avoid UI crash.");
      }
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error("Notifications Fetch Error:", err);
    return [];
  }
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

/**
 * Tüm bildirimleri sil (Backend eklendiğinde çalışacak)
 */
export async function clearAllNotifications() {
  try {
    const res = await apiFetch("/api/notifications/clear", {
      method: "DELETE"
    });
    return res && res.ok;
  } catch (err) {
    console.error("Notifications Clear Error:", err);
    return false;
  }
}
