import React, { useState } from "react";
import styled from "styled-components";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { sendContactMessage } from "@/services/contactService";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasyonlar
    if (!formData.name.trim()) {
      toast.error("Lütfen adınızı ve soyadınızı yazın.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    if (!formData.subject.trim()) {
      toast.error("Lütfen bir konu başlığı yazın.");
      return;
    }
    if (formData.message.trim().length < 10) {
      toast.error("Mesajınız en az 10 karakter olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      });
      toast.success("Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağız.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.message || "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <HeaderSection>
        <Badge>İletişim</Badge>
        <Title>Bize Ulaşın</Title>
        <Subtitle>
          Sorularınız, önerileriniz veya iş birlikleri için bizimle iletişime
          geçmekten çekinmeyin. Size yardımcı olmaktan mutluluk duyarız.
        </Subtitle>
      </HeaderSection>

      <ContentContainer>
        <ContactGrid>
          {/* İletişim Formu */}
          <FormSection onSubmit={handleSubmit}>
            <SectionTitle>
              <MessageSquare size={24} className="icon" />
              Mesaj Gönderin
            </SectionTitle>

            <InputGroup>
              <label htmlFor="name">Adınız Soyadınız</label>
              <input
                type="text"
                id="name"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <InputGroup>
              <label htmlFor="email">E-posta Adresiniz</label>
              <input
                type="email"
                id="email"
                placeholder="Örn: [EMAIL_ADDRESS]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <InputGroup>
              <label htmlFor="subject">Konu</label>
              <input
                type="text"
                id="subject"
                placeholder="Mesajınızın konusu"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <InputGroup>
              <label htmlFor="message">Mesajınız</label>
              <textarea
                id="message"
                rows="5"
                placeholder="Lütfen mesajınızı buraya yazın..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </InputGroup>

            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Gönderiliyor..."
              ) : (
                <>
                  Mesajı Gönder <Send size={18} />
                </>
              )}
            </SubmitButton>
          </FormSection>

          {/* İletişim Bilgileri */}
          <InfoSection>
            <InfoCard>
              <SectionTitle>İletişim Bilgilerimiz</SectionTitle>
              <InfoDesc>
                Aşağıdaki kanallardan bize direkt olarak ulaşabilirsiniz.
                Müşteri temsilcilerimiz en kısa sürede size dönüş yapacaktır.
              </InfoDesc>

              <InfoList>
                <InfoItem>
                  <IconCircle className="blue">
                    <Phone size={20} />
                  </IconCircle>
                  <InfoDetails>
                    <h4>Telefon</h4>
                    <p>deneme</p>
                  </InfoDetails>
                </InfoItem>

                <InfoItem>
                  <IconCircle className="green">
                    <Mail size={20} />
                  </IconCircle>
                  <InfoDetails>
                    <h4>E-posta</h4>
                    <p>destek@ozeldersvip.com</p>
                  </InfoDetails>
                </InfoItem>

                <InfoItem>
                  <IconCircle className="purple">
                    <MapPin size={20} />
                  </IconCircle>
                  <InfoDetails>
                    <h4>Adres</h4>
                    <p>
                      Deneme
                      <br />
                      Deneme
                    </p>
                  </InfoDetails>
                </InfoItem>
              </InfoList>

              <MapContainer>
                {/* Temsili Google Haritalar iframe'i (Şu an placeholder renkli kutu) */}
                <div className="map-placeholder">
                  <MapPin size={32} />
                  <span>Harita Görünümü</span>
                </div>
              </MapContainer>
            </InfoCard>
          </InfoSection>
        </ContactGrid>
      </ContentContainer>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;

  .dark & {
    background: var(--page-bg);
  }
`;

const HeaderSection = styled.div`
  padding: 80px 20px 40px;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px 30px;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 24px;

  .dark & {
    background: rgba(22, 163, 74, 0.2);
    color: #4ade80;
  }
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;

  .dark & {
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;

  .dark & {
    color: var(--text-muted);
  }
`;

const ContentContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 40px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.form`
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 600px) {
    padding: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  .icon {
    color: #16a34a;
  }

  .dark & {
    color: var(--text-primary);
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);

    .dark & {
      color: var(--text-primary);
    }
  }

  input,
  textarea {
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    background: #f8fafc;
    color: var(--text-primary);
    transition: all 0.2s;
    outline: none;

    .dark & {
      background: var(--page-bg);
      border-color: var(--card-border);
      color: var(--text-primary);
    }

    &:focus {
      border-color: #16a34a;
      background: white;
      box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);

      .dark & {
        background: var(--page-bg);
      }
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #16a34a;
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  margin-top: 10px;

  &:hover {
    background: #15803d;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  flex-grow: 1;

  .dark & {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 600px) {
    padding: 24px;
  }
`;

const InfoDesc = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 30px;

  .dark & {
    color: var(--text-muted);
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.blue {
    background: #f0fdf4;
    color: #16a34a;
    .dark & {
      background: rgba(22, 163, 74, 0.2);
      color: #4ade80;
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
`;

const InfoDetails = styled.div`
  h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;

    .dark & {
      color: var(--text-primary);
    }
  }

  p {
    font-size: 15px;
    color: var(--text-muted);
    line-height: 1.5;

    .dark & {
      color: var(--text-primary);
    }
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;

  .dark & {
    border-color: var(--card-border);
  }

  .map-placeholder {
    width: 100%;
    height: 100%;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    gap: 8px;

    .dark & {
      background: var(--page-bg);
      color: var(--text-muted);
    }

    span {
      font-weight: 600;
      font-size: 14px;
    }
  }
`;

export default Contact;
