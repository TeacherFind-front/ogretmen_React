import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Star, Loader2, ArrowLeft, CheckCircle2, MessageSquare } from "lucide-react";
import { addReview } from "@/services/reviewService";
import { getMyBookings } from "@/services/bookingService";
import toast from "react-hot-toast";
import styled from "styled-components";

export default function StudentReview() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookings = await getMyBookings();
        const found = bookings.find(b => b.id === bookingId || b.bookingId === bookingId);
        if (found) {
          setBooking(found);
        } else {
          toast.error("Ders bulunamadı.");
          navigate("/student/lessons");
        }
      } catch (err) {
        toast.error("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    setSubmitting(true);
    try {
      // ReviewService expects listingId
      const listingId = booking.teacherListingId || booking.listingId;
      if (!listingId) {
          throw new Error("İlan bilgisi bulunamadı.");
      }

      await addReview(listingId, { rating, comment });
      setSuccess(true);
      toast.success("Değerlendirmeniz için teşekkürler!");
      setTimeout(() => {
        navigate("/student/lessons");
      }, 3000);
    } catch (err) {
      toast.error(err.message || "Yorum gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Yükleniyor...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">Teşekkür Ederiz!</h1>
        <p className="text-gray-500 text-lg mb-10">Değerlendirmeniz başarıyla kaydedildi. Diğer öğrenciler için çok değerli bir katkı yaptınız.</p>
        <Button onClick={() => navigate("/student/lessons")} className="h-14 px-10 rounded-2xl bg-gray-900 font-bold">
          Derslerime Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate("/student/lessons")}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Geri Dön
      </button>

      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Deneyiminizi Paylaşın</h1>
        <p className="text-gray-500 text-lg font-medium">
          <span className="text-blue-600 font-black">{booking?.tutorName}</span> ile yaptığınız <span className="text-gray-900 font-bold">{booking?.lessonTitle}</span> dersi nasıldı?
        </p>
      </header>

      <Card className="rounded-[2.5rem] border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden bg-white">
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Star Rating */}
            <section>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Dersi Puanlayın</label>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarButton
                    key={star}
                    type="button"
                    $active={rating >= star}
                    onClick={() => setRating(star)}
                  >
                    <Star size={32} className={rating >= star ? "fill-yellow-400" : ""} />
                    <span className="mt-2 text-[10px] font-black uppercase">{star === 1 ? "Kötü" : star === 3 ? "Orta" : star === 5 ? "Mükemmel" : ""}</span>
                  </StarButton>
                ))}
              </div>
            </section>

            {/* Comment Area */}
            <section>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Görüşleriniz (İsteğe Bağlı)</label>
              <div className="relative">
                <div className="absolute top-5 left-5 text-gray-300">
                  <MessageSquare size={20} />
                </div>
                <textarea
                  className="w-full min-h-[200px] p-6 pl-14 bg-gray-50 border-2 border-gray-50 rounded-3xl outline-none focus:border-blue-100 focus:bg-white transition-all text-gray-700 font-medium resize-none"
                  placeholder="Ders anlatımı, hoca iletişimi ve materyaller hakkında ne düşünüyorsunuz?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
            </section>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 font-black text-lg transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Değerlendirmeyi Gönder"
                )}
              </Button>
              <p className="text-center text-xs text-gray-400 font-bold mt-4">
                Değerlendirmeniz profil üzerinde herkese açık olarak yayınlanacaktır.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const StarButton = styled.button`
  flex: 1;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  transition: all 0.2s;
  background: ${props => props.$active ? '#fffbeb' : '#f8fafc'};
  color: ${props => props.$active ? '#f59e0b' : '#cbd5e1'};
  border: 2px solid ${props => props.$active ? '#fde68a' : '#f1f5f9'};

  &:hover {
    transform: scale(1.05);
    border-color: #fde68a;
  }
`;
