import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Star,
  ChevronRight,
  Search,
  Code,
  FlaskConical,
  Languages,
  Calculator,
  Music,
  GraduationCap,
  Play,
  MessageCircle,
  Calendar,
  ChevronLeft,
  BookOpen,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getTutors } from "@/services/tutorService";

// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "Matematik",
    label: "Matematik",
    sub: "Bilgisayarlı (TYT/AYT)",
    icon: Calculator,
    color: "bg-blue-900",
    textColor: "text-white",
  },
  {
    id: "Fen Bilimleri",
    label: "Fen Bilimleri",
    sub: "Rasyonel Fizik/Açık lise",
    icon: FlaskConical,
    color: "bg-white",
    textColor: "text-gray-800",
  },
  {
    id: "Yazılım",
    label: "Yazılım & Kodlama",
    sub: "Vector & Seans Kodlamanız",
    icon: Code,
    color: "bg-white",
    textColor: "text-gray-800",
  },
  {
    id: "Dil",
    label: "Dil Kursları",
    sub: "Seviye Tespit Sınavları ve Kurslar",
    icon: Languages,
    color: "bg-white",
    textColor: "text-gray-800",
  },
  {
    id: "Sinav",
    label: "YKS/LGS Hazırlık",
    sub: "LGS, YGS ve TYT Hazırlık",
    icon: GraduationCap,
    color: "bg-white",
    textColor: "text-gray-800",
  },
  {
    id: "Muzik",
    label: "Müzik & Sanat",
    sub: "Bateri, Piyano vb. İnceleme ve Kurslar",
    icon: Music,
    color: "bg-white",
    textColor: "text-gray-800",
  },
];

function TeacherCard({ teacher }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group transition-all hover:shadow-xl">
      {/* Visuals Grid */}
      <div className="flex h-40 gap-1 p-1">
        <div className="flex-[2] relative rounded-xl overflow-hidden">
          <img
            src={
              teacher.imageUrl ||
              "https://images.unsplash.com/photo-1544717297-fa154da09f9b?auto=format&fit=crop&w=800&q=80"
            }
            alt={teacher.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex-1 rounded-xl overflow-hidden">
            <img src="/teachers.png" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 rounded-xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1580894732230-28e193399e8c?auto=format&fit=crop&w=400&q=80"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {teacher.teacherName}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              ({teacher.headline || "Eğitmen"})
            </p>
          </div>
          <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-bold text-yellow-700">
              {teacher.rating || "4.8"}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
          {teacher.about ||
            "Eğitimde 10 yılı aşkın tecrübe ile öğrencilerin başarısına odaklanıyoruz..."}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-base font-black text-gray-900">
              {teacher.price} TL
              <span className="text-[10px] font-normal text-gray-400">/sa</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            <button className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg bg-[#009688] text-white hover:bg-[#00796b] transition-colors shadow-md shadow-teal-100">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainerRef.current.scrollBy({
            left: 344,
            behavior: "smooth",
          });
        }
      }
    }, 4000); // 4 saniyede bir otomatik kaydırma
    return () => clearInterval(interval);
  }, [tutors]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -344 : 344;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await getTutors({ page: 1, pageSize: 6 });

      const realTutors = (response.items || []).map((tutor) => ({
        id: tutor.id,
        teacherName: tutor.teacherName,
        headline: tutor.title,
        rating: tutor.rating,
        about: tutor.description,
        price: tutor.price,
        imageUrl:
          tutor.photos && tutor.photos.length > 0
            ? tutor.photos[0].url
            : "https://images.unsplash.com/photo-1544717297-fa154da09f9b?auto=format&fit=crop&w=800&q=80",
      }));

      setTutors(realTutors);
    } catch (err) {
      console.error("Tutors fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-[#5c75dd] to-[#8a9eed] pt-24 pb-28 px-6 text-center text-white">
        <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full mb-10 border border-white/20">
            <GraduationCap className="w-4 h-4 text-white" />
            <span className="text-xs font-bold tracking-wide uppercase text-white">
              ALANINDA UZMAN 112.637 EĞİTMEN
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold mb-14 leading-[1.2]">
            En İyi Öğretmenlerden{" "}
            <span className="text-[#d1d8f5] font-medium">Online veya</span>{" "}
            <br />
            <span className="text-[#d1d8f5] font-medium">Yüz Yüze</span> Dersler
            Alın
          </h1>

          {/* Search Bar */}
          <div className="bg-white rounded-[2rem] md:rounded-full p-2 flex flex-col md:flex-row items-center w-full max-w-4xl shadow-2xl mx-auto gap-2">
            {/* Ders Seçin */}
            <div className="flex-[1.2] flex items-center gap-4 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-100">
              <BookOpen className="w-5 h-5 text-gray-500" />
              <div className="text-left flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  DERS SEÇİN
                </p>
                <select className="w-full bg-transparent text-gray-800 font-semibold focus:outline-none appearance-none cursor-pointer">
                  <option value="">Seçiniz</option>
                  <option value="matematik">Matematik</option>
                  <option value="ingilizce">İngilizce</option>
                  <option value="yazilim">Yazılım</option>
                </select>
              </div>
            </div>

            {/* Ders Nerede Yapılsın */}
            <div className="flex-1 flex items-center gap-4 px-6 py-3 w-full">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div className="text-left flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  DERS NEREDE YAPILSIN
                </p>
                <select className="w-full bg-transparent text-gray-800 font-semibold focus:outline-none appearance-none cursor-pointer">
                  <option value="">Seçiniz</option>
                  <option value="online">Online</option>
                  <option value="yuz-yuze">Yüz Yüze</option>
                </select>
              </div>
            </div>

            {/* Ara Butonu */}
            <button className="bg-[#001040] text-white p-4 md:px-8 rounded-full hover:bg-blue-900 transition-colors shrink-0 w-full md:w-auto flex justify-center items-center mt-2 md:mt-0">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className={`${cat.color} ${cat.textColor} p-4 rounded-[24px] border border-gray-100 flex flex-col items-start gap-3 transition-all hover:scale-105 hover:shadow-lg cursor-pointer group`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color === "bg-white" ? "bg-gray-50" : "bg-white/10 text-white"}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">
                      {cat.label}
                    </h3>
                    <p className={`text-[9px] mt-0.5 opacity-60 leading-tight`}>
                      {cat.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Teachers ── */}
      <section className="py-12 px-6 bg-[#f8fafc] rounded-t-[40px]">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Öne Çıkan Öğretmenler
            </h2>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <button
                  onClick={() => scroll("left")}
                  className="p-2 rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2 rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <Link
                to="/tutors"
                className="bg-white px-4 py-1.5 rounded-lg text-xs font-bold text-gray-600 border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Tümünü Gör
              </Link>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl h-80 w-[280px] md:w-[320px] shrink-0 animate-pulse snap-center"
                ></div>
              ))
            ) : tutors.length > 0 ? (
              tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="w-[280px] md:w-[320px] shrink-0 snap-center transition-all hover:-translate-y-1"
                >
                  <TeacherCard teacher={tutor} />
                </div>
              ))
            ) : (
              <div className="w-full py-16 text-center">
                <p className="text-gray-400">Henüz eğitmen bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Bottom Section ── */}
      <section className="py-24 px-6 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-black text-[#002e47] mb-6">
            Öğrenmeye Hemen Başlayın
          </h2>
          <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto">
            Türkiye'nin en başarılı öğretmenlerinden size özel dersler alarak
            hedeflerinize bir adım daha yaklaşın.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-[#002e47] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#003d5c] transition-all">
              Öğretmen Bul
            </button>
            <button className="bg-white text-[#002e47] border-2 border-[#002e47] px-10 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              Nasıl Çalışır?
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
