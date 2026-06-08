import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Loader2, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowUpRight,
  MoreVertical,
  MessageCircle,
  Video,
  MessageSquare,
  Star as StarIcon
} from "lucide-react";
import { 
  getMyBookings, 
  getMyStudents, 
  approveBooking, 
  rejectBooking,
  getMyProfile
} from "@/services/tutorService";
import { Badge } from "@/components/ui/Badge";
import styled from "styled-components";
import { Skeleton } from "@/components/ui/Skeleton";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsData, studentsData, profileData] = await Promise.all([
        getMyBookings(),
        getMyStudents(),
        getMyProfile()
      ]);
      setBookings(bookingsData);
      setStudents(studentsData);
      setProfile(profileData);
    } catch (error) {
      console.error("Dashboard data load failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveBooking(id);
      await fetchData();
    } catch (error) {
      alert(error.message || "Onaylama başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reddetme sebebi giriniz (Opsiyonel):");
    if (reason === null) return;
    
    setActionLoading(id);
    try {
      await rejectBooking(id, reason);
      await fetchData();
    } catch (error) {
      alert(error.message || "Reddetme başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 pb-16 mt-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <Skeleton height="32px" width="150px" className="mb-3" borderRadius="16px" />
          <Skeleton height="48px" width="50%" className="mb-2" borderRadius="12px" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton height="140px" borderRadius="24px" />
          <Skeleton height="140px" borderRadius="24px" />
          <Skeleton height="140px" borderRadius="24px" />
          <Skeleton height="140px" borderRadius="24px" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton height="300px" borderRadius="24px" />
          </div>
          <div className="space-y-4">
            <Skeleton height="200px" borderRadius="24px" />
            <Skeleton height="150px" borderRadius="24px" />
          </div>
        </div>
      </div>
    );
  }

  // Stats calculation
  const completedBookings = bookings.filter(b => b.status === "Completed");
  const activeStudentsCount = students.length;
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 500), 0);

  const today = new Date().toDateString();
  const todaysBookings = bookings.filter(b => 
    new Date(b.startTime).toDateString() === today && b.status === "Approved"
  );
  const pendingRequests = bookings.filter(b => b.status === "Pending");

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-16 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 rounded-[2rem] shadow-lg shadow-blue-200/50 relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-8 -mb-8 blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white tracking-tight">Eğitmen Paneli</h1>
          <p className="text-blue-100 font-medium mt-1 text-sm">
            Hocam hoş geldiniz! Bugün <span className="text-white font-black underline decoration-blue-400 underline-offset-4">{todaysBookings.length} dersiniz</span> ve 
            <span className="text-white font-black underline decoration-blue-400 underline-offset-4"> {pendingRequests.length} bekleyen talebiniz</span> var.
          </p>
        </div>
        <div className="flex gap-2 relative z-10 w-full md:w-auto mt-4 md:mt-0">
          <Button 
            variant="outline" 
            className="h-10 px-4 rounded-lg bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold backdrop-blur-md text-xs w-full md:w-auto"
            onClick={() => navigate("/tutor/schedule")}
          >
            Takvimim
          </Button>
        </div>
      </header>



      <div className="grid gap-6 md:grid-cols-1">
        <StatCard 
          title="Puan Durumu" 
          value={profile?.rating || "0.0"} 
          sub={`${profile?.reviewCount || 0} Değerlendirme`} 
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Bugünün Programı */}
        <Card className="md:col-span-2 rounded-[2rem] border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-[#1e293b]">
          <CardHeader className="p-6 border-b border-gray-50 dark:border-slate-800/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
              Bugünün Programı
            </CardTitle>
            <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
              {todaysBookings.length} DERS
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {todaysBookings.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800">
                 <Calendar className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                 <p className="text-gray-400 dark:text-slate-500 font-bold">Bugün için onaylanmış bir dersiniz bulunmuyor.</p>
              </div>
            ) : (
              todaysBookings.map(b => (
                <div key={b.id} className="flex flex-col sm:flex-row items-center justify-between p-6 border border-gray-100 dark:border-slate-800 rounded-3xl hover:bg-gray-50/50 dark:hover:bg-slate-800/30 hover:shadow-xl dark:hover:shadow-none hover:border-white dark:hover:border-slate-700 transition-all group">
                  <div className="flex items-center gap-5 w-full sm:w-auto min-w-0">
                    <img 
                      src={b.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.studentName)}&background=f1f5f9&color=64748b`} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md shrink-0"
                      alt="Student"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-gray-900 dark:text-white text-lg truncate">{b.studentName}</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2 truncate">
                         <Badge className="p-0 h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-500 border-none shrink-0"></Badge>
                         {new Date(b.startTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <Button variant="outline" className="flex-1 sm:flex-none h-12 px-6 rounded-xl border-gray-200 font-bold">
                       Detay
                    </Button>
                    {/* Sanal Sınıf Butonu Kaldırıldı */}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Aksiyon Bekleyenler */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-[#1e293b] overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50 dark:border-slate-800/50">
              <CardTitle className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                 <div className="w-9 h-9 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <AlertCircle className="w-4 h-4" />
                 </div>
                 Yeni İstekler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium text-sm italic">Bekleyen yeni bir talep yok.</div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="p-6 border border-gray-100 dark:border-slate-700 rounded-3xl bg-orange-50/20 dark:bg-orange-900/10 border-l-4 border-l-orange-400 relative group animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <img 
                            src={req.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.studentName)}&background=orange&color=fff`} 
                            className="w-10 h-10 rounded-xl object-cover" 
                            alt="Student"
                          />
                          <div>
                             <p className="font-black text-gray-900 dark:text-white text-sm">{req.studentName}</p>
                             <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">{req.lessonTitle}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 text-[13px] font-medium text-gray-600 dark:text-slate-400 italic">
                       "{req.studentNote || "Ders talebi oluşturuldu."}"
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 flex-1 font-bold text-xs"
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading === req.id}
                      >
                        {actionLoading === req.id ? <Loader2 size={14} className="animate-spin" /> : "Onayla"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-10 rounded-xl bg-white flex-1 font-bold text-xs border-gray-200"
                        onClick={() => handleReject(req.id)}
                        disabled={actionLoading === req.id}
                      >
                        Reddet
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Gelen Yorumlar */}
          <Card className="rounded-[2rem] border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-[#1e293b] overflow-hidden mt-6">
            <CardHeader className="p-6 border-b border-gray-50 dark:border-slate-800/50">
              <CardTitle className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                 <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <MessageSquare className="w-4 h-4" />
                 </div>
                 Gelen Yorumlar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {(!profile?.reviews || profile.reviews.length === 0) ? (
                <div className="text-center py-10 text-gray-400 font-medium text-sm italic">Henüz yorum yapılmamış.</div>
              ) : (
                profile.reviews.map((rev, idx) => (
                  <div key={idx} className="p-5 border border-gray-50 dark:border-slate-800 rounded-2xl bg-gray-50/30 dark:bg-slate-800/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{rev.reviewerName || "Öğrenci"}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <StarIcon key={si} size={10} className={si < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-slate-700"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon, trend }) {
  return (
    <Card className="rounded-2xl border-gray-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-none transition-all group bg-white dark:bg-[#1e293b] p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
           {icon}
        </div>
        {trend && (
           <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-black">
              <ArrowUpRight size={8} className="mr-1" /> %12
           </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{sub}</p>
      </div>
    </Card>
  );
}
