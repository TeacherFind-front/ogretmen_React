import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";

/**
 * Belirli bir rol gerektiren rotaları korumak için kullanılır.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} props.allowedRoles - İzin verilen roller ["1", "2", "3"] veya ["student", "tutor", "admin"]
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Giriş yapmamışsa login sayfasına yönlendir, geldiği sayfayı state'de tut
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const userRole = user.role?.toString().toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toString().toLowerCase());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
