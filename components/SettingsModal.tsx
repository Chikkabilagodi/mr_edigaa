import React from 'react';
import { X, Brain, Moon, Trash2 } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onToggleMemory: () => void;
  onClearAllData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onToggleMemory, 
  onClearAllData 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-float">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-white mb-6">Settings</h2>

        <div className="space-y-6">
          {/* Memory Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-500/20 rounded-full">
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">Conversation Memory</h3>
                <p className="text-xs text-slate-400">Allow Arohi to remember context.</p>
              </div>
            </div>
            <button 
              onClick={onToggleMemory}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.memoryEnabled ? 'bg-cyan-600' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.memoryEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Theme (Visual only for now) */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 opacity-70 cursor-not-allowed">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Moon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">Dark Mode</h3>
                <p className="text-xs text-slate-400">Theme is currently locked.</p>
              </div>
            </div>
            <div className="text-xs text-cyan-500 font-medium">ON</div>
          </div>

          <hr className="border-slate-700" />

          {/* Danger Zone */}
          <button 
            onClick={() => {
              if(window.confirm("Are you sure? This will delete all chat history.")) {
                onClearAllData();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors border border-transparent hover:border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
