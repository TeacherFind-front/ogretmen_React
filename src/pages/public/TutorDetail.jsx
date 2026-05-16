import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Star, 
  Video, 
  MessageCircle, 
  Heart, 
  Calendar, 
  Share2, 
  X as XIcon, 
  MapPin, 
  Clock, 
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
  List
} from "lucide-react";
import ShareSocialButtons from "@/components/shared/ShareSocialButtons";
import { getTutorById } from "@/services/tutorService";
import { toggleFavorite } from "@/services/favoriteService";
import { addReview } from "@/services/reviewService";
import { sendMessage } from "@/services/messageService";
import { Skeleton } from "@/components/ui/Skeleton";
import styled from "styled-components";
import toast from "react-hot-toast";

const COLORS = {
  dominant: "#f8fafc",   
  secondary: "#1e293b",  
  accent: "#2d79f3",     
  white: "#ffffff",
  textMuted: "#64748b"
};

const ContentCard = styled.div.attrs({ className: "bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100" })``;
const ActionButton = styled.button.attrs({ className: "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300" })`
  background: ${props => props.$active ? "#fef2f2" : "#f1f5f9"};
  color: ${props => props.$active ? "#ef4444" : "#64748b"};
  &:hover { background: ${props => props.$active ? "#fecaca" : "#e2e8f0"}; }
`;

export default function TutorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTutorById(id)
      .then((data) => {
        if (!data) setError("Öğretmen bulunamadı.");
        else {
          // Backend'den gelen veriyi işle (sarmalanmış olabilir)
          const tutorData = data.data || data;
          setTutor(tutorData);
          setIsFavorite(tutorData.isFavorite || false);
          
          if (tutorData.photos && tutorData.photos.length > 0) {
            const photos = tutorData.photos.$values || tutorData.photos;
            const mainIdx = photos.findIndex(p => p.isMain);
            if (mainIdx !== -1) setActivePhoto(mainIdx);
          }
        }
      })
      .catch((err) => {
        console.error("TutorDetail Load Error:", err);
        setError("Sunucu hatası oluştu (500). Backend güncellendiği için bazı alanlar uyuşmuyor olabilir.");
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
      // Backend'de TeacherUserId alanı eklenene kadar teacherProfileId üzerinden deniyoruz, 
      // ancak 400 hatası alınması durumunda rapor hazırlandı.
      const targetId = tutor.teacherUserId || tutor.teacherProfileId;
      await sendMessage({ receiverId: targetId, content: messageContent });
      toast.success("Mesajınız iletildi!");
      setIsMessageModalOpen(false);
      setMessageContent("");
    } catch (err) {
      console.error("Message Send Error:", err);
      toast.error("Mesaj gönderilemedi. (Alıcı ID uyuşmazlığı)");
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
      console.error("Review Submit Error:", err);
      const msg = err.status === 400 
        ? "Yorum yapabilmek için bu eğitmenden daha önce ders almış olmanız gerekmektedir." 
        : "Yorum eklenirken bir hata oluştu.";
      toast.error(msg);
    } finally { setReviewLoading(false); }
  };

  if (loading) return (
    <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#2d79f3]" />
    </div>
  );

  if (error || !tutor) return (
    <div className="container mx-auto py-20 text-center px-6">
      <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl border border-red-50">
        <XIcon className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sunucu Hatası</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link to="/"><Button className="w-full bg-[#2d79f3] h-12 rounded-xl">Ana Sayfaya Dön</Button></Link>
      </div>
    </div>
  );

  // Helper to handle $values for reviews and photos
  const reviews = tutor.reviews?.$values || tutor.reviews || [];
  const photos = tutor.photos?.$values || tutor.photos || [];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Hero Header */}
      <div className="h-72 bg-[#1e293b] w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] to-transparent opacity-80"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#2d79f3] rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="container mx-auto -mt-32 px-6 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1 space-y-10">
            {/* Main Profile Card */}
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-start">
              <div className="relative shrink-0">
                <img
                  src={tutor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.teacherName)}&background=2d79f3&color=fff&size=200`}
                  alt={tutor.teacherName}
                  className="w-48 h-48 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-black text-[#1e293b] mb-1 tracking-tight">{tutor.teacherName}</h1>
                    <p className="text-xl font-bold text-[#2d79f3]">{tutor.title}</p>
                  </div>
                  <div className="flex gap-3">
                    <ActionButton onClick={() => setIsShareModalOpen(true)}><Share2 size={20} /></ActionButton>
                    <ActionButton onClick={handleToggleFavorite} $active={isFavorite}>
                      <Heart size={20} className={isFavorite ? "fill-[#ef4444]" : ""} />
                    </ActionButton>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-black text-amber-900">{tutor.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-amber-700/60 font-bold text-xs uppercase tracking-wider">({reviews.length} Yorum)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <MapPin className="w-5 h-5 text-[#2d79f3]" />
                    <span>{tutor.city}{tutor.district ? `, ${tutor.district}` : ""}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-[#2d79f3] text-white py-2 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">{tutor.subject}</Badge>
                  <Badge variant="outline" className="border-slate-200 text-slate-500 py-2 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">{tutor.category}</Badge>
                </div>
              </div>
            </div>

            {/* Lesson Rates Section (Updated Design) */}
            <ContentCard>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4 text-[#2d79f3]">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><LayoutGrid size={24} /></div>
                  <h3 className="text-xl font-black text-slate-800">Verdiği Ders ve Saat Ücretleri</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {tutor.lessonRates && (tutor.lessonRates.$values || tutor.lessonRates).length > 0 ? (
                  (tutor.lessonRates.$values || tutor.lessonRates).map((rate, idx) => (
                    <div key={idx} className="flex items-start gap-5 group transition-all">
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full border-2 border-[#2d79f3] flex items-center justify-center text-[#2d79f3] group-hover:bg-[#2d79f3] group-hover:text-white transition-all duration-300">
                          <Info size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[#1e293b] font-bold text-lg leading-tight mb-1">
                          {rate.title || tutor.subject} / <span className="text-[#1e293b]/80 font-black">{rate.duration} Dk</span>
                        </h4>
                        <p className="text-slate-500 font-medium text-sm tracking-tight">
                          {rate.onlinePrice > 0 ? `Online : ${rate.onlinePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` : ""}
                          {rate.onlinePrice > 0 && rate.inPersonPrice > 0 ? " | " : ""}
                          {rate.inPersonPrice > 0 ? `Yüzyüze : ${rate.inPersonPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` : ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-5 group transition-all">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full border-2 border-[#2d79f3] flex items-center justify-center text-[#2d79f3] group-hover:bg-[#2d79f3] group-hover:text-white transition-all duration-300">
                        <Info size={20} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#1e293b] font-bold text-lg leading-tight mb-1">
                        {tutor.subject} / <span className="text-[#1e293b]/80 font-black">{tutor.lessonDuration} Dk</span>
                      </h4>
                      <p className="text-slate-500 font-medium text-sm tracking-tight">
                        {tutor.serviceType === "Online" || tutor.serviceType === "Both" ? `Online : ${tutor.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` : ""}
                        {tutor.serviceType === "Both" ? " | " : ""}
                        {tutor.serviceType === "InPerson" || tutor.serviceType === "Both" ? `Yüzyüze : ${tutor.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺` : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Detailed Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ContentCard>
                <div className="flex items-center gap-4 mb-6 text-[#2d79f3]">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><BookOpen size={24} /></div>
                  <h3 className="text-xl font-black text-slate-800">Eğitmen Hakkında</h3>
                </div>
                <p className="text-slate-500 leading-relaxed text-base whitespace-pre-line">{tutor.bio || "Biyografi henüz eklenmemiş."}</p>
              </ContentCard>

              <ContentCard>
                <div className="flex items-center gap-4 mb-6 text-purple-600">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center"><GraduationCap size={24} /></div>
                  <h3 className="text-xl font-black text-slate-800">Eğitim & Kariyer</h3>
                </div>
                <div className="space-y-6">
                  {tutor.university && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="font-black text-slate-800 mb-1">{tutor.university}</p>
                      <p className="text-xs font-black text-[#2d79f3] uppercase tracking-widest">{tutor.department}</p>
                    </div>
                  )}
                </div>
              </ContentCard>
            </div>

            {/* Service Map Area */}
            <ContentCard className="overflow-hidden">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div className="flex items-center gap-4 text-[#2d79f3]">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><MapPin size={24} /></div>
                    <h3 className="text-xl font-black text-slate-800">Hizmet Alanı</h3>
                  </div>
                  <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="font-black text-slate-700 text-sm">{tutor.neighborhood || tutor.district}, {tutor.city}</span>
                  </div>
               </div>
               <div className="h-[400px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner">
                  <iframe
                    width="100%" height="100%" style={{ border: 0 }}
                    loading="lazy" allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${tutor.neighborhood || ''} ${tutor.district || ''} ${tutor.city}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
               </div>
            </ContentCard>

            {/* Availability */}
            <ContentCard>
              <div className="flex items-center gap-4 mb-10 text-amber-500">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center"><Calendar size={24} /></div>
                <h3 className="text-xl font-black text-slate-800">Müsaitlik Takvimi</h3>
              </div>

              <div className="flex flex-wrap gap-6 mb-10 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-[#3b82f6]"></div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-[#10b981]"></div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Yüz Yüze</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-[#8b5cf6]"></div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Her İkisi</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-2">
                  <thead>
                    <tr>
                      <th className="w-24"></th>
                      {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(d => (
                        <th key={d} className="text-xs font-black text-slate-400 uppercase tracking-widest pb-4">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["Sabah", "Öğle", "Ö. Sonra", "Akşam"].map(slot => (
                      <tr key={slot}>
                        <td className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{slot}</td>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, dayIdx) => {
                          const slotAvailability = tutor.availability?.find(a => {
                            const aDay = a.day.trim().toLowerCase();
                            const targetDay = dayName.toLowerCase();
                            const targetDayTr = ["pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar"][dayIdx];
                            if (aDay !== targetDay && aDay !== targetDayTr) return false;

                            const startH = parseInt(a.start.split(':')[0]);
                            if (slot === "Sabah" && startH >= 6 && startH < 12) return true;
                            if (slot === "Öğle" && startH >= 12 && startH < 16) return true;
                            if (slot === "Ö. Sonra" && startH >= 16 && startH < 20) return true;
                            if (slot === "Akşam" && startH >= 20 && startH <= 23) return true;
                            return false;
                          });

                          let bgColor = "bg-slate-50/50 border-slate-100";
                          let Icon = null;

                          if (slotAvailability) {
                            const type = slotAvailability.type || tutor.serviceType;
                            if (type === "both" || type === "Both") {
                              bgColor = "bg-[#8b5cf6] border-[#7c3aed] text-white shadow-lg shadow-purple-100";
                              Icon = Globe;
                            } else if (type === "online" || type === "Online") {
                              bgColor = "bg-[#3b82f6] border-[#2563eb] text-white shadow-lg shadow-blue-100";
                              Icon = Monitor;
                            } else {
                              bgColor = "bg-[#10b981] border-[#059669] text-white shadow-lg shadow-emerald-100";
                              Icon = Home;
                            }
                          }

                          return (
                            <td key={dayIdx}>
                              <div className={`h-14 rounded-xl border-2 transition-all flex items-center justify-center ${bgColor}`}>
                                {Icon && <Icon size={20} className="animate-in zoom-in duration-300" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentCard>

            {/* Reviews Section */}
            <ContentCard>
              <div className="flex items-center gap-4 mb-12 text-[#2d79f3]">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><MessageSquare size={24} /></div>
                <h3 className="text-xl font-black text-slate-800">Öğrenci Yorumları</h3>
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                  {reviews.map((r, i) => (
                    <ReviewBox key={i}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-slate-700">{r.reviewerName || "Öğrenci"}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} size={12} className={si < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 italic leading-relaxed">"{r.comment}"</p>
                    </ReviewBox>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-10 rounded-3xl text-center mb-16">
                  <p className="text-slate-400 font-bold italic">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                </div>
              )}

              {/* Add Review Form */}
              <div className="bg-[#f8fafc] p-10 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-xl font-black text-slate-800 mb-8">Deneyiminizi Paylaşın</h4>
                <div className="flex items-center gap-6 mb-8">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Puanınız:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setReviewData({ ...reviewData, rating: s })}>
                        <Star size={32} className={s <= reviewData.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  className="w-full h-40 bg-white border-2 border-slate-100 rounded-3xl p-6 text-slate-600 outline-none focus:border-[#2d79f3] transition-all mb-6"
                  placeholder="Eğitmen hakkında ne düşünüyorsunuz?"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                />
                <Button 
                  className="bg-[#1e293b] h-16 px-10 rounded-2xl font-black text-white hover:bg-slate-800"
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? <Loader2 className="animate-spin" /> : "Yorumu Gönder"}
                </Button>
              </div>
            </ContentCard>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 shrink-0">
            <div className="sticky top-28 space-y-6">
              <SidebarCard>
                <div className="mb-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">SAATLİK ÜCRET</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-slate-800 tracking-tighter">₺{tutor.price}</span>
                    <span className="text-slate-400 font-bold">/saat</span>
                  </div>
                </div>

                <div className="mb-10">
                  {(() => {
                    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                    const isOwnProfile = currentUser?.userId === tutor.teacherUserId;
                    
                    if (isOwnProfile) {
                      return (
                        <div className="w-full py-6 bg-slate-50 border border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center gap-3">
                          <User className="text-slate-300" size={28} />
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center px-4">
                            Kendi profilinizi görüntülüyorsunuz
                          </span>
                        </div>
                      );
                    }

                    return (
                      <PrimaryButton onClick={() => setIsMessageModalOpen(true)}>
                        <MessageSquare size={24} /> Mesaj Gönder
                      </PrimaryButton>
                    );
                  })()}
                </div>

                {tutor.phoneNumber && (
                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><Phone size={20} /></div>
                    <span className="font-black text-emerald-800 text-lg">{tutor.phoneNumber}</span>
                  </div>
                )}
              </SidebarCard>
            </div>
          </aside>
        </div>
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsMessageModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative z-10 shadow-2xl">
            <button className="absolute top-8 right-8 text-slate-400 hover:text-slate-800" onClick={() => setIsMessageModalOpen(false)}><XIcon /></button>
            <h2 className="text-3xl font-black text-slate-800 mb-8">Mesaj Gönder</h2>
            <form onSubmit={handleSendMessage}>
              <textarea 
                className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 text-slate-600 outline-none focus:border-[#2d79f3] bg-white transition-all mb-8"
                placeholder="Eğitmene ne sormak istersiniz?"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
              />
              <Button type="submit" className="w-full bg-[#2d79f3] h-16 rounded-2xl font-black text-white shadow-xl shadow-blue-200" disabled={sendingMessage}>
                {sendingMessage ? <Loader2 className="animate-spin" /> : <><Send size={20} className="mr-2" /> Gönder</>}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


const SidebarCard = styled.div`
  background: white; border-radius: 3.5rem; padding: 48px; border: 1px solid #f1f5f9; box-shadow: 0 40px 80px -20px rgba(15, 23, 42, 0.1);
`;

const PrimaryButton = styled.button`
  width: 100%; 
  height: 72px;
  background: #2d79f3;
  color: white;
  border-radius: 1.5rem;
  font-weight: 900;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 20px 40px -10px rgba(45, 121, 243, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(rgba(255,255,255,0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    background: #1e64d8;
    box-shadow: 0 25px 50px -12px rgba(45, 121, 243, 0.4);
    &::after { opacity: 1; }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  animation: pulse-blue 2s infinite;

  @keyframes pulse-blue {
    0% { box-shadow: 0 0 0 0 rgba(45, 121, 243, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(45, 121, 243, 0); }
    100% { box-shadow: 0 0 0 0 rgba(45, 121, 243, 0); }
  }
`;

const ReviewBox = styled.div`
  background: #f8fafc; padding: 32px; border-radius: 2.5rem; border: 1px solid #f1f5f9;
`;
