import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
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
  Phone,
  Camera,
  Plus,
  Trash2,
  GraduationCap,
  X,
  Search,
  BookOpen,
  FileText,
  Image,
  Award,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getSubjectsHierarchy,
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

const STEPS = [
  { id: 1, label: "Kategori & Branş", icon: Tag, color: "#6366f1" },
  { id: 2, label: "İlan Detayları", icon: FileText, color: "#16a34a" },
  { id: 3, label: "Konum & Gizlilik", icon: MapPin, color: "#10b981" },
  { id: 4, label: "Medya & Belgeler", icon: Image, color: "#f59e0b" },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [profileAvailability, setProfileAvailability] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeVideoUrl: "",
    categoryId: "",
    category: "",
    subCategory: "",
    subjectIds: [],
    subjectNames: [],
    cityId: "",
    districtId: "",
    neighborhoodId: "",
    lessonDuration: 60,
    price: "",
    showPhoneNumber: false,
    showEducation: true,
    listingPhotos: [],
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

  const [branchSearch, setBranchSearch] = useState("");
  const photoInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, cityData, profileData] = await Promise.all([
          getSubjectsHierarchy(),
          getCities(),
          getMyProfile(),
        ]);
        setCategories(catData);
        setCities(cityData);
        if (profileData?.availability)
          setProfileAvailability(profileData.availability);
      } catch {
        toast.error("Veriler yüklenirken hata oluştu.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.cityId) {
      getDistricts(formData.cityId).then(setDistricts);
      setFormData((p) => ({ ...p, districtId: "", neighborhoodId: "" }));
    }
  }, [formData.cityId]);

  useEffect(() => {
    if (formData.districtId) {
      getNeighborhoods(formData.districtId).then(setNeighborhoods);
      setFormData((p) => ({ ...p, neighborhoodId: "" }));
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
      const availabilityValues = Object.values(profileAvailability);
      const hasOnline = availabilityValues.some(
        (v) => v === "online" || v === "both",
      );
      const hasFaceToFace = availabilityValues.some(
        (v) => v === "inperson" || v === "both",
      );
      let serviceType = 1;
      if (hasOnline && hasFaceToFace) serviceType = 3;
      else if (hasFaceToFace) serviceType = 2;

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
      const normalizedPrice = Math.round(p / 50) * 50;

      if (!formData.subjectIds || formData.subjectIds.length === 0) {
        setLoading(false);
        return toast.error("Lütfen en az bir ders seçeneği seçiniz.");
      }

      const primarySubjectId = parseInt(formData.subjectIds[0]);
      const selectedCat = categories.find(
        (c) => c.category === formData.category,
      );
      const selectedSubject = selectedCat?.subjects?.find(
        (s) => s.name === formData.subCategory,
      );
      const selectedOption = selectedSubject?.options?.find(
        (o) => o.id === primarySubjectId,
      );

      // Ek dersleri ve ücretlerini (lessonRates) description alanına JSON etiketleri olarak ekle
      let finalDescription = formData.description.trim();
      if (formData.lessonRates && formData.lessonRates.length > 0) {
        const mappedRates = formData.lessonRates.map((lr) => ({
          title: lr.title || selectedOption?.label || "Özel Ders",
          duration: parseInt(lr.duration) || 60,
          type: lr.type || "both",
          onlinePrice: parseFloat(lr.onlinePrice) || 0,
          inPersonPrice: parseFloat(lr.inPersonPrice) || 0,
        }));
        finalDescription += `\n\n---LESSON_RATES_JSON---\n${JSON.stringify(mappedRates)}\n---END_LESSON_RATES_JSON---`;
      }

      const listingData = {
        title: formData.title.trim(),
        description: finalDescription,
        youtubeVideoUrl: formData.youtubeVideoUrl?.trim() || null,
        subjectId: primarySubjectId,
        subjectIds: formData.subjectIds.map((id) => parseInt(id)),
        cityId: formData.cityId || null,
        districtId: formData.districtId || null,
        neighborhoodId: formData.neighborhoodId || null,
        category: formData.category,
        subCategory: formData.subCategory,
        lessonDuration: parseInt(formData.lessonDuration) || 60,
        price: normalizedPrice,
        serviceType,
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

      if (formData.listingPhotos.length > 0) {
        toast.loading("Fotoğraflar yükleniyor...", { id: "upload-status" });
        await uploadListingPhotos(listingId, formData.listingPhotos);
      }
      for (const cert of formData.certificates) {
        if (cert.file)
          await uploadCertificate(cert.name?.trim() || "Sertifika", cert.file);
      }

      toast.success("İlanınız oluşturuldu ve yönetici onayına gönderildi.", { id: "upload-status" });
      navigate("/tutor/dashboard");
    } catch (err) {
      toast.error(err.message || "İlan oluşturulurken bir hata oluştu.", {
        id: "upload-status",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return (
      <LoadingScreen>
        <div className="spinner-wrap">
          <Loader2 className="spin" size={36} />
          <p>Hazırlanıyor...</p>
        </div>
      </LoadingScreen>
    );

  // ─── Step 1 ────────────────────────────────────────────────────
  const renderStep1 = () => {
    const availableSubjects =
      categories.find((c) => c.category === formData.category)?.subjects || [];
    
    const selectedSubject = availableSubjects.find((s) => s.name === formData.subCategory);
    const availableOptions = selectedSubject?.options || [];

    const toggleOption = (option) => {
      const currentIds = formData.subjectIds || [];
      const isSelected = currentIds.includes(option.id);
      
      setFormData({
        ...formData,
        subjectIds: isSelected 
          ? currentIds.filter(id => id !== option.id) 
          : [...currentIds, option.id]
      });
    };

    return (
      <StepBody>
        {/* Kategori Seçimi */}
        <SectionCard>
          <SectionIcon
            style={{
              background: "linear-gradient(135deg, #6366f120, #818cf820)",
            }}
          >
            <Tag size={20} color="#6366f1" />
          </SectionIcon>
          <SectionTitle>Ana Kategori</SectionTitle>
          <SectionHint>Hangi alanda ders verdiğinizi seçin</SectionHint>
          <ModernSelect
            id="category"
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
          </ModernSelect>
        </SectionCard>

        {/* Branş Seçimi */}
        {formData.category && (
          <SectionCard style={{ marginTop: 20 }}>
            <SectionIcon
              style={{
                background: "linear-gradient(135deg, #16a34a20, #4ade8020)",
              }}
            >
              <BookOpen size={20} color="#16a34a" />
            </SectionIcon>
            <SectionTitle>Ders Branşı</SectionTitle>
            <SectionHint>Spesifik ders branşını veya dili seçin</SectionHint>
            <ModernSelect
              id="subCategory"
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
              {availableSubjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </ModernSelect>
          </SectionCard>
        )}

        {/* Seviye / Alan Seçimi */}
        {formData.subCategory && (
          <SectionCard style={{ marginTop: 20 }}>
            <SectionIcon
              style={{
                background: "linear-gradient(135deg, #f59e0b20, #fbbf2420)",
              }}
            >
              <GraduationCap size={20} color="#f59e0b" />
            </SectionIcon>
            <div className="flex items-center gap-3 mb-1">
              <SectionTitle style={{ margin: 0 }}>Seviye / Alan</SectionTitle>
              {formData.subjectIds?.length > 0 && (
                <CountBadge>{formData.subjectIds.length} seçili</CountBadge>
              )}
            </div>
            <SectionHint>Ders vereceğiniz seviyeleri seçin (Birden fazla seçebilirsiniz)</SectionHint>

            <ChipsGrid style={{ marginTop: '15px' }}>
              {availableOptions.length === 0 ? (
                <NoResult>Bu branş için alt seviye bulunamadı.</NoResult>
              ) : (
                availableOptions.map((o) => {
                  const sel = formData.subjectIds?.includes(o.id);
                  return (
                    <Chip
                      key={o.id}
                      $selected={sel}
                      type="button"
                      onClick={() => toggleOption(o)}
                    >
                      {sel && <CheckCircle2 size={12} />}
                      {o.label}
                    </Chip>
                  );
                })
              )}
            </ChipsGrid>
          </SectionCard>
        )}

        <StepFooter>
          <div />
          <NextBtn
            onClick={() => {
              if (!formData.category)
                return toast.error("Lütfen kategori seçin.");
              if (!formData.subCategory)
                return toast.error("Lütfen branş seçin.");
              if (!formData.subjectIds || formData.subjectIds.length === 0)
                return toast.error("Lütfen en az bir ders seçeneği seçiniz.");
              setStep(2);
            }}
          >
            Sonraki Adım <ArrowRight size={17} />
          </NextBtn>
        </StepFooter>
      </StepBody>
    );
  };

  // ─── Step 2 ────────────────────────────────────────────────────
  const renderStep2 = () => (
    <StepBody>
      {/* Title */}
      <SectionCard>
        <SectionIcon
          style={{
            background: "linear-gradient(135deg, #16a34a20, #4ade8020)",
          }}
        >
          <Type size={20} color="#16a34a" />
        </SectionIcon>
        <SectionTitle>İlan Başlığı</SectionTitle>
        <SectionHint>
          Öğrencilerin dikkatini çekecek güçlü bir başlık yazın
        </SectionHint>
        <ModernInput
          id="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Örn: YKS Matematik — 10 Yıllık Deneyimli Hoca"
          maxLength={150}
        />
        <CharCount>{formData.title.length}/150</CharCount>
      </SectionCard>

      {/* Description */}
      <SectionCard style={{ marginTop: 20 }}>
        <SectionIcon
          style={{
            background: "linear-gradient(135deg, #8b5cf620, #a78bfa20)",
          }}
        >
          <Sparkles size={20} color="#8b5cf6" />
        </SectionIcon>
        <SectionTitle>İlan Açıklaması</SectionTitle>
        <SectionHint>
          Ders işleyiş tarzınız, tecrübeniz ve öğrencilere katacaklarınızdan
          bahsedin
        </SectionHint>
        <QuillWrapper>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            placeholder="Kendinizi ve ders anlayışınızı öğrencilere tanıtın..."
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["clean"],
              ],
            }}
          />
        </QuillWrapper>
      </SectionCard>

      {/* Price + Duration */}
      <TwoColGrid style={{ marginTop: 20 }}>
        <SectionCard>
          <SectionIcon
            style={{
              background: "linear-gradient(135deg, #10b98120, #34d39920)",
            }}
          >
            <DollarSign size={20} color="#10b981" />
          </SectionIcon>
          <SectionTitle>Saatlik Ücret</SectionTitle>
          <SectionHint>300 – 5000 TL arası, 50'nin katı</SectionHint>
          <PriceInput>
            <span>₺</span>
            <input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              onBlur={(e) => {
                let p = parseFloat(e.target.value);
                if (isNaN(p)) return;
                p = Math.round(p / 50) * 50;
                if (p < 300) p = 300;
                if (p > 5000) p = 5000;
                setFormData({ ...formData, price: p.toString() });
              }}
              placeholder="0"
            />
          </PriceInput>
        </SectionCard>

        <SectionCard>
          <SectionIcon
            style={{
              background: "linear-gradient(135deg, #f59e0b20, #fbbf2420)",
            }}
          >
            <Clock size={20} color="#f59e0b" />
          </SectionIcon>
          <SectionTitle>Ders Süresi</SectionTitle>
          <SectionHint>Standart bir dersin süresi</SectionHint>
          <ModernSelect
            id="lessonDuration"
            value={formData.lessonDuration}
            onChange={handleInputChange}
          >
            <option value="30">30 Dakika</option>
            <option value="45">45 Dakika</option>
            <option value="60">60 Dakika</option>
            <option value="90">90 Dakika</option>
            <option value="120">120 Dakika</option>
          </ModernSelect>
        </SectionCard>
      </TwoColGrid>

      {/* YouTube */}
      <SectionCard style={{ marginTop: 20 }}>
        <SectionIcon
          style={{
            background: "linear-gradient(135deg, #ef444420, #f8717120)",
          }}
        >
          <Video size={20} color="#ef4444" />
        </SectionIcon>
        <SectionTitle>
          Tanıtım Videosu <OptionalTag>Opsiyonel</OptionalTag>
        </SectionTitle>
        <SectionHint>
          YouTube video linkinizi ekleyerek öğrencilere kendinizi tanıtın
        </SectionHint>
        <ModernInput
          id="youtubeVideoUrl"
          type="url"
          value={formData.youtubeVideoUrl}
          onChange={handleInputChange}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </SectionCard>

      {/* Lesson Rates */}
      <SectionCard style={{ marginTop: 20 }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <SectionIcon
              style={{
                background: "linear-gradient(135deg, #0ea5e920, #38bdf820)",
              }}
            >
              <TrendingUp size={20} color="#0ea5e9" />
            </SectionIcon>
            <SectionTitle>Verdiğiniz Dersler ve Ücretleri</SectionTitle>
          </div>
          <AddRateBtn
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
          >
            <Plus size={15} /> Ders Ekle
          </AddRateBtn>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 16,
          }}
        >
          {formData.lessonRates.map((rate, index) => (
            <RateCard key={rate.id}>
              <RateCardHeader>
                <span>Ders #{index + 1}</span>
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
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </RateCardHeader>
              <RateGrid>
                <div>
                  <RateLabel>Ders Adı</RateLabel>
                  <RateInput
                    value={rate.title}
                    onChange={(e) => {
                      const r = [...formData.lessonRates];
                      r[index].title = e.target.value;
                      setFormData({ ...formData, lessonRates: r });
                    }}
                    placeholder="Ders gir..."
                  />
                </div>
                <div>
                  <RateLabel>Süre</RateLabel>
                  <RateSelect
                    value={rate.duration}
                    onChange={(e) => {
                      const r = [...formData.lessonRates];
                      r[index].duration = e.target.value;
                      setFormData({ ...formData, lessonRates: r });
                    }}
                  >
                    <option value="30">30 dk</option>
                    <option value="45">45 dk</option>
                    <option value="60">60 dk</option>
                    <option value="90">90 dk</option>
                  </RateSelect>
                </div>
                <div>
                  <RateLabel>Tür</RateLabel>
                  <RateSelect
                    value={rate.type}
                    onChange={(e) => {
                      const r = [...formData.lessonRates];
                      r[index].type = e.target.value;
                      if (e.target.value === "online")
                        r[index].inPersonPrice = "";
                      if (e.target.value === "inperson")
                        r[index].onlinePrice = "";
                      setFormData({ ...formData, lessonRates: r });
                    }}
                  >
                    <option value="both">Her İkisi</option>
                    <option value="online">Sadece Online</option>
                    <option value="inperson">Sadece Yüz Yüze</option>
                  </RateSelect>
                </div>
                {(rate.type === "online" || rate.type === "both") && (
                  <div>
                    <RateLabel>Online Ücret (₺)</RateLabel>
                    <RateInput
                      type="number"
                      value={rate.onlinePrice}
                      onChange={(e) => {
                        const r = [...formData.lessonRates];
                        r[index].onlinePrice = e.target.value;
                        setFormData({ ...formData, lessonRates: r });
                      }}
                      onBlur={(e) => {
                        let p = parseFloat(e.target.value);
                        if (!isNaN(p)) {
                          p = Math.round(p / 50) * 50;
                          if (p < 300) p = 300;
                          if (p > 5000) p = 5000;
                          const r = [...formData.lessonRates];
                          r[index].onlinePrice = p.toString();
                          setFormData({ ...formData, lessonRates: r });
                        }
                      }}
                      placeholder="₺"
                    />
                  </div>
                )}
                {(rate.type === "inperson" || rate.type === "both") && (
                  <div>
                    <RateLabel>Yüz Yüze Ücret (₺)</RateLabel>
                    <RateInput
                      type="number"
                      value={rate.inPersonPrice}
                      onChange={(e) => {
                        const r = [...formData.lessonRates];
                        r[index].inPersonPrice = e.target.value;
                        setFormData({ ...formData, lessonRates: r });
                      }}
                      onBlur={(e) => {
                        let p = parseFloat(e.target.value);
                        if (!isNaN(p)) {
                          p = Math.round(p / 50) * 50;
                          if (p < 300) p = 300;
                          if (p > 5000) p = 5000;
                          const r = [...formData.lessonRates];
                          r[index].inPersonPrice = p.toString();
                          setFormData({ ...formData, lessonRates: r });
                        }
                      }}
                      placeholder="₺"
                    />
                  </div>
                )}
              </RateGrid>
            </RateCard>
          ))}
        </div>
      </SectionCard>

      <StepFooter>
        <BackBtn onClick={() => setStep(1)}>
          <ArrowLeft size={17} /> Geri
        </BackBtn>
        <NextBtn
          onClick={() => {
            if (!formData.title || !formData.description || !formData.price)
              return toast.error("Lütfen zorunlu alanları doldurun.");
            const p = parseFloat(formData.price);
            if (p < 300 || p > 5000 || p % 50 !== 0)
              return toast.error("Fiyat 300-5000 TL ve 50'nin katı olmalıdır.");
            setStep(3);
          }}
        >
          Sonraki Adım <ArrowRight size={17} />
        </NextBtn>
      </StepFooter>
    </StepBody>
  );

  // ─── Step 3 ────────────────────────────────────────────────────
  const renderStep3 = () => (
    <StepBody>
      <SectionCard>
        <SectionIcon
          style={{
            background: "linear-gradient(135deg, #10b98120, #34d39920)",
          }}
        >
          <MapPin size={20} color="#10b981" />
        </SectionIcon>
        <SectionTitle>Konum Bilgileri</SectionTitle>
        <SectionHint>
          Yüz yüze ders verebileceğiniz bölgeyi belirtin
        </SectionHint>
        <ThreeColGrid>
          <div>
            <FieldLabel>Şehir</FieldLabel>
            <ModernSelect
              id="cityId"
              value={formData.cityId}
              onChange={handleInputChange}
            >
              <option value="">Şehir Seçin</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </ModernSelect>
          </div>
          <div>
            <FieldLabel style={{ opacity: formData.cityId ? 1 : 0.5 }}>
              İlçe
            </FieldLabel>
            <ModernSelect
              id="districtId"
              value={formData.districtId}
              onChange={handleInputChange}
              disabled={!formData.cityId}
            >
              <option value="">İlçe Seçin</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </ModernSelect>
          </div>
          <div>
            <FieldLabel style={{ opacity: formData.districtId ? 1 : 0.5 }}>
              Mahalle
            </FieldLabel>
            <ModernSelect
              id="neighborhoodId"
              value={formData.neighborhoodId}
              onChange={handleInputChange}
              disabled={!formData.districtId}
            >
              <option value="">Mahalle Seçin</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </ModernSelect>
          </div>
        </ThreeColGrid>
      </SectionCard>

      <SectionCard style={{ marginTop: 20 }}>
        <SectionIcon
          style={{
            background: "linear-gradient(135deg, #8b5cf620, #a78bfa20)",
          }}
        >
          <Eye size={20} color="#8b5cf6" />
        </SectionIcon>
        <SectionTitle>Gizlilik Ayarları</SectionTitle>
        <SectionHint>
          Öğrencilerin hangi bilgileri görebileceğini kontrol edin
        </SectionHint>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 16,
          }}
        >
          <ToggleRow>
            <div className="toggle-info">
              <div className="toggle-icon" style={{ background: "#dbeafe" }}>
                <Phone size={18} color="#15803d" />
              </div>
              <div>
                <p className="toggle-title">Telefon Numaram Görünsün</p>
                <p className="toggle-hint">
                  Öğrenciler size doğrudan ulaşabilsin
                </p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                id="showPhoneNumber"
                checked={formData.showPhoneNumber}
                onChange={handleInputChange}
              />
              <span className="slider" />
            </label>
          </ToggleRow>

          <ToggleRow>
            <div className="toggle-info">
              <div className="toggle-icon" style={{ background: "#ede9fe" }}>
                <GraduationCap size={18} color="#7c3aed" />
              </div>
              <div>
                <p className="toggle-title">Eğitim Bilgilerim Görünsün</p>
                <p className="toggle-hint">
                  Üniversite ve bölüm bilgileriniz ilanda yer alsın
                </p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                id="showEducation"
                checked={formData.showEducation}
                onChange={handleInputChange}
              />
              <span className="slider" />
            </label>
          </ToggleRow>
        </div>
      </SectionCard>

      <StepFooter>
        <BackBtn onClick={() => setStep(2)}>
          <ArrowLeft size={17} /> Geri
        </BackBtn>
        <NextBtn
          onClick={() => {
            if (!formData.cityId || !formData.districtId)
              return toast.error("Lütfen şehir ve ilçe seçin.");
            setStep(4);
          }}
        >
          Sonraki Adım <ArrowRight size={17} />
        </NextBtn>
      </StepFooter>
    </StepBody>
  );

  // ─── Step 4 ────────────────────────────────────────────────────
  const renderStep4 = () => (
    <StepBody>
      <SectionCard>
        <SectionIcon
          style={{
            background: "linear-gradient(135deg, #f59e0b20, #fbbf2420)",
          }}
        >
          <Image size={20} color="#f59e0b" />
        </SectionIcon>
        <SectionTitle>
          İlan Fotoğrafları <OptionalTag>En fazla 2</OptionalTag>
        </SectionTitle>
        <SectionHint>Kaliteli fotoğraflar ilanınızı öne çıkarır</SectionHint>

        <PhotoGrid>
          {formData.listingPhotos.map((photo, index) => (
            <PhotoCard key={index}>
              <img src={URL.createObjectURL(photo)} alt={`photo-${index}`} />
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
              >
                <X size={14} />
              </button>
            </PhotoCard>
          ))}
          {formData.listingPhotos.length < 2 && (
            <PhotoUploadBtn
              type="button"
              onClick={() => photoInputRef.current?.click()}
            >
              <Camera size={28} />
              <span>Fotoğraf Ekle</span>
              <small>JPG, PNG, WEBP</small>
            </PhotoUploadBtn>
          )}
        </PhotoGrid>
        <input
          ref={photoInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const files = Array.from(e.target.files);
            const validTypes = ["image/jpeg", "image/png", "image/webp"];
            const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

            const currentCount = formData.listingPhotos.length;
            if (currentCount + files.length > 2) {
              toast.error("En fazla 2 adet ilan fotoğrafı yükleyebilirsiniz.");
              return;
            }

            const invalidFile = files.find(f => !validTypes.includes(f.type));
            if (invalidFile) {
              toast.error("Yalnızca JPG, PNG ve WEBP formatındaki resimler desteklenmektedir.");
              return;
            }

            const oversizedFile = files.find(f => f.size > maxSizeBytes);
            if (oversizedFile) {
              toast.error("Her bir resmin boyutu en fazla 5 MB olabilir.");
              return;
            }

            setFormData({
              ...formData,
              listingPhotos: [...formData.listingPhotos, ...files],
            });
          }}
        />
      </SectionCard>

      <SectionCard style={{ marginTop: 20 }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <SectionIcon
              style={{
                background: "linear-gradient(135deg, #6366f120, #818cf820)",
              }}
            >
              <Award size={20} color="#6366f1" />
            </SectionIcon>
            <SectionTitle>
              Sertifikalar & Belgeler <OptionalTag>Opsiyonel</OptionalTag>
            </SectionTitle>
          </div>
          <AddRateBtn
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
          >
            <Plus size={15} /> Ekle
          </AddRateBtn>
        </div>

        {formData.certificates.length === 0 && (
          <EmptyState>
            <Award size={40} />
            <p>Henüz sertifika eklenmedi</p>
            <small>Sertifikalarınız ilanınıza güvenilirlik katar</small>
          </EmptyState>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 12,
          }}
        >
          {formData.certificates.map((cert, index) => (
            <CertRow key={index}>
              <input
                placeholder="Sertifika adı (Örn: YÖKDİL Sertifikası)"
                value={cert.name}
                onChange={(e) => {
                  const c = [...formData.certificates];
                  c[index].name = e.target.value;
                  setFormData({ ...formData, certificates: c });
                }}
              />
              <button
                type="button"
                className={`file-btn ${cert.file ? "has-file" : ""}`}
                onClick={() =>
                  document.getElementById(`cert-file-${index}`).click()
                }
              >
                <Camera size={16} />
                {cert.file ? "Değiştir" : "Dosya"}
              </button>
              <input
                id={`cert-file-${index}`}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  const c = [...formData.certificates];
                  c[index].file = e.target.files[0];
                  setFormData({ ...formData, certificates: c });
                }}
              />
              <button
                type="button"
                className="del-btn"
                onClick={() =>
                  setFormData({
                    ...formData,
                    certificates: formData.certificates.filter(
                      (_, i) => i !== index,
                    ),
                  })
                }
              >
                <Trash2 size={16} />
              </button>
            </CertRow>
          ))}
        </div>
      </SectionCard>

      <StepFooter>
        <BackBtn onClick={() => setStep(3)}>
          <ArrowLeft size={17} /> Geri
        </BackBtn>
        <SubmitBtn onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <CheckCircle2 size={18} /> İlanı Yayınla
            </>
          )}
        </SubmitBtn>
      </StepFooter>
    </StepBody>
  );

  return (
    <PageWrapper>
      {/* Top gradient header */}
      <PageHeader>
        <div className="header-content">
          <div className="header-tag">
            <Sparkles size={14} />
            Yeni İlan Oluştur
          </div>
          <h1>İlanınızı oluşturalım</h1>
          <p>
            Sadece birkaç adımda profesyonel bir ilan oluşturun ve öğrencilere
            ulaşın.
          </p>
        </div>
      </PageHeader>

      <PageBody>
        {/* Step indicator */}
        <StepTracker>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isDone = step > s.id;
            const isActive = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <StepDot $done={isDone} $active={isActive} $color={s.color}>
                  <div className="dot-inner">
                    {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>
                  <div className="dot-label">
                    <span className="dot-num">Adım {s.id}</span>
                    <span className="dot-name">{s.label}</span>
                  </div>
                </StepDot>
                {idx < STEPS.length - 1 && <StepLine $done={step > s.id} />}
              </React.Fragment>
            );
          })}
        </StepTracker>

        {/* Form card */}
        <FormCard>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </FormCard>
      </PageBody>
    </PageWrapper>
  );
};

// ── Animations ──────────────────────────────────────────────────
const fadeUp = keyframes`from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); }`;
const spin = keyframes`from { transform:rotate(0deg); } to { transform:rotate(360deg); }`;

// ── Styled Components ────────────────────────────────────────────
const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  .spinner-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .spin {
    animation: ${spin} 1s linear infinite;
    color: #16a34a;
  }
  p {
    font-size: 15px;
    font-weight: 700;
    color: #64748b;
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(160deg, #f0f4ff 0%, #f8fafc 50%, #f0fdf4 100%);
  .dark & {
    background: linear-gradient(160deg, var(--page-bg) 0%, var(--card-bg) 100%);
  }
  padding-bottom: 80px;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #1e40af 0%, #16a34a 50%, #4f46e5 100%);
  padding: 60px 24px 80px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .header-content {
    position: relative;
    z-index: 1;
    max-width: 640px;
    margin: 0 auto;
  }

  .header-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 12px;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 40px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 16px;
    backdrop-filter: blur(8px);
  }

  h1 {
    color: white;
    font-size: clamp(26px, 5vw, 40px);
    font-weight: 900;
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }
  p {
    color: rgba(255, 255, 255, 0.75);
    font-size: 16px;
    font-weight: 500;
  }
`;

const PageBody = styled.div`
  max-width: 860px;
  margin: -40px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 1;
`;

const StepTracker = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 24px;
  padding: 20px 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  overflow-x: auto;
  gap: 0;
  scrollbar-width: none;

  .dark & {
    background: var(--card-bg);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 640px) {
    padding: 16px 12px;
  }
`;

const StepDot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .dot-inner {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 14px;
    transition: all 0.3s;
    ${({ $done, $active, $color }) =>
      $done
        ? css`
            background: ${$color};
            color: white;
            box-shadow: 0 6px 16px ${$color}40;
          `
        : $active
          ? css`
              background: ${$color};
              color: white;
              box-shadow: 0 6px 16px ${$color}40;
              animation: ${fadeUp} 0.3s ease;
            `
          : css`
              background: #f1f5f9;
              color: var(--text-muted);
              .dark & {
                background: var(--card-border);
                color: #64748b;
              }
            `}
  }

  .dot-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (max-width: 480px) {
      display: none;
    }
  }
  .dot-num {
    font-size: 9px;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .dot-name {
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    color: ${({ $active, $done, $color }) =>
      $active || $done ? "var(--card-bg)" : "var(--text-muted)"};
    .dark & {
      color: ${({ $active, $done }) =>
        $active || $done ? "#f1f5f9" : "#475569"};
    }
  }
`;

const StepLine = styled.div`
  height: 2px;
  flex: 1;
  min-width: 16px;
  max-width: 60px;
  background: ${({ $done }) =>
    $done ? "linear-gradient(90deg,#10b981,#34d399)" : "#f1f5f9"};
  border-radius: 4px;
  transition: all 0.4s;
  margin: 0 8px;
  margin-bottom: 28px;
  .dark & {
    background: ${({ $done }) =>
      $done ? "linear-gradient(90deg,#10b981,#34d399)" : "var(--card-border)"};
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 28px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  animation: ${fadeUp} 0.4s ease;

  .dark & {
    background: var(--card-bg);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  }
`;

const StepBody = styled.div`
  padding: 36px;
  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const SectionCard = styled.div`
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 24px;
  animation: ${fadeUp} 0.3s ease;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }
`;

const SectionIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  .dark & {
    color: #f1f5f9;
  }
`;

const SectionHint = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 16px;
`;

const OptionalTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 10px;
  border-radius: 20px;
  letter-spacing: 0.03em;
  .dark & {
    background: var(--card-border);
    color: var(--text-muted);
  }
`;

const ModernSelect = styled.select`
  width: 100%;
  padding: 14px 18px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  cursor: pointer;

  .dark & {
    background-color: var(--card-bg);
    border-color: var(--card-border);
    color: #f1f5f9;
  }

  &:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModernInput = styled.input`
  width: 100%;
  padding: 14px 18px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    color: #f1f5f9;
  }
  &:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
  &::placeholder {
    color: var(--text-muted);
    font-weight: 500;
  }
`;

const CharCount = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-align: right;
  margin-top: 6px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  .dark & {
    color: var(--text-muted);
  }
`;

const PriceInput = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.2s;
  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }

  span {
    padding: 0 16px;
    font-size: 20px;
    font-weight: 900;
    color: #10b981;
    border-right: 2px solid #e2e8f0;
    background: #f0fdf4;
    height: 52px;
    display: flex;
    align-items: center;
    .dark & {
      background: #064e3b30;
      border-color: var(--card-border);
    }
  }

  input {
    flex: 1;
    padding: 14px 18px;
    font-size: 18px;
    font-weight: 900;
    color: var(--text-primary);
    border: none;
    outline: none;
    background: transparent;
    .dark & {
      color: #f1f5f9;
    }
    &::placeholder {
      color: var(--text-primary);
      font-weight: 400;
      font-size: 16px;
    }
  }
`;

const QuillWrapper = styled.div`
  .quill {
    background: white;
    border-radius: 14px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.2s;
    &:focus-within {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
    .dark & {
      background: var(--card-bg);
      border-color: var(--card-border);
    }
  }
  .ql-toolbar {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    .dark & {
      background: var(--page-bg);
      border-color: var(--card-border);
    }
  }
  .ql-container {
    border: none;
    font-size: 14px;
  }
  .ql-editor {
    min-height: 160px;
    color: var(--text-primary);
    .dark & {
      color: #f1f5f9;
    }
    &.ql-blank::before {
      color: var(--text-muted);
      font-style: normal;
    }
  }
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ThreeColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin-top: 16px;
  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const AddRateBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.2s;
  &:hover {
    background: #dbeafe;
  }
  .dark & {
    background: #14532d30;
    color: #4ade80;
  }
`;

const RateCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }
`;

const RateCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  span {
    font-size: 12px;
    font-weight: 900;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  button {
    color: #ef4444;
    padding: 4px 8px;
    border-radius: 8px;
    background: #fef2f2;
    &:hover {
      background: #fee2e2;
    }
  }
`;

const RateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`;

const RateLabel = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

const rateFieldBase = `
  width:100%; padding:10px 14px;
  background:#f8fafc; border:2px solid #f1f5f9;
  border-radius:12px; font-size:14px; font-weight:700;
  color:var(--text-primary); outline:none; transition:all 0.2s;
  &:focus { border-color:#16a34a; background:white; }
  &::placeholder { color: var(--text-muted); font-weight: 500; }

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
    color: #f1f5f9;
    
    &::placeholder {
      color: #475569;
    }
    
    &:focus {
      background: var(--page-bg);
      border-color: #16a34a;
    }

    option {
      background: var(--card-bg);
      color: #f1f5f9;
    }
  }
`;

const RateInput = styled.input`
  ${rateFieldBase}
`;
const RateSelect = styled.select`
  ${rateFieldBase} appearance:none;
  cursor: pointer;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  gap: 16px;
  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }

  .toggle-info {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .toggle-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .toggle-title {
    font-size: 14px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 2px;
    .dark & {
      color: #f1f5f9;
    }
  }
  .toggle-hint {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
    flex-shrink: 0;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: #e2e8f0;
      transition: 0.3s;
      border-radius: 28px;

      &::before {
        content: "";
        position: absolute;
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
    }

    input:checked + .slider {
      background: #16a34a;
    }
    input:checked + .slider::before {
      transform: translateX(22px);
    }
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  margin-top: 16px;
`;

const PhotoCard = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 4/3;
  border: 2px solid #e2e8f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 8px;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    &:hover {
      background: rgba(239, 68, 68, 0.9);
    }
  }
`;

const PhotoUploadBtn = styled.button`
  aspect-ratio: 4/3;
  border-radius: 16px;
  border: 2px dashed #d1d5db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  transition: all 0.2s;
  background: #fafafa;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
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
    font-size: 13px;
    font-weight: 800;
  }
  small {
    font-size: 10px;
    font-weight: 600;
    opacity: 0.6;
  }
`;

const CertRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 16px;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    background: transparent;
    .dark & {
      color: #f1f5f9;
    }
    &::placeholder {
      color: var(--text-muted);
    }
  }

  .file-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 10px;
    background: #f1f5f9;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
    transition: all 0.2s;
    white-space: nowrap;
    &.has-file {
      background: #dcfce7;
      color: #16a34a;
    }
    &:hover {
      background: #e2e8f0;
    }
  }

  .del-btn {
    color: #ef4444;
    padding: 6px;
    border-radius: 8px;
    &:hover {
      background: #fef2f2;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--text-primary);
  gap: 8px;
  p {
    font-size: 14px;
    font-weight: 700;
  }
  small {
    font-size: 12px;
    opacity: 0.7;
  }
`;

// ─── Branch Selector ──────────────────────────────────────────
const CountBadge = styled.span`
  background: #16a34a;
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 10px;
  border-radius: 20px;
`;

const SelectedChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 2px dashed #e2e8f0;
  align-items: center;
  .dark & {
    border-color: var(--card-border);
  }
`;

const SelectedChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: #16a34a;
  color: white;
  border-radius: 40px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 2px 10px rgba(22, 163, 74, 0.3);

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    &:hover {
      background: rgba(255, 255, 255, 0.45);
    }
  }
`;

const ClearBtn = styled.button`
  font-size: 11px;
  font-weight: 700;
  color: #ef4444;
  text-decoration: underline;
  padding: 4px;
  &:hover {
    color: #dc2626;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 14px;
  transition: all 0.2s;
  &:focus-within {
    border-color: #16a34a;
  }
  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }
  svg {
    color: var(--text-muted);
    flex-shrink: 0;
  }
  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    background: transparent;
    .dark & {
      color: #f1f5f9;
    }
    &::placeholder {
      color: var(--text-muted);
      font-weight: 500;
    }
  }
`;

const ChipsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
`;

const NoResult = styled.p`
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  padding: 16px 0;
`;

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 40px;
  border: 2px solid ${({ $selected }) => ($selected ? "#16a34a" : "#e2e8f0")};
  background: ${({ $selected }) => ($selected ? "#16a34a" : "white")};
  color: ${({ $selected }) => ($selected ? "white" : "#475569")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  box-shadow: ${({ $selected }) =>
    $selected ? "0 4px 14px rgba(45,121,243,0.35)" : "none"};

  .dark & {
    background: ${({ $selected }) => ($selected ? "#16a34a" : "var(--card-bg)")};
    border-color: ${({ $selected }) => ($selected ? "#16a34a" : "var(--card-border)")};
    color: ${({ $selected }) => ($selected ? "white" : "var(--text-primary)")};
  }

  &:hover {
    border-color: #16a34a;
    color: ${({ $selected }) => ($selected ? "white" : "#16a34a")};
    background: ${({ $selected }) => ($selected ? "#14532d" : "#f0fdf4")};
    transform: translateY(-1px);
  }
`;

// ─── Navigation Buttons ──────────────────────────────────────
const StepFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  .dark & {
    border-color: var(--card-border);
  }
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 12px;
  }
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 800;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  &:hover {
    background: #e2e8f0;
    color: var(--text-primary);
  }
  .dark & {
    background: var(--card-border);
    color: var(--text-muted);
    border-color: var(--card-border);
    &:hover {
      color: #f1f5f9;
    }
  }
`;

const NextBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 900;
  color: white;
  background: linear-gradient(135deg, #16a34a, #4f46e5);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35);
  transition: all 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(22, 163, 74, 0.45);
  }
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const SubmitBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 32px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 900;
  color: white;
  background: linear-gradient(135deg, #059669, #10b981);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  transition: all 0.2s;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(16, 185, 129, 0.45);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

export default CreateListing;
