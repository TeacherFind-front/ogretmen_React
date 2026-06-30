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

  // Env değişkeninden oku — deploy.yml branch'e göre doğru değeri yazar.
  // Hardcoded URL KULLANMA; staging ve production farklı API adreslerine sahip.
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "";

  if (!apiBaseUrl) return url;

  return `${apiBaseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}
