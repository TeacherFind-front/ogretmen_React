import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  Menu,
  X,
  LayoutDashboard,
  MessageCircle,
  User,
  Shield,
  Home,
} from "lucide-react";
import NotificationDropdown from "@/components/shared/NotificationDropdown";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/store/AuthContext";

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    {
      to: "/student/dashboard",
      label: "Panel",
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: "/student/messages",
      label: "Mesajlar",
      icon: <MessageCircle size={18} />,
    },
    { to: "/student/profile", label: "Profilim", icon: <User size={18} /> },
    { to: "/student/security", label: "Güvenlik", icon: <Shield size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="w-56 border-r bg-white dark:bg-[#1e293b] dark:border-[#334155] hidden md:block shadow-sm">
        <div className="flex h-16 items-center px-6 border-b">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Özel Ders VIP"
              className="h-14 w-auto object-contain"
            />
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <SideLink
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              <div className="flex items-center gap-3">
                {link.icon} {link.label}
              </div>
            </SideLink>
          ))}
          <div className="pt-6 mt-6 border-t border-gray-100 px-2">
            <LogoutButton onClick={logout}>
              <span className="icon">🚪</span> Çıkış Yap
            </LogoutButton>
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar & Overlay */}
      <MobileOverlay
        $isOpen={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      />
      <MobileSidebar $isOpen={isMenuOpen}>
        <div className="flex h-12 items-center px-6 border-b justify-between">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Özel Ders VIP"
              className="h-14 w-auto object-contain"
            />
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-500"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <SideLink
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                {link.icon} {link.label}
              </div>
            </SideLink>
          ))}
          <div className="pt-6 mt-6 border-t border-gray-100 px-2">
            <LogoutButton onClick={logout}>
              <span className="icon">🚪</span> Çıkış Yap
            </LogoutButton>
          </div>
        </nav>
      </MobileSidebar>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-white dark:bg-[#1e293b] dark:border-[#334155] flex items-center px-4 md:px-6 justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="Özel Ders VIP"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeSwitch />
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <Home size={14} /> Ana Sayfa
            </Link>
            <NotificationDropdown />
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                {user?.role === "3" ? "Admin Paneli" : "Öğrenci Paneli"}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-slate-400">
                Hoş geldin, {user?.fullName || "Kullanıcı"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.fullName?.charAt(0) || "U"
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onMenuClick={() => setIsMenuOpen(true)} />
    </div>
  );
}

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .logo-icon {
    font-size: ${(props) => (props.$small ? "18px" : "24px")};
  }

  .logo-text {
    font-size: ${(props) => (props.$small ? "16px" : "20px")};
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.5px;

    span {
      color: #2d79f3;
    }
  }
`;

const SideLink = styled(Link)`
  display: block;
  padding: 7px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;

  .dark & {
    color: #94a3b8;
  }

  &:hover {
    background-color: #f3f4f6;
    color: #2d79f3;

    .dark & {
      background-color: #334155;
      color: #3b82f6;
    }
  }

  &.active {
    background-color: #eff6ff;
    color: #2d79f3;

    .dark & {
      background-color: #1e3a8a;
      color: #60a5fa;
    }
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
  background: transparent;
  border: none;
  width: 100%;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;

  .icon {
    font-size: 16px;
  }

  &:hover {
    background-color: #fef2f2;
    transform: translateX(4px);

    .dark & {
      background-color: #7f1d1d40;
    }
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

const MobileSidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  z-index: 1001;
  box-shadow: 20px 0 50px rgba(0, 0, 0, 0.1);
  
  .dark & {
    background: #1e293b;
    border-right: 1px solid #334155;
  }

  /* Requested translate value */
  --tw-translate-x: -110%;
  transform: translateX(var(--tw-translate-x));
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  ${(props) =>
    props.$isOpen &&
    `
    --tw-translate-x: 0%;
  `}

  @media (min-width: 768px) {
    display: none;
  }
`;
