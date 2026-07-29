import { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  Check,
  Zap,
  Star,
  Crown,
  Rocket,
  TrendingUp,
  Eye,
  Search,
  Bell,
  Bold,
  LayoutGrid,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Gift,
} from "lucide-react";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.35); }
  50%       { box-shadow: 0 0 0 12px rgba(22,163,74,0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
`;

// ─── Pricing Plans Data ───────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Başlangıç",
    price: "Ücretsiz",
    priceNote: "Sonsuza dek ücretsiz",
    color: "#64748b",
    gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    icon: Gift,
    features: [
      "1 aktif ilan",
      "Temel profil sayfası",
      "Öğrenci mesajları",
      "Randevu takvimi",
      "E-posta bildirimleri",
    ],
    missing: ["Öne çıkarma", "Doping paketleri", "Analitik rapor"],
    cta: "Ücretsiz Başla",
    popular: false,
  },
  {
    id: "pro",
    name: "Profesyonel",
    price: "₺299",
    priceNote: "/ aylık · KDV dahil",
    color: "#16a34a",
    gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    icon: Star,
    features: [
      "5 aktif ilan",
      "Öncelikli arama sıralaması",
      "Gelişmiş profil rozeti",
      "Tüm doping paketleri",
      "Detaylı analitik rapor",
      "Öncelikli destek",
      "SMS + e-posta bildirimleri",
    ],
    missing: [],
    cta: "Hemen Başla",
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "₺599",
    priceNote: "/ aylık · KDV dahil",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    icon: Crown,
    features: [
      "Sınırsız ilan",
      "Anasayfa vitrini",
      "VIP rozeti & özel renk çerçeve",
      "Tüm doping paketleri dahil",
      "Gerçek zamanlı analitik",
      "Özel hesap yöneticisi",
      "API entegrasyon desteği",
    ],
    missing: [],
    cta: "Elite Ol",
    popular: false,
  },
];

// ─── Doping Packages Data ─────────────────────────────────────────────────────
const DOPINGS_MAIN = [
  {
    id: "anasayfa_one_cikan",
    icon: "⭐",
    iconColor: "#f59e0b",
    title: "Anasayfa Öne Çıkan Eğitmenler",
    desc: "İlanınız ana sayfanın 'Öne Çıkan Eğitmenler' slider bölümünde görüntülensin. Ziyaretçilerin ilk gördüğü alan!",
    badge: "En Popüler",
    badgeColor: "#f59e0b",
    durations: [
      { label: "1 Hafta", price: "₺199" },
      { label: "2 Hafta", price: "₺349" },
      { label: "1 Ay", price: "₺599" },
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
      { label: "1 Hafta", price: "₺149" },
      { label: "2 Hafta", price: "₺249" },
      { label: "1 Ay", price: "₺399" },
    ],
  },
];

const DOPINGS_SECONDARY = [
  {
    id: "kategori_listesi",
    icon: "📂",
    iconColor: "#3b82f6",
    title: "Kategori Listesi",
    desc: "İlanınız branşa ait Kategori Listesi sayfasında en üst sıralarda yer alsın. Doğru öğrenciye doğru anda ulaşın.",
    durations: [
      { label: "1 Hafta", price: "₺59" },
      { label: "2 Hafta", price: "₺99" },
      { label: "1 Ay", price: "₺179" },
    ],
  },
  {
    id: "sosyal_medya",
    icon: "📱",
    iconColor: "#ec4899",
    title: "Sosyal Medya Dopingi",
    desc: "Profiliniz ve ilanlarınız platformun sosyal medya hesaplarında paylaşılsın. Organik erişiminizi katlayın!",
    durations: [
      { label: "1 Paylaşım", price: "₺49" },
      { label: "3 Paylaşım", price: "₺119" },
    ],
  },
  {
    id: "detayli",
    icon: "🔍",
    iconColor: "#8b5cf6",
    title: "Detaylı Arama Vitrini",
    desc: "Web arayüzünde detaylı arama yapan alıcılara kolayca ulaşmak için hemen alın!",
    durations: [
      { label: "1 Hafta", price: "₺39" },
      { label: "2 Hafta", price: "₺69" },
      { label: "1 Ay", price: "₺119" },
    ],
  },
  {
    id: "kalin",
    icon: "✏️",
    iconColor: "#f97316",
    title: "Kalın Yazı & Renkli Çerçeve",
    desc: "İlanınız arama sonuç listelerinde kalın yazı ve renkli çerçevesiyle görüntülensin!",
    durations: [{ label: "İlan Yayın Süresince", price: "₺49" }],
    single: true,
  },
];

const DOPINGS_EXTRA = [
  {
    id: "acil",
    icon: "🚨",
    iconColor: "#ef4444",
    title: "Acil Acil",
    desc: '"Hemen satmam lazım" diyorsanız Acil Acil dopingini alın, ilanınız ana sayfa sol menüde yer alsın.',
    durations: [{ label: "1 Hafta", price: "₺79" }],
  },
  {
    id: "galeri",
    icon: "🖼️",
    iconColor: "#06b6d4",
    title: "Galeri Vitrini",
    desc: "Profilinizin fotoğraf galerisini ön plana çıkarın. Öğrenciler sizi daha kolay keşfetsin.",
    durations: [
      { label: "1 Hafta", price: "₺49" },
      { label: "1 Ay", price: "₺149" },
    ],
  },
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Doping satın almak için üye olmam gerekiyor mu?",
    a: "Evet, doping paketleri yalnızca kayıtlı eğitmenler tarafından satın alınabilir. Hesabınıza giriş yaparak ilan yönetimi sayfasından dopinglerinizi aktifleştirebilirsiniz.",
  },
  {
    q: "Ödeme yaptıktan sonra doping ne zaman aktif olur?",
    a: "Ödemeniz onaylandıktan sonra doping paketiniz genellikle birkaç dakika içinde aktif hale gelir. Aksaklık yaşarsanız destek ekibimizle iletişime geçin.",
  },
  {
    q: "Birden fazla doping aynı anda kullanılabilir mi?",
    a: "Evet! Farklı doping paketlerini aynı anda birlikte kullanabilirsiniz. Örneğin Anasayfa Vitrini ile Kalın Yazı & Renkli Çerçeveyi eş zamanlı aktif edebilirsiniz.",
  },
  {
    q: "Para iadesi mümkün mü?",
    a: "Doping paketi aktif edildikten sonra iade yapılmamaktadır. Paketi satın almadan önce ihtiyacınıza uygun olduğundan emin olunuz.",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [showAllDopings, setShowAllDopings] = useState(false);

  const handleDurationChange = (id, idx) => {
    setSelectedDurations((prev) => ({ ...prev, [id]: idx }));
  };

  const getPrice = (doping) => {
    const idx = selectedDurations[doping.id] ?? 0;
    return doping.durations[idx]?.price ?? doping.durations[0]?.price;
  };

  const getDurationLabel = (doping) => {
    const idx = selectedDurations[doping.id] ?? 0;
    return doping.durations[idx]?.label ?? doping.durations[0]?.label;
  };

  return (
    <PageWrapper>
      {/* ── Hero ── */}
      <HeroSection>
        <HeroBadge>
          <Sparkles size={14} />
          Şeffaf Fiyatlandırma
        </HeroBadge>
        <HeroTitle>
          Kariyerinizi Hızlandıran <GradientText>Planlar</GradientText>
        </HeroTitle>
        <HeroSub>
          Başlamak ücretsiz. Büyümek için güçlü araçlar. <br />
          İhtiyacınıza en uygun planı seçin ve fark yaratın.
        </HeroSub>
      </HeroSection>

      {/* ── Pricing Cards ── */}
      <Section>
        <Container>
          <PlansGrid>
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <PlanCard
                  key={plan.id}
                  $popular={plan.popular}
                  $color={plan.color}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {plan.popular && (
                    <PopularBadge>
                      <Zap size={12} />
                      En Çok Tercih Edilen
                    </PopularBadge>
                  )}
                  <PlanIconWrap $color={plan.color} $popular={plan.popular}>
                    <Icon size={26} />
                  </PlanIconWrap>
                  <PlanName $popular={plan.popular}>{plan.name}</PlanName>
                  <PlanPrice $popular={plan.popular}>
                    {plan.price}
                    {plan.price !== "Ücretsiz" && (
                      <PlanPriceSup>TL</PlanPriceSup>
                    )}
                  </PlanPrice>
                  <PlanPriceNote $popular={plan.popular}>
                    {plan.priceNote}
                  </PlanPriceNote>

                  <Divider $popular={plan.popular} />

                  <FeatureList>
                    {plan.features.map((f) => (
                      <FeatureItem key={f} $popular={plan.popular}>
                        <FeatureCheck $popular={plan.popular}>
                          <Check size={13} strokeWidth={3} />
                        </FeatureCheck>
                        {f}
                      </FeatureItem>
                    ))}
                    {plan.missing.map((f) => (
                      <FeatureItem key={f} $missing>
                        <FeatureMissing>✕</FeatureMissing>
                        {f}
                      </FeatureItem>
                    ))}
                  </FeatureList>

                  <PlanCta $popular={plan.popular} $color={plan.color}>
                    {plan.cta}
                  </PlanCta>
                </PlanCard>
              );
            })}
          </PlansGrid>
        </Container>
      </Section>

      {/* ── Doping Section ── */}
      <DopingSection>
        <Container>
          <SectionBadge>
            <Rocket size={14} />
            Doping Paketleri
          </SectionBadge>
          <SectionTitle>
            Daha Fazla Alıcıya{" "}
            <GradientText>Ulaşmak İster Misiniz?</GradientText>
          </SectionTitle>
          <SectionSub>
            Doping alın, ilanınızın <strong>73×</strong> kata kadar daha fazla
            görüntülenmesini sağlayın.
          </SectionSub>

          {/* Ana Dopingler */}
          <DopingSubTitle>
            <Star size={16} />
            Sizin İçin Seçtiklerimiz
          </DopingSubTitle>
          <DopingGrid $cols={2}>
            {DOPINGS_MAIN.map((doping) => (
              <DopingCard key={doping.id} $featured>
                {doping.badge && (
                  <DopingBadge $color={doping.badgeColor}>
                    {doping.badge}
                  </DopingBadge>
                )}
                <DopingCardInner>
                  <DopingEmoji>{doping.icon}</DopingEmoji>
                  <DopingInfo>
                    <DopingTitle>{doping.title}</DopingTitle>
                    <DopingDesc>{doping.desc}</DopingDesc>
                  </DopingInfo>
                </DopingCardInner>
                <DopingFooter>
                  {doping.durations.length > 1 ? (
                    <DurationSelect
                      value={selectedDurations[doping.id] ?? 0}
                      onChange={(e) =>
                        handleDurationChange(doping.id, Number(e.target.value))
                      }
                    >
                      {doping.durations.map((d, i) => (
                        <option key={i} value={i}>
                          {d.label}
                        </option>
                      ))}
                    </DurationSelect>
                  ) : (
                    <DurationLabel>{getDurationLabel(doping)}</DurationLabel>
                  )}
                  <DopingPrice $color={doping.iconColor}>
                    {getPrice(doping)}
                  </DopingPrice>
                </DopingFooter>
              </DopingCard>
            ))}
          </DopingGrid>

          {/* Diğer Dopingler Toggle */}
          <OtherDopingsToggle onClick={() => setShowAllDopings((v) => !v)}>
            <span>Diğer Dopingler</span>
            {showAllDopings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </OtherDopingsToggle>

          {showAllDopings && (
            <>
              <DopingGrid $cols={2} style={{ marginTop: "0" }}>
                {DOPINGS_SECONDARY.map((doping) => (
                  <DopingCard key={doping.id}>
                    <DopingCardInner>
                      <DopingEmoji $small>{doping.icon}</DopingEmoji>
                      <DopingInfo>
                        <DopingTitle $small>{doping.title}</DopingTitle>
                        <DopingDesc $small>{doping.desc}</DopingDesc>
                      </DopingInfo>
                    </DopingCardInner>
                    <DopingFooter>
                      {!doping.single && doping.durations.length > 1 ? (
                        <DurationSelect
                          value={selectedDurations[doping.id] ?? 0}
                          onChange={(e) =>
                            handleDurationChange(
                              doping.id,
                              Number(e.target.value)
                            )
                          }
                        >
                          {doping.durations.map((d, i) => (
                            <option key={i} value={i}>
                              {d.label}
                            </option>
                          ))}
                        </DurationSelect>
                      ) : (
                        <DurationLabel>{getDurationLabel(doping)}</DurationLabel>
                      )}
                      <DopingPrice $color={doping.iconColor}>
                        {getPrice(doping)}
                      </DopingPrice>
                    </DopingFooter>
                  </DopingCard>
                ))}
              </DopingGrid>

              <DopingGrid $cols={2} style={{ marginTop: "16px" }}>
                {DOPINGS_EXTRA.map((doping) => (
                  <DopingCard key={doping.id}>
                    <DopingCardInner>
                      <DopingEmoji $small>{doping.icon}</DopingEmoji>
                      <DopingInfo>
                        <DopingTitle $small>{doping.title}</DopingTitle>
                        <DopingDesc $small>{doping.desc}</DopingDesc>
                      </DopingInfo>
                    </DopingCardInner>
                    <DopingFooter>
                      {doping.durations.length > 1 ? (
                        <DurationSelect
                          value={selectedDurations[doping.id] ?? 0}
                          onChange={(e) =>
                            handleDurationChange(
                              doping.id,
                              Number(e.target.value)
                            )
                          }
                        >
                          {doping.durations.map((d, i) => (
                            <option key={i} value={i}>
                              {d.label}
                            </option>
                          ))}
                        </DurationSelect>
                      ) : (
                        <DurationLabel>{getDurationLabel(doping)}</DurationLabel>
                      )}
                      <DopingPrice $color={doping.iconColor}>
                        {getPrice(doping)}
                      </DopingPrice>
                    </DopingFooter>
                  </DopingCard>
                ))}
              </DopingGrid>
            </>
          )}
        </Container>
      </DopingSection>

      {/* ── Trust Strip ── */}
      <TrustStrip>
        <Container>
          <TrustGrid>
            {[
              { icon: <ShieldCheck size={22} />, text: "256-bit SSL Güvenlik" },
              { icon: <Zap size={22} />, text: "Anında Aktivasyon" },
              { icon: <TrendingUp size={22} />, text: "Kanıtlanmış Büyüme" },
              { icon: <Sparkles size={22} />, text: "7/24 Destek" },
            ].map((t) => (
              <TrustItem key={t.text}>
                <TrustIcon>{t.icon}</TrustIcon>
                <TrustText>{t.text}</TrustText>
              </TrustItem>
            ))}
          </TrustGrid>
        </Container>
      </TrustStrip>

      {/* ── FAQ ── */}
      <Section style={{ paddingBottom: "80px" }}>
        <Container>
          <SectionBadge>
            <Search size={14} />
            Sık Sorulan Sorular
          </SectionBadge>
          <SectionTitle style={{ marginBottom: "40px" }}>
            Aklınızdaki <GradientText>Sorular</GradientText>
          </SectionTitle>
          <FaqList>
            {FAQS.map((faq, i) => (
              <FaqItem key={i}>
                <FaqQuestion
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </FaqQuestion>
                {openFaq === i && <FaqAnswer>{faq.a}</FaqAnswer>}
              </FaqItem>
            ))}
          </FaqList>
        </Container>
      </Section>
    </PageWrapper>
  );
}

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  background: var(--page-bg);
`;

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Section = styled.section`
  padding: 40px 0 60px;
`;

// ── Hero ──────────────────────────────────────────────────────────────────────
const HeroSection = styled.div`
  text-align: center;
  padding: 80px 24px 48px;
  max-width: 760px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.6s ease both;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 24px;
  border: 1px solid #bbf7d0;

  .dark & {
    background: rgba(22, 163, 74, 0.15);
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.25);
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
`;

const HeroSub = styled.p`
  font-size: 17px;
  color: #64748b;
  line-height: 1.7;

  .dark & {
    color: var(--text-muted);
  }
`;

// ── Plans ─────────────────────────────────────────────────────────────────────
const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 420px;
    margin: 0 auto;
  }
`;

const PlanCard = styled.div`
  position: relative;
  background: ${({ $popular }) =>
    $popular ? "linear-gradient(145deg, #16a34a 0%, #15803d 100%)" : "white"};
  border-radius: 24px;
  padding: 36px 28px;
  border: ${({ $popular }) => ($popular ? "none" : "1.5px solid #e2e8f0")};
  box-shadow: ${({ $popular }) =>
    $popular
      ? "0 24px 60px -10px rgba(22,163,74,0.45)"
      : "0 4px 24px rgba(0,0,0,0.05)"};
  animation: ${fadeInUp} 0.5s ease both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: ${({ $popular }) =>
      $popular
        ? "0 32px 70px -10px rgba(22,163,74,0.55)"
        : "0 16px 40px rgba(0,0,0,0.1)"};
  }

  .dark & {
    background: ${({ $popular }) =>
      $popular
        ? "linear-gradient(145deg, #16a34a 0%, #15803d 100%)"
        : "var(--card-bg)"};
    border-color: ${({ $popular }) =>
      $popular ? "transparent" : "var(--card-border)"};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  color: #1c1917;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
`;

const PlanIconWrap = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${({ $popular }) =>
    $popular ? "rgba(255,255,255,0.2)" : "#f0fdf4"};
  color: ${({ $popular, $color }) => ($popular ? "#fff" : $color)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  animation: ${float} 3s ease-in-out infinite;

  .dark & {
    background: ${({ $popular }) =>
      $popular ? "rgba(255,255,255,0.2)" : "rgba(22,163,74,0.15)"};
    color: ${({ $popular }) => ($popular ? "#fff" : "#4ade80")};
  }
`;

const PlanName = styled.div`
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $popular }) =>
    $popular ? "rgba(255,255,255,0.7)" : "#94a3b8"};
  margin-bottom: 8px;
`;

const PlanPrice = styled.div`
  font-size: 44px;
  font-weight: 900;
  color: ${({ $popular }) => ($popular ? "#fff" : "var(--text-primary)")};
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
`;

const PlanPriceSup = styled.sup`
  font-size: 18px;
  font-weight: 700;
  margin-top: 6px;
`;

const PlanPriceNote = styled.div`
  font-size: 13px;
  color: ${({ $popular }) =>
    $popular ? "rgba(255,255,255,0.6)" : "#94a3b8"};
  margin-bottom: 24px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid
    ${({ $popular }) =>
      $popular ? "rgba(255,255,255,0.2)" : "#f1f5f9"};
  margin: 0 0 24px;

  .dark & {
    border-color: ${({ $popular }) =>
      $popular ? "rgba(255,255,255,0.2)" : "var(--card-border)"};
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $popular, $missing }) =>
    $missing
      ? "#94a3b8"
      : $popular
      ? "rgba(255,255,255,0.9)"
      : "var(--text-primary)"};
  text-decoration: ${({ $missing }) => ($missing ? "line-through" : "none")};
`;

const FeatureCheck = styled.span`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: ${({ $popular }) =>
    $popular ? "rgba(255,255,255,0.25)" : "#f0fdf4"};
  color: ${({ $popular }) => ($popular ? "#fff" : "#16a34a")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;

  .dark & {
    background: ${({ $popular }) =>
      $popular ? "rgba(255,255,255,0.25)" : "rgba(22,163,74,0.2)"};
    color: ${({ $popular }) => ($popular ? "#fff" : "#4ade80")};
  }
`;

const FeatureMissing = styled.span`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: #f8fafc;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-top: 1px;
  font-weight: 700;

  .dark & {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const PlanCta = styled.button`
  width: 100%;
  padding: 15px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  background: ${({ $popular, $color }) => ($popular ? "white" : $color)};
  color: ${({ $popular, $color }) => ($popular ? $color : "white")};
  border: none;
  box-shadow: ${({ $popular }) =>
    $popular ? "0 4px 20px rgba(255,255,255,0.3)" : "none"};

  &:hover {
    transform: translateY(-2px);
    opacity: 0.92;
  }
`;

// ── Doping Section ─────────────────────────────────────────────────────────────
const DopingSection = styled.section`
  padding: 60px 0;
  background: white;

  .dark & {
    background: var(--card-bg);
  }
`;

const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 20px;
  border: 1px solid #bbf7d0;

  .dark & {
    background: rgba(22, 163, 74, 0.15);
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.25);
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
`;

const SectionSub = styled.p`
  font-size: 16px;
  color: #64748b;
  margin-bottom: 48px;

  strong {
    color: #16a34a;
    font-weight: 800;
  }

  .dark & {
    color: var(--text-muted);
  }
`;

const DopingSubTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 20px;

  .dark & {
    color: #4ade80;
  }
`;

const DopingGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => `repeat(${$cols ?? 2}, 1fr)`};
  gap: 20px;
  margin-bottom: 8px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const DopingCard = styled.div`
  position: relative;
  background: ${({ $featured }) => ($featured ? "#fafffe" : "#f8fafc")};
  border: ${({ $featured }) =>
    $featured ? "1.5px solid #bbf7d0" : "1.5px solid #e2e8f0"};
  border-radius: 20px;
  padding: 22px 22px 16px;
  transition: transform 0.25s, box-shadow 0.25s;
  animation: ${fadeInUp} 0.5s ease both;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(22, 163, 74, 0.12);
    border-color: #86efac;
  }

  .dark & {
    background: ${({ $featured }) =>
      $featured ? "rgba(22,163,74,0.08)" : "var(--page-bg)"};
    border-color: ${({ $featured }) =>
      $featured ? "rgba(74,222,128,0.3)" : "var(--card-border)"};
  }
`;

const DopingBadge = styled.span`
  position: absolute;
  top: -10px;
  left: 18px;
  background: ${({ $color }) => $color ?? "#16a34a"};
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 999px;
  letter-spacing: 0.05em;
`;

const DopingCardInner = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const DopingEmoji = styled.div`
  font-size: ${({ $small }) => ($small ? "28px" : "36px")};
  line-height: 1;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
`;

const DopingInfo = styled.div`
  flex: 1;
`;

const DopingTitle = styled.div`
  font-size: ${({ $small }) => ($small ? "14px" : "16px")};
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const DopingDesc = styled.div`
  font-size: ${({ $small }) => ($small ? "12px" : "13px")};
  color: #64748b;
  line-height: 1.55;

  .dark & {
    color: var(--text-muted);
  }
`;

const DopingFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  gap: 10px;

  .dark & {
    border-color: var(--card-border);
  }
`;

const DurationSelect = styled.select`
  padding: 6px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #16a34a;
  }

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    color: var(--text-primary);
  }
`;

const DurationLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;

  .dark & {
    color: var(--text-muted);
  }
`;

const DopingPrice = styled.span`
  font-size: 20px;
  font-weight: 900;
  color: ${({ $color }) => $color ?? "#16a34a"};
`;

const OtherDopingsToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 28px auto 20px;
  padding: 10px 28px;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #16a34a;
    color: #16a34a;
    background: #f0fdf4;
  }

  .dark & {
    border-color: var(--card-border);
    color: var(--text-primary);

    &:hover {
      border-color: #4ade80;
      color: #4ade80;
      background: rgba(22, 163, 74, 0.1);
    }
  }
`;

// ── Trust Strip ────────────────────────────────────────────────────────────────
const TrustStrip = styled.section`
  padding: 40px 0;
  background: linear-gradient(135deg, #052e16 0%, #15803d 100%);
`;

const TrustGrid = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TrustIcon = styled.div`
  color: #4ade80;
`;

const TrustText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: white;
`;

// ── FAQ ────────────────────────────────────────────────────────────────────────
const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
`;

const FaqItem = styled.div`
  background: white;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
  transition: border-color 0.2s;

  &:hover {
    border-color: #bbf7d0;
  }

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
  }
`;

const FaqQuestion = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  gap: 12px;

  svg {
    flex-shrink: 0;
    color: #16a34a;
  }

  .dark & svg {
    color: #4ade80;
  }
`;

const FaqAnswer = styled.div`
  padding: 16px 24px 20px;
  font-size: 14px;
  line-height: 1.7;
  color: #64748b;
  border-top: 1px solid #f1f5f9;

  .dark & {
    color: var(--text-muted);
    border-color: var(--card-border);
  }
`;
