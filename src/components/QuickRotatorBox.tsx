import React, { useState } from 'react';
import { RefreshCw, MessageSquare, ArrowRight, Zap, Check } from 'lucide-react';
import { WhatsAppHelperModal } from './WhatsAppHelperModal';

interface QuickRotatorBoxProps {
  onQuickCreate: (data: any) => Promise<void>;
  baseUrl: string;
}

export const QuickRotatorBox: React.FC<QuickRotatorBoxProps> = ({
  onQuickCreate,
  baseUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [link1, setLink1] = useState('');
  const [name1, setName1] = useState('WhatsApp Atendente 1');
  const [link2, setLink2] = useState('');
  const [name2, setName2] = useState('WhatsApp Atendente 2');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // WhatsApp modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);

  const handleOpenHelper = (slot: 1 | 2) => {
    setActiveSlot(slot);
    setWhatsAppModalOpen(true);
  };

  const handleApplyWhatsApp = (url: string, suggestedTitle: string) => {
    if (activeSlot === 1) {
      setLink1(url);
      if (suggestedTitle) setName1(suggestedTitle);
    } else {
      setLink2(url);
      if (suggestedTitle) setName2(suggestedTitle);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Por favor, dê um nome para o seu rotador.');
      return;
    }
    if (!link1.trim() || !link2.trim()) {
      setError('Preencha os 2 links (ex: os dois números ou links de WhatsApp).');
      return;
    }

    try {
      setLoading(true);
      await onQuickCreate({
        title: title.trim(),
        slug: slug.trim(),
        type: 'rotator',
        rotationMode: 'round_robin', // 50/50
        destinations: [
          { title: name1.trim() || 'Destino 1', url: link1.trim(), weight: 50 },
          { title: name2.trim() || 'Destino 2', url: link2.trim(), weight: 50 },
        ],
      });

      setSuccessMsg('Rotador 50/50 criado com sucesso!');
      setTitle('');
      setLink1('');
      setLink2('');
      setSlug('');
      setTimeout(() => {
        setSuccessMsg('');
        setIsOpen(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar rotador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-[#1c1133] via-[#160d2b] to-[#251336] border border-purple-800/70 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Criação Rápida 50% / 50%
            </span>
            <span className="text-xs text-purple-300">
              Rotacione 1 clique para você e 1 clique para seu parceiro
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Crie um Rotador de WhatsApp em segundos
          </h2>
          <p className="text-sm text-purple-200/90 mb-6 leading-relaxed">
            Insira os links de WhatsApp de duas pessoas. O RotaLink vai gerar um único link curto que distribui
            exatamente <strong>50% dos cliques para um</strong> e <strong>50% para o outro</strong> de forma alternada!
          </p>

          <form onSubmit={handleQuickSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-600/50 rounded-xl text-xs text-rose-200">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                {successMsg}
              </div>
            )}

            {/* Title & optional slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Nome da Equipe ou Campanha *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Plantão WhatsApp Vendas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#0d0718] border border-purple-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Link Curto Personalizado (Opcional)
                </label>
                <div className="flex items-center bg-[#0d0718] border border-purple-800/60 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500 transition">
                  <span className="text-purple-400 text-xs font-mono select-none mr-1">/r/</span>
                  <input
                    type="text"
                    placeholder="ex: zap-equipe"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                    className="w-full bg-transparent text-white placeholder-purple-400/40 focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* The 2 Links: 50% / 50% */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Link 1 */}
              <div className="bg-[#0f081c] p-4 rounded-2xl border border-purple-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    Primeiro Destino (50%)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenHelper(1)}
                    className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 bg-emerald-900/60 hover:bg-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-500/60 shadow-sm transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Gerar Link WhatsApp</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nome (ex: WhatsApp Atendente Júlia)"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-purple-400/40 border-b border-purple-900 focus:border-purple-600 focus:outline-none py-1"
                />
                <input
                  type="text"
                  placeholder="https://wa.me/5511... ou URL"
                  value={link1}
                  onChange={(e) => setLink1(e.target.value)}
                  required
                  className="w-full bg-[#181126] border border-purple-800/60 rounded-lg px-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              {/* Link 2 */}
              <div className="bg-[#0f081c] p-4 rounded-2xl border border-purple-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    Segundo Destino (50%)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenHelper(2)}
                    className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 bg-emerald-900/60 hover:bg-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-500/60 shadow-sm transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Gerar Link WhatsApp</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nome (ex: WhatsApp Atendente Marcos)"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-purple-400/40 border-b border-purple-900 focus:border-purple-600 focus:outline-none py-1"
                />
                <input
                  type="text"
                  placeholder="https://wa.me/5511... ou URL"
                  value={link2}
                  onChange={(e) => setLink2(e.target.value)}
                  required
                  className="w-full bg-[#181126] border border-purple-800/60 rounded-lg px-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <RefreshCw className="w-4 h-4 text-orange-400 animate-spin-slow" />
                <span>
                  Alternância justa 1 a 1: <strong>Clique 1 → Destino 1 | Clique 2 → Destino 2</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black shadow-xl shadow-orange-950/60 flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer disabled:opacity-50 border border-orange-400/40"
              >
                {loading ? (
                  <span>Criando Rotador...</span>
                ) : (
                  <>
                    <span>Criar Rotador 50/50 Agora</span>
                    <ArrowRight className="w-4 h-4 text-orange-200" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <WhatsAppHelperModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        onApply={handleApplyWhatsApp}
      />
    </>
  );
};
