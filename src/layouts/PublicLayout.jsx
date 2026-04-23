import { Outlet, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function PublicLayout() {
  const navigate = useNavigate();

  const handleBecomeTutor = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Giriş yapılıp yapılmadığını kontrol et
    
    if (token) {
      navigate("/create-ad"); // Kayıtlıysa ilan oluşturma sayfasına git
    } else {
      navigate("/register"); // Kayıtlı değilse kayıt sayfasına git
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-white/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <LogoWrapper>
              <span className="logo-icon">🔑</span>
              <span className="logo-text">Öğrenmenin <span>Çilingirleri</span></span>
            </LogoWrapper>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/tutors">Özel Ders Al</NavLink>
            <a 
              href="/become-a-tutor" 
              onClick={handleBecomeTutor}
              className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors no-underline"
            >
              Eğitmen Ol
            </a>
            <LoginLink to="/login">Giriş Yap</LoginLink>
          </nav>
          
          <button className="md:hidden p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <LogoWrapper small>
              <span className="logo-icon">🔑</span>
              <span className="logo-text">Öğrenmenin <span>Çilingirleri</span></span>
            </LogoWrapper>
            <p className="text-sm text-gray-500">
              © 2026 Öğrenmenin Çilingirleri. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .logo-icon {
    font-size: ${props => props.small ? '20px' : '28px'};
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }

  .logo-text {
    font-size: ${props => props.small ? '18px' : '22px'};
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.5px;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    
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
