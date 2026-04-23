import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { 
  GraduationCap, 
  UserRoundCheck, 
  ArrowRight, 
  ArrowLeft, 
  School, 
  Award, 
  Plus, 
  Trash2,
  CheckCircle2
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Role, 1: Account, 2: Education, 3: Subjects, 4: Bio
  const [role, setRole] = useState(null); // 'student' or 'tutor'
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    // Tutor specific
    university: "",
    department: "",
    faculty: "",
    documents: [], // { name: '', link: '' }
    subjects: [], // { category: '', sub: '', level: '' }
    bio: "",
    hourlyRate: ""
  });

  // Data for Selects
  const categories = {
    "Dil Eğitimi": {
      subs: ["İngilizce", "Arapça", "Almanca", "Fransızca", "İspanyolca"],
      levels: ["A1 (Başlangıç)", "A2", "B1", "B2", "C1", "C2 (İleri Seviye)"]
    },
    "Sınav Hazırlık": {
      subs: ["TYT", "AYT", "LGS", "DGS", "KPSS"],
      levels: ["Sayısal", "Sözel", "Eşit Ağırlık", "Dil"]
    },
    "Müzik & Sanat": {
      subs: ["Gitar", "Piyano", "Keman", "Resim", "Şan"],
      levels: ["Başlangıç", "Orta", "İleri", "Konservatuara Hazırlık"]
    },
    "Yazılım & Bilişim": {
      subs: ["Python", "React", "Java", "Veri Bilimi", "Mobil Geliştirme"],
      levels: ["Junior", "Mid", "Senior", "Akademik"]
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const addDocument = () => {
    setFormData({ 
      ...formData, 
      documents: [...formData.documents, { name: "", link: "" }] 
    });
  };

  const removeDocument = (index) => {
    const newDocs = formData.documents.filter((_, i) => i !== index);
    setFormData({ ...formData, documents: newDocs });
  };

  const updateDocument = (index, field, value) => {
    const newDocs = [...formData.documents];
    newDocs[index][field] = value;
    setFormData({ ...formData, documents: newDocs });
  };

  const addSubject = () => {
    setFormData({ 
      ...formData, 
      subjects: [...formData.subjects, { category: "Dil Eğitimi", sub: "İngilizce", level: "A1 (Başlangıç)" }] 
    });
  };

  const updateSubject = (index, field, value) => {
    const newSubs = [...formData.subjects];
    newSubs[index][field] = value;
    // Kategori değişirse alt kategoriyi ve seviyeyi sıfırla
    if (field === 'category') {
      newSubs[index].sub = categories[value].subs[0];
      newSubs[index].level = categories[value].levels[0];
    }
    setFormData({ ...formData, subjects: newSubs });
  };

  const removeSubject = (index) => {
    const newSubs = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubs });
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("token", "professional-auth-token");
      localStorage.setItem("userRole", role);
      if (role === 'tutor') navigate("/tutor/dashboard");
      else navigate("/app/dashboard");
    }, 2000);
  };

  // --- RENDERING STEPS ---

  const renderStep0 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Hoş Geldiniz</h2>
      <p className="text-center text-gray-500 mb-10">Devam etmek için size uygun olan rolü seçin</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoleCard active={role === 'student'} onClick={() => { setRole('student'); setStep(1); }}>
          <div className="icon-box"><GraduationCap /></div>
          <h3>Öğrenci Olmak İstiyorum</h3>
          <p>En iyi eğitmenlerden ders alarak hedeflerine ulaş.</p>
          <div className="check-icon"><CheckCircle2 /></div>
        </RoleCard>
        <RoleCard active={role === 'tutor'} onClick={() => { setRole('tutor'); setStep(1); }}>
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
      <div className="form-grid">
        <InputGroup>
          <label>Ad Soyad</label>
          <input id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Adınız ve Soyadınız" required />
        </InputGroup>
        <InputGroup>
          <label>E-posta</label>
          <input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ornek@mail.com" required />
        </InputGroup>
        <InputGroup>
          <label>Şifre</label>
          <input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="********" required />
        </InputGroup>
      </div>
      <div className="footer">
        {role === 'student' ? (
          <button onClick={handleFinalSubmit} className="next-btn primary">Kaydı Tamamla {loading && '...'}</button>
        ) : (
          <button onClick={() => setStep(2)} className="next-btn">Devam Et <ArrowRight className="w-4 h-4" /></button>
        )}
      </div>
    </StepWrapper>
  );

  const renderStep2 = () => (
    <StepWrapper>
      <div className="header">
        <button onClick={() => setStep(1)} className="back-btn"><ArrowLeft className="w-4 h-4" /> Geri</button>
        <h2>Eğitim ve Belgeler</h2>
        <p>Öğrencilerin size güvenmesi için eğitim geçmişinizi paylaşın.</p>
      </div>
      <div className="form-grid">
        <InputGroup>
          <label><School className="inline mr-2 w-5 h-5" /> Üniversite (Zorunlu değil)</label>
          <input id="university" value={formData.university} onChange={handleInputChange} placeholder="Hangi üniversiteden mezunsunuz?" />
        </InputGroup>
        <div className="grid grid-cols-2 gap-4">
          <InputGroup>
            <label>Fakülte</label>
            <input id="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Örn: Mühendislik" />
          </InputGroup>
          <InputGroup>
            <label>Bölüm</label>
            <input id="department" value={formData.department} onChange={handleInputChange} placeholder="Örn: Bilgisayar Müh." />
          </InputGroup>
        </div>
      </div>

      <div className="divider" />

      <div className="docs-section">
        <div className="flex justify-between items-center mb-4">
          <label className="font-bold text-gray-800"><Award className="inline mr-2 w-5 h-5" /> Sertifikalar & Belgeler</label>
          <button type="button" onClick={addDocument} className="add-btn"><Plus className="w-4 h-4" /> Belge Ekle</button>
        </div>
        {formData.documents.map((doc, index) => (
          <div key={index} className="doc-item animate-in zoom-in-95 duration-200">
            <input 
              placeholder="Belge Adı (Örn: IELTS Sertifikası)" 
              value={doc.name} 
              onChange={(e) => updateDocument(index, 'name', e.target.value)} 
            />
            <input 
              placeholder="E-devlet veya Dosya Linki" 
              value={doc.link} 
              onChange={(e) => updateDocument(index, 'link', e.target.value)} 
            />
            <button type="button" onClick={() => removeDocument(index)} className="remove-btn"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="footer">
        <button onClick={() => setStep(3)} className="next-btn">Devam Et <ArrowRight className="w-4 h-4" /></button>
      </div>
    </StepWrapper>
  );

  const renderStep3 = () => (
    <StepWrapper>
      <div className="header">
        <button onClick={() => setStep(2)} className="back-btn"><ArrowLeft className="w-4 h-4" /> Geri</button>
        <h2>Dersler ve Seviyeler</h2>
        <p>Hangi alanlarda ders vereceğinizi ve uzmanlık seviyenizi belirleyin.</p>
      </div>

      <div className="subjects-section">
        <div className="flex justify-between items-center mb-6">
          <label className="font-bold text-gray-800">Ders Alanlarınız</label>
          <button type="button" onClick={addSubject} className="add-btn"><Plus className="w-4 h-4" /> Yeni Ders Ekle</button>
        </div>

        {formData.subjects.length === 0 && (
          <div className="empty-state">Henüz bir ders eklemediniz. Lütfen en az bir ders ekleyin.</div>
        )}

        <div className="space-y-4">
          {formData.subjects.map((sub, index) => (
            <div key={index} className="subject-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <select value={sub.category} onChange={(e) => updateSubject(index, 'category', e.target.value)}>
                  {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={sub.sub} onChange={(e) => updateSubject(index, 'sub', e.target.value)}>
                  {categories[sub.category].subs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-2">
                  <select className="flex-1" value={sub.level} onChange={(e) => updateSubject(index, 'level', e.target.value)}>
                    {categories[sub.category].levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button type="button" onClick={() => removeSubject(index)} className="remove-btn-small"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        <button onClick={() => setStep(4)} className="next-btn">Devam Et <ArrowRight className="w-4 h-4" /></button>
      </div>
    </StepWrapper>
  );

  const renderStep4 = () => (
    <StepWrapper>
      <div className="header">
        <button onClick={() => setStep(3)} className="back-btn"><ArrowLeft className="w-4 h-4" /> Geri</button>
        <h2>Profilinizi Tamamlayın</h2>
        <p>Kendinizi tanıtan şık bir biyografi yazın ve saatlik ücretinizi belirleyin.</p>
      </div>

      <div className="form-grid">
        <InputGroup>
          <label>Profil Başlığı & Hakkımda</label>
          <textarea 
            id="bio"
            rows="6"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Öğrencilere kendinizden, eğitim metodunuzdan ve tecrübelerinizden bahsedin..."
            className="bio-textarea"
          />
        </InputGroup>
        
        <InputGroup>
          <label>Saatlik Ücret (TL)</label>
          <div className="price-input">
            <span className="currency">₺</span>
            <input 
              id="hourlyRate"
              type="number" 
              value={formData.hourlyRate}
              onChange={handleInputChange}
              placeholder="Örn: 450" 
            />
            <span className="per-hour">/ saat</span>
          </div>
        </InputGroup>
      </div>

      <div className="footer">
        <button onClick={handleFinalSubmit} className="next-btn primary">
          {loading ? 'Profil Oluşturuluyor...' : 'Eğitmen Kaydını Tamamla'}
        </button>
      </div>
    </StepWrapper>
  );

  return (
    <PageBackground>
      <MainContainer>
        {step === 0 ? renderStep0() : null}
        {step === 1 ? renderStep1() : null}
        {step === 2 ? renderStep2() : null}
        {step === 3 ? renderStep3() : null}
        {step === 4 ? renderStep4() : null}
        
        <ProgressDots>
          {[0, 1, 2, 3, 4].map(s => (
            role === 'student' && s > 1 ? null : (
              <Dot key={s} active={step === s} completed={step > s} />
            )
          ))}
        </ProgressDots>
      </MainContainer>
    </PageBackground>
  );
};

// --- STYLED COMPONENTS ---

const PageBackground = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
`;

const MainContainer = styled.div`
  width: 100%;
  max-width: ${props => props.wide ? '1000px' : '800px'};
  background: white;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  padding: 48px;
  transition: all 0.3s ease;
`;

const RoleCard = styled.div`
  background: ${props => props.active ? '#eff6ff' : '#ffffff'};
  border: 2px solid ${props => props.active ? '#3b82f6' : '#f1f5f9'};
  border-radius: 24px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
    border-color: ${props => props.active ? '#3b82f6' : '#cbd5e1'};
  }

  .icon-box {
    width: 64px;
    height: 64px;
    background: ${props => props.active ? '#3b82f6' : '#f8fafc'};
    color: ${props => props.active ? 'white' : '#64748b'};
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 24px;
    transition: all 0.2s ease;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
  }

  .check-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #3b82f6;
    font-size: 20px;
    opacity: ${props => props.active ? 1 : 0};
    transform: scale(${props => props.active ? 1 : 0.5});
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
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      transition: color 0.2s;
      &:hover { color: #1e293b; }
    }

    h2 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }

    p {
      color: #64748b;
      font-size: 15px;
    }
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .divider {
    height: 1px;
    background: #f1f5f9;
    margin: 32px 0;
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
    background: #1e293b;
    color: white;
    border-radius: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    &:hover { background: #0f172a; transform: translateY(-1px); }
    &.primary { background: #3b82f6; &:hover { background: #2563eb; } }
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #3b82f6;
    font-size: 14px;
    font-weight: 700;
    background: #eff6ff;
    padding: 8px 16px;
    border-radius: 10px;
    transition: all 0.2s;
    &:hover { background: #dbeafe; }
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
  }

  input, select, textarea {
    padding: 14px 18px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-size: 15px;
    transition: all 0.2s;
    background: #f8fafc;
    &:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  }

  .price-input {
    display: flex;
    align-items: center;
    position: relative;
    .currency { position: absolute; left: 18px; color: #64748b; font-weight: 600; }
    input { padding-left: 36px; padding-right: 70px; width: 100%; }
    .per-hour { position: absolute; right: 18px; color: #94a3b8; font-size: 13px; }
  }

  .bio-textarea {
    resize: vertical;
    line-height: 1.6;
  }
`;

const DocItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;

  input { flex: 1; background: white !important; border-width: 1px !important; height: 44px; font-size: 14px; }
  .remove-btn { color: #ef4444; padding: 0 12px; font-size: 16px; &:hover { color: #dc2626; } }
`;

const SubjectCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);

  select {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    padding: 8px 12px;
    width: 100%;
    cursor: pointer;
    &:focus { border-color: #3b82f6; outline: none; }
  }

  .remove-btn-small {
    color: #94a3b8;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;
    &:hover { background: #fef2f2; color: #ef4444; }
  }
`;

const ProgressDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;
`;

const Dot = styled.div`
  width: ${props => props.active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background: ${props => props.active ? '#3b82f6' : props.completed ? '#94a3b8' : '#e2e8f0'};
  transition: all 0.3s ease;
`;

export default Register;
