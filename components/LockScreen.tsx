import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LockScreenProps {
  storedPin: string;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ storedPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === storedPin) {
          setTimeout(onUnlock, 150);
        } else {
          setTimeout(() => {
            setError(true);
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 select-none"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.12, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px]"
      />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="flex flex-col items-center max-w-[280px] sm:max-w-xs w-full"
      >
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="mb-6 md:mb-8 relative"
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-pink-500/20"
          >
            <Lock className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
          </motion.div>
        </motion.div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 font-['Outfit']">Arohi is Locked</h2>
        <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8">Enter your 4-digit passcode</p>

        {/* PIN Indicators */}
        <div className="flex space-x-4 md:space-x-6 mb-8 md:mb-12">
          {[0, 1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              animate={{
                scale: pin.length > i ? 1.25 : 1,
                borderColor: error ? "#ef4444" : pin.length > i ? "#ec4899" : "#334155",
                backgroundColor: error ? "#ef4444" : pin.length > i ? "#ec4899" : "transparent"
              }}
              transition={{ duration: 0.15 }}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 shadow-[0_0_15px_rgba(236,72,153,0.5)]`}
            />
          ))}
        </div>

        {/* Keyboard */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.08, borderColor: "rgba(236,72,153,0.3)" }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleNumberClick(num.toString())}
              className="w-full aspect-square rounded-full bg-slate-900/50 border border-slate-800 text-xl md:text-2xl font-medium text-slate-200 flex items-center justify-center transition-colors"
            >
              {num}
            </motion.button>
          ))}
          <div className="w-full"></div>
          <motion.button
            whileHover={{ scale: 1.08, borderColor: "rgba(236,72,153,0.3)" }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleNumberClick('0')}
            className="w-full aspect-square rounded-full bg-slate-900/50 border border-slate-800 text-xl md:text-2xl font-medium text-slate-200 flex items-center justify-center transition-colors"
          >
            0
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, color: "#ffffff" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="w-full aspect-square rounded-full bg-transparent text-slate-500 flex items-center justify-center transition-colors"
          >
            <Delete className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>

        {/* Bypass Option */}
        <motion.button
          whileHover={{ scale: 1.05, color: "#f472b6" }}
          whileTap={{ scale: 0.95 }}
          onClick={onUnlock}
          className="mt-8 text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]"
        >
          Instant Bypass Unlock
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default LockScreen;
