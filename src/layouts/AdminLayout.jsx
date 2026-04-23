import { Outlet, Link } from "react-router-dom";
import styled from "styled-components";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 border-r bg-slate-900 text-white hidden md:block">
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <LogoWrapper small invert>
            <span className="logo-icon">🔑</span>
            <span className="logo-text text-white">Öğrenmenin <span>Çilingirleri</span></span>
          </LogoWrapper>
        </div>
        <nav className="p-4 space-y-1">
          <AdminSideLink to="/admin/dashboard">Yönetim Paneli</AdminSideLink>
          <AdminSideLink to="/admin/users">Kullanıcılar</AdminSideLink>
          <AdminSideLink to="/admin/tutors">Eğitmen Onay</AdminSideLink>
          <AdminSideLink to="/admin/settings">Ayarlar</AdminSideLink>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center px-6 justify-between shadow-sm">
          <div className="md:hidden">
            <LogoWrapper small>
              <span className="logo-icon">🔑</span>
              <span className="logo-text">Öğrenmenin <span>Çilingirleri</span></span>
            </LogoWrapper>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">Yönetici</span>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .logo-icon {
    font-size: ${props => props.small ? '18px' : '24px'};
  }

  .logo-text {
    font-size: ${props => props.small ? '16px' : '20px'};
    font-weight: 800;
    color: ${props => props.invert ? '#ffffff' : '#111827'};
    letter-spacing: -0.5px;
    
    span {
      color: #3b82f6;
    }
  }
`;

const AdminSideLink = styled(Link)`
  display: block;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
`;
