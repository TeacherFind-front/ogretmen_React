import { apiFetch } from "./api";

/**
 * Create a new booking request
 * @param {Object} bookingData - { teacherListingId, startTime, endTime, studentNote }
 */
export const createBooking = async (bookingData) => {
  const res = await apiFetch("/api/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Rezervasyon oluşturulamadı.");
  }

  return res.json();
};

/**
 * Get current user's bookings (as student or tutor)
 */
export const getMyBookings = async () => {
  const res = await apiFetch("/api/bookings/my");
  if (!res || !res.ok) throw new Error("Rezervasyonlar yüklenemedi.");
  return res.json();
};

/**
 * Cancel a booking
 * @param {string} bookingId 
 * @param {string} reason 
 */
export const cancelBooking = async (bookingId, reason) => {
  const res = await apiFetch(`/api/bookings/${bookingId}/cancel`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Rezervasyon iptal edilemedi.");
  }

  return res.json();
};

/**
 * Approve a booking request
 * @param {string} bookingId 
 */
export const approveBooking = async (bookingId) => {
  const res = await apiFetch(`/api/bookings/${bookingId}/approve`, {
    method: "PUT",
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Rezervasyon onaylanamadı.");
  }

  return res.json();
};

/**
 * Reject a booking request
 * @param {string} bookingId 
 * @param {string} reason 
 */
export const rejectBooking = async (bookingId, reason) => {
  const res = await apiFetch(`/api/bookings/${bookingId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ tutorNote: reason }),
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Rezervasyon reddedilemedi.");
  }

  return res.json();
};

/**
 * Complete a booking request
 * @param {string} bookingId 
 */
export const completeBooking = async (bookingId) => {
  const res = await apiFetch(`/api/bookings/${bookingId}/complete`, {
    method: "PUT",
  });

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(err.message || "Rezervasyon tamamlandı olarak işaretlenemedi.");
  }

  return res.json();
};
