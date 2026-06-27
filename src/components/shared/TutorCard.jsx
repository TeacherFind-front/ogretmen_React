import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star, MessageCircle, Heart, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toggleFavorite } from "@/services/favoriteService";
import BASE_URL, { getImageUrl } from "@/services/api";
import { toPlainText, resolveMediaUrl } from "@/utils/helpers";

/**
 * TutorCard - Backend TutorListItemDto alanlarını kullanır:
 * { id, teacherProfileId, teacherName, title, description, price, serviceType,
 *   city, district, subject, rating, reviewCount, isFavorite, avatarUrl? }
 */
export function TutorCard({ tutor }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(tutor.isFavorite || false);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setFavLoading(true);
    try {
      const result = await toggleFavorite(tutor.id);
      setIsFavorite(result.isFavorite);
    } catch {
      // sessizce hata yut
    } finally {
      setFavLoading(false);
    }
  };
  
  const handleMessage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Mesajlar sayfasına eğitmen bilgileriyle yönlendir
    navigate(`/student/messages?tutorId=${tutor.id}&tutorName=${encodeURIComponent(name)}`);
  };

  // Backend'den gelen alanlar için fallback değerleri
  // Backend'den gelen alanlar için kapsamlı fallback mekanizması
  const name = tutor.teacherName || tutor.name || tutor.teacherListing?.teacherName || tutor.fullName || "Eğitmen";
  
  // Önce isMain olan fotoğrafı bul, yoksa ilk fotoğrafı al, o da yoksa avatarUrl'e bak
  const photosList = tutor.photos?.$values || tutor.photos || [];
  const imageUrl =
    photosList.find(p => p.isMain)?.photoUrl ||
    photosList[0]?.photoUrl ||
    tutor.photoUrl ||
    tutor.profileImageUrl ||
    tutor.avatarUrl;

  const avatar = imageUrl
    ? resolveMediaUrl(imageUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`;
  
  const headline = toPlainText(tutor.title || tutor.headline || "");
  const rawDescription = tutor.description || tutor.bio || "";
  const cleanDescription = toPlainText(rawDescription);
  const description = cleanDescription.length > 180 ? cleanDescription.substring(0, 180) + "..." : cleanDescription;
  const price = tutor.price || tutor.hourlyRate || 0;
  const rating = tutor.rating ?? 0;
  const reviewCount = tutor.reviewCount || tutor.reviews || 0;

  const serviceTypeLabel = {
    Online: "Çevrimiçi",
    InPerson: "Yüz Yüze",
    Both: "Her İkisi",
  }[tutor.serviceType] || tutor.serviceType || "";

  return (
    <Card 
      className="flex flex-col md:flex-row overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group rounded-[2rem]"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", boxShadow: "0 4px 20px rgba(22,163,74,0.05)" }}
    >
      {/* Sol Panel - Avatar & Fiyat */}
      <div 
        className="md:w-56 group-hover:bg-[rgba(22,163,74,0.04)] transition-colors p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r"
        style={{ background: "var(--section-alt)", borderColor: "var(--card-border)" }}
      >
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-28 h-28 rounded-full object-cover shadow-md mb-5 border-4 group-hover:scale-105 transition-transform duration-300"
            style={{ borderColor: "var(--card-bg)" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`;
            }}
          />
          <span 
            className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 border-2 rounded-full" 
            style={{ borderColor: "var(--card-bg)" }}
          />
        </div>
        <h3 className="font-black text-xl text-center mb-1" style={{ color: "var(--text-primary)" }}>{name}</h3>
        <p className="text-sm font-bold flex items-center gap-1 mb-2 text-yellow-500">
          <Star className="w-4 h-4 fill-yellow-500" />
          {rating.toFixed ? rating.toFixed(1) : rating}
          <span className="font-medium text-xs ml-1" style={{ color: "var(--text-muted)" }}>({reviewCount} Değerlendirme)</span>
        </p>
        <p className="font-black text-2xl mt-2" style={{ color: "#16a34a" }}>
          ₺{price}
          <span className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>/saat</span>
        </p>
      </div>

      {/* Sağ Panel - Detaylar */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-lg line-clamp-1">{headline}</h4>
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`ml-2 flex-shrink-0 transition-colors ${isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}
            title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {/* Çoklu subject options desteği */}
          {(() => {
            const options = tutor.subjectOptions?.$values || tutor.subjectOptions || [];
            if (options.length > 0) {
              return options.slice(0, 4).map((opt, idx) => (
                <Badge key={idx} variant="secondary">{opt.label || opt.name || opt}</Badge>
              ));
            }
            // Fallback: tek subject
            if (tutor.subject) {
              return <Badge variant="secondary">{tutor.subject}</Badge>;
            }
            return null;
          })()}
          {serviceTypeLabel && (
            <Badge variant="outline">{serviceTypeLabel}</Badge>
          )}
          {tutor.city && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {tutor.city}{tutor.district ? ` / ${tutor.district}` : ""}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-4">
          <Link to={`/tutors/${tutor.id}`} className="flex-1">
            <Button 
              className="w-full h-12 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}
            >
              Profili İncele
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl font-bold transition-colors"
            style={{ borderColor: "var(--card-border)", color: "var(--text-primary)", background: "transparent" }}
            onClick={handleMessage}
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Mesaj Gönder
          </Button>
        </div>
      </div>
    </Card>
  );
}
