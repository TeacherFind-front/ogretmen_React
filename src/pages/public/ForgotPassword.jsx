import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Email öneri sistemi
  const emailDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
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
    
    if (error) setError("");
  };

  const handleSuggestionClick = (suggestion) => {
    setEmail(suggestion);
    setEmailSuggestions([]);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Geçersiz e-posta formatı.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-140px)] w-full items-center justify-center py-6 bg-muted/20 px-4">
      <StyledWrapper>
        {sent ? (
          <div className="form text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-50 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#2d79f3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bağlantı Gönderildi</h2>
            <p className="p text-gray-500 mb-8">Lütfen <b>{email}</b> adresini kontrol edin. Şifrenizi sıfırlamak için bir bağlantı gönderdik.</p>
            <Link to="/login" className="w-full">
              <button className="button-submit" type="button">Giriş Sayfasına Dön</button>
            </Link>
          </div>
        ) : (
          <form className="form" onSubmit={handleReset}>
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Şifremi Unuttum</h1>
              <p className="text-sm text-gray-500 mt-2">Sıfırlama bağlantısı almak için e-postanızı girin</p>
            </div>

            <div className="flex-column">
              <label>E-posta</label>
              <div className="inputForm relative">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  placeholder="E-posta adresinizi girin"
                  className="input"
                  type="email"
                  value={email}
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

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-medium border border-red-100 animate-pulse text-center">
                {error}
              </div>
            )}

            <button className="button-submit" disabled={loading} type="submit">
              {loading ? "İşleniyor..." : "Bağlantı Gönder"}
            </button>
            
            <p className="p">
              Şifrenizi hatırladınız mı? <Link to="/login"><span className="span">Giriş Yap</span></Link>
            </p>
          </form>
        )}
      </StyledWrapper>
    </div>
  );
};

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
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05), 0 10px 20px -5px rgba(0, 0, 0, 0.02);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    background: transparent;
    border: none;
    outline: none;
    font-size: 15px;
    color: #111827;
    width: 100%;
    padding: 0 4px;
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

  .p {
    text-align: center;
    color: #4b5563;
    font-size: 14px;
    margin-top: 16px;
  }

  .span {
    color: #2d79f3;
    font-weight: 600;
    cursor: pointer;
    margin-left: 4px;
  }

  .span:hover {
    text-decoration: underline;
  }
`;

export default ForgotPassword;
