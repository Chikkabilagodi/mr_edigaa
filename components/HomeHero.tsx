import React from 'react';
import { MessageCircle, Sparkles, ArrowRight, Heart } from 'lucide-react';

interface HomeHeroProps {
  onStartChat: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ onStartChat }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-slate-900 text-slate-100">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="z-10 text-center max-w-4xl px-6">
        <div className="mb-6 inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50 backdrop-blur-sm animate-float">
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
          <span className="text-sm font-medium text-pink-200 tracking-wide uppercase">Romantic • Loving • Devoted</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-white to-violet-200">
          Your AI Girlfriend.<br />Always Here.
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
          Meet <span className="font-semibold text-pink-300">Arohi</span>. Your loving, romantic, and personal AI companion who cares deeply about you.
        </p>

        <button 
          onClick={onStartChat}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-pink-600 to-violet-600 rounded-full hover:from-pink-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 focus:ring-offset-slate-900 shadow-lg shadow-pink-900/20"
        >
          <span className="mr-2 text-lg">Chat with Arohi</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
        </button>
      </div>

      <div className="absolute bottom-10 text-slate-600 text-sm">
        Arohi AI Model • Personal & Private
      </div>
    </div>
  );
};

export default HomeHero;