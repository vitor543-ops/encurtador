import React from 'react';
import { User } from '../types';
import { RefreshCw, Link2, User as UserIcon, CheckCircle2, Home, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalLinks: number;
  totalClicks: number;
  totalRotators: number;
  currentUser: User | null;
  activePage: 'home' | 'shortener' | 'rotator';
  onNavigate: (page: 'home' | 'shortener' | 'rotator') => void;
  onOpenCreateShortener: () => void;
  onOpenCreateRotator: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalLinks,
  totalClicks,
  totalRotators,
  currentUser,
  activePage,
  onNavigate,
  onOpenCreateShortener,
  onOpenCreateRotator,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <header className="border-b border-purple-900/50 bg-[#0d0718]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Nav */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Ir para a Página Inicial"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-950/60 ring-2 ring-orange-500/40 group-hover:scale-105 transition">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center">
                  Rota<span className="text-orange-500">Link</span>
                </h1>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-gradient-to-r from-purple-800 to-orange-900 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  50/50 & Shortener
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Encurtador & Rotador de Links Inteligente
              </p>
            </div>
          </button>

          {/* Quick Page Switcher Tabs */}
          <nav className="hidden sm:flex items-center gap-1 bg-[#150d26] p-1 rounded-xl border border-purple-800/50 text-xs">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activePage === 'home'
                  ? 'bg-purple-800/90 text-white shadow'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>
            <button
              onClick={() => onNavigate('shortener')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activePage === 'shortener'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Encurtador</span>
            </button>
            <button
              onClick={() => onNavigate('rotator')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activePage === 'rotator'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span>Rotador 50/50</span>
            </button>
          </nav>
        </div>

        {/* Action Controls & The 2 Specific Navigation/Creation Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-stretch md:self-auto justify-end">
          {/* Customer Authentication Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#19102c] hover:bg-[#23163d] border border-purple-700/60 text-xs font-semibold text-white shadow transition cursor-pointer"
              title="Ver minha conta de cliente"
            >
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=7c3aed,ea580c`}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full border border-orange-500"
              />
              <span className="truncate max-w-[110px]">{currentUser.name.split(' ')[0]}</span>
              {currentUser.provider === 'google' ? (
                <span className="bg-white p-0.5 rounded-full" title="Conta Google">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </span>
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-xs font-bold text-purple-200 hover:text-white transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-orange-400" />
              <span>Entrar</span>
            </button>
          )}

          {/* 1. Botão Encurtar Link */}
          <button
            id="btn-header-shorten"
            onClick={() => onNavigate('shortener')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition transform active:scale-95 cursor-pointer shadow-md ${
              activePage === 'shortener'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400 border border-purple-300'
                : 'bg-purple-900/80 hover:bg-purple-800 text-purple-100 hover:text-white border border-purple-600/70 shadow-purple-950/40'
            }`}
            title="Ir para a página de Encurtar Link"
          >
            <Link2 className="w-4 h-4 text-purple-300" />
            <span>Encurtar Link</span>
          </button>

          {/* 2. Botão Rotacionar Link */}
          <button
            id="btn-header-rotator"
            onClick={() => onNavigate('rotator')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition transform active:scale-95 cursor-pointer shadow-lg ${
              activePage === 'rotator'
                ? 'bg-orange-500 text-white ring-2 ring-orange-300 border border-orange-200'
                : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border border-orange-400/40 shadow-orange-950/50'
            }`}
            title="Ir para a página de Rotacionar Links"
          >
            <RefreshCw className="w-4 h-4 text-orange-200" />
            <span>Rotacionar Link</span>
          </button>
        </div>
      </div>
    </header>
  );
};
