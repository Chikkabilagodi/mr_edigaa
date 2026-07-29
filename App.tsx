
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HomeHero from './components/HomeHero';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import LockScreen from './components/LockScreen';
import { ChatSession, AppSettings, Message, Sender } from './types';
import { sendMessageToGemini, generateSpeech } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1.0);
  const [isLocked, setIsLocked] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>({
    memoryEnabled: true,
    theme: 'dark',
    flirtLevel: 3, 
    personaMode: 'romantic',
    memories: []
  });

  useEffect(() => {
    // Clear previous chats on request
    localStorage.removeItem('arohi_chats');
    setChats([]);
    
    const savedSettings = localStorage.getItem('arohi_settings');
    const savedVolume = localStorage.getItem('arohi_volume');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ 
          ...prev, 
          ...parsed,
          memories: parsed.memories || [],
          personaMode: parsed.personaMode || 'romantic'
        }));
        if (parsed.passcode) {
          setIsLocked(true);
        }
      } catch (e) { console.error('Failed to parse settings', e); }
    }

    if (savedVolume) {
      setAudioVolume(parseFloat(savedVolume));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('arohi_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('arohi_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('arohi_volume', audioVolume.toString());
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = audioVolume;
    }
  }, [audioVolume]);

  const stopAudio = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setPlayingMessageId(null);
    setPlaybackProgress(0);
  };

  const playAudioData = async (base64Data: string, msgId: string) => {
    try {
      stopAudio();
      setPlayingMessageId(msgId);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      
      const cleanB64 = base64Data.replace(/^data:audio\/pcm;base64,/, "");
      const binaryString = atob(cleanB64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const audioBuffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = audioVolume;
      gainNodeRef.current = gainNode;
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const duration = audioBuffer.duration;
      const startTime = audioContext.currentTime;
      
      source.onended = () => {
        if (playingMessageId === msgId) stopAudio();
      };
      
      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = audioContext.currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setPlaybackProgress(progress);
        if (progress >= 100) stopAudio();
      }, 50);
      
      source.start();
    } catch (e) {
      console.error("Playback error", e);
      stopAudio();
    }
  };

  const handlePlayAudio = async (text: string, msgId: string) => {
    if (playingMessageId === msgId) {
      stopAudio();
      return;
    }

    // Check if we have cached audio in the message
    const activeChat = chats.find(c => c.id === currentChatId);
    const targetMsg = activeChat?.messages.find(m => m.id === msgId);
    
    if (targetMsg?.audio) {
      await playAudioData(targetMsg.audio, msgId);
      return;
    }

    setIsLoading(true); 
    try {
      const audioData = await generateSpeech(text);
      if (audioData) {
        // Cache the audio back into the chat state
        setChats(prev => prev.map(chat => {
          if (chat.id !== currentChatId) return chat;
          return {
            ...chat,
            messages: chat.messages.map(m => m.id === msgId ? { ...m, audio: audioData } : m)
          };
        }));
        await playAudioData(audioData, msgId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string, attachment?: string, isImageGen: boolean = false) => {
    if (!currentChatId) return;
    const userMsg: Message = {
      id: generateId(),
      text,
      sender: Sender.User,
      timestamp: Date.now(),
      attachment: attachment
    };
    
    setChats(prev => prev.map(c => {
      if (c.id === currentChatId) {
        const newTitle = c.messages.length === 0 
          ? (text.slice(0, 30) || (isImageGen ? "Creating Magic..." : "Image sent...")) 
          : c.title;
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
    try {
      const activeChat = chats.find(c => c.id === currentChatId);
      const history = activeChat ? activeChat.messages : [];
      const response = await sendMessageToGemini(
        text, 
        attachment,
        history, 
        settings.memoryEnabled, 
        settings.flirtLevel || 3,
        settings.memories,
        settings.personaMode || 'romantic',
        isImageGen
      );
      
      const botMsgId = generateId();
      const botMsg: Message = {
        id: botMsgId,
        text: response.text,
        sender: Sender.Bot,
        timestamp: Date.now(),
        attachment: response.attachment
      };
      
      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: [...c.messages, botMsg], 
            updatedAt: Date.now()
          };
        }
        return c;
      }));

      // AUTO-PLAY: Generate and play audio for the new bot message immediately
      if (audioVolume > 0 && !isImageGen) {
        const audioData = await generateSpeech(response.text);
        if (audioData) {
          setChats(prev => prev.map(chat => {
            if (chat.id !== currentChatId) return chat;
            return {
              ...chat,
              messages: chat.messages.map(m => m.id === botMsgId ? { ...m, audio: audioData } : m)
            };
          }));
          await playAudioData(audioData, botMsgId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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

  const deleteChat = (id: string) => {
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    if (currentChatId === id) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
      } else {
        setCurrentChatId(null);
        setView('home');
      }
    }
  };

  const handleSetReaction = (chatId: string, messageId: string, emoji: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;
      return {
        ...chat,
        messages: chat.messages.map(msg => {
          if (msg.id !== messageId) return msg;
          const currentReactions = msg.reactions || [];
          const hasReaction = currentReactions.includes(emoji);
          const newReactions = hasReaction 
            ? currentReactions.filter(r => r !== emoji)
            : [...currentReactions, emoji];
          return { ...msg, reactions: newReactions };
        })
      };
    }));
  };

  const handleStartChat = () => {
    if (chats.length > 0) {
      setCurrentChatId(chats[0].id);
      setView('chat');
    } else {
      createNewChat();
    }
  };

  const deleteAllChats = () => {
    setChats([]);
    setCurrentChatId(null);
    setView('home');
    localStorage.removeItem('arohi_chats');
  };

  const clearAllData = () => {
    setChats([]);
    setCurrentChatId(null);
    setView('home');
    setIsSettingsOpen(false);
    localStorage.removeItem('arohi_chats');
    localStorage.removeItem('arohi_settings');
    setSettings({
      memoryEnabled: true,
      theme: 'dark',
      flirtLevel: 3, 
      personaMode: 'romantic',
      memories: []
    });
  };

  return (
    <div className="font-sans text-slate-200 bg-[#020617] min-h-screen">
      <AnimatePresence>
        {isLocked && settings.passcode && (
          <LockScreen 
            storedPin={settings.passcode} 
            onUnlock={() => setIsLocked(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <HomeHero onStartChat={handleStartChat} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
          >
            <ChatInterface 
              currentChatId={currentChatId}
              chats={chats}
              settings={settings}
              onSendMessage={handleSendMessage}
              onNewChat={createNewChat}
              onSelectChat={setCurrentChatId}
              onDeleteChat={deleteChat}
              onDeleteAllChats={deleteAllChats}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onPlayAudio={handlePlayAudio}
              onSetReaction={handleSetReaction}
              isLoading={isLoading}
              playingMessageId={playingMessageId}
              playbackProgress={playbackProgress}
              audioVolume={audioVolume}
              onVolumeChange={setAudioVolume}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={setSettings}
            onClearAllData={clearAllData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
