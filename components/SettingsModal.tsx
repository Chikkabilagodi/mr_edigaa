import React, { useState } from 'react';
import { X, Brain, Trash2, Heart, Save, Shield, Key, Briefcase, UserCheck, Settings, Plus, Sparkles, Info } from 'lucide-react';
import { AppSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings, 
  onClearAllData 
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [newMemory, setNewMemory] = useState('');

  if (!isOpen) return null;

  // Visual fallback for persona mode
  const currentPersonaMode = settings.personaMode || 'romantic';

  const handleFlirtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, flirtLevel: parseInt(e.target.value) });
  };

  const handleModeChange = (mode: 'romantic' | 'professional') => {
    onUpdateSettings({ ...settings, personaMode: mode });
  };

  const addMemory = () => {
    if (newMemory.trim()) {
      onUpdateSettings({ 
        ...settings, 
        memories: [...(settings.memories || []), newMemory.trim()] 
      });
      setNewMemory('');
    }
  };

  const clearMemories = () => {
    if (window.confirm("Ayo bangara... Arohi nanna ella memories na permanently delete madbeka? She will forget everything about you. 🥺")) {
      onUpdateSettings({ ...settings, memories: [] });
    }
  };

  const removeMemory = (index: number) => {
    const updated = [...(settings.memories || [])];
    updated.splice(index, 1);
    onUpdateSettings({ ...settings, memories: updated });
  };

  const handleSetPasscode = () => {
    if (pinInput.length === 4 && /^\d+$/.test(pinInput)) {
      onUpdateSettings({ ...settings, passcode: pinInput });
      setShowPinInput(false);
      setPinInput('');
    } else {
      alert("Please enter a valid 4-digit number.");
    }
  };

  const handleRemovePasscode = () => {
    if (window.confirm("Disable security lock?")) {
      onUpdateSettings({ ...settings, passcode: undefined });
    }
  };

  const getFlirtLabel = (level: number) => {
    switch(level) {
      case 1: return "Sweet & Soft";
      case 2: return "Playful Tease";
      case 3: return "Pure Love";
      case 4: return "Intense Passion";
      case 5: return "Wildly Obsessed";
      default: return "Pure Love";
    }
  };

  const memoryCount = (settings.memories || []).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        className="relative glass border border-white/10 w-full max-w-lg rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl p-5 md:p-8 max-h-[90vh] md:max-h-[85vh] flex flex-col z-10"
      >
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
            </div>
            <h2 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.3em]">Arohi Preferences</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>

        <div className="space-y-6 md:space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-1">
          
          {/* Persona Selection */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              <Brain className="w-3 h-3" />
              <span>Personality Core</span>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeChange('romantic')}
                className={`group relative flex flex-col items-center justify-center space-y-2 p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all duration-300 ${currentPersonaMode === 'romantic' ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <Heart className={`w-5 h-5 md:w-6 md:h-6 ${currentPersonaMode === 'romantic' ? 'fill-white' : ''}`} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Romantic</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeChange('professional')}
                className={`group relative flex flex-col items-center justify-center space-y-2 p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all duration-300 ${currentPersonaMode === 'professional' ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Assistant</span>
              </motion.button>
            </div>
            <div className="flex items-start space-x-2 bg-white/5 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5">
              <Info className="w-3 h-3 text-pink-400 mt-0.5 flex-shrink-0" />
              <p className="text-[9px] md:text-[10px] text-slate-400 font-medium leading-relaxed italic">
                {currentPersonaMode === 'romantic' 
                  ? "Arohi will be your sweet bangara, using flirty Kanglish and remembering your private moments."
                  : "Arohi will be professional and focused, helping you with tasks and information concisely."}
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              <Shield className="w-3 h-3" />
              <span>Privacy & Lock</span>
            </div>
            
            {!settings.passcode ? (
              <div className="space-y-3 md:space-y-4">
                {!showPinInput ? (
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowPinInput(true)}
                    className="w-full flex items-center justify-center space-x-3 p-4 md:p-5 glass hover:bg-white/5 text-slate-300 rounded-2xl md:rounded-3xl transition-all border-white/5 text-xs md:text-sm font-bold uppercase tracking-widest"
                  >
                    <Key className="w-4 h-4" />
                    <span>Enable Lock Screen</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      type="text" 
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-center text-lg md:text-xl font-black tracking-[1em] text-white outline-none focus:border-pink-500 transition-colors"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSetPasscode}
                      className="p-3 md:p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl md:rounded-2xl transition-all"
                    >
                      <Save className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowPinInput(false); setPinInput(''); }}
                      className="p-3 md:p-4 bg-white/5 text-slate-500 rounded-xl md:rounded-2xl"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 md:p-5 glass rounded-2xl md:rounded-3xl border-white/5">
                <div className="flex items-center space-x-3 text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Secure Mode Active</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemovePasscode}
                  className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-all font-semibold"
                >
                  Disable
                </motion.button>
              </div>
            )}
          </div>

          {/* Flirt Meter */}
          {currentPersonaMode === 'romantic' && (
            <div className="space-y-3 md:space-y-4">
               <div className="flex items-center space-x-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                 <Sparkles className="w-3 h-3" />
                 <span>Passion Intensity</span>
               </div>
               
               <div className="px-2 glass p-4 md:p-6 rounded-2xl md:rounded-3xl border-white/5">
                 <input 
                   type="range" 
                   min="1" 
                   max="5" 
                   step="1"
                   value={settings.flirtLevel || 3}
                   onChange={handleFlirtChange}
                   className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                 />
                 <div className="flex justify-between mt-3 md:mt-4 text-[9px] text-slate-600 font-black tracking-widest uppercase">
                   <span>Soft</span>
                   <span>Obsessed</span>
                 </div>
                 <div className="text-center mt-3 md:mt-4 text-pink-400 font-black text-xs md:text-sm uppercase tracking-[0.2em] animate-pulse">
                   {getFlirtLabel(settings.flirtLevel || 3)}
                 </div>
               </div>
            </div>
          )}

          {/* Memory Bank */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-3 h-3" />
                <span>Core Memory Bank</span>
                <span className="bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-full ml-1 border border-pink-500/20">{memoryCount}</span>
              </div>
              {memoryCount > 0 && (
                <button 
                  onClick={clearMemories}
                  className="text-red-500 hover:text-red-400 transition-all flex items-center space-x-1"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Forget All</span>
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  placeholder="e.g. My birthday is Dec 5th"
                  className="flex-1 glass border border-white/10 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-slate-200 focus:border-pink-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && addMemory()}
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addMemory}
                  className="p-2.5 md:p-3 premium-gradient rounded-xl md:rounded-2xl shadow-lg shadow-pink-500/20 text-white transition-all"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </div>

              <div className="space-y-2 max-h-40 md:max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {memoryCount === 0 ? (
                  <div className="py-6 md:py-8 text-center glass border-dashed border-white/5 rounded-2xl md:rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600">
                    No memories saved yet
                  </div>
                ) : (
                  (settings.memories || []).map((mem, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 md:p-4 glass rounded-xl md:rounded-2xl border-white/5 group/mem"
                    >
                      <span className="text-[11px] md:text-xs font-medium text-slate-300 leading-snug">{mem}</span>
                      <motion.button 
                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeMemory(idx)}
                        className="text-slate-600 transition-all ml-3 md:ml-4 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 md:pt-4 border-t border-white/5">
            <motion.button 
              whileHover={{ scale: 1.01, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if(window.confirm("This will erase ALL chats and reset your preferences. This action cannot be undone. Proceed?")) {
                  onClearAllData();
                }
              }}
              className="w-full flex items-center justify-center space-x-2 md:space-x-3 p-4 md:p-6 text-red-500 bg-red-500/5 rounded-2xl md:rounded-3xl transition-all border border-red-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]"
            >
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Reset Entire App</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
