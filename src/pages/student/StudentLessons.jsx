import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getMyBookings, cancelBooking } from "@/services/bookingService";
import { getStudentLessons } from "@/services/studentService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Calendar, 
  Clock, 
  Video, 
  Loader2, 
  MoreHorizontal, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  PlayCircle,
  FileText,
  HelpCircle,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentLessons() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      if (activeTab === "upcoming") {
        const data = await getMyBookings();
        setBookings(data);
      } else {
        const data = await getStudentLessons();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleCancel = async (id) => {
    if (!window.confirm("Bu dersi iptal etmek istediğinize emin misiniz?")) return;
    try {
      await cancelBooking(id, "Öğrenci tarafından iptal edildi.");
      fetchBookings();
    } catch (err) {
      alert(err.message || "İptal işlemi başarısız.");
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === "upcoming") {
      // Sadece gelecekteki onaylanmış veya bekleyen dersler
      return b.status !== "Completed" && b.status !== "Rejected" && b.status !== "Cancelled";
    }
    // Geçmiş dersler zaten /api/students/lessons'dan filtrelenmiş geliyor
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 mt-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <Skeleton height="40px" width="200px" className="mb-4" borderRadius="20px" />
          <Skeleton height="24px" width="60%" borderRadius="12px" />
        </div>
        <div className="flex gap-2 w-fit">
          <Skeleton height="44px" width="120px" borderRadius="14px" />
          <Skeleton height="44px" width="120px" borderRadius="14px" />
        </div>
        <div className="grid gap-6">
          <Skeleton height="150px" borderRadius="40px" />
          <Skeleton height="150px" borderRadius="40px" />
          <Skeleton height="150px" borderRadius="40px" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Eğitim Takvimim</h1>
          <p className="text-gray-500 font-medium mt-2 text-lg">Aldığınız dersleri yönetin ve yaklaşan eğitimlerinize katılın.</p>
        </div>
      </header>

      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
        <TabButton $active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>Yaklaşanlar</TabButton>
        <TabButton $active={activeTab === "past"} onClick={() => setActiveTab("past")}>Geçmiş Dersler</TabButton>
      </div>

      <div className="grid gap-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-200" />
             </div>
             <p className="text-gray-400 font-bold text-lg">
               {activeTab === "past" ? "Tamamlanmış ders bulunamadı." : "Yaklaşan dersiniz bulunmuyor."}
             </p>
             <Button variant="link" className="text-green-600 font-black mt-2" onClick={() => navigate("/tutors")}>Hemen bir hoca bul →</Button>
          </div>
        ) : (
          filteredBookings.map((booking, i) => (
            <LessonCard key={booking.id} $index={i}>
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="relative flex-shrink-0">
                  <img 
                    src={booking.tutorAvatarUrl || booking.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.tutorName)}&background=2d79f3&color=fff`} 
                    alt={booking.tutorName} 
                    className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-lg" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="font-black text-xl text-gray-900">{booking.tutorName}</h3>
                    <Badge variant="outline" className="w-fit mx-auto md:mx-0 px-3 py-1 rounded-lg border-green-100 text-green-600 font-bold text-[10px] uppercase tracking-widest bg-green-50/30">
                      {booking.lessonTitle || "Özel Ders"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-bold text-gray-400">
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl">
                      <Calendar className="w-4 h-4 text-green-500" /> 
                      {new Date(booking.startTime).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl">
                      <Clock className="w-4 h-4 text-green-500" /> 
                      {new Date(booking.startTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="flex-1 sm:flex-initial">
                    <StatusBadge $status={booking.status}>
                      {booking.status === "Approved" ? "Onaylandı" : 
                       booking.status === "Pending" ? "Onay Bekliyor" : 
                       booking.status === "Completed" ? "Tamamlandı" : "İptal Edildi"}
                    </StatusBadge>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {/* Sanal Sınıf Butonu Kaldırıldı */}
                    {booking.status === "Completed" && (
                      <div className="flex gap-2">
                        {booking.hasReview === false ? (
                          <Button 
                            className="flex-1 h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100 font-bold flex items-center gap-2"
                            onClick={() => navigate(`/student/review/${booking.bookingId || booking.id}`)}
                          >
                            <Star size={18} /> Yorum Yap
                          </Button>
                        ) : (
                          <Button variant="outline" className="flex-1 h-12 px-6 rounded-xl border-gray-100 font-bold flex items-center gap-2 bg-gray-50 text-gray-400 cursor-default" disabled>
                            <CheckCircle2 size={18} /> Yorum Yapıldı
                          </Button>
                        )}
                        <Button variant="outline" className="flex-1 h-12 px-6 rounded-xl border-gray-200 font-bold flex items-center gap-2">
                          <FileText size={18} /> Rapor
                        </Button>
                      </div>
                    )}
                    <ActionMenu>
                       <MoreHorizontal size={20} />
                    </ActionMenu>
                  </div>
                </div>
              </div>
            </LessonCard>
          ))
        )}
      </div>

      <footer className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-50 shadow-sm">
           <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><Video size={20} /></div>
           <div>
              <p className="font-black text-gray-900 text-sm">Online Dersler</p>
              <p className="text-xs text-gray-400 font-medium">Jitsi altyapısı ile kesintisiz görüşme.</p>
           </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-50 shadow-sm">
           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><CheckCircle2 size={20} /></div>
           <div>
              <p className="font-black text-gray-900 text-sm">Onaylı Eğitmenler</p>
              <p className="text-xs text-gray-400 font-medium">Sadece kimliği doğrulanmış hocalar.</p>
           </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-50 shadow-sm">
           <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><HelpCircle size={20} /></div>
           <div>
              <p className="font-black text-gray-900 text-sm">7/24 Destek</p>
              <p className="text-xs text-gray-400 font-medium">Her türlü sorununuzda yanınızdayız.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}

const TabButton = styled.button`
  padding: 10px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 800;
  transition: all 0.2s;
  ${props => props.$active ? `
    background: white;
    color: #16a34a;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  ` : `
    color: #64748b;
    &:hover { color: #16a34a; }
  `}
`;

const LessonCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 40px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 20px rgba(0,0,0,0.02);
  transition: all 0.3s;
  animation: slide-in 0.5s ease-out forwards;
  animation-delay: ${props => props.$index * 0.1}s;
  opacity: 0;

  &:hover {
    transform: translateY(-4px);
    border-color: #dbeafe;
    box-shadow: 0 20px 40px rgba(45, 121, 243, 0.08);
  }

  @keyframes slide-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const StatusBadge = styled.div`
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  ${props => props.$status === 'Approved' ? `
    background: #ecfdf5;
    color: #059669;
  ` : props.$status === 'Pending' ? `
    background: #fffbeb;
    color: #d97706;
  ` : props.$status === 'Completed' ? `
    background: #f0f9ff;
    color: #0369a1;
  ` : `
    background: #fef2f2;
    color: #dc2626;
  `}
`;

const ActionMenu = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
  &:hover {
    background: #f1f5f9;
    color: var(--text-primary);
    transform: scale(1.05);
  }
`;
