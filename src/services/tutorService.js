import { apiFetch } from "./api";

/**
 * Öğretmen / ilan servisi
 *
 * GET  /api/tutors           → Öğretmen listesi (filtreli, sayfalı)
 * GET  /api/tutors/{id}      → Öğretmen detayı
 * GET  /api/listings         → İlan listesi (filtreli)
 * GET  /api/listings/{id}    → İlan detayı
 * POST /api/listings         → İlan oluştur (auth)
 * PUT  /api/listings/{id}    → İlan güncelle (auth)
 * DELETE /api/listings/{id}  → İlan sil (auth)
 */

/**
 * Öğretmen listesini getir
 * @param {object} filters - { search, category, subjectId, cityId, districtId, minPrice, maxPrice, serviceType, page, pageSize, sort }
 * @returns {{ items, totalCount, page, pageSize }}
 */
export async function getTutors(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.subjectId) params.set("subjectId", filters.subjectId);
  if (filters.cityId) params.set("cityId", filters.cityId);
  if (filters.districtId) params.set("districtId", filters.districtId);
  if (filters.neighborhoodId)
    params.set("neighborhoodId", filters.neighborhoodId);
  if (filters.minPrice != null) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice != null) params.set("maxPrice", filters.maxPrice);
  if (filters.serviceType) params.set("serviceType", filters.serviceType);
  if (filters.sort) params.set("sort", filters.sort);

  params.set("page", filters.page || 1);
  params.set("pageSize", filters.pageSize || 12);

  const res = await apiFetch(`/api/tutors?${params.toString()}`);

  if (!res || !res.ok) throw new Error("Öğretmenler yüklenemedi.");

  return res.json(); // { items: TutorListItemDto[], totalCount, page, pageSize }
}

/**
 * Tek öğretmen detayını getir
 * @param {string} id - TeacherListing ID (UUID)
 * @returns {TutorDetailDto}
 */
export async function getTutorById(id) {
  const res = await apiFetch(`/api/tutors/${id}`);

  if (!res) return null;
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Öğretmen yüklenemedi.");

  return res.json();
}

/**
 * İlan oluştur (Tutor rolü gerekir)
 * @param {object} data - { title, description, category, subCategory, lessonDuration, price, cityId, serviceType }
 */
export async function createListing(data) {
  const res = await apiFetch("/api/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "İlan oluşturulamadı.");
  }

  return res.json();
}

/**
 * İlanları filtrele (eski Listings endpoint'i - admin/tutor için)
 * @param {object} filters
 */
export async function getListings(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice != null) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice != null) params.set("maxPrice", filters.maxPrice);
  if (filters.serviceType) params.set("serviceType", filters.serviceType);
  if (filters.onlyApproved != null)
    params.set("onlyApproved", filters.onlyApproved);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDirection) params.set("sortDirection", filters.sortDirection);

  params.set("page", filters.page || 1);
  params.set("pageSize", filters.pageSize || 10);

  const res = await apiFetch(`/api/listings?${params.toString()}`);

  if (!res || !res.ok) throw new Error("İlanlar yüklenemedi.");

  return res.json();
}

/**
 * Tek ilan detayı
 * @param {string} id
 */
export async function getListingById(id) {
  const res = await apiFetch(`/api/listings/${id}`);
  if (!res || !res.ok) return null;
  return res.json();
}

/**
 * ÖĞRETMEN ÖZEL SERVİSLERİ (Tutor Dashboard)
 */

/**
 * Giriş yapmış öğretmenin kendi ilanlarını getir
 */
export async function getMyListings() {
  const res = await apiFetch("/api/tutors/my-listings");
  if (!res || !res.ok) {
    if (res.status === 400) {
      const errorData = await res.json();
      console.error("Backend Doğrulama Hataları:", errorData.errors);

      // Detaylı hata mesajı oluştur
      let detailMsg = errorData.message || "İlan bilgileri doğrulanamadı.";
      if (errorData.errors) {
        const firstErrorKey = Object.keys(errorData.errors)[0];
        const firstErrorMsg = errorData.errors[firstErrorKey][0];
        detailMsg = `${firstErrorMsg}`;
      }

      throw {
        status: res.status,
        statusText: res.statusText,
        details: errorData,
        message: detailMsg,
      };
    }
    const err = await res?.json().catch(() => ({}));
    console.error("getMyListings Error:", {
      status: res.status,
      statusText: res.statusText,
      details: err,
    });
    throw new Error(err.message || "İlanlarınız yüklenemedi.");
  }
  return res.json();
}

/**
 * Yeni ilan oluştur (Tutor rolü)
 */
export async function createMyListing(data) {
  const res = await apiFetch("/api/tutors/my-listings", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res || !res.ok) {
    const errorData = await res?.json().catch(() => ({}));
    console.error("Backend Error Detail:", errorData); // Tüm hatayı yazdırıyoruz

    if (res.status === 400) {
      let detailMsg = errorData.message || "İlan bilgileri doğrulanamadı.";
      if (errorData.errors) {
        const firstErrorKey = Object.keys(errorData.errors)[0];
        const firstErrorMsg = errorData.errors[firstErrorKey][0];
        detailMsg = `${firstErrorMsg}`;
      }
      throw { status: 400, message: detailMsg, details: errorData };
    }

    throw new Error(errorData.message || "İlan oluşturulamadı.");
  }

  return res.json();
}

/**
 * İlan güncelle
 */
export async function updateMyListing(id, data) {
  const res = await apiFetch(`/api/tutors/my-listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    console.error("updateMyListing Error:", {
      status: res.status,
      statusText: res.statusText,
      details: err,
    });
    throw new Error(err.message || "İlan güncellenemedi.");
  }

  return res.json();
}

/**
 * İlan sil (ListingsController kullanıyor olabiliriz veya TutorsController'a eklenmeli)
 */
export async function deleteListing(id) {
  const res = await apiFetch(`/api/listings/${id}`, {
    method: "DELETE",
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "İlan silinemedi.");
  }

  return true;
}

/**
 * Öğretmenin rezervasyonlarını getir
 */
export async function getMyBookings() {
  const res = await apiFetch("/api/tutors/my-bookings");
  if (!res || !res.ok) throw new Error("Rezervasyonlar yüklenemedi.");
  return res.json();
}

/**
 * Rezervasyon onayla
 */
export async function approveBooking(id) {
  const res = await apiFetch(`/api/tutors/my-bookings/${id}/approve`, {
    method: "PUT",
  });
  if (!res || !res.ok) throw new Error("İşlem başarısız.");
  return res.json();
}

/**
 * Rezervasyon reddet
 */
export async function rejectBooking(id, reason) {
  const res = await apiFetch(`/api/tutors/my-bookings/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
  if (!res || !res.ok) throw new Error("İşlem başarısız.");
  return res.json();
}

/**
 * Rezervasyon tamamla
 */
export async function completeBooking(id) {
  const res = await apiFetch(`/api/tutors/my-bookings/${id}/complete`, {
    method: "PUT",
  });
  if (!res || !res.ok) throw new Error("İşlem başarısız.");
  return res.json();
}

/**
 * Profil bilgilerini getir
 */
export async function getMyProfile() {
  try {
    const res = await apiFetch("/api/tutors/profile");

    // Eğer 404 alırsak veya response başarısızsa fallback olarak auth/me'yi dene
    if (!res || !res.ok) {
      if (res?.status === 404) {
        console.warn(
          "Tutor profile endpoint not found (404), falling back to auth/me",
        );
        const authRes = await apiFetch("/api/auth/me");
        if (authRes && authRes.ok) return authRes.json();
      }
      throw new Error("Profil yüklenemedi.");
    }

    const json = await res.json();
    // Veri sarmalanmış olabilir (data veya $values içinde)
    if (json && json.data) return json.data;
    if (json && json.$values) return json.$values;

    return json;
  } catch (err) {
    console.error("getMyProfile error:", err);
    // Son çare auth/me
    try {
      const authRes = await apiFetch("/api/auth/me");
      if (authRes && authRes.ok) return authRes.json();
    } catch {}
    throw err;
  }
}

/**
 * Profil bilgilerini güncelle
 */
export async function updateMyProfile(data) {
  const res = await apiFetch("/api/tutors/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Profil güncellenemedi.");
  }

  return res.json();
}

/**
 * Sertifika yükle (Tutor rolü)
 * @param {string} name - Sertifika adı
 * @param {File} file - Sertifika dosyası
 */
export async function uploadCertificate(name, file) {
  const formData = new FormData();
  formData.append("Name", name || "Sertifika");
  formData.append("files", file); // Fotoğraf yüklemede kullanılan anahtar
  formData.append("file", file); // Standart tekil dosya anahtarı
  formData.append("Organization", "Özel Ders VIP");
  formData.append("Year", new Date().getFullYear().toString());

  const res = await apiFetch("/api/tutors/certificates", {
    method: "POST",
    body: formData,
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Sertifika yüklenemedi.");
  }

  return res.json();
}

/**
 * Öğretmenin öğrencilerini getir
 */
export async function getMyStudents() {
  const res = await apiFetch("/api/tutors/my-students");
  if (!res || !res.ok) throw new Error("Öğrenci listesi yüklenemedi.");
  return res.json();
}
/**
 * Profil resmi yükle
 * @param {File} file
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch("/api/tutors/avatar", {
    method: "POST",
    body: formData,
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Resim yüklenemedi.");
  }

  return res.json(); // { avatarUrl: string }
}

/**
 * İlana fotoğraf yükle (Tekli veya Çoklu)
 * @param {string} listingId
 * @param {File|File[]} files - Tek dosya veya dosya dizisi
 * @param {boolean} isMain - Sadece tek dosya gönderildiğinde anlamlıdır
 */
export async function uploadListingPhotos(listingId, files) {
  const formData = new FormData();

  // Backend [FromForm] IFormFileCollection files bekliyor.
  // Bu yüzden her dosyayı "files" anahtarıyla eklemeliyiz.
  if (Array.isArray(files)) {
    files.forEach((f) => {
      formData.append("files", f);
    });
  } else {
    formData.append("files", files);
  }

  const res = await apiFetch(`/api/tutors/my-listings/${listingId}/photos`, {
    method: "POST",
    body: formData,
  });

  if (!res || !res.ok) {
    const errorText = await res.text();
    console.error("Server Response:", errorText);
    throw new Error(
      "Sunucu fotoğrafı kabul etmedi (500). Lütfen backend loglarını veya klasör izinlerini kontrol edin.",
    );
  }

  return res.json();
}

/**
 * Müsaitlik takvimini güncelle (Profil bazlı)
 */
export async function updateAvailability(availability) {
  const res = await apiFetch("/api/tutors/profile/availability", {
    method: "PUT",
    body: JSON.stringify({ availability }),
  });
  if (!res || !res.ok) throw new Error("Müsaitlik bilgileri güncellenemedi.");
  return res.json();
}
