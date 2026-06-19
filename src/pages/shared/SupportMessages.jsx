import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getMySupportMessages } from "@/services/contactService";
import { MessageSquare, Calendar, ShieldAlert, CheckCircle, Clock, Eye, AlertCircle, RefreshCw, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function SupportMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMySupportMessages();
      // Backend'den gelen veri array olmalıdır.
      setMessages(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(err.message || "Destek talepleri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
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
      <Header>
        <div>
          <Title>Destek Taleplerim</Title>
          <Subtitle>İlettiğiniz destek mesajlarını ve admin cevaplarını buradan takip edebilirsiniz.</Subtitle>
        </div>
        <HeaderActions>
          <RefreshButton onClick={fetchMessages} disabled={loading} title="Yenile">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </RefreshButton>
          <Link to="/iletisim" className="btn-primary">
            <Plus size={16} /> Yeni Talep
          </Link>
        </HeaderActions>
      </Header>

      {loading ? (
        <LoadingState>
          <RefreshCw className="animate-spin text-blue-500" size={36} />
          <p>Destek talepleriniz yükleniyor...</p>
        </LoadingState>
      ) : error ? (
        <ErrorState>
          <AlertCircle size={40} />
          <h3>Bir Hata Oluştu</h3>
          <p>{error}</p>
          <button onClick={fetchMessages}>Tekrar Dene</button>
        </ErrorState>
      ) : messages.length === 0 ? (
        <EmptyState>
          <div className="icon-container">
            <MessageSquare size={48} />
          </div>
          <h3>Henüz Destek Talebiniz Yok</h3>
          <p>Bizimle iletişime geçmek için yeni bir destek talebi veya iletişim mesajı gönderebilirsiniz.</p>
          <Link to="/iletisim">İletişim Sayfasına Git</Link>
        </EmptyState>
      ) : (
        <Grid>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Konu</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>Son Güncelleme</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id}>
                    <td>
                      <SubjectCell>
                        <MessageSquare className="cell-icon" size={18} />
                        <div>
                          <span className="subject">{msg.subject}</span>
                          <span className="snippet">{msg.message}</span>
                        </div>
                      </SubjectCell>
                    </td>
                    <td>
                      <DateText>
                        {new Date(msg.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </DateText>
                    </td>
                    <td>{getStatusBadge(msg.status)}</td>
                    <td>
                      <DateText>
                        {msg.updatedAt
                          ? new Date(msg.updatedAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Güncelleme yok"}
                      </DateText>
                    </td>
                    <td className="text-right">
                      <ViewButton onClick={() => setSelectedMessage(msg)}>
                        <Eye size={16} /> İncele
                      </ViewButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          {/* Mobil Görünüm Kart Listesi */}
          <MobileList>
            {messages.map((msg) => (
              <MobileCard key={msg.id} onClick={() => setSelectedMessage(msg)}>
                <MobileCardHeader>
                  <span className="subject">{msg.subject}</span>
                  {getStatusBadge(msg.status)}
                </MobileCardHeader>
                <p className="snippet">{msg.message}</p>
                <MobileCardFooter>
                  <span className="date">
                    <Calendar size={12} />
                    {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                  <span className="view-link">Detayları Gör &rarr;</span>
                </MobileCardFooter>
              </MobileCard>
            ))}
          </MobileList>
        </Grid>
      )}

      {/* Detay Modalı */}
      {selectedMessage && (
        <ModalOverlay onClick={() => setSelectedMessage(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Destek Talebi Detayı</h3>
              <button onClick={() => setSelectedMessage(null)}>
                <X size={20} />
              </button>
            </ModalHeader>
            <ModalBody>
              <DetailGroup>
                <label>Konu</label>
                <p className="value highlight">{selectedMessage.subject}</p>
              </DetailGroup>

              <DetailGroup>
                <label>Gönderim Tarihi</label>
                <p className="value">
                  {new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}
                </p>
              </DetailGroup>

              <DetailGroup>
                <label>Durum</label>
                <div>{getStatusBadge(selectedMessage.status)}</div>
              </DetailGroup>

              <DetailGroup>
                <label>Mesajınız</label>
                <p className="message-content">{selectedMessage.message}</p>
              </DetailGroup>

              {selectedMessage.replyMessage ? (
                <ReplyBox>
                  <div className="reply-header">
                    <ShieldAlert size={18} />
                    <span>Yönetici Yanıtı</span>
                    <span className="reply-date">
                      {selectedMessage.repliedAt
                        ? new Date(selectedMessage.repliedAt).toLocaleString("tr-TR")
                        : ""}
                    </span>
                  </div>
                  <p className="reply-content">{selectedMessage.replyMessage}</p>
                </ReplyBox>
              ) : (
                <PendingBox>
                  <Clock size={18} />
                  <span>Talebiniz inceleniyor, en kısa sürede yanıtlanacaktır.</span>
                </PendingBox>
              )}
            </ModalBody>
            <ModalFooter>
              <button className="btn-close" onClick={() => setSelectedMessage(null)}>
                Kapat
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;

  .dark & {
    color: #f8fafc;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;

  .dark & {
    color: #94a3b8;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #3b82f6;
    color: white;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
  }
`;

const RefreshButton = styled.button`
  pading: 10px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
    color: #0f172a;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .dark & {
    background: #1e293b;
    border-color: #334155;
    color: #cbd5e1;

    &:hover {
      background: #334155;
      color: white;
    }
  }
`;

const Grid = styled.div`
  margin-top: 10px;
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .dark & {
    background: #1e293b;
    border-color: #334155;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 16px 24px;
    background: #f8fafc;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #475569;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;

    .dark & {
      background: #0f172a;
      color: #94a3b8;
      border-color: #334155;
    }
  }

  td {
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    color: #334155;

    .dark & {
      border-color: #334155;
      color: #cbd5e1;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }

  .text-right {
    text-align: right;
  }
`;

const SubjectCell = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .cell-icon {
    color: #3b82f6;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .subject {
    font-weight: 700;
    color: #0f172a;
    display: block;
    margin-bottom: 4px;

    .dark & {
      color: #f8fafc;
    }
  }

  .snippet {
    font-size: 12px;
    color: #64748b;
    display: block;
    max-width: 320px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .dark & {
      color: #94a3b8;
    }
  }
`;

const DateText = styled.span`
  font-weight: 500;
  color: #64748b;
  font-size: 13px;

  .dark & {
    color: #94a3b8;
  }
`;

const ViewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .dark & {
    background: #334155;
    color: #cbd5e1;

    &:hover {
      background: #475569;
      color: white;
    }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &.blue {
    background: #eff6ff;
    color: #1e90ff;
    .dark & {
      background: rgba(30, 144, 255, 0.2);
    }
  }

  &.gray {
    background: #f1f5f9;
    color: #64748b;
    .dark & {
      background: rgba(100, 116, 139, 0.2);
    }
  }

  &.green {
    background: #f0fdf4;
    color: #22c55e;
    .dark & {
      background: rgba(34, 197, 94, 0.2);
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

// Mobil List
const MobileList = styled.div`
  display: none;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  .dark & {
    background: #1e293b;
    border-color: #334155;

    &:hover {
      border-color: #475569;
    }
  }

  .snippet {
    font-size: 13px;
    color: #64748b;
    margin: 10px 0 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    .dark & {
      color: #94a3b8;
    }
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;

  .subject {
    font-weight: 700;
    color: #0f172a;
    font-size: 15px;

    .dark & {
      color: #f8fafc;
    }
  }
`;

const MobileCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;

  .dark & {
    border-color: #334155;
  }

  .date {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #64748b;

    .dark & {
      color: #94a3b8;
    }
  }

  .view-link {
    font-weight: 700;
    color: #3b82f6;
  }
`;

// Loading, Error, Empty
const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #64748b;
  font-weight: 500;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #fee2e2;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);

  .dark & {
    background: #1e293b;
    border-color: #7f1d1d40;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #ef4444;
    margin: 16px 0 8px;
  }

  p {
    color: #64748b;
    font-size: 14px;
    max-width: 400px;
    margin-bottom: 24px;

    .dark & {
      color: #94a3b8;
    }
  }

  button {
    background: #ef4444;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #dc2626;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);

  .dark & {
    background: #1e293b;
    border-color: #334155;
  }

  .icon-container {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: #f1f5f9;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    .dark & {
      background: #0f172a;
    }
  }

  h3 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;

    .dark & {
      color: #f8fafc;
    }
  }

  p {
    font-size: 14px;
    color: #64748b;
    max-width: 420px;
    margin-bottom: 24px;
    line-height: 1.6;

    .dark & {
      color: #94a3b8;
    }
  }

  a {
    background: #3b82f6;
    color: white;
    padding: 12px 28px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
  }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;

  .dark & {
    background: #1e293b;
    border: 1px solid #334155;
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .dark & {
    border-color: #334155;
  }

  h3 {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;

    .dark & {
      color: #f8fafc;
    }
  }

  button {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .dark & {
      color: #94a3b8;
      &:hover {
        background: #334155;
        color: white;
      }
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;

    .dark & {
      color: #94a3b8;
    }
  }

  .value {
    font-size: 14px;
    font-weight: 600;
    color: #334155;

    .dark & {
      color: #cbd5e1;
    }

    &.highlight {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;

      .dark & {
        color: white;
      }
    }
  }

  .message-content {
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
    background: #f8fafc;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    white-space: pre-wrap;

    .dark & {
      background: #0f172a;
      border-color: #334155;
      color: #cbd5e1;
    }
  }
`;

const ReplyBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

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
    font-size: 14px;

    .reply-date {
      margin-left: auto;
      font-size: 11px;
      color: #64748b;
      font-weight: 500;

      .dark & {
        color: #94a3b8;
      }
    }
  }

  .reply-content {
    font-size: 14px;
    line-height: 1.6;
    color: #1e3a8a;
    white-space: pre-wrap;

    .dark & {
      color: #a7f3d0;
    }
  }
`;

const PendingBox = styled.div`
  background: #fef9c3;
  border: 1px solid #fef08a;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #854d0e;
  font-size: 13px;
  font-weight: 600;

  .dark & {
    background: rgba(234, 179, 8, 0.05);
    border-color: rgba(234, 179, 8, 0.2);
    color: #fef08a;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;

  .dark & {
    border-color: #334155;
  }

  .btn-close {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .dark & {
      background: #334155;
      color: #cbd5e1;

      &:hover {
        background: #475569;
        color: white;
      }
    }
  }
`;
