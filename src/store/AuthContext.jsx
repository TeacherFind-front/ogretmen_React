import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { getMe, sendHeartbeat } from "@/services/authService";
import { stopChatConnection, registerDeviceToken } from "@/services/chatService";
import { messaging } from "@/config/firebase";
import { getToken } from "firebase/messaging";

/**
 * Auth Context
 * Kullanım:
 *   const { user, token, isAuthenticated, login, logout } = useAuth();
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yenilendiğinde token'dan kullanıcıyı geri yükle
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Token geçerli mi kontrol et
    getMe()
      .then((userData) => {
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /**
   * Giriş yap - login response alındıktan sonra çağrılır
   * @param {{ token, userId, fullName, email, role, avatarUrl }} loginData
   * @param {boolean} rememberMe
   */
  const handleLogin = useCallback((loginData, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem("token", loginData.token);
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("token", loginData.token);
      localStorage.removeItem("token");
    }
    setUser({
      userId: loginData.userId,
      fullName: loginData.fullName,
      email: loginData.email,
      role: loginData.role,
      avatarUrl: loginData.avatarUrl || null,
    });
  }, []);

  /**
   * Çıkış yap
   */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
    stopChatConnection();
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  }), [user, isLoading]);

  // Heartbeat Effect
  useEffect(() => {
    if (!user) return;

    // Hemen bir tane gönder
    sendHeartbeat();

    const interval = setInterval(() => {
      // Sadece sayfa görünür durumdaysa heartbeat at
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // FCM Push Notification Request
  useEffect(() => {
    if (!user || !messaging) return;

    const requestPermissionAndGetToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          const currentToken = await getToken(messaging, { vapidKey });
          
          if (currentToken) {
            console.log("FCM Token alındı, sunucuya kaydediliyor...");
            await registerDeviceToken(currentToken);
          } else {
            console.log("FCM Token alınamadı, izin verilmiş olabilir ama token dönmedi.");
          }
        }
      } catch (err) {
        console.error("FCM Token alınırken hata oluştu:", err);
      }
    };

    requestPermissionAndGetToken();
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook: Auth bilgilerine erişmek için
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
