import { apiFetch } from "./api";

/**
 * Admin servisi
 * Tüm admin endpoint'leri burada toplanır.
 */

/**
 * Admin genel istatistiklerini ve özetini getir
 */
export async function getAdminDashboard() {
  const res = await apiFetch("/api/admin/dashboard");
  if (!res || !res.ok) throw new Error("Admin Dashboard yüklenemedi.");
  return res.json();
}

/**
 * Tüm kullanıcıları listele (filtreli)
 */
export async function getAdminUsers(query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.isActive !== undefined) params.set("isActive", query.isActive);
  params.set("page", query.page || 1);
  params.set("pageSize", query.pageSize || 10);

  const res = await apiFetch(`/api/admin/users?${params.toString()}`);
  if (!res || !res.ok) throw new Error("Kullanıcılar yüklenemedi.");

  const data = await res.json();
  return {
    items: (data.items || data.Items || []).map((item) => ({
      ...item,
      id: item.id || item.Id,
      fullName: item.fullName || item.FullName,
      email: item.email || item.Email,
      role: item.role || item.Role,
      isActive: item.isActive !== undefined ? item.isActive : item.IsActive,
      createdAt: item.createdAt || item.CreatedAt,
    })),
    totalCount: data.totalCount || data.TotalCount || 0,
  };
}

/**
 * Kullanıcı durumunu (aktif/pasif) güncelle
 */
export async function updateUserStatus(userId, isActive) {
  const res = await apiFetch(`/api/admin/users/${userId}/status`, {
    method: "POST",
    body: JSON.stringify({ isActive }),
  });
  if (!res || !res.ok) throw new Error("Durum güncellenemedi.");
  return res.json();
}

/**
 * Eğitmen ilanlarını listele
 */
export async function getAdminListings(query = {}) {
  try {
    const params = new URLSearchParams();
    params.set("page", query.page || 1);
    params.set("pageSize", query.pageSize || 20);

    // Backend specifically has a "pending" endpoint
    const url =
      query.status === "PendingApproval"
        ? `/api/admin/listings/pending?${params.toString()}`
        : `/api/admin/listings?${params.toString()}`;

    const res = await apiFetch(url);

    if (!res || !res.ok) {
      const errorData = res ? await res.json().catch(() => ({})) : {};
      console.error(`Admin API Hatası (${res?.status}):`, errorData);
      throw new Error(
        errorData.message || "İlanlar yüklenirken bir hata oluştu.",
      );
    }

    const data = await res.json();
    console.log(`Admin Listesi Yanıtı (${url}):`, data);

    // Backend'den gelen veri yapısını (Items/$values/items) kontrol et
    const rawItems = data.items || data.Items || [];
    const itemsArray = Array.isArray(rawItems)
      ? rawItems
      : rawItems.$values || [];

    return {
      items: itemsArray.map((item) => ({
        ...item,
        id: item.id || item.Id,
        title: item.title || item.Title,
        description: item.description || item.Description,
        category: item.category || item.Category,
        price: item.price || item.Price,
        createdAt: item.createdAt || item.CreatedAt,
        // Backend'den gelen TeacherName -> tutorName eşlemesi
        tutorName: item.tutorName || item.TeacherName || "Eğitmen",
        tutorEmail: item.tutorEmail || item.TeacherEmail,
      })),
      totalCount: data.totalCount || data.TotalCount || 0,
    };
  } catch (e) {
    console.error("getAdminListings hatası:", e);
    throw e; // Hatayı yukarı fırlat ki UI'da toast mesajı görünsün
  }
}

/**
 * Tekil ilan detayını admin yetkisiyle getir
 */
export async function getAdminListingDetail(listingId) {
  const res = await apiFetch(`/api/admin/listings/${listingId}`);
  if (!res || !res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "İlan detayı yüklenemedi.");
  }
  return res.json();
}

/**
 * İlanı onayla veya reddet
 */
export async function approveListing(
  listingId,
  isApproved,
  reason = "Uygun görülmedi.",
) {
  const endpoint = isApproved ? "approve" : "reject";
  const options = {
    method: "POST",
  };

  if (!isApproved) {
    options.body = JSON.stringify({ reason });
  }

  const res = await apiFetch(
    `/api/admin/listings/${listingId}/${endpoint}`,
    options,
  );

  if (!res || !res.ok) {
    const err = res ? await res.json().catch(() => ({})) : {};
    throw new Error(err.message || "İşlem sırasında bir hata oluştu.");
  }

  // Bazı durumlarda backend boş gövde (200 OK) dönebilir.
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

/**
 * Kullanıcıyı Admin yap
 */
export async function makeAdmin(userId) {
  const res = await apiFetch(`/api/admin/users/${userId}/make-admin`, {
    method: "POST",
  });
  if (!res || !res.ok) throw new Error("Yönetici yetkisi verilemedi.");
  return res.json();
}

/**
 * Site genel ayarlarını getir
 */
export async function getAdminSettings() {
  const res = await apiFetch("/api/admin/settings");
  if (!res || !res.ok) throw new Error("Ayarlar yüklenemedi.");
  return res.json();
}

/**
 * Dashboard analitik metriklerini getir (Doluluk oranı, onay hızı vb.)
 */
export async function getAdminMetrics() {
  const res = await apiFetch("/api/admin/settings/metrics");
  if (!res || !res.ok) throw new Error("Metrikler yüklenemedi.");
  return res.json();
}

/**
 * Platformdaki son aktiviteleri getir (Yeni kayıtlar, ilanlar, şikayetler)
 */
export async function getRecentActivities() {
  const res = await apiFetch("/api/admin/settings/recent-activities");
  if (!res || !res.ok) throw new Error("Aktiviteler yüklenemedi.");
  return res.json();
}

/**
 * Dashboard raporunu CSV olarak indir
 */
export async function exportDashboardReport() {
  const res = await apiFetch("/api/admin/settings/export?format=csv");
  if (!res || !res.ok) throw new Error("Rapor indirilemedi.");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `teacherfind-report-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Site genel ayarlarını güncelle
 */
export async function updateAdminSettings(settings) {
  const res = await apiFetch("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  if (!res || !res.ok) throw new Error("Ayarlar güncellenemedi.");
  return res.json();
}
