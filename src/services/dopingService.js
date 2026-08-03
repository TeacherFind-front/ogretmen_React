import { apiFetch } from "./api";

/**
 * Doping paketlerinin ve aktif dopinglerin yönetimi için API servisi
 */
export const dopingService = {
  /**
   * Sistemdeki tüm kullanılabilir doping paketlerini getirir
   * Response: { demoMode: boolean, packages: DopingPackageDto[] }
   */
  async getPackages() {
    const response = await apiFetch("/api/dopings/packages");
    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Doping paketleri yüklenemedi.");
    }
    const data = await response.json();
    return {
      demoMode: !!data.demoMode,
      packages: data.packages || [],
    };
  },

  /**
   * Giriş yapmış eğitmenin aktif ve geçmiş dopinglerini getirir
   * Response: ActiveDopingDto[]
   */
  async getMyActiveDopings() {
    const response = await apiFetch("/api/tutor/dopings/my-active");
    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Aktif dopingler yüklenemedi.");
    }
    return (await response.json()) || [];
  },

  /**
   * Eğitmen için toplu doping satın alma / aktifleştirme işlemi başlatır
   * @param {Object} payload - { teacherListingId: string|null, items: [{ dopingType: number, optionCode: string }] }
   */
  async purchaseDopings(payload) {
    const requestBody = {
      teacherListingId: payload.teacherListingId || null,
      items: (payload.items || []).map((item) => ({
        dopingType: Number(item.dopingType),
        optionCode: String(item.optionCode),
      })),
    };

    const response = await apiFetch("/api/tutor/dopings/purchase", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response || !response.ok) {
      const errorData = await response?.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Doping aktifleştirme işlemi başarısız oldu."
      );
    }

    return await response.json();
  },

  /**
   * Eğitmen paneli için yeni admin yönetimli Doping Paket Kataloğunu getirir
   * GET /api/dopings/catalog (veya yedek olarak /api/dopings/packages)
   */
  async getDopingCatalog() {
    try {
      const response = await apiFetch("/api/dopings/catalog");
      if (response && response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Catalog endpoint henüz aktif değil, packages servisine düşülüyor:", e);
    }
    // Fallback
    return await this.getPackages();
  },

  /**
   * Yeni paket tabanlı tek tıkla satın alma
   * POST /api/tutor/dopings/purchase-package
   * Request Body: { packageId, teacherListingId }
   */
  async purchaseDopingPackage(payload) {
    const requestBody = {
      packageId: payload.packageId,
      teacherListingId: payload.teacherListingId || null,
    };

    const response = await apiFetch("/api/tutor/dopings/purchase-package", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response || !response.ok) {
      const errorData = await response?.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Paket satın alma işlemi başarısız oldu."
      );
    }

    return await response.json();
  },
};

export default dopingService;
