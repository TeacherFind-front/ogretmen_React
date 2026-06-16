import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Star,
  Heart,
  Calendar,
  Share2,
  X as XIcon,
  MapPin,
  BookOpen,
  Loader2,
  GraduationCap,
  Award,
  ChevronRight,
  CheckCircle2,
  Phone,
  Send,
  Globe,
  Home,
  Monitor,
  MessageSquare,
  Info,
  LayoutGrid,
  ShieldCheck,
  User,
  MoreVertical,
  Check,
  ChevronLeft,
  Link as LinkIcon,
  Video as VideoIcon,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import ShareSocialButtons from "@/components/shared/ShareSocialButtons";
import { getTutorById } from "@/services/tutorService";
import { toggleFavorite } from "@/services/favoriteService";
import { addReview } from "@/services/reviewService";
import { sendMessage } from "@/services/messageService";
import { approveListing, deleteAdminListing } from "@/services/adminService";
import styled, { keyframes, css } from "styled-components";
import toast from "react-hot-toast";
import BASE_URL, { getImageUrl } from "@/services/api";
import { resolveMediaUrl } from "@/utils/helpers";

function TutorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [certLightboxUrl, setCertLightboxUrl] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isAdmin = user && (user.role?.toString() === "3" || user.role?.toString().toLowerCase() === "admin" || user.role?.toString() === "4" || user.role?.toString().toLowerCase() === "superadmin");

  const handleAdminApprove = async (isApproved) => {
    let reason = "Uygun görülmedi.";
    if (!isApproved) {
      const inputReason = window.prompt("Lütfen red sebebini giriniz (Eğitmene iletilecek):");
      if (inputReason === null) return; 
      if (inputReason.trim() !== "") {
        reason = inputReason.trim();
      }
    }
    try {
      await approveListing(tutor.id, isApproved, reason);
      toast.success(isApproved ? "İlan onaylandı." : "İlan reddedildi.");
      const updated = await getTutorById(id);
      setTutor(updated.data || updated);
    } catch (err) {
      toast.error(err.message || "İşlem sırasında bir hata oluştu.");
    }
  };

  const handleAdminDelete = async () => {
    const confirm = window.confirm(`"${tutor.teacherName}" öğretmeninin bu ilanını tamamen silmek istediğinize emin misiniz?\nBu işlem geri alınamaz!`);
    if (!confirm) return;

    try {
      await deleteAdminListing(tutor.id);
      toast.success("İlan başarıyla silindi.");
      navigate("/admin/tutors");
    } catch (err) {
      toast.error(err.message || "İlan silinirken bir hata oluştu.");
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTutorById(id)
      .then((data) => {
        if (!data) setError("Öğretmen bulunamadı.");
        else {
          const tutorData = data.data || data;
          setTutor(tutorData);
          setIsFavorite(tutorData.isFavorite || false);
          if (tutorData.photos && tutorData.photos.length > 0) {
            const photosList = tutorData.photos.$values || tutorData.photos;
            const mainIdx = photosList.findIndex((p) => p.isMain);
            if (mainIdx !== -1) setActivePhoto(mainIdx);
          }
        }
      })
      .catch((err) => {
        console.error("TutorDetail Load Error:", err);
        setError("Sunucu hatası oluştu.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Favorilere eklemek için giriş yapmalısınız.");
      return;
    }
    setFavoriteLoading(true);
    try {
      const result = await toggleFavorite(tutor.id);
      setIsFavorite(result.isFavorite);
      toast.success(
        result.isFavorite ? "Favorilere eklendi" : "Favorilerden çıkarıldı",
      );
    } catch (err) {
      toast.error("İşlem başarısız.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const targetId = tutor?.teacherUserId || tutor?.tutorUserId;
    const tutorName = encodeURIComponent(tutor?.teacherName || "Öğretmen");

    if (!targetId) {
      toast.error(
        "Öğretmen kullanıcı bilgisi bulunamadı. Lütfen daha sonra tekrar deneyin.",
      );
      return;
    }

    // Giriş yapılmamışsa → login'e yönlendir, geri dönüş student/messages olsun
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: { pathname: `/student/messages?tutorId=${targetId}&tutorName=${tutorName}` },
        },
      });
      return;
    }

    if (isAdmin) {
      navigate(`/admin/messages?tutorId=${targetId}&tutorName=${tutorName}`);
    } else {
      navigate(`/student/messages?tutorId=${targetId}&tutorName=${tutorName}`);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewData.comment.length < 10)
      return toast.error("Yorum en az 10 karakter olmalıdır.");
    setReviewLoading(true);
    try {
      await addReview(tutor.id, reviewData);
      toast.success("Değerlendirmeniz başarıyla eklendi!");
      setReviewData({ rating: 5, comment: "" });
      const updated = await getTutorById(id);
      setTutor(updated.data || updated);
    } catch (err) {
      toast.error("Yorum eklenirken bir hata oluştu.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading)
    return (
      <LoadingWrapper>
        <Loader2 className="w-12 h-12 animate-spin text-[#2d79f3]" />
        <p>Öğretmen Profili Yükleniyor...</p>
      </LoadingWrapper>
    );

  if (error || !tutor) {
    const isNotFound = error === "Öğretmen bulunamadı." || !tutor;
    return (
      <ErrorWrapper>
        <div className="error-card animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
             <AlertCircle className={`h-10 w-10 ${isNotFound ? 'text-amber-500' : 'text-red-500'}`} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
            {isNotFound ? "İlan Bulunamadı" : "Hata Oluştu"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-8 leading-relaxed">
            {isNotFound 
              ? "Aradığınız ilan yayından kaldırılmış, pasife alınmış veya henüz yönetici onayından geçmemiş olabilir." 
              : (error || "Öğretmen profili yüklenemedi.")}
          </p>
          <Link to="/tutors" className="block w-full">
            <Button className="w-full h-12 rounded-xl bg-[#2d79f3] hover:bg-blue-600 text-white font-black shadow-lg shadow-blue-200 dark:shadow-none transition-all">
              Öğretmen Keşfet
            </Button>
          </Link>
        </div>
      </ErrorWrapper>
    );
  }

  const reviews = tutor.reviews?.$values || tutor.reviews || [];
  const photos = tutor.photos?.$values || tutor.photos || [];
  const documents = tutor.documents?.$values || tutor.documents || [];

  let parsedLessonRates = [];
  let displayDescription = tutor.bio || "";
  let youtubeVideoUrl = tutor.youtubeVideoUrl || null;

  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match && match[1]
      ? `https://www.youtube.com/embed/${match[1]}`
      : url;
  };

  if (tutor.bio) {
    const match = displayDescription.match(
      /---LESSON_RATES_JSON---([\s\S]*?)---END_LESSON_RATES_JSON---/,
    );
    if (match && match[1]) {
      try {
        parsedLessonRates = JSON.parse(match[1].trim());
        displayDescription = displayDescription
          .replace(
            /---LESSON_RATES_JSON---[\s\S]*?---END_LESSON_RATES_JSON---/,
            "",
          )
          .trim();
      } catch (e) {
        console.error("Failed to parse lesson rates JSON", e);
      }
    }
  }

  const lessonRates =
    parsedLessonRates.length > 0
      ? parsedLessonRates
      : tutor.lessonRates?.$values || tutor.lessonRates || [];

  const bioLimit = 400;
  const showExpandButton =
    displayDescription && displayDescription.length > bioLimit;

  // Render Availability Badges for Sidebar
  const hasOnline =
    tutor.serviceType === "Online" ||
    tutor.serviceType === "Both" ||
    tutor.serviceType === 1 ||
    tutor.serviceType === 3;
  const hasFaceToFace =
    tutor.serviceType === "FaceToFace" ||
    tutor.serviceType === "Both" ||
    tutor.serviceType === 2 ||
    tutor.serviceType === 3;

  return (
    <PageWrapper>
      {/* Visual background elements */}
      <BgDecoration />

      {/* Admin Action Bar */}
      {isAdmin && tutor && (
        <AdminActionBar>
          <div className="admin-bar-content">
            <div className="admin-info">
              <ShieldCheck className="w-6 h-6 text-blue-500 animate-pulse" />
              <div>
                <h4>Yönetici İşlem Paneli</h4>
                <p>
                  Mevcut İlan Durumu:{" "}
                  <span className={`status-label status-${tutor.status?.toLowerCase()}`}>
                    {tutor.status === "PendingApproval"
                      ? "Onay Bekliyor"
                      : tutor.status === "Active"
                        ? "Yayında (Onaylı)"
                        : tutor.status === "Passive"
                          ? "Pasif"
                          : tutor.status === "Rejected"
                            ? "Reddedildi"
                            : tutor.status}
                  </span>
                </p>
              </div>
            </div>
            <div className="admin-actions">
              {tutor.status === "PendingApproval" && (
                <>
                  <Button
                    onClick={() => handleAdminApprove(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <ThumbsUp size={15} /> Onayla
                  </Button>
                  <Button
                    onClick={() => handleAdminApprove(false)}
                    variant="destructive"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <ThumbsDown size={15} /> Reddet
                  </Button>
                </>
              )}
              <Button
                onClick={handleAdminDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Trash2 size={15} /> İlanı Tamamen Sil
              </Button>
              <Link to="/admin/tutors">
                <Button
                  variant="outline"
                  className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold h-10 px-3 rounded-xl"
                >
                  Listeye Dön
                </Button>
              </Link>
            </div>
          </div>
        </AdminActionBar>
      )}

      <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl relative z-10">
        {/* Modern Top Hero Section */}
        <HeroSection>
          <HeroGrid>
            <div className="profile-image-container">
              <img
                src={
                  tutor.avatarUrl
                    ? resolveMediaUrl(tutor.avatarUrl)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.teacherName)}&background=2d79f3&color=fff&size=200`
                }
                alt={tutor.teacherName}
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.teacherName || "Öğretmen")}&background=2d79f3&color=fff&size=200`;
                }}
              />
              <span className="availability-dot-pulsate" title="Müsait" />
            </div>

            <div className="profile-details">
              <div className="title-row">
                <div>
                  <div className="badge-row">
                    <Badge className="category-badge">
                      {tutor.category || "Eğitim"}
                    </Badge>
                    <Badge className="subject-badge">
                      {tutor.subject || "Genel"}
                    </Badge>
                    <Badge className="verified-badge">
                      <ShieldCheck
                        size={12}
                        className="mr-1 text-emerald-500 fill-emerald-500/10"
                      />{" "}
                      Onaylı Eğitmen
                    </Badge>
                  </div>
                  <h1>{tutor.teacherName}</h1>
                  <p className="headline-text">
                    {tutor.title || "Deneyimli Özel Ders Öğretmeni"}
                  </p>
                </div>

                <div className="price-tag-big">
                  <span className="price-num">₺{tutor.price}</span>
                  <span className="price-unit">/saat</span>
                </div>
              </div>

              <div className="meta-info-grid">
                {tutor.university && (
                  <div className="meta-item">
                    <GraduationCap size={16} />
                    <span>
                      {tutor.university}{" "}
                      {tutor.department && `• ${tutor.department}`}
                    </span>
                  </div>
                )}
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>
                    {tutor.district || "İlçe Belirtilmemiş"},{" "}
                    {tutor.city || "Şehir Belirtilmemiş"}
                  </span>
                </div>
                <div className="meta-item">
                  <div className="stars-wrapper">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        className={
                          s <= Math.round(tutor.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 dark:text-slate-700"
                        }
                      />
                    ))}
                    <span className="rating-text">
                      ({reviews.length} Değerlendirme)
                    </span>
                  </div>
                </div>
              </div>

              <div className="action-buttons-row">
                <ActionButton
                  onClick={handleToggleFavorite}
                  $active={isFavorite}
                  className="fav-btn"
                >
                  <Heart
                    size={16}
                    className={
                      isFavorite ? "fill-[#ef4444] text-[#ef4444]" : ""
                    }
                  />
                  {isFavorite ? "Favorilerimde" : "Favorilere Ekle"}
                </ActionButton>
                <ActionButton
                  onClick={() => setIsShareModalOpen(true)}
                  className="share-btn"
                >
                  <Share2 size={16} />
                  Paylaş
                </ActionButton>
              </div>
            </div>
          </HeroGrid>

          {/* Quick Stats Grid */}
          <StatsBanner>
            <StatItem>
              <div className="stat-icon-wrap icon-blue">
                <Star size={18} className="fill-blue-500" />
              </div>
              <div className="stat-content">
                <span className="stat-val">
                  {tutor.rating?.toFixed(1) || "5.0"} / 5.0
                </span>
                <span className="stat-lbl">Ortalama Puan</span>
              </div>
            </StatItem>
            <StatItem>
              <div className="stat-icon-wrap icon-emerald">
                <Monitor size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-val">
                  {hasOnline && hasFaceToFace
                    ? "Online & Yüz Yüze"
                    : hasOnline
                      ? "Sadece Online"
                      : "Sadece Yüz Yüze"}
                </span>
                <span className="stat-lbl">Ders Metodu</span>
              </div>
            </StatItem>
            <StatItem>
              <div className="stat-icon-wrap icon-amber">
                <MessageSquare size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-val">Hızlı Yanıt</span>
                <span className="stat-lbl">24 saat içinde</span>
              </div>
            </StatItem>
          </StatsBanner>
        </HeroSection>

        {/* Main Content Layout */}
        <GridContainer>
          {/* Left Side Content */}
          <MainContentCol>
            {/* Hakkımda Section */}
            <ContentCard>
              <CardTitleAccent>
                <span className="title-decor" />
                Hakkımda
              </CardTitleAccent>
              <BioTextWrapper
                className={`prose dark:prose-invert max-w-none ${!isExpanded && showExpandButton ? "collapsed" : ""}`}
                dangerouslySetInnerHTML={{
                  __html: displayDescription || "Biyografi henüz eklenmemiş.",
                }}
              />
              {showExpandButton && (
                <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? "Daha az göster" : "Daha fazlasını göster"}
                  <ChevronRight
                    size={16}
                    className={`arrow ${isExpanded ? "rotated" : ""}`}
                  />
                </ExpandButton>
              )}
            </ContentCard>

            {/* Verdiği Dersler ve Fiyatlar */}
            <ContentCard>
              <CardTitleAccent>
                <span className="title-decor decor-emerald" />
                Verdiği Dersler & Ücretlendirme
              </CardTitleAccent>
              <RatesList>
                {lessonRates.length > 0 ? (
                  lessonRates.map((lr, idx) => (
                    <RateRow key={idx}>
                      <div className="rate-info">
                        <div className="rate-icon">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <h4>{lr.title || tutor.subject || "Özel Ders"}</h4>
                          <div className="rate-meta">
                            <span>{tutor.category}</span>
                            <span className="divider">•</span>
                            <span>{lr.duration} dakika ders</span>
                          </div>
                        </div>
                      </div>
                      <div className="rate-price-block">
                        {lr.type === "online" ? (
                          <PriceBadge $type="online">
                            <Monitor size={12} /> Online: ₺
                            {parseFloat(lr.onlinePrice || 0).toLocaleString(
                              "tr-TR",
                              { minimumFractionDigits: 0 },
                            )}
                          </PriceBadge>
                        ) : lr.type === "inperson" ? (
                          <PriceBadge $type="inperson">
                            <Home size={12} /> Yüz Yüze: ₺
                            {parseFloat(lr.inPersonPrice || 0).toLocaleString(
                              "tr-TR",
                              { minimumFractionDigits: 0 },
                            )}
                          </PriceBadge>
                        ) : (
                          <div className="price-split">
                            {lr.onlinePrice && (
                              <PriceBadge $type="online">
                                <Monitor size={12} /> Online: ₺
                                {parseFloat(lr.onlinePrice || 0).toLocaleString(
                                  "tr-TR",
                                  { minimumFractionDigits: 0 },
                                )}
                              </PriceBadge>
                            )}
                            {lr.inPersonPrice && (
                              <PriceBadge $type="inperson">
                                <Home size={12} /> Yüz Yüze: ₺
                                {parseFloat(
                                  lr.inPersonPrice || 0,
                                ).toLocaleString("tr-TR", {
                                  minimumFractionDigits: 0,
                                })}
                              </PriceBadge>
                            )}
                          </div>
                        )}
                      </div>
                    </RateRow>
                  ))
                ) : (
                  <RateRow>
                    <div className="rate-info">
                      <div className="rate-icon">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h4>{tutor.subject || "Özel Ders"}</h4>
                        <div className="rate-meta">
                          <span>{tutor.category}</span>
                          <span className="divider">•</span>
                          <span>{tutor.lessonDuration || 60} dakika ders</span>
                        </div>
                      </div>
                    </div>
                    <div className="rate-price-block">
                      <PriceBadge $type="both">
                        <Globe size={12} /> ₺
                        {tutor.price.toLocaleString("tr-TR", {
                          minimumFractionDigits: 0,
                        })}
                      </PriceBadge>
                    </div>
                  </RateRow>
                )}
              </RatesList>
            </ContentCard>

            {/* Tanıtım Videosu Section */}
            {youtubeVideoUrl && (
              <ContentCard>
                <CardTitleAccent>
                  <span className="title-decor decor-red" />
                  Tanıtım Videosu
                </CardTitleAccent>
                <VideoPlayerWrapper>
                  <iframe
                    src={convertToEmbedUrl(youtubeVideoUrl)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </VideoPlayerWrapper>
              </ContentCard>
            )}

            {/* Müsaitlik Takvimi */}
            <ContentCard>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <CardTitleAccent style={{ marginBottom: 0 }}>
                  <span className="title-decor decor-purple" />
                  Haftalık Ders Takvimi
                </CardTitleAccent>
                <CalendarLegends>
                  <div className="legend">
                    <div className="legend-box legend-online">
                      <Monitor size={10} />
                    </div>
                    <span>ONLINE</span>
                  </div>
                  <div className="legend">
                    <div className="legend-box legend-inperson">
                      <Home size={10} />
                    </div>
                    <span>YÜZ YÜZE</span>
                  </div>
                  <div className="legend">
                    <div className="legend-box legend-both">
                      <Globe size={10} />
                    </div>
                    <span>HER İKİSİ</span>
                  </div>
                  <div className="legend">
                    <div className="legend-box legend-empty"></div>
                    <span>MÜSAİT DEĞİL</span>
                  </div>
                </CalendarLegends>
              </div>

              <SchedulerContainer>
                <div className="scheduler-scrollable">
                  <table className="scheduler-table">
                    <thead>
                      <tr>
                        <th className="corner-col">Saatler</th>
                        {[
                          "Pazartesi",
                          "Salı",
                          "Çarşamba",
                          "Perşembe",
                          "Cuma",
                          "Cumartesi",
                          "Pazar",
                        ].map((d) => (
                          <th key={d} className="day-header">
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {["Sabah", "Öğle", "Öğleden Sonra", "Akşam"].map(
                        (slot) => {
                          return (
                            <tr key={slot}>
                              <td className="slot-label">{slot}</td>
                              {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                                const slotAvailability =
                                  tutor.availability?.find((a) => {
                                    const aDay = a.day.trim().toLowerCase();
                                    const targetDays = [
                                      "monday",
                                      "tuesday",
                                      "wednesday",
                                      "thursday",
                                      "friday",
                                      "saturday",
                                      "sunday",
                                    ];
                                    const targetDaysTr = [
                                      "pazartesi",
                                      "salı",
                                      "çarşamba",
                                      "perşembe",
                                      "cuma",
                                      "cumartesi",
                                      "pazar",
                                    ];
                                    if (
                                      aDay !== targetDays[dayIdx] &&
                                      aDay !== targetDaysTr[dayIdx]
                                    )
                                      return false;
                                    const h = parseInt(a.start.split(":")[0]);
                                    if (slot === "Sabah" && h >= 6 && h < 12)
                                      return true;
                                    if (slot === "Öğle" && h >= 12 && h < 15)
                                      return true;
                                    if (slot === "Öğleden Sonra" && h >= 15 && h < 18)
                                      return true;
                                    if (slot === "Akşam" && h >= 18 && h <= 23)
                                      return true;
                                    return false;
                                  });

                                let availabilityClass = "empty-slot";
                                let CellIcon = null;

                                if (slotAvailability) {
                                  const type =
                                    slotAvailability.type || tutor.serviceType;
                                  if (
                                    type === "both" ||
                                    type === "Both" ||
                                    type === 3
                                  ) {
                                    availabilityClass = "slot-both";
                                    CellIcon = Globe;
                                  } else if (
                                    type === "online" ||
                                    type === "Online" ||
                                    type === 1
                                  ) {
                                    availabilityClass = "slot-online";
                                    CellIcon = Monitor;
                                  } else {
                                    availabilityClass = "slot-inperson";
                                    CellIcon = Home;
                                  }
                                }

                                return (
                                  <td key={dayIdx}>
                                    <div
                                      className={`time-slot-cell ${availabilityClass}`}
                                    >
                                      {CellIcon && <CellIcon size={12} />}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </SchedulerContainer>
            </ContentCard>

            {/* Fotoğraflar Section */}
            {photos.length > 0 && (
              <ContentCard>
                <CardTitleAccent>
                  <span className="title-decor decor-amber" />
                  Eğitmen Fotoğrafları
                </CardTitleAccent>
                <PhotoGalleryGrid>
                  {photos.map((p, i) => (
                    <div
                      key={i}
                      className={`photo-card-item ${activePhoto === i ? "active" : ""}`}
                      onClick={() => {
                        setActivePhoto(i);
                        setLightboxIndex(i);
                      }}
                    >
                      <img
                        src={p.photoUrl ? resolveMediaUrl(p.photoUrl) : ""}
                        alt="Eğitmen Fotoğrafı"
                      />
                      <div className="card-hover-overlay">
                        <LayoutGrid size={20} />
                      </div>
                    </div>
                  ))}
                </PhotoGalleryGrid>
              </ContentCard>
            )}

            {/* Sertifikalar Section */}
            {documents.length > 0 && (
              <ContentCard>
                <CardTitleAccent>
                  <span className="title-decor decor-purple" />
                  Sertifikalar & Belgeler
                </CardTitleAccent>
                <CertificatesGrid>
                  {documents.map((doc, idx) => (
                    <CertificateCard key={idx}>
                      <div className="cert-badge-icon">
                        <Award size={26} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="cert-info">
                        <h4 className="cert-title" title={doc.name}>{doc.name}</h4>
                        <p className="cert-org" title={doc.organization}>{doc.organization}</p>
                        <span className="cert-year">{doc.year}</span>
                      </div>
                      {doc.fileUrl && (
                        <div
                          className="cert-preview"
                          onClick={() => {
                            setCertLightboxUrl(resolveMediaUrl(doc.fileUrl));
                          }}
                        >
                          <img
                            src={resolveMediaUrl(doc.fileUrl)}
                            alt={doc.name}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="preview-overlay">
                            <span>Önizle</span>
                          </div>
                        </div>
                      )}
                    </CertificateCard>
                  ))}
                </CertificatesGrid>
              </ContentCard>
            )}

            {/* Hizmet Alanı & Harita */}
            <ContentCard>
              <div className="flex items-center justify-between mb-4">
                <CardTitleAccent style={{ marginBottom: 0 }}>
                  <span className="title-decor decor-emerald" />
                  Hizmet Bölgesi
                </CardTitleAccent>
                <MapBadge>
                  <MapPin size={12} />
                  <span>
                    {tutor.neighborhood || tutor.district}, {tutor.city}
                  </span>
                </MapBadge>
              </div>
              <MapOuterWrapper>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${tutor.neighborhood || ""} ${tutor.district || ""} ${tutor.city}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </MapOuterWrapper>
            </ContentCard>

            {/* Değerlendirmeler ve Yorumlar */}
            <ContentCard>
              <CardTitleAccent>
                <span className="title-decor" />
                Değerlendirmeler
              </CardTitleAccent>

              <ReviewDashboard>
                <div className="big-rating-card">
                  <div className="rating-val">
                    {tutor.rating?.toFixed(1) || "5.0"}
                  </div>
                  <div className="stars-row">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        className={
                          s <= Math.round(tutor.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 dark:text-slate-700"
                        }
                      />
                    ))}
                  </div>
                  <div className="total-revs">{reviews.length} Yorum</div>
                </div>

                <div className="bars-col">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(
                      (r) => r.rating === star,
                    ).length;
                    const percentage =
                      reviews.length > 0
                        ? (count / reviews.length) * 100
                        : star === 5
                          ? 100
                          : 0;
                    return (
                      <div key={star} className="bar-row">
                        <span className="star-lbl">{star} ★</span>
                        <div className="bar-bg">
                          <div
                            className="bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </ReviewDashboard>

              {/* Comments Feed */}
              <CommentsFeed>
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <CommentBubble key={i}>
                      <div className="reviewer-avatar">
                        {r.reviewerName?.charAt(0) || "Ö"}
                      </div>
                      <div className="bubble-content">
                        <div className="bubble-header">
                          <span className="reviewer-name">
                            {r.reviewerName || "Öğrenci"}
                          </span>
                          <div className="bubble-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={
                                  s <= r.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200 dark:text-slate-700"
                                }
                              />
                            ))}
                          </div>
                          <span className="review-date">
                            {r.location ? `${r.location} • ` : ""}1 ay önce
                          </span>
                        </div>
                        <p className="review-text">"{r.comment}"</p>
                      </div>
                    </CommentBubble>
                  ))
                ) : (
                  <EmptyReviewsState>
                    <Star
                      size={32}
                      className="text-slate-300 dark:text-slate-600 mb-2"
                    />
                    <p>Henüz değerlendirme yapılmamış.</p>
                  </EmptyReviewsState>
                )}
              </CommentsFeed>

              {/* Add Review Form */}
              <AddReviewWrapper>
                <h4>Değerlendirme Yazın</h4>
                <div className="rating-select-row">
                  <span className="select-lbl">Eğitmene Puanınız:</span>
                  <StyledRadio>
                    <div className="radio">
                      {[5, 4, 3, 2, 1].map((s) => (
                        <React.Fragment key={s}>
                          <input
                            value={s}
                            name="rating"
                            type="radio"
                            id={`rating-${s}`}
                            checked={reviewData.rating === s}
                            onChange={() =>
                              setReviewData({ ...reviewData, rating: s })
                            }
                          />
                          <label title={`${s} Yıldız`} htmlFor={`rating-${s}`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="0.8em"
                              viewBox="0 0 576 512"
                            >
                              <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                            </svg>
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                  </StyledRadio>
                </div>
                <textarea
                  className="review-textarea"
                  placeholder="Eğitmen hakkında görüşlerinizi diğer öğrencilerle paylaşın..."
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                />
                <Button
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Yorumu Yayınla"
                  )}
                </Button>
              </AddReviewWrapper>
            </ContentCard>
          </MainContentCol>

          {/* Right Side Sticky Sidebar Column */}
          <SidebarCol>
            <StickySidebarCard>
              <div className="card-header-gradient">
                <h3>{tutor.teacherName?.split(" ")[0]} ile İletişime Geç</h3>
                <p>Güvenli ders talebi ve hızlı mesajlaşma paneli</p>
              </div>

              <div className="card-body">
                <div className="price-display">
                  <span className="price-big">₺{tutor.price}</span>
                  <span className="price-lbl"> / saatlik ders ücreti</span>
                </div>

                <div className="quick-info-box">
                  <div className="info-row">
                    <Monitor size={14} className="text-blue-500" />
                    <span>
                      Online Dersler:{" "}
                      <strong>
                        {hasOnline ? "Destekleniyor" : "Desteklenmiyor"}
                      </strong>
                    </span>
                  </div>
                  <div className="info-row">
                    <Home size={14} className="text-emerald-500" />
                    <span>
                      Yüz Yüze Dersler:{" "}
                      <strong>
                        {hasFaceToFace ? "Destekleniyor" : "Desteklenmiyor"}
                      </strong>
                    </span>
                  </div>
                  <div className="info-row">
                    <MapPin size={14} className="text-indigo-500" />
                    <span>
                      Hizmet Yeri:{" "}
                      <strong>
                        {tutor.district || "İlçe"}, {tutor.city}
                      </strong>
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-md shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    <MessageSquare size={18} className="mr-2" />
                    Mesaj Gönder
                  </Button>

                  <p className="response-time-hint">
                    Beklenen yanıt süresi: <strong>24 saat</strong>
                  </p>
                </form>

                {/* Social media connections styled into sidebar */}
                {tutor.socialLinks &&
                  (tutor.socialLinks.whatsApp ||
                    tutor.socialLinks.instagram ||
                    tutor.socialLinks.linkedIn ||
                    tutor.socialLinks.facebook) && (
                    <div className="social-section pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h5 className="social-header-title">
                        Diğer İletişim Kanalları
                      </h5>
                      <div className="social-btn-row">
                        {tutor.socialLinks.whatsApp && (
                          <a
                            href={`https://wa.me/${tutor.socialLinks.whatsApp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="social-icon-btn whatsapp-color"
                            title="WhatsApp"
                          >
                            <FaWhatsapp size={18} />
                          </a>
                        )}
                        {tutor.socialLinks.instagram && (
                          <a
                            href={
                              tutor.socialLinks.instagram.startsWith("http")
                                ? tutor.socialLinks.instagram
                                : `https://${tutor.socialLinks.instagram}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="social-icon-btn instagram-color"
                            title="Instagram"
                          >
                            <FaInstagram size={18} />
                          </a>
                        )}
                        {tutor.socialLinks.linkedIn && (
                          <a
                            href={
                              tutor.socialLinks.linkedIn.startsWith("http")
                                ? tutor.socialLinks.linkedIn
                                : `https://${tutor.socialLinks.linkedIn}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="social-icon-btn linkedin-color"
                            title="LinkedIn"
                          >
                            <FaLinkedin size={18} />
                          </a>
                        )}
                        {tutor.socialLinks.facebook && (
                          <a
                            href={
                              tutor.socialLinks.facebook.startsWith("http")
                                ? tutor.socialLinks.facebook
                                : `https://${tutor.socialLinks.facebook}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="social-icon-btn facebook-color"
                            title="Facebook"
                          >
                            <FaFacebook size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </StickySidebarCard>
          </SidebarCol>
        </GridContainer>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsShareModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl border dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <button
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
              onClick={() => setIsShareModalOpen(false)}
            >
              <XIcon size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Profili Paylaş
            </h2>
            <ShareSocialButtons
              url={window.location.href}
              title={`${tutor.teacherName} - ${tutor.title}`}
            />
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors z-[1200]"
            onClick={() => setLightboxIndex(null)}
          >
            <XIcon size={24} />
          </button>

          {photos.length > 1 && (
            <button
              className="absolute left-6 text-white/80 hover:text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors z-[1200]"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev === 0 ? photos.length - 1 : prev - 1,
                );
              }}
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <div
            className="max-w-[85vw] max-h-[85vh] select-none z-[1150]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                photos[lightboxIndex]?.photoUrl
                  ? resolveMediaUrl(photos[lightboxIndex].photoUrl)
                  : ""
              }
              alt="Lightbox"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in duration-200"
            />
          </div>

          {photos.length > 1 && (
            <button
              className="absolute right-6 text-white/80 hover:text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors z-[1200]"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev === photos.length - 1 ? 0 : prev + 1,
                );
              }}
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div className="absolute bottom-6 bg-white/10 px-4 py-1.5 rounded-full text-white/95 text-xs font-bold z-[1200]">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}

      {/* Certificate Lightbox Modal */}
      {certLightboxUrl && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300"
          onClick={() => setCertLightboxUrl(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors z-[1200]"
            onClick={() => setCertLightboxUrl(null)}
          >
            <XIcon size={24} />
          </button>
          <div
            className="max-w-[85vw] max-h-[85vh] select-none z-[1150]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={certLightboxUrl}
              alt="Sertifika Belgesi"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in duration-200"
            />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

// ── Animations ──────────────────────────────────────────────────
const fadeUp = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const pulseGlow = keyframes`0% { box-shadow: 0 0 0 0 rgba(45, 121, 243, 0.4); } 100% { box-shadow: 0 0 0 8px rgba(45, 121, 243, 0); }`;

// ── Styled Components ────────────────────────────────────────────
const LoadingWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #fcfdfe;
  .dark & {
    background: #0f172a;
  }
  p {
    font-size: 15px;
    font-weight: 700;
    color: #64748b;
  }
`;

const ErrorWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #fcfdfe;
  .dark & {
    background: #0f172a;
  }
  .error-card {
    background: white;
    border-radius: 24px;
    padding: 40px;
    width: 100%;
    max-width: 440px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    .dark & {
      background: #1e293b;
      box-shadow: none;
      border: 1px solid #334155;
    }
    h2 {
      font-size: 20px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 8px;
      .dark & {
        color: white;
      }
    }
    p {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
    }
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  .dark & {
    background: #0f172a;
  }
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
`;

const BgDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 380px;
  background: linear-gradient(180deg, #e0ebff 0%, rgba(248, 250, 252, 0) 100%);
  .dark & {
    background: linear-gradient(
      180deg,
      rgba(30, 58, 138, 0.25) 0%,
      rgba(15, 23, 42, 0) 100%
    );
  }
  z-index: 1;
`;

const HeroSection = styled.div`
  background: white;
  border-radius: 32px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  padding: 32px;
  margin-bottom: 28px;
  animation: ${fadeUp} 0.4s ease;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 32px;
  align-items: flex-start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 20px;
  }

  .profile-image-container {
    position: relative;
    width: 136px;
    height: 136px;
    margin: 0 auto;

    .profile-avatar {
      width: 100%;
      height: 100%;
      border-radius: 24px;
      object-fit: cover;
      border: 4px solid white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      .dark & {
        border-color: #334155;
      }
    }

    .availability-dot-pulsate {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      animation: ${pulseGlow} 1.6s infinite;
      .dark & {
        border-color: #1e293b;
      }
    }
  }

  .profile-details {
    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      @media (max-width: 768px) {
        justify-content: center;
      }

      .category-badge {
        background: #eff6ff;
        color: #2563eb;
        font-weight: 800;
        border-radius: 20px;
        font-size: 11px;
        padding: 4px 10px;
        .dark & {
          background: #1e3a8a30;
          color: #60a5fa;
        }
      }
      .subject-badge {
        background: #f0fdf4;
        color: #16a34a;
        font-weight: 800;
        border-radius: 20px;
        font-size: 11px;
        padding: 4px 10px;
        .dark & {
          background: #064e3b30;
          color: #34d399;
        }
      }
      .verified-badge {
        background: #f8fafc;
        color: #475569;
        font-weight: 800;
        border-radius: 20px;
        font-size: 11px;
        padding: 4px 10px;
        border: 1px solid #e2e8f0;
        .dark & {
          background: #0f172a;
          color: #cbd5e1;
          border-color: #334155;
        }
      }
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 8px;
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
      }

      h1 {
        font-size: 28px;
        font-weight: 900;
        color: #1e293b;
        letter-spacing: -0.02em;
        .dark & {
          color: white;
        }
      }
    }

    .headline-text {
      font-size: 15px;
      font-weight: 600;
      color: #64748b;
      margin-top: 4px;
      .dark & {
        color: #cbd5e1;
      }
    }

    .price-tag-big {
      display: flex;
      align-items: baseline;
      background: linear-gradient(135deg, #2d79f3 0%, #4f46e5 100%);
      color: white;
      padding: 10px 18px;
      border-radius: 18px;
      box-shadow: 0 4px 14px rgba(45, 121, 243, 0.3);

      .price-num {
        font-size: 22px;
        font-weight: 900;
      }
      .price-unit {
        font-size: 12px;
        font-weight: 700;
        opacity: 0.85;
        margin-left: 2px;
      }

      .dark & {
        box-shadow: none;
      }
    }

    .meta-info-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 24px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px dashed #e2e8f0;
      .dark & {
        border-color: #334155;
      }
      @media (max-width: 768px) {
        justify-content: center;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
        .dark & {
          color: #94a3b8;
        }

        svg {
          color: #2d79f3;
          .dark & {
            color: #60a5fa;
          }
        }
      }

      .stars-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;

        .rating-text {
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          margin-left: 4px;
          .dark & {
            color: #cbd5e1;
          }
        }
      }
    }

    .action-buttons-row {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      @media (max-width: 768px) {
        justify-content: center;
      }
    }
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  cursor: pointer;

  &.fav-btn {
    background: ${(props) => (props.$active ? "#fef2f2" : "#fff")};
    border-color: ${(props) => (props.$active ? "#fca5a5" : "#e2e8f0")};
    color: ${(props) => (props.$active ? "#ef4444" : "#475569")};

    .dark & {
      background: ${(props) => (props.$active ? "#991b1b20" : "#1e293b")};
      border-color: ${(props) => (props.$active ? "#991b1b50" : "#334155")};
      color: ${(props) => (props.$active ? "#f87171" : "#cbd5e1")};
    }

    &:hover {
      background: ${(props) => (props.$active ? "#fee2e2" : "#f8fafc")};
      .dark & {
        background: ${(props) => (props.$active ? "#991b1b30" : "#334155")};
      }
    }
  }

  &.share-btn {
    background: white;
    color: #475569;
    .dark & {
      background: #1e293b;
      color: #cbd5e1;
      border-color: #334155;
    }
    &:hover {
      background: #f8fafc;
      .dark & {
        background: #334155;
      }
    }
  }
`;

const StatsBanner = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  background: #f8fafc;
  border-radius: 20px;
  padding: 20px;
  margin-top: 24px;
  border: 1px solid #f1f5f9;

  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  .stat-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.icon-blue {
      background: #eff6ff;
      color: #2563eb;
      .dark & {
        background: #1e3a8a30;
        color: #60a5fa;
      }
    }
    &.icon-emerald {
      background: #f0fdf4;
      color: #16a34a;
      .dark & {
        background: #064e3b30;
        color: #34d399;
      }
    }
    &.icon-amber {
      background: #fffbeb;
      color: #d97706;
      .dark & {
        background: #451a0330;
        color: #fbbf24;
      }
    }
  }

  .stat-content {
    display: flex;
    flex-direction: column;

    .stat-val {
      font-size: 14px;
      font-weight: 900;
      color: #1e293b;
      .dark & {
        color: white;
      }
    }
    .stat-lbl {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const MainContentCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SidebarCol = styled.div`
  @media (min-width: 961px) {
    position: relative;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  animation: ${fadeUp} 0.4s ease;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: none;
  }

  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const CardTitleAccent = styled.h3`
  font-size: 17px;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.01em;
  .dark & {
    color: white;
  }

  .title-decor {
    width: 6px;
    height: 18px;
    border-radius: 4px;
    background: #2d79f3;
    display: inline-block;

    &.decor-emerald {
      background: #10b981;
    }
    &.decor-red {
      background: #ef4444;
    }
    &.decor-purple {
      background: #8b5cf6;
    }
    &.decor-amber {
      background: #f59e0b;
    }
  }
`;

const BioTextWrapper = styled.div`
  font-size: 14.5px;
  line-height: 1.7;
  color: #475569;
  .dark & {
    color: #cbd5e1;
  }

  &.collapsed {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p {
    margin-bottom: 12px;
  }
  p:last-child {
    margin-bottom: 0;
  }
`;

const ExpandButton = styled.button`
  background: transparent;
  border: none;
  color: #2d79f3;
  font-weight: 800;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 2px 0;

  &:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  .arrow {
    transition: transform 0.3s;
    &.rotated {
      transform: rotate(90deg);
    }
  }
`;

const RatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RateRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 18px;
  border: 1px solid #f1f5f9;
  gap: 16px;

  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .rate-info {
    display: flex;
    align-items: center;
    gap: 14px;

    .rate-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .dark & {
        background: #1e3a8a30;
        color: #60a5fa;
      }
    }

    h4 {
      font-size: 14.5px;
      font-weight: 900;
      color: #1e293b;
      .dark & {
        color: white;
      }
    }

    .rate-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;

      span {
        font-size: 11.5px;
        font-weight: 600;
        color: #94a3b8;
      }
      .divider {
        font-size: 10px;
      }
    }
  }

  .rate-price-block {
    display: flex;
    align-items: center;
    gap: 8px;

    .price-split {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
      @media (max-width: 640px) {
        align-items: flex-start;
      }
    }
  }
`;

const PriceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 900;

  ${(props) =>
    props.$type === "online"
      ? css`
          background: #eff6ff;
          color: #2563eb;
          .dark & {
            background: #1e3a8a40;
            color: #60a5fa;
          }
        `
      : props.$type === "inperson"
        ? css`
            background: #f0fdf4;
            color: #16a34a;
            .dark & {
              background: #064e3b40;
              color: #34d399;
            }
          `
        : css`
            background: #f3e8ff;
            color: #9333ea;
            .dark & {
              background: #581c8740;
              color: #c084fc;
            }
          `}
`;

const VideoPlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  .dark & {
    border-color: #334155;
  }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const CalendarLegends = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .legend {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 850;
    color: #475569;
    .dark & {
      color: #cbd5e1;
    }

    .legend-box {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 9px;
      border: 1.5px solid transparent;

      &.legend-online {
        background: #3b82f6;
      }
      &.legend-inperson {
        background: #10b981;
      }
      &.legend-both {
        background: #8b5cf6;
      }
      &.legend-empty {
        background: transparent;
        border-color: #cbd5e1;
        .dark & {
          border-color: #334155;
        }
      }
    }

    span {
      letter-spacing: 0.05em;
    }
  }
`;

const SchedulerContainer = styled.div`
  background: #f8fafc;
  border-radius: 18px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  .scheduler-scrollable {
    overflow-x: auto;
    width: 100%;
    scrollbar-width: thin;
  }

  .scheduler-table {
    width: 100%;
    min-width: 560px;
    border-collapse: separate;
    border-spacing: 4px;
    table-layout: fixed;

    .corner-col {
      width: 90px;
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      text-align: left;
      padding-bottom: 8px;
      padding-left: 6px;
    }

    .day-header {
      width: calc((100% - 90px) / 7);
      font-size: 11px;
      font-weight: 900;
      color: #1e293b;
      .dark & {
        color: #cbd5e1;
      }
      text-transform: capitalize;
      padding-bottom: 8px;
      text-align: center;
    }

    .slot-label {
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      .dark & {
        color: #cbd5e1;
      }
      white-space: nowrap;
      padding: 6px;
    }

    .time-slot-cell {
      height: 32px;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid transparent;

      &.empty-slot {
        background: transparent;
        border-color: #e2e8f0;
        .dark & {
          background: #1e293b;
          border-color: #334155;
        }
      }

      &.slot-online {
        background: #3b82f6;
        color: white;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
      }

      &.slot-inperson {
        background: #10b981;
        color: white;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
      }

      &.slot-both {
        background: #8b5cf6;
        color: white;
        box-shadow: 0 2px 6px rgba(139, 92, 246, 0.2);
      }
    }
  }
`;

const PhotoGalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;

  .photo-card-item {
    position: relative;
    aspect-ratio: 1/1;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.25s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(45, 121, 243, 0.4);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover {
      transform: scale(0.98);
      .card-hover-overlay {
        opacity: 1;
      }
    }

    &.active {
      border-color: #2d79f3;
    }
  }
`;

const MapBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  color: #475569;
  .dark & {
    background: #0f172a;
    border-color: #334155;
    color: #cbd5e1;
  }

  svg {
    color: #2d79f3;
  }
`;

const MapOuterWrapper = styled.div`
  height: 250px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  .dark & {
    border-color: #334155;
  }
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02);

  iframe {
    width: 100%;
    height: 100%;
    transition: filter 0.3s ease;
  }

  .dark & iframe {
    filter: invert(90%) hue-rotate(180deg);
    opacity: 0.85;
  }
`;

const ReviewDashboard = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  margin-bottom: 28px;
  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .big-rating-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;

    .rating-val {
      font-size: 44px;
      font-weight: 900;
      color: #1e293b;
      line-height: 1;
      .dark & {
        color: white;
      }
    }
    .stars-row {
      display: flex;
      gap: 2px;
      margin: 8px 0;
    }
    .total-revs {
      font-size: 12px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
    }
  }

  .bars-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    .bar-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .star-lbl {
        font-size: 11px;
        font-weight: 800;
        color: #64748b;
        width: 30px;
        text-align: right;
        .dark & {
          color: #94a3b8;
        }
      }
      .bar-bg {
        flex: 1;
        height: 6px;
        background: #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
        .dark & {
          background: #1e293b;
        }
      }
      .bar-fill {
        height: 100%;
        background: #fbbf24;
        border-radius: 10px;
      }
      .bar-count {
        font-size: 11px;
        font-weight: 800;
        color: #94a3b8;
        width: 15px;
      }
    }
  }
`;

const CommentsFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CommentBubble = styled.div`
  display: flex;
  gap: 14px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  .dark & {
    border-color: #334155;
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .reviewer-avatar {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #eff6ff;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 14px;
    flex-shrink: 0;
    .dark & {
      background: #1e3a8a30;
      color: #60a5fa;
    }
  }

  .bubble-content {
    flex: 1;

    .bubble-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 6px;

      .reviewer-name {
        font-size: 13.5px;
        font-weight: 850;
        color: #1e293b;
        .dark & {
          color: white;
        }
      }
      .bubble-stars {
        display: flex;
        gap: 1px;
      }
      .review-date {
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        margin-left: auto;
      }
    }

    .review-text {
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
      font-style: italic;
      .dark & {
        color: #cbd5e1;
      }
    }
  }
`;

const EmptyReviewsState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #94a3b8;
  p {
    font-size: 13px;
    font-weight: 700;
  }
`;

const AddReviewWrapper = styled.div`
  background: #f8fafc;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #f1f5f9;
  margin-top: 32px;
  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  h4 {
    font-size: 15px;
    font-weight: 900;
    color: #1e293b;
    margin-bottom: 16px;
    .dark & {
      color: white;
    }
  }

  .rating-select-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .select-lbl {
      font-size: 12px;
      font-weight: 800;
      color: #64748b;
      .dark & {
        color: #94a3b8;
      }
    }
  }

  .review-textarea {
    width: 100%;
    height: 90px;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    padding: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    outline: none;
    transition: all 0.2s;
    resize: none;
    margin-bottom: 16px;

    .dark & {
      background: #1e293b;
      border-color: #334155;
      color: white;
    }
    &:focus {
      border-color: #2d79f3;
    }
  }

  .submit-review-btn {
    background: #1e293b;
    color: white;
    font-weight: 800;
    font-size: 13px;
    padding: 10px 20px;
    border-radius: 10px;
    &:hover {
      background: #0f172a;
    }
    .dark & {
      background: #2d79f3;
      &:hover {
        background: #1d4ed8;
      }
    }
  }
`;

const StickySidebarCard = styled.div`
  position: sticky;
  top: 24px;
  background: white;
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  overflow: hidden;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: none;
  }

  .card-header-gradient {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    padding: 24px;
    text-align: center;
    .dark & {
      background: linear-gradient(135deg, #1e3a8a60 0%, #1e293b 100%);
    }

    h3 {
      font-size: 16px;
      font-weight: 900;
      margin-bottom: 4px;
    }
    p {
      font-size: 11px;
      font-weight: 600;
      opacity: 0.75;
    }
  }

  .card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .price-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
      .dark & {
        border-color: #334155;
      }

      .price-big {
        font-size: 32px;
        font-weight: 950;
        color: #2d79f3;
        .dark & {
          color: #60a5fa;
        }
      }
      .price-lbl {
        font-size: 13px;
        font-weight: 750;
        color: #64748b;
        .dark & {
          color: #cbd5e1;
        }
      }
    }

    .quick-info-box {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .info-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        font-weight: 700;
        color: #475569;
        .dark & {
          color: #cbd5e1;
        }

        svg {
          flex-shrink: 0;
        }
        strong {
          color: #1e293b;
          .dark & {
            color: white;
          }
        }
      }
    }

    .response-time-hint {
      text-align: center;
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .social-section {
      .social-header-title {
        font-size: 11px;
        font-weight: 850;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 10px;
        text-align: center;
      }

      .social-btn-row {
        display: flex;
        justify-content: center;
        gap: 10px;

        .social-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

          &:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
          }

          &.whatsapp-color {
            background: #25d366;
          }
          &.instagram-color {
            background: linear-gradient(45deg, #f09433, #e6683c, #bc1888);
          }
          &.linkedin-color {
            background: #0a66c2;
          }
          &.facebook-color {
            background: #1877f2;
          }
        }
      }
    }
  }
`;

const StyledRadio = styled.div`
  .radio {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    gap: 6px;
  }

  .radio > input {
    position: absolute;
    appearance: none;
  }

  .radio > label {
    cursor: pointer;
    font-size: 22px;
    position: relative;
    display: inline-block;
    transition: transform 0.3s ease;
  }

  .radio > label > svg {
    fill: #e2e8f0;
    transition: fill 0.3s ease;
  }

  .radio > label:hover {
    transform: scale(1.2);
  }

  .radio > label:hover > svg,
  .radio > label:hover ~ label > svg {
    fill: #ff9e0b;
    filter: drop-shadow(0 0 8px rgba(255, 158, 11, 0.6));
  }

  .radio > input:checked + label > svg,
  .radio > input:checked + label ~ label > svg {
    fill: #ff9e0b;
    filter: drop-shadow(0 0 12px rgba(255, 158, 11, 0.8));
    animation: pulse 0.8s infinite alternate;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.05);
    }
  }
`;

const CertificatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 10px;
`;

const CertificateCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  transition: all 0.25s ease;

  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.02);
  }

  .cert-badge-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: #f3e8ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .dark & {
      background: #581c8730;
    }
  }

  .cert-info {
    flex: 1;
    min-width: 0;

    .cert-title {
      font-size: 14px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .dark & {
        color: white;
      }
    }

    .cert-org {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .dark & {
        color: #94a3b8;
      }
    }

    .cert-year {
      font-size: 11px;
      font-weight: 700;
      color: #8b5cf6;
      background: #f3e8ff;
      padding: 2px 8px;
      border-radius: 20px;

      .dark & {
        background: #581c8730;
        color: #c084fc;
      }
    }
  }

  .cert-preview {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;

    .dark & {
      border-color: #334155;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-overlay {
      position: absolute;
      inset: 0;
      background: rgba(139, 92, 246, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;

      span {
        color: white;
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    &:hover .preview-overlay {
      opacity: 1;
    }
  }
`;

const AdminActionBar = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  .dark & {
    background: rgba(30, 41, 59, 0.85);
    border-color: rgba(51, 65, 85, 0.8);
    box-shadow: none;
  }

  .admin-bar-content {
    max-width: 1150px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: 12px;

    h4 {
      font-size: 14px;
      font-weight: 900;
      color: #1e293b;
      .dark & {
        color: white;
      }
    }

    p {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      margin-top: 2px;
      .dark & {
        color: #cbd5e1;
      }
    }

    .status-label {
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 11px;

      &.status-pendingapproval {
        background: #fffbeb;
        color: #d97706;
      }
      &.status-active {
        background: #f0fdf4;
        color: #16a34a;
      }
      &.status-passive {
        background: #f1f5f9;
        color: #475569;
      }
      &.status-rejected {
        background: #fef2f2;
        color: #ef4444;
      }
    }
  }

  .admin-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

export default TutorDetail;
