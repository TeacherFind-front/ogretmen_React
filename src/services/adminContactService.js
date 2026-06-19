import { apiFetch } from "./api";

export async function getContactMessages(query = {}) {
  const params = new URLSearchParams();
  if (query.status && query.status !== "Tümü") {
    // UI tarafındaki Tümü filtresini backend'e göndermiyoruz
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

export async function getContactMessageById(id) {
  const res = await apiFetch(`/api/admin/contact-messages/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Mesaj detayı yüklenemedi.");
  }
  return res.json();
}

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
