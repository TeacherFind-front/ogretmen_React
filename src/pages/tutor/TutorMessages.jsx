import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { getConversations, getMessages, sendMessage, deleteMessages, deleteConversation } from "@/services/messageService";
import { startChatConnection, getChatConnection, sendMessageLive } from "@/services/chatService";
import { Loader2, Send, Search, MoreVertical, Check, CheckCheck, Trash2, CheckCircle2, Reply, CornerUpLeft, X } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

export default function TutorMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // SignalR bağlantısı ve mesaj dinleme
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleNewMessage = (message) => {
      // Eğer bu mesaj seçili konuşmaysa mesajlara ekle
      if (selectedConv && (message.senderId === selectedConv.otherUserId || message.receiverId === selectedConv.otherUserId)) {
        setMessages(prev => {
          // Mükerrer eklemeyi önle
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // Konuşma listesini güncelle (son mesaj ve üste taşıma)
      setConversations(prev => {
        const index = prev.findIndex(c => c.otherUserId === message.senderId || c.otherUserId === message.receiverId);
        if (index === -1) return prev; // Yeni biriyse tekrar fetch gerekebilir ama şimdilik pas geçiyoruz

        const updated = [...prev];
        const conv = updated[index];
        updated[index] = { 
          ...conv, 
          lastMessage: message.content, 
          lastMessageAt: message.sentAt,
          unreadCount: (selectedConv?.otherUserId !== conv.otherUserId && message.receiverId === user?.userId) 
            ? (conv.unreadCount || 0) + 1 
            : conv.unreadCount
        };
        
        // Üste taşı
        const item = updated.splice(index, 1)[0];
        return [item, ...updated];
      });
    };

    const handleUserStatusChanged = ({ userId, isOnline, lastSeenAt }) => {
      setConversations(prev => prev.map(c => {
        if (c.otherUserId === userId) {
          return { ...c, otherUserIsOnline: isOnline, otherUserLastSeenAt: lastSeenAt };
        }
        return c;
      }));

      setSelectedConv(prev => {
        if (prev && prev.otherUserId === userId) {
          return { ...prev, otherUserIsOnline: isOnline, otherUserLastSeenAt: lastSeenAt };
        }
        return prev;
      });
    };

    const setupSignalR = async () => {
      const connection = await startChatConnection();
      if (connection) {
        connection.off("ReceiveMessage", handleNewMessage);
        connection.on("ReceiveMessage", handleNewMessage);
        
        connection.off("UserStatusChanged", handleUserStatusChanged);
        connection.on("UserStatusChanged", handleUserStatusChanged);
      }
    };
    setupSignalR();

    return () => {
      const connection = getChatConnection();
      if (connection) {
        connection.off("ReceiveMessage", handleNewMessage);
        connection.off("UserStatusChanged", handleUserStatusChanged);
      }
    };
  }, [selectedConv, user?.userId]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.otherUserId);
    }
  }, [selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch (err) {
      console.error("Conversations load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    setMsgLoading(true);
    try {
      const data = await getMessages(otherUserId);
      setMessages(data);
    } catch (err) {
      console.error("Messages load failed", err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedConv) return;

    const msgContent = newMsg.trim();
    setNewMsg("");
    const replyId = replyTo?.id;
    setReplyTo(null);

    try {
      const success = await sendMessageLive(selectedConv.otherUserId, msgContent, replyId);
      
      if (!success) {
        const sent = await sendMessage({
          receiverId: selectedConv.otherUserId,
          content: msgContent,
          replyToMessageId: replyId
        });
        setMessages(prev => [...prev, sent]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Mesaj kutunuz yükleniyor...</p>
      </div>
    );
  }

  return (
    <Container>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">Mesajlarım</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Öğrencilerinle olan iletişimi anlık olarak takip et.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[750px]">
        {/* Mesaj Listesi */}
        <div className="md:col-span-1">
          <Card className="h-full flex flex-col shadow-sm">
            <div className="p-4 border-b dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <SearchInput placeholder="Öğrenci ara..." />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">Henüz bir mesajınız bulunmuyor.</div>
              ) : (
                conversations.map((conv) => (
                  <ConversationCard 
                    key={conv.conversationId} 
                    className="group"
                    $active={selectedConv?.otherUserId === conv.otherUserId}
                    onClick={() => setSelectedConv(conv)}
                  >
                    <div className="relative">
                      <Avatar>{conv.otherUserName?.charAt(0) || "U"}</Avatar>
                      {conv.otherUserIsOnline && <OnlineStatus />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900 dark:text-white truncate">{conv.otherUserName || "Kullanıcı"}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-slate-400 truncate">{conv.lastMessage}</span>
                        {conv.unreadCount > 0 && <UnreadBadge>{conv.unreadCount}</UnreadBadge>}
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`${conv.otherUserName || "Kullanıcı"} adlı kişiyle olan tüm konuşmayı silmek istediğinize emin misiniz?`)) {
                              try {
                                await deleteConversation(conv.otherUserId);
                                setConversations(prev => prev.filter(c => c.otherUserId !== conv.otherUserId));
                                if (selectedConv?.otherUserId === conv.otherUserId) {
                                  setSelectedConv(null);
                                }
                              } catch (err) {
                                alert(err.message);
                              }
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-2"
                          title="Konuşmayı Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </ConversationCard>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Mesaj İçeriği */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col shadow-lg border-blue-50">
            {selectedConv ? (
              <>
                <div className="p-5 border-b dark:border-slate-700 flex items-center justify-between bg-white dark:bg-[#1e293b] z-10">
                  <div className="flex items-center gap-4">
                    <Avatar $large>{selectedConv.otherUserName?.charAt(0) || "U"}</Avatar>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{selectedConv.otherUserName || "Kullanıcı"}</h3>
                      {selectedConv.otherUserIsOnline ? (
                        <span className="text-[11px] text-green-500 font-bold flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Çevrimiçi
                        </span>
                      ) : selectedConv.otherUserLastSeenAt ? (
                        <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
                          Son görülme: {new Date(selectedConv.otherUserLastSeenAt).toLocaleDateString('tr-TR')} {new Date(selectedConv.otherUserLastSeenAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Çevrimdışı
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectionMode ? (
                      <>
                        <button 
                          onClick={() => { setSelectionMode(false); setSelectedMessages([]); }}
                          className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                          İptal
                        </button>
                        {selectedMessages.length > 0 && (
                          <button 
                            onClick={async () => {
                              if(window.confirm(`${selectedMessages.length} mesajı silmek istediğinize emin misiniz?`)) {
                                try {
                                  await deleteMessages(selectedMessages);
                                  setMessages(prev => prev.filter(m => !selectedMessages.includes(m.id)));
                                  setSelectionMode(false);
                                  setSelectedMessages([]);
                                } catch(err) {
                                  alert("Silme işlemi başarısız: " + err.message);
                                }
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Sil ({selectedMessages.length})</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="relative group/menu">
                        <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                          <button 
                            onClick={() => setSelectionMode(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 text-left"
                          >
                            <CheckCircle2 size={16} /> Mesaj Seç
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a] p-6 overflow-y-auto custom-scrollbar space-y-4">
                  {msgLoading && messages.length === 0 ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
                  ) : (
                    messages.map((m, i) => {
                      const isMine = m.senderId === user?.userId;
                      const isSelected = selectedMessages.includes(m.id || i);

                      return (
                        <div key={m.id || i} className={`flex items-center gap-4 group/msg ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                          {selectionMode && (
                            <button 
                              onClick={() => setSelectedMessages(prev => 
                                prev.includes(m.id || i) ? prev.filter(id => id !== (m.id || i)) : [...prev, m.id || i]
                              )}
                              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 dark:border-slate-600'}`}
                            >
                              {isSelected && <Check size={14} strokeWidth={3} />}
                            </button>
                          )}

                          <MessageGroup $isMine={isMine} className="flex-1">
                            <div className={`flex items-center gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} w-full`}>
                              <MessageBubble $isMine={isMine}>
                                {m.replyToMessageContent && (
                                  <div className="mb-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm border-l-4 border-black/10 dark:border-white/10 opacity-80">
                                    <span className="font-bold block mb-0.5 text-xs">Yanıt:</span>
                                    <p className="truncate">{m.replyToMessageContent}</p>
                                  </div>
                                )}
                                {m.content}
                                <div className="time flex items-center justify-end gap-1">
                                  {new Date(m.sentAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                  {isMine && (
                                    m.isRead ? <CheckCheck className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white/70" />
                                  )}
                                </div>
                              </MessageBubble>

                              {!selectionMode && (
                                <button 
                                  onClick={() => setReplyTo(m)}
                                  className="opacity-0 group-hover/msg:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all shrink-0 mx-2"
                                >
                                  <Reply size={16} />
                                </button>
                              )}
                            </div>
                          </MessageGroup>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                  {replyTo && (
                    <div className="mb-4 flex items-start justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border-l-4 border-blue-500">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                          <CornerUpLeft size={12} />
                          {replyTo.senderId === user?.userId ? 'Kendi mesajınıza yanıt veriyorsunuz' : 'Yanıt veriyorsunuz'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-300 truncate">
                          {replyTo.content}
                        </div>
                      </div>
                      <button 
                        onClick={() => setReplyTo(null)}
                        className="p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSend} className="flex gap-3">
                    <InputWrapper>
                      <input 
                        type="text" 
                        placeholder="Mesajınızı buraya yazın..." 
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                      />
                    </InputWrapper>
                    <SendButton type="submit" disabled={!newMsg.trim()}>
                      <Send className="w-5 h-5" />
                    </SendButton>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-10 h-10 opacity-20 dark:text-slate-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Henüz Seçim Yapılmadı</h3>
                <p className="text-sm dark:text-slate-400 max-w-xs">Mesajlaşmaya başlamak için sol taraftan bir öğrenci seçin.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: 14px;
  transition: all 0.2s;
  
  .dark & {
    background: #0f172a;
    border-color: #334155;
    color: #f1f5f9;
  }
  
  &:focus { 
    outline: none; 
    border-color: #2d79f3; 
    background: white; 
    .dark & { background: #0f172a; border-color: #3b82f6; }
  }
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? '#eff6ff' : 'transparent'};
  border-left: 4px solid ${props => props.$active ? '#2d79f3' : 'transparent'};
  
  .dark & {
    background: ${props => props.$active ? '#1e3a8a30' : 'transparent'};
    border-left-color: ${props => props.$active ? '#3b82f6' : 'transparent'};
    span { color: #f1f5f9 !important; }
    p { color: #94a3b8 !important; }
  }

  &:hover {
    background: #f8fafc;
    .dark & { background: #33415540; }
  }
`;

const OnlineStatus = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border: 3px solid white;
  border-radius: 50%;

  .dark & {
    border-color: #0f172a;
  }
`;

const Avatar = styled.div`
  width: ${props => props.$large ? '48px' : '40px'};
  height: ${props => props.$large ? '48px' : '40px'};
  border-radius: 14px;
  background: linear-gradient(135deg, #2d79f3 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: ${props => props.$large ? '18px' : '15px'};
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(45, 121, 243, 0.2);
`;

const UnreadBadge = styled.span`
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isMine ? 'flex-end' : 'flex-start'};
  width: 100%;
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  background: ${props => props.$isMine ? '#2d79f3' : 'white'};
  color: ${props => props.$isMine ? 'white' : '#1e293b'};
  box-shadow: ${props => props.$isMine ? '0 4px 12px rgba(45, 121, 243, 0.15)' : '0 2px 5px rgba(0,0,0,0.03)'};
  border-bottom-${props => props.$isMine ? 'right' : 'left'}-radius: 4px;
  
  .dark & {
    background: ${props => props.$isMine ? '#2563eb' : '#1e293b'};
    color: #f1f5f9;
    border: ${props => props.$isMine ? 'none' : '1px solid #334155'};
  }

  .time {
    font-size: 10px;
    margin-top: 6px;
    opacity: 0.7;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 2px 18px;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  .dark & {
    background: #0f172a;
    border-color: #334155;
  }
  
  input {
    width: 100%;
    padding: 12px 0;
    background: transparent;
    border: none;
    font-size: 14px;
    color: #1e293b;
    .dark & { color: #f1f5f9; }
    &:focus { outline: none; }
  }
`;

const SendButton = styled.button`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #2d79f3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(45, 121, 243, 0.2);
  
  &:hover:not(:disabled) {
    background: #1e40af;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;


const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  .dark & {
    h3 { color: #f1f5f9 !important; }
    p { color: #94a3b8 !important; }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  }
`;
