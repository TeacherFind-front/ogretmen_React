import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { getConversations, getMessages, sendMessage } from "@/services/messageService";
import { startChatConnection, stopChatConnection, sendMessageLive } from "@/services/chatService";
import { Loader2, Send, Search, MoreVertical, Check, CheckCheck, Paperclip } from "lucide-react";
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

    startChatConnection(handleNewMessage);

    return () => {
      stopChatConnection();
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
    <div className="bg-white rounded-[2.5rem] border border-gray-100 flex h-[calc(100vh-160px)] max-w-7xl mx-auto overflow-hidden shadow-2xl">
      
      {/* Sidebar - Conversations list */}
      <div className="w-96 border-r flex flex-col hidden md:flex bg-gray-50/30">
        <div className="p-6 border-b bg-white/50 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder="Mesajlarda ara..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <ConversationCard 
              key={conv.conversationId} 
              $active={selectedConv?.conversationId === conv.conversationId}
              onClick={() => setSelectedConv(conv)}
            >
              <div className="relative">
                <Avatar>{conv.otherUserName?.charAt(0) || "U"}</Avatar>
                <OnlineStatus $online={true} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-sm text-gray-900">{conv.otherUserName || "Eğitmen"}</h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-xs text-gray-500 truncate font-medium">{conv.lastMessage}</p>
                   {conv.unreadCount > 0 && <UnreadBadge>{conv.unreadCount}</UnreadBadge>}
                </div>
              </div>
            </ConversationCard>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b flex items-center px-8 justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <Avatar $large>{selectedConv.otherUserName?.charAt(0) || "U"}</Avatar>
                <div>
                  <h3 className="font-black text-gray-900 text-lg leading-tight">{selectedConv.otherUserName}</h3>
                  <p className="text-[11px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Çevrimiçi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all"><MoreVertical size={20} /></button>
                 <button className="rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold px-6 py-3 text-white text-sm">Ders Ayırt</button>
              </div>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#f8fafc]">
              {messages.map((m) => (
                <MessageWrapper key={m.id} $isMine={m.senderId === user?.userId}>
                   {m.senderId !== user?.userId && <Avatar $small className="mt-auto">{selectedConv.otherUserName?.charAt(0)}</Avatar>}
                   <div className="flex flex-col max-w-[70%]">
                      <MessageBubble $isMine={m.senderId === user?.userId}>
                        <p>{m.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[9px] font-black uppercase tracking-widest">
                           {new Date(m.sentAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                           {m.senderId === user?.userId && (
                             m.isRead ? <CheckCheck size={12} className="text-white" /> : <Check size={12} className="text-white/70" />
                           )}
                        </div>
                      </MessageBubble>
                   </div>
                </MessageWrapper>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t bg-white shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-4 bg-gray-50 p-2 pl-6 rounded-[2rem] border border-gray-100 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl transition-all">
                <button type="button" className="text-gray-400 hover:text-blue-600 transition-colors"><Paperclip size={20} /></button>
                <input 
                  placeholder="Mesajınızı buraya yazın..." 
                  className="flex-1 h-12 bg-transparent border-none focus:ring-0 font-bold text-gray-700" 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMsg.trim()}
                  className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/30">
             <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-200 mb-6 animate-bounce duration-[3000ms]">
                <Send size={40} />
             </div>
             <h2 className="text-2xl font-black text-gray-900 mb-2">Canlı Sohbet</h2>
             <p className="text-gray-400 font-medium max-w-sm">Eğitmenlerinizle iletişime geçmek için soldaki menüden bir konuşma seçin.</p>
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
  ` : `
    &:hover { background: rgba(255,255,255,0.5); }
  `}
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
  `}
`;
