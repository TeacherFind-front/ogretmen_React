import React, { useState, useEffect } from "react";
import { getMyFavorites } from "@/services/favoriteService";
import { TutorCard } from "@/components/shared/TutorCard";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await getMyFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("Favorites fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <Skeleton height="40px" width="200px" className="mb-4" borderRadius="20px" />
          <Skeleton height="24px" width="60%" borderRadius="12px" />
        </div>
        <div className="grid gap-6">
          <Skeleton height="200px" borderRadius="40px" />
          <Skeleton height="200px" borderRadius="40px" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Favori Hocalarım</h1>
          <p className="text-gray-500 font-medium mt-2 text-lg">Takip ettiğiniz ve ders almayı planladığınız hocalar.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 font-bold" onClick={() => navigate("/tutors")}>
          Daha Fazla Hoca Bul
        </Button>
      </header>

      {favorites.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-200" />
           </div>
           <p className="text-gray-400 font-bold text-lg">Henüz favori hocanız bulunmuyor.</p>
           <Button variant="link" className="text-blue-600 font-black mt-2" onClick={() => navigate("/tutors")}>Hemen hoca keşfedin →</Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {favorites.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
}
