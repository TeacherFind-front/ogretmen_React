import { apiFetch } from "./api";

/**
 * Şikayet oluştur
 * @param {Object} data - { targetUserId, reason, details }
 * @returns {Promise<{message: string}>}
 */
export async function createReport(data) {
  const res = await apiFetch("/api/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Şikayet oluşturulamadı.");
  }

  return res.json();
}
