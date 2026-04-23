import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { 
  School, 
  Award, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

const CreateAd = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    university: "",
    department: "",
    faculty: "",
    documents: [], 
    subjects: [{ category: "Dil Eğitimi", sub: "İngilizce", level: "A1 (Başlangıç)" }],
    bio: "",
    hourlyRate: "",
    title: ""
  });

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
    setFormData({ ...formData, documents: [...formData.documents, { name: "", link: "" }] });
  };

  const removeDocument = (index) => {
    setFormData({ ...formData, documents: formData.documents.filter((_, i) => i !== index) });
  };

  const updateDocument = (index, field, value) => {
    const newDocs = [...formData.documents];
    newDocs[index][field] = value;
    setFormData({ ...formData, documents: newDocs });
  };

  const addSubject = () => {
    setFormData({ ...formData, subjects: [...formData.subjects, { category: "Dil Eğitimi", sub: "İngilizce", level: "A1 (Başlangıç)" }] });
  };

  const updateSubject = (index, field, value) => {
    const newSubs = [...formData.subjects];
    newSubs[index][field] = value;
    if (field === 'category') {
      newSubs[index].sub = categories[value].subs[0];
      newSubs[index].level = categories[value].levels[0];
    }
    setFormData({ ...formData, subjects: newSubs });
  };

  const removeSubject = (index) => {
    setFormData({ ...formData, subjects: formData.subjects.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("İlanınız başarıyla yayına alındı!");
      navigate("/tutor/dashboard");
    }, 2000);
  };

  const renderStep1 = () => (
    <StepContainer>
      <div className="header-box">
        <h2>1. Eğitim ve Uzmanlık</h2>
        <p>Hangi alanda ders vereceğinizi ve eğitim geçmişinizi belirtin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <InputGroup>
          <label><School className="inline mr-2 w-5 h-5" /> Üniversite (Opsiyonel)</label>
          <input id="university" value={formData.university} onChange={handleInputChange} placeholder="Örn: Boğaziçi Üniversitesi" />
        </InputGroup>
        <InputGroup>
          <label>Bölüm</label>
          <input id="department" value={formData.department} onChange={handleInputChange} placeholder="Örn: İngilizce Öğretmenliği" />
        </InputGroup>
      </div>

      <div className="subjects-section">
        <div className="flex justify-between items-center mb-4">
          <label className="font-bold text-gray-800">Vereceğiniz Dersler</label>
          <button type="button" onClick={addSubject} className="add-btn"><Plus className="w-4 h-4" /> Ders Ekle</button>
        </div>
        <div className="space-y-4">
          {formData.subjects.map((sub, index) => (
            <div key={index} className="subject-row">
              <select value={sub.category} onChange={(e) => updateSubject(index, 'category', e.target.value)}>
                {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={sub.sub} onChange={(e) => updateSubject(index, 'sub', e.target.value)}>
                {categories[sub.category].subs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={sub.level} onChange={(e) => updateSubject(index, 'level', e.target.value)}>
                {categories[sub.category].levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button type="button" onClick={() => removeSubject(index)} className="remove-btn"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-actions">
        <button onClick={() => setStep(2)} className="next-btn">Sonraki Adım <ArrowRight className="w-4 h-4" /></button>
      </div>
    </StepContainer>
  );

  const renderStep2 = () => (
    <StepContainer>
      <div className="header-box">
        <h2>2. Belgeler ve Sertifikalar</h2>
        <p>E-devlet sertifikaları veya diploma linklerinizi ekleyerek güvenilirliğinizi artırın.</p>
      </div>

      <div className="docs-area">
        <div className="flex justify-between items-center mb-4">
          <label className="font-bold text-gray-800"><Award className="inline mr-2 w-5 h-5" /> Belgeleriniz</label>
          <button type="button" onClick={addDocument} className="add-btn"><Plus className="w-4 h-4" /> Belge Ekle</button>
        </div>
        {formData.documents.length === 0 && <div className="empty-msg">Henüz belge eklenmedi (Zorunlu değildir).</div>}
        {formData.documents.map((doc, index) => (
          <div key={index} className="doc-row">
            <input placeholder="Belge Adı" value={doc.name} onChange={(e) => updateDocument(index, 'name', e.target.value)} />
            <input placeholder="Link (E-devlet / Drive)" value={doc.link} onChange={(e) => updateDocument(index, 'link', e.target.value)} />
            <button type="button" onClick={() => removeDocument(index)} className="remove-btn"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="footer-actions flex justify-between mt-10">
        <button onClick={() => setStep(1)} className="back-btn"><ArrowLeft className="w-4 h-4" /> Geri</button>
        <button onClick={() => setStep(3)} className="next-btn">Sonraki Adım <ArrowRight className="w-4 h-4" /></button>
      </div>
    </StepContainer>
  );

  const renderStep3 = () => (
    <StepContainer>
      <div className="header-box">
        <h2>3. İlan Detayları ve Ücret</h2>
        <p>Öğrencilerin sizi neden seçmesi gerektiğini anlatın.</p>
      </div>

      <div className="form-grid space-y-6">
        <InputGroup>
          <label>İlan Başlığı</label>
          <input id="title" value={formData.title} onChange={handleInputChange} placeholder="Örn: Deneyimli Hocadan Matematik Özel Ders" required />
        </InputGroup>
        
        <InputGroup>
          <label>Hakkınızda (Biyografi)</label>
          <textarea id="bio" rows="6" value={formData.bio} onChange={handleInputChange} placeholder="Eğitim metodunuz, başarılarınız ve kendinizden bahsedin..." />
        </InputGroup>

        <InputGroup>
          <label>Saatlik Ücret (TL)</label>
          <div className="price-input">
            <span className="curr">₺</span>
            <input id="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleInputChange} placeholder="Örn: 500" />
            <span className="suffix">/ saat</span>
          </div>
        </InputGroup>
      </div>

      <div className="footer-actions flex justify-between mt-10">
        <button onClick={() => setStep(2)} className="back-btn"><ArrowLeft className="w-4 h-4" /> Geri</button>
        <button onClick={handleSubmit} className="submit-btn" disabled={loading}>
          {loading ? "Yayınlanıyor..." : "İlanı Tamamla ve Yayınla"}
        </button>
      </div>
    </StepContainer>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 flex justify-center">
      <MainWrapper>
        <ProgressBar>
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="line" />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </ProgressBar>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </MainWrapper>
    </div>
  );
};

const MainWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 32px;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
  padding: 48px;
  border: 1px solid #f1f5f9;
`;

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
  gap: 12px;

  .step {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f1f5f9;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    transition: all 0.3s ease;
    &.active {
      background: #3b82f6;
      color: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  }

  .line {
    width: 60px;
    height: 2px;
    background: #f1f5f9;
  }
`;

const StepContainer = styled.div`
  .header-box {
    margin-bottom: 32px;
    h2 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    p { color: #64748b; font-size: 15px; }
  }

  .subject-row, .doc-row {
    display: grid;
    grid-template-cols: 1fr 1fr 1fr auto;
    gap: 12px;
    background: #f8fafc;
    padding: 12px;
    border-radius: 16px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;

    select, input {
      padding: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 14px;
      &:focus { border-color: #3b82f6; outline: none; }
    }
  }

  .doc-row {
    grid-template-cols: 1fr 2fr auto;
  }

  .remove-btn {
    color: #ef4444;
    padding: 8px;
    &:hover { color: #dc2626; }
  }

  .add-btn {
    background: #eff6ff;
    color: #3b82f6;
    padding: 8px 16px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .empty-msg {
    text-align: center;
    padding: 24px;
    color: #94a3b8;
    font-size: 14px;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px dashed #cbd5e1;
  }

  .footer-actions {
    margin-top: 40px;
    .next-btn, .submit-btn {
      background: #3b82f6;
      color: white;
      padding: 14px 32px;
      border-radius: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      &:hover { background: #2563eb; transform: translateY(-1px); }
    }
    .back-btn {
      color: #64748b;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label { font-size: 14px; font-weight: 600; color: #475569; }
  input, textarea {
    padding: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #f8fafc;
    font-size: 15px;
    &:focus { border-color: #3b82f6; background: white; outline: none; }
  }
  .price-input {
    position: relative;
    .curr { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-weight: 700; color: #64748b; }
    input { padding-left: 32px; width: 100%; }
    .suffix { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 13px; color: #94a3b8; }
  }
`;

export default CreateAd;
