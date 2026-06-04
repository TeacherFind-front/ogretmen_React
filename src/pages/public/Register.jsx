import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { 
  GraduationCap, 
  UserRoundCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { getCities, getDistricts, getNeighborhoods } from "@/services/locationService";
import { register } from "@/services/authService";
import { useAuth } from "@/store/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState(0); // 0: Role, 1: Account
  const [role, setRole] = useState(null); // 'student' or 'tutor'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedRole = searchParams.get('role');
    if (requestedRole === 'tutor') {
      setRole('tutor');
      setStep(1);
    } else if (requestedRole === 'student') {
      setRole('student');
      setStep(1);
    }
  }, [searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    cityId: "",
    gender: ""
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    getCities().then(setCities).catch(console.error);
  }, []);

  const handleInputChange = async (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
 
    if (id === "cityId") {
      setDistricts([]);
      setNeighborhoods([]);
      setFormData(prev => ({ ...prev, districtId: "", neighborhoodId: "" }));
      if (value && role === 'tutor') {
        const data = await getDistricts(value);
        setDistricts(data);
      }
    }
 
    if (id === "districtId") {
      setNeighborhoods([]);
      setFormData(prev => ({ ...prev, neighborhoodId: "" }));
      if (value && role === 'tutor') {
        const data = await getNeighborhoods(value);
        setNeighborhoods(data);
      }
    }
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const userRole = role === "tutor" ? 2 : 1;
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: userRole,
        phoneNumber: formData.phoneNumber,
        cityId: formData.cityId || null,
        districtId: role === 'tutor' ? (formData.districtId || null) : null,
        neighborhoodId: role === 'tutor' ? (formData.neighborhoodId || null) : null,
        gender: formData.gender || null
      };

      console.log("Giden Kayıt Verisi:", payload);

      const res = await register(payload);

      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      
      // Email doğrulama atlandığı için doğrudan giriş sayfasına yönlendir
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error("Kayıt olurken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep0 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Hoş Geldiniz</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-10">Devam etmek için size uygun olan rolü seçin</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoleCard $active={role === 'student'} onClick={() => { setRole('student'); setStep(1); }}>
          <div className="icon-box"><GraduationCap /></div>
          <h3>Öğrenci Olmak İstiyorum</h3>
          <p>En iyi eğitmenlerden ders alarak hedeflerine ulaş.</p>
          <div className="check-icon"><CheckCircle2 /></div>
        </RoleCard>
        <RoleCard $active={role === 'tutor'} onClick={() => { setRole('tutor'); setStep(1); }}>
          <div className="icon-box"><UserRoundCheck /></div>
          <h3>Eğitmen Olmak İstiyorum</h3>
          <p>Bilgini paylaş, kendi programını oluştur ve kazanmaya başla.</p>
          <div className="check-icon"><CheckCircle2 /></div>
        </RoleCard>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <StepWrapper>
      <div className="header">
        <button onClick={() => setStep(0)} className="back-btn"><ArrowLeft className="w-4 h-4" /> Geri</button>
        <h2>Hesap Bilgileri</h2>
        <p>Hesabınızı oluşturmak için temel bilgilerinizi girin.</p>
      </div>
      <form onSubmit={handleFinalSubmit}>
        <div className="form-grid">
          <InputGroup>
            <label>Ad Soyad</label>
            <input id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Adınız ve Soyadınız" required />
          </InputGroup>
          <InputGroup>
            <label>E-posta</label>
            <input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ornek@mail.com" required />
          </InputGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup>
              <label>Şehir</label>
              <select id="cityId" value={formData.cityId} onChange={handleInputChange} required>
                <option value="">Şehir Seçin</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </InputGroup>
            <InputGroup>
              <label>Telefon Numarası</label>
              <input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} placeholder="05XX XXX XX XX" required />
            </InputGroup>
          </div>
 
          {role === 'tutor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <InputGroup>
                <label>İlçe</label>
                <select id="districtId" value={formData.districtId} onChange={handleInputChange} required disabled={!formData.cityId}>
                  <option value="">İlçe Seçin</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </InputGroup>
              <InputGroup>
                <label>Mahalle</label>
                <select id="neighborhoodId" value={formData.neighborhoodId} onChange={handleInputChange} required disabled={!formData.districtId}>
                  <option value="">Mahalle Seçin</option>
                  {neighborhoods.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </InputGroup>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup>
              <label>Cinsiyet</label>
              <select id="gender" value={formData.gender} onChange={handleInputChange} required>
                <option value="">Cinsiyet Seçin</option>
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
              </select>
            </InputGroup>
            <InputGroup>
              <label>Şifre</label>
              <input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="********" required />
            </InputGroup>
          </div>
        </div>
        <div className="footer">
          <button type="submit" disabled={loading} className="next-btn primary">
            {loading ? "Kaydediliyor..." : "Kaydı Tamamla"} 
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </StepWrapper>
  );

  return (
    <PageBackground>
      <MainContainer>
        {step === 0 ? renderStep0() : renderStep1()}
        
        <ProgressDots>
          {[0, 1].map(s => (
            <Dot key={s} $active={step === s} $completed={step > s} />
          ))}
        </ProgressDots>
      </MainContainer>
    </PageBackground>
  );
};

const PageBackground = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  .dark & { background: linear-gradient(135deg, #0f172a 0%, #020617 100%); }
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
`;

const MainContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background: white;
  .dark & { background: #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  padding: 48px;
  transition: all 0.3s ease;
`;

const RoleCard = styled.div`
  background: ${props => props.$active ? '#eff6ff' : '#ffffff'};
  border: 2px solid ${props => props.$active ? '#3b82f6' : '#f1f5f9'};
  .dark & { 
    background: ${props => props.$active ? '#1e3a8a' : '#0f172a'};
    border-color: ${props => props.$active ? '#3b82f6' : '#334155'};
  }
  border-radius: 24px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
    border-color: ${props => props.$active ? '#3b82f6' : '#cbd5e1'};
    .dark & { border-color: ${props => props.$active ? '#3b82f6' : '#475569'}; }
  }

  .icon-box {
    width: 64px;
    height: 64px;
    background: ${props => props.$active ? '#3b82f6' : '#f8fafc'};
    color: ${props => props.$active ? 'white' : '#64748b'};
    .dark & {
      background: ${props => props.$active ? '#3b82f6' : '#1e293b'};
      color: ${props => props.$active ? 'white' : '#94a3b8'};
    }
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    .dark & { color: white; }
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
    .dark & { color: #94a3b8; }
    line-height: 1.5;
  }

  .check-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #3b82f6;
    opacity: ${props => props.$active ? 1 : 0};
    transform: scale(${props => props.$active ? 1 : 0.5});
    transition: all 0.2s ease;
  }
`;

const StepWrapper = styled.div`
  .header {
    margin-bottom: 32px;
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      .dark & { color: #94a3b8; }
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      &:hover { color: #1e293b; .dark & { color: white; } }
    }

    h2 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      .dark & { color: white; }
      margin-bottom: 8px;
    }

    p {
      color: #64748b;
      .dark & { color: #94a3b8; }
      font-size: 15px;
    }
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .footer {
    margin-top: 40px;
    display: flex;
    justify-content: flex-end;
  }

  .next-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: #3b82f6;
    color: white;
    border-radius: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    &:hover { background: #2563eb; transform: translateY(-1px); }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    .dark & { color: #cbd5e1; }
  }

  input, select {
    padding: 14px 18px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-size: 15px;
    background: #f8fafc;
    color: #0f172a;
    .dark & { 
      background: #0f172a; 
      border-color: #334155; 
      color: white; 
    }
    transition: all 0.2s;
    &:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      .dark & { background: #020617; }
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  }
  
  select option {
    background: white;
    color: #0f172a;
    .dark & {
      background: #0f172a;
      color: white;
    }
  }
`;

const ProgressDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;
`;

const Dot = styled.div`
  width: ${props => props.$active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background: ${props => props.$active ? '#3b82f6' : props.$completed ? '#94a3b8' : '#e2e8f0'};
  .dark & {
    background: ${props => props.$active ? '#3b82f6' : props.$completed ? '#64748b' : '#334155'};
  }
  transition: all 0.3s ease;
`;

export default Register;
