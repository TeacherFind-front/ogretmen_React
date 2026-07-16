import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { getTutors, getTutorsCount } from "@/services/tutorService";
import { getSubjectsHierarchy } from "@/services/locationService";
import { toPlainText, resolveMediaUrl } from "@/utils/helpers";
import SmartMatchWizard from "@/components/shared/SmartMatchWizard";

// ─── Renk Sabitleri ──────────────────────────────────────────────────────────
const GREEN_PRIMARY = "#16a34a"; // Koyu canlı yeşil
const GREEN_LIGHT = "#22c55e"; // Parlak yeşil
const GREEN_GLOW = "#4ade80"; // Neon glow yeşili
const DIAMOND_WHITE = "#F0FDF4"; // Elmas beyazı (çok hafif yeşil tonu)
const DIAMOND_DARK = "#DCFCE7"; // Biraz daha doygun elmas beyaz

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
    sub: "Analitik Geometri",
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
    sub: "Başlangıç Seviyesi",
    icon: Zap,
    queryValue: "Akıl ve Zeka Oyunları",
  },
];

const STATS = [
  { icon: Users, value: null, label: "Uzman Eğitmen", key: "tutors" },
  { icon: Award, value: "10.000+", label: "Başarılı Ders" },
  { icon: Star, value: "4.9", label: "Ortalama Puan" },
  { icon: CheckCircle, value: "%98", label: "Memnuniyet" },
];

// ─── Teacher Card ─────────────────────────────────────────────────────────────
function TeacherCard({ teacher }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/tutors/${teacher.id}`)}
      className="cursor-pointer rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "0 4px 24px rgba(22,163,74,0.06)",
      }}
    >
      {/* Fotoğraf */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={
            teacher.imageUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.teacherName || "Öğretmen")}&background=16a34a&color=fff&size=512`
          }
          alt={teacher.teacherName || "Eğitmen"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.teacherName || "Öğretmen")}&background=16a34a&color=fff&size=512`;
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#052e16]/70 via-transparent to-transparent" />
        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-gray-800">
            {teacher.rating
              ? typeof teacher.rating === "number"
                ? teacher.rating.toFixed(1)
                : teacher.rating
              : "0.0"}
          </span>
        </div>
      </div>

      {/* Bilgiler */}
      <div className="p-5 flex flex-col gap-2">
        <div>
          <h4
            className="font-bold text-sm leading-tight transition-colors duration-300"
            style={{ color: "var(--text-primary)" }}
          >
            {teacher.teacherName}
          </h4>
          <p className="text-xs text-green-500 font-semibold mt-0.5">
            {teacher.headline || "Eğitmen"}
          </p>
        </div>
        <p
          className="text-xs line-clamp-2 leading-relaxed transition-colors duration-300"
          style={{ color: "var(--text-muted)" }}
        >
          {teacher.about ||
            "Öğrencilerin başarısına odaklanan deneyimli eğitmenimiz."}
        </p>
        <div
          className="flex items-center justify-between mt-1 pt-3 border-t transition-colors duration-300"
          style={{ borderColor: "var(--card-border)" }}
        >
          <span
            className="text-lg font-black transition-colors duration-300"
            style={{ color: "var(--text-primary)" }}
          >
            {teacher.price} TL
            <span
              className="text-[10px] font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              /sa
            </span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tutors/${teacher.id}`);
              }}
              className="p-2 rounded-xl border text-green-500 hover:bg-green-500/10 transition-colors"
              style={{ borderColor: "var(--card-border)" }}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tutors/${teacher.id}`);
              }}
              className="p-2 rounded-xl text-white transition-colors"
              style={{
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
              }}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const waveColor = isDark ? "#213d2b" : "#f5f3ec";

  const [featuredTutors, setFeaturedTutors] = useState([]);
  const [allTutors, setAllTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("Hepsi");
  const [visibleCount, setVisibleCount] = useState(8);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [totalTutors, setTotalTutors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  const [gridCategories, setGridCategories] = useState(CATEGORIES);
  const [allCategories, setAllCategories] = useState([]);

  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const subjectRef = useRef(null);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const locationRef = useRef(null);

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
    fetchTutorsCount();
  }, []);

  const fetchTutorsCount = async () => {
    try {
      const data = await getTutorsCount();
      if (data && typeof data.count === "number") setTotalTutors(data.count);
    } catch (err) {
      console.error("Failed to fetch tutor count:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getSubjectsHierarchy();
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
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredTutors]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -344 : 344,
        behavior: "smooth",
      });
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedSubject) params.append("category", selectedSubject);
    let serviceType = "";
    if (selectedLocation === "online") serviceType = "1";
    else if (selectedLocation === "yuz-yuze") serviceType = "2";
    else if (selectedLocation === "her-ikisi") serviceType = "3";
    if (serviceType) params.append("serviceType", serviceType);
    navigate(`/tutors?${params.toString()}`);
  };

  const fetchTutors = async () => {
    setFeaturedLoading(true);
    setAllLoading(true);
    try {
      const featuredResponse = await getTutors({ page: 1, pageSize: 6 });
      const parseTutorsList = (items) => (items || []).map((tutor) => {
        const name = tutor.teacherName || tutor.name || "Öğretmen";
        const imageUrl =
          tutor.photos?.find((p) => p.isMain)?.photoUrl ||
          tutor.photos?.[0]?.photoUrl ||
          tutor.photoUrl ||
          tutor.profileImageUrl ||
          tutor.avatarUrl;
        const resolvedImg = imageUrl
          ? resolveMediaUrl(imageUrl)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=512`;
        const plainAbout = toPlainText(tutor.description || tutor.bio || "");
        const truncatedAbout =
          plainAbout.length > 120
            ? plainAbout.substring(0, 120) + "..."
            : plainAbout;

        const tutorSubjects = [];
        const rates = tutor.lessonRates?.$values || tutor.lessonRates || [];
        rates.forEach(r => {
          if (r.subjectName) tutorSubjects.push(r.subjectName.toLowerCase());
          if (r.categoryName) tutorSubjects.push(r.categoryName.toLowerCase());
        });
        if (tutor.subject) tutorSubjects.push(tutor.subject.toLowerCase());
        if (tutor.department) tutorSubjects.push(tutor.department.toLowerCase());

        return {
          ...tutor,
          id: tutor.id,
          teacherName: name,
          headline: toPlainText(tutor.title || "Eğitmen"),
          rating: tutor.rating,
          about: truncatedAbout,
          price: tutor.price,
          imageUrl: resolvedImg,
          subjectsList: tutorSubjects
        };
      });

      const parsedFeatured = parseTutorsList(featuredResponse.items);
      setFeaturedTutors(parsedFeatured);

      const allResponse = await getTutors({ page: 1, pageSize: 48 });
      const parsedAll = parseTutorsList(allResponse.items);
      setAllTutors(parsedAll);
      setFilteredTutors(parsedAll);
    } catch (err) {
      console.error("Tutors fetch failed", err);
    } finally {
      setFeaturedLoading(false);
      setAllLoading(false);
    }
  };

  const handleCategoryFilter = (cat) => {
    setSelectedSubCategory(cat);
    setVisibleCount(8); // Limit sıfırlansın
    if (cat === "Hepsi") {
      setFilteredTutors(allTutors);
    } else {
      const lowerCat = cat.toLowerCase();
      const filtered = allTutors.filter(tutor => {
        return tutor.subjectsList?.some(s => s.includes(lowerCat)) || 
               tutor.headline?.toLowerCase().includes(lowerCat) ||
               tutor.about?.toLowerCase().includes(lowerCat);
      });
      setFilteredTutors(filtered);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-300"
      style={{ background: "var(--page-bg)" }}
    >
      {/* ══════════ HERO SECTION ══════════ */}
      <section
        className="relative px-6"
        style={{
          background:
            "linear-gradient(145deg, #052e16 0%, #0d4a28 30%, #15803d 70%, #16a34a 100%)",
          paddingTop: "100px",
          paddingBottom: "140px",
        }}
      >
        {/* Dekoratif mesh nokta deseni */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Sağ üst glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(74,222,128,0.18), transparent 65%)",
            transform: "translate(200px, -200px)",
          }}
        />
        {/* Sol alt glow */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(22,163,74,0.2), transparent 65%)",
            transform: "translate(-180px, 60px)",
          }}
        />
        {/* Alt wave geçişi */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ lineHeight: 0, bottom: "-1px" }}
        >
          <svg
            viewBox="0 0 1440 90"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "90px" }}
          >
            <path
              d="M0,40 C360,90 1080,0 1440,55 L1440,90 L0,90 Z"
              fill={waveColor}
            />
          </svg>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* SOL KOLON */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Rozet */}
              <div
                className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-7 font-bold text-xs tracking-widest uppercase"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  backdropFilter: "blur(10px)",
                  color: "#f0fdf4",
                }}
              >
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: "#bbf7d0" }}
                />
                ALANINDA UZMAN{" "}
                {totalTutors > 0 ? totalTutors.toLocaleString("tr-TR") : "..."}{" "}
                EĞİTMEN
              </div>

              {/* Başlık */}
              <h1
                className="font-extrabold mb-5 leading-[1.15]"
                style={{
                  fontSize: "clamp(15px,2.4vw,28px)",
                  color: "#f0fdf4",
                  letterSpacing: "-0.02em",
                }}
              >
                Özel Ders{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #ffffff, #bbf7d0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  VIP Kalitesiyle
                </span>
                <br className="hidden lg:block" />
                Alanında Uzman
                <br className="hidden lg:block" />
                <span style={{ color: "#4ade80" }}>Eğitmenlerden</span> Ders
                Alın
              </h1>

              {/* Açıklama */}
              <p
                className="mb-8 leading-relaxed max-w-lg"
                style={{ fontSize: "15px", color: "#dcfce7" }}
              >
                Kişiye özel eğitim planlarıyla hedeflerinize daha hızlı ulaşın.
                Online ya da yüz yüze, Türkiye'nin en iyi eğitmenleri burada.
              </p>

              {/* Mini istatistikler */}
              <div className="flex items-center gap-6 mb-6">
                {[
                  {
                    val: totalTutors > 0 ? `${totalTutors}+` : "...",
                    lbl: "Eğitmen",
                  },
                  { val: "4.9★", lbl: "Ortalama" },
                  { val: "%98", lbl: "Memnuniyet" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="font-black text-xl"
                      style={{ color: "#4ade80" }}
                    >
                      {s.val}
                    </div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: "#86efac" }}
                    >
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>

              {/* Akıllı Eşleştirme Butonu */}
              <button
                onClick={() => setSmartMatchOpen(true)}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-100"
                style={{
                  background: "rgba(74,222,128,0.15)",
                  border: "1.5px solid rgba(74,222,128,0.4)",
                  backdropFilter: "blur(8px)",
                  color: "#bbf7d0",
                  boxShadow: "0 4px 20px rgba(74,222,128,0.12)",
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#4ade80" }} />
                ✨ Akıllı Eşleştirme ile Eğitmen Bul
                <ArrowRight className="w-4 h-4" style={{ color: "#4ade80" }} />
              </button>
            </div>

            {/* SAĞ KOLON - Fotoğraf */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-md w-full">
                {/* Glow efekti */}
                <div
                  className="absolute -inset-2 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-700"
                  style={{
                    background: "linear-gradient(135deg, #4ade80, #16a34a)",
                  }}
                />
                {/* Kart */}
                <div
                  className="relative rounded-3xl overflow-hidden p-[3px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(74,222,128,0.6), rgba(22,163,74,0.3))",
                  }}
                >
                  <div
                    className="rounded-[22px] overflow-hidden"
                    style={{
                      background: "rgba(5,46,22,0.5)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <img
                      src="/ders.png"
                      alt="Öğretmen ve Öğrenci Özel Ders"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ height: "280px" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>
                </div>

                {/* Floating badge */}
                <div
                  className="absolute -bottom-3 -left-3 rounded-2xl px-4 py-3 shadow-xl"
                  style={{ background: "white", border: "2px solid #dcfce7" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg,#16a34a,#22c55e)",
                      }}
                    >
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p
                        className="text-[10px] font-bold"
                        style={{ color: "#16a34a" }}
                      >
                        UZMAN EĞİTİM
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Online & Yüz Yüze
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ARAMA ÇUBUĞU */}
          <div className="mt-12 relative z-30">
            <div
              className="rounded-[2rem] p-2 flex flex-col md:flex-row items-center w-full max-w-4xl mx-auto gap-2"
              style={{
                background: "var(--card-bg)",
                boxShadow:
                  "0 32px 80px rgba(5,46,22,0.45), 0 0 0 1px rgba(74,222,128,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Ders Seçin */}
              <div
                className="flex-[1.2] flex items-center gap-3 px-5 py-3 w-full border-b md:border-b-0 md:border-r relative"
                style={{ borderColor: "var(--card-border)" }}
                ref={subjectRef}
              >
                <BookOpen
                  className="w-5 h-5 shrink-0"
                  style={{ color: subjectFocused ? "#16a34a" : "var(--text-muted)" }}
                />
                <div className="text-left flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
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
                    className="w-full bg-transparent font-semibold focus:outline-none text-sm placeholder:opacity-50"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>
                {subjectOpen && (
                  <div
                    className="absolute top-full left-0 mt-3 min-w-full md:min-w-[320px] rounded-2xl shadow-2xl border z-50 overflow-hidden"
                    style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="max-h-72 overflow-y-auto">
                      {filteredSubjects.length === 0 ? (
                        <div className="px-5 py-4 text-sm text-center" style={{ color: "var(--text-muted)" }}>
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
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-left transition-colors border-b last:border-0 hover:bg-[rgba(22,163,74,0.05)]"
                            style={{
                              borderColor: "var(--card-border)",
                              color: selectedSubject === s ? "#16a34a" : "var(--text-primary)",
                              background: selectedSubject === s ? "var(--section-alt)" : "transparent"
                            }}
                          >
                            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                            {s}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ders Nerede */}
              <div
                className="flex-1 flex items-center gap-3 px-5 py-3 w-full relative"
                ref={locationRef}
              >
                <MapPin
                  className="w-5 h-5 shrink-0"
                  style={{ color: locationFocused ? "#16a34a" : "var(--text-muted)" }}
                />
                <div className="text-left flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    DERS NEREDE
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationOpen((o) => !o);
                      setLocationFocused(true);
                    }}
                    className="w-full bg-transparent text-left font-semibold focus:outline-none text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {selectedLocationLabel}
                  </button>
                </div>
                {locationOpen && (
                  <div
                    className="absolute top-full left-0 mt-3 min-w-full md:min-w-[320px] rounded-2xl shadow-2xl border z-50 overflow-hidden"
                    style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="max-h-72 overflow-y-auto">
                      {LOCATION_OPTIONS.filter((o) => o.value !== "").map(
                        (opt) => (
                          <button
                            key={opt.value}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSelectedLocation(opt.value);
                              setLocationOpen(false);
                              setLocationFocused(false);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-left transition-colors border-b last:border-0 hover:bg-[rgba(22,163,74,0.05)]"
                            style={{
                              borderColor: "var(--card-border)",
                              color: selectedLocation === opt.value ? "#16a34a" : "var(--text-primary)",
                              background: selectedLocation === opt.value ? "var(--section-alt)" : "transparent"
                            }}
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                            {opt.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ara Butonu */}
              <button
                onClick={handleSearch}
                className="p-4 md:px-8 rounded-full text-white font-bold shrink-0 w-full md:w-auto flex justify-center items-center gap-2 mt-2 md:mt-0 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-100"
                style={{
                  background:
                    "linear-gradient(135deg, #15803d, #16a34a, #22c55e)",
                  boxShadow: "0 8px 24px rgba(22,163,74,0.4)",
                }}
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline text-sm">Ara</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SMART MATCH WIZARD MODAL ══════════ */}
      <SmartMatchWizard
        open={smartMatchOpen}
        onClose={() => setSmartMatchOpen(false)}
        categories={allCategories}
      />

      {/* ══════════ KATEORİ GRID ══════════ */}
      <section
        className="py-10 px-6 transition-colors duration-300"
        style={{ background: "var(--page-bg)" }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6 px-1">
            <div>
              <h2
                className="text-xl font-extrabold transition-colors duration-300"
                style={{ color: "var(--text-primary)" }}
              >
                Popüler Kategoriler
              </h2>
              <p className="text-sm" style={{ color: "#16a34a" }}>
                İlgilendiğin alana göre seç
              </p>
            </div>
            <Link
              to="/tutors"
              className="flex items-center gap-1 text-sm font-bold transition-colors hover:opacity-80"
              style={{ color: "#16a34a" }}
            >
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

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
                  className="p-4 rounded-2xl flex flex-col items-start gap-3 cursor-pointer transition-all duration-300 hover:scale-105"
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(135deg, #15803d, #16a34a)",
                          boxShadow: "0 12px 32px rgba(22,163,74,0.4)",
                          border: "1px solid transparent",
                        }
                      : {
                          background: "var(--card-bg)",
                          border: "1px solid var(--card-border)",
                          boxShadow: "0 2px 8px rgba(22,163,74,0.06)",
                        }
                  }
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={
                      isActive
                        ? {
                            background: "rgba(255,255,255,0.2)",
                            color: "white",
                          }
                        : { background: "#f0fdf4", color: "#16a34a" }
                    }
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className="font-bold text-sm leading-tight"
                      style={{
                        color: isActive ? "white" : "var(--text-primary)",
                      }}
                    >
                      {cat.label}
                    </h3>
                    <p
                      className="text-[9px] mt-0.5 leading-tight"
                      style={{
                        color: isActive ? "rgba(255,255,255,0.75)" : "#6b7280",
                      }}
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

      {/* ══════════ ÖĞRETMENLER (SLIDER) ══════════ */}
      <section
        className="py-14 px-6 transition-colors duration-300"
        style={{ background: "var(--card-bg)" }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 px-1">
            <div>
              <h2
                className="text-2xl font-extrabold tracking-tight transition-colors duration-300"
                style={{ color: "var(--text-primary)" }}
              >
                Öne Çıkan Eğitmenler
              </h2>
              <p className="text-sm mt-1" style={{ color: "#16a34a" }}>
                En çok tercih edilen uzmanlarımız
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="p-2.5 rounded-xl border transition-all hover:scale-105"
                  style={{
                    background: "#f0fdf4",
                    borderColor: "#dcfce7",
                    color: "#16a34a",
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2.5 rounded-xl border transition-all hover:scale-105"
                  style={{
                    background: "#f0fdf4",
                    borderColor: "#dcfce7",
                    color: "#16a34a",
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <Link
                to="/tutors"
                className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:shadow-md"
                style={{
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(22,163,74,0.25)",
                }}
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
            {featuredLoading ? (
              [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl h-[380px] w-[280px] md:w-[300px] shrink-0 animate-pulse snap-center"
                  style={{
                    background: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
                  }}
                />
              ))
            ) : featuredTutors.length > 0 ? (
              featuredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="w-[280px] md:w-[300px] shrink-0 snap-center"
                >
                  <TeacherCard teacher={tutor} />
                </div>
              ))
            ) : (
              <div className="w-full py-16 text-center">
                <p style={{ color: "#16a34a" }} className="font-medium">
                  Henüz eğitmen bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ DERS İLANLARI (GRID + FİLTRE) ══════════ */}
      <section
        className="py-16 px-6 transition-colors duration-300 border-t"
        style={{ background: "var(--section-alt)", borderColor: "var(--card-border)" }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Ders İlanları
            </h2>
            <p className="text-sm mt-2" style={{ color: "#16a34a" }}>
              İstediğiniz branşta uzman eğitmenleri süzün ve hızlıca ders talebi oluşturun
            </p>

            {/* Kategori / Branş Filtreleme Butonları */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {["Hepsi", "Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "İngilizce", "Almanca", "Yazılım"].map((cat) => {
                const isActive = selectedSubCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryFilter(cat)}
                    className="px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 border"
                    style={{
                      background: isActive ? "linear-gradient(135deg, #16a34a, #22c55e)" : "var(--card-bg)",
                      color: isActive ? "white" : "var(--text-primary)",
                      borderColor: isActive ? "#16a34a" : "var(--card-border)",
                      boxShadow: isActive ? "0 4px 12px rgba(22,163,74,0.2)" : "none"
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* İlanlar Grid Düzeni */}
          {allLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl h-[340px] animate-pulse"
                  style={{ background: "linear-gradient(135deg, #dcfce7, #f0fdf4)" }}
                />
              ))}
            </div>
          ) : filteredTutors.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredTutors.slice(0, visibleCount).map((tutor) => (
                  <div key={tutor.id} className="transition-all duration-300 hover:-translate-y-1">
                    <TeacherCard teacher={tutor} />
                  </div>
                ))}
              </div>

              {/* Daha Fazla Göster Butonu */}
              {filteredTutors.length > visibleCount && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="px-8 py-3 rounded-2xl text-sm font-extrabold transition-all duration-300 shadow hover:shadow-lg border"
                    style={{
                      background: "linear-gradient(135deg, #16a34a, #22c55e)",
                      color: "white",
                      borderColor: "#16a34a",
                      boxShadow: "0 4px 16px rgba(22,163,74,0.2)"
                    }}
                  >
                    Daha Fazla Göster
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl border" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <p style={{ color: "#16a34a" }} className="font-semibold text-base">
                Seçilen branşta henüz ders ilanı bulunmamaktadır.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ NEDEN BİZ? ══════════ */}
      <section
        className="py-16 px-6 transition-colors duration-300"
        style={{ background: "var(--section-alt)" }}
      >
        <div className="container mx-auto max-w-5xl text-center">
          <h2
            className="text-3xl font-extrabold mb-3"
            style={{ color: "#052e16" }}
          >
            Neden Özel Ders VIP?
          </h2>
          <p className="mb-12" style={{ color: "#16a34a", fontSize: "15px" }}>
            Alanında uzman eğitmenlerle fark yaratın
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Onaylı Eğitmenler",
                desc: "Her eğitmen deneyim ve uzmanlık belgesiyle alanında doğrulanmıştır.",
              },
              {
                icon: Zap,
                title: "Anında Eşleşme",
                desc: "Branşınıza uygun eğitmeni saniyeler içinde bulun ve ders ayarlayın.",
              },
              {
                icon: CheckCircle,
                title: "Garanti Memnuniyet",
                desc: "İlk dersten memnun kalmadıysanız ücret iadesi alabilirsiniz.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 4px 16px rgba(22,163,74,0.06)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                      background: "linear-gradient(135deg, #16a34a, #22c55e)",
                      boxShadow: "0 8px 24px rgba(22,163,74,0.35)",
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3
                    className="font-bold text-base mb-2 transition-colors duration-300"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed transition-colors duration-300"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ CTA SECTION ══════════ */}
      <section
        className="py-20 px-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #052e16, #14532d, #15803d)",
        }}
      >
        {/* Dekoratif glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(74,222,128,0.15), transparent)",
          }}
        />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider"
            style={{
              background: "rgba(74,222,128,0.15)",
              border: "1px solid rgba(74,222,128,0.3)",
              color: "#4ade80",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hemen Başlayın
          </div>
          <h2
            className="text-4xl font-extrabold mb-5 leading-tight"
            style={{ color: "#f0fdf4" }}
          >
            Öğrenmeye <span style={{ color: "#4ade80" }}>Bugün</span> Başlayın
          </h2>
          <p
            className="mb-10 leading-relaxed"
            style={{ color: "#86efac", fontSize: "16px" }}
          >
            Türkiye'nin en başarılı öğretmenlerinden kişiselleştirilmiş dersler
            alarak hedeflerinize bir adım daha yaklaşın.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/tutors")}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                color: "white",
                boxShadow: "0 8px 32px rgba(22,163,74,0.5)",
              }}
            >
              <GraduationCap className="w-5 h-5" /> Öğretmen Bul
            </button>
            <button
              onClick={() => navigate("/sss")}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#f0fdf4",
                border: "1.5px solid rgba(74,222,128,0.35)",
              }}
            >
              Nasıl Çalışır? <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
