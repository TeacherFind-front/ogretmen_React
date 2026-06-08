import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Link as LinkIcon
} from "lucide-react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import ShareSocialButtons from "@/components/shared/ShareSocialButtons";
import { getTutorById } from "@/services/tutorService";
import { toggleFavorite } from "@/services/favoriteService";
import { addReview } from "@/services/reviewService";
import { sendMessage } from "@/services/messageService";
import styled from "styled-components";
import toast from "react-hot-toast";
import BASE_URL, { getImageUrl } from "@/services/api";

function TutorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
            const mainIdx = photosList.findIndex(p => p.isMain);
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
    if (!token) { toast.error("Favorilere eklemek için giriş yapmalısınız."); return; }
    setFavoriteLoading(true);
    try {
      const result = await toggleFavorite(tutor.id);
      setIsFavorite(result.isFavorite);
      toast.success(result.isFavorite ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
    } catch (err) {
      toast.error("İşlem başarısız.");
    } finally { setFavoriteLoading(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    setSendingMessage(true);
    try {
      const targetId = tutor.teacherUserId || tutor.teacherProfileId;
      await sendMessage({ receiverId: targetId, content: messageContent });
      toast.success("Mesajınız iletildi!");
      setMessageContent("");
    } catch (err) {
      toast.error("Mesaj gönderilemedi.");
    } finally { setSendingMessage(false); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewData.comment.length < 10) return toast.error("Yorum en az 10 karakter olmalıdır.");
    setReviewLoading(true);
    try {
      await addReview(tutor.id, reviewData);
      toast.success("Değerlendirmeniz başarıyla eklendi!");
      setReviewData({ rating: 5, comment: "" });
      const updated = await getTutorById(id);
      setTutor(updated.data || updated);
    } catch (err) {
      toast.error("Yorum eklenirken bir hata oluştu.");
    } finally { setReviewLoading(false); }
  };

  if (loading) return (
    <div className="bg-[#fdfdfe] dark:bg-[#0f172a] min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#2d79f3]" />
    </div>
  );

  if (error || !tutor) return (
    <div className="container mx-auto py-20 text-center px-6">
      <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl">
        <XIcon className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link to="/"><Button className="w-full bg-[#2d79f3]">Ana Sayfaya Dön</Button></Link>
      </div>
    </div>
  );

  const reviews = tutor.reviews?.$values || tutor.reviews || [];
  const photos = tutor.photos?.$values || tutor.photos || [];

  let parsedLessonRates = [];
  let displayDescription = tutor.bio || "";
  let youtubeVideoUrl = tutor.youtubeVideoUrl || null;

  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  if (tutor.bio) {
    const match = displayDescription.match(/---LESSON_RATES_JSON---([\s\S]*?)---END_LESSON_RATES_JSON---/);
    if (match && match[1]) {
      try {
        parsedLessonRates = JSON.parse(match[1].trim());
        displayDescription = displayDescription.replace(/---LESSON_RATES_JSON---[\s\S]*?---END_LESSON_RATES_JSON---/, "").trim();
      } catch (e) {
        console.error("Failed to parse lesson rates JSON", e);
      }
    }
  }

  const lessonRates = parsedLessonRates.length > 0 
    ? parsedLessonRates 
    : (tutor.lessonRates?.$values || tutor.lessonRates || []);

  const bioLimit = 400;
  // If we are using ReactQuill (HTML), slicing raw HTML string breaks tags.
  // Instead of manual slice, we'll render it inside a line-clamp container.
  const showExpandButton = displayDescription && displayDescription.length > bioLimit;

  return (
    <div className="bg-[#fdfdfe] dark:bg-[#0f172a] min-h-screen pb-16 transition-colors duration-300">
      <div className="container mx-auto py-8 px-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header / Profile Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative shrink-0">
                <img
                  src={tutor.avatarUrl ? getImageUrl(tutor.avatarUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.teacherName)}&background=2d79f3&color=fff&size=200`}
                  alt={tutor.teacherName}
                  className="w-32 h-32 rounded-2xl object-cover border shadow-md dark:border-slate-800"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.teacherName || "Öğretmen")}&background=2d79f3&color=fff&size=200`;
                  }}
                />
              </div>
              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2 sm:gap-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate w-full">{tutor.teacherName}</h1>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg shrink-0">{tutor.price} ₺/saat</div>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {tutor.title} - {tutor.university}
                  </p>
                  <div className="flex gap-2">
                    <ActionButton onClick={() => setIsShareModalOpen(true)} className="w-10 h-10"><Share2 size={16} /></ActionButton>
                    <ActionButton onClick={handleToggleFavorite} $active={isFavorite} className="w-10 h-10">
                      <Heart size={16} className={isFavorite ? "fill-[#ef4444]" : ""} />
                    </ActionButton>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} className={s <= Math.round(tutor.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-amber-600 dark:text-amber-500 font-bold text-xs">{reviews.length} yorum</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hakkımda Section */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hakkımda</h3>
              <div 
                className={`text-slate-700 dark:text-slate-300 leading-relaxed text-sm prose dark:prose-invert max-w-none ${!isExpanded && showExpandButton ? "line-clamp-4" : ""}`}
                dangerouslySetInnerHTML={{ __html: displayDescription || "Biyografi henüz eklenmemiş." }}
              />
              {showExpandButton && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 hover:underline transition-all"
                >
                  {isExpanded ? "Daha az göster" : "Daha fazlasını göster"} 
                  <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? "-rotate-90" : "rotate-90"}`} />
                </button>
              )}
            </section>

            {/* YouTube Video Section */}
            {youtubeVideoUrl && (
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tanıtım Videosu</h3>
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={convertToEmbedUrl(youtubeVideoUrl)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            )}

            {/* Sosyal Medya Section */}
            {tutor.socialLinks && (tutor.socialLinks.whatsApp || tutor.socialLinks.instagram || tutor.socialLinks.linkedIn || tutor.socialLinks.facebook) && (
              <section className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <LinkIcon size={18} className="text-red-400" /> Sosyal Bağlantılarım
                </h3>
                <div className="flex gap-4">
                  {tutor.socialLinks.whatsApp && (
                    <a href={`https://wa.me/${tutor.socialLinks.whatsApp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#25d366] hover:bg-[#1ebd57] text-white rounded-[1.25rem] flex items-center justify-center transition-all shadow-md hover:scale-105 hover:-translate-y-1">
                      <Phone size={22} className="fill-current" />
                    </a>
                  )}
                  {tutor.socialLinks.instagram && (
                    <a href={tutor.socialLinks.instagram.startsWith('http') ? tutor.socialLinks.instagram : `https://${tutor.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white rounded-[1.25rem] flex items-center justify-center transition-all shadow-md hover:scale-105 hover:-translate-y-1">
                      <FaInstagram size={22} />
                    </a>
                  )}
                  {tutor.socialLinks.linkedIn && (
                    <a href={tutor.socialLinks.linkedIn.startsWith('http') ? tutor.socialLinks.linkedIn : `https://${tutor.socialLinks.linkedIn}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#0a66c2] hover:bg-[#08539e] text-white rounded-[1.25rem] flex items-center justify-center transition-all shadow-md hover:scale-105 hover:-translate-y-1">
                      <FaLinkedin size={22} className="fill-current" />
                    </a>
                  )}
                  {tutor.socialLinks.facebook && (
                    <a href={tutor.socialLinks.facebook.startsWith('http') ? tutor.socialLinks.facebook : `https://${tutor.socialLinks.facebook}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-[1.25rem] flex items-center justify-center transition-all shadow-md hover:scale-105 hover:-translate-y-1">
                      <FaFacebook size={22} className="fill-current" />
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Nitelikler Section - Redesigned to Lesson Rates (Balanced Size) */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verdiği Ders ve Saat Ücretleri</h3>
              <div className="p-6 bg-white dark:bg-[#1e293b] rounded-[1.5rem] border dark:border-slate-800 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {lessonRates.length > 0 ? lessonRates.map((lr, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <Info size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-blue-700 dark:text-blue-400 font-bold text-[14px] leading-tight">
                          {lr.title || tutor.subject} - {tutor.category} / <span className="text-gray-900 dark:text-white">{lr.duration} Dk</span>
                        </h4>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                          {lr.type === "online" ? `Online : ${parseFloat(lr.onlinePrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` :
                           lr.type === "inperson" ? `Yüzyüze : ${parseFloat(lr.inPersonPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` :
                           (lr.onlinePrice && lr.inPersonPrice) ? `Online : ${parseFloat(lr.onlinePrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺ | Yüzyüze : ${parseFloat(lr.inPersonPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` :
                           lr.onlinePrice ? `Online : ${parseFloat(lr.onlinePrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` :
                           lr.inPersonPrice ? `Yüzyüze : ${parseFloat(lr.inPersonPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` :
                           `Online : ${parseFloat(lr.onlinePrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺ | Yüzyüze : ${parseFloat(lr.inPersonPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺`}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <Info size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-blue-700 dark:text-blue-400 font-bold text-[14px] leading-tight">
                          {tutor.subject} / <span className="text-gray-900 dark:text-white">{tutor.lessonDuration} Dk</span>
                        </h4>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                          {tutor.serviceType === "Both" ? `Online : ${tutor.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺ | Yüzyüze : ${tutor.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` : 
                           tutor.serviceType === "Online" ? `Online : ${tutor.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` : 
                           `Yüzyüze : ${tutor.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Müsaitlik Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Genel Kullanılabilirlik</h3>
                <div className="flex gap-3 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-700">
                  <div className="flex items-center gap-1.5 px-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Online</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 border-l dark:border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Yüz Yüze</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 border-l dark:border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Her İkisi</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1">
                  <thead>
                    <tr>
                      <th className="w-16"></th>
                      {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(d => (
                        <th key={d} className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["Sabah", "Öğle", "Ö. Sonra", "Akşam"].map(slot => (
                      <tr key={slot}>
                        <td className="text-[9px] font-black text-slate-400 uppercase tracking-tighter pr-1">{slot}</td>
                        {[0,1,2,3,4,5,6].map(dayIdx => {
                          const slotAvailability = tutor.availability?.find(a => {
                            const aDay = a.day.trim().toLowerCase();
                            const targetDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                            const targetDaysTr = ["pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar"];
                            if (aDay !== targetDays[dayIdx] && aDay !== targetDaysTr[dayIdx]) return false;
                            const h = parseInt(a.start.split(':')[0]);
                            if (slot === "Sabah" && h >= 6 && h < 12) return true;
                            if (slot === "Öğle" && h >= 12 && h < 16) return true;
                            if (slot === "Ö. Sonra" && h >= 16 && h < 20) return true;
                            if (slot === "Akşam" && h >= 20 && h <= 23) return true;
                            return false;
                          });

                          let bgColor = "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800";
                          let Icon = null;

                          if (slotAvailability) {
                            const type = slotAvailability.type || tutor.serviceType;
                            if (type === "both" || type === "Both") {
                              bgColor = "bg-[#8b5cf6] border-[#7c3aed] text-white shadow-sm shadow-purple-200/50 dark:shadow-none";
                              Icon = Globe;
                            } else if (type === "online" || type === "Online") {
                              bgColor = "bg-[#3b82f6] border-[#2563eb] text-white shadow-sm shadow-blue-200/50 dark:shadow-none";
                              Icon = Monitor;
                            } else {
                              bgColor = "bg-[#10b981] border-[#059669] text-white shadow-sm shadow-emerald-200/50 dark:shadow-none";
                              Icon = Home;
                            }
                          }

                          return (
                            <td key={dayIdx}>
                              <div className={`h-9 rounded-xl border-2 transition-all flex items-center justify-center ${bgColor}`}>
                                {Icon && <Icon size={14} className="animate-in zoom-in duration-300" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Photos Section */}
            {photos.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fotoğraflar</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photos.map((p, i) => (
                    <div 
                      key={i} 
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activePhoto === i ? 'border-blue-500 scale-[0.98]' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                      onClick={() => {
                        setActivePhoto(i);
                        setLightboxIndex(i);
                      }}
                    >
                      <img src={p.photoUrl ? getImageUrl(p.photoUrl) : ""} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Map Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hizmet Alanı</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                  <MapPin size={12} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                    {tutor.neighborhood || tutor.district}, {tutor.city}
                  </span>
                </div>
              </div>
              <div className="h-[250px] rounded-[1.5rem] overflow-hidden border dark:border-slate-800 shadow-inner relative group">
                <iframe
                  width="100%" height="100%" style={{ border: 0 }}
                  className="dark:invert dark:hue-rotate-180 dark:opacity-80"
                  loading="lazy" allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${tutor.neighborhood || ''} ${tutor.district || ''} ${tutor.city}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            </section>

            {/* Değerlendirmeler Section */}
            <section className="space-y-8 pt-8 border-t dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Değerlendirmeler ve yorumlar</h3>
              
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-black text-gray-900 dark:text-white mb-1">{tutor.rating?.toFixed(1) || "5.0"}</div>
                  <div className="flex justify-center md:justify-start mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} className={s <= Math.round(tutor.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                    ))}
                  </div>
                  <p className="text-amber-600 font-bold text-xs">{reviews.length} yorum</p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : (star === 5 ? 100 : 0);
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-7">
                          <span className="text-[10px] font-bold text-slate-400">★{star}</span>
                        </div>
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 w-3">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6 pt-6">
                {reviews.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                      {r.reviewerName?.charAt(0) || "Ö"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={10} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {r.location || "ANKARA"}'dan <span className="text-gray-900 dark:text-slate-200">{r.reviewerName || "Öğrenci"}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed italic">"{r.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              <div className="bg-[#f8fafc] dark:bg-slate-800/40 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4">Deneyiminizi Paylaşın</h4>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puanınız:</span>
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
                            onChange={() => setReviewData({ ...reviewData, rating: s })}
                          />
                          <label title={`${s} stars`} htmlFor={`rating-${s}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="0.8em" viewBox="0 0 576 512">
                              <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                            </svg>
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                  </StyledRadio>
                </div>
                <textarea 
                  className="w-full h-24 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all mb-4 resize-none"
                  placeholder="Eğitmen hakkında ne düşünüyorsunuz?"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                />
                <Button 
                  className="bg-[#1e293b] dark:bg-blue-600 h-10 px-6 rounded-lg font-bold text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition-all text-xs"
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? <Loader2 className="animate-spin" /> : "Yorumu Gönder"}
                </Button>
              </div>
            </section>

          </div>

          {/* Right Sidebar Area */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
              <div className="p-6 space-y-5">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{tutor.teacherName?.split(' ')[0]}'ya bir mesaj gönder</h4>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl flex gap-2">
                  <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 shadow-sm border dark:border-slate-700">
                    <Monitor className="text-amber-500" size={16} />
                  </div>
                  <p className="text-[10px] text-amber-800 dark:text-amber-500/80 font-medium leading-relaxed">
                    Ücretsiz bir görüşme harika bir sonraki adım olabilir. Aşağıdaki {tutor.teacherName?.split(' ')[0]}'ya sormanız yeterli!
                  </p>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-1.5">
                    <textarea 
                      className="w-full h-28 bg-[#f8fafc] dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all resize-none"
                      placeholder={`Merhaba ${tutor.teacherName?.split(' ')[0]}, ders almak istiyorum...`}
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Konu ve seviye</label>
                    <select className="w-full h-10 bg-[#f8fafc] dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-lg px-3 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none">
                      <option>{tutor.subject} - Genel</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600" checked readOnly />
                    <span className="text-[10px] text-slate-500 font-medium leading-tight">
                      {tutor.teacherName?.split(' ')[0]} gibi 2-3 eğitmenin görüşlerini dinleyin.
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-md shadow-lg shadow-emerald-200 dark:shadow-none"
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? <Loader2 className="animate-spin" /> : "Mesaj Gönder"}
                  </Button>

                  <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    Beklenen yanıt süresi: 24 saat
                  </p>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsShareModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-[2.5rem] p-8 relative z-10 shadow-2xl border dark:border-slate-700">
            <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100" onClick={() => setIsShareModalOpen(false)}><XIcon size={20} /></button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profili Paylaş</h2>
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
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors z-[1200]"
            onClick={() => setLightboxIndex(null)}
          >
            <XIcon size={24} />
          </button>

          {/* Prev button */}
          {photos.length > 1 && (
            <button 
              className="absolute left-6 text-white/80 hover:text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors z-[1200]"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
              }}
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Large Image */}
          <div className="max-w-[85vw] max-h-[85vh] select-none z-[1150]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={photos[lightboxIndex]?.photoUrl ? getImageUrl(photos[lightboxIndex].photoUrl) : ""} 
              alt="" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in duration-200" 
            />
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button 
              className="absolute right-6 text-white/80 hover:text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors z-[1200]"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
              }}
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Page Counter */}
          <div className="absolute bottom-6 bg-white/10 px-4 py-1.5 rounded-full text-white/95 text-xs font-bold z-[1200]">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}

const ActionButton = styled.button.attrs({ className: "rounded-xl flex items-center justify-center transition-all duration-300 border dark:border-slate-700" })`
  background: ${props => props.$active ? "#fef2f2" : "#f1f5f9"};
  color: ${props => props.$active ? "#ef4444" : "#64748b"};
  .dark & {
    background: ${props => props.$active ? "#991b1b20" : "#1e293b"};
    color: ${props => props.$active ? "#ef4444" : "#94a3b8"};
  }
  &:hover { 
    background: ${props => props.$active ? "#fecaca" : "#e2e8f0"}; 
    .dark & { background: ${props => props.$active ? "#991b1b40" : "#334155"}; }
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
    0% { transform: scale(1); }
    100% { transform: scale(1.05); }
  }
`;

export default TutorDetail;
