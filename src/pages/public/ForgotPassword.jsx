import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { forgotPassword, resetPassword } from "@/services/authService";
import toast from "react-hot-toast";
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Pass
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Sıfırlama kodu e-posta adresinize gönderildi.");
      setStep(2);
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`reset-code-${index + 1}`).focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`reset-code-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newCode[i] = pastedData[i];
      }
      setCode(newCode);
      const nextFocusIndex = pastedData.length < 6 ? pastedData.length : 5;
      const targetElement = document.getElementById(`reset-code-${nextFocusIndex}`);
      if (targetElement) {
        targetElement.focus();
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return toast.error("Kod 6 haneli olmalıdır.");
    if (newPassword.length < 6)
      return toast.error("Yeni şifre en az 6 karakter olmalıdır.");

    setLoading(true);
    try {
      await resetPassword(email, fullCode, newPassword);
      toast.success("Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.message || "Şifre sıfırlama başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-140px)] w-full items-center justify-center py-6 bg-transparent px-4">
      <StyledWrapper>
        {step === 1 ? (
          <form className="form" onSubmit={handleRequestCode}>
            <div className="text-center mb-4">
              <div className="flex justify-center mb-6">
                <div className="bg-green-50 p-4 rounded-3xl text-green-600">
                  <Mail size={32} />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[var(--text-primary)]">
                Şifremi Unuttum
              </h1>
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-2">
                Sıfırlama kodu almak için e-postanızı girin
              </p>
            </div>

            <div className="flex-column">
              <label>E-posta</label>
              <div className="inputForm">
                <Mail size={18} />
                <input
                  placeholder="E-posta adresinizi girin"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="button-submit" disabled={loading} type="submit">
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Kod Gönder"
              )}
            </button>

            <p className="p">
              Şifrenizi hatırladınız mı?{" "}
              <Link to="/login">
                <span className="span">Giriş Yap</span>
              </Link>
            </p>
          </form>
        ) : (
          <form className="form" onSubmit={handleResetPassword}>
            <div className="text-center mb-4">
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600">
                  <ShieldCheck size={32} />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[var(--text-primary)]">
                Şifreyi Sıfırla
              </h1>
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-2">
                E-postanıza gelen kodu ve yeni şifrenizi girin
              </p>
            </div>

            <div className="flex-column items-center">
              <label className="mb-4 dark:text-[var(--text-primary)]">Doğrulama Kodu</label>
              <div className="flex justify-center gap-2 mb-6">
                {code.map((digit, idx) => (
                  <OtpInput
                    key={idx}
                    id={`reset-code-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                    onPaste={handlePaste}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            <div className="flex-column">
              <label>Yeni Şifre</label>
              <div className="inputForm">
                <Lock size={18} />
                <input
                  placeholder="Yeni Şifreniz"
                  className="input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="button-submit" disabled={loading} type="submit">
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Şifreyi Güncelle"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-gray-400 hover:text-green-600 transition-colors"
            >
              E-postayı Değiştir
            </button>
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
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);

    .dark & {
      background-color: rgba(30, 41, 59, 0.7);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
    }
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

    .dark & {
      color: var(--text-primary);
    }
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

    .dark & {
      background-color: var(--page-bg);
      border-color: var(--card-border);
    }
  }

  .inputForm svg {
    color: #6b7280;
    flex-shrink: 0;
    margin-right: 8px;
  }

  .inputForm:focus-within {
    border-color: #16a34a;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);

    .dark & {
      background-color: var(--page-bg);
      box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
    }
  }

  .inputForm:focus-within svg {
    color: #16a34a;
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

    .dark & {
      color: #f1f5f9;
    }
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

    .dark & {
      background-color: #16a34a;
      &:hover {
        background-color: #1e40af;
      }
    }
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

    .dark & {
      color: var(--text-muted);
    }
  }

  .span {
    color: #16a34a;
    font-weight: 600;
    cursor: pointer;
    margin-left: 4px;
  }

  .span:hover {
    text-decoration: underline;
  }
`;

const OtpInput = styled.input`
  width: 45px;
  height: 55px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  background: #f8fafc;
  transition: all 0.2s;
  outline: none;

  &:focus {
    border-color: #16a34a;
    background: white;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);

    .dark & {
      background: var(--page-bg);
    }
  }

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
    color: #f1f5f9;
  }
`;

export default ForgotPassword;
