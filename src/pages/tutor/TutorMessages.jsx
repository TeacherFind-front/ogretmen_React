import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { getConversations, getMessages, sendMessage, deleteMessages, deleteConversation } from "@/services/messageService";
import { startChatConnection, getChatConnection, sendMessageLive } from "@/services/chatService";
import { Loader2, Send, Search, MoreVertical, Check, CheckCheck, Trash2, CheckCircle2, Reply, CornerUpLeft, X, ArrowLeft, Video, Phone } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { resolveMediaUrl } from "@/utils/helpers";

export default function TutorMessages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    fetchConversations();
  }, [searchParams]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (selectedConv && (message.senderId === selectedConv.otherUserId || message.receiverId === selectedConv.otherUserId)) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      setConversations(prev => {
        const index = prev.findIndex(c => c.otherUserId === message.senderId || c.otherUserId === message.receiverId);
        if (index === -1) return prev;

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      
      const targetUserId = searchParams.get("userId");
      const targetUserName = searchParams.get("userName");
      
      let updatedData = [...data];
      let selection = null;
      
      if (targetUserId) {
        const existingIndex = updatedData.findIndex(c => c.otherUserId === targetUserId);
        
        if (existingIndex !== -1) {
          selection = updatedData[existingIndex];
        } else {
          const newConv = {
            conversationId: "new",
            otherUserId: targetUserId,
            otherUserName: targetUserName ? decodeURIComponent(targetUserName) : "Ogrenci",
            lastMessage: "Yeni konusma baslat",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0
          };
          updatedData = [newConv, ...updatedData];
          selection = newConv;
        }
      }
      
      setConversations(updatedData);
      
      if (selection) {
        setSelectedConv(selection);
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
        
        if (selectedConv.conversationId === "new") {
          fetchConversations();
        }
        
        setMessages(prev => [...prev, sent]);
      } else {
        if (selectedConv.conversationId === "new") {
          fetchConversations();
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        <p className="text-gray-500 font-medium">Mesaj kutunuz yukleniyor...</p>
      </div>
    );
  }

  return (
    <ChatRoot>
      {/* Sidebar - Sol Panel */}
      <Sidebar $visible={!selectedConv}>
        <SidebarHeader>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-white tracking-tight">Sohbetler</h1>
          </div>
          <SearchWrap>
            <Search size={16} className="text-[#aebac1]" />
            <SearchInput type="text" placeholder="Aratin veya yeni sohbet baslatin" />
          </SearchWrap>
        </SidebarHeader>
        <ConvList>
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#8696a0] text-sm">Sohbet bulunamadi.</div>
          ) : (
            conversations.map(conv => (
              <ConversationCard 
                key={conv.conversationId} 
                className="group"
                $active={selectedConv?.otherUserId === conv.otherUserId}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="relative flex-shrink-0">
                  <Avatar $hasImage={!!conv.otherUserAvatarUrl}>
                    {conv.otherUserAvatarUrl ? (
                      <img 
                        src={resolveMediaUrl(conv.otherUserAvatarUrl)} 
                        alt={conv.otherUserName} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder-avatar.png";
                        }}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      conv.otherUserName?.charAt(0) || "U"
                    )}
                  </Avatar>
                  {conv.otherUserIsOnline && <OnlineStatus />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-[#e9edef] text-sm truncate">{conv.otherUserName || "Kullanici"}</h4>
                    <span className="text-[10px] font-semibold text-[#8696a0]">
                      {new Date(conv.lastMessageAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#8696a0] truncate leading-none mt-1">{conv.lastMessage}</p>
                </div>
                
                {conv.unreadCount > 0 && (
                  <UnreadBadge>{conv.unreadCount}</UnreadBadge>
                )}
                
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`${conv.otherUserName || "Kullanici"} ile olan konusmayi silmek istiyor musunuz?`)) {
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[#8696a0] hover:text-[#ef4444] rounded-lg ml-2 hover:bg-[#202c33]"
                  title="Konusmayi Sil"
                >
                  <Trash2 size={15} />
                </button>
              </ConversationCard>
            ))
          )}
        </ConvList>
      </Sidebar>

      {/* Chat Area - Sag Panel */}
      <ChatArea $visible={!!selectedConv}>
        {selectedConv ? (
          <>
            {/* Sohbet Basligi */}
            <ChatHeader>
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden p-2 -ml-2 text-[#8696a0] hover:text-white rounded-xl"
                  onClick={() => setSelectedConv(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar $small $hasImage={!!selectedConv.otherUserAvatarUrl}>
                  {selectedConv.otherUserAvatarUrl ? (
                    <img 
                      src={resolveMediaUrl(selectedConv.otherUserAvatarUrl)} 
                      alt={selectedConv.otherUserName} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-avatar.png";
                      }}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    selectedConv.otherUserName?.charAt(0) || "U"
                  )}
                </Avatar>
                <div>
                  <h3 className="font-bold text-[#e9edef] leading-tight text-sm md:text-base">{selectedConv.otherUserName || "Kullanici"}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedConv.otherUserIsOnline ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full"></span>
                        <span className="text-[10px] font-semibold text-[#00a884]">Cevrimici</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full"></span>
                        <span className="text-[10px] font-semibold text-[#8696a0]">
                          {selectedConv.otherUserLastSeenAt 
                            ? `Son gorulme: ${new Date(selectedConv.otherUserLastSeenAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}` 
                            : "Cevrimdisi"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="text-[#aebac1] hover:text-white transition-colors hidden sm:block">
                  <Video size={20} />
                </button>
                <button className="text-[#aebac1] hover:text-white transition-colors hidden sm:block">
                  <Phone size={18} />
                </button>
                
                {selectionMode ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSelectionMode(false); setSelectedMessages([]); }}
                      className="px-3 py-1.5 text-xs font-bold text-[#8696a0] hover:text-white bg-[#202c33] rounded-lg transition-all"
                    >
                      Iptal
                    </button>
                    {selectedMessages.length > 0 && (
                      <button 
                        onClick={async () => {
                          if(window.confirm(`${selectedMessages.length} mesaji silmek istediginize emin misiniz?`)) {
                            try {
                              await deleteMessages(selectedMessages);
                              setMessages(prev => prev.filter(m => !selectedMessages.includes(m.id)));
                              setSelectionMode(false);
                              setSelectedMessages([]);
                            } catch(err) {
                              alert(err.message);
                            }
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ea0038]/20 text-[#ff4b72] rounded-lg font-bold text-xs hover:bg-[#ea0038]/30 transition-all"
                      >
                        <Trash2 size={13} />
                        Sil ({selectedMessages.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative group/menu">
                    <button className="w-9 h-9 rounded-full text-[#aebac1] hover:text-white hover:bg-[#202c33] flex items-center justify-center transition-all">
                      <MoreVertical size={18} />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 bg-[#233138] rounded-lg shadow-2xl border border-[#2f3b43] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                      <button 
                        onClick={() => setSelectionMode(true)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-[#e9edef] hover:bg-[#182229] text-left transition-colors"
                      >
                        <CheckCircle2 size={14} /> Mesaj Sec
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </ChatHeader>

            {/* Mesaj Govdesi */}
            <MsgArea>
              {msgLoading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
                </div>
              )}
              {messages.map((m, i) => {
                const isMine = m.senderId === user?.userId;
                const isSelected = selectedMessages.includes(m.id || i);
                
                return (
                  <MsgRow key={m.id || i} $isMine={isMine} className="group/msg">
                    {selectionMode && (
                      <button 
                        onClick={() => setSelectedMessages(prev => 
                           prev.includes(m.id || i) ? prev.filter(id => id !== (m.id || i)) : [...prev, m.id || i]
                        )}
                        className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#00a884] border-[#00a884] text-white' : 'border-[#4b5a64]'}`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </button>
                    )}
                    
                    {!selectionMode && !isMine && (
                      <ReplyBtn 
                        onClick={() => setReplyTo(m)}
                        className="opacity-0 group-hover/msg:opacity-100"
                      >
                        <Reply size={13} />
                      </ReplyBtn>
                    )}
                    
                    <MessageBubble $isMine={isMine}>
                      {m.replyToMessageContent && (
                        <ReplyPreview $isMine={isMine}>
                          <span className="font-extrabold block mb-0.5 text-[10px] text-[#00a884]">Yanit:</span>
                          <p className="truncate text-xs opacity-80">{m.replyToMessageContent}</p>
                        </ReplyPreview>
                      )}
                      <div className="text-[13.5px] leading-relaxed break-words">{m.content}</div>
                      <MsgMeta $isMine={isMine}>
                        <span>
                          {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          <span className="text-[#53bdeb]"><CheckCheck size={13} /></span>
                        )}
                      </MsgMeta>
                    </MessageBubble>
                    
                    {!selectionMode && isMine && (
                      <ReplyBtn 
                        onClick={() => setReplyTo(m)}
                        className="opacity-0 group-hover/msg:opacity-100"
                      >
                        <Reply size={13} />
                      </ReplyBtn>
                    )}
                  </MsgRow>
                );
              })}
              <div ref={messagesEndRef} />
            </MsgArea>

            {/* Mesaj Giris Alani */}
            <InputArea>
              {replyTo && (
                <ReplyBanner>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-[10px] font-bold text-[#00a884] mb-0.5 flex items-center gap-1">
                      <CornerUpLeft size={10} />
                      {replyTo.senderId === user?.userId ? 'Kendi mesajiniza yanit' : 'Yanit veriyorsunuz'}
                    </div>
                    <div className="text-xs text-[#8696a0] truncate">
                      {replyTo.content}
                    </div>
                  </div>
                  <button 
                    onClick={() => setReplyTo(null)}
                    className="p-1 text-[#8696a0] hover:text-white rounded-full transition-colors"
                  >
                    <X size={13} />
                  </button>
                </ReplyBanner>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-3">
                <MsgInput 
                  placeholder="Mesaj yazin..." 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <SendBtn 
                  type="submit" 
                  disabled={!newMsg.trim()}
                  $active={!!newMsg.trim()}
                >
                  <Send size={16} />
                </SendBtn>
              </form>
            </InputArea>
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <Send size={32} className="text-[#00a884]" />
            </EmptyIcon>
            <h2 className="text-xl font-bold text-[#e9edef] mb-2">Canli Sohbet</h2>
            <p className="text-xs text-[#8696a0] max-w-xs leading-relaxed">
              Egitmenlerinizle iletisime gecmek icin sol menuden bir konusma secin.
            </p>
          </EmptyState>
        )}
      </ChatArea>
    </ChatRoot>
  );
}

/* ─── Styled Components ─── */

const ChatRoot = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  max-width: 1400px;
  margin: 0 auto;
  background: #111b21;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  border: 1px solid #2f3b43;
`;

const Sidebar = styled.div`
  width: 320px;
  flex-shrink: 0;
  display: ${p => p.$visible ? 'flex' : 'none'};
  flex-direction: column;
  background: #111b21;
  border-right: 1px solid #222e35;
  @media (min-width: 768px) {
    display: flex;
  }
`;

const SidebarHeader = styled.div`
  padding: 14px 16px;
  background: #111b21;
  border-bottom: 1px solid #222e35;
  flex-shrink: 0;
`;

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #202c33;
  border-radius: 8px;
  padding: 8px 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e9edef;
  font-size: 13px;
  font-weight: 500;
  &::placeholder {
    color: #8696a0;
  }
`;

const ConvList = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #111b21;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #374248;
    border-radius: 3px;
  }
`;

const ConversationCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${p => p.$active ? '#2a3942' : 'transparent'};
  border-bottom: 1px solid #222e35;
  &:hover {
    background: ${p => p.$active ? '#2a3942' : '#202c33'};
  }
`;

const Avatar = styled.div`
  width: ${p => p.$small ? '34px' : '44px'};
  height: ${p => p.$small ? '34px' : '44px'};
  border-radius: 50%;
  background: ${p => p.$hasImage ? 'transparent' : 'linear-gradient(135deg, #16a34a, #1b4332)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: ${p => p.$small ? '12px' : '16px'};
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const OnlineStatus = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #00a884;
  border: 1.5px solid #111b21;
  border-radius: 50%;
`;

const UnreadBadge = styled.div`
  background: #00a884;
  color: #111b21;
  font-size: 10px;
  font-weight: 900;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ChatArea = styled.div`
  flex: 1;
  display: ${p => p.$visible ? 'flex' : 'none'};
  flex-direction: column;
  background: #0b141a;
  overflow: hidden;
  @media (min-width: 768px) {
    display: flex;
  }
`;

const ChatHeader = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #202c33;
  border-bottom: 1px solid #2f3b43;
  flex-shrink: 0;
`;

const MsgArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: #0b141a;
  background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0);
  background-size: 24px 24px;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #374248;
    border-radius: 3px;
  }
`;

const MsgRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  justify-content: ${p => p.$isMine ? 'flex-end' : 'flex-start'};
  padding: 1px 0;
`;

const MessageBubble = styled.div`
  max-width: 65%;
  padding: 8px 12px 6px;
  border-radius: ${p => p.$isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px'};
  background: ${p => p.$isMine ? '#005c4b' : '#202c33'};
  color: #e9edef;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  border: 1px solid ${p => p.$isMine ? 'rgba(22,163,74,0.1)' : 'rgba(255,255,255,0.03)'};
  word-break: break-word;
`;

const ReplyPreview = styled.div`
  margin-bottom: 6px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
  border-left: 3px solid #00a884;
`;

const MsgMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 3px;
  opacity: 0.65;
  font-size: 10px;
  color: #8696a0;
`;

const ReplyBtn = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #8696a0;
  flex-shrink: 0;
  transition: all 0.2s;
  &:hover {
    background: #202c33;
    color: #00a884;
  }
`;

const InputArea = styled.div`
  padding: 10px 16px;
  background: #202c33;
  border-top: 1px solid #222e35;
  flex-shrink: 0;
`;

const ReplyBanner = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: rgba(0,168,132,0.08);
  border-left: 3px solid #00a884;
  border-radius: 6px;
`;

const MsgInput = styled.input`
  flex: 1;
  height: 40px;
  background: #2a3942;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  color: #e9edef;
  font-size: 13.5px;
  outline: none;
  &::placeholder {
    color: #8696a0;
  }
`;

const SendBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${p => p.$active ? '#00a884' : 'transparent'};
  border: none;
  cursor: ${p => p.$active ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$active ? '#111b21' : '#8696a0'};
  flex-shrink: 0;
  transition: all 0.15s;
  box-shadow: ${p => p.$active ? '0 2px 8px rgba(0,168,132,0.3)' : 'none'};
  &:hover {
    transform: ${p => p.$active ? 'scale(1.05)' : 'none'};
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #222e35;
`;

const EmptyIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0,168,132,0.1);
  border: 1px solid rgba(0,168,132,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;