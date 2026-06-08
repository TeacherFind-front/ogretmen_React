import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TutorCard } from "@/components/shared/TutorCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getTutors } from "@/services/tutorService";
import { getCities, getCategories } from "@/services/locationService";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  MapPin,
  Book,
  DollarSign,
  SortAsc,
  LayoutGrid,
} from "lucide-react";

export default function TutorsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filtre state'i - URL'den başlat
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    cityId: searchParams.get("cityId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    serviceType: searchParams.get("serviceType") || "",
    sort: searchParams.get("sort") || "newest",
    page: 1,
    pageSize: 12,
  });

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCities()
      .then(setCities)
      .catch(() => {});
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // URL parametreleri değiştiğinde state'i güncelle (Geri/İleri butonu için)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      cityId: searchParams.get("cityId") || "",
      serviceType: searchParams.get("serviceType") || "",
    }));
  }, [searchParams]);

  // Öğretmenleri yükle
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTutors({
          ...filters,
          search: filters.search || undefined,
          category: filters.category || undefined,
          cityId: filters.cityId || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          serviceType: filters.serviceType || undefined,
        });

        if (filters.page === 1) {
          setTutors(result.items || []);
        } else {
          setTutors((prev) => [...prev, ...(result.items || [])]);
        }
        setTotalCount(result.totalCount || 0);
      } catch (err) {
        setError("Öğretmenler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // URL'i güncelle
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <div className="bg-gray-50/50 dark:bg-[#0f172a] min-h-screen transition-colors duration-300">
      {/* Hero Header */}
      <div className="bg-white dark:bg-[#1e293b] border-b dark:border-[#334155] py-10 px-6 mb-8 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            Eğitmenleri Keşfedin
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl font-medium">
            Hedeflerinize ulaşmanıza yardımcı olacak binlerce uzman eğitmen
            arasından size en uygun olanı bulun.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl py-8 px-6 flex flex-col lg:flex-row gap-10">
        {/* Mobil Filtre Butonu */}
        <div className="lg:hidden flex justify-between items-center bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-100 dark:border-[#334155] shadow-sm">
          <span className="font-bold text-gray-900 dark:text-white">
            {totalCount} Eğitmen Bulundu
          </span>
          <Button
            variant="outline"
            className="rounded-xl border-gray-200"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtrele
          </Button>
        </div>

        {/* Sidebar Filters - Drawer on mobile */}
        {isMobileFilterOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-[#1e293b] transform transition-transform duration-300 overflow-y-auto lg:relative lg:translate-x-0 lg:w-72 lg:z-auto lg:bg-transparent ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="lg:sticky lg:top-28 bg-white dark:bg-[#1e293b] p-6 lg:rounded-3xl lg:border border-gray-100 dark:border-[#334155] lg:shadow-xl space-y-8 min-h-full lg:min-h-0">
            <div className="flex items-center justify-between pb-4 border-b dark:border-[#334155]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Filtreler
                </h3>
              </div>
              <Button
                variant="ghost"
                className="lg:hidden p-2"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                ✕
              </Button>
            </div>

            {/* Arama */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Search className="w-3 h-3" /> Arama
              </label>
              <div className="relative">
                <Input
                  className="pl-4 h-11 rounded-xl bg-gray-50/50 dark:bg-[#334155] border-gray-100 dark:border-[#475569] dark:text-white focus:bg-white dark:focus:bg-[#0f172a] transition-all"
                  placeholder="İsim veya konu..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            {/* Kategori */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Book className="w-3 h-3" /> Kategori
              </label>
              <select
                className="w-full h-11 rounded-xl border border-gray-100 dark:border-[#475569] bg-gray-50/50 dark:bg-[#334155] px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white dark:focus:bg-[#0f172a] transition-all"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Şehir */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Konum
              </label>
              <select
                className="w-full h-11 rounded-xl border border-gray-100 dark:border-[#475569] bg-gray-50/50 dark:bg-[#334155] px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white dark:focus:bg-[#0f172a] transition-all"
                value={filters.cityId}
                onChange={(e) => handleFilterChange("cityId", e.target.value)}
              >
                <option value="">Fark Etmez</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ders Tipi */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <LayoutGrid className="w-3 h-3" /> Ders Tipi
              </label>
              <select
                className="w-full h-11 rounded-xl border border-gray-100 dark:border-[#475569] bg-gray-50/50 dark:bg-[#334155] px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white dark:focus:bg-[#0f172a] transition-all"
                value={filters.serviceType}
                onChange={(e) =>
                  handleFilterChange("serviceType", e.target.value)
                }
              >
                <option value="">Tümü</option>
                <option value="1">Çevrimiçi</option>
                <option value="2">Yüz Yüze</option>
                <option value="3">Her İkisi</option>
              </select>
            </div>

            {/* Fiyat Aralığı */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> Fiyat Aralığı
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-11 rounded-xl bg-gray-50/50 dark:bg-[#334155] border-gray-100 dark:border-[#475569] dark:text-white"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-11 rounded-xl bg-gray-50/50 dark:bg-[#334155] border-gray-100 dark:border-[#475569] dark:text-white"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold"
              onClick={() => {
                setFilters((f) => ({ ...f, page: 1 }));
                setIsMobileFilterOpen(false);
              }}
            >
              Filtreleri Uygula
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 shrink min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8 gap-4">
            <h2 className="hidden lg:flex text-xl font-bold text-gray-900 dark:text-white items-center gap-2">
              {loading && filters.page === 1 ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm">
                  {totalCount}
                </span>
              )}
              Eğitmen Listeleniyor
            </h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <SortAsc className="w-4 h-4 text-gray-400" />
              <select
                className="h-11 rounded-xl border border-gray-200 dark:border-[#475569] bg-white dark:bg-[#1e293b] px-4 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-100 w-full md:w-auto"
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                <option value="newest">En Yeni</option>
                <option value="price_asc">Fiyat (Düşük)</option>
                <option value="price_desc">Fiyat (Yüksek)</option>
                <option value="rating">En İyi Puan</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-center py-20 px-6 border-2 border-dashed border-red-100 rounded-3xl bg-red-50/50">
              <p className="font-bold text-red-600 text-lg mb-2">{error}</p>
              <Button
                variant="outline"
                onClick={() => setFilters((f) => ({ ...f }))}
              >
                Tekrar Dene
              </Button>
            </div>
          )}

          {!error && (
            <div className="space-y-6">
              {tutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}

              {loading && (
                <div className="space-y-6 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-[#334155] rounded-[2rem] overflow-hidden shadow-sm h-auto md:h-56"
                    >
                      {/* Left Side Skeleton */}
                      <div className="md:w-56 bg-gray-50/50 dark:bg-[#0f172a] p-8 flex flex-col items-center justify-center border-r border-gray-100 dark:border-[#334155]">
                        <Skeleton
                          width="112px"
                          height="112px"
                          borderRadius="50%"
                          className="mb-4"
                        />
                        <Skeleton
                          width="100px"
                          height="20px"
                          className="mb-2"
                        />
                        <Skeleton width="80px" height="16px" />
                      </div>
                      {/* Right Side Skeleton */}
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex justify-between">
                          <Skeleton width="60%" height="24px" />
                          <Skeleton
                            width="24px"
                            height="24px"
                            borderRadius="6px"
                          />
                        </div>
                        <Skeleton width="90%" height="16px" />
                        <Skeleton width="80%" height="16px" />
                        <div className="flex gap-2 pt-2">
                          <Skeleton
                            width="80px"
                            height="24px"
                            borderRadius="8px"
                          />
                          <Skeleton
                            width="80px"
                            height="24px"
                            borderRadius="8px"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && tutors.length === 0 && (
                <div className="text-center py-32 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-[#334155] shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-200 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Sonuç Bulunamadı
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.
                  </p>
                </div>
              )}

              {!loading && tutors.length < totalCount && (
                <div className="pt-10 flex justify-center">
                  <Button
                    variant="outline"
                    className="h-12 px-10 rounded-xl font-bold border-gray-200 dark:border-[#475569] dark:text-gray-300 hover:bg-white dark:hover:bg-[#334155] hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    onClick={handleLoadMore}
                  >
                    Daha Fazla Eğitmen Yükle
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
