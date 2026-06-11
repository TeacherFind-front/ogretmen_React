import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { getConversations, getMessages, sendMessage } from "@/services/messageService";
import { startChatConnection, getChatConnection, sendMessageLive } from "@/services/chatService";
import { Loader2, Send, Search, MoreVertical, Check, CheckCheck, Paperclip, ArrowLeft } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

export default function StudentMessages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();

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

    const setupSignalR = async () => {
      const connection = await startChatConnection();
      if (connection) {
        connection.off("ReceiveMessage", handleNewMessage);
        connection.on("ReceiveMessage", handleNewMessage);
      }
    };
    setupSignalR();

    return () => {
      const connection = getChatConnection();
      if (connection) {
        connection.off("ReceiveMessage", handleNewMessage);
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

    try {
      const success = await sendMessageLive(selectedConv.otherUserId, msgContent);
      if (!success) {
        const sent = await sendMessage({
          receiverId: selectedConv.otherUserId,
          content: msgContent
        });
        
        // Eğer bu yeni bir konuşmaysa, conversationId'yi güncelle
        if (selectedConv.conversationId === "new") {
          fetchConversations();
        }
        
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
              $active={selectedConv?.otherUserId === conv.otherUserId}
              onClick={() => setSelectedConv(conv)}
            >
              <div className="relative">
                 <Avatar>
                   {conv.otherUserName?.charAt(0)}
                 </Avatar>
                 <OnlineStatus />
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
                  <Avatar $small>
                    {selectedConv.otherUserName?.charAt(0)}
                  </Avatar>
                  <div>
                     <h3 className="font-black text-gray-900 dark:text-slate-100 leading-none mb-1">{selectedConv.otherUserName || "Kullanıcı"}</h3>
                     <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Çevrimiçi</span>
                     </div>
                  </div>
               </div>
               <button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-900 dark:hover:text-slate-100 flex items-center justify-center transition-all"><MoreVertical size={20} /></button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 dark:bg-[#0f172a]/50">
              {messages.map((m, i) => (
                <MessageWrapper key={m.id || i} $isMine={m.senderId === user?.userId}>
                   <div className="flex flex-col gap-1 max-w-[70%]">
                      <MessageBubble $isMine={m.senderId === user?.userId}>
                        {m.content}
                      </MessageBubble>
                      <div className={`flex items-center gap-2 px-2 ${m.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}>
                         <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                           {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {m.senderId === user?.userId && (
                           <span className="text-blue-500"><CheckCheck size={12} /></span>
                         )}
                      </div>
                   </div>
                </MessageWrapper>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-[#1e293b] shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800 p-2 pl-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 focus-within:border-blue-200 dark:focus-within:border-blue-500/50 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:shadow-xl transition-all">
                <button type="button" className="text-gray-400 hover:text-blue-600 transition-colors"><Paperclip size={20} /></button>
                <input 
                  placeholder="Mesajınızı buraya yazın..." 
                  className="flex-1 h-12 bg-transparent border-none focus:ring-0 font-bold text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500" 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMsg.trim()}
                  className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none transition-all"
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
  background: linear-gradient(135deg, #2d79f3 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: ${props => props.$large ? '20px' : props.$small ? '12px' : '16px'};
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(45, 121, 243, 0.15);
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
