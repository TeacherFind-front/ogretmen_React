import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  ArrowRight,
  ArrowLeft,
  Tag,
  MapPin,
  Camera,
  Plus,
  Trash2,
  X,
  BookOpen,
  FileText,
  Image,
  Loader2,
  CheckCircle2,
  Sparkles,
  Star,
  Check,
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
  getMyListings,
  updateMyListing,
  uploadListingPhotos,
  deleteListingPhoto,
  setMainListingPhoto,
  getMyProfile,
} from "@/services/tutorService";
import { resolveMediaUrl } from "@/utils/helpers";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, label: "Kategori & Branş", icon: Tag, color: "#6366f1" },
  { id: 2, label: "İlan Detayları", icon: FileText, color: "#16a34a" },
  { id: 3, label: "Konum & Gizlilik", icon: MapPin, color: "#10b981" },
  { id: 4, label: "Medya & Yönetim", icon: Image, color: "#f59e0b" },
];

export default function EditListing() {
  const { id } = useParams();
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
    lessonRates: [],
  });

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [branchSearch, setBranchSearch] = useState("");
  const photoInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, cityData, profileData, listingsData] = await Promise.all([
          getSubjectsHierarchy(),
          getCities(),
          getMyProfile(),
          getMyListings(),
        ]);
        setCategories(catData);
        setCities(cityData);
        if (profileData?.availability) {
          setProfileAvailability(profileData.availability);
        }

        // İlan listesinden ilgili ilanı bul
        let list = [];
        if (Array.isArray(listingsData)) list = listingsData;
        else if (listingsData && Array.isArray(listingsData.items)) list = listingsData.items;
        else if (listingsData && Array.isArray(listingsData.$values)) list = listingsData.$values;

        const currentListing = list.find((item) => item.id === id);
        if (!currentListing) {
          toast.error("İlan bulunamadı.");
          navigate("/tutor/listings");
          return;
        }

        // Description'dan rates temizle
        let cleanDesc = currentListing.description || "";
        const m = cleanDesc.match(/---LESSON_RATES_JSON---([\s\S]*?)---END_LESSON_RATES_JSON---/);
        let rates = [];
        if (m) {
          try {
            rates = JSON.parse(m[1].trim());
            cleanDesc = cleanDesc.replace(/---LESSON_RATES_JSON---[\s\S]*?---END_LESSON_RATES_JSON---/, "").trim();
          } catch {}
        }
        if (!rates.length && currentListing.lessonRates) {
          rates = currentListing.lessonRates.$values || currentListing.lessonRates || [];
        }

        // İlçe ve mahalle verilerini önceden çek
        if (currentListing.cityId) {
          const distData = await getDistricts(currentListing.cityId);
          setDistricts(distData);
        }
        if (currentListing.districtId) {
          const neighData = await getNeighborhoods(currentListing.districtId);
          setNeighborhoods(neighData);
        }

        setFormData({
          title: currentListing.title || "",
          description: cleanDesc,
          youtubeVideoUrl: currentListing.youtubeVideoUrl || "",
          categoryId: "",
          category: currentListing.category || "",
          subCategory: currentListing.subCategory || "",
          subjectIds: currentListing.subjects?.map((s) => s.subjectId?.toString()) || [currentListing.subjectId?.toString()].filter(Boolean),
          subjectNames: currentListing.subjects?.map((s) => s.subjectName) || [],
          cityId: currentListing.cityId || "",
          districtId: currentListing.districtId || "",
          neighborhoodId: currentListing.neighborhoodId || "",
          lessonDuration: currentListing.lessonDuration || 60,
          price: currentListing.price?.toString() || "",
          showPhoneNumber: currentListing.showPhoneNumber || false,
          showEducation: currentListing.showEducation !== false,
          lessonRates: rates.map((r, index) => ({
            id: r.id || index,
            title: r.title || r.subjectName || "",
            duration: r.duration || r.durationMinutes || 45,
            type: r.type || r.serviceType?.toLowerCase() || "both",
            onlinePrice: r.onlinePrice || (r.serviceType === "Online" ? r.price : ""),
            inPersonPrice: r.inPersonPrice || (r.serviceType !== "Online" ? r.price : ""),
          })),
        });

        const photosList = currentListing.photos?.$values || currentListing.photos || [];
        setExistingPhotos(photosList);
      } catch (err) {
        toast.error("Veriler yüklenirken hata oluştu.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (formData.cityId && !initialLoading) {
      getDistricts(formData.cityId).then(setDistricts);
      setFormData((p) => ({ ...p, districtId: "", neighborhoodId: "" }));
    }
  }, [formData.cityId]);

  useEffect(() => {
    if (formData.districtId && !initialLoading) {
      getNeighborhoods(formData.districtId).then(setNeighborhoods);
      setFormData((p) => ({ ...p, neighborhoodId: "" }));
    }
  }, [formData.districtId]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({ ...formData, [id]: type === "checkbox" ? checked : value });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (existingPhotos.length + files.length > 2) {
      toast.error("En fazla 2 adet ilan fotoğrafı yükleyebilirsiniz.");
      return;
    }

    const file = files[0];
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Yalnızca JPG, PNG ve WEBP formatındaki resimler desteklenmektedir.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5 MB'tan küçük olmalıdır.");
      return;
    }

    toast.loading("Fotoğraf yükleniyor...", { id: "uploading-photo" });
    try {
      const updatedPhotos = await uploadListingPhotos(id, file);
      const list = updatedPhotos.$values || updatedPhotos || [];
      setExistingPhotos(list);
      toast.success("Fotoğraf başarıyla yüklendi.", { id: "uploading-photo" });
    } catch (err) {
      toast.error(err.message || "Fotoğraf yüklenirken bir hata oluştu.", { id: "uploading-photo" });
    }
  };

  const handleSetMainPhoto = async (photoId) => {
    toast.loading("Kapak fotoğrafı güncelleniyor...", { id: "main-photo" });
    try {
      await setMainListingPhoto(id, photoId);
      setExistingPhotos((prev) =>
        prev.map((p) => ({ ...p, isMain: p.id === photoId }))
      );
      toast.success("Kapak fotoğrafı güncellendi.", { id: "main-photo" });
    } catch (err) {
      toast.error(err.message || "Kapak fotoğrafı belirlenemedi.", { id: "main-photo" });
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const confirm = window.confirm("Bu fotoğrafı silmek istediğinize emin misiniz?");
    if (!confirm) return;

    toast.loading("Fotoğraf siliniyor...", { id: "delete-photo" });
    try {
      await deleteListingPhoto(id, photoId);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Fotoğraf silindi.", { id: "delete-photo" });
    } catch (err) {
      toast.error(err.message || "Fotoğraf silinemedi.", { id: "delete-photo" });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const availabilityValues = Object.values(profileAvailability);
      const hasOnline = availabilityValues.some((v) => v === "online" || v === "both");
      const hasFaceToFace = availabilityValues.some((v) => v === "inperson" || v === "both");
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
      const selectedCat = categories.find((c) => c.category === formData.category);
      const selectedSubject = selectedCat?.subjects?.find((s) => s.name === formData.subCategory);
      const selectedOption = selectedSubject?.options?.find((o) => o.id === primarySubjectId);

      // Description sonuna rates JSON ekleme
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

      await updateMyListing(id, listingData);
      toast.success("İlan başarıyla güncellendi.");
      navigate("/tutor/listings");
    } catch (err) {
      toast.error(err.message || "İlan güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    return (
      <StepBody>
        <SectionCard>
          <SectionIcon style={{ background: "linear-gradient(135deg, #6366f120, #4f46e520)" }}>
            <Tag size={20} color="#6366f1" />
          </SectionIcon>
          <SectionTitle>Kategori ve Branş Seçimi</SectionTitle>
          <SectionHint>İlanınızın hangi kategoride ve ders altında listeleneceğini belirleyin.</SectionHint>

          <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 15 }}>
            <div>
              <Label>Ana Kategori</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subCategory: "",
                    subjectIds: [],
                    subjectNames: [],
                  });
                }}
              >
                <option value="">Seçiniz...</option>
                {categories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </Select>
            </div>

            {formData.category && (
              <div>
                <Label>Alt Branş</Label>
                <Select
                  id="subCategory"
                  value={formData.subCategory}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      subCategory: e.target.value,
                      subjectIds: [],
                      subjectNames: [],
                    });
                  }}
                >
                  <option value="">Seçiniz...</option>
                  {categories
                    .find((c) => c.category === formData.category)
                    ?.subjects?.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                </Select>
              </div>
            )}

            {formData.subCategory && (
              <div style={{ position: "relative" }}>
                <Label>Ders Seçenekleri (En az 1 adet seçilmelidir)</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0" }}>
                  {categories
                    .find((c) => c.category === formData.category)
                    ?.subjects?.find((s) => s.name === formData.subCategory)
                    ?.options?.map((opt) => {
                      const isSelected = formData.subjectIds.includes(opt.id.toString());
                      return (
                        <FilterBadge
                          key={opt.id}
                          $active={isSelected}
                          onClick={() => {
                            let ids = [...formData.subjectIds];
                            let names = [...formData.subjectNames];
                            if (isSelected) {
                              ids = ids.filter((x) => x !== opt.id.toString());
                              names = names.filter((x) => x !== opt.label);
                            } else {
                              ids.push(opt.id.toString());
                              names.push(opt.label);
                            }
                            setFormData({ ...formData, subjectIds: ids, subjectNames: names });
                          }}
                        >
                          {opt.label}
                        </FilterBadge>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <StepFooter>
          <div />
          <NextBtn
            disabled={!formData.category || !formData.subCategory || formData.subjectIds.length === 0}
            onClick={() => setStep(2)}
          >
            Devam Et <ArrowRight size={17} />
          </NextBtn>
        </StepFooter>
      </StepBody>
    );
  };

  const renderStep2 = () => {
    return (
      <StepBody>
        <SectionCard>
          <SectionIcon style={{ background: "linear-gradient(135deg, #16a34a20, #22c55e20)" }}>
            <FileText size={20} color="#16a34a" />
          </SectionIcon>
          <SectionTitle>İlan Detayları</SectionTitle>
          <SectionHint>Kendinizi ve ders anlatım tarzınızı öğrencilere en iyi şekilde tanıtın.</SectionHint>

          <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 15 }}>
            <div>
              <Label>İlan Başlığı</Label>
              <Input
                id="title"
                placeholder="Örn: Deneyimli Öğretmenden LGS Matematik Özel Dersi"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label>İlan Açıklaması</Label>
              <RichEditorWrapper>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                    ],
                  }}
                />
              </RichEditorWrapper>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
              <div>
                <Label>Ders Saati Ücreti (TL)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="300 - 5000"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Ders Süresi (Dakika)</Label>
                <Select
                  id="lessonDuration"
                  value={formData.lessonDuration}
                  onChange={handleInputChange}
                >
                  <option value={30}>30 Dakika</option>
                  <option value={45}>45 Dakika</option>
                  <option value={60}>60 Dakika</option>
                  <option value={90}>90 Dakika</option>
                  <option value={120}>120 Dakika</option>
                </Select>
              </div>
            </div>

            <div>
              <Label>Youtube Tanıtım Videosu Linki (İsteğe Bağlı)</Label>
              <Input
                id="youtubeVideoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtubeVideoUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </SectionCard>

        {formData.subjectIds.length > 0 && (
          <SectionCard style={{ marginTop: 20 }}>
            <SectionTitle>Ders Seçenekleri ve Özel Ücretler</SectionTitle>
            <SectionHint>Her bir seçtiğiniz ders için ek süre ve ders fiyat ayarları ekleyebilirsiniz.</SectionHint>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 15 }}>
              {formData.lessonRates.map((rate, index) => (
                <RateConfigCard key={rate.id || index}>
                  <div className="rate-header">
                    <span className="rate-title">{rate.title}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          lessonRates: formData.lessonRates.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="rate-body">
                    <div>
                      <Label>Ders Konu / Adı</Label>
                      <Input
                        value={rate.title}
                        onChange={(e) => {
                          const rates = [...formData.lessonRates];
                          rates[index].title = e.target.value;
                          setFormData({ ...formData, lessonRates: rates });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Ders Tipi</Label>
                      <Select
                        value={rate.type}
                        onChange={(e) => {
                          const rates = [...formData.lessonRates];
                          rates[index].type = e.target.value;
                          setFormData({ ...formData, lessonRates: rates });
                        }}
                      >
                        <option value="both">Her İkisi</option>
                        <option value="online">Sadece Online</option>
                        <option value="inperson">Sadece Yüz Yüze</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Süre (dk)</Label>
                      <Input
                        type="number"
                        value={rate.duration}
                        onChange={(e) => {
                          const rates = [...formData.lessonRates];
                          rates[index].duration = e.target.value;
                          setFormData({ ...formData, lessonRates: rates });
                        }}
                      />
                    </div>
                    {(rate.type === "both" || rate.type === "online") && (
                      <div>
                        <Label>Online Fiyat (TL)</Label>
                        <Input
                          type="number"
                          value={rate.onlinePrice}
                          onChange={(e) => {
                            const rates = [...formData.lessonRates];
                            rates[index].onlinePrice = e.target.value;
                            setFormData({ ...formData, lessonRates: rates });
                          }}
                        />
                      </div>
                    )}
                    {(rate.type === "both" || rate.type === "inperson") && (
                      <div>
                        <Label>Yüz Yüze Fiyat (TL)</Label>
                        <Input
                          type="number"
                          value={rate.inPersonPrice}
                          onChange={(e) => {
                            const rates = [...formData.lessonRates];
                            rates[index].inPersonPrice = e.target.value;
                            setFormData({ ...formData, lessonRates: rates });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </RateConfigCard>
              ))}

              <AddRateBtn
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    lessonRates: [
                      ...formData.lessonRates,
                      {
                        id: Date.now(),
                        title: formData.subjectNames[0] || "",
                        duration: formData.lessonDuration,
                        type: "both",
                        onlinePrice: formData.price,
                        inPersonPrice: formData.price,
                      },
                    ],
                  });
                }}
              >
                <Plus size={15} /> Yeni Ders Ücret / Süre Seçeneği Ekle
              </AddRateBtn>
            </div>
          </SectionCard>
        )}

        <StepFooter>
          <BackBtn onClick={() => setStep(1)}>
            <ArrowLeft size={17} /> Geri
          </BackBtn>
          <NextBtn
            disabled={!formData.title || formData.description.length < 20 || !formData.price}
            onClick={() => setStep(3)}
          >
            Devam Et <ArrowRight size={17} />
          </NextBtn>
        </StepFooter>
      </StepBody>
    );
  };

  const renderStep3 = () => {
    return (
      <StepBody>
        <SectionCard>
          <SectionIcon style={{ background: "linear-gradient(135deg, #10b98120, #05966920)" }}>
            <MapPin size={20} color="#10b981" />
          </SectionIcon>
          <SectionTitle>Konum Seçimi</SectionTitle>
          <SectionHint>Yüz yüze ders verebileceğiniz lokasyonları seçin.</SectionHint>

          <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 15 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
              <div>
                <Label>İl</Label>
                <Select id="cityId" value={formData.cityId} onChange={handleInputChange}>
                  <option value="">İl Seçiniz...</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>İlçe</Label>
                <Select
                  id="districtId"
                  value={formData.districtId}
                  onChange={handleInputChange}
                  disabled={!formData.cityId}
                >
                  <option value="">İlçe Seçiniz...</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Mahalle</Label>
              <Select
                id="neighborhoodId"
                value={formData.neighborhoodId}
                onChange={handleInputChange}
                disabled={!formData.districtId}
              >
                <option value="">Mahalle Seçiniz...</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard style={{ marginTop: 20 }}>
          <SectionTitle>Gizlilik & Tercihler</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 15 }}>
            <CheckboxLabel>
              <input
                type="checkbox"
                id="showPhoneNumber"
                checked={formData.showPhoneNumber}
                onChange={handleInputChange}
              />
              <div>
                <span>Telefon Numaramı Göster</span>
                <p>Öğrenciler ilanda doğrudan telefon numaranızı görebilirler.</p>
              </div>
            </CheckboxLabel>

            <CheckboxLabel>
              <input
                type="checkbox"
                id="showEducation"
                checked={formData.showEducation}
                onChange={handleInputChange}
              />
              <div>
                <span>Eğitim Bilgilerimi Göster</span>
                <p>Profilinizde kayıtlı olan üniversite ve bölüm bilgileri ilanda listelenir.</p>
              </div>
            </CheckboxLabel>
          </div>
        </SectionCard>

        <StepFooter>
          <BackBtn onClick={() => setStep(2)}>
            <ArrowLeft size={17} /> Geri
          </BackBtn>
          <NextBtn onClick={() => setStep(4)}>
            Devam Et <ArrowRight size={17} />
          </NextBtn>
        </StepFooter>
      </StepBody>
    );
  };

  const renderStep4 = () => {
    return (
      <StepBody>
        <SectionCard>
          <SectionIcon style={{ background: "linear-gradient(135deg, #f59e0b20, #fbbf2420)" }}>
            <Camera size={20} color="#f59e0b" />
          </SectionIcon>
          <SectionTitle>
            İlan Fotoğraf Yönetimi <OptionalTag>En fazla 2 adet</OptionalTag>
          </SectionTitle>
          <SectionHint>Tıklayarak ana görsel (kapak) yapabilir veya silebilirsiniz.</SectionHint>

          <PhotoGrid style={{ marginTop: 15 }}>
            {existingPhotos.map((photo) => (
              <PhotoCard key={photo.id} $isMain={photo.isMain}>
                <img src={resolveMediaUrl(photo.photoUrl)} alt="İlan Fotoğrafı" />
                {photo.isMain && (
                  <MainBadge>
                    <Check size={10} /> Kapak Görseli
                  </MainBadge>
                )}
                <div className="action-overlays">
                  {!photo.isMain && (
                    <button
                      type="button"
                      className="main-btn"
                      onClick={() => handleSetMainPhoto(photo.id)}
                    >
                      Kapak Yap
                    </button>
                  )}
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </PhotoCard>
            ))}

            {existingPhotos.length < 2 && (
              <PhotoUploadBtn type="button" onClick={() => photoInputRef.current?.click()}>
                <Camera size={28} />
                <span>Yeni Fotoğraf Ekle</span>
                <small>Max 5MB (JPG, PNG)</small>
              </PhotoUploadBtn>
            )}
          </PhotoGrid>

          <input
            ref={photoInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />
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
                <CheckCircle2 size={18} /> İlanı Güncelle
              </>
            )}
          </SubmitBtn>
        </StepFooter>
      </StepBody>
    );
  };

  if (initialLoading) {
    return (
      <LoadingScreen>
        <Loader2 className="animate-spin" size={40} />
        <p>İlan Bilgileri Yükleniyor...</p>
      </LoadingScreen>
    );
  }

  return (
    <PageWrapper>
      <PageHeader>
        <div className="header-content">
          <div className="header-tag">
            <Sparkles size={14} /> İlanı Düzenle
          </div>
          <h1>İlanı Düzenle</h1>
          <p>İlan detaylarınızı güncel tutarak öğrencilerin size daha rahat ulaşmasını sağlayın.</p>
        </div>
      </PageHeader>

      <PageBody>
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

        <FormCard>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </FormCard>
      </PageBody>
    </PageWrapper>
  );
}

// ── Animations ──────────────────────────────────────────────────
const fadeUp = keyframes`from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); }`;

// ── Styled Components ────────────────────────────────────────────
const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-muted);
  gap: 16px;
  svg {
    color: #16a34a;
  }
`;

const PageWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px 0;
  animation: ${fadeUp} 0.4s ease-out;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 24px;
  padding: 35px 40px;
  color: white;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);

  .header-content {
    position: relative;
    z-index: 2;
  }

  .header-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(22, 163, 74, 0.2);
    border: 1px solid rgba(22, 163, 74, 0.3);
    color: #4ade80;
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 13px;
    opacity: 0.8;
    margin-top: 6px;
    max-width: 480px;
  }
`;

const PageBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 240px 1fr;
    align-items: start;
  }
`;

const StepTracker = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 18px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  overflow-x: auto;
  gap: 15px;

  @media (min-width: 768px) {
    flex-direction: column;
    justify-content: flex-start;
    gap: 24px;
    padding: 24px 20px;
  }
`;

const StepDot = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  .dot-inner {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    background: ${(props) =>
      props.$done
        ? "#16a34a"
        : props.$active
        ? props.$color
        : "var(--card-border)"};
    color: ${(props) => (props.$done || props.$active ? "white" : "var(--text-muted)")};
  }

  .dot-label {
    display: none;
    flex-direction: column;

    @media (min-width: 768px) {
      display: flex;
    }

    .dot-num {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .dot-name {
      font-size: 12px;
      font-weight: 800;
      color: ${(props) => (props.$active ? "var(--text-primary)" : "var(--text-muted)")};
      margin-top: 1px;
    }
  }
`;

const StepLine = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    width: 2px;
    height: 16px;
    background: ${(props) => (props.$done ? "#16a34a" : "var(--card-border)")};
    margin-left: 15px;
  }
`;

const FormCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const StepBody = styled.div`
  animation: ${fadeUp} 0.3s ease-out;
`;

const SectionCard = styled.div`
  padding: 30px;
`;

const SectionIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
`;

const SectionHint = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    .dark & {
      background: #1e293b20;
    }
  }

  input {
    margin-top: 3px;
    accent-color: #16a34a;
  }

  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
  }

  p {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }
`;

const FilterBadge = styled.button`
  type: button;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid ${(props) => (props.$active ? "#16a34a" : "var(--card-border)")};
  background: ${(props) => (props.$active ? "rgba(22, 163, 74, 0.05)" : "var(--card-bg)")};
  color: ${(props) => (props.$active ? "#16a34a" : "var(--text-primary)")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #16a34a;
    color: #16a34a;
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 480px;
`;

const PhotoCard = styled.div`
  aspect-ratio: 4/3;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid ${(props) => (props.$isMain ? "#16a34a" : "var(--card-border)")};
  position: relative;
  background: #f1f5f9;

  .dark & {
    background: #1e293b;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .action-overlays {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    opacity: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.2s;
    backdrop-filter: blur(2px);
  }

  &:hover .action-overlays {
    opacity: 1;
  }

  .main-btn {
    padding: 6px 12px;
    background: #16a34a;
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    &:hover {
      background: #15803d;
    }
  }

  .delete-btn {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #ef4444;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    &:hover {
      background: #dc2626;
    }
  }
`;

const MainBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #16a34a;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
`;

const PhotoUploadBtn = styled.button`
  aspect-ratio: 4/3;
  border-radius: 14px;
  border: 2px dashed var(--card-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;

  &:hover {
    border-color: #16a34a;
    color: #16a34a;
  }

  span {
    font-size: 12px;
    font-weight: 700;
    margin-top: 6px;
  }

  small {
    font-size: 9px;
    margin-top: 2px;
  }
`;

const OptionalTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
`;

const RateConfigCard = styled.div`
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;

  .dark & {
    background: #1e293b20;
  }

  .rate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--card-border);
    padding-bottom: 10px;
    margin-bottom: 12px;

    .rate-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-primary);
    }

    button {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    }
  }

  .rate-body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

const AddRateBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: 2px dashed var(--card-border);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    border-color: #16a34a;
    color: #16a34a;
  }
`;

const RichEditorWrapper = styled.div`
  .ql-container {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    background: var(--card-bg);
    color: var(--text-primary);
    min-height: 180px;
    font-size: 14px;
    border-color: var(--card-border);
  }

  .ql-toolbar {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    background: #f8fafc;
    border-color: var(--card-border);

    .dark & {
      background: #1e293b40;
    }
  }

  .ql-editor {
    min-height: 180px;
  }
`;

const StepFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #f8fafc;
  border-top: 1px solid var(--card-border);

  .dark & {
    background: #0f172a30;
  }
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: white;
  border: 1px solid var(--card-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  .dark & {
    background: #1e293b;
  }

  &:hover {
    background: #f1f5f9;
    .dark & {
      background: #334155;
    }
  }
`;

const NextBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #16a34a;
  border: 1px solid #16a34a;
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #15803d;
    border-color: #15803d;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitBtn = styled(NextBtn)`
  background: linear-gradient(135deg, #16a34a, #22c55e);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
`;
