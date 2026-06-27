import React, { useState, useEffect } from "react";
import { getMyFavorites } from "@/services/favoriteService";
import { TutorCard } from "@/components/shared/TutorCard";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * StudentFavorites - Öğrencinin favoriye eklediği eğitmenleri (hocaları) listeleyen sayfa bileşeni.
 * API'den favori listesini çekip yükleme durumunda skeleton gösterir,
 * favori hoca yoksa boş durum ekranı sunar ve olanları TutorCard bileşeniyle grid/liste olarak gösterir.
 */
export default function StudentFavorites() {
  // Favori hocaların listesini tutan state array.
  const [favorites, setFavorites] = useState([]);
  // Veri yükleniyor durumunu kontrol eden loading state'i.
  const [loading, setLoading] = useState(true);
  // Sayfa yönlendirmeleri için react-router hook'u.
  const navigate = useNavigate();

  // Bileşen ilk render edildiğinde (mounted) favorileri çekmek için useEffect tetiklenir.
  useEffect(() => {
    fetchFavorites();
  }, []);

  /**
   * fetchFavorites - API üzerinden giriş yapmış olan öğrencinin favori hocalarını getirir.
   */
  const fetchFavorites = async () => {
    setLoading(true); // Yükleme animasyonunu/skeleton'ı başlat
    try {
      const data = await getMyFavorites();
      // .NET API $values içinde sarmalanmış veri veya doğrudan dizi döndürebileceği için esnek kontrol yapılmıştır.
      setFavorites(data?.$values || data || []);
    } catch (error) {
      console.error("Favorites fetch failed", error); // Hata durumunda konsola yazdır
    } finally {
      setLoading(false); // Her halükarda yükleme durumunu sonlandır
    }
  };

  // Veri yüklenme aşamasındaysa Skeleton (iskelet yüklenme ekranı) gösterilir
  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8">
        {/* Başlık alanı için skeleton */}
        <div className="bg-white dark:bg-[var(--card-bg)] p-10 rounded-[3rem] border border-gray-100 dark:border-[var(--card-border)] shadow-sm">
          <Skeleton height="40px" width="200px" className="mb-4" borderRadius="20px" />
          <Skeleton height="24px" width="60%" borderRadius="12px" />
        </div>
        {/* Kart listesi için skeletonlar */}
        <div className="grid gap-6">
          <Skeleton height="200px" borderRadius="40px" />
          <Skeleton height="200px" borderRadius="40px" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8 animate-in fade-in duration-700">
      {/* Sayfa Başlığı / Header Bölümü */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-[var(--card-bg)] p-10 rounded-[3rem] border border-gray-100 dark:border-[var(--card-border)] shadow-sm relative overflow-hidden">
        {/* Dekoratif kırmızı halka arka planda */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-900/20 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">Favori Hocalarım</h1>
          <p className="text-gray-500 dark:text-[var(--text-muted)] font-medium mt-2 text-lg">Takip ettiğiniz ve ders almayı planladığınız hocalar.</p>
        </div>
        {/* Yeni öğretmen aramak için buton */}
        <Button className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 dark:shadow-none font-bold" onClick={() => navigate("/tutors")}>
          Daha Fazla Hoca Bul
        </Button>
      </header>

      {/* Favori listesinin boş olması veya dolu olması durumuna göre render etme */}
      {favorites.length === 0 ? (
        /* Boş liste durumu - Kullanıcıya hoca arama sayfasına gitmesi için buton sunar */
        <div className="text-center py-32 bg-white dark:bg-[var(--card-bg)] rounded-[3rem] border border-dashed border-gray-200 dark:border-[var(--card-border)]">
           <div className="w-20 h-20 bg-gray-50 dark:bg-[var(--card-bg)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-200 dark:text-slate-500" />
           </div>
           <p className="text-gray-400 dark:text-[var(--text-muted)] font-bold text-lg">Henüz favori hocanız bulunmuyor.</p>
           <Button variant="link" className="text-green-600 dark:text-green-400 font-black mt-2" onClick={() => navigate("/tutors")}>Hemen hoca keşfedin →</Button>
        </div>
      ) : (
        /* Favori hocalar listesi */
        <div className="grid gap-6">
          {favorites.map((item) => {
            // item bazen favori objesidir (içinde tutor barındıran), bazen de doğrudan tutor'dur.
            // Bu yüzden fallback mantığı kurulmuştur.
            const tutor = item.tutor || item.teacherListing || item;
            return <TutorCard key={item.id} tutor={tutor} />;
          })}
        </div>
      )}
    </div>
  );
}

