import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Bell, MessageCircle, BookOpen, CheckCircle, Info, X, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notificationService";
import { startChatConnection } from "@/services/chatService";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // İlk yükleme
    fetchNotifications();

    // Canlı bildirimleri dinle
    const setupSignalR = async () => {
      const connection = await startChatConnection();
      if (connection) {
        connection.on("ReceiveNotification", (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
      }
    };
    setupSignalR();

    // Dışarı tıklayınca kapat
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Bildirimler çekilemedi", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    if (!notif.isRead) {
      try {
        await markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Okundu işaretlenemedi", err);
      }
    }
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Tümü okundu işaretlenemedi", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "message": return <MessageCircle size={16} />;
      case "lesson": return <BookOpen size={16} />;
      case "success": return <CheckCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  const truncate = (str, len) => {
    if (str.length <= len) return str;
    return str.slice(0, len) + "...";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <BellButton onClick={() => setIsOpen(!isOpen)} $hasUnread={unreadCount > 0}>
        <Bell size={22} />
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </BellButton>

      {isOpen && (
        <Dropdown>
          <Header>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-gray-900">Bildirimler</h3>
              {unreadCount > 0 && <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">Yeni</span>}
            </div>
            {notifications.length > 0 && (
              <ClearAllButton onClick={handleMarkAllAsRead}>
                Hepsini Temizle
              </ClearAllButton>
            )}
          </Header>
          
          <List>
            {notifications.length === 0 ? (
              <EmptyState>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-2">
                  <Bell size={24} />
                </div>
                <p>Henüz bildiriminiz yok</p>
              </EmptyState>
            ) : (
              notifications.map((notif) => (
                <Item key={notif.id} $isRead={notif.isRead} onClick={() => handleNotificationClick(notif)}>
                  <IconBox $type={notif.type}>
                    {getIcon(notif.type)}
                  </IconBox>
                  <Content>
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-black text-gray-900 text-sm">{notif.senderName}</span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> 5 dk
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {truncate(notif.message, 60)}
                    </p>
                  </Content>
                  {!notif.isRead && <UnreadDot />}
                </Item>
              ))
            )}
          </List>

          <Footer onClick={() => navigate("/notifications")}>
            Tümünü Gör
          </Footer>
        </Dropdown>
      )}
    </div>
  );
}

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const BellButton = styled.button`
  position: relative;
  padding: 10px;
  border-radius: 16px;
  color: #64748b;
  background: white;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f8fafc;
    color: #1e293b;
    border-color: #e2e8f0;
    transform: translateY(-1px);

    .dark & {
      background: #334155;
      color: #f1f5f9;
      border-color: #475569;
    }
  }

  .dark & {
    background: #1e293b;
    color: #94a3b8;
    border-color: #334155;
  }

  ${props => props.$hasUnread && `
    color: #2d79f3;
    background: #f3f7ff;
    border-color: #2d79f330;

    .dark & {
      background: #1e3a8a30;
      color: #60a5fa;
      border-color: #3b82f640;
    }
  `}
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 900;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 2px solid white;
  padding: 0 4px;

  .dark & {
    border-color: #1e293b;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
  animation: ${slideDown} 0.2s ease-out;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
  }
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .dark & {
    border-color: #334155;
    h3 { color: #f1f5f9 !important; }
  }
`;

const List = styled.div`
  max-height: 380px;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
`;

const Item = styled.div`
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: ${props => props.$isRead ? 'white' : '#f8faff'};

  .dark & {
    background: ${props => props.$isRead ? '#1e293b' : '#1e3a8a20'};
    &:hover { background: #334155; }
    border-color: #334155 !important;
    span.font-black { color: #f1f5f9 !important; }
    p { color: #94a3b8 !important; }
  }

  &:hover {
    background: #f1f5f9;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f8fafc;
  }
`;

const IconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => {
    switch (props.$type) {
      case 'message': return 'background: #e0f2fe; color: #0369a1;';
      case 'lesson': return 'background: #fef3c7; color: #b45309;';
      case 'success': return 'background: #dcfce7; color: #15803d;';
      default: return 'background: #f1f5f9; color: #64748b;';
    }
  }}
`;

const Content = styled.div`
  flex: 1;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  background: #2d79f3;
  border-radius: 50%;
  position: absolute;
  top: 20px;
  right: 12px;
  box-shadow: 0 0 10px rgba(45, 121, 243, 0.4);
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
`;

const Footer = styled.button`
  width: 100%;
  padding: 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.2s;
  border: none;
  border-top: 1px solid #f1f5f9;

  .dark & {
    background: #1e293b;
    color: #94a3b8;
    border-color: #334155;
    &:hover { color: #3b82f6; background: #334155; }
  }

  &:hover {
    color: #2d79f3;
    background: #f1f5f9;
  }
`;

const ClearAllButton = styled.button`
  font-size: 11px;
  font-weight: 800;
  color: #2d79f3;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  background: #f3f7ff;
  border: none;

  &:hover {
    background: #2d79f3;
    color: white;
    transform: translateY(-1px);
  }

  .dark & {
    background: #1e3a8a30;
    color: #60a5fa;
    &:hover {
      background: #3b82f6;
      color: white;
    }
  }
`;
