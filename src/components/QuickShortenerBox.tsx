import React, { useState } from 'react';
import { Link2, MessageSquare, ArrowRight, Check, Copy, Sparkles, QrCode, ExternalLink } from 'lucide-react';
import { WhatsAppHelperModal } from './WhatsAppHelperModal';

interface QuickShortenerBoxProps {
  onQuickCreate: (data: any) => Promise<void>;
  baseUrl: string;
}

export const QuickShortenerBox: React.FC<QuickShortenerBoxProps> = ({
  onQuickCreate,
  baseUrl,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // WhatsApp modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  const handleApplyWhatsApp = (waUrl: string, suggestedTitle: string) => {
    setUrl(waUrl);
    if (!title && suggestedTitle) {
      setTitle(suggestedTitle);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatedUrl(null);

    if (!url.trim()) {
      setError('Por favor, informe a URL ou link de destino.');
      return;
    }

    try {
      setLoading(true);
      const generatedSlug = slug.trim() || Math.random().toString(36).substring(2, 8);
      const finalTitle = title.trim() || `Link Encurtado (${generatedSlug})`;

      await onQuickCreate({
        title: finalTitle,
        slug: generatedSlug,
        type: 'single',
        rotationMode: 'round_robin',
        destinations: [
          {
            title: finalTitle,
            url: url.trim(),
            weight: 100,
          },
        ],
      });

      const fullShortUrl = `${baseUrl}/r/${generatedSlug}`;
      setCreatedUrl(fullShortUrl);
      setUrl('');
      setTitle('');
      setSlug('');
    } catch (err: any) {
      setError(err.message || 'Erro ao encurtar link.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-[#1b0d2e] via-[#140a24] to-[#0f071c] border-2 border-purple-600/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/40 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-950/60 border border-purple-400/40 shrink-0">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Encurtador de Link Único
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                  Rápido & Rastreável
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-300/90 mt-0.5">
                Transforme qualquer link longo em uma URL curta, elegante e com QR Code instantâneo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWhatsAppModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 hover:text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>+ Gerar Link de WhatsApp</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Success Alert with generated link */}
        {createdUrl && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/90 via-emerald-950/80 to-purple-950/90 border-2 border-emerald-500/70 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Link encurtado com sucesso!
              </p>
              <p className="text-sm font-mono font-bold text-white break-all">
                {createdUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => copyToClipboard(createdUrl)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
              <a
                href={createdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-700 transition"
                title="Testar Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleQuickSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Destination URL */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-purple-200 flex items-center justify-between">
                <span>URL de Destino Original *</span>
                <span className="text-[10px] text-purple-400 font-normal">Site, WhatsApp ou Campanha</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://exemplo.com/pagina-ou-whatsapp"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#110820] border border-purple-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            {/* Title / Name */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-purple-200">
                Título / Identificador
              </label>
              <input
                type="text"
                placeholder="Ex: Bio Instagram, Vendas..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#110820] border border-purple-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>

            {/* Custom Slug */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-purple-200 flex items-center justify-between">
                <span>Slug Personalizado</span>
                <span className="text-[10px] text-purple-400 font-normal">Opcional</span>
              </label>
              <div className="flex items-center bg-[#110820] border border-purple-700/80 rounded-xl px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
                <span className="text-xs font-mono text-purple-400/80 select-none">/r/</span>
                <input
                  type="text"
                  placeholder="meu-link"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9_-]/g, '')
                    )
                  }
                  className="w-full bg-transparent text-sm text-white placeholder-purple-400/40 focus:outline-none px-1"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-purple-900/40">
            <div className="text-xs text-purple-300/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <span>
                Link curto final:{' '}
                <strong className="font-mono text-orange-400 font-semibold">
                  {baseUrl}/r/{slug || 'aleatorio'}
                </strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-purple-950/60 flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer disabled:opacity-50 border border-purple-400/40"
            >
              {loading ? (
                <span>Encurtando Link...</span>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-purple-200" />
                  <span>Encurtar Link Agora</span>
                  <ArrowRight className="w-4 h-4 text-purple-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppHelperModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        onApply={handleApplyWhatsApp}
      />
    </div>
  );
};
