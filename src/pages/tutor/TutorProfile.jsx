import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Camera,
  MapPin,
  Calendar,
  Save,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Link as LinkIcon,
  Award,
  FileUp,
  Share2,
  Phone
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadCertificate,
} from "@/services/tutorService";
import BASE_URL, { getImageUrl } from "@/services/api";
import { getUniversities, getDepartments } from "@/services/educationService";
import { requestEmailChange, verifyEmailChange } from "@/services/authService";
import { useAuth } from "@/store/AuthContext";

/**
 * TutorProfile - Eğitmenin (Tutor) kendi profil bilgilerini yönettiği sayfa bileşeni.
 * Bu sayfa üzerinden eğitmen; kişisel bilgilerini (ad, telefon, headline), eğitim durumunu (üniversite, bölüm),
 * biyografisini, eğitim metotlarını, deneyimlerini, profil resmini (avatar) güncelleyebilir.
 * Ayrıca güvenlik amacıyla kayıtlı e-posta adresini doğrulama kodu aracılığıyla değiştirebilir.
 */
export default function TutorProfile() {
  // Profil verilerinin API'den ilk yüklenme aşamasını kontrol eden yükleniyor state'i.
  const [loading, setLoading] = useState(true);
  // Profil bilgilerini kaydederken (kaydet butonu) yüklenme animasyonunu kontrol eden state.
  const [saveLoading, setSaveLoading] = useState(false);
  // Profil resmi (avatar) sunucuya yüklenirken çalıştırılan yüklenme state'i.
  const [uploadLoading, setUploadLoading] = useState(false);
  // Kullanıcıya işlem durumunu bildiren uyarı mesajı state'i ({ type: "success"|"error", message: "..." }).
  const [status, setStatus] = useState({ type: null, message: "" });
  // Resim seçimi için gizli input elemanını tetikleyen DOM referansı.
  const fileInputRef = React.useRef(null);
  // E-posta değişikliği sonrası hesaptan çıkış yapıp tekrar giriş yaptırmak için auth context'ten logout fonksiyonu alınır.
  const { logout } = useAuth();

  // E-posta değiştirme modalının (pop-up) gösterilip gösterilmeyeceğini kontrol eden state.
  const [showEmailModal, setShowEmailModal] = useState(false);
  // E-posta değiştirme sürecinin adımlarını (1: Şifre ve Yeni Mail girişi, 2: Doğrulama Kodu girişi) tutan state.
  const [emailStep, setEmailStep] = useState(1);
  // Yeni e-posta adresi state'i.
  const [newEmail, setNewEmail] = useState("");
  // Kullanıcının mevcut şifresi (güvenlik doğrulaması için).
  const [currentPassword, setCurrentPassword] = useState("");
  // Yeni e-posta adresine gönderilen 6 haneli doğrulama kodu.
  const [emailCode, setEmailCode] = useState("");
  // E-posta değiştirme işlemi sırasındaki yüklenme state'i.
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  // E-posta değiştirme işlemi sırasında oluşan hata mesajını tutan state.
  const [emailChangeError, setEmailChangeError] = useState("");

  // Form üzerindeki tüm eğitmen profil alanlarını tutan birleşik state objesi.
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    universityId: "",
    department: "",
    departmentId: "",
    bio: "",
    headline: "",
    teachingStyle: "",
    experience: "",
    avatarUrl: null,
    certificates: [], // Sertifikaların listesi: { name, organization, year, fileUrl, link }
    socialLinks: { whatsapp: "", instagram: "", facebook: "", linkedin: "" },
    isPremium: false,
  });

  // Seçilebilir üniversitelerin listesini tutan state.
  const [universities, setUniversities] = useState([]);
  // Seçilen üniversiteye bağlı olarak listelenecek bölümlerin state'i.
  const [departments, setDepartments] = useState([]);

  // Sayfa yüklendiğinde eğitmen profil verilerini ve üniversite listesini sunucudan çeker
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProfile();
        if (data) {
          // Gelen verileri form state'ine aktar
          setProfile({
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phoneNumber || data.phone || "",
            university: data.university || "",
            universityId: data.universityId || "",
            department: data.department || "",
            departmentId: data.departmentId || "",
            bio: data.bio || "",
            headline: data.headline || "",
            teachingStyle: data.teachingStyle || "",
            experience: data.experience || "",
            // Profil resminin CDN/API yolunu tam URL olarak çözümler
            avatarUrl: getImageUrl(data.profileImageUrl),
            certificates: data.certificates || [],
            socialLinks: data.socialLinks || { whatsapp: "", instagram: "", facebook: "", linkedin: "" },
            isPremium: data.isPremium || false,
          });

          // Eğer eğitmenin zaten kayıtlı bir üniversitesi varsa, o üniversiteye ait bölümleri API'den çek
          if (data.universityId) {
            getDepartments(data.universityId)
              .then(setDepartments)
              .catch(console.error);
          }
        }

        // Tüm üniversiteler listesini API'den yükle (dropdown seçimi için)
        getUniversities().then(setUniversities).catch(console.error);
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false); // Yüklenme ekranını kapat
      }
    };
    load();
  }, []);

  /**
   * handleAvatarChange - Kullanıcı yeni bir profil resmi seçtiğinde çalışır.
   * Resmi öncelikle önizleme için yerel olarak okur (FileReader), ardından API'ye yükler.
   */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Tarayıcıda anlık önizleme oluşturma (yükleme tamamlanmadan resmi göstermek için)
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);

    // 2. Resmi backend API'ye gönderip sunucu tarafında güncelleme
    setUploadLoading(true);
    try {
      const result = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatarUrl: getImageUrl(result.profileImageUrl) }));
      setStatus({ type: "success", message: "Profil resmi güncellendi!" });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.message ||
          "Resim yükleme başarısız. Lütfen backend endpoint'i kontrol edin.",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  /**
   * handleSave - Profil güncelleme formunu sunucuya gönderir.
   */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setStatus({ type: null, message: "" }); // Önceki durum mesajlarını temizle

    try {
      // API'ye gönderilecek verileri düzenle
      const updateData = {
        fullName: profile.fullName,
        phoneNumber: profile.phone,
        bio: profile.bio,
        headline: profile.headline,
        teachingStyle: profile.teachingStyle,
        experience: profile.experience,
        universityId: profile.universityId || null,
        departmentId: profile.departmentId || null,
        university: profile.university,
        department: profile.department,
        socialLinks: profile.socialLinks,
      };

      // 1. Profil genel metin bilgilerini güncelle
      await updateMyProfile(updateData);

      // 2. Yeni eklenmiş (henüz id'si olmayan ve dosyası bulunan) sertifikaları yükle
      const newCerts = profile.certificates.filter((c) => c.file && !c.id);
      for (const cert of newCerts) {
        await uploadCertificate(cert.name, cert.file);
      }

      setStatus({
        type: "success",
        message: "Profiliniz başarıyla güncellendi!",
      });
      // Başarı mesajını 3 saniye sonra otomatik kaldır
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Güncelleme sırasında bir hata oluştu.",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  /**
   * handleRequestEmailChange - E-posta değişikliği talebini başlatır.
   * Mevcut şifreyi ve yeni girilen e-posta adresini doğrulayarak doğrulama kodu gönderir.
   */
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailChangeError("");
    setEmailChangeLoading(true);
    try {
      await requestEmailChange(currentPassword, newEmail);
      setEmailStep(2); // Doğrulama kodu adımına geç
    } catch (err) {
      setEmailChangeError(err.message || "Kod gönderilemedi. Lütfen şifrenizi kontrol edin.");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  /**
   * handleVerifyEmailChange - Gelen 6 haneli kodu doğrulayarak e-posta adresini kesin olarak değiştirir.
   * Güvenlik nedeniyle işlem başarılı olunca kullanıcı oturumunu kapatır ve çıkış yaptırır.
   */
  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    setEmailChangeError("");
    setEmailChangeLoading(true);
    try {
      await verifyEmailChange(newEmail, emailCode);
      setStatus({ type: "success", message: "E-postanız başarıyla değiştirildi! Güvenliğiniz için çıkış yapılıyor..." });
      setShowEmailModal(false);
      // 3 saniye gecikmeyle kullanıcıyı çıkış yapmaya yönlendir
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (err) {
      setEmailChangeError(err.message || "Kod doğrulanamadı.");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // İlk yüklenme ekranı
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }


  return (
    <Container>
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">
            Profil Yönetimi
          </h1>
          <p className="text-gray-500 dark:text-[var(--text-muted)] font-medium mt-1 text-sm">
            Kişisel bilgilerinizi ve uzmanlık detaylarınızı buradan güncelleyebilirsiniz.
          </p>
        </div>
      </header>

      {status.message && (
        <AlertBox $type={status.type}>
          {status.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{status.message}</span>
        </AlertBox>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex flex-col items-center p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-green-600"></div>
              <div className="relative mb-6">
                <AvatarWrapper $loading={uploadLoading}>
                  {uploadLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  ) : profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover rounded-[2rem]"
                    />
                  ) : (
                    <span className="text-3xl font-black text-green-600">
                      {profile.fullName.charAt(0)}
                    </span>
                  )}
                </AvatarWrapper>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />

                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-1 -right-1 p-2 bg-green-600 rounded-xl text-white shadow-lg border-2 border-white hover:bg-green-700 transition-all hover:scale-110"
                  disabled={uploadLoading}
                >
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)]">{profile.fullName}</h2>
              <p className="text-green-600 dark:text-green-400 font-bold text-sm mt-1 uppercase tracking-widest">
                Doğrulanmış Eğitmen
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSave} className="p-6">
              <section className="mb-10">
                <h3 className="text-lg font-black text-gray-900 dark:text-[var(--text-primary)] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                  Genel Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup>
                    <label>Tam Adınız</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup className="opacity-90">
                    <label>E-posta Adresi</label>
                    <div className="flex gap-3">
                      <input type="email" value={profile.email} readOnly disabled className="bg-gray-100 w-full" />
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowEmailModal(true);
                          setEmailStep(1);
                          setNewEmail("");
                          setCurrentPassword("");
                          setEmailCode("");
                          setEmailChangeError("");
                        }}
                        className="px-5 py-2 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-colors whitespace-nowrap dark:bg-[var(--card-bg)] dark:text-green-400 dark:hover:bg-slate-700"
                      >
                        Değiştir
                      </button>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <label>Telefon Numarası</label>
                    <input
                      type="text"
                      value={profile.phone}
                      placeholder="(5XX) XXX XX XX"
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 10) val = val.slice(0, 10);
                        let formatted = val;
                        if (val.length > 6) {
                          formatted = `(${val.slice(0, 3)}) ${val.slice(3, 6)} ${val.slice(6, 8)} ${val.slice(8)}`;
                        } else if (val.length > 3) {
                          formatted = `(${val.slice(0, 3)}) ${val.slice(3)}`;
                        } else if (val.length > 0) {
                          formatted = `(${val}`;
                        }
                        setProfile({ ...profile, phone: formatted });
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Profil Başlığı (Headline)</label>
                    <input
                      type="text"
                      value={profile.headline}
                      onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                      placeholder="Örn: Deneyimli Matematik Öğretmeni"
                    />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <FormGroup>
                    <label>Üniversite</label>
                    <select
                      value={profile.universityId}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedUni = universities.find(
                          (u) => (u.id || u.Id || u.code || u.Code)?.toString() === val
                        );
                        setProfile({
                          ...profile,
                          universityId: val,
                          university: selectedUni ? selectedUni.name || selectedUni.Name : "",
                          departmentId: "",
                          department: "",
                        });
                        if (val) {
                          getDepartments(val).then(setDepartments).catch(console.error);
                        } else {
                          setDepartments([]);
                        }
                      }}
                    >
                      <option value="">Üniversite Seçin</option>
                      {universities.map((uni) => {
                        const id = uni.id || uni.Id || uni.code || uni.Code;
                        const name = uni.name || uni.Name;
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Bölüm</label>
                    <select
                      value={profile.departmentId}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedDep = departments.find(
                          (d) => (d.id || d.Id || d.code || d.Code)?.toString() === val
                        );
                        setProfile({
                          ...profile,
                          departmentId: val,
                          department: selectedDep ? selectedDep.name || selectedDep.Name : "",
                        });
                      }}
                      disabled={!profile.universityId}
                    >
                      <option value="">
                        {profile.universityId ? "Bölüm Seçin" : "Önce Üniversite Seçin"}
                      </option>
                      {departments.map((dep) => {
                        const id = dep.id || dep.Id || dep.code || dep.Code;
                        const name = dep.name || dep.Name;
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </FormGroup>
                </div>
              </section>

              <section className="mb-12">
                <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-green-600 rounded-full"></div>
                  Hakkımda & Uzmanlık
                </h3>
                <div className="space-y-8">
                  <FormGroup>
                    <label>Biyografi</label>
                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={profile.bio}
                        onChange={(value) => setProfile({ ...profile, bio: value })}
                        placeholder="Öğrencilerinize kendinizden bahsedin..."
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['link'],
                            ['clean']
                          ],
                        }}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <label>Eğitim Metodu / Stil</label>
                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={profile.teachingStyle}
                        onChange={(value) => setProfile({ ...profile, teachingStyle: value })}
                        placeholder="Derslerinizi nasıl işlersiniz?"
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['clean']
                          ],
                        }}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <label>Deneyim (Yıl bazında detay)</label>
                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={profile.experience}
                        onChange={(value) => setProfile({ ...profile, experience: value })}
                        placeholder="Kaç yıldır bu alandasınız? Hangi kurumlarda çalıştınız?"
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['clean']
                          ],
                        }}
                      />
                    </div>
                  </FormGroup>
                </div>
              </section>



              <div className="flex justify-end pt-8 border-t border-gray-50">
                <SaveButton type="submit" disabled={saveLoading}>
                  {saveLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save size={20} className="mr-2" /> Bilgileri Kaydet
                    </>
                  )}
                </SaveButton>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {showEmailModal && (
        <ModalOverlay onClick={() => setShowEmailModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)]">
                E-posta Adresini Değiştir
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <span className="text-3xl font-light">&times;</span>
              </button>
            </div>

            {emailChangeError && (
              <AlertBox $type="error">
                <AlertCircle className="w-5 h-5" />
                <span>{emailChangeError}</span>
              </AlertBox>
            )}

            {emailStep === 1 ? (
              <form onSubmit={handleRequestEmailChange}>
                <FormGroup className="mb-4">
                  <label>Mevcut Şifreniz</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Güvenlik için mevcut şifreniz"
                  />
                </FormGroup>
                <FormGroup className="mb-6">
                  <label>Yeni E-posta Adresi</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Yeni e-posta adresinizi girin"
                  />
                </FormGroup>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-[var(--card-bg)] dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    İptal
                  </button>
                  <SaveButton type="submit" disabled={emailChangeLoading || !newEmail || !currentPassword}>
                    {emailChangeLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Kod Gönder"}
                  </SaveButton>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                  <strong>{newEmail}</strong> adresine gönderilen 6 haneli doğrulama kodunu girin.
                </p>
                <FormGroup className="mb-6">
                  <label>Doğrulama Kodu</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Örn: 123456"
                    className="text-center text-2xl tracking-[0.5em] font-black py-4"
                  />
                </FormGroup>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEmailStep(1)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-[var(--card-bg)] dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    Geri Dön
                  </button>
                  <SaveButton type="submit" disabled={emailChangeLoading || emailCode.length < 6}>
                    {emailChangeLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Onayla"}
                  </SaveButton>
                </div>
              </form>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 100px;
`;

const Card = styled.div`
  background: white;
  border-radius: 32px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: none;
  }
`;

const AvatarWrapper = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 45px;
  background: #f8faff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #f1f5f9;
  transition: all 0.3s;
  overflow: hidden;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }
  
  ${(props) =>
    props.$loading &&
    `
    opacity: 0.5;
    filter: blur(2px);
  `}
`;

const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 900;
  background: ${(props) => (props.$active ? "#dcfce7" : "#f1f5f9")};
  color: ${(props) => (props.$active ? "#166534" : "#64748b")};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .dark & {
    background: ${(props) => (props.$active ? "#064e3b40" : "var(--card-border)")};
    color: ${(props) => (props.$active ? "#34d399" : "var(--text-muted)")};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-size: 13px;
    font-weight: 800;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-left: 4px;

    .dark & {
      color: var(--text-muted);
    }
  }

  input,
  textarea,
  select {
    padding: 16px 20px;
    border-radius: 18px;
    border: 2px solid #f1f5f9;
    background: #f8fafc;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    width: 100%;
    transition: all 0.2s;

    .dark & {
      background: var(--page-bg);
      border-color: var(--card-border);
      color: #f1f5f9;
    }

    &:focus {
      outline: none;
      border-color: #16a34a;
      background: white;
      box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.05);

      .dark & {
        background: var(--page-bg);
        border-color: #16a34a;
        box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
      }
    }
    &:disabled {
      background: #f1f5f9;
      color: var(--text-muted);
      cursor: not-allowed;

      .dark & {
        background: var(--card-bg);
        color: #475569;
      }
    }
  }

  .quill-wrapper {
    .quill {
      background: #f8fafc;
      border-radius: 18px;
      border: 2px solid #f1f5f9;
      overflow: hidden;
      transition: all 0.2s;

      .dark & {
        background: var(--page-bg);
        border-color: var(--card-border);
      }

      &:focus-within {
        border-color: #16a34a;
        background: white;
        box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.05);

        .dark & {
          background: var(--page-bg);
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
        }
      }
    }

    .ql-toolbar.ql-snow {
      border: none;
      border-bottom: 2px solid #f1f5f9;
      background: #f1f5f9;
      padding: 12px;
      font-family: inherit;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;

      .dark & {
        background: var(--card-bg);
        border-color: var(--card-border);
      }

      .ql-picker-label {
        color: var(--text-primary);
        .dark & { color: #f1f5f9; }
      }
      .ql-stroke {
        stroke: #475569;
        .dark & { stroke: var(--text-primary); }
      }
      .ql-fill {
        fill: #475569;
        .dark & { fill: var(--text-primary); }
      }
    }

    .ql-container.ql-snow {
      border: none;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);

      .dark & {
        color: #f1f5f9;
      }
    }

    .ql-editor {
      min-height: 150px;
      padding: 16px 20px;
      font-size: 15px;

      &.ql-blank::before {
        font-style: normal;
        color: var(--text-muted);
        font-weight: 500;
      }
    }
  }
`;

const SaveButton = styled.button`
  background: #16a34a;
  color: white;
  padding: 16px 40px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  box-shadow: 0 10px 20px rgba(22, 163, 74, 0.2);
  &:hover {
    background: #1e40af;
    transform: translateY(-2px);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 20px;
  margin-bottom: 32px;
  font-weight: 700;
  background: ${(props) => (props.$type === "success" ? "#ecfdf5" : "#fef2f2")};
  color: ${(props) => (props.$type === "success" ? "#059669" : "#dc2626")};
  border: 1px solid ${(props) => (props.$type === "success" ? "#10b98120" : "#ef444420")};
`;

const PasswordChangeLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    border-color: #16a34a;
    color: #16a34a;
    background: #f3f7ff;
    transform: translateX(4px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  .dark & {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
  }
`;
