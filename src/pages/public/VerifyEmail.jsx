import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Mail, ArrowRight, RefreshCcw, Loader2 } from "lucide-react";
import { verifyEmail, resendVerification } from "@/services/authService";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");

  const [userId, setUserId] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Kayıt sayfasından gelen bilgileri al
    const stateEmail = location.state?.email;
    const stateUserId = location.state?.userId;
    
    if (stateEmail) setEmail(stateEmail);
    if (stateUserId) setUserId(stateUserId);
    
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return toast.error("Lütfen 6 haneli kodu giriniz.");

    setLoading(true);
    try {
      await verifyEmail(userId, fullCode);
      toast.success("E-posta adresiniz başarıyla doğrulandı!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
`;

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 48px;
  border-radius: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
`;

const Description = styled.p`
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 40px;
  strong { color: #0f172a; }
`;

const CodeGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
  width: 100%;
`;

const CodeInput = styled.input`
  width: 50px;
  height: 60px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s;
  outline: none;

  &:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 50px;
    font-size: 20px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 60px;
  background: #3b82f6;
  color: white;
  border-radius: 18px;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-bottom: 32px;

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
  font-size: 14px;
  color: #64748b;

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
