import React, { useState } from 'react';
import { User, AuthResponse } from '../types';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Traditional email/password submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
    }

    try {
      setLoading(true);
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body =
        mode === 'register'
          ? { name: name.trim(), email: email.trim(), password, phone: phone.trim() }
          : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na autenticação.');
      }

      setSuccessMsg(
        mode === 'register'
          ? 'Cadastro realizado com sucesso!'
          : 'Login efetuado com sucesso!'
      );
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In / Registration Handler
  const handleGoogleAuth = async (customEmail?: string, customName?: string) => {
    try {
      setLoading(true);
      setError('');

      // Prompt or default to current user's email or google account
      const googleUserEmail = customEmail || (email.includes('@') ? email : 'cliente.google@gmail.com');
      const googleUserName = customName || (name.trim() || 'Cliente Google');

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUserEmail,
          name: googleUserName,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUserName)}&backgroundColor=ea580c,7c3aed`,
          googleId: 'g_' + Math.random().toString(36).substring(2, 9),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao autenticar com Google.');
      }

      setSuccessMsg('Conectado via Conta Google com sucesso!');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar com Conta Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#181029] border border-purple-700/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white max-h-[95vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-purple-300 hover:text-white p-1.5 rounded-xl hover:bg-purple-900/40 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 shrink-0">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-orange-500 flex items-center justify-center shadow-xl shadow-purple-950/60 ring-2 ring-orange-500/40">
            {mode === 'register' ? (
              <UserPlus className="w-7 h-7 text-white" />
            ) : (
              <LogIn className="w-7 h-7 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'register' ? 'Cadastro de Cliente' : 'Acesse sua Conta'}
          </h2>
          <p className="text-xs text-purple-300 mt-1">
            {mode === 'register'
              ? 'Cadastre-se para gerenciar seus rotadores e salvar suas métricas'
              : 'Entre com seu e-mail ou utilize sua conta Google'}
          </p>
        </div>

        {/* Toggle Mode Tabs (Clear, high contrast buttons) */}
        <div className="grid grid-cols-2 gap-2 bg-[#0d0718] p-1.5 rounded-2xl border border-purple-900/60 mb-5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-950/40'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Criar Cadastro
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-950/40'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Já Sou Cliente
          </button>
        </div>

        {/* Google Sign-in Button (Prominent, clear, high-contrast) */}
        <div className="mb-5 shrink-0">
          <button
            type="button"
            onClick={() => handleGoogleAuth()}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-3 transition transform active:scale-[0.98] border border-slate-300 cursor-pointer disabled:opacity-50"
          >
            {/* Google Multi-color G Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com a Conta Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-800/60" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-[#181029] px-3 text-purple-400 font-semibold tracking-wider">
                ou com cadastro tradicional
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-600/50 rounded-xl text-xs text-rose-200">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-600/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">Nome Completo *</label>
              <div className="flex items-center bg-[#0d0718] border border-purple-800/60 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500 transition">
                <UserIcon className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ex: Vitor Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-transparent text-white placeholder-purple-400/40 focus:outline-none text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">E-mail *</label>
            <div className="flex items-center bg-[#0d0718] border border-purple-800/60 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500 transition">
              <Mail className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder-purple-400/40 focus:outline-none text-xs"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                WhatsApp / Telefone (Opcional)
              </label>
              <div className="flex items-center bg-[#0d0718] border border-purple-800/60 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500 transition">
                <Phone className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="11 99999-8888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-purple-400/40 focus:outline-none text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              Senha {mode === 'register' && '(Mínimo 6 caracteres)'} *
            </label>
            <div className="flex items-center bg-[#0d0718] border border-purple-800/60 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500 transition">
              <Lock className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder-purple-400/40 focus:outline-none text-xs"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">Confirmar Senha *</label>
              <div className="flex items-center bg-[#0d0718] border border-purple-800/60 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500 transition">
                <Lock className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-white placeholder-purple-400/40 focus:outline-none text-xs"
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-950/50'
                  : 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-950/50'
              }`}
            >
              {loading ? (
                'Processando...'
              ) : (
                <>
                  <span>
                    {mode === 'register' ? 'Concluir Cadastro de Cliente' : 'Entrar na Minha Conta'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-purple-900/40 text-center shrink-0">
          <p className="text-[11px] text-purple-400">
            {mode === 'register' ? (
              <>
                Já possui conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-orange-400 hover:text-orange-300 font-bold underline"
                >
                  Entrar aqui
                </button>
              </>
            ) : (
              <>
                Ainda não tem cadastro?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-orange-400 hover:text-orange-300 font-bold underline"
                >
                  Cadastre-se grátis
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
