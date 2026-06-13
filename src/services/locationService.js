import { apiFetch } from "./api";

/**
 * Konum servisi
 *
 * GET /api/locations/cities                         → Şehirler
 * GET /api/locations/districts?cityId={id}          → İlçeler
 * GET /api/locations/neighborhoods?districtId={id}  → Mahalleler
 * GET /api/categories                               → Ders kategorileri
 */

/**
 * Şehirleri getir
 * @returns {Array<{ id, name, plateCode }>}
 */
export async function getCities() {
  const res = await apiFetch("/api/locations/cities");
  if (!res || !res.ok) return [];
  const json = await res.json();
  return extractData(json) || [];
}

/**
 * İlçeleri getir
 * @param {string} cityId
 * @returns {Array<{ id, name, code }>}
 */
export async function getDistricts(cityId) {
  const res = await apiFetch(`/api/locations/districts?cityId=${cityId}`);
  if (!res || !res.ok) return [];
  const json = await res.json();
  return extractData(json) || [];
}

/**
 * Mahalleleri getir
 * @param {string} districtId
 * @returns {Array<{ id, name, code }>}
 */
export async function getNeighborhoods(districtId) {
  const res = await apiFetch(
    `/api/locations/neighborhoods?districtId=${districtId}`
  );
  if (!res || !res.ok) return [];
  const json = await res.json();
  return extractData(json) || [];
}

/**
 * Yanıttan veriyi ayıkla (Dizi veya $values sarmallı dizi)
 */
function extractData(json) {
  if (!json) return null;
  if (Array.isArray(json)) return json;
  if (json.$values && Array.isArray(json.$values)) return json.$values;
  if (json.data) return extractData(json.data);
  return null;
}

// API'den veri gelmezse kullanılacak yedek listeler
const FALLBACK_CATEGORIES = [
  {
    category: "Dil Eğitimi",
    subjects: [
      { id: "s1", name: "İngilizce" },
      { id: "s2", name: "Almanca" },
      { id: "s3", name: "Fransızca" },
      { id: "s4", name: "İspanyolca" },
      { id: "s5", name: "Arapça" }
    ]
  },
  {
    category: "Sınav Hazırlık",
    subjects: [
      { id: "s6", name: "TYT Matematik" },
      { id: "s7", name: "AYT Matematik" },
      { id: "s8", name: "LGS Matematik" },
      { id: "s9", name: "YKS Fizik" }
    ]
  },
  {
    category: "Müzik & Sanat",
    subjects: [
      { id: "s10", name: "Piyano" },
      { id: "s11", name: "Gitar" },
      { id: "s12", name: "Keman" },
      { id: "s13", name: "Şan Eğitimi" }
    ]
  },
  {
    category: "Yazılım & Bilişim",
    subjects: [
      { id: "s14", name: "Python" },
      { id: "s15", name: "React" },
      { id: "s16", name: "Java" },
      { id: "s17", name: "Mobil Geliştirme" }
    ]
  }
];

/**
 * Ders kategorilerini getir
 * @returns {Array<{ category, subjects: [{ id, name }] }>}
 */
export async function getCategories() {
  const endpoints = [
    "/api/categories",
    "/api/lookup/categories",
    "/api/subjects/categories"
  ];

  for (const path of endpoints) {
    try {
      const res = await apiFetch(path);
      if (res && res.ok) {
        const json = await res.json();
        const data = extractData(json);
        
        if (data && data.length > 0) {
          // Normalize keys (PascalCase to camelCase if needed)
          const normalizedData = data.map(cat => ({
            id: cat.id || cat.Id,
            category: cat.category || cat.Category,
            subjects: extractData(cat.subjects || cat.Subjects || []).map(sub => {
              const baseName = sub.name || sub.Name;
              const level = sub.level || sub.Level;
              return {
                id: sub.id || sub.Id,
                name: level ? `${baseName} (${level})` : baseName
              };
            })
          }));

          console.log(`Kategoriler ${path} üzerinden alındı:`, normalizedData.length, "adet");
          
          // İstenen özel sıralama
          const preferredOrder = ["türkçe", "matematik", "ingilizce", "fizik", "almanca"];
          
          const normalizeStr = (str) => (str || "").replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
          
          normalizedData.sort((a, b) => {
            const catA = normalizeStr(a.category);
            const catB = normalizeStr(b.category);
            
            const indexA = preferredOrder.findIndex(p => catA.includes(p));
            const indexB = preferredOrder.findIndex(p => catB.includes(p));
            
            if (indexA !== -1 && indexB !== -1) {
              if (indexA === indexB) return catA.localeCompare(catB, 'tr-TR');
              return indexA - indexB;
            }
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return catA.localeCompare(catB, 'tr-TR');
          });

          return normalizedData;
        }
      }
    } catch (err) {
      console.warn(`${path} denemesi başarısız:`, err.message);
    }
  }

  console.warn("Backend'den kategori verisi alınamadı veya boş döndü. Fallback listesi kullanılıyor.");
  return FALLBACK_CATEGORIES;
}
