import { Outlet, Link } from "react-router-dom";
import styled from "styled-components";

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-72 border-r bg-white hidden md:block shadow-sm">
        <div className="flex h-16 items-center px-6 border-b">
          <LogoWrapper small>
            <span className="logo-icon">🔑</span>
            <span className="logo-text">Öğrenmenin <span>Çilingirleri</span></span>
          </LogoWrapper>
        </div>
        <nav className="p-4 space-y-1">
          <SideLink to="/app/dashboard">Panel</SideLink>
          <SideLink to="/app/search">Özel Ders Al</SideLink>
          <SideLink to="/app/lessons">Derslerim</SideLink>
          <SideLink to="/app/messages">Mesajlar</SideLink>
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
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900">Öğrenci Paneli</span>
              <span className="text-xs text-gray-500">Hoş geldin, Öğrenci</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              Ö
            </div>
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
    color: #111827;
    letter-spacing: -0.5px;
    
    span {
      color: #2d79f3;
    }
  }
`;

const SideLink = styled(Link)`
  display: block;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #2d79f3;
  }

  &.active {
    background-color: #eff6ff;
    color: #2d79f3;
  }
`;
