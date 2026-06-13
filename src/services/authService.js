import { apiFetch } from "./api";

/**
 * Kimlik doğrulama servisi
 * POST /api/auth/login
 * POST /api/auth/register
 * GET  /api/auth/me
 */

/**
 * Giriş yap
 * @param {string} email
 * @param {string} password
 * @returns {{ token, userId, fullName, email, role }}
 */
export async function login(email, password, rememberMe = false) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorObj = new Error(err.message || "Giriş başarısız.");
    errorObj.userId = err.userId || err.UserId;
    errorObj.requiresVerification = err.requiresVerification || err.RequiresVerification;
    throw errorObj;
  }

  const data = await res.json();
  
  return data;
}

/**
 * Kayıt ol
 * @param {{ fullName, email, password, role, phone, city }} data
 * @returns {{ token?, userId, fullName, email, role }}
 */
export async function register({ fullName, email, password, role, phoneNumber, cityId, districtId, neighborhoodId }) {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ 
      FullName: fullName, 
      Email: email, 
      Password: password, 
      Role: role, 
      PhoneNumber: phoneNumber, 
      CityId: cityId,
      DistrictId: districtId,
      NeighborhoodId: neighborhoodId
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log("Full Backend Error:", JSON.stringify(err, null, 2));
    console.error("Backend Kayıt Hatası Detayı:", err);
    
    let errorMessage = err.message || "Kayıt başarısız.";
    if (err.errors) {
      errorMessage = Object.entries(err.errors)
        .map(([key, value]) => `${key}: ${value.join(', ')}`)
        .join(' | ');
    }
    
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Mevcut kullanıcı bilgilerini getir (token ile)
 * @returns {{ userId, fullName, email, role, avatarUrl }}
 */
export async function getMe() {
  const res = await apiFetch("/api/auth/me");

  if (!res || !res.ok) return null;

  const data = await res.json();
  
  return data;
}

/**
 * Şifre değiştir (token ile)
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @returns {Promise<{message: string}>}
 */
export async function changePassword(currentPassword, newPassword) {
  const res = await apiFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Şifre değiştirme başarısız.");
  }

  return res.json();
}

export async function verifyEmail(email, code, userId) {
  const res = await apiFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ userId, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Doğrulama başarısız.");
  }
  return res.json();
}

export async function resendVerification(email) {
  const res = await apiFetch("/api/auth/resend-email-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Kod gönderilemedi.");
  }
  return res.json();
}

export async function forgotPassword(email) {
  const res = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "İstek başarısız.");
  }
  return res.json();
}

/**
 * E-posta değişikliği için kod talep et
 */
export async function requestEmailChange(password, newEmail) {
  const res = await apiFetch("/api/auth/request-email-change", {
    method: "POST",
    body: JSON.stringify({ password, newEmail }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "E-posta doğrulama kodu gönderilemedi.");
  }
  return res.json();
}

/**
 * Gelen kod ile e-postayı kalıcı olarak değiştir
 */
export async function verifyEmailChange(newEmail, code) {
  const res = await apiFetch("/api/auth/verify-email-change", {
    method: "POST",
    body: JSON.stringify({ newEmail, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Doğrulama başarısız. Kod hatalı veya süresi dolmuş.");
  }
  return res.json();
}

/**
 * Şifre sıfırlama işlemi (yeni şifre belirleme)
 */
export async function resetPassword(email, code, newPassword) {
  const res = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Şifre sıfırlama başarısız.");
  }

  return res.json();
}

/**
 * Firebase ID Token ile sosyal giriş yap
 * @param {string} provider - 'google' veya 'apple'
 * @param {string} idToken - Firebase'den dönen ID Token
 * @param {string} role - Kayıt oluyorsa zorunlu ('student' veya 'tutor')
 */
export async function socialLogin(provider, idToken) {
  const res = await apiFetch("/api/auth/social-login", {
    method: "POST",
    body: JSON.stringify({ provider, idToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Sosyal giriş başarısız.");
  }

  return res.json();
}

/**
 * Çıkış yap
 * Token'ı siler ve gerekirse backend'i bilgilendirir.
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Backend'e session bitirme isteği gönderilebilir (opsiyonel)
  window.location.href = "/login";
}

/**
 * Kullanıcı online durumunu güncel tutmak için heartbeat
 */
export async function sendHeartbeat() {
  try {
    await apiFetch("/api/users/heartbeat", { method: "POST" });
  } catch (err) {
    // Sessizce geç
  }
}
