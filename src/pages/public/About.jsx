import React from "react";
import styled from "styled-components";
import {
  BookOpen,
  Users,
  ShieldCheck,
  Target,
  Award,
  Star,
} from "lucide-react";

const About = () => {
  return (
    <PageWrapper>
      <HeroSection>
        <Badge>Hakkımızda</Badge>
        <Title>
          Öğrenmenin En İyi Yolu, <br />
          <Highlight>Özel Ders VIP</Highlight>
        </Title>
        <Subtitle>
          Öğrencileri Türkiye'nin en iyi öğretmenleriyle bir araya getiren
          yenilikçi eğitim platformu.
        </Subtitle>
      </HeroSection>

      <StatsContainer>
        <StatsWrapper>
          <StatCard>
            <StatValue>1000+</StatValue>
            <StatLabel>Aktif Öğrenci</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>500+</StatValue>
            <StatLabel>Uzman Öğretmen</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>50+</StatValue>
            <StatLabel>Farklı Branş</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>%98</StatValue>
            <StatLabel>Memnuniyet Oranı</StatLabel>
          </StatCard>
        </StatsWrapper>
      </StatsContainer>

      <FeaturesSection>
        <SectionTitle>Neden Bizi Seçmelisiniz?</SectionTitle>
        <Grid>
          <FeatureCard>
            <IconWrapper className="blue">
              <Users size={24} />
            </IconWrapper>
            <FeatureTitle>Birebir İlgi</FeatureTitle>
            <FeatureDesc>
              Size özel hazırlanan ders programlarıyla eksiklerinizi en hızlı
              şekilde kapatın.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconWrapper className="green">
              <ShieldCheck size={24} />
            </IconWrapper>
            <FeatureTitle>Güvenilir Eğitmenler</FeatureTitle>
            <FeatureDesc>
              Tüm eğitmenlerimiz titiz bir mülakat ve onay sürecinden geçtikten
              sonra sisteme dahil edilir.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconWrapper className="purple">
              <Target size={24} />
            </IconWrapper>
            <FeatureTitle>Hedefe Yönelik</FeatureTitle>
            <FeatureDesc>
              Sınavlara hazırlık veya okul takviyesi; hedefinize en uygun
              öğretmeni kolayca bulun.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconWrapper className="orange">
              <Award size={24} />
            </IconWrapper>
            <FeatureTitle>Kalite Garantisi</FeatureTitle>
            <FeatureDesc>
              Derslerden memnun kalmazsanız paranız güvence altında, anında
              destek hizmeti.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconWrapper className="pink">
              <Star size={24} />
            </IconWrapper>
            <FeatureTitle>Öğrenci Yorumları</FeatureTitle>
            <FeatureDesc>
              Öğretmenler hakkında yapılan şeffaf yorumları okuyarak en doğru
              kararı verin.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <IconWrapper className="teal">
              <BookOpen size={24} />
            </IconWrapper>
            <FeatureTitle>Geniş Kaynak</FeatureTitle>
            <FeatureDesc>
              Ders materyallerine ve ek kaynaklara platformumuz üzerinden
              kolayca erişin.
            </FeatureDesc>
          </FeatureCard>
        </Grid>
      </FeaturesSection>

      <MissionSection>
        <MissionContent>
          <SectionTitle>Misyonumuz</SectionTitle>
          <MissionText>
            Eğitimde fırsat eşitliğini sağlamak ve bilgiye ulaşımı herkes için
            kolaylaştırmak amacıyla yola çıktık. Amacımız, öğrenme tutkusunu
            canlandırmak ve öğrencilerin kendi potansiyellerini en üst seviyeye
            çıkarmalarına rehberlik etmektir. Teknolojinin gücünü eğitimin
            kalitesiyle birleştirerek, Türkiye'nin her köşesindeki öğrenciyi en
            iyi eğitmenlerle buluşturmayı hedefliyoruz.
          </MissionText>
        </MissionContent>
      </MissionSection>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 60px;
  overflow-x: hidden;

  .dark & {
    background: #0f172a;
  }
`;

const HeroSection = styled.div`
  padding: 80px 20px 60px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px 40px;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 24px;

  .dark & {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 20px;

  .dark & {
    color: #f8fafc;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Highlight = styled.span`
  color: #3b82f6;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;

  .dark & {
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const StatsContainer = styled.div`
  padding: 0 20px;
  margin-bottom: 80px;
`;

const StatsWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  background: white;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);

  .dark & {
    background: #1e293b;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  text-align: center;
  padding: 10px;
`;

const StatValue = styled.h3`
  font-size: 36px;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 8px;

  .dark & {
    color: #60a5fa;
  }
`;

const StatLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .dark & {
    color: #cbd5e1;
  }
`;

const FeaturesSection = styled.div`
  max-width: 1100px;
  margin: 0 auto 80px;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 40px;

  .dark & {
    color: #f8fafc;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FeatureCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  .dark & {
    background: #1e293b;
    border-color: #334155;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);

    .dark & {
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
    }
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  &.blue {
    background: #eff6ff;
    color: #3b82f6;
    .dark & {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
  }
  &.green {
    background: #f0fdf4;
    color: #22c55e;
    .dark & {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }
  }
  &.purple {
    background: #faf5ff;
    color: #a855f7;
    .dark & {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
    }
  }
  &.orange {
    background: #fff7ed;
    color: #f97316;
    .dark & {
      background: rgba(249, 115, 22, 0.2);
      color: #fb923c;
    }
  }
  &.pink {
    background: #fdf2f8;
    color: #ec4899;
    .dark & {
      background: rgba(236, 72, 153, 0.2);
      color: #f472b6;
    }
  }
  &.teal {
    background: #f0fdfa;
    color: #14b8a6;
    .dark & {
      background: rgba(20, 184, 166, 0.2);
      color: #2dd4bf;
    }
  }
`;

const FeatureTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;

  .dark & {
    color: #f8fafc;
  }
`;

const FeatureDesc = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;

  .dark & {
    color: #94a3b8;
  }
`;

const MissionSection = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
`;

const MissionContent = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 50px;
  border-radius: 24px;
  text-align: center;
  color: white;
  box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.4);

  .dark & {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6);
  }

  ${SectionTitle} {
    color: white;
    margin-bottom: 20px;

    .dark & {
      color: white;
    }
  }

  @media (max-width: 600px) {
    padding: 40px 20px;
  }
`;

const MissionText = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  max-width: 700px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export default About;
