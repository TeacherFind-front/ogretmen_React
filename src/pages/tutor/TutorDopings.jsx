import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Zap,
  Star,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  Check,
  Flame,
  ShoppingBag,
  Trash2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Tag,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getMyListings } from "@/services/tutorService";
import dopingService from "@/services/dopingService";

// Ikon Haritası (DopingType id veya code bazlı)
const DOPING_ICONS = {
  1: "⭐", // AnasayfaOneCikanEgitmen
  2: "📋", // AnasayfaDersIlanlari
  3: "📂", // KategoriListesi
  4: "📱", // SosyalMedyaDopingi
  5: "🔍", // OgretmenlerAramaListesi
  6: "✏️", // KalinYaziRenkliCerceve
};

const DOPING_COLORS = {
  1: "#f59e0b",
  2: "#16a34a",
  3: "#3b82f6",
  4: "#ec4899",
  5: "#8b5cf6",
  6: "#f97316",
};

// Doping Entitlement Türleri (1: TimeBased, 2: QuantityBased, 3: ListingLifetime)
const ENTITLEMENT = {
  TIME_BASED: 1,
  QUANTITY_BASED: 2,
  LISTING_LIFETIME: 3,
};

export default function TutorDopings() {
  // State'ler
  const [packages, setPackages] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [activeDopings, setActiveDopings] = useState([]);
  const [userListings, setUserListings] = useState([]);

  // Seperated Loading States
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [activeDopingsLoading, setActiveDopingsLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const [packagesError, setPackagesError] = useState(null);

  // Seçim state'leri
  const [selectedDopingTypes, setSelectedDopingTypes] = useState([]);
  const [selectedOptionMap, setSelectedOptionMap] = useState({}); // { [dopingType]: optionCode }
  const [targetListingId, setTargetListingId] = useState("");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    loadPackages();
    loadActiveDopings();
    loadListings();
  }, []);

  // 1. Paketleri Backend'den Yükle
  const loadPackages = async () => {
    setPackagesLoading(true);
    setPackagesError(null);
    try {
      const data = await dopingService.getDopingCatalog();
      if (data) {
        if (Array.isArray(data)) {
          setPackages(data);
        } else {
          setDemoMode(!!data.demoMode);
          setPackages(data.packages || []);

          // Varsayılan option'ları ayarla
          const defaultOptions = {};
          (data.packages || []).forEach((pkg) => {
            if (pkg.options && pkg.options.length > 0) {
              defaultOptions[pkg.dopingType || pkg.code] = pkg.options[0].optionCode;
            }
          });
          setSelectedOptionMap(defaultOptions);
        }
      }
    } catch (err) {
      console.error("Paket yükleme hatası:", err);
      setPackagesError(err.message || "Doping paketleri yüklenirken hata oluştu.");
    } finally {
      setPackagesLoading(false);
    }
  };

  // 2. Aktif Dopingleri Backend'den Yükle
  const loadActiveDopings = async () => {
    setActiveDopingsLoading(true);
    try {
      const dopings = await dopingService.getMyActiveDopings();
      setActiveDopings(dopings || []);
    } catch (err) {
      console.error("Aktif dopingler yükleme hatası:", err);
      setActiveDopings([]);
    } finally {
      setActiveDopingsLoading(false);
    }
  };

  // 3. Eğitmenin Kendi İlanlarını Yükle (GET /api/tutors/my-listings)
  const loadListings = async () => {
    setListingsLoading(true);
    try {
      const listings = await getMyListings();
      const listingsArray = Array.isArray(listings)
        ? listings
        : listings?.items || [];
      setUserListings(listingsArray);
      if (listingsArray.length > 0) {
        setTargetListingId(listingsArray[0].id);
      }
    } catch (err) {
      console.error("İlan yükleme hatası:", err);
      setUserListings([]);
    } finally {
      setListingsLoading(false);
    }
  };

  // Seçim Handlers
  const togglePackageSelection = (dopingType) => {
    setSelectedDopingTypes((prev) =>
      prev.includes(dopingType)
        ? prev.filter((id) => id !== dopingType)
        : [...prev, dopingType]
    );
  };

  const handleOptionSelect = (dopingType, optionCode) => {
    setSelectedOptionMap((prev) => ({ ...prev, [dopingType]: optionCode }));
  };

  const selectAllPackages = () => {
    if (selectedDopingTypes.length === packages.length) {
      setSelectedDopingTypes([]);
    } else {
      setSelectedDopingTypes(packages.map((p) => p.dopingType));
    }
  };

  // Seçilen paketler ve toplam tutar
  const selectedPackagesList = packages.filter((p) =>
    selectedDopingTypes.includes(p.dopingType)
  );

  // İlan seçimi gerekip gerekmediğini kontrol et (AnasayfaOneCikanEgitmen = 1 profil bazlıdır)
  const requiresListing = selectedPackagesList.some(
    (p) => p.dopingType !== 1
  );

  const totalPrice = selectedPackagesList.reduce((acc, pkg) => {
    const optCode = selectedOptionMap[pkg.dopingType];
    const opt = pkg.options?.find((o) => o.optionCode === optCode) || pkg.options?.[0];
    return acc + (opt?.price || 0);
  }, 0);

  const openCheckout = () => {
    if (selectedDopingTypes.length === 0) {
      toast.error("Lütfen en az bir doping paketi seçin.");
      return;
    }

    setCheckoutModalOpen(true);
  };

  // Bulk Activation Submit
  const handleBulkActivation = async (e) => {
    e.preventDefault();

    if (requiresListing && !targetListingId) {
      toast.error("Lütfen dopingin uygulanacağı ilanı seçin.");
      return;
    }

    setPurchaseLoading(true);

    const payload = {
      teacherListingId: requiresListing ? targetListingId : null,
      items: selectedPackagesList.map((pkg) => ({
        dopingType: pkg.dopingType,
        optionCode: selectedOptionMap[pkg.dopingType],
      })),
    };

    try {
      const catalogPkgs = selectedPackagesList.filter((p) => p.packageId || (p.id && !p.dopingType));
      if (catalogPkgs.length > 0) {
        for (const pkg of catalogPkgs) {
          await dopingService.purchaseDopingPackage({
            packageId: pkg.packageId || pkg.id,
            teacherListingId: requiresListing ? targetListingId : null,
          });
        }
      } else {
        const payload = {
          teacherListingId: requiresListing ? targetListingId : null,
          items: selectedPackagesList.map((pkg) => ({
            dopingType: pkg.dopingType,
            optionCode: selectedOptionMap[pkg.dopingType || pkg.code],
          })),
        };
        await dopingService.purchaseDopings(payload);
      }

      toast.success("🎉 Doping paketleriniz başarıyla aktifleştirildi!");

      // Modal kapat ve seçimleri sıfırla
      setCheckoutModalOpen(false);
      setSelectedDopingTypes([]);

      // Aktif dopingleri backend'den yeniden çek
      await loadActiveDopings();
    } catch (err) {
      console.error("Satın alma hatası:", err);
      toast.error(err.message || "Aktivasyon sırasında bir hata oluştu.");
      // Modal açık kalsın
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Tarih Formatlama Yardımcısı
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <PageWrapper>
      {/* ── Header ── */}
      <HeaderBanner>
        <HeaderBadge>
          <Sparkles size={14} /> Eğitmen VIP Hizmetleri
        </HeaderBadge>
        <Title>Doping Paketleri & Öne Çıkarma</Title>
        <Subtitle>
          İlanlarınızı ve profilinizi aramalarda ile ana sayfada üst sıralara taşıyın. Öğrencilerinize daha hızlı ulaşın.
        </Subtitle>
      </HeaderBanner>

      {/* ── Aktif Dopinglerim ── */}
      <ActiveSection>
        <SectionTitle>
          <Zap size={20} color="#16a34a" />
          Aktif Dopingleriniz
        </SectionTitle>

        {activeDopingsLoading ? (
          <SkeletonGrid>
            {[1, 2].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </SkeletonGrid>
        ) : activeDopings.length > 0 ? (
          <ActiveGrid>
            {activeDopings.map((item) => {
              const icon = DOPING_ICONS[item.dopingType] || "⚡";
              const isListingLifetime =
                item.entitlementType === ENTITLEMENT.LISTING_LIFETIME ||
                item.entitlementType === "ListingLifetime" ||
                !item.endDate;
              const isQuantityBased =
                item.entitlementType === ENTITLEMENT.QUANTITY_BASED ||
                item.entitlementType === "QuantityBased";

              return (
                <ActiveCard key={item.id}>
                  <ActiveCardHeader>
                    <span className="emoji">{icon}</span>
                    <div>
                      <h4>{item.title}</h4>
                      {item.listingTitle && (
                        <p className="font-semibold text-green-700 dark:text-green-400">
                          İlan: {item.listingTitle}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {item.durationLabel}
                      </p>
                    </div>
                  </ActiveCardHeader>

                  <ActiveCardBody>
                    {isQuantityBased ? (
                      <ActiveBadge $type="quantity">
                        <Share2 size={12} />
                        Kalan Paylaşım Hakkı: {item.remainingQuantity ?? 0}
                      </ActiveBadge>
                    ) : isListingLifetime ? (
                      <ActiveBadge $type="lifetime">
                        <CheckCircle2 size={12} />
                        İlan Yayın Süresince Aktif
                      </ActiveBadge>
                    ) : (
                      <ActiveBadge $type="time">
                        <Clock size={12} />
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </ActiveBadge>
                    )}

                    {item.isDemo && (
                      <DemoTag>Demo</DemoTag>
                    )}
                  </ActiveCardBody>
                </ActiveCard>
              );
            })}
          </ActiveGrid>
        ) : (
          <EmptyStateBox>
            <Zap size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="font-bold text-sm text-gray-600 dark:text-gray-400">
              Henüz aktif bir doping paketiniz bulunmuyor.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Aşağıdaki paketlerden seçim yaparak ilanlarınızı öne çıkarabilirsiniz.
            </p>
          </EmptyStateBox>
        )}
      </ActiveSection>

      {/* ── Doping Paketleri Listesi ── */}
      <DopingSection>
        <SectionHeaderRow>
          <SectionTitle style={{ marginBottom: 0 }}>
            <Flame size={22} color="#f59e0b" />
            Kullanılabilir Doping Paketleri
          </SectionTitle>

          {packages.length > 0 && (
            <SelectAllBtn onClick={selectAllPackages}>
              {selectedDopingTypes.length === packages.length
                ? "Seçimleri Kaldır"
                : "Tümünü Seç"}
            </SelectAllBtn>
          )}
        </SectionHeaderRow>

        {/* Paketler Yüklenirken (Loading State) */}
        {packagesLoading ? (
          <DopingGrid>
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} style={{ height: "240px" }} />
            ))}
          </DopingGrid>
        ) : packagesError ? (
          /* Yükleme Hatası (Error State) */
          <ErrorStateBox>
            <AlertCircle size={36} className="text-red-500 mb-2" />
            <p className="font-bold text-red-600 dark:text-red-400 text-sm">
              {packagesError}
            </p>
            <RetryBtn onClick={loadPackages}>
              <RefreshCw size={14} /> Yeniden Dene
            </RetryBtn>
          </ErrorStateBox>
        ) : packages.length > 0 ? (
          /* Paket Listesi Grid */
          <DopingGrid>
            {packages.map((pkg) => {
              const isSelected = selectedDopingTypes.includes(pkg.dopingType);
              const icon = DOPING_ICONS[pkg.dopingType] || "⚡";
              const color = DOPING_COLORS[pkg.dopingType] || "#16a34a";

              const selectedOptCode =
                selectedOptionMap[pkg.dopingType] || pkg.options?.[0]?.optionCode;
              const currentOpt =
                pkg.options?.find((o) => o.optionCode === selectedOptCode) ||
                pkg.options?.[0];

              return (
                <DopingCard
                  key={pkg.dopingType}
                  $isSelected={isSelected}
                  onClick={() => togglePackageSelection(pkg.dopingType)}
                >
                  <CardTopRow>
                    {pkg.badge && (
                      <BadgeTag $color={color}>{pkg.badge}</BadgeTag>
                    )}
                    <CheckboxWrap $isSelected={isSelected}>
                      {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                    </CheckboxWrap>
                  </CardTopRow>

                  <CardTop>
                    <IconCircle $color={color}>{icon}</IconCircle>
                    <div>
                      <CardTitle>{pkg.title}</CardTitle>
                      <CardDesc>{pkg.description}</CardDesc>
                    </div>
                  </CardTop>

                  <CardFooter onClick={(e) => e.stopPropagation()}>
                    {pkg.options && pkg.options.length > 1 ? (
                      <SelectBox
                        value={selectedOptCode || ""}
                        onChange={(e) =>
                          handleOptionSelect(pkg.dopingType, e.target.value)
                        }
                      >
                        {pkg.options.map((opt) => (
                          <option key={opt.optionCode} value={opt.optionCode}>
                            {opt.durationLabel} - ₺{opt.price}
                          </option>
                        ))}
                      </SelectBox>
                    ) : (
                      <SingleLabel>
                        {currentOpt?.durationLabel || "Süresiz"}
                      </SingleLabel>
                    )}

                    <PriceDisplay $color={color}>
                      ₺{currentOpt?.price ?? 0}
                    </PriceDisplay>
                  </CardFooter>

                  <SelectCardBtn
                    $isSelected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePackageSelection(pkg.dopingType);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={16} /> Paket Seçildi
                      </>
                    ) : (
                      <>
                        <Zap size={16} /> Paketi Seç
                      </>
                    )}
                  </SelectCardBtn>
                </DopingCard>
              );
            })}
          </DopingGrid>
        ) : (
          <EmptyStateBox>
            <AlertCircle size={32} className="text-gray-400 mb-2" />
            <p className="font-bold text-sm text-gray-600 dark:text-gray-400">
              Şu anda aktif bir doping paketi bulunmuyor.
            </p>
          </EmptyStateBox>
        )}
      </DopingSection>

      {/* ── Toplu Satın Alma / Aktifleştirme Barı (Sticky Bar) ── */}
      {selectedDopingTypes.length > 0 && (
        <CartStickyBar>
          <CartInner>
            <CartInfo>
              <ShoppingBag size={22} className="text-green-400" />
              <div>
                <CartTitle>
                  <strong>{selectedDopingTypes.length} Doping Paketi</strong> Seçildi
                </CartTitle>
                <CartSubtitle>
                  Tutar: <span className={demoMode ? "line-through" : ""}>₺{totalPrice}</span>
                  {demoMode && (
                    <strong className="text-green-400 font-extrabold ml-1.5">
                      ÜCRETSİZ (Demo Modu)
                    </strong>
                  )}
                </CartSubtitle>
              </div>
            </CartInfo>

            <CartActions>
              <ClearBtn onClick={() => setSelectedDopingTypes([])}>
                <Trash2 size={16} /> Temizle
              </ClearBtn>
              <BulkCheckoutBtn onClick={openCheckout}>
                Seçilen Paketleri Aktifleştir ({selectedDopingTypes.length})
                <ArrowRight size={18} />
              </BulkCheckoutBtn>
            </CartActions>
          </CartInner>
        </CartStickyBar>
      )}

      {/* ── Checkout / Aktifleştirme Modalı ── */}
      {checkoutModalOpen && selectedPackagesList.length > 0 && (
        <ModalOverlay onClick={() => !purchaseLoading && setCheckoutModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseBtn
              disabled={purchaseLoading}
              onClick={() => setCheckoutModalOpen(false)}
            >
              <X size={20} />
            </ModalCloseBtn>

            <ModalTitle>
              <Zap size={22} color="#16a34a" />
              Doping Aktifleştirme ({selectedPackagesList.length} Paket)
            </ModalTitle>

            {demoMode && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 mb-4 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Sparkles size={16} className="shrink-0 text-amber-500" />
                <span>
                  <strong>Demo Modu:</strong> Şu an sistem test aşamasındadır. Ödeme alınmadan paketleriniz anında aktifleştirilecektir.
                </span>
              </div>
            )}

            {/* Seçilen Paketler Özeti */}
            <div className="mb-4 space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedPackagesList.map((pkg) => {
                const optCode = selectedOptionMap[pkg.dopingType];
                const opt =
                  pkg.options?.find((o) => o.optionCode === optCode) ||
                  pkg.options?.[0];
                const icon = DOPING_ICONS[pkg.dopingType] || "⚡";

                return (
                  <OrderSummaryBox key={pkg.dopingType}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                          {pkg.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Seçenek: {opt?.durationLabel || optCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {demoMode ? (
                        <>
                          <span className="text-xs text-gray-400 line-through block">
                            ₺{opt?.price || 0}
                          </span>
                          <span className="text-xs font-black text-green-600">
                            ÜCRETSİZ
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-black text-green-600">
                          ₺{opt?.price || 0}
                        </span>
                      )}
                    </div>
                  </OrderSummaryBox>
                );
              })}
            </div>

            <FormContainer onSubmit={handleBulkActivation}>
              {/* İlan Seçimi (Gerekiyorsa) */}
              {requiresListing && (
                <FormGroup>
                  <label>Hangi İlanınıza Uygulansın? *</label>
                  {listingsLoading ? (
                    <p className="text-xs text-gray-400">İlanlar yükleniyor...</p>
                  ) : userListings.length > 0 ? (
                    <select
                      value={targetListingId}
                      onChange={(e) => setTargetListingId(e.target.value)}
                      required
                    >
                      {userListings.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title || l.headline || `İlan #${l.id.substring(0, 6)}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex flex-col gap-2">
                      <span>İlan bazlı doping seçtiniz ancak henüz yayınlanmış ilanınız yok.</span>
                      <Link
                        to="/tutor/create-listing"
                        className="font-bold underline text-red-700"
                      >
                        + Yeni İlan Oluştur
                      </Link>
                    </div>
                  )}
                </FormGroup>
              )}

              <SubmitPayBtn
                type="submit"
                disabled={purchaseLoading || (requiresListing && userListings.length === 0)}
              >
                {purchaseLoading
                  ? "Aktifleştiriliyor..."
                  : demoMode
                  ? `🚀 ${selectedPackagesList.length} Dopingi Ücretsiz Aktifleştir`
                  : `💳 Ödemeyi Tamamla (₺${totalPrice})`}
              </SubmitPayBtn>
            </FormContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  padding: 32px 24px 120px;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #052e16 0%, #15803d 100%);
  border-radius: 24px;
  padding: 36px 32px;
  color: white;
  margin-bottom: 32px;
  box-shadow: 0 12px 32px rgba(22, 163, 74, 0.2);
`;

const HeaderBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #dcfce7;
  max-width: 700px;
  line-height: 1.6;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const SelectAllBtn = styled.button`
  font-size: 13px;
  font-weight: 700;
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;

  &:hover {
    background: #dcfce7;
  }

  .dark & {
    background: rgba(22, 163, 74, 0.15);
    border-color: rgba(74, 222, 128, 0.3);
    color: #4ade80;
  }
`;

const ActiveSection = styled.div`
  margin-bottom: 40px;
`;

const ActiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const ActiveCard = styled.div`
  background: white;
  border: 1.5px solid #bbf7d0;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }
`;

const ActiveCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  .emoji {
    font-size: 26px;
  }

  h4 {
    font-size: 14px;
    font-weight: 800;
    color: var(--text-primary);
  }
`;

const ActiveCardBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
`;

const ActiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ $type }) =>
    $type === "quantity"
      ? "#fce7f3"
      : $type === "lifetime"
      ? "#e0f2fe"
      : "#f0fdf4"};
  color: ${({ $type }) =>
    $type === "quantity"
      ? "#db2777"
      : $type === "lifetime"
      ? "#0284c7"
      : "#16a34a"};
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
`;

const DemoTag = styled.span`
  background: #fef3c7;
  color: #d97706;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
`;

const EmptyStateBox = styled.div`
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }
`;

const ErrorStateBox = styled(EmptyStateBox)`
  background: #fef2f2;
  border-color: #fca5a5;

  .dark & {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
`;

const RetryBtn = styled.button`
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 10px;
`;

const DopingSection = styled.div``;

const DopingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const DopingCard = styled.div`
  position: relative;
  background: ${({ $isSelected }) => ($isSelected ? "#f0fdf4" : "white")};
  border: ${({ $isSelected }) =>
    $isSelected ? "2px solid #16a34a" : "1.5px solid #e2e8f0"};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s;
  cursor: pointer;
  box-shadow: ${({ $isSelected }) =>
    $isSelected ? "0 8px 24px rgba(22, 163, 74, 0.18)" : "none"};

  &:hover {
    transform: translateY(-4px);
    border-color: #16a34a;
  }

  .dark & {
    background: ${({ $isSelected }) =>
      $isSelected ? "rgba(22, 163, 74, 0.15)" : "var(--card-bg)"};
    border-color: ${({ $isSelected }) =>
      $isSelected ? "#4ade80" : "var(--card-border)"};
  }
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  min-height: 24px;
`;

const BadgeTag = styled.span`
  background: ${({ $color }) => $color || "#16a34a"};
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 999px;
`;

const CheckboxWrap = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 7px;
  border: 2px solid ${({ $isSelected }) => ($isSelected ? "#16a34a" : "#cbd5e1")};
  background: ${({ $isSelected }) => ($isSelected ? "#16a34a" : "white")};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: all 0.2s;
`;

const CardTop = styled.div`
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
`;

const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;

  .dark & {
    background: var(--page-bg);
  }
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const CardDesc = styled.p`
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;

  .dark & {
    color: var(--text-muted);
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  margin-bottom: 16px;

  .dark & {
    border-color: var(--card-border);
  }
`;

const SelectBox = styled.select`
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  background: white;

  .dark & {
    background: var(--card-bg);
    color: var(--text-primary);
    border-color: var(--card-border);
  }
`;

const SingleLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
`;

const PriceDisplay = styled.span`
  font-size: 18px;
  font-weight: 900;
  color: ${({ $color }) => $color || "#16a34a"};
`;

const SelectCardBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: ${({ $isSelected }) => ($isSelected ? "#16a34a" : "#f1f5f9")};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#334155")};
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ $isSelected }) => ($isSelected ? "#15803d" : "#e2e8f0")};
  }

  .dark & {
    background: ${({ $isSelected }) =>
      $isSelected ? "#16a34a" : "var(--page-bg)"};
    color: ${({ $isSelected }) =>
      $isSelected ? "white" : "var(--text-primary)"};
  }
`;

// Skeleton Loaders
const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const SkeletonCard = styled.div`
  background: #f1f5f9;
  border-radius: 16px;
  height: 100px;
  animation: pulse 1.5s infinite;

  .dark & {
    background: rgba(255, 255, 255, 0.05);
  }
`;

// Sticky Cart Bar
const CartStickyBar = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 900px;
  background: #052e16;
  border: 1.5px solid #16a34a;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  padding: 16px 24px;
  z-index: 900;
`;

const CartInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CartInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const CartTitle = styled.div`
  font-size: 14px;
  color: white;

  strong {
    color: #4ade80;
  }
`;

const CartSubtitle = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const CartActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ClearBtn = styled.button`
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #ef4444;
    border-color: #ef4444;
  }
`;

const BulkCheckoutBtn = styled.button`
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.4);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.03);
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  padding: 32px;

  .dark & {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
  }
`;

const ModalCloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f1f5f9;
  border-radius: 50%;
  padding: 6px;
  color: #64748b;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dark & {
    background: var(--page-bg);
    color: var(--text-primary);
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const OrderSummaryBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
  }

  select {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #cbd5e1;
    font-size: 13px;
    outline: none;

    .dark & {
      background: var(--page-bg);
      border-color: var(--card-border);
      color: var(--text-primary);
    }
  }
`;

const SubmitPayBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #16a34a;
  color: white;
  font-size: 14px;
  font-weight: 800;
  margin-top: 6px;
  transition: background 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #15803d;
  }
`;
