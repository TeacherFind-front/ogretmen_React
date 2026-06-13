import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  Shield,
  Home
} from "lucide-react";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/store/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Ana Sayfa", icon: <Home size={20} /> },
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/users", label: "Kullanıcı Yönetimi", icon: <Users size={20} /> },
    { to: "/admin/tutors", label: "Eğitmen Onayları", icon: <UserCheck size={20} /> },
    { to: "/admin/settings", label: "Sistem Ayarları", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors">
      {/* Premium Sidebar */}
      <aside className="w-80 bg-[#0f172a] text-slate-300 hidden lg:flex flex-col border-r border-white/5">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
               <Shield className="text-white w-6 h-6" />
            </div>
            <div>
               <img src="/logo.png" alt="Özel Ders VIP" className="h-14 w-auto object-contain" />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Paneli</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Ana Menü</p>
          {navLinks.map(link => (
            <AdminSideLink key={link.to} to={link.to} className={location.pathname === link.to ? "active" : ""}>
               {link.icon}
               <span>{link.label}</span>
               {location.pathname === link.to && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </AdminSideLink>
          ))}
        </nav>

        <div className="p-6 mt-auto">
           <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">A</div>
                 <div>
                    <p className="text-xs font-bold text-white">Sistem Yöneticisi</p>
                    <p className="text-[10px] text-slate-500">Çevrimiçi</p>
                 </div>
              </div>
              <button 
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                 <LogOut size={14} /> Çıkış Yap
              </button>
           </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] z-50 flex items-center px-6 justify-between border-b border-white/5">
         <Link to="/" className="flex items-center gap-2">
           <Shield className="text-blue-500 w-8 h-8" />
           <span className="text-white font-bold tracking-widest text-sm uppercase">Admin Panel</span>
         </Link>
         <ThemeSwitch />
      </div>

      <MobileSidebar $isOpen={isMenuOpen}>
         <div className="p-8 flex justify-between items-center border-b border-white/5">
            <Link to="/"><h1 className="text-white font-black text-xl">AdminPanel</h1></Link>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400"><X /></button>
         </div>
         <nav className="p-6 space-y-4">
            {navLinks.map(link => (
               <AdminSideLink key={link.to} to={link.to} className={location.pathname === link.to ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                  {link.icon} <span>{link.label}</span>
               </AdminSideLink>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button 
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                 <LogOut size={16} /> Çıkış Yap
              </button>
            </div>
         </nav>
      </MobileSidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
         <header className="h-20 bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 hidden lg:flex items-center px-10 sticky top-0 z-30 transition-colors">
            <div className="flex-1"></div>
           <div className="ml-auto flex items-center gap-4">
              <ThemeSwitch />
              <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all group">
                 <Bell size={18} />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b] group-hover:scale-110 transition-transform"></span>
              </button>
              <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800"></div>
              <div className="flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-none">Admin User</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Süper Yetkili</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-slate-200 dark:shadow-none transition-all">A</div>
              </div>
           </div>
        </header>

        <main className="flex-1 p-4 lg:p-10 pb-24 lg:pb-10 bg-[#f8fafc] dark:bg-[#0f172a] transition-colors overflow-x-hidden">
           <div className="max-w-7xl mx-auto">
              <Outlet />
           </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onMenuClick={() => setIsMenuOpen(true)} />
    </div>
  );
}

const AdminSideLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 7px 14px;
  font-size: 14px;
  font-weight: 700;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #f8fafc;
    transform: translateX(4px);
  }
  
  &.active {
    background-color: #3b82f6;
    color: white;
    box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.5);
    
    svg {
      color: white;
      opacity: 1;
    }
  }

  svg {
    transition: all 0.3s;
    opacity: 0.7;
  }
`;

const MobileSidebar = styled.div`
  position: fixed;
  inset: 0;
  background: #0f172a;
  z-index: 1000;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

