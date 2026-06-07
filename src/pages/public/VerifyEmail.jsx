import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Mail, ArrowRight, RefreshCcw, Loader2 } from "lucide-react";
import { verifyEmail, resendVerification } from "@/services/authService";
import toast from "react-hot-toast";
import { useAuth } from "@/store/AuthContext";


const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");

  const [userId, setUserId] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const { login: authLoginContext } = useAuth();
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Kayıt sayfasından gelen bilgileri al
    const stateEmail = location.state?.email;
    const stateUserId = location.state?.userId;
    const statePassword = location.state?.password;
    
    if (stateEmail) setEmail(stateEmail);
    if (stateUserId) setUserId(stateUserId);
    if (statePassword) setPassword(statePassword);
    
    // Eğer userId yoksa (direkt URL'den girilmişse) login'e atabiliriz
    // Ama belki kullanıcı login olduktan sonra buraya gelmiştir
  }, [location]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Otomatik odaklanma
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
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
      document.getElementById(`code-${nextFocusIndex}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return toast.error("Lütfen 6 haneli kodu giriniz.");

    if (!userId) {
      toast.error("Kullanıcı kimliği (UserId) bulunamadı. Lütfen tekrar giriş yapın.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setLoading(true);
    try {
      console.log("Verifying with payload:", { email, fullCode, userId });
      await verifyEmail(email, fullCode, userId);
      toast.success("E-posta adresiniz başarıyla doğrulandı!");
      
      if (password) {
        toast.loading("Giriş yapılıyor...", { id: "autoLogin" });
        const { login: performLogin } = await import("@/services/authService");
        const result = await performLogin(email, password);
        authLoginContext(result);
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...", { id: "autoLogin" });
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || "Doğrulama kodu hatalı veya süresi dolmuş.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await resendVerification(email);
      toast.success("Yeni doğrulama kodu e-posta adresinize gönderildi.");
      setCooldown(60); // 60 saniye cooldown
    } catch (error) {
      toast.error(error.message || "Kod gönderilirken bir hata oluştu.");
    } finally {
      setResending(false);
    }
  };

  return (
    <PageWrapper>
      <Container>
        <IconWrapper>
          <Mail size={40} />
        </IconWrapper>
        
        <Title>E-postanızı Doğrulayın</Title>
        <Description>
          {email ? (
            <><strong>{email}</strong> adresine 6 haneli bir doğrulama kodu gönderdik.</>
          ) : (
            "E-posta adresinize 6 haneli bir doğrulama kodu gönderdik."
          )}
          <br />Lütfen kodu aşağıya giriniz.
        </Description>

        <form onSubmit={handleSubmit}>
          <CodeGrid>
            {code.map((digit, idx) => (
              <CodeInput
                key={idx}
                id={`code-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoFocus={idx === 0}
              />
            ))}
          </CodeGrid>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <>Doğrula <ArrowRight size={18} /></>}
          </SubmitButton>
        </form>

        <ResendSection>
          <span>Kod gelmedi mi?</span>
          <button onClick={handleResend} disabled={resending || cooldown > 0}>
            {resending ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <RefreshCcw size={14} /> 
                {cooldown > 0 ? `Tekrar Gönder (${cooldown}s)` : "Tekrar Gönder"}
              </>
            )}
          </button>
        </ResendSection>
      </Container>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 20px;

  .dark & {
    background: #0f172a;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 36px;
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  text-align: center;
  border: 1px solid #f1f5f9;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;

  .dark & {
    background: #1e3a5f;
    color: #60a5fa;
  }
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;

  .dark & {
    color: #f1f5f9;
  }
`;

const Description = styled.p`
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 28px;

  strong {
    color: #0f172a;
    .dark & { color: #e2e8f0; }
  }

  .dark & {
    color: #94a3b8;
  }
`;

const CodeGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
  width: 100%;
`;

const CodeInput = styled.input`
  width: 44px;
  height: 52px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s;
  outline: none;

  .dark & {
    background: #0f172a;
    border-color: #334155;
    color: #f1f5f9;
  }

  &:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);

    .dark & {
      background: #1e293b;
    }
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 44px;
    font-size: 18px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 52px;
  background: #3b82f6;
  color: white;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-bottom: 24px;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ResendSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;

  .dark & {
    color: #94a3b8;
  }

  button {
    color: #3b82f6;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    &:hover { text-decoration: underline; }
    &:disabled { opacity: 0.5; }
  }
`;

export default VerifyEmail;

