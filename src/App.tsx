import React, { useState, useEffect } from 'react';
import { RotaLinkItem, LinkDestination, User } from './types';
import { Header } from './components/Header';
import { QuickRotatorBox } from './components/QuickRotatorBox';
import { QuickShortenerBox } from './components/QuickShortenerBox';
import { LinkCard } from './components/LinkCard';
import { CreateLinkModal } from './components/CreateLinkModal';
import { QrCodeModal } from './components/QrCodeModal';
import { MetricsModal } from './components/MetricsModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Zap,
  Info,
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  UserCheck,
  UserPlus,
  Link2,
  ArrowRight,
  ArrowLeft,
  Home,
} from 'lucide-react';

export default function App() {
  const [links, setLinks] = useState<RotaLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Active Page Navigation
  const [activePage, setActivePage] = useState<'home' | 'shortener' | 'rotator'>('home');
  const [createModalInitialType, setCreateModalInitialType] = useState<'rotator' | 'single'>('rotator');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'rotator' | 'single' | 'mine'>('all');

  // Sync with URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#encurtar' || hash === '#shortener') {
        setActivePage('shortener');
        setFilterType('single');
      } else if (hash === '#rotacionar' || hash === '#rotator') {
        setActivePage('rotator');
        setFilterType('rotator');
      } else if (hash === '#inicio' || hash === '#home') {
        setActivePage('home');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToPage = (page: 'home' | 'shortener' | 'rotator') => {
    setActivePage(page);
    if (page === 'shortener') {
      window.location.hash = '#encurtar';
      setFilterType('single');
    } else if (page === 'rotator') {
      window.location.hash = '#rotacionar';
      setFilterType('rotator');
    } else {
      window.location.hash = '#inicio';
      setFilterType('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<RotaLinkItem | null>(null);
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });
  const [metricsModal, setMetricsModal] = useState<{
    isOpen: boolean;
    link: RotaLinkItem | null;
  }>({
    isOpen: false,
    link: null,
  });

  // Global toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  // Check saved user session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rotalink_user');
      const token = localStorage.getItem('rotalink_token');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
      if (token) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user) {
              setCurrentUser(data.user);
              localStorage.setItem('rotalink_user', JSON.stringify(data.user));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error('Error loading session:', e);
    }
  }, []);

  // Listen to Google OAuth popup callback message
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const user = event.data.user;
        const token = event.data.token;
        if (user) {
          handleAuthSuccess(user, token);
        }
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleAuthSuccess = (user: User, token?: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('rotalink_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('rotalink_token', token);
      }
    } catch (e) {}
    showToast(`Bem-vindo, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('rotalink_user');
      localStorage.removeItem('rotalink_token');
    } catch (e) {}
    if (filterType === 'mine') {
      setFilterType('all');
    }
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Fetch all links from backend
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Falha ao carregar links.');
      const data = await res.json();
      setLinks(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível conectar ao servidor de links.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Create or Update link
  const handleSaveLink = async (data: any) => {
    const payload = {
      ...data,
      userId: currentUser?.id || data.userId || undefined,
      userEmail: currentUser?.email || data.userEmail || undefined,
    };

    if (editingLink) {
      const res = await fetch(`/api/links/${editingLink.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Erro ao atualizar link.');
      }
      const updated = await res.json();
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast('Link atualizado com sucesso!');
    } else {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Erro ao criar link.');
      }
      const created = await res.json();
      setLinks((prev) => [created, ...prev]);
      showToast('Novo link criado com sucesso!');
    }
  };

  // Delete link
  const handleDeleteLink = async (slug: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o link "/r/${slug}"?`)) return;
    try {
      const res = await fetch(`/api/links/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar link.');
      setLinks((prev) => prev.filter((l) => l.slug !== slug));
      showToast('Link removido com sucesso.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover o link.', 'info');
    }
  };

  // Toggle active status
  const handleToggleActive = async (slug: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/links/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error('Erro ao alterar status.');
      const updated = await res.json();
      setLinks((prev) => prev.map((l) => (l.slug === slug ? updated : l)));
      showToast(
        !currentStatus ? 'Link ativado com sucesso!' : 'Link pausado temporariamente.',
        'info'
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate a click on rotator
  const handleSimulateClick = async (slug: string): Promise<{ chosenDestination: LinkDestination; updatedLink: RotaLinkItem }> => {
    const res = await fetch(`/api/links/${slug}/simulate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro na simulação');
    }
    const data = await res.json();
    setLinks((prev) => prev.map((l) => (l.slug === slug ? data.updatedLink : l)));
    if (metricsModal.isOpen && metricsModal.link?.slug === slug) {
      setMetricsModal({ isOpen: true, link: data.updatedLink });
    }
    return data;
  };

  // Reset stats
  const handleResetStats = async (slug: string) => {
    const res = await fetch(`/api/links/${slug}/reset-stats`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Erro ao zerar estatísticas.');
    const updated = await res.json();
    setLinks((prev) => prev.map((l) => (l.slug === slug ? updated : l)));
    if (metricsModal.isOpen && metricsModal.link?.slug === slug) {
      setMetricsModal({ isOpen: true, link: updated });
    }
    showToast('Estatísticas zeradas com sucesso!', 'info');
  };

  // Filter links
  const myLinksCount = currentUser
    ? links.filter((l) => l.userId === currentUser.id || l.userEmail === currentUser.email).length
    : 0;

  const filteredLinks = links.filter((l) => {
    let matchType = true;
    if (filterType === 'rotator') matchType = l.type === 'rotator';
    else if (filterType === 'single') matchType = l.type === 'single';
    else if (filterType === 'mine') {
      matchType = Boolean(
        currentUser && (l.userId === currentUser.id || l.userEmail === currentUser.email)
      );
    }

    const matchSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      l.destinations.some(
        (d) =>
          d.url.toLowerCase().includes(search.toLowerCase()) ||
          d.title.toLowerCase().includes(search.toLowerCase())
      );
    return matchType && matchSearch;
  });

  const totalClicks = links.reduce((acc, curr) => acc + (curr.totalClicks || 0), 0);
  const totalRotators = links.filter((l) => l.type === 'rotator').length;

  return (
    <div className="min-h-screen bg-[#0a0514] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short bg-gradient-to-r from-purple-800 to-orange-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-orange-400/50">
          <CheckCircle2 className="w-4 h-4 text-orange-200" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        totalLinks={links.length}
        totalClicks={totalClicks}
        totalRotators={totalRotators}
        currentUser={currentUser}
        activePage={activePage}
        onNavigate={navigateToPage}
        onOpenCreateShortener={() => {
          setEditingLink(null);
          setCreateModalInitialType('single');
          setCreateModalOpen(true);
        }}
        onOpenCreateRotator={() => {
          setEditingLink(null);
          setCreateModalInitialType('rotator');
          setCreateModalOpen(true);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ======================================================== */}
        {/* VIEW 1: HOME PAGE (PÁGINA INICIAL)                      */}
        {/* ======================================================== */}
        {activePage === 'home' && (
          <div className="space-y-8">
            {/* 2 Main Feature Buttons on the Home Page */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>O que você deseja fazer hoje?</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-300">
                    Escolha uma das funções abaixo para ir direto à página correspondente:
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Plataforma 100% ativa</span>
                </div>
              </div>

              {/* The 2 Primary Action Cards / Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                {/* 1. Botão Encurtar Link */}
                <button
                  id="home-btn-shorten"
                  onClick={() => navigateToPage('shortener')}
                  className="group text-left p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#1c0d32] via-[#140a25] to-[#0f061c] border-2 border-purple-600/60 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-950/90 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden cursor-pointer flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-600/25 transition" />
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-950/70 border border-purple-400/40 group-hover:scale-110 transition">
                        <Link2 className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider bg-purple-900/90 text-purple-200 border border-purple-500/60 px-3 py-1 rounded-full">
                        Link Único & QR Code
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 group-hover:text-purple-200 transition">
                        <span>Encurtar Link</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-300/85 mt-1.5 leading-relaxed">
                        Transforme qualquer link longo em uma URL curta, elegante e fácil de compartilhar na bio do Instagram, redes sociais e WhatsApp com QR Code.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-purple-900/40 mt-4 relative z-10">
                    <span className="text-xs font-bold text-purple-300 group-hover:text-white transition">
                      Acessar Página de Encurtar Link
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-800/80 group-hover:bg-purple-600 text-white flex items-center justify-center transition shadow">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </button>

                {/* 2. Botão Rotacionar Link */}
                <button
                  id="home-btn-rotator"
                  onClick={() => navigateToPage('rotator')}
                  className="group text-left p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#261019] via-[#1c0a1d] to-[#120516] border-2 border-orange-500/60 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-950/90 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden cursor-pointer flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/25 transition" />
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/70 border border-orange-400/50 group-hover:scale-110 transition">
                        <RefreshCw className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider bg-orange-950/90 text-orange-200 border border-orange-500/60 px-3 py-1 rounded-full">
                        Distribuição 50/50 & Equipe
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 group-hover:text-orange-200 transition">
                        <span>Rotacionar Link</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-orange-200/85 mt-1.5 leading-relaxed">
                        Divida o tráfego igualmente ou personalizado entre múltiplos WhatsApps de atendentes ou sites para balancear leads e testar conversões.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-orange-950/40 mt-4 relative z-10">
                    <span className="text-xs font-bold text-orange-300 group-hover:text-white transition">
                      Acessar Página de Rotacionar Link
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-orange-600/80 group-hover:bg-orange-500 text-white flex items-center justify-center transition shadow">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Rotator Builder Card */}
            <QuickRotatorBox onQuickCreate={handleSaveLink} baseUrl={getBaseUrl()} />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: DEDICATED LINK SHORTENER PAGE (ENCURTADOR)       */}
        {/* ======================================================== */}
        {activePage === 'shortener' && (
          <div className="space-y-8">
            {/* Page Header / Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#140a24] border border-purple-700/60 p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateToPage('home')}
                  className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-300 hover:text-white border border-purple-700 transition cursor-pointer"
                  title="Voltar para a Página Inicial"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      Página: Encurtador de Link Único
                    </h2>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                      Função Ativa
                    </span>
                  </div>
                  <p className="text-xs text-purple-300">
                    Encurte URLs para bio, WhatsApp ou sites com slug personalizado e QR Code.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingLink(null);
                    setCreateModalInitialType('single');
                    setCreateModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold transition shadow cursor-pointer border border-purple-500/40"
                >
                  + Opções Avançadas
                </button>
                <button
                  onClick={() => navigateToPage('rotator')}
                  className="px-3.5 py-2 rounded-xl bg-orange-950/80 hover:bg-orange-900 text-orange-300 hover:text-white text-xs font-bold transition border border-orange-600/50 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ir para Rotador 50/50</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated Shortener Box */}
            <QuickShortenerBox onQuickCreate={handleSaveLink} baseUrl={getBaseUrl()} />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DEDICATED ROTATOR PAGE (ROTACIONAR LINK)         */}
        {/* ======================================================== */}
        {activePage === 'rotator' && (
          <div className="space-y-8">
            {/* Page Header / Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1b0a16] border border-orange-500/60 p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateToPage('home')}
                  className="p-2 rounded-xl bg-orange-950/70 hover:bg-orange-900 text-orange-300 hover:text-white border border-orange-700 transition cursor-pointer"
                  title="Voltar para a Página Inicial"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      Página: Rotador de Links & WhatsApp 50/50
                    </h2>
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded-full border border-orange-500/40">
                      Função Ativa
                    </span>
                  </div>
                  <p className="text-xs text-orange-200">
                    Distribua cliques e leads entre 2 ou mais WhatsApps de forma alternada ou com pesos percentuais.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingLink(null);
                    setCreateModalInitialType('rotator');
                    setCreateModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow cursor-pointer border border-orange-400/50"
                >
                  + Rotador com 3+ Destinos
                </button>
                <button
                  onClick={() => navigateToPage('shortener')}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white text-xs font-bold transition border border-purple-600/50 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ir para Encurtador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated Rotator Box */}
            <QuickRotatorBox onQuickCreate={handleSaveLink} baseUrl={getBaseUrl()} />
          </div>
        )}

        {/* Customer Account Notification / Fast Registration Banner */}
        {!currentUser ? (
          <div className="bg-gradient-to-r from-purple-950/80 via-[#180e2b] to-[#1d0e1e] border border-orange-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Cadastro de Cliente no RotaLink</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                    Opcional ou Recomendado
                  </span>
                </h4>
                <p className="text-xs text-purple-300 mt-0.5">
                  Crie sua conta pelo <strong>cadastro tradicional</strong> (e-mail e senha) ou conecte-se com sua <strong>Conta Google</strong> para gerenciar seus rotadores.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-white font-bold text-xs border border-purple-600 transition shadow cursor-pointer"
              >
                Cadastro Tradicional
              </button>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Conta Google</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#150d26] border border-purple-800/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Conectado como <strong className="text-orange-400">{currentUser.name}</strong> ({currentUser.email})
                </p>
                <p className="text-[11px] text-purple-300">
                  {currentUser.provider === 'google' ? 'Autenticado via Google' : 'Cadastro tradicional'} • Seus links criados são associados à sua conta.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-xs font-bold text-purple-200 hover:text-white border border-purple-700 transition cursor-pointer"
              >
                Minha Conta
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Section */}
        <div className="space-y-4">
          {/* Controls Bar: Search, Filters, Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#130b22] p-4 rounded-2xl border border-purple-900/50">
            {/* Search Input */}
            <div className="flex items-center bg-[#0d0718] border border-purple-800/60 rounded-xl px-3 py-2 flex-1 max-w-md focus-within:border-orange-500 transition">
              <Search className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por título, /r/slug ou URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-purple-400/40 focus:outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-purple-700 text-white shadow'
                    : 'text-purple-300 hover:text-white bg-purple-900/30'
                }`}
              >
                Todos ({links.length})
              </button>
              {currentUser && (
                <button
                  onClick={() => setFilterType('mine')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 cursor-pointer ${
                    filterType === 'mine'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-purple-300 hover:text-white bg-purple-900/30'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  Meus Links ({myLinksCount})
                </button>
              )}
              <button
                onClick={() => setFilterType('rotator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 cursor-pointer ${
                  filterType === 'rotator'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-purple-300 hover:text-white bg-purple-900/30'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                Rotadores ({totalRotators})
              </button>
              <button
                onClick={() => setFilterType('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                  filterType === 'single'
                    ? 'bg-purple-700 text-white shadow'
                    : 'text-purple-300 hover:text-white bg-purple-900/30'
                }`}
              >
                Links Simples ({links.length - totalRotators})
              </button>
            </div>
          </div>

          {/* Links Grid / List */}
          {loading ? (
            <div className="bg-[#130b22] border border-purple-900/40 rounded-2xl p-12 text-center text-purple-300 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-sm font-medium">Carregando seus links...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="bg-[#130b22] border border-purple-900/40 rounded-2xl p-12 text-center text-purple-300 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-900/50 flex items-center justify-center text-orange-400 border border-purple-700/50">
                <Filter className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-white mb-1">Nenhum link encontrado</h3>
                <p className="text-xs text-purple-300">
                  {search
                    ? 'Nenhum resultado corresponde à sua pesquisa. Tente outro termo.'
                    : filterType === 'mine'
                    ? 'Você ainda não possui links associados à sua conta. Crie um novo rotador no formulário acima!'
                    : 'Você ainda não possui links cadastrados. Crie seu primeiro rotador de WhatsApp no formulário acima!'}
                </p>
              </div>
              {(search || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterType('all');
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 underline font-medium cursor-pointer"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  baseUrl={getBaseUrl()}
                  onEdit={(l) => {
                    setEditingLink(l);
                    setCreateModalOpen(true);
                  }}
                  onDelete={handleDeleteLink}
                  onToggleActive={handleToggleActive}
                  onOpenQr={(url, title) => setQrModal({ isOpen: true, url, title })}
                  onOpenMetrics={(l) => setMetricsModal({ isOpen: true, link: l })}
                  onSimulateClick={handleSimulateClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Feature Explanatory Banner: How RotaLink works */}
        <div className="bg-[#11091e] border border-purple-800/40 rounded-2xl p-6 text-xs text-purple-300 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Como o Rotador Inteligente funciona no RotaLink?</span>
          </div>
          <p className="leading-relaxed">
            Ao criar um rotador (como <code>/r/zap-vendas</code>), você cadastra dois ou mais links de destino.
            No modo <strong>1 para cada (50% / 50%)</strong>, o primeiro usuário que clicar será enviado para o
            primeiro WhatsApp, o segundo usuário para o segundo WhatsApp, e assim sucessivamente em ciclo contínuo.
            Você também pode configurar <strong>pesos percentuais</strong> (ex: 70% e 30%) ou sorteio <strong>aleatório</strong>.
            Todas as visitas são registradas em tempo real com estatísticas por atendente!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-[#0a0514] py-6 text-center text-xs text-purple-400/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5">
            <span className="font-bold text-white">Rota<span className="text-orange-500">Link</span></span> —
            Encurtador & Rotador de Links com distribuição 50/50
          </p>
          <p className="text-purple-400/60">
            Cores Roxo & Laranja • Pronto para WhatsApp, Vendas e Atendimento
          </p>
        </div>
      </footer>

      {/* Modals */}
      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveLink}
        editLink={editingLink}
        baseUrl={getBaseUrl()}
        currentUser={currentUser}
        initialType={createModalInitialType}
      />

      <QrCodeModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({ isOpen: false, url: '', title: '' })}
        url={qrModal.url}
        title={qrModal.title}
      />

      {metricsModal.link && (
        <MetricsModal
          isOpen={metricsModal.isOpen}
          onClose={() => setMetricsModal({ isOpen: false, link: null })}
          link={metricsModal.link}
          onResetStats={handleResetStats}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
