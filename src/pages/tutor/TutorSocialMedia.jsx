import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Share2,
  Phone
} from "lucide-react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import {
  getMyProfile,
  updateMyProfile
} from "@/services/tutorService";

export default function TutorSocialMedia() {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  
  const [profile, setProfile] = useState({
    socialLinks: { whatsApp: "", instagram: "", facebook: "", linkedIn: "" }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProfile();
        if (data) {
          setProfile({
            ...data,
            socialLinks: data.socialLinks || { whatsApp: "", instagram: "", facebook: "", linkedIn: "" }
          });
        }
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const updateData = {
        fullName: profile.fullName,
        phoneNumber: profile.phone || profile.phoneNumber,
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

      await updateMyProfile(updateData);

      setStatus({
        type: "success",
        message: "Sosyal medya bilgileriniz başarıyla güncellendi!",
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Container>
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Sosyal Medya Ayarları
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-1 text-sm">
            Öğrencilerinizin sizinle iletişime geçebileceği sosyal medya hesaplarınızı buradan yönetin.
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

      <Card>
        <form onSubmit={handleSave} className="p-6">
          <section className="mb-8">
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="text-red-500" size={24} />
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Sosyal Bağlantılarım</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                Sosyal medya hesaplarınızı ekleyin, öğrencilerin size kolayca ulaşmasını sağlayın. Bu bilgiler profil sayfanızda görüntülenecektir.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <label className="flex items-center gap-2"><Phone size={14} className="text-emerald-500" /> WhatsApp Numaranız</label>
                  <input
                    type="text"
                    placeholder="Örn: 0555 555 55 55"
                    value={profile.socialLinks?.whatsApp || ""}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 11) val = val.substring(0, 11);
                      let formatted = val;
                      if (val.length > 4) formatted = `${val.slice(0,4)} ${val.slice(4)}`;
                      if (val.length > 7) formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7)}`;
                      if (val.length > 9) formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7,9)} ${val.slice(9)}`;
                      setProfile({...profile, socialLinks: {...profile.socialLinks, whatsApp: formatted}});
                    }}
                    maxLength={15}
                  />
                </FormGroup>
                <FormGroup>
                  <label className="flex items-center gap-2"><FaInstagram size={14} className="text-pink-500" /> Instagram Adresiniz</label>
                  <input
                    type="text"
                    placeholder="Örn: instagram.com/kullaniciadi"
                    value={profile.socialLinks?.instagram || ""}
                    onChange={(e) => setProfile({...profile, socialLinks: {...profile.socialLinks, instagram: e.target.value}})}
                  />
                </FormGroup>
                <FormGroup>
                  <label className="flex items-center gap-2"><FaFacebook size={14} className="text-blue-600" /> Facebook Adresiniz</label>
                  <input
                    type="text"
                    placeholder="Örn: facebook.com/kullaniciadi"
                    value={profile.socialLinks?.facebook || ""}
                    onChange={(e) => setProfile({...profile, socialLinks: {...profile.socialLinks, facebook: e.target.value}})}
                  />
                </FormGroup>
                <FormGroup>
                  <label className="flex items-center gap-2"><FaLinkedin size={14} className="text-blue-500" /> LinkedIn Adresiniz</label>
                  <input
                    type="text"
                    placeholder="Örn: linkedin.com/in/kullaniciadi"
                    value={profile.socialLinks?.linkedIn || ""}
                    onChange={(e) => setProfile({...profile, socialLinks: {...profile.socialLinks, linkedIn: e.target.value}})}
                  />
                </FormGroup>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-6 border-t border-gray-50">
            <SaveButton type="submit" disabled={saveLoading}>
              {saveLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save size={20} className="mr-2" /> Değişiklikleri Kaydet
                </>
              )}
            </SaveButton>
          </div>
        </form>
      </Card>
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
    background: #1e293b;
    border-color: #334155;
    box-shadow: none;
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
      color: #94a3b8;
    }
  }

  input {
    padding: 16px 20px;
    border-radius: 18px;
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

      .dark & {
        background: #0f172a;
        border-color: #2d79f3;
        box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.1);
      }
    }
  }
`;

const SaveButton = styled.button`
  background: #2d79f3;
  color: white;
  padding: 16px 40px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  box-shadow: 0 10px 20px rgba(45, 121, 243, 0.2);
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
