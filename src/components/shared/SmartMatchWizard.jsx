import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Sparkles,
  BookOpen,
  Monitor,
  Home as HomeIcon,
  Globe,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  Calculator,
  Languages,
  FlaskConical,
  GraduationCap,
  Music,
  Code,
  Zap,
  Wallet,
  Search,
} from "lucide-react";

const CATEGORY_STYLES = {
  "Matematik": { color: "#3b82f6", icon: Calculator },
  "Yabanci Dil": { color: "#8b5cf6", icon: Languages },
  "Dil Egitimi": { color: "#8b5cf6", icon: Languages },
  "Fen Bilimleri": { color: "#06b6d4", icon: FlaskConical },
  "Turkce ve Edebiyat": { color: "#f59e0b", icon: BookOpen },
  "Sinav Hazirlik": { color: "#14b8a6", icon: GraduationCap },
  "Muzik & Sanat": { color: "#ef4444", icon: Music },
  "Muzik": { color: "#ef4444", icon: Music },
  "Yazilim & Bilisim": { color: "#6366f1", icon: Code },
  "Yazilim": { color: "#6366f1", icon: Code },
};

const LESSON_TYPES = [
  {
    id: "online",
    label: "Online",
    desc: "Evinden cik, egitiminden cikma",
    icon: Monitor,
    gradient: "linear-gradient(135deg, #3b82f6, #6366f1)",
    serviceType: "1",
  },
  {
    id: "yuz-yuze",
    label: "Yuz Yuze",
    desc: "Kisisel ve odaklanmis egitim",
    icon: HomeIcon,
    gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
    serviceType: "2",
  },
  {
    id: "her-ikisi",
    label: "Her Ikisi",
    desc: "Hem online hem de yuz yuze",
    icon: Globe,
    gradient: "linear-gradient(135deg, #16a34a, #22c55e)",
    serviceType: "3",
  },
];

const BUDGETS = [
  { id: "0-250", label: "0 - 250 TL", sub: "Ekonomik", min: "0", max: "250" },
  { id: "250-500", label: "250 - 500 TL", sub: "Orta Butce", min: "250", max: "500" },
  { id: "500-1000", label: "500 - 1.000 TL", sub: "Premium", min: "500", max: "1000" },
  { id: "1000+", label: "1.000 TL+", sub: "VIP Egitim", min: "1000", max: "" },
];

const STEPS = [
  { num: 1, label: "Alan" },
  { num: 2, label: "Mod" },
  { num: 3, label: "Butce" },
  { num: 4, label: "Eslesme" },
];

export default function SmartMatchWizard({ open, onClose, categories = [] }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1); // 1: Main Category, 2: Subject/Branch, 3: Option/Level selection
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubjectNameOnly, setSelectedSubjectNameOnly] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubjectOptionLabel, setSelectedSubjectOptionLabel] = useState("");
  const [subSearch, setSubSearch] = useState("");
  
  const [lessonType, setLessonType] = useState("");
  const [budget, setBudget] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchDone, setMatchDone] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSubStep(1);
      setSelectedCategory("");
      setSelectedSubjectNameOnly("");
      setSelectedSubjectId("");
      setSelectedSubjectOptionLabel("");
      setSubSearch("");
      setLessonType("");
      setBudget("");
      setMatching(false);
      setMatchDone(false);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    const catObj = categories.find(c => c.category === catName);
    if (catObj && catObj.subjects && catObj.subjects.length > 0) {
      setSubStep(2);
      setSubSearch("");
    } else {
      setStep(2);
    }
  };

  const handleSubjectSelect = (subName) => {
    setSelectedSubjectNameOnly(subName);
    const catObj = categories.find(c => c.category === selectedCategory);
    const subObj = catObj?.subjects?.find(s => s.name === subName);
    if (subObj && subObj.options && subObj.options.length > 0) {
      setSubStep(3);
    } else {
      setStep(2);
    }
  };

  const handleOptionSelect = (optId, optLabel) => {
    setSelectedSubjectId(optId);
    setSelectedSubjectOptionLabel(optLabel);
    setStep(2);
  };

  const handleTypeSelect = (id) => {
    setLessonType(id);
    setTimeout(() => setStep(3), 220);
  };

  const handleBudgetSelect = (id) => {
    setBudget(id);
    setTimeout(() => setStep(4), 220);
  };

  const handleStartMatch = async () => {
    setMatching(true);
    await new Promise((r) => setTimeout(r, 2200));
    setMatchDone(true);
    await new Promise((r) => setTimeout(r, 700));

    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedSubjectId) params.append("subjectId", selectedSubjectId);
    if (selectedSubjectNameOnly) params.append("subjectName", selectedSubjectNameOnly);
    
    const lt = LESSON_TYPES.find((t) => t.id === lessonType);
    if (lt) params.append("serviceType", lt.serviceType);
    const bg = BUDGETS.find((b) => b.id === budget);
    if (bg?.min) params.append("minPrice", bg.min);
    if (bg?.max) params.append("maxPrice", bg.max);

    onClose();
    navigate(`/tutors?${params.toString()}`);
  };

  // Get branches for selected category
  const activeCategoryObj = categories.find(c => c.category === selectedCategory);
  const subjectsList = activeCategoryObj ? activeCategoryObj.subjects : [];
  const filteredSubjects = subjectsList.filter(s => 
    s.name.toLocaleLowerCase("tr-TR").includes(subSearch.toLocaleLowerCase("tr-TR"))
  );

  // Get options for selected subject
  const activeSubjectObj = subjectsList.find(s => s.name === selectedSubjectNameOnly);
  const optionsList = activeSubjectObj ? activeSubjectObj.options : [];

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "smFadeIn 0.2s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            background: "var(--card-bg)",
            border: "1.5px solid rgba(74,222,128,0.2)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
            borderRadius: "2rem",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "560px",
            maxHeight: "92vh",
            animation: "smSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px 28px 20px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #052e16 0%, #15803d 100%)",
              borderBottom: "1px solid rgba(74,222,128,0.15)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(74,222,128,0.2)",
                  border: "1px solid rgba(74,222,128,0.3)",
                  flexShrink: 0,
                }}
              >
                <Sparkles style={{ width: 20, height: 20, color: "#4ade80" }} />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, color: "white", fontSize: 18, margin: 0, lineHeight: 1.3 }}>
                  Akilli Eslestirme
                </h2>
                <p style={{ fontSize: 12, color: "#86efac", margin: 0 }}>Sana ozel egitmen buluyoruz ✨</p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Step Indicator */}
          <div
            style={{
              padding: "14px 28px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid var(--card-border)",
              flexShrink: 0,
            }}
          >
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 900,
                      transition: "all 0.3s",
                      ...(step > s.num
                        ? { background: "#16a34a", color: "white" }
                        : step === s.num
                        ? { background: "#16a34a", color: "white", boxShadow: "0 0 0 3px rgba(22,163,74,0.25)" }
                        : { background: "var(--card-border)", color: "var(--text-muted)" }),
                    }}
                  >
                    {step > s.num ? <CheckCircle style={{ width: 14, height: 14 }} /> : s.num}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: step >= s.num ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      height: 2,
                      width: 28,
                      borderRadius: 99,
                      transition: "background 0.5s",
                      background: step > s.num ? "#16a34a" : "var(--card-border)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ overflowY: "auto", flex: 1 }}>

            {/* Step 1 - Substep 1: Main Category Selection */}
            {step === 1 && subStep === 1 && (
              <div style={{ padding: 28, animation: "smSlideUp 0.25s ease" }}>
                <p style={{ fontWeight: 900, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>
                  Hangi alanda egitim almak istiyorsun?
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  En uygun egitmenleri listeleyebilmemiz icin bir alan sec.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {categories.map((c) => {
                    const style = CATEGORY_STYLES[c.category] || { color: "#16a34a", icon: BookOpen };
                    const Icon = style.icon;
                    const active = selectedCategory === c.category;
                    return (
                      <button
                        key={c.category}
                        onClick={() => handleCategorySelect(c.category)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "16px",
                          borderRadius: 18,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          background: active ? `${style.color}15` : "var(--page-bg)",
                          border: `2px solid ${active ? style.color : "var(--card-border)"}`,
                          boxShadow: active ? `0 4px 16px ${style.color}25` : "none",
                          transform: active ? "scale(1.02)" : "scale(1)",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `${style.color}20`,
                            flexShrink: 0,
                          }}
                        >
                          <Icon style={{ width: 20, height: 20, color: style.color }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 750, color: "var(--text-primary)", lineHeight: 1.3 }}>
                          {c.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    padding: "12px",
                    borderRadius: 14,
                    border: "1.5px dashed var(--card-border)",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
                  Alanimi belirtmeden devam et →
                </button>
              </div>
            )}

            {/* Step 1 - Substep 2: Subject/Branch Selection */}
            {step === 1 && subStep === 2 && (
              <div style={{ padding: 28, animation: "smSlideUp 0.25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => setSubStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                      borderRadius: 6,
                    }}
                  >
                    <ChevronLeft style={{ width: 18, height: 18 }} />
                  </button>
                  <p style={{ fontWeight: 900, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
                    {selectedCategory}
                  </p>
                </div>
                
                {/* Search Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--page-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 12,
                    padding: "8px 12px",
                    marginBottom: 16,
                  }}
                >
                  <Search style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Brans veya ders ara..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    style={{
                      background: "none",
                      border: "none",
                      outline: "none",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      width: "100%",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: "240px", overflowY: "auto", padding: 2 }}>
                  {filteredSubjects.map((s) => {
                    const active = selectedSubjectNameOnly === s.name;
                    const style = CATEGORY_STYLES[selectedCategory] || { color: "#16a34a" };
                    return (
                      <button
                        key={s.name}
                        onClick={() => handleSubjectSelect(s.name)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 14,
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 12.5,
                          fontWeight: 700,
                          transition: "all 0.15s",
                          background: active ? `${style.color}15` : "var(--page-bg)",
                          border: `1.5px solid ${active ? style.color : "var(--card-border)"}`,
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                  {filteredSubjects.length === 0 && (
                    <div style={{ gridColumn: "span 2", textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
                      Aradiginiz brans bulunamadi.
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    onClick={() => {
                      setSelectedSubjectNameOnly("");
                      setSelectedSubjectId("");
                      setSelectedSubjectOptionLabel("");
                      setStep(2);
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 14,
                      background: "rgba(22,163,74,0.1)",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 750,
                      color: "#16a34a",
                    }}
                  >
                    Tum {selectedCategory} Branslarini Gor
                  </button>
                </div>
              </div>
            )}

            {/* Step 1 - Substep 3: Level / Option Selection */}
            {step === 1 && subStep === 3 && (
              <div style={{ padding: 28, animation: "smSlideUp 0.25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => setSubStep(2)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                      borderRadius: 6,
                    }}
                  >
                    <ChevronLeft style={{ width: 18, height: 18 }} />
                  </button>
                  <p style={{ fontWeight: 900, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
                    {selectedSubjectNameOnly} - Seviye Secin
                  </p>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  Ders almak istediginiz seviyeyi/alani belirleyin.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: "240px", overflowY: "auto", padding: 2 }}>
                  {optionsList.map((o) => {
                    const active = String(selectedSubjectId) === String(o.id);
                    const style = CATEGORY_STYLES[selectedCategory] || { color: "#16a34a" };
                    return (
                      <button
                        key={o.id}
                        onClick={() => handleOptionSelect(o.id, o.label)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 14,
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 12.5,
                          fontWeight: 700,
                          transition: "all 0.15s",
                          background: active ? `${style.color}15` : "var(--page-bg)",
                          border: `1.5px solid ${active ? style.color : "var(--card-border)"}`,
                          color: "var(--text-primary)",
                        }}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    onClick={() => {
                      setSelectedSubjectId("");
                      setSelectedSubjectOptionLabel("");
                      setStep(2);
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 14,
                      background: "rgba(22,163,74,0.1)",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 750,
                      color: "#16a34a",
                    }}
                  >
                    Fark Etmez / Tum Seviyeler
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Lesson Type */}
            {step === 2 && (
              <div style={{ padding: 28, animation: "smSlideUp 0.25s ease" }}>
                <p style={{ fontWeight: 900, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>
                  Dersi nasil almak istersin?
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  Egitim modeline gore sana uygun hocalari gostetelim.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {LESSON_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = lessonType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTypeSelect(t.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "16px",
                          borderRadius: 18,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                          background: active ? "rgba(22,163,74,0.07)" : "var(--page-bg)",
                          border: `2px solid ${active ? "#16a34a" : "var(--card-border)"}`,
                          boxShadow: active ? "0 4px 20px rgba(22,163,74,0.15)" : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: t.gradient,
                            flexShrink: 0,
                          }}
                        >
                          <Icon style={{ width: 22, height: 22, color: "white" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 900, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{t.label}</p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>{t.desc}</p>
                        </div>
                        {active
                          ? <CheckCircle style={{ width: 20, height: 20, color: "#16a34a", flexShrink: 0 }} />
                          : <ChevronRight style={{ width: 20, height: 20, color: "var(--text-muted)", flexShrink: 0 }} />
                        }
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    if (selectedSubjectNameOnly) {
                      const hasOptions = optionsList.length > 0;
                      setSubStep(hasOptions ? 3 : 2);
                    } else if (selectedCategory) {
                      setSubStep(2);
                    } else {
                      setSubStep(1);
                    }
                    setStep(1);
                  }}
                  style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <ChevronLeft style={{ width: 14, height: 14 }} /> Geri don
                </button>
              </div>
            )}

            {/* Step 3: Budget */}
            {step === 3 && (
              <div style={{ padding: 28, animation: "smSlideUp 0.25s ease" }}>
                <p style={{ fontWeight: 900, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>
                  Saatlik butcen ne kadar?
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  Butcene uygun egitmenleri listeleyelim.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {BUDGETS.map((b) => {
                    const active = budget === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => handleBudgetSelect(b.id)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          padding: "18px 12px",
                          borderRadius: 18,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          background: active ? "rgba(22,163,74,0.08)" : "var(--page-bg)",
                          border: `2px solid ${active ? "#16a34a" : "var(--card-border)"}`,
                          boxShadow: active ? "0 4px 20px rgba(22,163,74,0.15)" : "none",
                          transform: active ? "scale(1.03)" : "scale(1)",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 11,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: active ? "rgba(22,163,74,0.15)" : "var(--card-border)",
                          }}
                        >
                          <Wallet style={{ width: 16, height: 16, color: active ? "#16a34a" : "var(--text-muted)" }} />
                        </div>
                        <span style={{ fontWeight: 900, fontSize: 13, color: "var(--text-primary)" }}>{b.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: active ? "#16a34a" : "var(--text-muted)" }}>{b.sub}</span>
                        {active && <CheckCircle style={{ width: 16, height: 16, color: "#16a34a" }} />}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setStep(4)}
                  style={{ marginTop: 14, width: "100%", padding: "10px", borderRadius: 12, border: "1.5px dashed var(--card-border)", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}
                >
                  Butce onemli degil, devam et →
                </button>
                <button
                  onClick={() => setStep(2)}
                  style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <ChevronLeft style={{ width: 14, height: 14 }} /> Geri don
                </button>
              </div>
            )}

            {/* Step 4: Final Match Confirmation */}
            {step === 4 && (
              <div style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", animation: "smSlideUp 0.25s ease" }}>
                {!matching && !matchDone && (
                  <>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #052e16, #16a34a)",
                        boxShadow: "0 12px 40px rgba(22,163,74,0.4)",
                        marginBottom: 18,
                      }}
                    >
                      <Sparkles style={{ width: 34, height: 34, color: "white" }} />
                    </div>
                    <h3 style={{ fontWeight: 900, fontSize: 20, color: "var(--text-primary)", margin: "0 0 8px", textAlign: "center" }}>
                      Eslestirmeye Hazir!
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px", textAlign: "center", maxWidth: 280 }}>
                      Secimlerine gore sana en uygun egitmenleri bulalim.
                    </p>
                    <div
                      style={{
                        width: "100%",
                        borderRadius: 18,
                        padding: "16px 18px",
                        marginBottom: 24,
                        background: "var(--page-bg)",
                        border: "1.5px solid var(--card-border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {[
                        { 
                          label: "Alan", 
                          val: selectedSubjectOptionLabel 
                            ? `${selectedSubjectNameOnly} (${selectedSubjectOptionLabel})` 
                            : selectedSubjectNameOnly || selectedCategory || "Belirtilmedi" 
                        },
                        { label: "Mod", val: LESSON_TYPES.find((t) => t.id === lessonType)?.label || "Belirtilmedi" },
                        { label: "Butce", val: BUDGETS.find((b) => b.id === budget)?.label || "Belirtilmedi" },
                      ].map((r) => (
                        <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{r.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 900, color: "var(--text-primary)" }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleStartMatch}
                      style={{
                        width: "100%",
                        padding: "16px",
                        borderRadius: 18,
                        background: "linear-gradient(135deg, #15803d, #16a34a, #22c55e)",
                        boxShadow: "0 10px 30px rgba(22,163,74,0.45)",
                        border: "none",
                        color: "white",
                        fontWeight: 900,
                        fontSize: 15,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s",
                        marginBottom: 12,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      <Sparkles style={{ width: 18, height: 18 }} />
                      Egitmenlerimi Bul
                      <ArrowRight style={{ width: 18, height: 18 }} />
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <ChevronLeft style={{ width: 14, height: 14 }} /> Geri don
                    </button>
                  </>
                )}

                {matching && !matchDone && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 24 }}>
                    <div style={{ position: "relative", width: 72, height: 72 }}>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          background: "rgba(22,163,74,0.25)",
                          animation: "smPing 1.2s ease infinite",
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, #15803d, #22c55e)",
                        }}
                      >
                        <Loader2 style={{ width: 32, height: 32, color: "white", animation: "spin 0.9s linear infinite" }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontWeight: 900, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>Egitmenler Araniyor...</p>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>Kriterlerine en uygun hocalar filtreleniyor</p>
                    </div>
                    <div style={{ width: "100%", maxWidth: 260, height: 6, borderRadius: 99, background: "var(--card-border)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #16a34a, #4ade80)", animation: "smProgress 2s ease forwards" }} />
                    </div>
                  </div>
                )}

                {matchDone && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 16 }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #15803d, #22c55e)",
                        boxShadow: "0 0 0 6px rgba(22,163,74,0.2)",
                        animation: "smPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    >
                      <CheckCircle style={{ width: 34, height: 34, color: "white" }} />
                    </div>
                    <p style={{ fontWeight: 900, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>Egitmenler Bulundu! 🎉</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes smFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes smSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes smProgress { from { width: 0 } to { width: 100% } }
        @keyframes smPopIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes smPing { 0% { transform: scale(1); opacity: 0.8 } 70% { transform: scale(1.8); opacity: 0 } 100% { transform: scale(1.8); opacity: 0 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}
