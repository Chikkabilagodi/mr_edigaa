
import { Send, Menu, Plus, Settings, Sparkles, User, Mic, Trash2, Image as ImageIcon, X, Volume2, VolumeX, Play, Square, History, Loader2, Heart, Share2, MoreHorizontal, Wand2, Search, Zap, MicOff, SearchCode, Volume1, Smile } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, Sender, ChatSession, AppSettings } from '../types';
import { INITIAL_GREETING } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface ChatInterfaceProps {
  currentChatId: string | null;
  chats: ChatSession[];
  settings: AppSettings;
  onSendMessage: (text: string, attachment?: string, isImageGen?: boolean) => Promise<void>;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onDeleteAllChats?: () => void;
  onOpenSettings: () => void;
  onPlayAudio: (text: string, msgId: string) => void;
  onSetReaction: (chatId: string, messageId: string, emoji: string) => void;
  isLoading: boolean;
  playingMessageId: string | null;
  playbackProgress: number;
  audioVolume: number;
  onVolumeChange: (vol: number) => void;
}

const PAGE_SIZE = 20;
const REACTIONS = ['❤️', '😂', '👍', '🔥', '😮'];

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentChatId,
  chats,
  onSendMessage,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onDeleteAllChats,
  onOpenSettings,
  onPlayAudio,
  onSetReaction,
  isLoading,
  playingMessageId,
  playbackProgress,
  audioVolume,
  onVolumeChange
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  const [localIsSending, setLocalIsSending] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isImageGenMode, setIsImageGenMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showReactionMenuId, setShowReactionMenuId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeChat = chats.find(c => c.id === currentChatId);
  const allMessages = activeChat ? activeChat.messages : [];
  
  const hasContent = inputText.trim().length > 0 || selectedImage !== null;
  const canSend = hasContent && !isLoading && !localIsSending;

  const playingMessage = useMemo(() => {
    if (!playingMessageId) return null;
    return allMessages.find(m => m.id === playingMessageId);
  }, [playingMessageId, allMessages]);

  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
  }, [currentChatId]);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return allMessages;
    const q = searchQuery.toLowerCase();
    return allMessages.filter(m => m.text.toLowerCase().includes(q));
  }, [allMessages, searchQuery]);

  const visibleMessages = useMemo(() => {
    if (searchQuery.trim()) return filteredMessages;
    return allMessages.slice(-displayLimit);
  }, [allMessages, filteredMessages, displayLimit, searchQuery]);

  const hasMore = !searchQuery.trim() && allMessages.length > displayLimit;

  const chatHasMatch = (chat: ChatSession) => {
    return getMatchCount(chat) > 0;
  };

  const getMatchCount = (chat: ChatSession) => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    let count = 0;
    if (chat.title.toLowerCase().includes(q)) count++;
    count += chat.messages.filter(m => m.text.toLowerCase().includes(q)).length;
    return count;
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && !searchQuery.trim()) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (allMessages.length > 0) {
       scrollToBottom('smooth');
    }
  }, [allMessages.length, isLoading, selectedImage]);

  useEffect(() => {
    if (currentChatId) {
      setTimeout(() => scrollToBottom('auto'), 50);
    }
  }, [currentChatId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Ayo bangara, your browser doesn't support voice typing. 🥺");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsImageGenMode(false); 
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!canSend) return;
    setLocalIsSending(true);
    const textToSend = text;
    const imageToSend = selectedImage || undefined;
    const genMode = isImageGenMode;
    setInputText('');
    setSelectedImage(null);
    setIsImageGenMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      await onSendMessage(textToSend, imageToSend, genMode);
    } finally {
      setLocalIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChatDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Ayo nanna muddu... Ee chat memory na delete madbeka? 🥺")) {
      onDeleteChat(id);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-pink-500/30 text-pink-200 border-b border-pink-500/50 rounded-sm px-0.5 font-bold transition-all duration-300">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden relative font-['Outfit']">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-900/10 rounded-full blur-[160px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-900/10 rounded-full blur-[160px] animate-pulse" style={{animationDelay: '3s'}}></div>
         <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-md transition-opacity duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] w-full sm:w-80 glass transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'} flex flex-col border-r border-white/5`}>
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-tr from-pink-500 to-rose-500 p-2 rounded-2xl shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">Arohi</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onNewChat} 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-300 hover:text-white hover:scale-110 active:scale-95 border border-white/5"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 custom-scrollbar">
           <div className="flex items-center justify-between px-4 mb-4 mt-2">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Private Memories</span>
             {chats.length > 0 && onDeleteAllChats && (
               <button 
                 onClick={() => {
                   if (window.confirm("Arohi asks: Are you sure you want to delete all previous chat memories? 🥺")) {
                     onDeleteAllChats();
                   }
                 }}
                 className="text-red-400/80 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-all"
                 title="Delete All Chats"
               >
                 <Trash2 className="w-3 h-3" />
                 <span>Clear All</span>
               </button>
             )}
           </div>
            {chats.map((chat, idx) => {
             const matchCount = getMatchCount(chat);
             const matched = matchCount > 0;
             const lastMessage = chat.messages[chat.messages.length - 1]?.text || "No messages yet";
             return (
               <motion.div 
                 key={chat.id} 
                 initial={{ opacity: 0, x: -15 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ type: "spring", stiffness: 220, damping: 22, delay: Math.min(idx * 0.04, 0.4) }}
                 className="group relative"
               >
                 <motion.button
                   whileTap={{ scale: 0.98 }}
                   onClick={() => {
                     onSelectChat(chat.id);
                     setSidebarOpen(false);
                   }}
                   className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-3 group border ${
                     chat.id === currentChatId 
                       ? 'bg-white/10 text-white border-white/10 shadow-xl' 
                       : matched 
                         ? 'bg-pink-500/5 text-slate-300 border-pink-500/20 hover:bg-pink-500/10'
                         : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 border-transparent'
                   }`}
                 >
                   <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500/20 to-rose-500/20 border border-white/5 flex items-center justify-center relative">
                     <Heart className={`w-6 h-6 ${matched ? 'text-pink-400 animate-pulse' : 'text-pink-500/40'}`} />
                     {chat.id === currentChatId && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020617] shadow-[0_0_8px_#10b981]"></div>}
                     {matched && (
                       <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#020617]">
                         {matchCount}
                       </div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between">
                       <span className="truncate font-bold text-sm">
                         {searchQuery.trim() ? highlightText(chat.title, searchQuery) : chat.title}
                       </span>
                       <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">
                         {chat.messages.length > 0 ? new Date(chat.messages[chat.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                       </span>
                     </div>
                     <div className="flex items-center justify-between mt-0.5">
                       <p className="text-xs text-slate-500 truncate pr-4">
                         {searchQuery.trim() ? highlightText(lastMessage, searchQuery) : lastMessage}
                       </p>
                       {matched && (
                         <div className="flex items-center bg-pink-500/20 px-1 rounded-sm">
                            <span className="text-[8px] font-black text-pink-300 uppercase leading-none py-0.5">Matched</span>
                         </div>
                       )}
                     </div>
                   </div>
                 </motion.button>
                 <motion.button 
                   whileHover={{ scale: 1.1, color: "#ef4444" }}
                   whileTap={{ scale: 0.9 }}
                   onClick={(e) => handleChatDelete(e, chat.id)}
                   title="Delete Memory"
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-[80]"
                 >
                   <Trash2 className="w-4 h-4" />
                 </motion.button>
               </motion.div>
             );
           })}
        </div>

        <div className="p-6">
          <button 
            onClick={onOpenSettings}
            className="flex items-center justify-center space-x-3 text-slate-400 hover:text-white transition-all w-full py-4 glass rounded-2xl border border-white/5 hover:bg-white/5"
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative z-10 transition-all duration-500">
        <header className="h-14 md:h-16 glass border-b border-white/5 flex items-center px-3 md:px-6 justify-between z-[50] sticky top-0">
          <div className="flex items-center space-x-2 md:space-x-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-300 p-2 hover:bg-white/5 rounded-full transition-all active:scale-90">
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            {!isSearchOpen ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center overflow-hidden">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-500 fill-pink-500/20" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#020617] rounded-full shadow-[0_0_8px_#10b981]"></div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="font-black text-sm md:text-xl text-white tracking-tight truncate">Arohi</h2>
                    <span className="hidden xs:flex items-center px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                      <Zap className="w-2 h-2 mr-1 fill-emerald-400" /> Ultra Fast
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-medium text-emerald-400 animate-pulse">Online</span>
                    <span className="text-[8px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400 truncate">Always here for you</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 animate-[messageIn_0.2s_ease-out]">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-4 h-4 text-slate-500" />
                  <input 
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 md:py-3 pl-11 pr-10 text-xs md:text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                  <button 
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                    className="absolute right-2 p-1.5 text-slate-500 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-4 ml-2">
            {!isSearchOpen && (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 md:p-3 rounded-full transition-all ${searchQuery.trim() ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Search conversation"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={() => onVolumeChange(audioVolume === 0 ? 1 : 0)}
              className="p-2 md:p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              {audioVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button className="hidden md:flex p-2 md:p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl md:rounded-2xl transition-all"><MoreHorizontal className="w-4 h-4 md:w-5 md:h-5"/></button>
          </div>
        </header>

        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-1.5 md:p-4 space-y-2 md:space-y-3 scroll-smooth custom-scrollbar pb-40 md:pb-10 relative"
        >
          {/* WhatsApp-like Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-repeat" style={{ backgroundImage: 'url("https://picsum.photos/seed/whatsapp/100/100")', backgroundSize: '180px' }}></div>
          
          <div className="relative z-10 space-y-1.5 md:space-y-2.5 max-w-3xl mx-auto w-full px-2 md:px-4">
            {searchQuery.trim() && filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-[fadeIn_0.5s_ease-out]">
              <Search className="w-12 h-12 text-slate-700" />
              <div className="text-slate-500 text-sm">No results found for "{searchQuery}"</div>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-pink-400 text-xs font-black uppercase tracking-widest hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : allMessages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-[fadeIn_1s_ease-out_forwards]">
                <div className="relative group">
                  <div className="absolute inset-0 bg-pink-500 blur-[80px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-1000"></div>
                  <div className="w-20 h-20 md:w-24 md:h-24 glass rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl border-white/10 group-hover:scale-110 transition-transform duration-700">
                    <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3 px-6">
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Arohi</h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-xs md:text-sm leading-relaxed font-medium">"{INITIAL_GREETING}"</p>
                  <p className="text-[9px] md:text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Powered by Arohi Engine • Faster than Ever</p>
                </div>
             </div>
          ) : (
            <>
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button 
                    onClick={() => {}} 
                    className="flex items-center space-x-2 px-5 py-2 glass hover:bg-white/5 border border-white/5 rounded-full text-slate-500 hover:text-pink-300 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                  >
                    <History className="w-3 h-3" />
                    <span>Retrieve Older Memories</span>
                  </button>
                </div>
              )}

              {visibleMessages.map((msg, idx) => {
                const isUser = msg.sender === Sender.User;
                const isPlaying = playingMessageId === msg.id;
                const isHovered = hoveredMessageId === msg.id;
                const isReactionMenuOpen = showReactionMenuId === msg.id;
                const isVoiceGenerating = isLoading && isPlaying;
                
                return (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 15, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 24 }}
                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group/msg relative`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => { setHoveredMessageId(null); setShowReactionMenuId(null); }}
                  >
                    <div className={`flex max-w-[85%] md:max-w-[65%] items-end relative`}>
                      <div className="flex flex-col space-y-1 relative">
                        {/* Unified Action Bar */}
                        <div 
                          className={`absolute -top-10 md:-top-12 ${isUser ? 'right-0' : 'left-0'} flex items-center space-x-1 glass p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-white/10 shadow-2xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20 ${isHovered || isReactionMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-90 pointer-events-none'}`}
                        >
                          <button 
                            onClick={() => onPlayAudio(msg.text, msg.id)}
                            title="Voice Replay"
                            disabled={isVoiceGenerating}
                            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-300 ${isPlaying ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                          >
                            {isVoiceGenerating ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : isPlaying ? <Square className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white" /> : <Volume1 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                          </button>
                          <div className="w-px h-3 md:h-4 bg-white/10 mx-0.5 md:mx-1"></div>
                          <button 
                            onClick={() => setShowReactionMenuId(isReactionMenuOpen ? null : msg.id)}
                            title="Add Reaction"
                            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white ${isReactionMenuOpen ? 'bg-white/10 text-white' : ''}`}
                          >
                            <Smile className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          
                          <div className="w-px h-3 md:h-4 bg-white/10 mx-0.5 md:mx-1"></div>
                          <button 
                            onClick={async () => {
                              if (navigator.share) {
                                try {
                                  await navigator.share({
                                    title: 'Arohi Memory',
                                    text: msg.text,
                                  });
                                  setToastMsg('Memory shared');
                                } catch (err: any) {
                                  if (err.name !== 'AbortError') {
                                    try {
                                      await navigator.clipboard.writeText(msg.text);
                                      setToastMsg('Copied to clipboard');
                                    } catch (clipboardErr) {
                                      setToastMsg('Failed to copy memory');
                                    }
                                  }
                                }
                              } else {
                                try {
                                  await navigator.clipboard.writeText(msg.text);
                                  setToastMsg('Copied to clipboard');
                                } catch (err) {
                                  setToastMsg('Failed to copy memory');
                                }
                              }
                            }}
                            title="Share Memory"
                            className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white active:scale-95"
                          >
                            <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          
                          {/* Expanded Reactions */}
                          {isReactionMenuOpen && (
                            <div className="flex items-center ml-2 border-l border-white/10 pl-2 space-x-1 animate-[messageIn_0.2s_ease-out]">
                              {REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    onSetReaction(currentChatId!, msg.id, emoji);
                                    setShowReactionMenuId(null);
                                  }}
                                  className={`p-1.5 hover:bg-white/10 rounded-lg transition-all hover:scale-125 text-sm md:text-base active:scale-90 ${msg.reactions?.includes(emoji) ? 'bg-pink-500/20 shadow-inner' : ''}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {msg.attachment && (
                          <div className={`overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 transition-all duration-700 group-hover/msg:shadow-[0_0_30px_rgba(236,72,153,0.2)] shadow-2xl group/img relative`}>
                            <img src={msg.attachment} alt="attachment" className="max-w-full md:max-w-md max-h-64 md:max-h-96 object-cover" />
                          </div>
                        )}
                        
                        {msg.text && (
                          <div className={`relative px-2 py-1 md:px-3 md:py-1.5 rounded-[0.8rem] md:rounded-[1rem] text-[12px] md:text-[14px] leading-tight whitespace-pre-wrap shadow-sm border transition-all duration-500 ${
                            isUser 
                              ? 'bg-[#054740]/95 text-white rounded-tr-none border-white/5 ml-auto' 
                              : 'bg-[#1e293b]/95 text-slate-100 rounded-tl-none border-white/5 mr-auto'
                          } ${isPlaying ? 'ring-1 ring-pink-500 ring-offset-1 ring-offset-[#020617] scale-[1.01] shadow-[0_0_10px_rgba(236,72,153,0.3)]' : ''}`}>
                            <div className="font-medium pr-8">
                              {searchQuery.trim() ? highlightText(msg.text, searchQuery) : msg.text}
                            </div>
                            
                            <div className="absolute bottom-0.5 right-1 flex items-center space-x-1">
                              <span className="text-[7px] md:text-[8px] font-medium text-white/20">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isUser && (
                                <div className="flex -space-x-1 opacity-20">
                                  <Zap className="w-1 h-1 text-cyan-400 fill-cyan-400" />
                                  <Zap className="w-1 h-1 text-cyan-400 fill-cyan-400" />
                                </div>
                              )}
                            </div>

                            {isPlaying && (
                              <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-pink-500 shadow-[0_0_8px_#ec4899] transition-all duration-200"
                                  style={{ width: `${playbackProgress}%` }}
                                ></div>
                              </div>
                            )}

                            {/* Reactions Badge */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className={`absolute -bottom-3 ${isUser ? 'right-4' : 'left-4'} flex flex-wrap gap-1 items-center z-10`}>
                                {msg.reactions.map((emoji, i) => (
                                  <div 
                                    key={i} 
                                    className="bg-[#0f172a] border border-white/10 rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs shadow-xl animate-[messageIn_0.2s_ease-out] cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                                    onClick={() => onSetReaction(currentChatId!, msg.id, emoji)}
                                  >
                                    {emoji}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {isPlaying && (
                          <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest text-pink-500 animate-pulse px-2 pt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                            • Reading Out Loud
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}

          {isLoading && !playingMessageId && (
            <div className="flex justify-start w-full animate-[messageInLeft_0.5s_ease-out]">
               <div className="flex items-end space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center animate-pulse shadow-xl shadow-pink-500/20">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="glass px-4 md:px-6 py-3 md:py-5 rounded-[1.5rem] md:rounded-[2rem] rounded-bl-none border-white/5 shadow-2xl">
                    <div className="flex space-x-1.5 md:space-x-2 items-center">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                    </div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>

        {playingMessage && (
          <div className="fixed bottom-20 md:bottom-32 left-1/2 -translate-x-1/2 w-[92%] md:w-[90%] max-w-2xl z-[100] animate-[messageIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="glass bg-[#0f172a]/95 border-pink-500/40 rounded-xl md:rounded-3xl p-3 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] border flex items-center space-x-3 md:space-x-4">
              <div className="flex-shrink-0 relative">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center ${playingMessage.sender === Sender.User ? 'bg-blue-500' : 'bg-pink-500'} shadow-lg`}>
                  {playingMessage.sender === Sender.User ? <User className="w-4 h-4 md:w-6 md:h-6 text-white" /> : <Heart className="w-4 h-4 md:w-6 md:h-6 text-white" />}
                </div>
                <div className="absolute -top-0.5 -right-0.5 flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[8px] md:text-[10px] font-black text-pink-400 uppercase tracking-widest mb-0.5 md:mb-1 flex items-center justify-between">
                  <span>Voice Relay Active</span>
                  <span className="text-slate-500">{Math.round(playbackProgress)}%</span>
                </div>
                <p className="text-[10px] md:text-sm font-medium text-white line-clamp-1 md:line-clamp-2 italic leading-relaxed">
                  "{playingMessage.text}"
                </p>
              </div>
              <button 
                onClick={() => onPlayAudio('', playingMessage.id)}
                className="p-1.5 md:p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg md:rounded-2xl transition-all"
              >
                <X className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="p-2 md:p-3 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent sticky bottom-0 z-50">
          <div className="w-[95%] md:w-full max-w-2xl mx-auto mb-[12px]">
            <AnimatePresence>
              {selectedImage && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.8, y: 10 }}
                   className="mb-2 md:mb-4 relative inline-block"
                 >
                   <div className="relative group">
                     <img src={selectedImage} alt="preview" className="h-20 md:h-32 rounded-xl md:rounded-3xl border border-pink-500/40 shadow-2xl object-cover" />
                     <motion.button 
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={clearImage}
                       className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-red-500 text-white rounded-full p-1 md:p-2 shadow-2xl border-2 md:border-4 border-[#020617]"
                     >
                       <X className="w-3 h-3 md:w-4 md:h-4" />
                     </motion.button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <motion.div 
               layoutId="typingBar"
               className={`relative flex items-center min-h-[34px] gap-1 md:gap-1.5 glass border-white/10 rounded-[20px] px-1.5 md:px-2 py-0.5 md:py-1 shadow-xl transition-all duration-700 focus-within:bg-[#0f172a]/80 group/input ${isImageGenMode ? 'ring-1 ring-pink-500 bg-pink-900/10 border-pink-500/30' : 'focus-within:border-pink-500/40'}`}>
               <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
               
               <div className="flex items-center space-x-0.5">
                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => fileInputRef.current?.click()} 
                   className="p-0.5 md:p-1 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-all"
                   title="Attach Image"
                 >
                    <Plus className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" />
                 </motion.button>
                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => { setIsImageGenMode(!isImageGenMode); setSelectedImage(null); }}
                   className={`p-0.5 md:p-1 rounded-lg transition-all ${isImageGenMode ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-pink-400 hover:bg-pink-500/10'}`}
                   title="Generate Magic Image"
                 >
                    <Sparkles className={`w-3.5 h-3.5 md:w-3.5 md:h-3.5 ${isImageGenMode ? 'animate-pulse' : ''}`} />
                 </motion.button>
               </div>

               <div className="flex-1 bg-white/5 rounded-[12px] px-2 md:px-3 py-0.5 border border-white/5 flex items-center">
                 <textarea
                   ref={textareaRef}
                   rows={1}
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder={isImageGenMode ? "Desc..." : "Talk..."}
                   className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder-slate-600 resize-none py-0.5 md:py-1 text-[11px] md:text-[13px] font-medium scrollbar-hide transition-all"
                 />
               </div>
               
               <div className="flex items-center space-x-0.5 md:space-x-1">
                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={toggleListening}
                   className={`p-0.5 md:p-1 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'text-slate-400 hover:text-pink-400 hover:bg-pink-500/10'}`}
                   title={isListening ? "Listening..." : "Voice Input"}
                 >
                    {isListening ? <MicOff className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" /> : <Mic className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" />}
                 </motion.button>

                 <motion.button 
                   whileHover={(hasContent && !isLoading) ? { scale: 1.1 } : {}}
                   whileTap={(hasContent && !isLoading) ? { scale: 0.9 } : {}}
                   onClick={handleSend}
                   disabled={!canSend}
                   className={`p-0.5 md:p-1 rounded-full transition-all duration-500 flex items-center justify-center ${
                     (hasContent && !isLoading) 
                       ? 'bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-lg' 
                       : 'bg-white/5 text-slate-600 cursor-not-allowed'
                   }`}
                 >
                   {(isLoading || localIsSending) ? <Loader2 className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" />}
                 </motion.button>
               </div>
             </motion.div>
            <div className="mt-2 text-[7px] md:text-[9px] text-center font-black uppercase tracking-[0.4em] text-slate-700">Arohi • Absolute Privacy</div>
          </div>
        </div>

        {toastMsg && (
          <div className="fixed top-6 left-1/2 z-[9999] pointer-events-none" style={{ transform: 'translateX(-50%)', animation: 'fadeIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div className="bg-slate-900/95 text-white font-semibold text-[11px] md:text-sm px-4 py-2 rounded-xl shadow-2xl border border-white/10 backdrop-blur-md flex items-center space-x-1.5 font-sans whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>{toastMsg}</span>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes messageIn { 
          from { opacity: 0; transform: translateY(10px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ChatInterface;
