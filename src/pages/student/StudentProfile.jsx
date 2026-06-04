import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Loader2, Camera, CheckCircle2, AlertCircle, Save, Bell, User, Heart, Settings } from "lucide-react";
import { getStudentProfile, updateStudentProfile, uploadStudentAvatar } from "@/services/studentService";
import { getCities } from "@/services/locationService";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/Skeleton";
import BASE_URL, { getImageUrl } from "@/services/api";

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [cities, setCities] = useState([]);
  const fileInputRef = React.useRef(null);
  
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    cityId: "",
    bio: "",
    avatarUrl: null
  });

  const loadProfileData = async () => {    try {
      const [data, citiesData] = await Promise.all([
        getStudentProfile(),
        getCities()
      ]);
      setCities(citiesData);
      if (data) {
        setProfile({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          cityId: data.cityId || "",
          cityName: data.cityName || "",
          bio: data.bio || "",
          avatarUrl: getImageUrl(data.profileImageUrl)
        });
      }
    } catch (err) {
      console.error("Profil yüklenirken hata oluştu", err);
      setStatus({ type: "error", message: "Bilgiler yüklenemedi." });
      toast.error("Profil bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const extension = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      toast.error("Sadece .jpg, .jpeg, .png veya .webp dosyaları yüklenebilir.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dosya boyutu en fazla 2 MB olabilir.");
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);

    setUploadLoading(true);
    try {
      const result = await uploadStudentAvatar(file);
      setProfile(prev => ({ ...prev, avatarUrl: getImageUrl(result.profileImageUrl) }));
      setStatus({ type: "success", message: "Profil resmi güncellendi!" });
      toast.success("Profil resmi güncellendi.");
      // Verileri yenileyelim
      loadProfileData();
    } catch (err) {
      toast.error(err.message || "Resim yükleme başarısız.");
      setStatus({ type: "error", message: err.message || "Resim yükleme başarısız." });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setStatus({ type: null, message: "" });
    
    try {
      await updateStudentProfile({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        cityId: profile.cityId,
        bio: profile.bio
      });
      setStatus({ type: "success", message: "Profil bilgileriniz kaydedildi!" });
      toast.success("Profil başarıyla güncellendi.");
      // Verileri yenileyelim
      loadProfileData();
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    } catch (err) {
      toast.error(err.message || "Kaydetme sırasında bir hata oluştu.");
      setStatus({ type: "error", message: err.message || "Kaydetme sırasında bir hata oluştu." });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8">
        <header className="mb-12">
          <Skeleton height="48px" width="300px" className="mb-4" borderRadius="16px" />
          <Skeleton height="24px" width="50%" borderRadius="12px" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton height="300px" borderRadius="32px" />
            <Skeleton height="200px" borderRadius="32px" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton height="600px" borderRadius="32px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Profil Ayarları</h1>
        <p className="text-gray-500 dark:text-slate-400 font-medium mt-2">Kişisel bilgilerinizi ve öğrenme tercihlerinizi yönetin.</p>
      </header>

      {status.message && (
        <AlertBox $type={status.type}>
          {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{status.message}</span>
        </AlertBox>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex flex-col items-center p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
              <div className="relative mb-6">
                <AvatarWrapper $loading={uploadLoading}>
                  {uploadLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  ) : profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={60} className="text-blue-100" />
                  )}
                </AvatarWrapper>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 p-3 bg-blue-600 rounded-2xl text-white shadow-xl border-4 border-white hover:bg-blue-700 transition-all"
                >
                  <Camera size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">{profile.fullName}</h2>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-1 rounded-full mt-3">Öğrenci Hesabı</span>
            </div>
          </Card>

          <Card>
            <div className="p-8">
              <h3 className="font-black text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-gray-400" /> Hızlı Erişim
              </h3>
              <div className="space-y-3">
                <MenuLink to="/student/messages">
                  <div className="icon">💬</div>
                  <span>Mesajlarım</span>
                </MenuLink>
                <MenuLink to="/student/lessons">
                  <div className="icon">📅</div>
                  <span>Randevularım</span>
                </MenuLink>
                <MenuLink to="/student/favorites">
                  <div className="icon">❤️</div>
                  <span>Favori Hocalarım</span>
                </MenuLink>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSave} className="p-10 space-y-12">
              <section>
                <SectionTitle>
                  <div className="line bg-blue-600" />
                  Kişisel Bilgiler
                </SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormGroup>
                    <label>Ad Soyad</label>
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} required />
                  </FormGroup>
                  <FormGroup className="opacity-70">
                    <label>E-posta (Değiştirilemez)</label>
                    <input type="email" value={profile.email} disabled />
                  </FormGroup>
                  <FormGroup>
                    <label>Telefon</label>
                    <input type="text" value={profile.phoneNumber} onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})} />
                  </FormGroup>
                  <FormGroup>
                    <label>Şehir</label>
                    <select value={profile.cityId} onChange={(e) => setProfile({...profile, cityId: e.target.value})}>
                      <option value="">Şehir Seçin</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
              </section>

              <section>
                <SectionTitle>
                  <div className="line bg-purple-500" />
                  Öğrenme Tercihleri
                </SectionTitle>
                <div className="space-y-8">
                  <FormGroup>
                    <label>Kısa Biyografi</label>
                    <textarea 
                      rows="5" 
                      placeholder="Kendinizden kısaca bahsedin..." 
                      value={profile.bio} 
                      onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                    />
                  </FormGroup>
                </div>
              </section>

              <div className="flex justify-end pt-8 border-t border-gray-50 dark:border-slate-800">
                <SaveButton type="submit" disabled={saveLoading}>
                  {saveLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                  Değişiklikleri Kaydet
                </SaveButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 32px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const AvatarWrapper = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 48px;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s;
  ${props => props.$loading && `opacity: 0.5; filter: blur(2px);`}
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;

  .dark & {
    color: #f1f5f9;
  }

  .line {
    width: 6px;
    height: 24px;
    border-radius: 10px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-size: 13px;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-left: 4px;
    .dark & { color: #94a3b8; }
  }

  input, textarea, select {
    padding: 16px 20px;
    border-radius: 20px;
    border: 2px solid #f1f5f9;
    background: #f8fafc;
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    width: 100%;
    transition: all 0.2s;
    
    .dark & {
      background: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
    }

    &:focus { 
      outline: none; 
      border-color: #2d79f3; 
      background: white; 
      box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.05);
      .dark & { background: #0f172a; border-color: #3b82f6; }
    }
    &:disabled { 
      background: #f1f5f9; 
      color: #94a3b8; 
      cursor: not-allowed;
      .dark & { background: #1e293b; color: #475569; }
    }
  }
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  color: #1e293b;
  font-weight: 800;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.2s;

  .dark & {
    background: #0f172a;
    border-color: #334155;
    color: #f1f5f9;
  }

  .icon { font-size: 20px; }

  &:hover {
    border-color: #2d79f3;
    color: #2d79f3;
    background: #f3f7ff;
    transform: translateX(4px);
    .dark & { background: #1e3a8a30; border-color: #3b82f6; color: #3b82f6; }
  }
`;

const SaveButton = styled.button`
  background: #2d79f3;
  color: white;
  padding: 18px 36px;
  border-radius: 24px;
  font-weight: 900;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  box-shadow: 0 10px 20px rgba(45, 121, 243, 0.2);
  &:hover { background: #1e40af; transform: translateY(-2px); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 20px;
  margin-bottom: 30px;
  font-weight: 700;
  font-size: 14px;
  ${props => props.$type === 'success' ? `
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #10b98120;
  ` : `
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #ef444420;
  `}
`;
