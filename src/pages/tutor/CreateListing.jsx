import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ArrowRight,
  ArrowLeft,
  Tag,
  MapPin,
  Type,
  DollarSign,
  Clock,
  CheckCircle2,
  Loader2,
  Calendar as CalendarIcon,
  Phone,
  Camera,
  Plus,
  Trash2,
  Globe,
  Home,
  GraduationCap,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getCategories,
  getCities,
  getDistricts,
  getNeighborhoods,
} from "@/services/locationService";
import {
  createMyListing,
  uploadCertificate,
  uploadListingPhotos,
  getMyProfile,
} from "@/services/tutorService";
import toast from "react-hot-toast";

const CreateListing = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Data lists
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [profileAvailability, setProfileAvailability] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeVideoUrl: "",
    categoryId: "",
    category: "",
    subCategory: "",
    subjectId: "",
    cityId: "",
    districtId: "",
    neighborhoodId: "",
    lessonDuration: 60,
    price: "",
    showPhoneNumber: false,
    showEducation: true,
    listingPhotos: [], // Array of files
    certificates: [],
    lessonRates: [
      {
        id: Date.now(),
        title: "",
        duration: 45,
        type: "both",
        onlinePrice: "",
        inPersonPrice: "",
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, cityData, profileData] = await Promise.all([
          getCategories(),
          getCities(),
          getMyProfile(),
        ]);
        setCategories(catData);
        setCities(cityData);
        if (profileData && profileData.availability) {
          setProfileAvailability(profileData.availability);
        }
      } catch (err) {
        toast.error("Veriler yüklenirken hata oluştu.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  // Location chain
  useEffect(() => {
    if (formData.cityId) {
      getDistricts(formData.cityId).then(setDistricts);
      setFormData((prev) => ({ ...prev, districtId: "", neighborhoodId: "" }));
    }
  }, [formData.cityId]);

  useEffect(() => {
    if (formData.districtId) {
      getNeighborhoods(formData.districtId).then(setNeighborhoods);
      setFormData((prev) => ({ ...prev, neighborhoodId: "" }));
    }
  }, [formData.districtId]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({ ...formData, [id]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // 0. Calculate ServiceType based on profile availability
      const availabilityValues = Object.values(profileAvailability);
      const hasOnline = availabilityValues.some(
        (v) => v === "online" || v === "both",
      );
      const hasFaceToFace = availabilityValues.some(
        (v) => v === "inperson" || v === "both",
      );

      let serviceType = 1; // Default Online
      if (hasOnline && hasFaceToFace)
        serviceType = 3; // Both
      else if (hasFaceToFace) serviceType = 2; // FaceToFace

      // 1. Validation check
      if (!formData.title || formData.title.length < 5) {
        setLoading(false);
        return toast.error("İlan başlığı en az 5 karakter olmalıdır.");
      }
      if (!formData.description || formData.description.length < 20) {
        setLoading(false);
        return toast.error("Açıklama en az 20 karakter olmalıdır.");
      }

      const p = parseFloat(formData.price) || 0;
      if (p < 300 || p > 5000) {
        setLoading(false);
        return toast.error("Fiyat 300-5000 TL arasında olmalıdır.");
      }
      // Ensure price is multiple of 50
      const normalizedPrice = Math.round(p / 50) * 50;

      let finalDescription = formData.description.trim();

      const listingData = {
        title: formData.title.trim(),
        description: finalDescription,
        youtubeVideoUrl: formData.youtubeVideoUrl?.trim() || null,
        subjectId: formData.subjectId ? parseInt(formData.subjectId) : null,
        cityId: formData.cityId || null,
        districtId: formData.districtId || null,
        neighborhoodId: formData.neighborhoodId || null,
        category: formData.category,
        subCategory: formData.subCategory,
        lessonDuration: parseInt(formData.lessonDuration) || 60,
        price: normalizedPrice,
        serviceType: serviceType,
        lessonRates: formData.lessonRates.map((lr) => ({
          title: lr.title,
          duration: parseInt(lr.duration),
          onlinePrice: parseFloat(lr.onlinePrice) || 0,
          inPersonPrice: parseFloat(lr.inPersonPrice) || 0,
        })),
        university: profileAvailability.university || "",
        department: profileAvailability.department || "",
        showPhoneNumber: formData.showPhoneNumber,
        showEducation: formData.showEducation,
      };

      const result = await createMyListing(listingData);
      const listingId = result.id;

      // 2. Upload Photos (Bulk)
      if (formData.listingPhotos.length > 0) {
        toast.loading("Fotoğraflar yükleniyor...", { id: "upload-status" });
        await uploadListingPhotos(listingId, formData.listingPhotos);
      }

      // 3. Upload Certificates
      for (const cert of formData.certificates) {
        if (cert.file) {
          await uploadCertificate(cert.name?.trim() || "Sertifika", cert.file);
        }
      }

      toast.success("İlanınız başarıyla oluşturuldu ve onay için gönderildi!", {
        id: "upload-status",
      });
      navigate("/tutor/dashboard");
    } catch (err) {
      toast.error(err.message || "İlan oluşturulurken bir hata oluştu.", {
        id: "upload-status",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const renderStep1 = () => (
    <StepContainer>
      <div className="header-box">
        <h2>1. Kategori ve Branş</h2>
        <p>Hangi alanda uzman olduğunuzu ve ders vereceğinizi seçin.</p>
      </div>

      <div className="space-y-6">
        <InputGroup>
          <label>
            <Tag className="inline mr-2 w-5 h-5 text-blue-500" /> Ana Kategori
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => {
              const catName = e.target.value;
              setFormData({
                ...formData,
                category: catName,
                subCategory: "",
                subjectId: "",
              });
            }}
            required
          >
            <option value="">Kategori Seçiniz...</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category}
              </option>
            ))}
          </select>
        </InputGroup>

        {formData.category && (
          <InputGroup>
            <label>Ders Branşı</label>
            <select
              id="subjectId"
              value={formData.subjectId}
              onChange={(e) => {
                const subId = e.target.value;
                const cat = categories.find(
                  (c) => c.category === formData.category,
                );
                const sub = cat?.subjects.find(
                  (s) => s.id.toString() === subId.toString(),
                );
                setFormData({
                  ...formData,
                  subjectId: subId,
                  subCategory: sub?.name || "",
                });
              }}
              required
            >
              <option value="">Branş Seçiniz...</option>
              {categories
                .find((c) => c.category === formData.category)
                ?.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </InputGroup>
        )}
      </div>

      <div className="footer-actions">
        <button
          onClick={() => {
            if (!formData.subjectId)
              return toast.error("Lütfen kategori ve branş seçin.");
            setStep(2);
          }}
          className="next-btn"
        >
          Sonraki Adım <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </StepContainer>
  );

  const renderStep2 = () => (
    <StepContainer>
      <div className="header-box">
        <h2>2. İlan Başlığı ve Detaylar</h2>
        <p>
          Öğrencilerin ilgisini çekecek etkileyici bir başlık ve detaylı bir
          açıklama yazın.
        </p>
      </div>

      <div className="space-y-6">
        <InputGroup>
          <label>
            <Type className="inline mr-2 w-5 h-5 text-blue-500" /> İlan Başlığı
          </label>
          <input
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Örn: Deneyimli Hocadan YKS Matematik Kampı"
            required
          />
        </InputGroup>

        <InputGroup>
          <label>İlan Açıklaması</label>
          <div className="quill-wrapper">
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Ders işleyiş tarzınız, tecrübeniz ve öğrencilere katacaklarınızdan bahsedin..."
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
        </InputGroup>

        <InputGroup>
          <label>YouTube Tanıtım Videosu Linki (Opsiyonel)</label>
          <input
            id="youtubeVideoUrl"
            type="url"
            value={formData.youtubeVideoUrl}
            onChange={handleInputChange}
            placeholder="Örn: https://www.youtube.com/watch?v=..."
          />
        </InputGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup>
            <label>
              <DollarSign className="inline mr-2 w-5 h-5 text-blue-500" />{" "}
              Saatlik Ücret (TL)
            </label>
            <input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, price: val });
              }}
              onBlur={(e) => {
                let p = parseFloat(e.target.value);
                if (isNaN(p)) return;
                p = Math.round(p / 50) * 50;
                if (p < 300) p = 300;
                if (p > 5000) p = 5000;
                setFormData({ ...formData, price: p.toString() });
              }}
              placeholder="300 - 5000 (50'nin katları)"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">
              * 300 - 5000 TL arası, 50'şer TL katları şeklinde yuvarlanır.
            </p>
          </InputGroup>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900">
              Verdiğiniz Dersler ve Ücretleri
            </h3>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  lessonRates: [
                    ...formData.lessonRates,
                    {
                      id: Date.now(),
                      title: "",
                      duration: 45,
                      type: "both",
                      onlinePrice: "",
                      inPersonPrice: "",
                    },
                  ],
                })
              }
              className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> Yeni Ders Ekle
            </button>
          </div>

          <div className="space-y-4">
            {formData.lessonRates.map((rate, index) => (
              <LessonRateBox key={rate.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InputGroup>
                    <label className="text-[10px]">
                      Ders Adı (Örn: Genel Matematik)
                    </label>
                    <input
                      value={rate.title}
                      onChange={(e) => {
                        const newRates = [...formData.lessonRates];
                        newRates[index].title = e.target.value;
                        setFormData({ ...formData, lessonRates: newRates });
                      }}
                      placeholder="Ders adı..."
                    />
                  </InputGroup>
                  <InputGroup>
                    <label className="text-[10px]">Süre (Dakika)</label>
                    <select
                      value={rate.duration}
                      onChange={(e) => {
                        const newRates = [...formData.lessonRates];
                        newRates[index].duration = e.target.value;
                        setFormData({ ...formData, lessonRates: newRates });
                      }}
                    >
                      <option value="30">30 Dakika</option>
                      <option value="45">45 Dakika</option>
                      <option value="60">60 Dakika</option>
                      <option value="90">90 Dakika</option>
                    </select>
                  </InputGroup>
                  <InputGroup>
                    <label className="text-[10px]">Ders Tipi</label>
                    <select
                      value={rate.type}
                      onChange={(e) => {
                        const newRates = [...formData.lessonRates];
                        newRates[index].type = e.target.value;
                        // Reset other price if not needed
                        if (e.target.value === "online")
                          newRates[index].inPersonPrice = "";
                        if (e.target.value === "inperson")
                          newRates[index].onlinePrice = "";
                        setFormData({ ...formData, lessonRates: newRates });
                      }}
                    >
                      <option value="both">
                        Her İkisi (Online & Yüz Yüze)
                      </option>
                      <option value="online">Sadece Online</option>
                      <option value="inperson">Sadece Yüz Yüze</option>
                    </select>
                  </InputGroup>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                  {(rate.type === "online" || rate.type === "both") && (
                    <InputGroup>
                      <label className="text-[10px]">Online Ücret (₺)</label>
                      <input
                        type="number"
                        value={rate.onlinePrice}
                        onChange={(e) => {
                          const newRates = [...formData.lessonRates];
                          newRates[index].onlinePrice = e.target.value;
                          setFormData({ ...formData, lessonRates: newRates });
                        }}
                        onBlur={(e) => {
                          let p = parseFloat(e.target.value);
                          if (isNaN(p)) return;
                          p = Math.round(p / 50) * 50;
                          if (p < 300) p = 300;
                          if (p > 5000) p = 5000;
                          const newRates = [...formData.lessonRates];
                          newRates[index].onlinePrice = p.toString();
                          setFormData({ ...formData, lessonRates: newRates });
                        }}
                        placeholder="300 - 5000"
                      />
                    </InputGroup>
                  )}
                  {(rate.type === "inperson" || rate.type === "both") && (
                    <InputGroup>
                      <label className="text-[10px]">Yüz Yüze Ücret (₺)</label>
                      <input
                        type="number"
                        value={rate.inPersonPrice}
                        onChange={(e) => {
                          const newRates = [...formData.lessonRates];
                          newRates[index].inPersonPrice = e.target.value;
                          setFormData({ ...formData, lessonRates: newRates });
                        }}
                        onBlur={(e) => {
                          let p = parseFloat(e.target.value);
                          if (isNaN(p)) return;
                          p = Math.round(p / 50) * 50;
                          if (p < 300) p = 300;
                          if (p > 5000) p = 5000;
                          const newRates = [...formData.lessonRates];
                          newRates[index].inPersonPrice = p.toString();
                          setFormData({ ...formData, lessonRates: newRates });
                        }}
                        placeholder="300 - 5000"
                      />
                    </InputGroup>
                  )}
                  {formData.lessonRates.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          lessonRates: formData.lessonRates.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                      className="text-red-500 hover:bg-red-50 p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors border border-red-100 h-[52px]"
                    >
                      <Trash2 size={16} /> Sil
                    </button>
                  )}
                </div>
              </LessonRateBox>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-actions flex justify-between">
        <button onClick={() => setStep(1)} className="back-btn">
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <button
          onClick={() => {
            if (!formData.title || !formData.description || !formData.price) {
              return toast.error("Lütfen zorunlu alanları doldurun.");
            }
            const p = parseFloat(formData.price);
            if (p < 300 || p > 5000 || p % 50 !== 0) {
              return toast.error(
                "Fiyat 300-5000 TL arasında ve 50'nin katı olmalıdır.",
              );
            }
            setStep(3);
          }}
          className="next-btn"
        >
          Sonraki Adım <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </StepContainer>
  );

  const renderStep3 = () => (
    <StepContainer>
      <div className="header-box">
        <h2>3. Konum ve İletişim</h2>
        <p>Hangi bölgelerde yüz yüze ders verebileceğinizi belirleyin.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup>
            <label>
              <MapPin className="inline mr-2 w-5 h-5 text-blue-500" /> Şehir
            </label>
            <select
              id="cityId"
              value={formData.cityId}
              onChange={handleInputChange}
              required
            >
              <option value="">Seçiniz...</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </InputGroup>
          <InputGroup disabled={!formData.cityId}>
            <label>İlçe</label>
            <select
              id="districtId"
              value={formData.districtId}
              onChange={handleInputChange}
              required
              disabled={!formData.cityId}
            >
              <option value="">Seçiniz...</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </InputGroup>
          <InputGroup disabled={!formData.districtId}>
            <label>Mahalle</label>
            <select
              id="neighborhoodId"
              value={formData.neighborhoodId}
              onChange={handleInputChange}
              required
              disabled={!formData.districtId}
            >
              <option value="">Seçiniz...</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </InputGroup>
        </div>


        {/* Privacy Settings */}
        <div className="mt-10 p-8 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2.5rem] space-y-6">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">Gizlilik Ayarları</h4>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center"><Phone size={18} /></div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Telefon Numaram Gözüksün</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Öğrenciler size doğrudan telefonla ulaşabilsin mi?</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="showPhoneNumber"
                checked={formData.showPhoneNumber}
                onChange={handleInputChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center"><GraduationCap size={18} /></div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Eğitim Bilgilerim Gözüksün</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Üniversite ve bölüm bilgileriniz ilanda yer alsın mı?</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="showEducation"
                checked={formData.showEducation}
                onChange={handleInputChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="footer-actions flex justify-between">
        <button onClick={() => setStep(2)} className="back-btn">
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <button
          onClick={() => {
            if (!formData.cityId || !formData.districtId)
              return toast.error("Lütfen şehir ve ilçe seçin.");
            setStep(4);
          }}
          className="next-btn"
        >
          Sonraki Adım <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </StepContainer>
  );

  const renderStep4 = () => (
    <StepContainer>
      <div className="header-box">
        <h2>4. Medya ve Belgeler</h2>
        <p>
          İlanınıza özel fotoğraf ve sertifikalar ekleyerek güvenilirliğinizi
          artırın.
        </p>
      </div>

      <div className="space-y-10">
        <div className="photo-upload">
          <label className="block mb-4 font-black text-gray-700 dark:text-gray-300">
            İlan Fotoğrafları (Birden fazla seçebilirsiniz)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {formData.listingPhotos.map((photo, index) => (
              <div
                key={index}
                className="relative group w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Upload ${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      listingPhotos: formData.listingPhotos.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {formData.listingPhotos.length < 8 && (
              <button
                type="button"
                onClick={() => document.getElementById("photos-input").click()}
                className="w-full h-32 bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Plus size={24} />
                <span className="text-xs font-bold mt-2">Fotoğraf Ekle</span>
              </button>
            )}
          </div>
          <input
            id="photos-input"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setFormData({
                ...formData,
                listingPhotos: [...formData.listingPhotos, ...files].slice(
                  0,
                  8,
                ),
              });
            }}
            accept="image/*"
          />
          <p className="text-xs text-gray-500">
            Maksimum 8 fotoğraf. JPG veya PNG.
          </p>
        </div>

        <div className="certificates">
          <div className="flex justify-between items-center mb-6">
            <label className="font-black text-gray-700 dark:text-gray-300">
              Sertifikalar & Belgeler
            </label>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  certificates: [
                    ...formData.certificates,
                    { name: "", file: null },
                  ],
                })
              }
              className="text-blue-600 font-bold text-sm flex items-center gap-1"
            >
              <Plus size={16} /> Yeni Ekle
            </button>
          </div>

          <div className="space-y-4">
            {formData.certificates.map((cert, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-slate-700"
              >
                <input
                  placeholder="Sertifika Adı"
                  className="flex-1 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2"
                  value={cert.name}
                  onChange={(e) => {
                    const newCerts = [...formData.certificates];
                    newCerts[index].name = e.target.value;
                    setFormData({ ...formData, certificates: newCerts });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`cert-file-${index}`).click()
                  }
                  className={`p-2 rounded-xl border ${cert.file ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800" : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-gray-500"}`}
                >
                  <Camera size={20} />
                </button>
                <input
                  id={`cert-file-${index}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const newCerts = [...formData.certificates];
                    newCerts[index].file = e.target.files[0];
                    setFormData({ ...formData, certificates: newCerts });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      certificates: formData.certificates.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                  className="text-red-400 p-2 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-actions flex justify-between mt-12">
        <button onClick={() => setStep(3)} className="back-btn">
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <button
          onClick={handleSubmit}
          className="submit-btn"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "İlanı Tamamla ve Yayınla"
          )}
        </button>
      </div>
    </StepContainer>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 flex justify-center">
      <MainWrapper>
        <ProgressBar>
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`step ${step >= s ? "active" : ""} ${step > s ? "completed" : ""}`}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 4 && <div className={`line ${step > s ? "active" : ""}`} />}
            </React.Fragment>
          ))}
        </ProgressBar>

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </form>
      </MainWrapper>
    </div>
  );
};

const MainWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
  padding: 60px;
  border: 1px solid #f1f5f9;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
`;

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60px;
  gap: 12px;

  .step {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: #f1f5f9;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    transition: all 0.3s ease;
    &.active {
      background: #2d79f3;
      color: white;
      box-shadow: 0 10px 20px rgba(45, 121, 243, 0.2);
    }
    &.completed {
      background: #10b981;
      color: white;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
    }
  }

  .line {
    width: 40px;
    height: 3px;
    background: #f1f5f9;
    border-radius: 10px;
    &.active {
      background: #10b981;
    }
  }
`;

const StepContainer = styled.div`
  .header-box {
    margin-bottom: 40px;
    h2 {
      font-size: 28px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 10px;
      letter-spacing: -0.02em;

      .dark & {
        color: #f8fafc;
      }
    }
    p {
      color: #64748b;
      font-size: 16px;
      font-weight: 500;

      .dark & {
        color: #94a3b8;
      }
    }
  }

  .footer-actions {
    margin-top: 50px;
    .next-btn,
    .submit-btn {
      background: #2d79f3;
      color: white;
      padding: 16px 40px;
      border-radius: 18px;
      font-weight: 800;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
      box-shadow: 0 10px 20px rgba(45, 121, 243, 0.2);
      &:hover {
        background: #1e40af;
        transform: translateY(-2px);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    .submit-btn {
      background: #10b981;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
      &:hover {
        background: #059669;
      }
    }
    .back-btn {
      color: #64748b;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
      &:hover {
        color: #1e293b;
      }
    }
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  label {
    font-size: 14px;
    font-weight: 800;
    color: #475569;
    margin-bottom: 4px;

    .dark & {
      color: #cbd5e1;
    }
  }

  input,
  select,
  textarea {
    background: #f8fafc;
    border: 2px solid #f1f5f9;
    border-radius: 18px;
    padding: 14px 20px;
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    transition: all 0.2s;
    outline: none;

    .dark & {
      background: #0f172a;
      border-color: #334155;
      color: #f8fafc;
    }

    &:focus {
      border-color: #2d79f3;
      background: white;
      box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.05);

      .dark & {
        background: #0f172a;
        box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.2);
      }
    }

    &::placeholder {
      color: #94a3b8;
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .quill-wrapper {
    width: 100%;
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

const LessonRateBox = styled.div`
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 16px;

  .dark & {
    background: #0f172a;
    border-color: #334155;
  }
`;

const AvailabilityTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px;
  margin-top: 20px;

  th {
    font-size: 11px;
    font-weight: 900;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding-bottom: 15px;
  }

  .slot-name {
    font-size: 12px;
    font-weight: 800;
    color: #475569;
    padding-right: 15px;
    white-space: nowrap;
  }

  .cell {
    width: 60px;
    height: 60px;
    background: #f1f5f9;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    &:hover {
      transform: scale(1.05);
    }
    &.online {
      background: #3b82f6;
    }
    &.inperson {
      background: #10b981;
    }
    &.both {
      background: #8b5cf6;
    }
  }
`;

export default CreateListing;
