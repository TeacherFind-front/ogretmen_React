import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  getMyListings,
  createMyListing,
  updateMyListing,
  deleteListing,
  getMyProfile,
  publishListing,
  unpublishListing,
  uploadListingPhotos,
  deleteListingPhoto,
  uploadCertificate,
  deleteCertificate,
} from "@/services/tutorService";
import { getSubjectsHierarchy } from "@/services/locationService";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { resolveMediaUrl } from "@/utils/helpers";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Clock,
  Tag,
  Banknote,
  MapPin,
  Globe,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
  Star,
  LayoutGrid,
  List,
  MoreVertical,
  ExternalLink,
  GraduationCap,
  Video,
  Award,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import BASE_URL, { getImageUrl } from "@/services/api";

export default function TutorLessons() {
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentLessonRates, setCurrentLessonRates] = useState([]);

  const [myCourses, setMyCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const photoInputRef = useRef(null);

  const [existingCerts, setExistingCerts] = useState([]);
  const [newCerts, setNewCerts] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    subjectIds: [],
    price: "",
    description: "",
    serviceType: 1,
    lessonDuration: 60,
    youtubeVideoUrl: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [listings, cats, profileData] = await Promise.all([
          getMyListings(),
          getSubjectsHierarchy(),
          getMyProfile(),
        ]);
        // Backend'den silinmiş (isActive = false) ilanları filtrele
        setMyCourses(listings.filter(c => c.isActive !== false));
        setCategories(cats);
        setProfile(profileData);
      } catch (err) {
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await getMyListings();
      // Backend'den silinmiş (isActive = false) ilanları filtrele
      setMyCourses(data.filter(c => c.isActive !== false));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClick = () => {
    setEditingCourse(null);
    setCurrentLessonRates([]);
    setExistingPhotos([]);
    setNewPhotos([]);
    setExistingCerts(profile?.certificates?.$values || profile?.certificates || []);
    setNewCerts([]);
    setFormData({
      title: "",
      category: categories[0]?.category || "",
      subCategory: "",
      subjectIds: [],
      price: "",
      description: "",
      serviceType: 1,
      lessonDuration: 60,
      youtubeVideoUrl: "",
    });
    setShowForm(true);
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    let displayDescription = course.description || "";
    let rates = [];
    if (course.description) {
      const match = course.description.match(/---LESSON_RATES_JSON---([\s\S]*?)---END_LESSON_RATES_JSON---/);
      if (match && match[1]) {
        try {
          rates = JSON.parse(match[1].trim());
          displayDescription = course.description.replace(/---LESSON_RATES_JSON---[\s\S]*?---END_LESSON_RATES_JSON---/, "").trim();
        } catch (e) {
          console.error(e);
        }
      }
    }
    setCurrentLessonRates(rates);
    setExistingPhotos(course.photos || []);
    setNewPhotos([]);
    setExistingCerts(profile?.certificates?.$values || profile?.certificates || []);
    setNewCerts([]);

    const courseSubjectIds = course.subjectIds?.$values || course.subjectIds || (course.subjectId ? [course.subjectId] : []);
    
    let foundCategory = course.category || "";
    let foundSubCategory = course.subCategory || "";
    
    // Hiyerarşiden subjectIds'ye göre kategorileri bulmayı dene
    if (categories && courseSubjectIds.length > 0 && (!foundCategory || !foundSubCategory)) {
      const primaryId = courseSubjectIds[0];
      for (const cat of categories) {
        if (cat.subjects) {
          for (const sub of cat.subjects) {
            if (sub.options && sub.options.some(o => o.id === primaryId)) {
              foundCategory = cat.category;
              foundSubCategory = sub.name;
              break;
            }
          }
        }
      }
    }

    setFormData({
      title: course.title,
      category: foundCategory,
      subCategory: foundSubCategory,
      subjectIds: courseSubjectIds,
      price: course.price,
      description: displayDescription,
      serviceType:
        course.serviceType === "Online" || course.serviceType === 1
          ? 1
          : course.serviceType === "FaceToFace" || course.serviceType === 2
            ? 2
            : 3,
      lessonDuration: course.lessonDuration || 60,
      youtubeVideoUrl: course.youtubeVideoUrl || "",
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setProcessingId(deleteConfirmId);
    try {
      await deleteListing(deleteConfirmId);
      setMyCourses(myCourses.filter((c) => c.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.message || "İlan silinemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePublishClick = async (id) => {
    setProcessingId(id);
    try {
      await publishListing(id);
      setMyCourses((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "Active", isActive: true } : c,
        ),
      );
    } catch (err) {
      alert(err.message || "İlan yayına alınamadı.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnpublishClick = async (id) => {
    setProcessingId(id);
    try {
      await unpublishListing(id);
      setMyCourses((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "Passive", isActive: false } : c,
        ),
      );
    } catch (err) {
      alert(err.message || "İlan yayından kaldırılamadı.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const p = parseFloat(formData.price);
      if (p < 300 || p > 5000 || p % 50 !== 0) {
        setSubmitting(false);
        return alert("Fiyat 300-5000 TL arasında ve 50'nin katı olmalıdır.");
      }

      let finalDescription = formData.description.trim();
      if (currentLessonRates && currentLessonRates.length > 0) {
        finalDescription += `\n\n---LESSON_RATES_JSON---\n${JSON.stringify(currentLessonRates)}\n---END_LESSON_RATES_JSON---`;
      }

      if (!formData.subjectIds || formData.subjectIds.length === 0) {
        setSubmitting(false);
        return alert("Lütfen en az bir ders seçeneği seçiniz.");
      }

      const payload = {
        ...formData,
        description: finalDescription,
        subjectId: formData.subjectIds[0],
        subjectIds: formData.subjectIds.map(Number),
        price: p,
        lessonDuration: parseInt(formData.lessonDuration),
        serviceType: parseInt(formData.serviceType),
        youtubeVideoUrl: formData.youtubeVideoUrl?.trim() || null,
        university: profile?.university || "",
        department: profile?.department || "",
      };

      let listingId = null;
      if (editingCourse) {
        listingId = editingCourse.id;
        await updateMyListing(listingId, payload);
      } else {
        const newListing = await createMyListing(payload);
        listingId = newListing.id || newListing.data?.id || newListing.data?.$values?.[0]?.id;
      }

      if (listingId && newPhotos.length > 0) {
        await uploadListingPhotos(listingId, newPhotos);
      }

      if (newCerts.length > 0) {
        for (const cert of newCerts) {
          if (cert.name && cert.file) {
            await uploadCertificate(cert.name, cert.file);
          }
        }
      }

      await fetchListings();
      setShowForm(false);
    } catch (err) {
      alert(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <p className="text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">
          İlanlarınız Hazırlanıyor
        </p>
      </div>
    );
  }

  return (
    <Container className="animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 bg-white dark:bg-[var(--card-bg)] p-6 rounded-[2rem] border border-gray-100 dark:border-[var(--card-border)] shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">
            İlan Yönetimi
          </h1>
          <p className="text-gray-500 dark:text-[var(--text-muted)] font-medium mt-1 text-sm max-w-xl">
            Verdiğiniz her bir branş için özel tanıtım bilgileri ve
            ücretlendirme yaparak profilinizi güçlendirin.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {!showForm && (
            <div className="flex items-center bg-gray-100 dark:bg-[var(--card-bg)] p-1 rounded-2xl border border-gray-100 dark:border-[var(--card-border)] shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-[var(--card-bg)] shadow-sm text-green-600 dark:text-green-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"}`}
                title="Izgara Görünümü"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-[var(--card-bg)] shadow-sm text-green-600 dark:text-green-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"}`}
                title="Liste Görünümü"
              >
                <List size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      {showForm ? (
        <Card className="mb-10 overflow-hidden border-none shadow-2xl shadow-green-900/5 rounded-[2rem]">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 bg-green-600 rounded-full"></div>
                <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)]">
                  {editingCourse
                    ? "İlan Detaylarını Güncelle"
                    : "Yeni İlan Oluştur"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FormGroup>
                  <label>
                    <BookOpen className="w-4 h-4 inline mr-2 text-green-500" />{" "}
                    İlan Başlığı
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: TYT Matematik, İngilizce Konuşma..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </FormGroup>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormGroup>
                    <label>
                      <Tag className="w-4 h-4 inline mr-2 text-emerald-500" />{" "}
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          category: e.target.value,
                          subCategory: "",
                          subjectIds: [],
                        });
                      }}
                    >
                      <option value="">Kategori seçin...</option>
                      {categories.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <BookOpen className="w-4 h-4 inline mr-2 text-blue-500" />{" "}
                      Branş
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          subCategory: e.target.value,
                          subjectIds: [],
                        });
                      }}
                    >
                      <option value="">Branş seçin...</option>
                      {categories
                        .find((c) => c.category === formData.category)
                        ?.subjects?.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </FormGroup>
                  <FormGroup className="col-span-1 md:col-span-3">
                    <label>
                      <GraduationCap className="w-4 h-4 inline mr-2 text-amber-500" />{" "}
                      Seviye / Alan Seçimi <span className="text-xs text-gray-400 font-normal ml-2">(Birden fazla seçebilirsiniz)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories
                        .find((c) => c.category === formData.category)
                        ?.subjects?.find((s) => s.name === formData.subCategory)
                        ?.options?.length === 0 && (
                          <p className="text-sm text-gray-500">Bu branş için alt seviye bulunamadı.</p>
                      )}
                      {categories
                        .find((c) => c.category === formData.category)
                        ?.subjects?.find((s) => s.name === formData.subCategory)
                        ?.options?.map((o) => {
                          const isSelected = formData.subjectIds?.includes(o.id);
                          return (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => {
                                const currentIds = formData.subjectIds || [];
                                setFormData({
                                  ...formData,
                                  subjectIds: isSelected
                                    ? currentIds.filter(id => id !== o.id)
                                    : [...currentIds, o.id]
                                });
                              }}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                                isSelected 
                                  ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm" 
                                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              {isSelected && <CheckCircle2 size={14} />}
                              {o.label}
                            </button>
                          );
                        })}
                    </div>
                  </FormGroup>
                </div>

                <FormGroup>
                  <label>
                    <Banknote className="w-4 h-4 inline mr-2 text-amber-500" />{" "}
                    Saatlik Ücret (TL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-[20px] top-1/2 -translate-y-1/2 text-green-600 font-black">
                      ₺
                    </span>
                    <input
                      type="number"
                      required
                      style={{ paddingLeft: "42px" }}
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                </FormGroup>

                <div className="grid grid-cols-2 gap-6">
                  <FormGroup>
                    <label>
                      <Clock className="w-4 h-4 inline mr-2 text-purple-500" />{" "}
                      Süre (Dakika)
                    </label>
                    <select
                      value={formData.lessonDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lessonDuration: e.target.value,
                        })
                      }
                    >
                      <option value={45}>45 Dakika</option>
                      <option value={60}>60 Dakika</option>
                      <option value={90}>90 Dakika</option>
                      <option value={120}>120 Dakika</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <Globe className="w-4 h-4 inline mr-2 text-green-400" />{" "}
                      Ders Tipi
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serviceType: e.target.value,
                        })
                      }
                    >
                      <option value={1}>Online</option>
                      <option value={2}>Yüz Yüze</option>
                      <option value={3}>Her İkisi</option>
                    </select>
                  </FormGroup>
                </div>

                <FormGroup>
                  <label>
                    <Video className="w-4 h-4 inline mr-2 text-red-500" />{" "}
                    YouTube Tanıtım Videosu (İsteğe Bağlı)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtubeVideoUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeVideoUrl: e.target.value })
                    }
                  />
                </FormGroup>

                <FormGroup className="md:col-span-2">
                  <label>İlan Fotoğrafları (En fazla 5 adet)</label>
                  <PhotoGrid>
                    {/* Mevcut Kayıtlı Fotoğraflar */}
                    {existingPhotos.map((photo, index) => (
                      <PhotoCard key={`existing-${index}`}>
                        <img src={resolveMediaUrl(photo.photoUrl)} alt={`existing-photo-${index}`} />
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={async () => {
                            if (window.confirm("Bu fotoğrafı ilandan silmek istediğinize emin misiniz?")) {
                              try {
                                if (editingCourse) {
                                  await deleteListingPhoto(editingCourse.id, photo.id);
                                  setExistingPhotos(prev => prev.filter(p => p.id !== photo.id));
                                  alert("Fotoğraf başarıyla silindi.");
                                }
                              } catch (err) {
                                alert(err.message || "Fotoğraf silinemedi.");
                              }
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                        {photo.isMain && <span className="main-badge">Kapak</span>}
                      </PhotoCard>
                    ))}

                    {/* Yeni Seçilen Fotoğraflar */}
                    {newPhotos.map((photo, index) => (
                      <PhotoCard key={`new-${index}`}>
                        <img src={URL.createObjectURL(photo)} alt={`new-photo-${index}`} />
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => {
                            setNewPhotos(prev => prev.filter((_, idx) => idx !== index));
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="new-badge">Yeni</span>
                      </PhotoCard>
                    ))}

                    {/* Yükleme Butonu */}
                    {(existingPhotos.length + newPhotos.length) < 2 && (
                      <PhotoUploadBtn
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <Plus size={24} />
                        <span>Fotoğraf Ekle</span>
                      </PhotoUploadBtn>
                    )}
                  </PhotoGrid>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={photoInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const total = existingPhotos.length + newPhotos.length + files.length;
                      if (total > 2) {
                        alert("Bir ilana en fazla 2 fotoğraf yükleyebilirsiniz.");
                        return;
                      }
                      setNewPhotos(prev => [...prev, ...files]);
                    }}
                  />
                </FormGroup>

                <FormGroup className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label>Sertifikalar & Belgeler (Yeni Sertifika Ekle)</label>
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-all text-xs"
                      onClick={() =>
                        setNewCerts([
                          ...newCerts,
                          { name: "", file: null },
                        ])
                      }
                    >
                      <Plus size={14} className="inline mr-1" /> Ekle
                    </button>
                  </div>

                  {/* Mevcut Sertifikalar */}
                  {existingCerts.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <span className="text-xs text-gray-400 font-bold block">Profilinizdeki Mevcut Sertifikalar:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {existingCerts.map((cert, index) => (
                          <div key={`exist-cert-${index}`} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-[var(--card-bg)] p-3 rounded-2xl border border-slate-100 dark:border-[var(--card-border)]">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Award className="text-purple-500 shrink-0" size={20} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-700 dark:text-slate-200 truncate">{cert.name}</p>
                                {cert.organization && <p className="text-[10px] text-gray-400 font-bold">{cert.organization} • {cert.year}</p>}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all shrink-0"
                              onClick={async () => {
                                if (window.confirm("Bu sertifikayı profilinizden silmek istediğinize emin misiniz?")) {
                                  try {
                                    await deleteCertificate(cert.id);
                                    setExistingCerts(prev => prev.filter(c => c.id !== cert.id));
                                    alert("Sertifika başarıyla silindi.");
                                  } catch (err) {
                                    alert(err.message || "Sertifika silinemedi.");
                                  }
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yeni Sertifika Girişleri */}
                  {newCerts.length > 0 && (
                    <div className="space-y-3">
                      {newCerts.map((cert, index) => (
                        <div key={`new-cert-${index}`} className="flex items-center gap-3 bg-white dark:bg-[var(--card-bg)] p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-color)]">
                          <input
                            type="text"
                            placeholder="Sertifika Adı (Örn: YÖKDİL İngilizce Sertifikası)"
                            value={cert.name}
                            required
                            className="flex-1 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-xl text-sm font-semibold border-none"
                            onChange={(e) => {
                              const c = [...newCerts];
                              c[index].name = e.target.value;
                              setNewCerts(c);
                            }}
                          />
                          <button
                            type="button"
                            className={`px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${cert.file ? "text-green-600 bg-green-50" : "text-gray-500"}`}
                            onClick={() => document.getElementById(`new-cert-file-${index}`).click()}
                          >
                            <Camera size={14} />
                            {cert.file ? "Değiştir" : "Dosya Seç"}
                          </button>
                          <input
                            id={`new-cert-file-${index}`}
                            type="file"
                            accept=".pdf,image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const c = [...newCerts];
                              c[index].file = e.target.files[0];
                              setNewCerts(c);
                            }}
                          />
                          <button
                            type="button"
                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                            onClick={() => {
                              setNewCerts(newCerts.filter((_, idx) => idx !== index));
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormGroup>

                <FormGroup className="md:col-span-2">
                  <label>Detaylı Açıklama</label>
                  <QuillWrapper>
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(val) =>
                        setFormData({ ...formData, description: val })
                      }
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, false] }],
                          ["bold", "italic", "underline", "strike", "blockquote"],
                          [
                            { list: "ordered" },
                            { list: "bullet" },
                            { indent: "-1" },
                            { indent: "+1" },
                          ],
                          ["link", "clean"],
                        ],
                      }}
                      placeholder="Ders işleyiş tarzınız, kaynaklarınız ve metodolojinizden bahsedin..."
                    />
                  </QuillWrapper>
                </FormGroup>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-8 bg-gray-50/50 border-t border-gray-50">
              <CancelButton type="button" onClick={() => setShowForm(false)}>
                Vazgeç
              </CancelButton>
              <SaveButton type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />{" "}
                    {editingCourse ? "Değişiklikleri Kaydet" : "İlanı Yayınla"}
                  </>
                )}
              </SaveButton>
            </div>
          </form>
        </Card>
      ) : viewMode === "list" ? (
        <Card className="border-none shadow-2xl shadow-gray-900/5 bg-white dark:bg-[var(--card-bg)] rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-[var(--card-border)]">Branş & Başlık</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-[var(--card-border)]">Kategori</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-[var(--card-border)]">Ücretlendirme</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-[var(--card-border)]">Puan / Yorum</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-[var(--card-border)]">Durum</th>
                  <th className="text-right p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-[var(--card-border)]">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-32">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-[var(--card-bg)] rounded-full flex items-center justify-center mb-6">
                          <BookOpen className="w-10 h-10 text-gray-200 dark:text-slate-700" />
                        </div>
                        <p className="text-gray-400 dark:text-slate-500 font-bold">
                          Henüz yayınlanmış bir ilanınız bulunmuyor.
                        </p>
                        <Button
                          variant="link"
                          className="text-green-600 dark:text-green-400 font-black mt-2"
                          onClick={handleAddClick}
                        >
                          İlk ilanını oluştur →
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myCourses.map((course, i) => (
                    <tr
                      key={course.id}
                      className="animate-in fade-in slide-in-from-left-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <td className="p-6 border-b border-gray-50 dark:border-[var(--card-border)]/50 align-middle">
                        <div className="flex items-center gap-3">
                          {course.photos && course.photos.length > 0 ? (
                            <img
                              src={course.photos.find(p => p.isMain)?.photoUrl || course.photos[0].photoUrl || "/placeholder-listing.png"}
                              alt={course.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/placeholder-listing.png";
                              }}
                              className="w-10 h-10 object-cover rounded-xl border border-gray-100 dark:border-[var(--card-border)]"
                            />
                          ) : profile?.profileImageUrl || profile?.avatarUrl ? (
                            <img
                              src={profile.profileImageUrl || profile.avatarUrl || "/placeholder-avatar.png"}
                              alt={profile?.fullName || ""}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/placeholder-avatar.png";
                              }}
                              className="w-10 h-10 object-cover rounded-xl border border-gray-100 dark:border-[var(--card-border)]"
                            />
                          ) : (
                            <img
                              src="/placeholder-listing.png"
                              alt={course.title}
                              className="w-10 h-10 object-cover rounded-xl border border-gray-100 dark:border-[var(--card-border)]"
                            />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-black text-gray-900 dark:text-[var(--text-primary)] text-base truncate max-w-[200px]">
                              {course.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-[var(--card-border)]/50 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-700 dark:text-[var(--text-primary)]">
                            {course.category}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            {course.subCategory}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-[var(--card-border)]/50 align-middle">
                        <div className="flex flex-col">
                          <span className="font-black text-green-600 dark:text-green-400 text-base">
                            ₺{course.price}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold">
                            {course.lessonDuration} DK / DERS
                          </span>
                        </div>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-[var(--card-border)]/50 align-middle">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-yellow-500 font-black">
                            <Star className="w-3.5 h-3.5 fill-yellow-500" />
                            {course.rating || "0.0"}
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">
                            {course.reviewCount || 0} YORUM
                          </span>
                        </div>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-[var(--card-border)]/50 align-middle">
                        <StatusBadge $status={course.status}>
                          {course.status === "Active" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Yayında
                            </>
                          ) : course.status === "PendingApproval" ? (
                            <>
                              <Clock className="w-3 h-3" /> Onay Bekliyor
                            </>
                          ) : course.status === "Rejected" ? (
                            <>
                              <XCircle className="w-3 h-3" /> Reddedildi
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" /> Yayında Değil
                            </>
                          )}
                        </StatusBadge>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-[var(--card-border)]/50 align-middle">
                        <div className="flex justify-end items-center gap-3">
                          {course.status === "Active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-gray-200 dark:border-[var(--card-border)] text-xs font-bold whitespace-nowrap"
                              disabled={processingId === course.id}
                              onClick={() => handleUnpublishClick(course.id)}
                            >
                              {processingId === course.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                "Yayından Kaldır"
                              )}
                            </Button>
                          ) : (
                            (course.status === "Passive" || !course.status) && (
                              <Button
                                size="sm"
                                className="h-9 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold whitespace-nowrap"
                                disabled={processingId === course.id}
                                onClick={() => handlePublishClick(course.id)}
                              >
                                {processingId === course.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  "Yayına Al"
                                )}
                              </Button>
                            )
                          )}
                          <IconButton
                            title="Düzenle"
                            disabled={processingId === course.id}
                            onClick={() => handleEditClick(course)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </IconButton>
                          <IconButton
                            $danger
                            title="Kalıcı Sil"
                            disabled={processingId === course.id}
                            onClick={() => handleDeleteClick(course.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myCourses.length === 0 ? (
            <div className="col-span-full py-32 bg-white dark:bg-[var(--card-bg)] rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-[var(--card-border)] flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-[var(--card-bg)] rounded-full flex items-center justify-center mb-6 text-gray-200 dark:text-slate-700">
                <BookOpen size={40} />
              </div>
              <p className="text-gray-400 dark:text-slate-500 font-bold">
                Henüz yayınlanmış bir ilanınız bulunmuyor.
              </p>
            </div>
          ) : (
            myCourses.map((course, i) => (
              <ListingGridCard
                key={course.id}
                className="animate-in zoom-in-95 duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="card-header">
                  <div className="status-indicator">
                    <StatusBadge
                      $status={course.status}
                      className="!px-3 !py-1.5 !text-[10px]"
                    >
                      {course.status === "Active" ? (
                        <CheckCircle2 size={12} />
                      ) : course.status === "PendingApproval" ? (
                        <Clock size={12} />
                      ) : course.status === "Rejected" ? (
                        <XCircle size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}
                      {course.status === "Active"
                        ? "Yayında"
                        : course.status === "PendingApproval"
                          ? "Onayda"
                          : course.status === "Rejected"
                            ? "Red"
                            : "Yayında Değil"}
                    </StatusBadge>
                  </div>
                  <div className="card-actions">
                    <IconButton
                      onClick={() => handleEditClick(course)}
                      size="sm"
                      disabled={processingId === course.id}
                    >
                      <Edit2 size={14} />
                    </IconButton>
                    <IconButton
                      $danger
                      onClick={() => handleDeleteClick(course.id)}
                      size="sm"
                      disabled={processingId === course.id}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>

                <div className="card-body flex-1 flex flex-col justify-between">
                  <div>
                    <div className="category-tag">
                      <Tag size={12} /> {course.category}
                    </div>
                    <h3>{course.title}</h3>

                    <div className="stats mb-4">
                      <div className="stat-item">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span>
                          {course.rating || "0.0"} ({course.reviewCount || 0})
                        </span>
                      </div>
                      <div className="stat-item">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{course.lessonDuration} Dk</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 dark:border-[var(--card-border)]">
                    {course.status === "Active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-10 rounded-xl border-gray-200 dark:border-[var(--card-border)] text-xs font-bold"
                        disabled={processingId === course.id}
                        onClick={() => handleUnpublishClick(course.id)}
                      >
                        {processingId === course.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : (
                          "Yayından Kaldır"
                        )}
                      </Button>
                    ) : (
                      (course.status === "Passive" || !course.status) && (
                        <Button
                          size="sm"
                          className="w-full h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                          disabled={processingId === course.id}
                          onClick={() => handlePublishClick(course.id)}
                        >
                          {processingId === course.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                          ) : (
                            "Yayına Al"
                          )}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </ListingGridCard>
            ))
          )}
        </div>
      )}

      {deleteConfirmId && (
        <ModalOverlay>
          <ModalContent>
            <h4>İlanı Silmek İstiyor musunuz?</h4>
            <p>
              Bu ilan kalıcı olarak silinecek. İlan fotoğrafları ve ilişkili
              kayıtlar da silinir. Bu işlem geri alınamaz.
            </p>
            <div className="modal-buttons">
              <CancelButton
                onClick={() => setDeleteConfirmId(null)}
                disabled={processingId !== null}
              >
                Vazgeç
              </CancelButton>
              <DangerButton
                onClick={handleConfirmDelete}
                disabled={processingId !== null}
              >
                {processingId !== null ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Evet, Kalıcı Sil"
                )}
              </DangerButton>
            </div>
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
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: none;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    font-size: 13px;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-left: 4px;

    .dark & {
      color: var(--text-muted);
    }
  }

  input,
  select,
  textarea {
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
`;

const AddButton = styled.button`
  background: #16a34a;
  color: white;
  padding: 16px 32px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: 0 10px 20px rgba(22, 163, 74, 0.2);

  &:hover {
    background: #1e40af;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(22, 163, 74, 0.3);
  }
`;

const SaveButton = styled.button`
  background: #10b981;
  color: white;
  padding: 14px 28px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 15px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  &:hover {
    background: #059669;
    transform: translateY(-2px);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 14px 28px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 15px;
  color: #64748b;
  transition: all 0.2s;
  &:hover {
    background: #f1f5f9;
    color: var(--text-primary);

    .dark & {
      background: var(--card-border);
      color: #f1f5f9;
    }
  }

  .dark & {
    color: var(--text-muted);
  }
`;

const IconButton = styled.button`
  width: ${(props) => (props.size === "sm" ? "32px" : "40px")};
  height: ${(props) => (props.size === "sm" ? "32px" : "40px")};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$danger ? "#fef2f2" : "#f8fafc")};
  color: ${(props) => (props.$danger ? "#ef4444" : "#64748b")};
  transition: all 0.2s;
  border: 1px solid transparent;

  .dark & {
    background: ${(props) => (props.$danger ? "#450a0a" : "var(--card-bg)")};
    color: ${(props) => (props.$danger ? "#f87171" : "var(--text-muted)")};
  }

  &:hover {
    background: ${(props) => (props.$danger ? "#fee2e2" : "#f1f5f9")};
    color: ${(props) => (props.$danger ? "#dc2626" : "#16a34a")};
    transform: scale(1.1);
    border-color: ${(props) => (props.$danger ? "#fecaca" : "#e2e8f0")};

    .dark & {
      background: ${(props) => (props.$danger ? "#7f1d1d" : "var(--card-border)")};
      color: ${(props) => (props.$danger ? "#fca5a5" : "#f1f5f9")};
    }
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${(props) => {
    switch (props.$status) {
      case "Active":
        return `
          background: #dcfce7; color: #166534;
          .dark & { background: #064e3b40; color: #34d399; }
        `;
      case "PendingApproval":
        return `
          background: #fef9c3; color: #854d0e;
          .dark & { background: #713f1240; color: #fde047; }
        `;
      case "Rejected":
        return `
          background: #fef2f2; color: #991b1b;
          .dark & { background: #450a0a40; color: #f87171; }
        `;
      default:
        return `
          background: #f1f5f9; color: #475569;
          .dark & { background: var(--card-border); color: var(--text-muted); }
        `;
    }
  }}
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;

  table {
    width: 100%;
    min-width: 800px;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: 24px;
      font-size: 11px;
      font-weight: 900;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #f1f5f9;

      .dark & {
        border-color: var(--card-border);
      }
    }

    td {
      padding: 24px;
      border-bottom: 1px solid #f8fafc;
      vertical-align: middle;

      .dark & {
        border-color: var(--card-border)/30;
      }
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: #fcfdfe;
      .dark & {
        background: var(--page-bg)50;
      }
    }
  }
`;

const ListingGridCard = styled.div`
  background: white;
  border-radius: 2.5rem;
  padding: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
    border-color: var(--text-primary);

    .dark & {
      border-color: var(--card-border);
      box-shadow: none;
    }
  }

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: none;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .card-actions {
    display: flex;
    gap: 8px;
  }

  .card-body {
    .category-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 900;
      color: #16a34a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #f3f7ff;
      padding: 4px 10px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-primary);
      margin-bottom: 8px;
      line-height: 1.3;

      .dark & {
        color: #f1f5f9;
      }
    }

    .stats {
      display: flex;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid #f8fafc;

      .dark & {
        border-color: var(--card-border);
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 800;
        color: #475569;

        .dark & {
          color: var(--text-muted);
        }
      }
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 28px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
  border: 1px solid #f1f5f9;
  text-align: center;
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px) scale(0.95); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  }

  h4 {
    font-size: 20px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 12px;
    .dark & { color: white; }
  }

  p {
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 28px;
    .dark & { color: var(--text-muted); }
  }

  .modal-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
`;

const DangerButton = styled.button`
  background: #ef4444;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const QuillWrapper = styled.div`
  .quill {
    background: white;
    border-radius: 18px;
    border: 2px solid #f1f5f9;
    overflow: hidden;
    .dark & {
      background: var(--page-bg);
      border-color: var(--card-border);
    }
  }
  .ql-toolbar {
    border: none !important;
    border-bottom: 1px solid #f1f5f9 !important;
    background: #f8fafc;
    .dark & {
      background: var(--card-bg);
      border-bottom-color: var(--card-border) !important;
      span, button, svg {
        color: #f1f5f9 !important;
        stroke: #f1f5f9 !important;
      }
      .ql-stroke {
        stroke: #f1f5f9 !important;
      }
      .ql-fill {
        fill: #f1f5f9 !important;
      }
      .ql-picker-options {
        background-color: var(--card-bg) !important;
        border-color: var(--card-border) !important;
      }
      .ql-picker-item {
        color: #f1f5f9 !important;
      }
    }
  }
  .ql-container {
    border: none !important;
    min-height: 200px;
    font-size: 15px;
    font-family: inherit;
    .ql-editor {
      color: var(--text-primary);
      .dark & {
        color: #f1f5f9;
      }
      &.ql-blank::before {
        color: var(--text-muted);
        font-style: normal;
        font-weight: 600;
      }
    }
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 18px;
  border: 2px dashed #e2e8f0;
  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }
`;

const PhotoCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  .dark & { border-color: var(--card-border); }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .delete-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 26px;
    height: 26px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      background: #dc2626;
      transform: scale(1.1);
    }
  }

  .main-badge {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: #16a34a;
    color: white;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .new-badge {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: #3b82f6;
    color: white;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }
`;

const PhotoUploadBtn = styled.button`
  aspect-ratio: 1;
  border-radius: 14px;
  border: 2px dashed #cbd5e1;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    color: var(--text-muted);
  }

  &:hover {
    border-color: #16a34a;
    color: #16a34a;
    background: #f0fdf4;
    .dark & {
      background: #14532d20;
    }
  }

  span {
    font-size: 11px;
    font-weight: 800;
  }
`;
