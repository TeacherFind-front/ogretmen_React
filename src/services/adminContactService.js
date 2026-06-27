import { apiFetch } from "./api";

/**
 * getContactMessages - Yönetici panelindeki iletişim/destek mesajlarını listeler.
 * @param {Object} query - Filtreleme parametreleri ({ status, search, page, pageSize })
 * @returns {Promise<Object>} API'den dönen mesajlar listesi ve sayfalama bilgisi
 */
export async function getContactMessages(query = {}) {
  const params = new URLSearchParams();
  // UI tarafındaki "Tümü" seçeneği tüm mesajları getirmek istediği için backend'e status parametresi göndermeyiz
  if (query.status && query.status !== "Tümü") {
    params.append("status", query.status);
  }
  if (query.search) params.append("search", query.search);
  if (query.page) params.append("page", query.page);
  if (query.pageSize) params.append("pageSize", query.pageSize);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/api/admin/contact-messages${queryString}`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Mesajlar yüklenemedi.");
  }
  return res.json();
}

/**
 * getContactMessageById - ID'si verilen tek bir iletişim mesajının detaylarını getirir.
 * @param {string} id - Mesajın benzersiz ID'si
 * @returns {Promise<Object>} Mesaj detayı
 */
export async function getContactMessageById(id) {
  const res = await apiFetch(`/api/admin/contact-messages/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Mesaj detayı yüklenemedi.");
  }
  return res.json();
}

/**
 * markContactMessageAsRead - Belirli bir iletişim mesajını okundu olarak işaretler.
 * @param {string} id - Mesajın benzersiz ID'si
 */
export async function markContactMessageAsRead(id) {
  const res = await apiFetch(`/api/admin/contact-messages/${id}/read`, {
    method: "PUT",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Mesaj okundu olarak işaretlenemedi.");
  }
  return res.json().catch(() => ({ success: true }));
}

/**
 * replyContactMessage - İletişim mesajına e-posta yoluyla cevap gönderir.
 * @param {string} id - Cevaplanacak mesajın ID'si
 * @param {string} replyMessage - Gönderilecek cevap metni
 */
export async function replyContactMessage(id, replyMessage) {
  const res = await apiFetch(`/api/admin/contact-messages/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ replyMessage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Cevap gönderilemedi.");
  }
  return res.json().catch(() => ({ success: true }));
}

/**
 * closeContactMessage - Çözümlenen destek/iletişim mesajını kapatır (arşivler).
 * @param {string} id - Mesajın benzersiz ID'si
 */
export async function closeContactMessage(id) {
  const res = await apiFetch(`/api/admin/contact-messages/${id}/close`, {
    method: "PUT",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Mesaj kapatılamadı.");
  }
  return res.json().catch(() => ({ success: true }));
}

/**
 * deleteContactMessage - İletişim mesajını kalıcı olarak siler.
 * @param {string} id - Silinecek mesajın ID'si
 */
export async function deleteContactMessage(id) {
  const res = await apiFetch(`/api/admin/contact-messages/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Mesaj silinemedi.");
  }
  return res.json().catch(() => ({ success: true }));
}

