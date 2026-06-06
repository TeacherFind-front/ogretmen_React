import { apiFetch } from "./api";

// API'den veri gelmezse kullanılacak yedek listeler
// Kullanıcı isteği üzerine boşaltıldı
const FALLBACK_UNIVERSITIES = [];

const FALLBACK_DEPARTMENTS = [];

/**
 * Yanıttan veriyi ayıkla (Dizi veya $values sarmallı dizi)
 */
function extractData(json) {
  if (Array.isArray(json)) return json;
  if (json && json.$values && Array.isArray(json.$values)) return json.$values;
  if (json && json.data && Array.isArray(json.data)) {
    const d = json.data;
    if (Array.isArray(d)) return d;
    if (d.$values && Array.isArray(d.$values)) return d.$values;
    return d;
  }
  if (json && json.result && Array.isArray(json.result)) return json.result;
  return null;
}

/**
 * Üniversite listesini getir
 */
export async function getUniversities() {
  const path = "/api/education/universities"; // Backend projesindeki gerçek adres
  try {
    const res = await apiFetch(path);
    if (res && res.ok) {
      const json = await res.json();
      const data = extractData(json);
      if (data && data.length > 0) return data;
    }
  } catch (err) {
    console.error("Üniversite listesi çekilemedi:", err);
  }
  return FALLBACK_UNIVERSITIES;
}

/**
 * Belirli bir üniversiteye ait bölümleri getir
 * @param {string} universityId 
 */
export async function getDepartments(universityId) {
  if (!universityId) return [];

  const path = `/api/education/departments?universityId=${universityId}`; // Backend projesindeki gerçek adres
  try {
    const res = await apiFetch(path);
    if (res && res.ok) {
      const json = await res.json();
      const data = extractData(json);
      if (data && data.length > 0) return data;
    }
  } catch (err) {
    console.error("Bölüm listesi çekilemedi:", err);
  }
  return FALLBACK_DEPARTMENTS;
}
