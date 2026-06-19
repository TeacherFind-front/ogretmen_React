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
import { getCategories } from "@/services/locationService";
import BASE_URL, { getImageUrl } from "@/services/api";
import { toPlainText, resolveMediaUrl } from "@/utils/helpers";

// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  Matematik: Calculator,
  "Fen Bilimleri": FlaskConical,
  Yazılım: Code,
  "Yabancı Dil": Languages,
  "Sınav Hazırlık": GraduationCap,
  Müzik: Music,
  İngilizce: Languages,
  "Kişisel Gelişim": Star,
  Sanat: Music,
  Spor: Play,
};

const CATEGORIES = [
  {
    id: "Türkçe",
    label: "Türkçe ve Edebiyat",
    sub: "Diksiyon (Her Seviye)",
    icon: BookOpen,
    queryValue: "Türkçe ve Edebiyat",
  },
  {
    id: "Matematik",
    label: "Matematik",
    sub: "Analitik Geometri (DGS, KPSS)",
    icon: Calculator,
    queryValue: "Matematik",
  },
  {
    id: "İngilizce",
    label: "İngilizce",
    sub: "Yabancı Dil Eğitimleri",
    icon: Languages,
    queryValue: "İngilizce",
  },
  {
    id: "Fizik",
    label: "Fizik",
    sub: "Akışkanlar Mekaniği",
    icon: FlaskConical,
    queryValue: "Fizik",
  },
  {
    id: "Almanca",
    label: "Almanca Sınavları",
    sub: "Abitur Hazırlık (Lise)",
    icon: BookOpen,
    queryValue: "Almanca Sınavları",
  },
  {
    id: "Akıl Zeka",
    label: "Akıl ve Zeka Oyunları",
    sub: "Akıl ve Zeka Oyunları (Başlangıç)",
    icon: BookOpen,
    queryValue: "Akıl ve Zeka Oyunları",
  },
];

function TeacherCard({ teacher }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tutors/${teacher.id}`)}
      className="cursor-pointer bg-white dark:bg-[#0f172a] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#1e293b] flex flex-col group transition-all hover:shadow-xl"
    >
      {/* Visuals - Tek Büyük Fotoğraf */}
      <div className="relative h-60 w-full overflow-hidden">
        <img
          src={
            teacher.imageUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.teacherName || "Öğretmen")}&background=2d79f3&color=fff&size=512`
          }
          alt={teacher.teacherName || "Eğitmen"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.teacherName || "Öğretmen")}&background=2d79f3&color=fff&size=512`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
              {teacher.teacherName}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              ({teacher.headline || "Eğitmen"})
            </p>
          </div>
          <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-bold text-yellow-700">
              {teacher.rating
                ? typeof teacher.rating === "number"
                  ? teacher.rating.toFixed(1)
                  : teacher.rating
                : "0.0"}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
          {teacher.about ||
            "Eğitimde 10 yılı aşkın tecrübe ile öğrencilerin başarısına odaklanıyoruz..."}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-[#1e293b]">
          <div className="flex flex-col">
            <span className="text-base font-black text-gray-900 dark:text-white">
              {teacher.price} TL
              <span className="text-[10px] font-normal text-gray-400">/sa</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tutors/${teacher.id}`);
              }}
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#1e293b] text-gray-400 hover:bg-blue-50 dark:hover:bg-[#334155] hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tutors/${teacher.id}`);
              }}
              className="p-1.5 rounded-lg bg-[#009688] text-white hover:bg-[#00796b] transition-colors shadow-md shadow-teal-100"
            >
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
  const [totalTutors, setTotalTutors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const scrollContainerRef = useRef(null);

  const [gridCategories, setGridCategories] = useState(CATEGORIES);
  const [allCategories, setAllCategories] = useState([]);

  // Combobox state for subject search
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const subjectRef = useRef(null);

  // Combobox state for location
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const locationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target)) {
        setSubjectOpen(false);
        setSubjectFocused(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
        setLocationFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const LOCATION_OPTIONS = [
    { value: "", label: "Hepsi" },
    { value: "online", label: "Online" },
    { value: "yuz-yuze", label: "Yüz Yüze" },
    { value: "her-ikisi", label: "Her İkisi" },
  ];

  const selectedLocationLabel =
    LOCATION_OPTIONS.find((o) => o.value === selectedLocation)?.label ||
    "Ders türü seçin...";

  const subjectOptions =
    allCategories.length > 0
      ? allCategories.map((c) => c.category)
      : ["Türkçe ve Edebiyat", "Matematik", "İngilizce", "Fizik", "Almanca"];

  const filteredSubjects = subjectOptions.filter((s) =>
    s
      .toLocaleLowerCase("tr-TR")
      .includes(subjectSearch.toLocaleLowerCase("tr-TR")),
  );

  useEffect(() => {
    fetchTutors();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setAllCategories(data);
        setGridCategories(
          data.slice(0, 6).map((c) => ({
            id: c.category,
            label: c.category,
            sub:
              c.subjects
                ?.slice(0, 2)
                .map((s) => s.name)
                .join(", ") || "Alanında Uzmanlar",
            icon: CATEGORY_ICONS[c.category] || BookOpen,
            queryValue: c.category,
          })),
        );
      }
    } catch (err) {
      console.error("Categories fetch failed", err);
    }
  };

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedSubject) {
      params.append("category", selectedSubject);
    }

    let serviceType = "";
    if (selectedLocation === "online") serviceType = "1";
    else if (selectedLocation === "yuz-yuze") serviceType = "2";
    else if (selectedLocation === "her-ikisi") serviceType = "3";

    if (serviceType) {
      params.append("serviceType", serviceType);
    }

    navigate(`/tutors?${params.toString()}`);
  };

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await getTutors({ page: 1, pageSize: 6 });

      if (response && response.totalCount !== undefined) {
        setTotalTutors(response.totalCount);
      }

      const realTutors = (response.items || []).map((tutor) => {
        const name = tutor.teacherName || tutor.name || "Öğretmen";

        // Fotoğraf seçme sırası
        const imageUrl =
          tutor.photos?.find((p) => p.isMain)?.photoUrl ||
          tutor.photos?.[0]?.photoUrl ||
          tutor.photoUrl ||
          tutor.profileImageUrl ||
          tutor.avatarUrl;

        const resolvedImg = imageUrl
          ? resolveMediaUrl(imageUrl)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d79f3&color=fff&size=512`;

        const plainAbout = toPlainText(tutor.description || tutor.bio || "");
        const truncatedAbout =
          plainAbout.length > 120
            ? plainAbout.substring(0, 120) + "..."
            : plainAbout;

        return {
          id: tutor.id,
          teacherName: name,
          headline: toPlainText(tutor.title || "Eğitmen"),
          rating: tutor.rating,
          about: truncatedAbout,
          price: tutor.price,
          imageUrl: resolvedImg,
        };
      });

      setTutors(realTutors);
    } catch (err) {
      console.error("Tutors fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-[#5c75dd] to-[#8a9eed] dark:from-[#0f1d4a] dark:to-[#070b19] pt-24 pb-28 px-6 text-center text-white transition-colors duration-300">
        <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full mb-10 border border-white/20">
            <GraduationCap className="w-4 h-4 text-white" />
            <span className="text-xs font-bold tracking-wide uppercase text-white">
              ALANINDA UZMAN{" "}
              {totalTutors > 0 ? totalTutors.toLocaleString("tr-TR") : "..."}{" "}
              EĞİTMEN
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-[54px] font-bold mb-10 md:mb-14 leading-[1.3] md:leading-[1.2]">
            Özel Ders VIP Kalitesiyle <br className="hidden sm:block" />
            Alanında Uzman Eğitmenlerden <br className="hidden sm:block" />
            <span className="text-[#d1d8f5] font-medium">
              Online veya Yüz Yüze
            </span>{" "}
            Ders Alın
          </h1>

          {/* Search Bar */}
          <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] md:rounded-full p-2 flex flex-col md:flex-row items-center w-full max-w-4xl shadow-2xl mx-auto gap-2 transition-colors duration-300">
            {/* Ders Seçin — Modern Combobox */}
            <div
              className="flex-[1.2] flex items-center gap-4 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-100 dark:border-[#334155] relative"
              ref={subjectRef}
            >
              <BookOpen
                className={`w-5 h-5 shrink-0 transition-colors ${subjectFocused ? "text-blue-500" : "text-gray-400 dark:text-blue-400"}`}
              />
              <div className="text-left flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                  DERS SEÇİN
                </p>
                <input
                  type="text"
                  value={subjectSearch || selectedSubject}
                  onChange={(e) => {
                    setSubjectSearch(e.target.value);
                    setSelectedSubject("");
                    setSubjectOpen(true);
                  }}
                  onFocus={() => {
                    setSubjectOpen(true);
                    setSubjectFocused(true);
                    setSubjectSearch("");
                  }}
                  placeholder={selectedSubject || "Ders ara..."}
                  className="w-full bg-transparent text-gray-800 dark:text-slate-100 font-semibold focus:outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Dropdown */}
              {subjectOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#334155] z-50 overflow-hidden max-h-72 overflow-y-auto animate-in">
                  {filteredSubjects.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-gray-400 text-center">
                      Sonuç bulunamadı
                    </div>
                  ) : (
                    filteredSubjects.map((s) => (
                      <button
                        key={s}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedSubject(s);
                          setSubjectSearch(s);
                          setSubjectOpen(false);
                          setSubjectFocused(false);
                        }}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-left transition-colors border-b border-gray-50 dark:border-[#334155] last:border-0 ${
                          selectedSubject === s
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "hover:bg-gray-50 dark:hover:bg-[#334155] text-gray-700 dark:text-slate-200"
                        }`}
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                        {s}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Ders Nerede Yapılsın — Modern Combobox */}
            <div
              className="flex-1 flex items-center gap-4 px-6 py-3 w-full relative"
              ref={locationRef}
            >
              <MapPin
                className={`w-5 h-5 shrink-0 transition-colors ${locationFocused ? "text-blue-500" : "text-gray-400 dark:text-blue-400"}`}
              />
              <div className="text-left flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                  DERS NEREDE YAPILSIN
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLocationOpen((o) => !o);
                    setLocationFocused(true);
                  }}
                  className="w-full bg-transparent text-left font-semibold focus:outline-none text-sm text-gray-800 dark:text-slate-100"
                >
                  {selectedLocationLabel}
                </button>
              </div>

              {/* Location Dropdown */}
              {locationOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#334155] z-50 overflow-hidden animate-in">
                  {LOCATION_OPTIONS.filter((o) => o.value !== "").map((opt) => (
                    <button
                      key={opt.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedLocation(opt.value);
                        setLocationOpen(false);
                        setLocationFocused(false);
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-left transition-colors border-b border-gray-50 dark:border-[#334155] last:border-0 ${
                        selectedLocation === opt.value
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-50 dark:hover:bg-[#334155] text-gray-700 dark:text-slate-200"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ara Butonu */}
            <button
              onClick={handleSearch}
              className="bg-[#001040] text-white p-4 md:px-8 rounded-full hover:bg-blue-900 transition-colors shrink-0 w-full md:w-auto flex justify-center items-center mt-2 md:mt-0"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {gridCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = hoveredCategory
                ? hoveredCategory === cat.id
                : cat.id === "Matematik";

              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onClick={() =>
                    navigate(
                      `/tutors?category=${encodeURIComponent(cat.queryValue)}`,
                    )
                  }
                  className={`p-3 md:p-4 rounded-[20px] md:rounded-[24px] border border-gray-100 dark:border-[#1e293b] flex flex-col items-start gap-2 md:gap-3 transition-all hover:scale-105 hover:shadow-lg cursor-pointer group ${
                    isActive
                      ? "bg-[#1e3a8a] text-white dark:bg-[#1e3a8a] dark:text-white"
                      : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-50 dark:bg-[#0f172a] text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-sm leading-tight ${isActive ? "text-white" : ""}`}
                    >
                      {cat.label}
                    </h3>
                    <p
                      className={`text-[9px] mt-0.5 leading-tight ${isActive ? "text-white/80 opacity-100" : "opacity-60"}`}
                    >
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
      <section className="py-12 px-6 bg-[#f8fafc] dark:bg-[#0b1120]/50 rounded-t-[40px] transition-colors duration-300">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Öne Çıkan Öğretmenler
            </h2>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <button
                  onClick={() => scroll("left")}
                  className="p-2 rounded-full bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-[#334155] shadow-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2 rounded-full bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-[#334155] shadow-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                </button>
              </div>
              <Link
                to="/tutors"
                className="bg-white dark:bg-[#1e293b] px-4 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-slate-300 border border-gray-100 dark:border-[#334155] shadow-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
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
                  className="bg-white rounded-2xl h-[380px] w-[280px] md:w-[320px] shrink-0 animate-pulse snap-center"
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
          <h2 className="text-4xl font-black text-[#002e47] dark:text-white mb-6">
            Öğrenmeye Hemen Başlayın
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Türkiye'nin en başarılı öğretmenlerinden size özel dersler alarak
            hedeflerinize bir adım daha yaklaşın.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/tutors")}
              className="w-full sm:w-auto bg-[#002e47] dark:bg-blue-600 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold hover:bg-[#003d5c] dark:hover:bg-blue-700 transition-all text-sm md:text-base"
            >
              Öğretmen Bul
            </button>
            <button
              onClick={() => navigate("/sss")}
              className="w-full sm:w-auto bg-white dark:bg-[#1e293b] text-[#002e47] dark:text-white border-2 border-[#002e47] dark:border-[#334155] px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-[#334155] transition-all text-sm md:text-base"
            >
              Nasıl Çalışır?
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
