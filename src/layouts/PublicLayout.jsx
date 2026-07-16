import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
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
import ScrollToTop from "@/components/shared/ScrollToTop";

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrolledFar, setScrolledFar] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setScrolledFar(window.scrollY > 380);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (navSearch.trim()) params.append("category", navSearch.trim());
    navigate(`/tutors${params.toString() ? `?${params}` : ""}`);
    setNavSearch("");
  };

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
    <div className="flex min-h-screen flex-col transition-colors duration-300">
      <ScrollToTop />
      {/* Premium Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-[90] w-full transition-all duration-500"
        style={
          (scrolled || location.pathname !== "/")
            ? {
                background: "var(--nav-bg)",
                backdropFilter: "saturate(180%) blur(24px)",
                WebkitBackdropFilter: "saturate(180%) blur(24px)",
                borderBottom: "1px solid rgba(74, 222, 128, 0.15)",
                boxShadow: "0 4px 32px rgba(5, 46, 22, 0.3)",
              }
            : {
                background: "transparent",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                borderBottom: "1px solid transparent",
                boxShadow: "none",
              }
        }
      >
        <div className="container mx-auto h-[68px] flex items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline group shrink-0">
            <div className="flex items-center">
              <img src="/logo.png" alt="Özel Ders VIP" className="h-14 w-auto object-contain" />
            </div>
          </Link>

          {/* Orta — nav linkleri ↔ arama çubuğu */}
          <div className="hidden md:flex items-center justify-center flex-1 relative overflow-visible mx-4">

            {/* Normal nav linkleri — sayfa üstteyken */}
            <div
              className="flex items-center gap-6 transition-all duration-500 absolute"
              style={{
                opacity: (scrolledFar && location.pathname === "/") ? 0 : 1,
                pointerEvents: (scrolledFar && location.pathname === "/") ? "none" : "auto",
                transform: (scrolledFar && location.pathname === "/") ? "translateY(-10px) scale(0.95)" : "translateY(0) scale(1)",
              }}
            >
              <DesktopNavLink to="/">Ana Sayfa</DesktopNavLink>
              <DesktopNavLink to="/tutors">Ders Ara</DesktopNavLink>
              <DesktopNavLink to="/hakkimizda">Hakkımızda</DesktopNavLink>
              <DesktopNavLink to="/iletisim">İletişim</DesktopNavLink>
              <DesktopNavLink to="/sss">S.S.S</DesktopNavLink>
            </div>

            {/* Mini arama çubuğu — scroll sonrası */}
            <form
              onSubmit={handleNavSearch}
              className="transition-all duration-500 absolute"
              style={{
                opacity: (scrolledFar && location.pathname === "/") ? 1 : 0,
                pointerEvents: (scrolledFar && location.pathname === "/") ? "auto" : "none",
                transform: (scrolledFar && location.pathname === "/") ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
                width: "360px",
              }}
            >
              <div
                className="flex items-center w-full rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(74,222,128,0.3)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Ders veya konu ara..."
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm font-medium focus:outline-none placeholder:text-white/40"
                  style={{ color: "#f0fdf4" }}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 flex items-center justify-center transition-all hover:opacity-80 shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #16a34a, #22c55e)",
                    color: "white",
                    minWidth: "44px",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </button>
              </div>
            </form>

          </div>

          {/* Sağ — her zaman görünür */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link to="/register?role=tutor" className="no-underline">
              <button
                style={{
                  background: "rgba(74,222,128,0.15)",
                  color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.35)",
                }}
                className="px-4 py-2 rounded-xl font-bold text-sm transition-all hover:bg-[rgba(74,222,128,0.25)] hover:scale-105"
              >
                Öğretmen Ol
              </button>
            </Link>

            <ThemeSwitch />

            <div className="flex items-center gap-2">
              {!isLoading &&
                (isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link to={getDashboardPath()} className="no-underline">
                      <button
                        style={{
                          background: "linear-gradient(135deg, #16a34a, #22c55e)",
                          color: "white",
                          boxShadow: "0 4px 16px rgba(22,163,74,0.4)",
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-105"
                      >
                        <LayoutDashboard size={16} /> Panelim
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      title="Çıkış Yap"
                      className="p-2 rounded-xl transition-all hover:scale-105"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm font-bold no-underline transition-all px-5 py-2 rounded-xl hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #16a34a, #22c55e)",
                      color: "white",
                      boxShadow: "0 4px 16px rgba(22,163,74,0.4)",
                    }}
                  >
                    Giriş Yap
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] md:hidden transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <div 
          className={`fixed top-0 left-0 h-[100dvh] w-[300px] z-[1001] shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: "var(--page-bg)", borderRight: "1px solid var(--card-border)" }}
        >
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--card-border)" }}>
              <Link
                to="/"
                className="flex items-center gap-3 no-underline"
                onClick={() => setIsMenuOpen(false)}
              >
                <img src="/logo.png" alt="Özel Ders VIP" className="h-10 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)", background: "var(--section-alt)" }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-6 flex-1 overflow-y-auto">
              {[
                { to: "/tutors", label: "Eğitmen Bul" },
                { to: "/hakkimizda", label: "Hakkımızda" },
                { to: "/iletisim", label: "İletişim" },
                { to: "/sss", label: "S.S.S" }
              ].map(link => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl font-bold transition-colors no-underline"
                  style={{ color: "var(--text-primary)", background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4" style={{ borderColor: "var(--card-border)" }} />
              {!isLoading &&
                (isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl font-bold text-green-600 transition-colors no-underline"
                      style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)" }}
                    >
                      Panelim
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="mt-2 flex items-center gap-2 font-bold px-4 py-4 rounded-xl transition-colors text-left"
                      style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}
                    >
                      <LogOut size={18} /> Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl font-bold transition-colors no-underline text-center"
                      style={{ color: "var(--text-primary)", background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      className="no-underline mt-2 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <button 
                        className="w-full font-bold text-white px-4 py-3 rounded-xl transition-all"
                        style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}
                      >
                        Hemen Katıl
                      </button>
                    </Link>
                  </>
                ))}
            </div>

            <div className="p-6 sm:p-8 border-t shrink-0" style={{ background: "var(--section-alt)", borderColor: "var(--card-border)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
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
      <main className={`flex-1 ${location.pathname !== "/" ? "pt-[68px]" : ""}`}>
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer
        className="border-t pt-24 pb-12 overflow-hidden relative transition-colors duration-300"
        style={{
          background: "var(--section-alt)",
          borderColor: "var(--card-border)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(22,163,74,0.3), transparent)" }}
        />

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
              <FooterTitle>Kurumsal & Hukuki</FooterTitle>
              <FooterLink to="/hakkimizda">Hakkımızda</FooterLink>
              <FooterLink to="/iletisim">İletişim</FooterLink>
              <FooterLink to="/kullanim-sartlari">Kullanım Şartları</FooterLink>
              <FooterLink to="/gizlilik-politikasi">Gizlilik Politikası</FooterLink>
              <FooterLink to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</FooterLink>
              <FooterLink to="/iade-sartlari">İade Şartları</FooterLink>
              <FooterLink to="/online-akademi-sozlesmesi">Online Akademi Sözleşmesi</FooterLink>
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
                  className="bg-gray-50 dark:bg-[var(--card-bg)] border-none rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:ring-2 ring-green-100 dark:ring-green-900 dark:text-white"
                />
                <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-50 dark:border-[var(--card-border)] flex flex-col md:flex-row justify-between items-center gap-6">
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
  color: #bbf7d0;
  text-decoration: none;
  transition: all 0.2s;
  &:hover {
    color: #ffffff;
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
