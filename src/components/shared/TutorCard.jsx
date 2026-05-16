import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star, MessageCircle, Heart, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toggleFavorite } from "@/services/favoriteService";

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
  const name = tutor.teacherName || tutor.name || "İsimsiz";
  
  // Önce isMain olan fotoğrafı bul, yoksa ilk fotoğrafı al, o da yoksa avatarUrl'e bak
  const mainPhoto = tutor.photos?.find(p => p.isMain)?.photoUrl || tutor.photos?.[0]?.photoUrl;
  const avatar = mainPhoto || tutor.avatarUrl || tutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d79f3&color=fff`;
  
  const headline = tutor.title || tutor.headline || "";
  const description = tutor.description || tutor.bio || "";
  const price = tutor.price || tutor.hourlyRate || 0;
  const rating = tutor.rating ?? 0;
  const reviewCount = tutor.reviewCount || tutor.reviews || 0;

  const serviceTypeLabel = {
    Online: "Çevrimiçi",
    InPerson: "Yüz Yüze",
    Both: "Her İkisi",
  }[tutor.serviceType] || tutor.serviceType || "";

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden border-gray-100 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group rounded-[2rem] bg-white">
      {/* Sol Panel - Avatar & Fiyat */}
      <div className="md:w-56 bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors p-8 flex flex-col items-center justify-center border-r border-gray-100">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-28 h-28 rounded-full object-cover shadow-md mb-5 border-4 border-white group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${tutor.id}`; }}
          />
          <span className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <h3 className="font-black text-xl text-center mb-1 text-gray-900">{name}</h3>
        <p className="text-sm font-bold flex items-center gap-1 mb-2 text-yellow-500">
          <Star className="w-4 h-4 fill-yellow-500" />
          {rating.toFixed ? rating.toFixed(1) : rating}
          <span className="text-gray-400 font-medium text-xs ml-1">({reviewCount} Değerlendirme)</span>
        </p>
        <p className="font-black text-2xl text-blue-600 mt-2">
          ₺{price}
          <span className="text-sm font-bold text-gray-400">/saat</span>
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
          {tutor.subject && (
            <Badge variant="secondary">{tutor.subject}</Badge>
          )}
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
            <Button className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">Profili İncele</Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl font-bold border-gray-200 hover:bg-gray-50"
            onClick={handleMessage}
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Mesaj Gönder
          </Button>
        </div>
      </div>
    </Card>
  );
}
