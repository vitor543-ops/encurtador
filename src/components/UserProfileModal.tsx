import React from 'react';
import { User } from '../types';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  linksCount: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  linksCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#181029] border border-purple-700/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-purple-300 hover:text-white p-1.5 rounded-xl hover:bg-purple-900/40 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=7c3aed,ea580c`}
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-orange-500 shadow-xl mx-auto bg-purple-950"
            />
            {user.provider === 'google' ? (
              <span className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow border border-slate-200" title="Autenticado com Conta Google">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 bg-purple-600 p-1 rounded-full text-white text-[9px] font-bold" title="Cadastro Tradicional">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <p className="text-xs text-purple-300 font-mono mt-0.5">{user.email}</p>
        </div>

        {/* Account Details Box */}
        <div className="bg-[#0e0719] rounded-2xl p-4 border border-purple-800/50 space-y-3 mb-6 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
            <span className="text-purple-400 font-medium">Método de Cadastro:</span>
            <span className="font-bold flex items-center gap-1.5 text-orange-400">
              {user.provider === 'google' ? 'Conta Google' : 'Cadastro Tradicional'}
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>

          {user.phone && (
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
              <span className="text-purple-400 font-medium">Telefone / WhatsApp:</span>
              <span className="font-bold text-white">{user.phone}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
            <span className="text-purple-400 font-medium">Links Criados:</span>
            <span className="font-bold text-white bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-700">
              {linksCount} links
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-medium">Cliente Desde:</span>
            <span className="text-purple-300">
              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Buttons (Clear, labeled, high contrast) */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600 border border-rose-600/40 hover:border-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Sair da Minha Conta
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 font-semibold text-xs rounded-xl transition"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
