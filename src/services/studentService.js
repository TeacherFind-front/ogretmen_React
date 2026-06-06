import { apiFetch } from "./api";

/**
 * Get student dashboard statistics
 */
export const getStudentDashboardStats = async () => {
  const response = await apiFetch("/api/students/dashboard-stats");
  if (!response || !response.ok) {
    const error = await response?.json().catch(() => ({}));
    throw new Error(error.message || "İstatistikler alınamadı.");
  }
  return response.json();
};

/**
 * Get student profile
 */
export const getStudentProfile = async () => {
  const response = await apiFetch("/api/students/profile");
  if (!response || !response.ok) {
    const error = await response?.json().catch(() => ({}));
    throw new Error(error.message || "Profil alınamadı.");
  }
  return response.json();
};

/**
 * Update student profile
 */
export const updateStudentProfile = async (profileData) => {
  const response = await apiFetch("/api/students/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  if (!response || !response.ok) {
    const error = await response?.json().catch(() => ({}));
    throw new Error(error.message || "Profil güncellenemedi.");
  }
  return response.json();
};

/**
 * Upload student avatar
 */
export const uploadStudentAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch("/api/students/avatar", {
    method: "POST",
    body: formData,
  });
  if (!response || !response.ok) {
    const error = await response?.json().catch(() => ({}));
    throw new Error(error.message || "Avatar yüklenemedi.");
  }
  return response.json();
};

/**
 * Get student's bookings
 */
export const getStudentBookings = async () => {
  const response = await apiFetch("/api/bookings/my");
  if (!response || !response.ok) {
    const error = await response?.json().catch(() => ({}));
    throw new Error(error.message || "Rezervasyonlar alınamadı.");
  }
  return response.json();
};

/**
 * Get student's lessons (history)
 */
export const getStudentLessons = async () => {
  const response = await apiFetch("/api/students/lessons");
  if (!response || !response.ok) {
    const error = await response?.json().catch(() => ({}));
    throw new Error(error.message || "Ders geçmişi alınamadı.");
  }
  // If the backend returns empty 200 OK because of the bug, we can return empty array
  try {
    return await response.json();
  } catch {
    return [];
  }
};
