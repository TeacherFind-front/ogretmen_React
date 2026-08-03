import { apiFetch } from "./api";

/**
 * Admin Doping Paket Yönetimi API Servisi
 */
export const adminDopingPackageService = {
  /**
   * Admin doping paketlerini listeler (arama, filtreleme, sayfalama)
   * @param {Object} params - { search, isActive, packageType, page, pageSize }
   */
  async getPackages(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const response = await apiFetch(`/api/admin/doping-packages?${query.toString()}`);
    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Doping paketleri listelenemedi.");
    }
    return await response.json();
  },

  /**
   * Tek bir doping paketinin detayını getirir
   * @param {string} id - Doping paketi ID
   */
  async getPackageById(id) {
    const response = await apiFetch(`/api/admin/doping-packages/${id}`);
    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Doping paketi detayı alınamadı.");
    }
    return await response.json();
  },

  /**
   * Yeni doping paketi oluşturur
   * @param {Object} data - Paket verisi
   */
  async createPackage(data) {
    const response = await apiFetch("/api/admin/doping-packages", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Doping paketi oluşturulamadı.");
    }
    return await response.json();
  },

  /**
   * Var olan doping paketini günceller
   * @param {string} id
   * @param {Object} data
   */
  async updatePackage(id, data) {
    const response = await apiFetch(`/api/admin/doping-packages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Doping paketi güncellenemedi.");
    }
    return await response.json();
  },

  /**
   * Paketin aktif/pasif durumunu değiştirir
   * @param {string} id
   * @param {boolean} isActive
   */
  async updatePackageStatus(id, isActive) {
    const response = await apiFetch(`/api/admin/doping-packages/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });

    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Paket durumu güncellenemedi.");
    }
    return await response.json();
  },

  /**
   * Var olan paketi kopyalayarak yeni bir paket taslağı oluşturur
   * @param {string} id
   * @param {Object} payload - { code, name }
   */
  async duplicatePackage(id, payload) {
    const response = await apiFetch(`/api/admin/doping-packages/${id}/duplicate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response || !response.ok) {
      const errData = await response?.json().catch(() => ({}));
      throw new Error(errData.message || "Paket kopyalanamadı.");
    }
    return await response.json();
  },

  /**
   * Paket içinde tanımlanabilecek teknik Doping Özelliklerini getirir
   */
  async getFeatures() {
    try {
      const response = await apiFetch("/api/admin/doping-packages/features");
      if (response && response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      console.warn("Features endpoint çağrılamadı:", err);
      return null;
    }
  },
};

export default adminDopingPackageService;
