import { apiFetch } from "./api";

/**
 * Doping paketlerinin ve aktif dopinglerin yönetimi için API servisi
 */
export const dopingService = {
  /**
   * Sistemdeki tüm kullanılabilir doping paketlerini getirir
   */
  async getPackages() {
    try {
      const response = await apiFetch("/api/dopings/packages");
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      console.warn("Backend doping servisi henüz tanımlanmamış olabilir:", err);
      return null;
    }
  },

  /**
   * Giriş yapmış eğitmenin aktif ve geçmiş dopinglerini getirir
   */
  async getMyActiveDopings() {
    try {
      const response = await apiFetch("/api/tutor/dopings/my-active");
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (err) {
      console.warn("Aktif dopingler çekilemedi:", err);
      return [];
    }
  },

  /**
   * Eğitmen için doping satın alma işlemi başlatır / tamamlar
   * @param {Object} purchaseData - { listingId, dopingId, durationOption, paymentInfo }
   */
  async purchaseDoping(purchaseData) {
    try {
      const response = await apiFetch("/api/tutor/dopings/purchase", {
        method: "POST",
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Doping satın alma işlemi başarısız oldu.");
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  },
};

export default dopingService;
