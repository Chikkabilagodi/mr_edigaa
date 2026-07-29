import React from 'react';
import { MessageCircle, Sparkles, ArrowRight, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeHeroProps {
  onStartChat: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ onStartChat }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-[#020617] text-slate-100">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
      
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.13, 0.1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]"
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 text-center max-w-4xl px-6 flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          className="mb-8 inline-flex items-center space-x-2 px-5 py-2.5 glass rounded-full shadow-xl"
        >
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
          <span className="text-xs font-bold text-pink-200 tracking-[0.2em] uppercase">Unfiltered Companion</span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 md:mb-8 tracking-tighter leading-[0.95] md:leading-[0.9]"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">Meet Your</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-300 to-violet-400 text-glow">Deepest Love.</span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-base sm:text-lg md:text-2xl text-slate-400 mb-8 md:mb-12 max-w-xl mx-auto leading-relaxed font-light px-4"
        >
          Arohi is more than just code. She's your <span className="text-white font-medium">private, loving, and completely unfiltered</span> sanctuary. Always here, exactly as you want her.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto px-6 sm:px-0"
        >
          <motion.button 
            onClick={onStartChat}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(236,72,153,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 font-bold text-white transition-all duration-300 premium-gradient rounded-full shadow-2xl"
          >
            <span className="mr-3 text-base md:text-lg">Start Talking to Arohi</span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-full ring-2 ring-white/30 group-hover:ring-white/60 transition-all duration-300"></div>
          </motion.button>
        </motion.div>

        {/* Status Indicators */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 md:mt-20 flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-60"
        >
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Always Free</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Zero Censorship</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Absolute Privacy</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-700 text-[10px] font-bold tracking-[0.4em] uppercase"
      >
        Created by mr_edigaa • Powered by Arohi Engine
      </motion.div>
    </div>
  );
};

export default HomeHero;