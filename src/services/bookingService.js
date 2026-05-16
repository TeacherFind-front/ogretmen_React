import api from "./api";

/**
 * Create a new booking request
 * @param {Object} bookingData - { teacherListingId, startTime, endTime, studentNote }
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get current user's bookings (as student or tutor)
 */
export const getMyBookings = async () => {
  try {
    const response = await api.get("/bookings/my");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Cancel a booking
 * @param {string} bookingId 
 * @param {string} reason 
 */
export const cancelBooking = async (bookingId, reason) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Approve a booking (Tutor only)
 */
export const approveBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Reject a booking (Tutor only)
 */
export const rejectBooking = async (bookingId, reason) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
