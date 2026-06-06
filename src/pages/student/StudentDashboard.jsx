import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Clock,
  Video,
  BookOpen,
  Loader2,
  TrendingUp,
  Star,
  Zap,
  ArrowRight,
  UserCheck,
  Heart,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getStudentDashboardStats,
  getStudentBookings,
} from "@/services/studentService";
import { getMyFavorites } from "@/services/favoriteService";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, bookingsData, favoritesData] = await Promise.all([
          getStudentDashboardStats(),
          getStudentBookings(),
          getMyFavorites()
        ]);
        setStats(statsData);
        setBookings(bookingsData?.$values || bookingsData || []);
        setFavorites(favoritesData?.$values || favoritesData || []);
      } catch (error) {
        console.error("Dashboard load error", error);
        // api.js 401 durumunda zaten login'e yönlendiriyor.
        // Diğer hatalar için mesaj gösterelim.
        toast.error("Dashboard verileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <Skeleton height="40px" width="150px" className="mb-4" borderRadius="20px" />
          <Skeleton height="60px" width="60%" className="mb-2" borderRadius="16px" />
          <Skeleton height="24px" width="40%" borderRadius="8px" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton height="160px" borderRadius="32px" />
          <Skeleton height="160px" borderRadius="32px" />
          <Skeleton height="160px" borderRadius="32px" />
          <Skeleton height="160px" borderRadius="32px" />
        </div>
        <div className="grid gap-10 lg:grid-cols-7">
          <div className="lg:col-span-4 space-y-4">
            <Skeleton height="100px" borderRadius="32px" />
            <Skeleton height="100px" borderRadius="32px" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton height="300px" borderRadius="32px" />
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "Approved" && new Date(b.startTime) > new Date(),
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-800 p-10 rounded-[3rem] shadow-xl shadow-purple-200 relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10">
          <Badge className="mb-4 bg-white/20 text-white border-none px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-md">
            Öğrenci Paneli
          </Badge>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Tekrar Hoş Geldin! 👋
          </h1>
          <p className="text-purple-100 font-medium mt-2 text-lg">
            Hangi konuyu bugün daha iyi öğrenmek istersin?
          </p>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10">
          <Button 
            variant="outline"
            className="h-14 px-8 rounded-2xl font-bold bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md"
            onClick={() => navigate("/student/favorites")}
          >
            ❤️ Favori Hocalarım
          </Button>
          <Button 
            className="h-14 px-8 rounded-2xl font-bold bg-white text-violet-600 hover:bg-purple-50 shadow-xl"
            onClick={() => navigate("/tutors")}
          >
            Yeni Hoca Bul
          </Button>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mesajlarım"
          value={stats?.totalMessages || 0}
          sub="Tüm zamanlar"
          icon={<MessageCircle className="h-6 w-6 text-blue-600" />}
          trend="Aktif"
          color="#3b82f6"
        />
        <StatCard
          title="Favori Hocalarım"
          value={favorites?.length || 0}
          sub="Kaydedilenler"
          icon={<Heart className="h-6 w-6 text-red-500" />}
          trend="Güncel"
          color="#ef4444"
        />
        <StatCard
          title="Profil Tamamlanma"
          value="%100"
          sub="Hesap durumu"
          icon={<UserCheck className="h-6 w-6 text-emerald-500" />}
          trend="Süper"
          color="#10b981"
        />
        <StatCard
          title="Sistem Puanı"
          value="4.9"
          sub="Güvenilir öğrenci"
          icon={<Star className="h-6 w-6 text-amber-500" />}
          trend="Harika"
          color="#f59e0b"
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-7">
        {/* Next Lessons List */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/30">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black text-gray-900 dark:text-slate-100 flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-600 fill-blue-600" /> Platform Duyuruları
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold">
                Şu an için yeni bir duyuru bulunmuyor.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Favori Hocalarım Section */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black text-gray-900 dark:text-slate-100 flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" /> Favori Hocalarım
              </CardTitle>
              <Button
                variant="ghost"
                className="text-red-500 font-black text-sm"
                onClick={() => navigate("/student/favorites")}
              >
                Tümü <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-sm">Henüz favori hocanız yok.</p>
                <Button variant="link" className="text-blue-600 font-bold text-xs mt-2" onClick={() => navigate("/tutors")}>Hemen Keşfet →</Button>
              </div>
            ) : (
              favorites.slice(0, 3).map((item) => {
                const tutor = item.tutor || item.teacherListing || item;
                // Backend'den gelen alanlar için kapsamlı fallback mekanizması
  const name = tutor.teacherName || tutor.name || tutor.teacherListing?.teacherName || tutor.fullName || "Eğitmen";
                return (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/tutors/${tutor.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={tutor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d79f3&color=fff`} 
                        className="w-12 h-12 rounded-xl object-cover"
                        alt={name}
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{name}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest">{tutor.subject || tutor.category || "Genel"}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })
            )}
            {favorites.length > 3 && (
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-gray-100 font-bold text-xs text-gray-500"
                onClick={() => navigate("/student/favorites")}
              >
                +{favorites.length - 3} Hoca Daha Gör
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, sub, icon, trend, color }) => (
  <Card className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
    <CardContent className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
          {icon}
        </div>
        <Badge className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-100 text-gray-500 dark:text-slate-300 border-none px-3 py-1 rounded-lg text-[10px] font-black">
          {trend}
        </Badge>
      </div>
      <div>
        <div className="text-4xl font-black text-gray-900 dark:text-slate-100 mb-2">{value}</div>
        <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{title}</div>
        <div className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">{sub}</div>
      </div>
    </CardContent>
  </Card>
);

const LessonItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: white;
  border: 2px solid #f8fafc;
  border-radius: 28px;
  transition: all 0.3s;
  animation: slide-in 0.5s ease-out forwards;
  animation-delay: ${(props) => props.index * 0.1}s;
  opacity: 0;

  &:hover {
    border-color: #dbeafe;
    background: #f3f7ff;
    transform: translateX(8px);
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
