import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Plus, Settings, Sparkles, User, Mic } from 'lucide-react';
import { Message, Sender, ChatSession, AppSettings } from '../types';
import { INITIAL_GREETING } from '../constants';

interface ChatInterfaceProps {
  currentChatId: string | null;
  chats: ChatSession[];
  settings: AppSettings;
  onSendMessage: (text: string) => Promise<void>;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onOpenSettings: () => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentChatId,
  chats,
  onSendMessage,
  onNewChat,
  onSelectChat,
  onOpenSettings,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find(c => c.id === currentChatId);
  const messages = activeChat ? activeChat.messages : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Sparkles className="w-6 h-6" />
            <span className="font-bold text-xl tracking-wide text-white">Arohi</span>
          </div>
          <button onClick={onNewChat} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
           <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-2">History</div>
           {chats.map(chat => (
             <button
               key={chat.id}
               onClick={() => {
                 onSelectChat(chat.id);
                 setSidebarOpen(false);
               }}
               className={`w-full text-left p-3 rounded-xl transition-all duration-200 text-sm truncate flex items-center space-x-3 ${chat.id === currentChatId ? 'bg-cyan-900/20 text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
             >
               <span className="truncate">{chat.title}</span>
             </button>
           ))}
           {chats.length === 0 && (
             <div className="px-3 text-sm text-slate-600 italic">No history yet.</div>
           )}
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={onOpenSettings}
            className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors w-full p-2 hover:bg-slate-800 rounded-xl"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header (Mobile Only mostly) */}
        <div className="lg:hidden h-16 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/95 backdrop-blur z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-medium text-white">Arohi AI</span>
          <div className="w-6"></div> 
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
                <Sparkles className="w-12 h-12 text-cyan-500/50" />
                <p>{INITIAL_GREETING}</p>
             </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.sender === Sender.User ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 space-x-reverse`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === Sender.User ? 'bg-cyan-600 ml-2' : 'bg-violet-600 mr-2'}`}>
                    {msg.sender === Sender.User ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                    msg.sender === Sender.User 
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-900/20' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50 shadow-lg'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start w-full">
               <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-700/50">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-900 to-slate-900/0">
          <div className="max-w-3xl mx-auto relative flex items-end space-x-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-3xl p-2 shadow-2xl">
            <button className="p-3 text-slate-400 hover:text-cyan-400 transition-colors">
               <Mic className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-200 placeholder-slate-500 resize-none py-3 max-h-32 scrollbar-hide"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className={`p-3 rounded-full transition-all duration-200 ${
                inputText.trim() && !isLoading 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600">Arohi can make mistakes. Please verify important information.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;