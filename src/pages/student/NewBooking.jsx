import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { getTutorById } from "@/services/tutorService";
import { createBooking } from "@/services/bookingService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiFetch } from "@/services/api";
import toast from "react-hot-toast";

export default function NewBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tutorId = searchParams.get("tutorId");

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [timeError, setTimeError] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    if (!tutorId) {
      navigate("/tutors");
      return;
    }

    const loadTutor = async () => {
      try {
        const data = await getTutorById(tutorId);
        setTutor(data);
        if (data.listings?.length > 0) {
          setSelectedListing(data.listings[0]);
        }
      } catch (err) {
        setError("Eğitmen bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    loadTutor();
  }, [tutorId]);

  // Fetch occupied slots from backend
  useEffect(() => {
    const fetchOccupied = async () => {
      if (!selectedListing || !selectedDate) return;
      
      // Geçersiz veya tamamlanmamış (0005, 0055 vb.) yılları sorgulamayı engelle (SQL Server 500 hatası almamak için)
      const year = parseInt(selectedDate.split("-")[0], 10);
      if (isNaN(year) || year < 2020) return;

      try {
        const from = `${selectedDate}T00:00:00Z`;
        const to = `${selectedDate}T23:59:59Z`;
        const response = await apiFetch(
          `/api/bookings/occupied?teacherListingId=${selectedListing.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        );
        if (response && response.ok) {
          const data = await response.json();
          setOccupiedSlots(data.$values || data || []);
        } else {
          const errData = await response.json().catch(() => ({}));
          toast.error(errData.message || "Dolu saatler yüklenemedi.");
        }
      } catch (err) {
        console.error("Müsait olmayan saatler yüklenemedi:", err);
      }
    };
    fetchOccupied();
  }, [selectedListing, selectedDate]);

  const isPastDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    const selected = new Date(`${dateStr}T${timeStr}`);
    return selected < new Date();
  };

  const isTimeOccupied = (timeStr) => {
    if (!selectedDate || !timeStr || !selectedListing) return false;
    const start = new Date(`${selectedDate}T${timeStr}`);
    const duration = selectedListing.lessonDuration || 60;
    const end = new Date(start.getTime() + duration * 60000);

    return occupiedSlots.some(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      // Check overlap: (start < slotEnd) && (end > slotStart)
      return (start < slotEnd) && (end > slotStart);
    });
  };

  const handleTimeChange = (timeValue) => {
    setSelectedTime(timeValue);
    if (selectedDate && timeValue) {
      if (isPastDateTime(selectedDate, timeValue)) {
        setTimeError("Geçmiş bir tarih/saat seçemezsiniz.");
      } else if (isTimeOccupied(timeValue)) {
        setTimeError("Bu saat aralığı doludur. Lütfen başka bir saat seçin.");
      } else {
        setTimeError("");
      }
    } else {
      setTimeError("");
    }
  };

  const handleDateChange = (dateValue) => {
    setSelectedDate(dateValue);
    setSelectedTime("");
    setTimeError("");
    
    if (dateValue) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (dateValue < todayStr) {
        setDateError("Bugünden daha geçmiş bir tarih seçemezsiniz.");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedListing || !selectedDate || !selectedTime) return;

    if (dateError) {
      setError(dateError);
      return;
    }

    if (timeError) {
      setError(timeError);
      return;
    }

    if (isPastDateTime(selectedDate, selectedTime)) {
      setError("Geçmiş bir tarih/saat seçemezsiniz.");
      return;
    }

    if (isTimeOccupied(selectedTime)) {
      setError("Seçilen saat aralığı doludur. Lütfen başka bir saat seçin.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create ISO strings
      const start = new Date(`${selectedDate}T${selectedTime}`);
      const end = new Date(start.getTime() + (selectedListing.lessonDuration || 60) * 60000);

      await createBooking({
        teacherListingId: selectedListing.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        studentNote: studentNote.trim(),
        source: 1 // Site
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Rezervasyon oluşturulurken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Rezervasyon Paneli Hazırlanıyor</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-emerald-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Sparkles className="w-40 h-40 text-emerald-500" />
          </div>
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Talebiniz hocaya iletildi</h1>
          <p className="text-gray-500 text-lg font-medium mb-10">
            Ders talebiniz başarıyla oluşturuldu ve <span className="text-gray-900 font-black">{tutor.teacherName}</span> hocamıza gönderildi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold shadow-xl shadow-emerald-200" onClick={() => navigate("/student/lessons")}>
              Derslerime Git
            </Button>
            <Button 
              variant="outline" 
              className="h-14 px-10 rounded-2xl font-bold border-2" 
              onClick={() => {
                const targetId = tutor?.tutorUserId || tutor?.teacherUserId;
                if (targetId) {
                  navigate(`/student/messages?userId=${targetId}`);
                } else {
                  toast.error("Öğretmen kullanıcı bilgisi bulunamadı.");
                }
              }}
            >
              Hocaya Mesaj At
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-6 mb-12">
        <button onClick={() => navigate(-1)} className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-100 transition-all shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ders Rezervasyonu</h1>
          <p className="text-gray-500 font-medium">Hocanızla ders saatinizi planlayın.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Selection Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Listing Selection */}
              <section>
                <SectionTitle><Badge className="bg-green-100 text-green-600 border-none mr-3">1</Badge> Branş Seçin</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {tutor.listings?.map(listing => (
                    <SelectionCard 
                      key={listing.id} 
                      $active={selectedListing?.id === listing.id}
                      onClick={() => setSelectedListing(listing)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                          <Badge variant="outline" className="text-[10px] p-0 border-none font-black">{listing.lessonDuration} DK</Badge>
                        </div>
                        {selectedListing?.id === listing.id && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      </div>
                      <h4 className="font-black text-gray-900">{listing.title}</h4>
                      <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">{listing.category} / {listing.subCategory}</p>
                      <p className="text-xl font-black text-green-600 mt-4">₺{listing.price}</p>
                    </SelectionCard>
                  ))}
                </div>
              </section>

              {/* Date & Time Selection */}
              <section>
                <SectionTitle><Badge className="bg-green-100 text-green-600 border-none mr-3">2</Badge> Tarih ve Saat</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormGroup>
                    <label><CalendarIcon className="w-4 h-4 inline mr-2 text-green-500" /> Tarih Seçin</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                    />
                    {dateError && (
                      <span className="text-xs text-red-500 font-bold mt-1">
                        {dateError}
                      </span>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <label><Clock className="w-4 h-4 inline mr-2 text-green-500" /> Saat Seçin</label>
                    <input 
                      type="time" 
                      value={selectedTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      required
                    />
                    {timeError && (
                      <span className="text-xs text-red-500 font-bold mt-1">
                        {timeError}
                      </span>
                    )}
                  </FormGroup>
                </div>
              </section>

              {/* Student Note */}
              <section>
                <SectionTitle><Badge className="bg-green-100 text-green-600 border-none mr-3">3</Badge> Hocaya Not (Opsiyonel)</SectionTitle>
                <FormGroup className="mt-6">
                  <textarea 
                    rows="4" 
                    placeholder="Ders hakkında sormak istediğiniz veya hocanızın bilmesini istediğiniz detaylar..."
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    maxLength={500}
                    className="resize-none"
                  ></textarea>
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold mt-1">
                    <span>{timeError ? <span className="text-red-500">{timeError}</span> : ""}</span>
                    <span>{studentNote.length}/500 Karakter</span>
                  </div>
                </FormGroup>
              </section>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 font-black text-lg"
                disabled={submitting || !selectedListing || !selectedDate || !selectedTime || !!timeError}
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Rezervasyonu Onaya Gönder"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Summary Sidebar */}
        <aside className="space-y-6">
          <Card className="p-8 border-none shadow-2xl shadow-green-900/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
            <h3 className="text-xl font-black text-gray-900 mb-8 relative z-10">Özet Bilgiler</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <img 
                  src={tutor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.teacherName)}&background=2d79f3&color=fff`} 
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                  alt="Tutor"
                />
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">EĞİTMEN</p>
                  <p className="font-black text-gray-900">{tutor.teacherName}</p>
                </div>
              </div>

              <hr className="border-gray-50" />

              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">SEÇİLEN DERS</p>
                {selectedListing ? (
                  <div className="bg-green-50/50 p-4 rounded-2xl border border-green-50">
                    <p className="font-black text-gray-900 text-sm">{selectedListing.title}</p>
                    <p className="text-xs text-green-600 font-bold mt-1">{selectedListing.lessonDuration} Dakika</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Henüz bir branş seçilmedi.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">TARİH & SAAT</p>
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <CalendarIcon size={16} className="text-green-500" /> 
                      {selectedDate || "Tarih Seçilmedi"}
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <Clock size={16} className="text-green-500" /> 
                      {selectedTime || "Saat Seçilmedi"}
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <div className="flex justify-between items-end">
                   <span className="text-sm font-black text-gray-900">Toplam Ücret</span>
                   <span className="text-2xl font-black text-green-600">₺{selectedListing?.price || "0"}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="text-green-400" />
                <h4 className="font-black">Destek mi lazım?</h4>
             </div>
             <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Rezervasyon süreci hakkında bir sorunuz varsa veya yardıma ihtiyacınız olursa bizimle iletişime geçebilirsiniz.
             </p>
             <Button variant="link" className="text-green-400 font-black p-0 mt-4 h-auto">Yardım merkezine git <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const Card = styled.div`
  background: white;
  border-radius: 32px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.02);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  display: flex;
  align-items: center;
`;

const SelectionCard = styled.div`
  padding: 24px;
  border-radius: 24px;
  border: 2px solid ${props => props.$active ? '#16a34a' : '#f8fafc'};
  background: ${props => props.$active ? '#f3f7ff' : '#f8fafc'};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #16a34a;
    transform: translateY(-2px);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-size: 13px;
    font-weight: 800;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  input, textarea, select {
    padding: 16px 20px;
    border-radius: 18px;
    border: 2px solid #f1f5f9;
    background: #f8fafc;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    width: 100%;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #16a34a;
      background: white;
      box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.05);
    }
  }
`;
