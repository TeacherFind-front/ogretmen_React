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

export default function TutorProfile() {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = React.useRef(null);

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
    certificates: [], // { name, organization, year, fileUrl, link }
    socialLinks: { whatsapp: "", instagram: "", facebook: "", linkedin: "" },
    isPremium: false,
  });

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProfile();
        if (data) {
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
            avatarUrl: getImageUrl(data.profileImageUrl),
            certificates: data.certificates || [],
            socialLinks: data.socialLinks || { whatsapp: "", instagram: "", facebook: "", linkedin: "" },
            isPremium: data.isPremium || false,
          });

          // If profile has university, load departments
          if (data.universityId) {
            getDepartments(data.universityId)
              .then(setDepartments)
              .catch(console.error);
          }
        }

        // Load universities list
        getUniversities().then(setUniversities).catch(console.error);
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);

    // Upload to server
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setStatus({ type: null, message: "" });

    try {
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

      await updateMyProfile(updateData);

      const newCerts = profile.certificates.filter((c) => c.file && !c.id);
      for (const cert of newCerts) {
        await uploadCertificate(cert.name, cert.file);
      }

      setStatus({
        type: "success",
        message: "Profiliniz başarıyla güncellendi!",
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
            Profil Yönetimi
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-1 text-sm">
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
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
              <div className="relative mb-6">
                <AvatarWrapper $loading={uploadLoading}>
                  {uploadLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  ) : profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover rounded-[2rem]"
                    />
                  ) : (
                    <span className="text-3xl font-black text-blue-600">
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
                  className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-xl text-white shadow-lg border-2 border-white hover:bg-blue-700 transition-all hover:scale-110"
                  disabled={uploadLoading}
                >
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{profile.fullName}</h2>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1 uppercase tracking-widest">
                Doğrulanmış Eğitmen
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSave} className="p-6">
              <section className="mb-10">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
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
                  <FormGroup className="opacity-70">
                    <label>E-posta Adresi (Salt Okunur)</label>
                    <input type="email" value={profile.email} readOnly disabled />
                  </FormGroup>
                  <FormGroup>
                    <label>Telefon Numarası</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
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
    background: #0f172a;
    border-color: #334155;
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
    background: ${(props) => (props.$active ? "#064e3b40" : "#334155")};
    color: ${(props) => (props.$active ? "#34d399" : "#94a3b8")};
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

  input,
  textarea,
  select {
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
    &:disabled {
      background: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;

      .dark & {
        background: #1e293b;
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
        background: #0f172a;
        border-color: #334155;
      }

      &:focus-within {
        border-color: #2d79f3;
        background: white;
        box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.05);

        .dark & {
          background: #0f172a;
          box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.1);
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
        background: #1e293b;
        border-color: #334155;
      }

      .ql-picker-label {
        color: #1e293b;
        .dark & { color: #f1f5f9; }
      }
      .ql-stroke {
        stroke: #475569;
        .dark & { stroke: #cbd5e1; }
      }
      .ql-fill {
        fill: #475569;
        .dark & { fill: #cbd5e1; }
      }
    }

    .ql-container.ql-snow {
      border: none;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;

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
        color: #94a3b8;
        font-weight: 500;
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

const PasswordChangeLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    border-color: #2d79f3;
    color: #2d79f3;
    background: #f3f7ff;
    transform: translateX(4px);
  }
`;
