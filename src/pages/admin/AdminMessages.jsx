import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  getContactMessages, 
  getContactMessageById, 
  markContactMessageAsRead, 
  replyContactMessage, 
  closeContactMessage, 
  deleteContactMessage 
} from "@/services/adminContactService";
import { 
  Search, Mail, User, BookOpen, Clock, CheckCircle2, AlertCircle, 
  Trash2, X, RefreshCw, Reply, Lock, Check, Loader2, ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_FILTERS = [
  { value: "Tümü", label: "Tümü" },
  { value: "New", label: "Yeni" },
  { value: "Read", label: "Okundu" },
  { value: "Replied", label: "Cevaplandı" },
  { value: "Closed", label: "Kapandı" }
];

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [selectedMsgDetail, setSelectedMsgDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Arama ve Filtre State'leri
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await getContactMessages({
        status: statusFilter,
        search: searchTerm,
        page,
        pageSize
      });
      
      if (response && response.items) {
        setMessages(response.items);
        setTotalPages(Math.ceil((response.totalCount || 0) / pageSize) || 1);
      } else if (Array.isArray(response)) {
        setMessages(response);
        setTotalPages(1);
      } else {
        setMessages([]);
        setTotalPages(1);
      }
    } catch (err) {
      toast.error(err.message || "Mesajlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMsg(msg);
    setDetailLoading(true);
    setReplyText("");
    try {
      const detail = await getContactMessageById(msg.id);
      setSelectedMsgDetail(detail);
      
      if (detail.status === "New") {
        await markContactMessageAsRead(msg.id);
        setSelectedMsgDetail(prev => ({ ...prev, status: "Read" }));
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: "Read" } : m));
      }
    } catch (err) {
      toast.error("Mesaj detayı yüklenemedi: " + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (!selectedMsg) return;
    try {
      await markContactMessageAsRead(selectedMsg.id);
      toast.success("Mesaj okundu olarak işaretlendi.");
      setSelectedMsgDetail(prev => ({ ...prev, status: "Read" }));
      setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, status: "Read" } : m));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCloseMessage = async () => {
    if (!selectedMsg) return;
    try {
      await closeContactMessage(selectedMsg.id);
      toast.success("Destek talebi başarıyla kapatıldı.");
      setSelectedMsgDetail(prev => ({ ...prev, status: "Closed" }));
      setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, status: "Closed" } : m));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteContactMessage(id);
      toast.success("Mesaj başarıyla silindi.");
      if (selectedMsg?.id === id) {
        setSelectedMsg(null);
        setSelectedMsgDetail(null);
      }
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedMsg) return;
    if (replyText.trim().length < 5) {
      toast.error("Cevap mesajınız en az 5 karakter olmalıdır.");
      return;
    }

    setSubmittingReply(true);
    try {
      await replyContactMessage(selectedMsg.id, replyText.trim());
      toast.success("Cevap başarıyla gönderildi.");
      setReplyText("");
      const updatedDetail = await getContactMessageById(selectedMsg.id);
      setSelectedMsgDetail(updatedDetail);
      setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, status: "Replied" } : m));
    } catch (err) {
      toast.error(err.message || "Cevap gönderilirken hata oluştu.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return <Badge className="blue">Yeni</Badge>;
      case "Read":
        return <Badge className="gray">Okundu</Badge>;
      case "Replied":
        return <Badge className="green">Cevaplandı</Badge>;
      case "Closed":
        return <Badge className="dark-gray">Kapandı</Badge>;
      default:
        return <Badge className="gray">{status}</Badge>;
    }
  };

  return (
    <Container className="animate-in fade-in duration-500">
      <div>
        <PageTitle>İletişim ve Destek Mesajları</PageTitle>
        <PageSubtitle>Kullanıcılardan ve ziyaretçilerden gelen destek taleplerini, soruları yönetin ve yanıtlayın.</PageSubtitle>
      </div>

      <FilterBar onSubmit={handleSearchSubmit}>
        <FilterGroup>
          {STATUS_FILTERS.map(f => (
            <FilterButton 
              key={f.value}
              type="button"
              className={statusFilter === f.value ? "active" : ""}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
            >
              {f.label}
            </FilterButton>
          ))}
        </FilterGroup>

        <SearchWrapper>
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            placeholder="Ad, e-posta, konu veya mesajda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Ara</button>
        </SearchWrapper>
      </FilterBar>

      <ContentGrid>
        <ListSection>
          <Card>
            {loading ? (
              <LoadingContainer>
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p>Mesajlar yükleniyor...</p>
              </LoadingContainer>
            ) : messages.length === 0 ? (
              <EmptyContainer>
                <AlertCircle size={40} className="empty-icon" />
                <h3>Mesaj Bulunamadı</h3>
                <p>Seçilen filtrelere veya arama kriterlerine uygun mesaj bulunmamaktadır.</p>
              </EmptyContainer>
            ) : (
              <>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <th>Gönderen</th>
                        <th>Konu</th>
                        <th>Durum</th>
                        <th>Tarih</th>
                        <th className="text-right">Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map(msg => (
                        <tr 
                          key={msg.id}
                          className={selectedMsg?.id === msg.id ? "selected-row" : ""}
                          onClick={() => handleSelectMessage(msg)}
                        >
                          <td>
                            <SenderInfo>
                              <span className="name">{msg.name}</span>
                              <span className="email">{msg.email}</span>
                            </SenderInfo>
                          </td>
                          <td>
                            <SubjectText title={msg.subject}>{msg.subject}</SubjectText>
                          </td>
                          <td>{getStatusBadge(msg.status)}</td>
                          <td>
                            <DateText>
                              {new Date(msg.createdAt).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </DateText>
                          </td>
                          <td className="text-right" onClick={(e) => e.stopPropagation()}>
                            <ActionButtons>
                              <button 
                                className="btn-delete"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Mesajı Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button 
                                className="btn-view"
                                onClick={() => handleSelectMessage(msg)}
                                title="Detayları İncele"
                              >
                                <ArrowRight size={16} />
                              </button>
                            </ActionButtons>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>

                {totalPages > 1 && (
                  <Pagination>
                    <button 
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Önceki
                    </button>
                    <span>Sayfa {page} / {totalPages}</span>
                    <button 
                      type="button"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      Sonraki
                    </button>
                  </Pagination>
                )}
              </>
            )}
          </Card>
        </ListSection>

        <DetailSection>
          {selectedMsg ? (
            <Card className="sticky-detail">
              {detailLoading ? (
                <LoadingContainer>
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <p>Detaylar yükleniyor...</p>
                </LoadingContainer>
              ) : selectedMsgDetail ? (
                <DetailContainer>
                  <DetailHeader>
                    <div>
                      <h3>Destek Detayı</h3>
                      <p className="msg-id">ID: {selectedMsgDetail.id}</p>
                    </div>
                    <CloseDetailButton onClick={() => { setSelectedMsg(null); setSelectedMsgDetail(null); }}>
                      <X size={20} />
                    </CloseDetailButton>
                  </DetailHeader>

                  <DetailBody>
                    <InfoRow>
                      <User size={16} className="info-icon" />
                      <div>
                        <span className="label">Gönderen</span>
                        <span className="value font-bold">{selectedMsgDetail.name}</span>
                      </div>
                    </InfoRow>

                    <InfoRow>
                      <Mail size={16} className="info-icon" />
                      <div>
                        <span className="label">E-posta</span>
                        <a href={`mailto:${selectedMsgDetail.email}`} className="value link">{selectedMsgDetail.email}</a>
                      </div>
                    </InfoRow>

                    <InfoRow>
                      <BookOpen size={16} className="info-icon" />
                      <div>
                        <span className="label">Konu</span>
                        <span className="value font-bold">{selectedMsgDetail.subject}</span>
                      </div>
                    </InfoRow>

                    <InfoRow>
                      <Clock size={16} className="info-icon" />
                      <div>
                        <span className="label">Tarih</span>
                        <span className="value">
                          {new Date(selectedMsgDetail.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </div>
                    </InfoRow>

                    <StatusRow>
                      <span className="label">Durum:</span>
                      {getStatusBadge(selectedMsgDetail.status)}
                    </StatusRow>

                    <MessageContentBox>
                      <span className="label">Gelen Mesaj</span>
                      <p className="text">{selectedMsgDetail.message}</p>
                    </MessageContentBox>

                    <AdminActions>
                      {selectedMsgDetail.status === "New" && (
                        <button className="btn-action btn-read" onClick={handleMarkAsRead}>
                          <Check size={16} /> Okundu Yap
                        </button>
                      )}
                      {selectedMsgDetail.status !== "Closed" && (
                        <button className="btn-action btn-close-req" onClick={handleCloseMessage}>
                          <Lock size={16} /> Kapat
                        </button>
                      )}
                      <button className="btn-action btn-delete-req" onClick={() => handleDeleteMessage(selectedMsgDetail.id)}>
                        <Trash2 size={16} /> Sil
                      </button>
                    </AdminActions>

                    {selectedMsgDetail.replyMessage ? (
                      <ReplyContainer>
                        <div className="reply-header">
                          <CheckCircle2 size={16} className="reply-icon" />
                          <span>Cevap Gönderildi</span>
                          <span className="reply-date">
                            {selectedMsgDetail.repliedAt ? new Date(selectedMsgDetail.repliedAt).toLocaleString("tr-TR") : ""}
                          </span>
                        </div>
                        <p className="reply-text">{selectedMsgDetail.replyMessage}</p>
                      </ReplyContainer>
                    ) : selectedMsgDetail.status !== "Closed" ? (
                      <ReplyForm onSubmit={handleSendReply}>
                        <label htmlFor="replyText">Cevap Yazın</label>
                        <textarea 
                          id="replyText"
                          rows="4"
                          placeholder="Kullanıcıya iletmek istediğiniz yanıtı buraya yazın..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          required
                        />
                        <button type="submit" disabled={submittingReply || replyText.trim().length < 5}>
                          {submittingReply ? (
                            <>
                              <Loader2 className="animate-spin" size={16} /> Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <Reply size={16} /> Yanıtı Gönder
                            </>
                          )}
                        </button>
                      </ReplyForm>
                    ) : (
                      <ClosedNotice>
                        <Lock size={16} />
                        <span>Bu destek talebi kapatıldığı için yanıt yazılamaz.</span>
                      </ClosedNotice>
                    )}
                  </DetailBody>
                </DetailContainer>
              ) : null}
            </Card>
          ) : (
            <Card className="empty-detail-state">
              <MessageSquare size={48} className="icon" />
              <h3>Mesaj Detayı</h3>
              <p>Detayları görüntülemek, okundu olarak işaretlemek veya yanıt göndermek için soldaki listeden bir mesaj seçin.</p>
            </Card>
          )}
        </DetailSection>
      </ContentGrid>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;

  .dark & {
    color: white;
  }
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;

  .dark & {
    color: #94a3b8;
  }
`;

const FilterBar = styled.form`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 16px 24px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);

  .dark & {
    background: #1e293b;
    border-color: #334155;
  }

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #f8fafc;
    color: #0f172a;
  }

  &.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .dark & {
    background: #0f172a;
    border-color: #334155;
    color: #cbd5e1;

    &:hover {
      background: #1e293b;
      color: white;
    }

    &.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px 8px;
  flex: 1;
  max-width: 480px;

  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  .search-icon {
    color: #94a3b8;
    margin-left: 8px;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    outline: none;

    .dark & {
      color: white;
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  button {
    background: #0f172a;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #1e293b;
    }

    .dark & {
      background: #3b82f6;
      &:hover {
        background: #2563eb;
      }
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ListSection = styled.div``;

const DetailSection = styled.div`
  @media (max-width: 992px) {
    grid-row: 1;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  padding: 24px;

  .dark & {
    background: #1e293b;
    border-color: #334155;
  }

  &.sticky-detail {
    position: sticky;
    top: 100px;
  }

  &.empty-detail-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
    color: #94a3b8;
    border-style: dashed;
    border-width: 2px;

    .icon {
      color: #cbd5e1;
      margin-bottom: 16px;
      .dark & {
        color: #475569;
      }
    }

    h3 {
      font-size: 16px;
      font-weight: 800;
      color: #475569;
      margin-bottom: 8px;
      .dark & {
        color: #cbd5e1;
      }
    }

    p {
      font-size: 13px;
      line-height: 1.5;
      max-width: 280px;
    }
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;

    .dark & {
      color: #94a3b8;
      border-color: #334155;
    }
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
    color: #334155;
    cursor: pointer;

    .dark & {
      border-color: #334155;
      color: #cbd5e1;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #f8fafc;
    .dark & {
      background: #0f172a;
    }
  }

  .selected-row td {
    background: #eff6ff;
    .dark & {
      background: rgba(59, 130, 246, 0.1);
    }
  }

  .text-right {
    text-align: right;
  }
`;

const SenderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .name {
    font-weight: 700;
    color: #0f172a;
    .dark & {
      color: white;
    }
  }

  .email {
    font-size: 11px;
    color: #64748b;
    .dark & {
      color: #94a3b8;
    }
  }
`;

const SubjectText = styled.div`
  font-weight: 600;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #334155;
  .dark & {
    color: #cbd5e1;
  }
`;

const DateText = styled.span`
  color: #64748b;
  font-size: 12px;
  .dark & {
    color: #94a3b8;
  }
`;

const ActionButtons = styled.div`
  display: inline-flex;
  gap: 8px;

  button {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    &.btn-delete {
      background: #fef2f2;
      color: #ef4444;

      &:hover {
        background: #fee2e2;
      }
      .dark & {
        background: rgba(239, 68, 68, 0.15);
      }
    }

    &.btn-view {
      background: #f1f5f9;
      color: #475569;

      &:hover {
        background: #e2e8f0;
      }
      .dark & {
        background: #334155;
        color: #cbd5e1;
      }
    }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &.blue {
    background: #eff6ff;
    color: #3b82f6;
    .dark & {
      background: rgba(59, 130, 246, 0.15);
    }
  }

  &.gray {
    background: #f1f5f9;
    color: #64748b;
    .dark & {
      background: rgba(100, 116, 139, 0.15);
    }
  }

  &.green {
    background: #f0fdf4;
    color: #22c55e;
    .dark & {
      background: rgba(34, 197, 94, 0.15);
    }
  }

  &.dark-gray {
    background: #334155;
    color: #94a3b8;
    .dark & {
      background: rgba(51, 65, 85, 0.6);
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;

  .dark & {
    border-color: #334155;
  }

  span {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
  }

  button {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #e2e8f0;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dark & {
      background: #334155;
      color: #cbd5e1;

      &:hover:not(:disabled) {
        background: #475569;
      }
    }
  }
`;

// Detail Styled Components
const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;

  .dark & {
    border-color: #334155;
  }

  h3 {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    .dark & {
      color: white;
    }
  }

  .msg-id {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }
`;

const CloseDetailButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  .dark & {
    &:hover {
      background: #334155;
      color: white;
    }
  }
`;

const DetailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .info-icon {
    color: #3b82f6;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #94a3b8;
    display: block;
    margin-bottom: 2px;
  }

  .value {
    font-size: 13.5px;
    color: #334155;

    .dark & {
      color: #cbd5e1;
    }

    &.font-bold {
      font-weight: 700;
    }

    &.link {
      color: #3b82f6;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .label {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
  }
`;

const MessageContentBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;

  .dark & {
    background: #0f172a;
    border-color: #334155;
  }

  .label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #94a3b8;
    display: block;
    margin-bottom: 8px;
  }

  .text {
    font-size: 13.5px;
    line-height: 1.6;
    color: #334155;
    white-space: pre-wrap;

    .dark & {
      color: #cbd5e1;
    }
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;

  .dark & {
    border-color: #334155;
  }

  .btn-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &.btn-read {
      background: #eff6ff;
      color: #3b82f6;
      &:hover {
        background: #dbeafe;
      }
      .dark & {
        background: rgba(59, 130, 246, 0.15);
      }
    }

    &.btn-close-req {
      background: #f1f5f9;
      color: #475569;
      &:hover {
        background: #e2e8f0;
      }
      .dark & {
        background: #334155;
        color: #cbd5e1;
      }
    }

    &.btn-delete-req {
      background: #fef2f2;
      color: #ef4444;
      &:hover {
        background: #fee2e2;
      }
      .dark & {
        background: rgba(239, 68, 68, 0.15);
      }
    }
  }
`;

const ReplyContainer = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 16px;

  .dark & {
    background: rgba(34, 197, 94, 0.05);
    border-color: rgba(34, 197, 94, 0.2);
  }

  .reply-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #16a34a;
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 8px;

    .reply-icon {
      flex-shrink: 0;
    }

    .reply-date {
      margin-left: auto;
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
  }

  .reply-text {
    font-size: 13.5px;
    line-height: 1.5;
    color: #1e3a8a;
    white-space: pre-wrap;

    .dark & {
      color: #a7f3d0;
    }
  }
`;

const ReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
  }

  textarea {
    width: 100%;
    padding: 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 13.5px;
    outline: none;
    transition: all 0.2s;
    resize: vertical;
    background: #f8fafc;

    .dark & {
      background: #0f172a;
      border-color: #334155;
      color: white;
    }

    &:focus {
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      
      .dark & {
        background: #020617;
      }
    }
  }

  button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const ClosedNotice = styled.div`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;

  .dark & {
    background: rgba(51, 65, 85, 0.3);
    border-color: #334155;
    color: #cbd5e1;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;

  .empty-icon {
    color: #cbd5e1;
    margin-bottom: 12px;
    .dark & {
      color: #475569;
    }
  }

  h3 {
    font-size: 16px;
    font-weight: 800;
    color: #475569;
    margin-bottom: 4px;
    .dark & {
      color: #cbd5e1;
    }
  }

  p {
    font-size: 13px;
    max-width: 300px;
  }
`;
