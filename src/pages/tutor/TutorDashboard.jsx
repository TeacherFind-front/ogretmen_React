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
      <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <Skeleton height="40px" width="180px" className="mb-4" borderRadius="20px" />
          <Skeleton height="60px" width="60%" className="mb-2" borderRadius="16px" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton height="160px" borderRadius="32px" />
          <Skeleton height="160px" borderRadius="32px" />
          <Skeleton height="160px" borderRadius="32px" />
          <Skeleton height="160px" borderRadius="32px" />
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton height="350px" borderRadius="32px" />
          </div>
          <div className="space-y-6">
            <Skeleton height="250px" borderRadius="32px" />
            <Skeleton height="180px" borderRadius="32px" />
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
    <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 rounded-[3rem] shadow-xl shadow-blue-200 relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Eğitmen Paneli</h1>
          <p className="text-blue-100 font-medium mt-2 text-lg">
            Hocam hoş geldiniz! Bugün <span className="text-white font-black underline decoration-blue-400 underline-offset-4">{todaysBookings.length} dersiniz</span> ve 
            <span className="text-white font-black underline decoration-blue-400 underline-offset-4"> {pendingRequests.length} bekleyen talebiniz</span> var.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button 
            variant="outline" 
            className="h-12 px-6 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold backdrop-blur-md"
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

      <div className="grid gap-10 md:grid-cols-3">
        {/* Bugünün Programı */}
        <Card className="md:col-span-2 rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              Bugünün Programı
            </CardTitle>
            <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-xl font-bold">
              {todaysBookings.length} DERS
            </Badge>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {todaysBookings.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                 <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-400 font-bold">Bugün için onaylanmış bir dersiniz bulunmuyor.</p>
              </div>
            ) : (
              todaysBookings.map(b => (
                <div key={b.id} className="flex flex-col sm:flex-row items-center justify-between p-6 border border-gray-100 rounded-3xl hover:bg-gray-50/50 hover:shadow-xl hover:border-white transition-all group">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <img 
                      src={b.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.studentName)}&background=f1f5f9&color=64748b`} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                      alt="Student"
                    />
                    <div>
                      <h4 className="font-black text-gray-900 text-lg">{b.studentName}</h4>
                      <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                         <Badge className="p-0 h-4 w-4 rounded-full bg-blue-600 border-none"></Badge>
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
          <Card className="rounded-[2.5rem] border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                 </div>
                 Yeni İstekler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium text-sm italic">Bekleyen yeni bir talep yok.</div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="p-6 border border-gray-100 rounded-3xl bg-orange-50/20 border-l-4 border-l-orange-400 relative group animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <img 
                            src={req.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.studentName)}&background=orange&color=fff`} 
                            className="w-10 h-10 rounded-xl object-cover" 
                            alt="Student"
                          />
                          <div>
                             <p className="font-black text-gray-900 text-sm">{req.studentName}</p>
                             <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">{req.lessonTitle}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded-xl mb-4 text-[13px] font-medium text-gray-600 italic">
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
          <Card className="rounded-[2.5rem] border-gray-100 shadow-sm bg-white overflow-hidden mt-6">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 Gelen Yorumlar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {(!profile?.reviews || profile.reviews.length === 0) ? (
                <div className="text-center py-10 text-gray-400 font-medium text-sm italic">Henüz yorum yapılmamış.</div>
              ) : (
                profile.reviews.map((rev, idx) => (
                  <div key={idx} className="p-5 border border-gray-50 rounded-2xl bg-gray-50/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 text-sm">{rev.reviewerName || "Öğrenci"}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <StarIcon key={si} size={10} className={si < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed italic">"{rev.comment}"</p>
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
    <Card className="rounded-3xl border-gray-100 hover:shadow-xl hover:border-white transition-all group bg-white p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
           {icon}
        </div>
        {trend && (
           <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black">
              <ArrowUpRight size={10} className="mr-1" /> %12
           </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
        <p className="text-[11px] text-gray-400 font-bold">{sub}</p>
      </div>
    </Card>
  );
}
