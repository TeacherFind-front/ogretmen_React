import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  getMyBookings, 
  approveBooking, 
  rejectBooking, 
  completeBooking 
} from "@/services/bookingService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Calendar, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Check,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function TutorBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data.$values || data || []);
    } catch (err) {
      console.error(err);
      toast.error("Rezervasyonlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveBooking(id);
      toast.success("Ders talebi onaylandı.");
      fetchBookings();
    } catch (error) {
      toast.error(error.message || "Onaylama başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Lütfen reddetme sebebini giriniz (Öğrenciye iletilecek):");
    if (reason === null) return;
    
    setActionLoading(id);
    try {
      await rejectBooking(id, reason);
      toast.success("Ders talebi reddedildi.");
      fetchBookings();
    } catch (error) {
      toast.error(error.message || "Reddetme başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Bu dersi tamamlandı olarak işaretlemek istediğinize emin misiniz?")) return;
    
    setActionLoading(id);
    try {
      await completeBooking(id);
      toast.success("Ders tamamlandı olarak işaretlendi.");
      fetchBookings();
    } catch (error) {
      toast.error(error.message || "İşlem başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === "upcoming") {
      return b.status === "Pending" || b.status === "Approved";
    }
    return b.status === "Completed" || b.status === "Rejected" || b.status === "Cancelled";
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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-[var(--card-bg)] p-10 rounded-[3rem] border border-gray-100 dark:border-[var(--card-border)] shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Ders Taleplerim</h1>
          <p className="text-gray-500 dark:text-[var(--text-muted)] font-medium mt-2 text-lg">Öğrencilerden gelen ders rezervasyon taleplerini inceleyin ve durumlarını yönetin.</p>
        </div>
      </header>

      <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <TabButton $active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>Yaklaşan & Bekleyenler</TabButton>
        <TabButton $active={activeTab === "past"} onClick={() => setActiveTab("past")}>Geçmiş Talepler</TabButton>
      </div>

      <div className="grid gap-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[var(--card-bg)] rounded-[3rem] border border-dashed border-gray-200 dark:border-[var(--card-border)]">
             <div className="w-20 h-20 bg-gray-50 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-200 dark:text-slate-700" />
             </div>
             <p className="text-gray-400 font-bold text-lg">
                {activeTab === "past" ? "Geçmiş talebiniz bulunamadı." : "Aktif ders talebiniz bulunmuyor."}
             </p>
          </div>
        ) : (
          filteredBookings.map((booking, i) => (
            <LessonCard key={booking.id} $index={i}>
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="relative flex-shrink-0">
                  <img 
                    src={booking.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.studentName)}&background=2d79f3&color=fff`} 
                    alt={booking.studentName} 
                    className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white dark:border-[var(--card-border)] shadow-lg" 
                  />
                  {booking.status === "Approved" && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="font-black text-xl text-gray-900 dark:text-slate-100">{booking.studentName}</h3>
                    <Badge variant="outline" className="w-fit mx-auto md:mx-0 px-3 py-1 rounded-lg border-green-100 dark:border-green-900 text-green-600 dark:text-green-400 font-bold text-[10px] uppercase tracking-widest bg-green-50/30">
                      {booking.lessonTitle || "Özel Ders"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-bold text-gray-400">
                    <span className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-gray-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-green-500" /> 
                      {new Date(booking.startTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-gray-700 dark:text-slate-300">
                      <Clock className="w-4 h-4 text-green-500" /> 
                      {new Date(booking.startTime).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {booking.price && (
                      <span className="flex items-center gap-1 bg-green-50 dark:bg-green-950/20 px-3 py-1.5 rounded-xl text-green-700 dark:text-green-400 font-extrabold">
                        ₺{booking.price}
                      </span>
                    )}
                  </div>

                  {booking.studentNote && (
                    <div className="bg-white/50 dark:bg-[var(--card-bg)]/50 p-3 rounded-xl text-[13px] font-medium text-gray-600 dark:text-[var(--text-muted)] italic">
                       "{booking.studentNote}"
                    </div>
                  )}

                  {booking.status === "Rejected" && booking.tutorNote && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/50 mt-2">
                      Red Sebebi: "{booking.tutorNote}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="flex-1 sm:flex-initial">
                    <StatusBadge $status={booking.status}>
                      {booking.status === "Pending" ? "Onay Bekliyor" : 
                       booking.status === "Approved" ? "Onaylandı" : 
                       booking.status === "Rejected" ? "Reddedildi" : 
                       booking.status === "Cancelled" ? "İptal Edildi" : 
                       booking.status === "Completed" ? "Tamamlandı" : booking.status}
                    </StatusBadge>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-center">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-50 bg-white dark:bg-[var(--card-bg)] dark:text-slate-100"
                      onClick={() => navigate(`/tutor/messages?userId=${booking.studentUserId}`)}
                    >
                      <MessageCircle size={14} /> Mesaj At
                    </Button>

                    {booking.status === "Pending" && (
                      <>
                        <Button 
                          size="sm"
                          className="h-12 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                          onClick={() => handleApprove(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? <Loader2 size={14} className="animate-spin" /> : "Onayla"}
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="h-12 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                          onClick={() => handleReject(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          Reddet
                        </Button>
                      </>
                    )}

                    {booking.status === "Approved" && (
                      <Button 
                        size="sm"
                        className="h-12 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        onClick={() => handleComplete(booking.id)}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? <Loader2 size={14} className="animate-spin" /> : "Tamamlandı İşaretle"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </LessonCard>
          ))
        )}
      </div>
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
  
  .dark & {
    ${props => props.$active ? `
      background: var(--card-bg);
      color: #4ade80;
      box-shadow: none;
    ` : `
      color: #94a3b8;
      &:hover { color: #4ade80; }
    `}
  }
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

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.05);
    .dark & {
      box-shadow: none;
      border-color: #334155;
    }
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

  .dark & {
    ${props => props.$status === 'Approved' ? `
      background: #064e3b30;
      color: #34d399;
    ` : props.$status === 'Pending' ? `
      background: #78350f30;
      color: #fbbf24;
    ` : props.$status === 'Completed' ? `
      background: #0c4a6e30;
      color: #38bdf8;
    ` : `
      background: #7f1d1d30;
      color: #f87171;
    `}
  }
`;
