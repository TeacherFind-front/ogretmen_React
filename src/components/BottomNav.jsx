import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, Menu } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

export default function BottomNav({ onMenuClick }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/login";
    const role = user.role?.toString().toLowerCase();
    if (role === "2" || role === "tutor") return "/tutor/dashboard";
    if (role === "3" || role === "admin" || role === "4" || role === "superadmin") return "/admin/dashboard";
    return "/student/dashboard";
  };

  const navItems = [
    {
      label: "Ana Sayfa",
      icon: <Home size={22} />,
      path: "/",
    },
    {
      label: "Eğitmenler",
      icon: <Search size={22} />,
      path: "/tutors",
    },
    {
      label: isAuthenticated ? "Profil" : "Giriş",
      icon: <User size={22} />,
      path: getDashboardPath(),
    },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the bottom nav */}
      <div className="h-16 md:hidden"></div>
      
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 z-[100] w-full h-16 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-2xl border-t border-gray-200 dark:border-[#1e293b] md:hidden flex items-center justify-around px-2 pb-safe">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 no-underline transition-colors duration-200 ${
                active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <div className={`transition-transform duration-200 ${active ? "scale-110" : "scale-100"}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Menu Toggle Button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
        >
          <div className="transition-transform duration-200">
            <Menu size={22} />
          </div>
          <span className="text-[10px] font-semibold">Menü</span>
        </button>
      </nav>
    </>
  );
}
