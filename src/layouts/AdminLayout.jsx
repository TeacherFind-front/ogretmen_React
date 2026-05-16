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
  Shield
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/users", label: "Kullanıcı Yönetimi", icon: <Users size={20} /> },
    { to: "/admin/tutors", label: "Eğitmen Onayları", icon: <UserCheck size={20} /> },
    { to: "/admin/settings", label: "Sistem Ayarları", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Premium Sidebar */}
      <aside className="w-80 bg-[#0f172a] text-slate-300 hidden lg:flex flex-col border-r border-white/5">
        <div className="p-8">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
               <Shield className="text-white w-6 h-6" />
            </div>
            <div>
               <h1 className="text-white font-black text-lg leading-tight tracking-tight">Admin<span className="text-blue-500">Panel</span></h1>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Öğrenmenin Çilingirleri</p>
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
         <Shield className="text-blue-500 w-8 h-8" />
         <button onClick={() => setIsMenuOpen(true)} className="text-white"><Menu /></button>
      </div>

      <MobileSidebar $isOpen={isMenuOpen}>
         <div className="p-8 flex justify-between items-center border-b border-white/5">
            <h1 className="text-white font-black text-xl">AdminPanel</h1>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400"><X /></button>
         </div>
         <nav className="p-6 space-y-4">
            {navLinks.map(link => (
               <AdminSideLink key={link.to} to={link.to} className={location.pathname === link.to ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                  {link.icon} <span>{link.label}</span>
               </AdminSideLink>
            ))}
         </nav>
      </MobileSidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-100 hidden lg:flex items-center px-10 sticky top-0 z-30">
           <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Kullanıcı, ilan veya işlem ara..." 
                className="w-full h-11 bg-slate-50 border-none rounded-xl pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
           </div>
           <div className="ml-auto flex items-center gap-6">
              <button className="relative w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-all group">
                 <Bell size={20} />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
              </button>
              <div className="h-8 w-[1px] bg-slate-100"></div>
              <div className="flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900 leading-none">Admin User</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Süper Yetkili</p>
                 </div>
                 <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg shadow-slate-900/20">A</div>
              </div>
           </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 pt-24 lg:pt-10 overflow-y-auto">
           <div className="max-w-7xl mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}

const AdminSideLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  text-decoration: none;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
    color: #f8fafc;
    transform: translateX(4px);
  }
  
  &.active {
    background-color: #3b82f6;
    color: white;
    box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.5);
    
    svg {
      color: white;
    }
  }

  svg {
    transition: color 0.3s;
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

