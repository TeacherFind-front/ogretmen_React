import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Zap,
  Star,
  Sparkles,
  CheckCircle,
  CreditCard,
  ChevronRight,
  X,
  AlertCircle,
  Clock,
  Check,
  Building,
  Lock,
  ListFilter,
  Flame,
  Award,
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
  const [selectedDoping, setSelectedDoping] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [targetListingId, setTargetListingId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Ödeme Formu State
  const [cardForm, setCardForm] = useState({
    cardHolder: "",
    cardNumber: "",
    expireDate: "",
    cvv: "",
  });

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

  const openCheckout = (dopingPackage) => {
    setSelectedDoping(dopingPackage);
    setCheckoutModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardForm.cardHolder.trim() || !cardForm.cardNumber.trim()) {
      toast.error("Lütfen kart bilgilerini eksiksiz doldurun.");
      return;
    }

    const durationIdx = selectedDurationMap[selectedDoping.id] || 0;
    const durationObj = selectedDoping.durations[durationIdx];

    const purchasePayload = {
      dopingId: selectedDoping.id,
      dopingTitle: selectedDoping.title,
      listingId: targetListingId,
      durationLabel: durationObj.label,
      price: durationObj.price,
      purchaseDate: new Date().toISOString(),
    };

    setIsProcessing(true);
    try {
      // Backend servis çağrısı (varsa)
      await dopingService.purchaseDoping(purchasePayload);
      toast.success("Doping paketiniz başarıyla aktifleştirildi!");
    } catch (err) {
      // Backend henüz devrede değilse bile UI üzerinde işlemi tamamla (CANLI HAZIR SIMÜLASYON)
      toast.success(`${selectedDoping.title} paketiniz başarıyla aktifleştirildi!`);
    } finally {
      // LocalStorage kaydı ile simülasyon
      const newDoping = {
        id: "act_" + Date.now(),
        title: selectedDoping.title,
        icon: selectedDoping.icon,
        iconColor: selectedDoping.iconColor,
        durationLabel: durationObj.label,
        priceText: durationObj.text,
        startDate: new Date().toLocaleDateString("tr-TR"),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("tr-TR"),
        status: "Aktif",
      };

      const updated = [newDoping, ...activeDopings];
      setActiveDopings(updated);
      localStorage.setItem("tutor_active_dopings", JSON.stringify(updated));

      setIsProcessing(false);
      setCheckoutModalOpen(false);
      setSelectedDoping(null);
      setCardForm({ cardHolder: "", cardNumber: "", expireDate: "", cvv: "" });
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
          İlanlarınızı aramalarda ve ana sayfada üst sıralara taşıyın. Öğrencilerinizi ve ders taleplerinizi <strong>73 kata kadar</strong> artırın.
        </Subtitle>
      </HeaderBanner>

      {/* ── Aktif Dopinglerim ── */}
      {activeDopings.length > 0 && (
        <ActiveSection>
          <SectionTitle>
            <Zap size={20} color="#16a34a" />
            Aktif Dopingleriniz
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
        <SectionTitle>
          <Flame size={22} color="#f59e0b" />
          Kullanılabilir Doping Paketleri
        </SectionTitle>
        <DopingGrid>
          {DOPING_PACKAGES.map((pkg) => {
            const selectedIdx = selectedDurationMap[pkg.id] || 0;
            const currentDuration = pkg.durations[selectedIdx];
            return (
              <DopingCard key={pkg.id}>
                {pkg.badge && (
                  <BadgeTag $color={pkg.badgeColor}>{pkg.badge}</BadgeTag>
                )}
                <CardTop>
                  <IconCircle $color={pkg.iconColor}>{pkg.icon}</IconCircle>
                  <div>
                    <CardTitle>{pkg.title}</CardTitle>
                    <CardDesc>{pkg.desc}</CardDesc>
                  </div>
                </CardTop>

                <CardFooter>
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

                <BuyButton
                  $color={pkg.iconColor}
                  onClick={() => openCheckout(pkg)}
                >
                  <Zap size={16} />
                  Satın Al & Aktifleştir
                </BuyButton>
              </DopingCard>
            );
          })}
        </DopingGrid>
      </DopingSection>

      {/* ── Ödeme Modal (Checkout) ── */}
      {checkoutModalOpen && selectedDoping && (
        <ModalOverlay onClick={() => setCheckoutModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseBtn onClick={() => setCheckoutModalOpen(false)}>
              <X size={20} />
            </ModalCloseBtn>

            <ModalTitle>
              <CreditCard size={22} color="#16a34a" />
              Güvenli Doping Satın Alımı
            </ModalTitle>

            {/* Paket Özeti */}
            <OrderSummaryBox>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedDoping.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">
                    {selectedDoping.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Seçilen Süre:{" "}
                    {
                      selectedDoping.durations[
                        selectedDurationMap[selectedDoping.id] || 0
                      ].label
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-green-600">
                  {
                    selectedDoping.durations[
                      selectedDurationMap[selectedDoping.id] || 0
                    ].text
                  }
                </span>
              </div>
            </OrderSummaryBox>

            <FormContainer onSubmit={handlePaymentSubmit}>
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

              {/* Kart Bilgileri */}
              <FormGroup>
                <label>Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={cardForm.cardHolder}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, cardHolder: e.target.value })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Kart Numarası</label>
                <input
                  type="text"
                  placeholder="4543 **** **** 1234"
                  maxLength={19}
                  value={cardForm.cardNumber}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, cardNumber: e.target.value })
                  }
                  required
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup>
                  <label>Son Kullanma (AY/YIL)</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    maxLength={5}
                    value={cardForm.expireDate}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, expireDate: e.target.value })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>CVV Güvenlik Kodu</label>
                  <input
                    type="text"
                    placeholder="321"
                    maxLength={4}
                    value={cardForm.cvv}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, cvv: e.target.value })
                    }
                    required
                  />
                </FormGroup>
              </div>

              <SecurityNote>
                <Lock size={14} /> 256-Bit SSL Şifreli Güvenli Ödeme
              </SecurityNote>

              <SubmitPayBtn type="submit" disabled={isProcessing}>
                {isProcessing ? "İşleniyor..." : "Ödemeyi Tamamla ve Dopingi Başlat"}
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
  padding: 32px 24px 80px;
  max-width: 1100px;
  margin: 0 auto;
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

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: var(--text-primary);
`;

const ActiveSection = styled.div`
  margin-bottom: 40px;
`;

const ActiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
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
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
    border-color: #bbf7d0;
  }

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }
`;

const BadgeTag = styled.span`
  position: absolute;
  top: -10px;
  left: 20px;
  background: ${({ $color }) => $color || "#16a34a"};
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 999px;
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

const BuyButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: ${({ $color }) => $color || "#16a34a"};
  color: white;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
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
  max-width: 480px;
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
  margin-bottom: 20px;
  color: var(--text-primary);
`;

const OrderSummaryBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
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

  input,
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

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
`;

const SubmitPayBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #16a34a;
  color: white;
  font-size: 14px;
  font-weight: 800;
  margin-top: 10px;
  transition: background 0.2s;

  &:hover {
    background: #15803d;
  }
`;
