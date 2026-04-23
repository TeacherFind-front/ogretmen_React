import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styled from "styled-components";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  // Email öneri sistemi
  const emailDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    if (id === "email") {
      const [localPart, domainPart] = value.split("@");
      if (value.includes("@")) {
        if (!domainPart) {
          setEmailSuggestions(emailDomains.map((domain) => `${localPart}@${domain}`));
        } else {
          const filtered = emailDomains
            .filter((domain) => domain.startsWith(domainPart))
            .map((domain) => `${localPart}@${domain}`);
          setEmailSuggestions(filtered);
        }
      } else {
        setEmailSuggestions([]);
      }
    }
    
    setData({ ...data, [id]: value });
    if (error) setError("");
  };

  const handleSuggestionClick = (suggestion) => {
    setData({ ...data, email: suggestion });
    setEmailSuggestions([]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError("Geçersiz e-posta formatı.");
      return;
    }

    if (data.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("token", "dummy-login-token"); // Test için token ekle
      navigate("/app/dashboard");
    }, 1000);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-140px)] w-full items-center justify-center py-6 bg-muted/20 px-4">
      <StyledWrapper>
        <form className="form" onSubmit={handleLogin}>
          <div className="flex-column text-center mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Hoş Geldiniz
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Devam etmek için giriş yapın
            </p>
          </div>

          <div className="flex-column">
            <label>E-posta</label>
            <div className="inputForm relative">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                id="email"
                type="email"
                placeholder="E-posta adresinizi girin"
                className="input"
                value={data.email}
                onChange={handleInputChange}
                autoComplete="off"
                required
              />
              
              {emailSuggestions.length > 0 && (
                <ul className="suggestions-list shadow-xl border border-gray-100 bg-white absolute top-full left-0 right-0 z-50 rounded-xl mt-2 overflow-hidden">
                  {emailSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-600 transition-colors border-b border-gray-50 last:border-0"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex-column">
            <label>Şifre</label>
            <div className="inputForm">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Şifrenizi girin"
                className="input"
                value={data.password}
                onChange={handleInputChange}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex-row">
            <div>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="ml-2 text-sm cursor-pointer">
                Beni hatırla
              </label>
            </div>
            <Link to="/forgot-password">
              <span className="span">Şifremi unuttum</span>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-medium border border-red-100 animate-pulse text-center">
              {error}
            </div>
          )}

          <button className="button-submit" disabled={loading} type="submit">
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>

          <div className="social-divider">Veya şununla giriş yap</div>
          
          <div className="flex gap-4">
            <button type="button" className="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083L43.611,20.083L24,20v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
              Google
            </button>
            <button type="button" className="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              Apple
            </button>
          </div>

          <p className="p">
            Hesabınız yok mu?{" "}
            <Link to="/register">
              <span className="span">Kayıt Ol</span>
            </Link>
          </p>
        </form>
      </StyledWrapper>
    </div>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 40px;
    width: 100%;
    max-width: 480px;
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow:
      0 20px 40px -10px rgba(0, 0, 0, 0.05),
      0 10px 20px -5px rgba(0, 0, 0, 0.02);
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
  }

  .flex-column > label {
    color: #1a1a1a;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 6px;
    display: block;
  }

  .inputForm {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    transition: all 0.2s ease;
    background-color: #f9fafb;
  }

  .inputForm svg {
    color: #6b7280;
    flex-shrink: 0;
    margin-right: 8px;
  }

  .inputForm:focus-within {
    border-color: #2d79f3;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.1);
  }

  .inputForm:focus-within svg {
    color: #2d79f3;
  }

  .input {
    flex: 1;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    font-size: 15px;
    color: #111827;
    width: 100%;
    height: 100%;
    padding: 0 4px !important;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .flex-row > div > label {
    font-size: 14px;
    color: #4b5563;
  }

  .span {
    font-size: 14px;
    color: #2d79f3;
    font-weight: 600;
    cursor: pointer;
  }

  .span:hover {
    text-decoration: underline;
  }

  .button-submit {
    margin-top: 12px;
    background-color: #111827;
    border: none;
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: 14px;
    height: 52px;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .button-submit:hover {
    background-color: #1f2937;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .social-divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
    margin: 10px 0;
  }

  .social-divider::before,
  .social-divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e5e7eb;
  }

  .social-divider::before {
    margin-right: 12px;
  }

  .social-divider::after {
    margin-left: 12px;
  }

  .social-btn {
    flex: 1;
    height: 52px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .social-btn:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  .p {
    text-align: center;
    color: #4b5563;
    font-size: 14px;
    margin-top: 16px;
  }
`;
