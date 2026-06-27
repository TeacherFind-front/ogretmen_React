/**
 * React Helper Utilities
 */

/**
 * HTML içerikli metinleri düz metne (plain text) çevirir.
 * @param {string} value - Temizlenecek HTML string
 * @returns {string} - Temizlenmiş düz metin
 */
export function toPlainText(value = "") {
  const doc = new DOMParser().parseFromString(value || "", "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

/**
 * Göreli medya/resim URL'lerini tam mutlak URL'ye dönüştürür.
 * @param {string} url - Medya yolu veya URL'si
 * @returns {string} - Tam mutlak URL
 */
export function resolveMediaUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.ozeldersvip.com";

  return `${apiBaseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}
