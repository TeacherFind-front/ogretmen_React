import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import styled from "styled-components";
import { 
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import { getCities, getDistricts, getNeighborhoods } from "@/services/locationService";
import { register } from "@/services/authService";
import { useAuth } from "@/store/AuthContext";

const inputCls = "w-full px-3 py-2 text-[13px] border border-[#d4d4d0] dark:border-[var(--card-border)] rounded-lg bg-white dark:bg-[var(--card-bg)] text-[#111] dark:text-[var(--text-primary)] transition-all focus:outline-none focus:border-[#16a34a] dark:focus:border-[#22c55e] focus:ring-1 focus:ring-[#16a34a] placeholder-gray-400 dark:placeholder-gray-500";
const labelCls = "block text-[12px] font-medium text-[#333] dark:text-[var(--text-primary)] mb-1";
const selectStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundPosition: "right 8px center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "16px",
};
const selectCls = inputCls + " appearance-none cursor-pointer pr-8";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null);
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

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    cityId: "",
    districtId: "",
    neighborhoodId: "",
    gender: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    getCities().then(setCities).catch(console.error);
  }, []);

  const handleInputChange = async (e) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "phoneNumber") {
      let digits = value.replace(/\D/g, '');
      if (digits.startsWith('0')) digits = digits.substring(1);
      digits = digits.substring(0, 10);
      let res = '';
      if (digits.length > 0) res += digits.substring(0, 3);
      if (digits.length > 3) res += ' ' + digits.substring(3, 6);
      if (digits.length > 6) res += ' ' + digits.substring(6, 8);
      if (digits.length > 8) res += ' ' + digits.substring(8, 10);
      newValue = res;
    }

    setFormData(prev => ({ ...prev, [id]: newValue }));

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

    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler uyuşmuyor, lütfen kontrol edin.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }

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

      const res = await register(payload);
      toast.success("Kayıt başarılı! Lütfen e-postanızı doğrulayın.");
      setTimeout(() => {
        navigate("/verify-email", { state: { email: payload.email, userId: res?.userId, password: payload.password } });
      }, 2000);
    } catch (error) {
      toast.error("Kayıt olurken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep0 = () => (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-[var(--page-bg)]">
      <div className="w-full max-w-2xl bg-white dark:bg-[var(--card-bg)] rounded-3xl shadow-xl p-8 md:p-12">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[var(--text-primary)] text-center mb-2">Hoş Geldiniz</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">Devam etmek için size uygun olan rolü seçin</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard $active={role === 'student'} onClick={() => { setRole('student'); setStep(1); }} className="group">
            <div className="image-box">
              <img src="https://img.icons8.com/3d-fluency/188/student-male--v2.png" alt="Öğrenci" className="transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Öğrenci Olmak İstiyorum</h3>
            <p>En iyi eğitmenlerden ders alarak hedeflerine ulaş.</p>
            <div className="check-icon"><CheckCircle2 /></div>
          </RoleCard>
          <RoleCard $active={role === 'tutor'} onClick={() => { setRole('tutor'); setStep(1); }} className="group">
            <div className="image-box">
              <img src="https://img.icons8.com/3d-fluency/188/training.png" alt="Eğitmen" className="transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Eğitmen Olmak İstiyorum</h3>
            <p>Bilgini paylaş, kendi programını oluştur ve kazanmaya başla.</p>
            <div className="check-icon"><CheckCircle2 /></div>
          </RoleCard>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="text-center mb-5">
        <p className="text-xs text-[#111] dark:text-gray-300 mb-1 font-medium">Hesabınızı Oluşturun</p>
        <h1 className="text-2xl md:text-3xl font-medium text-[#111] dark:text-[var(--text-primary)] mb-5 leading-[1.1] tracking-tight">
          {role === 'student' ? (
            <>Öğrenci<br />Kayıt</>
          ) : (
            <>Eğitmen<br />Kayıt</>
          )}
        </h1>
      </div>

      <div className="text-base font-semibold mb-3 text-[#111] dark:text-[var(--text-primary)]">Kayıt Ol</div>

      <form onSubmit={handleFinalSubmit} className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Ad Soyad</label>
          <input id="fullName" value={formData.fullName} onChange={handleInputChange} required className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>E-posta Adresi</label>
          <input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ornek@mail.com" required className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Şehir</label>
            <select id="cityId" value={formData.cityId} onChange={handleInputChange} required className={selectCls} style={selectStyle}>
              <option value="">Şehir Seçin</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Telefon</label>
            <input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} placeholder="5XX XXX XX XX" maxLength={13} required className={inputCls} />
          </div>
        </div>

        {role === 'tutor' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>İlçe</label>
              <select id="districtId" value={formData.districtId} onChange={handleInputChange} required disabled={!formData.cityId} className={selectCls} style={selectStyle}>
                <option value="">İlçe Seçin</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Mahalle</label>
              <select id="neighborhoodId" value={formData.neighborhoodId} onChange={handleInputChange} required disabled={!formData.districtId} className={selectCls} style={selectStyle}>
                <option value="">Mahalle Seçin</option>
                {neighborhoods.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Cinsiyet</label>
          <select id="gender" value={formData.gender} onChange={handleInputChange} required className={selectCls} style={selectStyle}>
            <option value="">Cinsiyet Seçin</option>
            <option value="female">Kadın</option>
            <option value="male">Erkek</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Şifre</label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className={inputCls + " pr-8"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 text-[#999] dark:text-gray-400 hover:text-[#333] dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Şifreyi Tekrar Girin</label>
            <div className="relative flex items-center">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
                className={inputCls + " pr-8"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 text-[#999] dark:text-gray-400 hover:text-[#333] dark:hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", boxShadow: "0 4px 16px rgba(22,163,74,0.2)" }}
            className="w-full text-white py-2 rounded-lg font-medium text-[13px] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {loading ? "Kaydediliyor..." : "Onayla ve Devam Et"}
          </button>
        </div>

        <div className="text-center mt-3 text-[#666] dark:text-gray-400 text-[12px]">
          Zaten bir hesabınız var mı?{" "}
          <Link to="/login" className="text-[#111] dark:text-[var(--text-primary)] font-semibold hover:underline">
            Giriş Yap
          </Link>
        </div>
      </form>
    </div>
  );

  if (step === 0) return renderStep0();

  const heroBg = role === 'student'
    ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    : "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-[#f8f8f6] dark:bg-[var(--page-bg)] flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300">

      {/* ── MOBİL ÜSTÜ HERO BANNER (sadece md altında görünür) ── */}
      <div className="md:hidden relative w-full h-52 flex-shrink-0">
        <img
          src={heroBg}
          alt="hero"
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#f8f8f6] dark:to-[var(--page-bg)]" />
        {/* Geri butonu */}
        <button
          onClick={() => setStep(0)}
          className="absolute top-4 left-4 z-10 w-8 h-8 bg-white/80 dark:bg-[var(--card-bg)]/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-black dark:text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} />
        </button>
        {/* Rol rozeti */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <span className="bg-white/90 dark:bg-[var(--card-bg)]/90 backdrop-blur-sm text-[#18181b] dark:text-[var(--text-primary)] text-xs font-semibold px-4 py-1.5 rounded-full shadow">
            {role === 'student' ? '🎓 Öğrenci Kaydı' : '📚 Eğitmen Kaydı'}
          </span>
        </div>
      </div>

      {/* Öğrenci: Görsel Solda (sadece masaüstü) */}
      {role === 'student' && (
        <div className="hidden md:block md:w-1/2 lg:w-[45%] h-screen relative">
          <img src={heroBg} alt="Student" className="w-full h-full object-cover" />
          {/* Sol tarafta overlay yazısı */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent flex flex-col justify-end p-10">
            <h2 className="text-white text-3xl font-bold drop-shadow-lg">Öğrenmeye<br />Başla</h2>
            <p className="text-white/80 text-sm mt-2 drop-shadow">En iyi eğitmenlerden ders al</p>
          </div>
        </div>
      )}

      {/* Form Alanı */}
      <div className="w-full md:w-1/2 lg:w-[55%] min-h-screen md:min-h-0 flex items-start md:items-center justify-center px-5 pt-4 pb-10 md:p-4 relative overflow-y-auto">

        {/* Desktop Back Button */}
        <button
          onClick={() => setStep(0)}
          className="hidden md:flex absolute top-6 left-6 w-8 h-8 bg-white dark:bg-[var(--card-bg)] rounded-full items-center justify-center shadow-sm hover:shadow-md transition-shadow text-[#111] dark:text-[var(--text-primary)] border border-gray-100 dark:border-[var(--card-border)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>

        <div className="w-full py-4 md:py-6">
          {renderStep1()}
        </div>
      </div>

      {/* Eğitmen: Görsel Sağda (sadece masaüstü) */}
      {role === 'tutor' && (
        <div className="hidden md:block md:w-1/2 lg:w-[45%] h-screen relative">
          <img src={heroBg} alt="Teacher" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent flex flex-col justify-end p-10 items-end text-right">
            <h2 className="text-white text-3xl font-bold drop-shadow-lg">Ders Ver,<br />Kazan</h2>
            <p className="text-white/80 text-sm mt-2 drop-shadow">Kendi programını oluştur</p>
          </div>
        </div>
      )}

    </div>
  );
};

const RoleCard = styled.div`
  background: ${props => props.$active ? '#f0fdf4' : '#ffffff'};
  border: 2px solid ${props => props.$active ? '#16a34a' : '#f1f5f9'};
  .dark & {
    background: ${props => props.$active ? '#14532d' : 'var(--card-bg)'};
    border-color: ${props => props.$active ? '#16a34a' : 'var(--card-border)'};
  }
  border-radius: 24px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px -10px rgba(22, 163, 74, 0.15);
    border-color: ${props => props.$active ? '#16a34a' : '#bbf7d0'};
    .dark & {
      border-color: ${props => props.$active ? '#16a34a' : 'var(--card-border)'};
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
    }
  }

  .image-box {
    width: 120px;
    height: 120px;
    margin: 0 auto 24px auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--card-bg);
    .dark & { color: var(--text-primary); }
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
    .dark & { color: var(--text-muted); }
    line-height: 1.5;
  }

  .check-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #16a34a;
    opacity: ${props => props.$active ? 1 : 0};
    transform: scale(${props => props.$active ? 1 : 0.5});
    transition: all 0.2s ease;
  }
`;

export default Register;
