import React, { useState, useEffect } from 'react';
import HomeHero from './components/HomeHero';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import { ChatSession, AppSettings, Message, Sender } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid'; // Need to polyfill or use random string since we can't install uuid

// Simple UUID generator polyfill since we can't depend on external 'uuid' package in this specific output format effectively without package.json installation
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    memoryEnabled: true,
    theme: 'dark'
  });

  // Load from LocalStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('arohi_chats');
    const savedSettings = localStorage.getItem('arohi_settings');
    
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (e) { console.error('Failed to parse chats', e); }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) { console.error('Failed to parse settings', e); }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('arohi_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('arohi_settings', JSON.stringify(settings));
  }, [settings]);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setView('chat');
  };

  const handleStartChat = () => {
    if (chats.length > 0) {
      // Go to most recent
      setCurrentChatId(chats[0].id);
      setView('chat');
    } else {
      createNewChat();
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentChatId) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: generateId(),
      text,
      sender: Sender.User,
      timestamp: Date.now()
    };

    setChats(prev => prev.map(c => {
      if (c.id === currentChatId) {
        // Update Title if it's the first message
        const newTitle = c.messages.length === 0 ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return c;
    }));

    setIsLoading(true);

    // 2. Get AI Response
    const activeChat = chats.find(c => c.id === currentChatId);
    // Use current messages (including the one just added effectively, though state might lag slightly, so we pass explicit list if needed, 
    // but here we just pass the history BEFORE the new message + the new text to the service to keep it clean)
    const history = activeChat ? activeChat.messages : [];
    
    const responseText = await sendMessageToGemini(text, history, settings.memoryEnabled);

    // 3. Add AI Message
    const botMsg: Message = {
      id: generateId(),
      text: responseText,
      sender: Sender.Bot,
      timestamp: Date.now()
    };

    setChats(prev => prev.map(c => {
      if (c.id === currentChatId) {
        return {
          ...c,
          messages: [...c.messages, userMsg, botMsg], // Ensure order is correct
          updatedAt: Date.now()
        };
      }
      return c;
    }));

    setIsLoading(false);
  };

  const clearAllData = () => {
    setChats([]);
    setCurrentChatId(null);
    setView('home');
    setIsSettingsOpen(false);
    localStorage.removeItem('arohi_chats');
  };

  return (
    <div className="font-sans text-slate-200">
      {view === 'home' ? (
        <HomeHero onStartChat={handleStartChat} />
      ) : (
        <ChatInterface 
          currentChatId={currentChatId}
          chats={chats}
          settings={settings}
          onSendMessage={handleSendMessage}
          onNewChat={createNewChat}
          onSelectChat={setCurrentChatId}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isLoading={isLoading}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onToggleMemory={() => setSettings(prev => ({ ...prev, memoryEnabled: !prev.memoryEnabled }))}
        onClearAllData={clearAllData}
      />
    </div>
  );
};

export default App;
