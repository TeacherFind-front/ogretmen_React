import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Globe,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import BottomNav from "@/components/BottomNav";

export default function PublicLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    const role = user.role?.toString().toLowerCase();
    if (role === "2" || role === "tutor") return "/tutor/dashboard";
    if (
      role === "3" ||
      role === "admin" ||
      role === "4" ||
      role === "superadmin"
    )
      return "/admin/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfdff] text-[#0f172a] dark:bg-[#0f172a] dark:text-slate-100 transition-colors duration-300">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-[90] w-full border-b border-gray-100 dark:border-[#1e293b] bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl transition-colors duration-300">
        <div className="container mx-auto h-20 flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 no-underline group">
            <div className="flex items-center">
              <img src="/logo.png" alt="Özel Ders VIP" className="h-16 w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <DesktopNavLink to="/">Ana Sayfa</DesktopNavLink>
            <DesktopNavLink to="/tutors">Ders Ara</DesktopNavLink>
            <DesktopNavLink to="/hakkimizda">Hakkımızda</DesktopNavLink>
            <DesktopNavLink to="/iletisim">İletişim</DesktopNavLink>
            <DesktopNavLink to="/sss">S.S.S</DesktopNavLink>
            <Link to="/register?role=tutor" className="no-underline">
              <button className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all border border-blue-100 shadow-sm">
                Öğretmen Ol
              </button>
            </Link>

            <ThemeSwitch />

            <div className="flex items-center gap-4 ml-4">
              {!isLoading &&
                (isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <Link to={getDashboardPath()} className="no-underline">
                      <DashboardButton>
                        <LayoutDashboard size={18} /> Panelim
                      </DashboardButton>
                    </Link>
                    <LogoutButton onClick={handleLogout} title="Çıkış Yap">
                      <LogOut size={20} />
                    </LogoutButton>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors px-4 py-2"
                  >
                    Giriş / Kayıt
                  </Link>
                ))}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeSwitch />
          </div>
        </div>

        {/* Mobile Sidebar & Overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-[#0f172a]/30 backdrop-blur-sm z-[1000] md:hidden transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <div 
          className={`fixed top-0 left-0 h-[100dvh] w-[300px] bg-white dark:bg-[#0f172a] border-r border-transparent dark:border-[#1e293b] z-[1001] shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-[#1e293b] flex items-center justify-between shrink-0">
              <Link
                to="/"
                className="flex items-center gap-3 no-underline"
                onClick={() => setIsMenuOpen(false)}
              >
                <img src="/logo.png" alt="Özel Ders VIP" className="h-10 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-6 flex-1 overflow-y-auto">
              <Link 
                to="/tutors" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors no-underline"
              >
                Eğitmen Bul
              </Link>
              <Link 
                to="/hakkimizda" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors no-underline"
              >
                Hakkımızda
              </Link>
              <Link 
                to="/iletisim" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors no-underline"
              >
                İletişim
              </Link>
              <Link 
                to="/sss" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors no-underline"
              >
                S.S.S
              </Link>
              <hr className="my-4 border-gray-100 dark:border-[#1e293b]" />
              {!isLoading &&
                (isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors no-underline"
                    >
                      Panelim
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="mt-2 flex items-center gap-2 text-red-500 font-bold px-4 py-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut size={18} /> Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors no-underline"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      className="no-underline mt-2 block px-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <JoinButton className="justify-center w-full">
                        Hemen Katıl
                      </JoinButton>
                    </Link>
                  </>
                ))}
            </div>

            <div className="p-6 sm:p-8 bg-gray-50/50 dark:bg-[#0b1120] border-t border-gray-100 dark:border-[#1e293b] shrink-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Sosyal Medya
              </p>
              <div className="flex gap-4">
                <SocialLink href="#">
                  <Globe size={18} />
                </SocialLink>
                <SocialLink href="#">
                  <MessageCircle size={18} />
                </SocialLink>
                <SocialLink href="#">
                  <HelpCircle size={18} />
                </SocialLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-white dark:bg-[#0b1120] border-t border-gray-100 dark:border-[#1e293b] pt-24 pb-12 overflow-hidden relative transition-colors duration-300">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>

        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <Link
                to="/"
                className="flex items-center gap-3 no-underline mb-8"
              >
                <img src="/logo.png" alt="Özel Ders VIP" className="h-20 w-auto object-contain" />
              </Link>
              <p className="text-gray-500 font-medium leading-relaxed mb-8 max-w-sm">
                Türkiye'nin en seçkin eğitmenleri ile öğrencileri bir araya
                getiren, başarı odaklı ders platformu.
              </p>
              <div className="flex gap-4">
                <SocialLink href="#">
                  <Globe size={20} />
                </SocialLink>
                <SocialLink href="#">
                  <MessageCircle size={20} />
                </SocialLink>
                <SocialLink href="#">
                  <HelpCircle size={20} />
                </SocialLink>
              </div>
            </div>

            <div>
              <FooterTitle>Platform</FooterTitle>
              <FooterLink to="/tutors">Eğitmen Bul</FooterLink>
              <FooterLink to="/register?role=tutor">Hoca Ol</FooterLink>
              <FooterLink to="/sss">Nasıl Çalışır?</FooterLink>
              <FooterLink to="/pricing">Ücretlendirme</FooterLink>
            </div>

            <div>
              <FooterTitle>Kurumsal</FooterTitle>
              <FooterLink to="/hakkimizda">Hakkımızda</FooterLink>
              <FooterLink to="/iletisim">İletişim</FooterLink>
              <FooterLink to="/privacy">Gizlilik Politikası</FooterLink>
              <FooterLink to="/terms">Kullanım Koşulları</FooterLink>
            </div>

            <div>
              <FooterTitle>Bültene Katıl</FooterTitle>
              <p className="text-sm text-gray-500 font-medium mb-6">
                En yeni eğitim içerikleri ve kampanyalardan haberdar olun.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="bg-gray-50 dark:bg-[#1e293b] border-none rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:ring-2 ring-blue-100 dark:ring-blue-900 dark:text-white"
                />
                <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-50 dark:border-[#1e293b] flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-400 font-bold tracking-wide uppercase"></p>
            <div className="flex gap-8">
              <span className="text-xs font-black text-gray-300 tracking-widest uppercase">
                MADE WITH ❤️ IN TÜRKİYE
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav onMenuClick={() => setIsMenuOpen(true)} />
    </div>
  );
}

const LogoIcon = styled.span`
  font-size: ${(props) => (props.$small ? "24px" : "32px")};
  filter: drop-shadow(0 4px 10px rgba(45, 121, 243, 0.2));
`;

const LogoText = styled.span`
  font-size: ${(props) => (props.$small ? "20px" : "26px")};
  font-weight: 900;
  color: #0f172a;
  .dark & {
    color: white;
  }
  letter-spacing: -0.04em;
  span {
    color: #2d79f3;
  }
`;

const DesktopNavLink = styled(Link)`
  font-size: 15px;
  font-weight: 700;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s;
  .dark & {
    color: #cbd5e1;
  }
  &:hover {
    color: #2d79f3;
  }
`;

const JoinButton = styled.div`
  background: #2d79f3;
  color: white;
  padding: 12px 28px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 20px rgba(45, 121, 243, 0.15);
  transition: all 0.3s;
  &:hover {
    background: #1e40af;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(45, 121, 243, 0.25);
  }
`;

const DashboardButton = styled.div`
  background: #f8fafc;
  color: #0f172a;
  padding: 7px 14px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
  .dark & {
    background: #1e293b;
    color: white;
    border-color: #334155;
  }
  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
    .dark & {
      background: #334155;
    }
  }
`;

const LogoutButton = styled.button`
  color: #ef4444;
  padding: 12px;
  border-radius: 16px;
  background: #fff1f2;
  border: none;
  transition: all 0.2s;
  &:hover {
    background: #ffe4e6;
    transform: scale(1.05);
  }
`;

const FooterTitle = styled.h4`
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  .dark & {
    color: white;
  }
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
`;

const FooterLink = styled(Link)`
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  .dark & {
    color: #94a3b8;
  }
  text-decoration: none;
  margin-bottom: 14px;
  transition: all 0.2s;
  &:hover {
    color: #2d79f3;
    padding-left: 4px;
  }
`;

const SocialLink = styled.a`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
  .dark & {
    background: #1e293b;
    color: #94a3b8;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    background: #2d79f3;
    color: white;
    transform: translateY(-3px);
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .logo-icon {
    font-size: ${(props) => (props.$small ? "20px" : "28px")};
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .logo-text {
    font-size: ${(props) => (props.$small ? "18px" : "22px")};
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.5px;
    font-family: "Plus Jakarta Sans", "Inter", sans-serif;

    span {
      color: #2d79f3;
      background: linear-gradient(135deg, #2d79f3 0%, #1e40af 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
`;

const NavLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: #2d79f3;
  }
`;

const LoginLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: white;
  background-color: #111827;
  padding: 10px 24px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #1f2937;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;
