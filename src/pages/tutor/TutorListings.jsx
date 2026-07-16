import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Globe,
  Monitor,
  Home as HomeIcon,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import {
  getMyListings,
  deleteListing,
  publishListing,
  unpublishListing,
} from "@/services/tutorService";
import { resolveMediaUrl } from "@/utils/helpers";
import toast from "react-hot-toast";

export default function TutorListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null); // Detay modalı için

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await getMyListings();
      // Array normalize işlemi
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray(data.items)) list = data.items;
      else if (data && Array.isArray(data.$values)) list = data.$values;
      else if (data && Array.isArray(data.data)) list = data.data;

      setListings(list);
    } catch (err) {
      toast.error(err.message || "İlanlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (id, isPublished) => {
    setActionLoadingId(id);
    try {
      if (isPublished) {
        await unpublishListing(id);
        toast.success("İlan yayından kaldırıldı.");
      } else {
        await publishListing(id);
        toast.success("İlan başarıyla yayına alındı.");
      }
      // Listeyi güncelle
      setListings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !isPublished } : item
        )
      );
    } catch (err) {
      toast.error(err.message || "İşlem gerçekleştirilemedi.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.");
    if (!confirm) return;

    setActionLoadingId(id);
    try {
      await deleteListing(id);
      toast.success("İlan başarıyla silindi.");
      setListings((prev) => prev.filter((item) => item.id !== id));
      if (selectedListing?.id === id) setSelectedListing(null);
    } catch (err) {
      toast.error(err.message || "İlan silinirken bir hata oluştu.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const translateServiceType = (type) => {
    if (!type) return "Belirtilmemiş";
    const t = type.toString().toLowerCase();
    if (t === "online" || t === "1" || t === "onlineonly") return "Uzaktan / Online";
    if (t === "facetoface" || t === "2" || t === "face_to_face" || t === "f2f") return "Yüz Yüze";
    if (t === "both" || t === "3" || t === "onlineandfacetoface") return "Her İkisi";
    return type;
  };

  const getServiceTypeIcon = (type) => {
    if (!type) return <Globe size={14} />;
    const t = type.toString().toLowerCase();
    if (t === "online" || t === "1" || t === "onlineonly") return <Monitor size={14} />;
    if (t === "facetoface" || t === "2" || t === "face_to_face" || t === "f2f") return <HomeIcon size={14} />;
    return <Globe size={14} />;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={40} />
        <p>İlanlarınız Yükleniyor...</p>
      </LoadingContainer>
    );
  }

  return (
    <PageWrapper>
      <HeaderSection>
        <div>
          <Title>İlanlarım</Title>
          <Subtitle>Oluşturduğunuz ders ilanlarını buradan yönetebilirsiniz.</Subtitle>
        </div>
        <CreateBtn to="/tutor/create-listing">
          <Plus size={18} /> Yeni İlan Ver
        </CreateBtn>
      </HeaderSection>

      {listings.length === 0 ? (
        <EmptyState>
          <AlertCircle size={48} />
          <h3>Henüz Hiç İlanınız Yok</h3>
          <p>Öğrencilerin sizi bulabilmesi için hemen ilk ders ilanınızı oluşturun!</p>
          <EmptyCreateBtn to="/tutor/create-listing">
            İlk İlanını Oluştur
          </EmptyCreateBtn>
        </EmptyState>
      ) : (
        <ListingsGrid>
          {listings.map((item) => {
            const mainPhoto =
              item.photos?.find((p) => p.isMain)?.photoUrl ||
              item.photos?.[0]?.photoUrl ||
              item.photoUrl ||
              item.imageUrl ||
              null;

            const isPublished = item.isActive;

            return (
              <ListingCard key={item.id} $isPublished={isPublished}>
                <CardImageWrapper>
                  {mainPhoto ? (
                    <img src={resolveMediaUrl(mainPhoto)} alt={item.title} />
                  ) : (
                    <PlaceholderImage>
                      <BookOpen size={40} />
                    </PlaceholderImage>
                  )}
                  <StatusBadge $isPublished={isPublished}>
                    {isPublished ? (
                      <>
                        <CheckCircle size={12} /> Yayında
                      </>
                    ) : (
                      <>
                        <XCircle size={12} /> Taslak / Pasif
                      </>
                    )}
                  </StatusBadge>
                </CardImageWrapper>

                <CardContent>
                  <CategoryText>
                    {item.category} {item.subCategory && `• ${item.subCategory}`}
                  </CategoryText>
                  <CardTitle>{item.title || item.subjectName || "Ders İlanı"}</CardTitle>
                  <DescriptionSnippet>
                    {item.description
                      ? item.description.replace(/---LESSON_RATES_JSON---[\s\S]*?---END_LESSON_RATES_JSON---/, "").replace(/<[^>]*>/g, "").substring(0, 95) + "..."
                      : "Açıklama belirtilmemiş."}
                  </DescriptionSnippet>

                  <MetaGrid>
                    <MetaItem>
                      <DollarSign size={14} />
                      <span>{item.price} TL / sa</span>
                    </MetaItem>
                    <MetaItem>
                      <Clock size={14} />
                      <span>{item.lessonDuration} dk</span>
                    </MetaItem>
                    <MetaItem>
                      {getServiceTypeIcon(item.serviceType)}
                      <span>{translateServiceType(item.serviceType)}</span>
                    </MetaItem>
                    <MetaItem>
                      <MapPin size={14} />
                      <span>{item.cityName || "Online"}</span>
                    </MetaItem>
                  </MetaGrid>
                </CardContent>

                <CardActions>
                  <ActionButton
                    title="Detayları Gör"
                    onClick={() => setSelectedListing(item)}
                    disabled={actionLoadingId === item.id}
                  >
                    <Eye size={16} />
                  </ActionButton>
                  <ActionButton
                    as={Link}
                    to={`/tutor/listings/${item.id}/edit`}
                    title="İlanı Düzenle"
                    disabled={actionLoadingId === item.id}
                  >
                    <Edit size={16} />
                  </ActionButton>
                  <PublishButton
                    $isPublished={isPublished}
                    onClick={() => handlePublishToggle(item.id, isPublished)}
                    disabled={actionLoadingId === item.id}
                  >
                    {actionLoadingId === item.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : isPublished ? (
                      "Yayından Kaldır"
                    ) : (
                      "Yayına Al"
                    )}
                  </PublishButton>
                  <DeleteButton
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoadingId === item.id}
                    title="İlanı Sil"
                  >
                    <Trash2 size={16} />
                  </DeleteButton>
                </CardActions>
              </ListingCard>
            );
          })}
        </ListingsGrid>
      )}

      {/* Detay Modalı */}
      {selectedListing && (
        <ModalOverlay onClick={() => setSelectedListing(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseBtn onClick={() => setSelectedListing(null)}>&times;</ModalCloseBtn>
            <ModalHeader>
              <ModalCategory>
                {selectedListing.category} • {selectedListing.subCategory}
              </ModalCategory>
              <ModalTitle>{selectedListing.title || selectedListing.subjectName || "İlan Detayı"}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <ModalImageContainer>
                  {selectedListing.photos?.find((p) => p.isMain)?.photoUrl || selectedListing.photos?.[0]?.photoUrl ? (
                    <img
                      src={resolveMediaUrl(
                        selectedListing.photos?.find((p) => p.isMain)?.photoUrl || selectedListing.photos?.[0]?.photoUrl
                      )}
                      alt="İlan Resmi"
                    />
                  ) : (
                    <div className="placeholder">
                      <BookOpen size={48} />
                    </div>
                  )}
                </ModalImageContainer>
                <div className="flex-1 space-y-4">
                  <DetailMetaGrid>
                    <DetailMetaCard>
                      <DollarSign size={18} />
                      <div>
                        <div className="lbl">Ders Ücreti</div>
                        <div className="val">{selectedListing.price} TL / Saat</div>
                      </div>
                    </DetailMetaCard>
                    <DetailMetaCard>
                      <Clock size={18} />
                      <div>
                        <div className="lbl">Ders Süresi</div>
                        <div className="val">{selectedListing.lessonDuration} Dakika</div>
                      </div>
                    </DetailMetaCard>
                    <DetailMetaCard>
                      {getServiceTypeIcon(selectedListing.serviceType)}
                      <div>
                        <div className="lbl">Hizmet Tipi</div>
                        <div className="val">{translateServiceType(selectedListing.serviceType)}</div>
                      </div>
                    </DetailMetaCard>
                    <DetailMetaCard>
                      <MapPin size={18} />
                      <div>
                        <div className="lbl">Konum</div>
                        <div className="val">
                          {selectedListing.cityName
                            ? `${selectedListing.cityName} / ${selectedListing.districtName || ""}`
                            : "Online"}
                        </div>
                      </div>
                    </DetailMetaCard>
                  </DetailMetaGrid>
                  <div className="pt-2">
                    <span className="font-bold mr-2 text-gray-700 dark:text-slate-200 text-sm">Oluşturulma Tarihi:</span>
                    <span className="text-gray-600 dark:text-slate-400 text-sm">
                      {new Date(selectedListing.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <SectionTitle>İlan Açıklaması</SectionTitle>
              <ModalDescription
                dangerouslySetInnerHTML={{
                  __html: selectedListing.description?.replace(
                    /---LESSON_RATES_JSON---[\s\S]*?---END_LESSON_RATES_JSON---/,
                    ""
                  ),
                }}
              />

              {/* Ek Dersler ve Ücretleri */}
              {selectedListing.lessonRates?.length > 0 && (
                <div className="mt-6">
                  <SectionTitle>Diğer Ders Seçenekleri & Fiyatlar</SectionTitle>
                  <RatesTable>
                    <thead>
                      <tr>
                        <th>Ders / Konu</th>
                        <th>Süre</th>
                        <th>Hizmet Tipi</th>
                        <th>Ücret</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedListing.lessonRates.map((rate, i) => (
                        <tr key={i}>
                          <td className="font-semibold">{rate.title || selectedListing.title}</td>
                          <td>{rate.duration} dk</td>
                          <td>{translateServiceType(rate.type || selectedListing.serviceType)}</td>
                          <td className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {rate.onlinePrice > 0 && `Online: ₺${rate.onlinePrice}`}
                            {rate.onlinePrice > 0 && rate.inPersonPrice > 0 && " | "}
                            {rate.inPersonPrice > 0 && `Yüz Yüze: ₺${rate.inPersonPrice}`}
                            {!(rate.onlinePrice > 0) && !(rate.inPersonPrice > 0) && `₺${selectedListing.price}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </RatesTable>
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-muted);
  gap: 16px;
  svg {
    color: #16a34a;
  }
`;

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 0;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
`;

const CreateBtn = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  font-weight: 700;
  font-size: 14px;
  border-radius: 14px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.25);
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35);
  }
`;

const EmptyState = styled.div`
  background: var(--card-bg);
  border: 2px dashed var(--card-border);
  border-radius: 24px;
  padding: 60px 20px;
  text-align: center;
  max-width: 500px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-muted);

  svg {
    color: #16a34a;
    margin-bottom: 20px;
    opacity: 0.8;
  }

  h3 {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    margin-bottom: 24px;
    max-width: 320px;
    line-height: 1.5;
  }
`;

const EmptyCreateBtn = styled(Link)`
  padding: 12px 24px;
  background: #16a34a;
  color: white;
  font-weight: 700;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  &:hover {
    background: #15803d;
  }
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ListingCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  opacity: ${(props) => (props.$isPublished ? 1 : 0.85)};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
    border-color: ${(props) => (props.$isPublished ? "rgba(22, 163, 74, 0.3)" : "var(--card-border)")};
  }
`;

const CardImageWrapper = styled.div`
  height: 160px;
  position: relative;
  background: #f1f5f9;

  .dark & {
    background: #1e293b;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a8a29e;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);

  .dark & {
    background: linear-gradient(135deg, #14532d20 0%, #16653420 100%);
    color: #475569;
  }
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background: ${(props) => (props.$isPublished ? "rgba(220, 252, 231, 0.9)" : "rgba(254, 243, 199, 0.9)")};
  color: ${(props) => (props.$isPublished ? "#15803d" : "#b45309")};

  .dark & {
    background: ${(props) => (props.$isPublished ? "rgba(20, 83, 45, 0.85)" : "rgba(120, 53, 4, 0.85)")};
    color: ${(props) => (props.$isPublished ? "#86efac" : "#fde047")};
  }
`;

const CardContent = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CategoryText = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #16a34a;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 8px;
  height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DescriptionSnippet = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--card-border);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);

  span {
    font-size: 12px;
    font-weight: 600;
  }

  svg {
    opacity: 0.7;
    color: #16a34a;
  }
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: #f8fafc;
  border-top: 1px solid var(--card-border);
  gap: 8px;

  .dark & {
    background: #0f172a30;
  }
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--card-border);
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;

  .dark & {
    background: #1e293b;
  }

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #16a34a;

    .dark & {
      background: #334155;
      border-color: #475569;
    }
  }
`;

const PublishButton = styled.button`
  flex: 1;
  height: 36px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props) => (props.$isPublished ? "#ef4444" : "#16a34a")};
  background: ${(props) => (props.$isPublished ? "rgba(239, 68, 68, 0.05)" : "rgba(22, 163, 74, 0.05)")};
  color: ${(props) => (props.$isPublished ? "#ef4444" : "#16a34a")};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$isPublished ? "#ef4444" : "#16a34a")};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #ef4444;
  &:hover {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #ef4444;

    .dark & {
      background: #7f1d1d30;
      border-color: #7f1d1d;
    }
  }
`;

/* Modal Styles */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 24px;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const ModalCloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 28px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;

  &:hover {
    color: var(--text-primary);
  }
`;

const ModalHeader = styled.div`
  padding: 24px 30px;
  border-bottom: 1px solid var(--card-border);
`;

const ModalCategory = styled.span`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #16a34a;
`;

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin-top: 6px;
  line-height: 1.3;
`;

const ModalBody = styled.div`
  padding: 30px;
  overflow-y: auto;
`;

const ModalImageContainer = styled.div`
  width: 180px;
  height: 130px;
  border-radius: 16px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid var(--card-border);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
  }
`;

const DetailMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
`;

const DetailMetaCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 14px;

  .dark & {
    background: #1e293b40;
    border-color: #334155;
  }

  svg {
    color: #16a34a;
  }

  .lbl {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .val {
    font-size: 13px;
    font-weight: 800;
    color: var(--text-primary);
    margin-top: 2px;
  }
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 24px;
  margin-bottom: 12px;
  border-left: 3px solid #16a34a;
  padding-left: 8px;
`;

const ModalDescription = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  background: #f8fafc;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;

  .dark & {
    background: #1e293b20;
    border-color: #334155;
  }
`;

const RatesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;

  th, td {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid var(--card-border);
  }

  th {
    font-weight: 700;
    color: var(--text-muted);
    background: #f8fafc;

    .dark & {
      background: #1e293b40;
    }
  }

  td {
    color: var(--text-primary);
  }
`;
