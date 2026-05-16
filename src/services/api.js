/**
 * Merkezi API yapılandırması
 * Tüm backend istekleri bu dosya üzerinden yapılır.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5288";

/**
 * Token'lı veya token'sız fetch wrapper.
 * 401 gelirse localStorage temizleyip login'e yönlendirir.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token süresi dolmuş veya geçersiz
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    return response;
  }

  return response;
}

export default BASE_URL;
