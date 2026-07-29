import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Zap,
  Star,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  X,
  Clock,
  Check,
  Lock,
  Flame,
  ShoppingBag,
  Trash2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { getTutors } from "@/services/tutorService";
import dopingService from "@/services/dopingService";
import { useAuth } from "@/store/AuthContext";

// ─── DOPİNG VERİLERİ ────────────────────────────────────────────────────────
const DOPING_PACKAGES = [
  {
    id: "anasayfa_one_cikan",
    icon: "⭐",
    iconColor: "#f59e0b",
    title: "Anasayfa Öne Çıkan Eğitmenler",
    desc: "İlanınız ana sayfanın 'Öne Çıkan Eğitmenler' slider bölümünde görüntülensin. Ziyaretçilerin ilk gördüğü alan!",
    badge: "En Popüler",
    badgeColor: "#f59e0b",
    durations: [
      { label: "1 Hafta", price: 199, text: "₺199" },
      { label: "2 Hafta", price: 349, text: "₺349" },
      { label: "1 Ay", price: 599, text: "₺599" },
    ],
  },
  {
    id: "anasayfa_ders_ilanlari",
    icon: "📋",
    iconColor: "#16a34a",
    title: "Anasayfa Ders İlanları",
    desc: "İlanınız ana sayfanın 'Ders İlanları' grid bölümünde en üst sırada öne çıksın. Binlerce potansiyel öğrenciye ulaşın!",
    badge: "Tavsiye Edilen",
    badgeColor: "#16a34a",
    durations: [
      { label: "1 Hafta", price: 149, text: "₺149" },
      { label: "2 Hafta", price: 249, text: "₺249" },
      { label: "1 Ay", price: 399, text: "₺399" },
    ],
  },
  {
    id: "kategori_listesi",
    icon: "📂",
    iconColor: "#3b82f6",
    title: "Kategori Listesi",
    desc: "İlanınız branşa ait Kategori Listesi sayfasında en üst sıralarda yer alsın. Doğru öğrenciye doğru anda ulaşın.",
    durations: [
      { label: "1 Hafta", price: 59, text: "₺59" },
      { label: "2 Hafta", price: 99, text: "₺99" },
      { label: "1 Ay", price: 179, text: "₺179" },
    ],
  },
  {
    id: "sosyal_medya",
    icon: "📱",
    iconColor: "#ec4899",
    title: "Sosyal Medya Dopingi",
    desc: "Profiliniz ve ilanlarınız platformun sosyal medya hesaplarında paylaşılsın. Organik erişiminizi katlayın!",
    durations: [
      { label: "1 Paylaşım", price: 49, text: "₺49" },
      { label: "3 Paylaşım", price: 119, text: "₺119" },
    ],
  },
  {
    id: "detayli",
    icon: "🔍",
    iconColor: "#8b5cf6",
    title: "Ögretmenler Arama Listesi",
    desc: "Web arayüzünde detaylı arama yapan alıcılara kolayca ulaşmak için hemen alın!",
    durations: [
      { label: "1 Hafta", price: 39, text: "₺39" },
      { label: "2 Hafta", price: 69, text: "₺69" },
      { label: "1 Ay", price: 119, text: "₺119" },
    ],
  },
  {
    id: "kalin",
    icon: "✏️",
    iconColor: "#f97316",
    title: "Kalın Yazı & Renkli Çerçeve",
    desc: "İlanınız arama sonuç listelerinde kalın yazı ve renkli çerçevesiyle görüntülensin!",
    durations: [{ label: "İlan Yayın Süresince", price: 49, text: "₺49" }],
  },
];

export default function TutorDopings() {
  const { user } = useAuth();
  const [activeDopings, setActiveDopings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [selectedDurationMap, setSelectedDurationMap] = useState({});
  const [selectedPackageIds, setSelectedPackageIds] = useState([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [targetListingId, setTargetListingId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Aktif dopingleri yükle
    const remoteDopings = await dopingService.getMyActiveDopings();
    if (remoteDopings && remoteDopings.length > 0) {
      setActiveDopings(remoteDopings);
    } else {
      // LocalStorage simülasyonu
      const local = localStorage.getItem("tutor_active_dopings");
      if (local) {
        try {
          setActiveDopings(JSON.parse(local));
        } catch (e) {
          setActiveDopings([]);
        }
      }
    }

    // Eğitmenin kendi ilanlarını getir
    try {
      const res = await getTutors({ page: 1, pageSize: 20 });
      if (res && res.items) {
        setUserListings(res.items);
        if (res.items.length > 0) {
          setTargetListingId(res.items[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDurationSelect = (dopingId, idx) => {
    setSelectedDurationMap((prev) => ({ ...prev, [dopingId]: idx }));
  };

  const togglePackageSelection = (pkgId) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId)
        ? prev.filter((id) => id !== pkgId)
        : [...prev, pkgId]
    );
  };

  const selectAllPackages = () => {
    if (selectedPackageIds.length === DOPING_PACKAGES.length) {
      setSelectedPackageIds([]);
    } else {
      setSelectedPackageIds(DOPING_PACKAGES.map((p) => p.id));
    }
  };

  // Seçilen paket nesneleri
  const selectedPackagesList = DOPING_PACKAGES.filter((p) =>
    selectedPackageIds.includes(p.id)
  );

  // Toplam Tutar Hesaplama
  const totalPrice = selectedPackagesList.reduce((acc, pkg) => {
    const durIdx = selectedDurationMap[pkg.id] || 0;
    return acc + (pkg.durations[durIdx]?.price || pkg.durations[0].price);
  }, 0);

  const openCheckout = () => {
    if (selectedPackageIds.length === 0) {
      toast.error("Lütfen en az bir doping paketi seçin.");
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleBulkActivation = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const activatedItems = [];

    try {
      for (const pkg of selectedPackagesList) {
        const durIdx = selectedDurationMap[pkg.id] || 0;
        const durObj = pkg.durations[durIdx];

        const purchasePayload = {
          dopingId: pkg.id,
          dopingTitle: pkg.title,
          listingId: targetListingId,
          durationLabel: durObj.label,
          price: 0,
          isDemo: true,
          purchaseDate: new Date().toISOString(),
        };

        try {
          await dopingService.purchaseDoping(purchasePayload);
        } catch (err) {
          // Servis olmasa da simülasyona devam et
        }

        activatedItems.push({
          id: "act_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          title: pkg.title,
          icon: pkg.icon,
          iconColor: pkg.iconColor,
          durationLabel: durObj.label,
          priceText: "Ücretsiz (Demo)",
          startDate: new Date().toLocaleDateString("tr-TR"),
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("tr-TR"),
          status: "Aktif",
        });
      }

      toast.success(`🎉 ${activatedItems.length} paketiniz başarıyla aktifleştirildi!`);
      const updated = [...activatedItems, ...activeDopings];
      setActiveDopings(updated);
      localStorage.setItem("tutor_active_dopings", JSON.stringify(updated));

      setSelectedPackageIds([]);
      setCheckoutModalOpen(false);
    } finally {
      setIsProcessing(false);
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
          Dilediğiniz doping paketlerini <strong>birden fazla seçerek tek tıkla</strong> aktifleştirin. İlanlarınızı üst sıralara taşıyın.
        </Subtitle>
      </HeaderBanner>

      {/* ── Aktif Dopinglerim ── */}
      {activeDopings.length > 0 && (
        <ActiveSection>
          <SectionTitle>
            <Zap size={20} color="#16a34a" />
            Aktif Dopingleriniz ({activeDopings.length})
          </SectionTitle>
          <ActiveGrid>
            {activeDopings.map((item) => (
              <ActiveCard key={item.id}>
                <ActiveCardHeader>
                  <span className="emoji">{item.icon || "⚡"}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>Süre: {item.durationLabel}</p>
                  </div>
                </ActiveCardHeader>
                <ActiveBadge>
                  <Clock size={12} />
                  Son Gün: {item.expiryDate}
                </ActiveBadge>
              </ActiveCard>
            ))}
          </ActiveGrid>
        </ActiveSection>
      )}

      {/* ── Doping Paketleri Listesi ── */}
      <DopingSection>
        <SectionHeaderRow>
          <SectionTitle style={{ marginBottom: 0 }}>
            <Flame size={22} color="#f59e0b" />
            Kullanılabilir Doping Paketleri
          </SectionTitle>
          <SelectAllBtn onClick={selectAllPackages}>
            {selectedPackageIds.length === DOPING_PACKAGES.length
              ? "Seçimleri Kaldır"
              : "Tümünü Seç"}
          </SelectAllBtn>
        </SectionHeaderRow>

        <DopingGrid>
          {DOPING_PACKAGES.map((pkg) => {
            const isSelected = selectedPackageIds.includes(pkg.id);
            const selectedIdx = selectedDurationMap[pkg.id] || 0;
            const currentDuration = pkg.durations[selectedIdx];
            return (
              <DopingCard
                key={pkg.id}
                $isSelected={isSelected}
                onClick={() => togglePackageSelection(pkg.id)}
              >
                <CardTopRow>
                  {pkg.badge && (
                    <BadgeTag $color={pkg.badgeColor}>{pkg.badge}</BadgeTag>
                  )}
                  <CheckboxWrap $isSelected={isSelected}>
                    {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                  </CheckboxWrap>
                </CardTopRow>

                <CardTop>
                  <IconCircle $color={pkg.iconColor}>{pkg.icon}</IconCircle>
                  <div>
                    <CardTitle>{pkg.title}</CardTitle>
                    <CardDesc>{pkg.desc}</CardDesc>
                  </div>
                </CardTop>

                <CardFooter onClick={(e) => e.stopPropagation()}>
                  {pkg.durations.length > 1 ? (
                    <SelectBox
                      value={selectedIdx}
                      onChange={(e) =>
                        handleDurationSelect(pkg.id, Number(e.target.value))
                      }
                    >
                      {pkg.durations.map((d, i) => (
                        <option key={i} value={i}>
                          {d.label} - {d.text}
                        </option>
                      ))}
                    </SelectBox>
                  ) : (
                    <SingleLabel>{currentDuration.label}</SingleLabel>
                  )}

                  <PriceDisplay $color={pkg.iconColor}>
                    {currentDuration.text}
                  </PriceDisplay>
                </CardFooter>

                <SelectCardBtn
                  $isSelected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePackageSelection(pkg.id);
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
      </DopingSection>

      {/* ── Toplu Satın Alma / Aktifleştirme Çubuğu (Sticky Bar) ── */}
      {selectedPackageIds.length > 0 && (
        <CartStickyBar>
          <CartInner>
            <CartInfo>
              <ShoppingBag size={22} className="text-green-400" />
              <div>
                <CartTitle>
                  <strong>{selectedPackageIds.length} Doping Paketi</strong> Seçildi
                </CartTitle>
                <CartSubtitle>
                  Normal Tutar: <span className="line-through">₺{totalPrice}</span> →{" "}
                  <strong className="text-green-400 font-extrabold">ÜCRETSİZ (Demo)</strong>
                </CartSubtitle>
              </div>
            </CartInfo>

            <CartActions>
              <ClearBtn onClick={() => setSelectedPackageIds([])}>
                <Trash2 size={16} /> Temizle
              </ClearBtn>
              <BulkCheckoutBtn onClick={openCheckout}>
                Seçilen Paketleri Aktifleştir ({selectedPackageIds.length})
                <ArrowRight size={18} />
              </BulkCheckoutBtn>
            </CartActions>
          </CartInner>
        </CartStickyBar>
      )}

      {/* ── Ödeme / Toplu Aktifleştirme Modal ── */}
      {checkoutModalOpen && selectedPackagesList.length > 0 && (
        <ModalOverlay onClick={() => setCheckoutModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseBtn onClick={() => setCheckoutModalOpen(false)}>
              <X size={20} />
            </ModalCloseBtn>

            <ModalTitle>
              <Zap size={22} color="#16a34a" />
              Toplu Doping Aktifleştirme ({selectedPackagesList.length} Paket)
            </ModalTitle>

            {/* Demo Uyarı Kutusu */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 mb-4 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Sparkles size={16} className="shrink-0 text-amber-500" />
              <span>
                <strong>Demo Modu:</strong> Seçtiğiniz tüm paketler herhangi bir ödeme alınmadan anında hesabınıza tanımlanacaktır.
              </span>
            </div>

            {/* Seçilen Paketler Listesi */}
            <div className="mb-4 space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedPackagesList.map((pkg) => {
                const durIdx = selectedDurationMap[pkg.id] || 0;
                const durObj = pkg.durations[durIdx];
                return (
                  <OrderSummaryBox key={pkg.id}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{pkg.icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                          {pkg.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Süre: {durObj.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 line-through block">
                        {durObj.text}
                      </span>
                      <span className="text-xs font-black text-green-600">
                        ÜCRETSİZ
                      </span>
                    </div>
                  </OrderSummaryBox>
                );
              })}
            </div>

            <FormContainer onSubmit={handleBulkActivation}>
              {/* İlan Seçimi */}
              {userListings.length > 0 && (
                <FormGroup>
                  <label>Hangi İlanınıza Uygulansın?</label>
                  <select
                    value={targetListingId}
                    onChange={(e) => setTargetListingId(e.target.value)}
                  >
                    {userListings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title || l.headline || `İlan #${l.id.substring(0, 6)}`}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              )}

              <SubmitPayBtn type="submit" disabled={isProcessing}>
                {isProcessing
                  ? "Aktifleştiriliyor..."
                  : `🚀 Seçilen ${selectedPackagesList.length} Dopingi Ücretsiz Aktifleştir`}
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const ActiveCard = styled.div`
  background: white;
  border: 1.5px solid #bbf7d0;
  border-radius: 16px;
  padding: 18px;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }
`;

const ActiveCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .emoji {
    font-size: 28px;
  }

  h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  p {
    font-size: 12px;
    color: #64748b;
  }
`;

const ActiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  color: #16a34a;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
`;

const DopingSection = styled.div``;

const DopingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const DopingCard = styled.div`
  position: relative;
  background: ${({ $isSelected }) =>
    $isSelected ? "#f0fdf4" : "white"};
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
  background: ${({ $isSelected }) =>
    $isSelected ? "#16a34a" : "#f1f5f9"};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#334155")};
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ $isSelected }) =>
      $isSelected ? "#15803d" : "#e2e8f0"};
  }

  .dark & {
    background: ${({ $isSelected }) =>
      $isSelected ? "#16a34a" : "var(--page-bg)"};
    color: ${({ $isSelected }) => ($isSelected ? "white" : "var(--text-primary)")};
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
  animation: fadeInUp 0.3s ease-out;
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

  &:hover {
    background: #15803d;
  }
`;
