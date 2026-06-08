import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  getMyListings,
  createMyListing,
  updateMyListing,
  deleteListing,
  getMyProfile,
} from "@/services/tutorService";
import { getCategories } from "@/services/locationService";
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

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    subjectId: "",
    price: "",
    description: "",
    serviceType: 1,
    lessonDuration: 60,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [listings, cats, profileData] = await Promise.all([
          getMyListings(),
          getCategories(),
          getMyProfile(),
        ]);
        setMyCourses(listings);
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
      setMyCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClick = () => {
    setEditingCourse(null);
    setCurrentLessonRates([]);
    setFormData({
      title: "",
      category: categories[0]?.category || "",
      subCategory: "",
      subjectId: "",
      price: "",
      description: "",
      serviceType: 1,
      lessonDuration: 60,
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

    setFormData({
      title: course.title,
      category: course.category,
      subCategory: course.subCategory,
      subjectId: course.subjectId,
      price: course.price,
      description: displayDescription,
      serviceType:
        course.serviceType === "Online" || course.serviceType === 1
          ? 1
          : course.serviceType === "FaceToFace" || course.serviceType === 2
            ? 2
            : 3,
      lessonDuration: course.lessonDuration || 60,
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;

    try {
      await deleteListing(id);
      setMyCourses(myCourses.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message || "İlan silinemedi.");
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

      const payload = {
        ...formData,
        description: finalDescription,
        subjectId: formData.subjectId ? parseInt(formData.subjectId) : null,
        price: p,
        lessonDuration: parseInt(formData.lessonDuration),
        serviceType: parseInt(formData.serviceType),
        university: profile?.university || "",
        department: profile?.department || "",
      };

      if (editingCourse) {
        await updateMyListing(editingCourse.id, payload);
      } else {
        await createMyListing(payload);
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
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">
          İlanlarınız Hazırlanıyor
        </p>
      </div>
    );
  }

  return (
    <Container className="animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            İlan Yönetimi
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-1 text-sm max-w-xl">
            Verdiğiniz her bir branş için özel tanıtım bilgileri ve
            ücretlendirme yaparak profilinizi güçlendirin.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {!showForm && (
            <>
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"}`}
                  title="Izgara Görünümü"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"}`}
                  title="Liste Görünümü"
                >
                  <List size={18} />
                </button>
              </div>
              <AddButton onClick={handleAddClick}>
                <Plus className="w-5 h-5" /> Yeni İlan
              </AddButton>
            </>
          )}
        </div>
      </header>

      {showForm ? (
        <Card className="mb-10 overflow-hidden border-none shadow-2xl shadow-blue-900/5 rounded-[2rem]">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  {editingCourse
                    ? "İlan Detaylarını Güncelle"
                    : "Yeni İlan Oluştur"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FormGroup>
                  <label>
                    <BookOpen className="w-4 h-4 inline mr-2 text-blue-500" />{" "}
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

                <div className="grid grid-cols-2 gap-6">
                  <FormGroup>
                    <label>
                      <Tag className="w-4 h-4 inline mr-2 text-emerald-500" />{" "}
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const cat = categories.find(
                          (c) => c.category === e.target.value,
                        );
                        setFormData({
                          ...formData,
                          category: e.target.value,
                          subCategory: cat?.subjects[0]?.name || "",
                          subjectId: cat?.subjects[0]?.id || "",
                        });
                      }}
                    >
                      <option value="">Seçiniz...</option>
                      {categories.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Branş</label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => {
                        const subId = e.target.value;
                        const sub = categories
                          .find((c) => c.category === formData.category)
                          ?.subjects.find(
                            (s) => s.id.toString() === subId.toString(),
                          );
                        setFormData({
                          ...formData,
                          subjectId: subId,
                          subCategory: sub?.name || "",
                        });
                      }}
                    >
                      <option value="">Seçiniz...</option>
                      {categories
                        .find((c) => c.category === formData.category)
                        ?.subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <FormGroup>
                    <label>
                      <GraduationCap className="w-4 h-4 inline mr-2 text-blue-600" />{" "}
                      Üniversite
                    </label>
                    <input
                      value={profile?.university || "Profilde belirtilmemiş"}
                      readOnly
                      disabled
                      className="bg-white dark:bg-slate-800/50"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Bölüm</label>
                    <input
                      value={profile?.department || "Profilde belirtilmemiş"}
                      readOnly
                      disabled
                      className="bg-white dark:bg-slate-800/50"
                    />
                  </FormGroup>
                </div>

                <FormGroup>
                  <label>
                    <Banknote className="w-4 h-4 inline mr-2 text-amber-500" />{" "}
                    Saatlik Ücret (TL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-[20px] top-1/2 -translate-y-1/2 text-blue-600 font-black">
                      ₺
                    </span>
                    <input
                      type="number"
                      required
                      className="pl-10"
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
                      <Globe className="w-4 h-4 inline mr-2 text-blue-400" />{" "}
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

                <FormGroup className="md:col-span-2">
                  <label>Detaylı Açıklama</label>
                  <textarea
                    rows="6"
                    required
                    placeholder="Ders işleyiş tarzınız, kaynaklarınız ve metodolojinizden bahsedin..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="resize-none"
                  ></textarea>
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
        <Card className="border-none shadow-2xl shadow-gray-900/5 bg-white dark:bg-[#1e293b] rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Branş & Başlık</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Kategori</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Ücretlendirme</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Puan / Yorum</th>
                  <th className="text-left p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Durum</th>
                  <th className="text-right p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-32">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                          <BookOpen className="w-10 h-10 text-gray-200 dark:text-slate-700" />
                        </div>
                        <p className="text-gray-400 dark:text-slate-500 font-bold">
                          Henüz yayınlanmış bir ilanınız bulunmuyor.
                        </p>
                        <Button
                          variant="link"
                          className="text-blue-600 dark:text-blue-400 font-black mt-2"
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
                      <td className="p-6 border-b border-gray-50 dark:border-slate-800/50 align-middle">
                        <div className="flex items-center gap-3">
                          {course.photos && course.photos.length > 0 ? (
                            <img
                              src={getImageUrl(course.photos.find(p => p.isMain)?.photoUrl || course.photos[0].photoUrl)}
                              alt={course.title}
                              className="w-10 h-10 object-cover rounded-xl border border-gray-100 dark:border-slate-800"
                            />
                          ) : profile?.profileImageUrl || profile?.avatarUrl ? (
                            <img
                              src={getImageUrl(profile.profileImageUrl || profile.avatarUrl)}
                              alt={profile?.fullName || ""}
                              className="w-10 h-10 object-cover rounded-xl border border-gray-100 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm">
                              {course.title.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-black text-gray-900 dark:text-white text-base truncate max-w-[200px]">
                              {course.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-slate-800/50 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-700 dark:text-slate-300">
                            {course.category}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            {course.subCategory}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-slate-800/50 align-middle">
                        <div className="flex flex-col">
                          <span className="font-black text-blue-600 dark:text-blue-400 text-base">
                            ₺{course.price}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold">
                            {course.lessonDuration} DK / DERS
                          </span>
                        </div>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-slate-800/50 align-middle">
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
                      <td className="p-6 border-b border-gray-50 dark:border-slate-800/50 align-middle">
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
                              <AlertCircle className="w-3 h-3" /> Pasif
                            </>
                          )}
                        </StatusBadge>
                      </td>
                      <td className="p-6 border-b border-gray-50 dark:border-slate-800/50 align-middle">
                        <div className="flex justify-end gap-3">
                          <IconButton
                            title="Düzenle"
                            onClick={() => handleEditClick(course)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </IconButton>
                          <IconButton
                            $danger
                            title="Sil"
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
            <div className="col-span-full py-32 bg-white dark:bg-[#1e293b] rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-gray-200 dark:text-slate-700">
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
                            : "Pasif"}
                    </StatusBadge>
                  </div>
                  <div className="card-actions">
                    <IconButton
                      onClick={() => handleEditClick(course)}
                      size="sm"
                    >
                      <Edit2 size={14} />
                    </IconButton>
                    <IconButton
                      $danger
                      onClick={() => handleDeleteClick(course.id)}
                      size="sm"
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>

                <div className="card-body">
                  <div className="category-tag">
                    <Tag size={12} /> {course.category}
                  </div>
                  <h3>{course.title}</h3>

                  <div className="stats">
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
              </ListingGridCard>
            ))
          )}
        </div>
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
    background: #1e293b;
    border-color: #334155;
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
      color: #94a3b8;
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
`;

const AddButton = styled.button`
  background: #2d79f3;
  color: white;
  padding: 16px 32px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: 0 10px 20px rgba(45, 121, 243, 0.2);

  &:hover {
    background: #1e40af;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(45, 121, 243, 0.3);
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
    color: #1e293b;

    .dark & {
      background: #334155;
      color: #f1f5f9;
    }
  }

  .dark & {
    color: #94a3b8;
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
    background: ${(props) => (props.$danger ? "#450a0a" : "#1e293b")};
    color: ${(props) => (props.$danger ? "#f87171" : "#94a3b8")};
  }

  &:hover {
    background: ${(props) => (props.$danger ? "#fee2e2" : "#f1f5f9")};
    color: ${(props) => (props.$danger ? "#dc2626" : "#2d79f3")};
    transform: scale(1.1);
    border-color: ${(props) => (props.$danger ? "#fecaca" : "#e2e8f0")};

    .dark & {
      background: ${(props) => (props.$danger ? "#7f1d1d" : "#334155")};
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
          .dark & { background: #334155; color: #94a3b8; }
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
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #f1f5f9;

      .dark & {
        border-color: #334155;
      }
    }

    td {
      padding: 24px;
      border-bottom: 1px solid #f8fafc;
      vertical-align: middle;

      .dark & {
        border-color: #334155/30;
      }
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: #fcfdfe;
      .dark & {
        background: #0f172a50;
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
    border-color: #e2e8f0;

    .dark & {
      border-color: #475569;
      box-shadow: none;
    }
  }

  .dark & {
    background: #1e293b;
    border-color: #334155;
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
      color: #2d79f3;
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
      color: #1e293b;
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
        border-color: #334155;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 800;
        color: #475569;

        .dark & {
          color: #94a3b8;
        }
      }
    }
  }
`;
