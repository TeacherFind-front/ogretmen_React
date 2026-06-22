import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  User,
  MessageCircle,
  Shield,
  LogOut,
  Home,
} from "lucide-react";
import NotificationDropdown from "@/components/shared/NotificationDropdown";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/store/AuthContext";
import ScrollToTop from "@/components/shared/ScrollToTop";

export default function TutorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Ana Sayfa", icon: <Home size={16} /> },
    { to: "/tutor/dashboard", label: "Panel", icon: "📊" },
    { to: "/tutor/create-listing", label: "İlan Ver", icon: "➕" },
    { to: "/tutor/availability", label: "Müsaitlik Ayarları", icon: "⏰" },
    { to: "/tutor/lessons", label: "Derslerim", icon: "📚" },
    { to: "/tutor/profile", label: "Profilim", icon: "👤" },
    { to: "/tutor/social-media", label: "Sosyal Medya", icon: "🔗" },
    { to: "/tutor/messages", label: "Mesajlar", icon: "💬" },
    { to: "/tutor/change-password", label: "Şifreyi Değiştir", icon: "🛡️" },
    { to: "/tutor/support", label: "Destek Taleplerim", icon: "🙋‍♂️" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f9fafb] dark:bg-[var(--page-bg)] transition-colors duration-300">
      <ScrollToTop />
      {/* Desktop Sidebar */}
      <aside className="w-56 border-r bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)] hidden md:block shadow-sm">
        <div className="flex h-14 items-center px-6">
          <div className="flex items-center">
            <Link to="/">
              <img src="/logo.png" alt="Özel Ders VIP" className="h-14 w-auto object-contain" />
            </Link>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <SideLink
              key={link.to}
              to={link.to}
              $active={location.pathname === link.to}
            >
              <span className="icon">{link.icon}</span> {link.label}
            </SideLink>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[var(--card-border)]">
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
        <div className="flex h-14 items-center px-6 border-b justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img src="/logo.png" alt="Özel Ders VIP" className="h-14 w-auto object-contain" />
            </Link>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <SideLink
              key={link.to}
              to={link.to}
              $active={location.pathname === link.to}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="icon">{link.icon}</span> {link.label}
            </SideLink>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <LogoutButton onClick={logout}>
              <span className="icon">🚪</span> Çıkış Yap
            </LogoutButton>
          </div>
        </nav>
      </MobileSidebar>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)] flex items-center px-4 md:px-6 justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <div className="flex items-center">
                <Link to="/">
                  <img src="/logo.png" alt="Özel Ders VIP" className="h-10 w-auto object-contain" />
                </Link>
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeSwitch />
            <NotificationDropdown />
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[11px] font-bold text-gray-900 dark:text-slate-100">
                Eğitmen Paneli
              </span>
              <span className="text-[9px] text-gray-500 dark:text-[var(--text-muted)]">
                Hoş geldin, {user?.fullName?.split(" ")[0] || "Hocam"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.fullName?.charAt(0) || "H"
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 pb-24 md:pb-4 bg-[#f9fafb] dark:bg-[var(--page-bg)] transition-colors duration-300 overflow-x-hidden">
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
  gap: 6px;

  .logo-icon {
    font-size: ${(props) => (props.$small ? "16px" : "22px")};
  }

  .logo-text {
    font-size: ${(props) => (props.$small ? "13px" : "18px")};
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.5px;

    .dark & {
      color: #f1f5f9;
    }

    span {
      color: #16a34a;
    }
  }
`;

const SideLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.$active ? "#16a34a" : "#4b5563")};
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.$active ? "#f3f7ff" : "transparent")};

  .dark & {
    color: ${(props) => (props.$active ? "#16a34a" : "#94a3b8")};
    background-color: ${(props) =>
      props.$active ? "#14532d40" : "transparent"};
  }

  .icon {
    font-size: 16px;
    opacity: ${(props) => (props.$active ? "1" : "0.7")};
  }

  &:hover {
    background-color: ${(props) => (props.$active ? "#f3f7ff" : "#f9fafb")};
    color: #16a34a;

    .dark & {
      background-color: ${(props) => (props.$active ? "#14532d60" : "#334155")};
      color: #16a34a;
    }

    .icon {
      opacity: 1;
    }
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  color: #ef4444;
  background: transparent;
  border: none;
  width: 100%;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;

  .icon {
    font-size: 18px;
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
  md: hidden;
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
    background: var(--card-bg);
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
