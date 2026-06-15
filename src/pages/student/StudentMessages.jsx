import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { getConversations, getMessages, sendMessage, deleteMessages, deleteConversation } from "@/services/messageService";
import { startChatConnection, getChatConnection, sendMessageLive } from "@/services/chatService";
import { Loader2, Send, Search, MoreVertical, Check, CheckCheck, ArrowLeft, Trash2, CornerUpLeft, X, Circle, CheckCircle2, Reply } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { resolveMediaUrl } from "@/utils/helpers";

export default function StudentMessages() {
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
      
      const targetTutorId = searchParams.get("tutorId");
      const targetTutorName = searchParams.get("tutorName");
      
      let updatedData = [...data];
      let selection = null;
      
      if (targetTutorId) {
        // Zaten bu kişiyle konuşma var mı?
        const existingIndex = updatedData.findIndex(c => c.otherUserId === targetTutorId);
        
        if (existingIndex !== -1) {
          selection = updatedData[existingIndex];
        } else if (targetTutorName) {
          // Yeni konuşma başlatılacak (mock nesne)
          const newConv = {
            conversationId: "new",
            otherUserId: targetTutorId,
            otherUserName: decodeURIComponent(targetTutorName),
            lastMessage: "Yeni konuşma başlat",
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
      } else if (updatedData.length > 0 && !selectedConv) {
        setSelectedConv(updatedData[0]);
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
      // Önce SignalR canlı mesajı dener (Hub otomatik olarak veritabanına kaydeder)
      const success = await sendMessageLive(selectedConv.otherUserId, msgContent, replyId);
      
      if (!success) {
        // SignalR başarısızsa veya bağlı değilse HTTP API ile gönderir
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
          // Yeni bir konuşma ise konuşma listesini tazeleyerek "new" durumundan kurtarır
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
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Mesaj kutunuz yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] border border-gray-100 dark:border-slate-800 flex h-[calc(100vh-160px)] max-w-7xl mx-auto overflow-hidden shadow-2xl relative">
      
      {/* Sidebar */}
      <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r dark:border-slate-800 flex-col bg-gray-50/50 dark:bg-[#0f172a]/40 shrink-0`}>
        <div className="p-6 border-b dark:border-slate-800 bg-white dark:bg-[#1e293b]">
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
             <input 
              type="text" 
              placeholder="Mesajlarda ara..." 
              className="w-full h-12 bg-gray-100 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 text-sm font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
             />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {conversations.map(conv => (
            <ConversationCard 
              key={conv.conversationId} 
              className="group"
              $active={selectedConv?.otherUserId === conv.otherUserId}
              onClick={() => setSelectedConv(conv)}
            >
              <div className="relative">
                 <Avatar $hasImage={!!conv.otherUserAvatarUrl}>
                   {conv.otherUserAvatarUrl ? (
                     <img src={resolveMediaUrl(conv.otherUserAvatarUrl)} alt={conv.otherUserName} className="w-full h-full object-cover" />
                   ) : (
                     conv.otherUserName?.charAt(0)
                   )}
                 </Avatar>
                 {conv.otherUserIsOnline && <OnlineStatus />}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm truncate">{conv.otherUserName || "Kullanıcı"}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                       {new Date(conv.lastMessageAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                 </div>
                 <p className="text-xs text-gray-500 font-medium truncate leading-none">{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <UnreadBadge>{conv.unreadCount}</UnreadBadge>
              )}
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
            </ConversationCard>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!selectedConv ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-[#1e293b] w-full md:w-auto absolute md:relative inset-0 md:inset-auto z-10 md:z-auto`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b dark:border-slate-800 px-4 md:px-8 flex items-center justify-between bg-white dark:bg-[#1e293b] shrink-0">
               <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    onClick={() => setSelectedConv(null)}
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <Avatar $small $hasImage={!!selectedConv.otherUserAvatarUrl}>
                    {selectedConv.otherUserAvatarUrl ? (
                      <img src={resolveMediaUrl(selectedConv.otherUserAvatarUrl)} alt={selectedConv.otherUserName} className="w-full h-full object-cover" />
                    ) : (
                      selectedConv.otherUserName?.charAt(0)
                    )}
                  </Avatar>
                  <div>
                     <h3 className="font-black text-gray-900 dark:text-slate-100 leading-none mb-1">{selectedConv.otherUserName || "Kullanıcı"}</h3>
                     <div className="flex items-center gap-1.5">
                        {selectedConv.otherUserIsOnline ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Çevrimiçi</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {selectedConv.otherUserLastSeenAt ? `Son görülme: ${new Date(selectedConv.otherUserLastSeenAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}` : "Çevrimdışı"}
                            </span>
                          </>
                        )}
                     </div>
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
                               alert(err.message);
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
                     <button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-900 dark:hover:text-slate-100 flex items-center justify-center transition-all">
                       <MoreVertical size={20} />
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-gray-50/30 dark:bg-[#0f172a]/50">
              {messages.map((m, i) => {
                const isMine = m.senderId === user?.userId;
                const isSelected = selectedMessages.includes(m.id || i);
                
                return (
                  <div key={m.id || i} className="flex items-center gap-4 group/msg">
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
                    
                    <MessageWrapper $isMine={isMine} className="flex-1">
                       {!selectionMode && !isMine && (
                         <button 
                           onClick={() => setReplyTo(m)}
                           className="opacity-0 group-hover/msg:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all shrink-0 mr-2"
                         >
                           <Reply size={16} />
                         </button>
                       )}
                       
                       <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[70%]">
                          <MessageBubble $isMine={isMine}>
                            {m.replyToMessageContent && (
                              <div className="mb-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm border-l-4 border-black/10 dark:border-white/10 opacity-80">
                                <span className="font-bold block mb-0.5 text-xs">Yanıt:</span>
                                <p className="truncate">{m.replyToMessageContent}</p>
                              </div>
                            )}
                            {m.content}
                          </MessageBubble>
                          <div className={`flex items-center gap-2 px-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                             <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                               {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {isMine && (
                               <span className="text-blue-500"><CheckCheck size={12} /></span>
                             )}
                          </div>
                       </div>
                       
                       {!selectionMode && isMine && (
                         <button 
                           onClick={() => setReplyTo(m)}
                           className="opacity-0 group-hover/msg:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all shrink-0 ml-2"
                         >
                           <Reply size={16} />
                         </button>
                       )}
                    </MessageWrapper>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t dark:border-slate-800 bg-white dark:bg-[#1e293b] shrink-0">
              
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

              <form onSubmit={handleSend} className="flex items-center gap-3 md:gap-4 bg-gray-50 dark:bg-slate-800 p-2 pl-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 focus-within:border-blue-200 dark:focus-within:border-blue-500/50 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:shadow-xl transition-all">
                <input 
                  placeholder="Mesajınızı buraya yazın..." 
                  className="flex-1 h-12 bg-transparent border-none focus:ring-0 font-bold text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500" 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMsg.trim()}
                  className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none transition-all shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/30 dark:bg-[#0f172a]/20">
             <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-blue-200 dark:text-blue-500/40 mb-6 animate-bounce duration-[3000ms]">
                <Send size={40} />
             </div>
             <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">Canlı Sohbet</h2>
             <p className="text-gray-400 dark:text-slate-500 font-medium max-w-sm">Eğitmenlerinizle iletişime geçmek için soldaki menüden bir konuşma seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const ConversationCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 4px;
  
  ${props => props.$active ? `
    background: white;
    box-shadow: 0 10px 20px rgba(0,0,0,0.04);
    border: 1px solid #f1f5f9;

    .dark & {
      background: #1e293b;
      border-color: #334155;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
  ` : `
    &:hover { 
      background: rgba(255,255,255,0.5); 
      .dark & { background: rgba(255,255,255,0.05); }
    }
  `}

  .dark & {
    h4 { color: #f1f5f9 !important; }
    p { color: #94a3b8 !important; }
  }
`;

const Avatar = styled.div`
  width: ${props => props.$large ? '56px' : props.$small ? '32px' : '48px'};
  height: ${props => props.$large ? '56px' : props.$small ? '32px' : '48px'};
  border-radius: ${props => props.$large ? '20px' : '14px'};
  background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #2d79f3 0%, #1e40af 100%)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: ${props => props.$large ? '20px' : props.$small ? '12px' : '16px'};
  flex-shrink: 0;
  box-shadow: ${props => props.$hasImage ? 'none' : '0 4px 12px rgba(45, 121, 243, 0.15)'};
  overflow: hidden;
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

const UnreadBadge = styled.div`
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
`;

const MessageWrapper = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: ${props => props.$isMine ? 'row-reverse' : 'row'};
  align-items: flex-start;
`;

const MessageBubble = styled.div`
  padding: 16px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  ${props => props.$isMine ? `
    background: #2d79f3;
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 8px 16px rgba(45, 121, 243, 0.15);
  ` : `
    background: white;
    color: #1e293b;
    border-bottom-left-radius: 4px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.02);
    border: 1px solid #f1f5f9;

    .dark & {
      background: #1e293b;
      color: #f1f5f9;
      border-color: #334155;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
  `}

  .dark & {
    background-color: #0f172a;
    border-color: #334155;
  }
`;
