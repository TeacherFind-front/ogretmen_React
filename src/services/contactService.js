import { apiFetch } from "./api";

export async function sendContactMessage(data) {
  const res = await apiFetch("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Mesaj gönderilemedi.");
  }

  return res.json();
}

export async function getMySupportMessages() {
  const res = await apiFetch("/api/support/my-messages");
  if (!res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Destek talepleriniz yüklenemedi.");
  }
  return res.json();
}
