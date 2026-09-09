import React, { useState } from 'react';
import { RotaLinkItem } from '../types';
import {
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  BarChart3,
  Edit2,
  Trash2,
  Pause,
  Play,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Globe,
  Share2,
} from 'lucide-react';

interface LinkCardProps {
  link: RotaLinkItem;
  onEdit: (link: RotaLinkItem) => void;
  onDelete: (slug: string) => void;
  onToggleActive: (slug: string, currentStatus: boolean) => void;
  onOpenMetrics: (link: RotaLinkItem) => void;
  onOpenQr: (url: string, title: string) => void;
  onSimulateClick: (slug: string) => Promise<{ destinationTitle: string; destinationUrl: string; count: number } | null>;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onToggleActive,
  onOpenMetrics,
  onOpenQr,
  onSimulateClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [lastSimulation, setLastSimulation] = useState<{
    destinationTitle: string;
    destinationUrl: string;
    count: number;
  } | null>(null);

  const fullShortUrl = `${window.location.origin}/r/${link.slug}`;
  const totalClicks = link.totalClicks || 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const result = await onSimulateClick(link.slug);
      if (result) {
        setLastSimulation(result);
        setTimeout(() => setLastSimulation(null), 5000);
      }
    } finally {
      setSimulating(false);
    }
  };

  // Color palette for destinations
  const colors = [
    { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/40' },
    { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/40' },
    { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40' },
    { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/40' },
    { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40' },
  ];

  return (
    <div
      className={`rounded-2xl border transition duration-200 overflow-hidden shadow-xl ${
        link.isActive
          ? 'bg-[#150d26] border-purple-800/60 hover:border-orange-500/50'
          : 'bg-[#120a20]/70 border-purple-900/30 opacity-75'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Card Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  link.isActive ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-500'
                }`}
                title={link.isActive ? 'Link Ativo' : 'Link Pausado'}
              />
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/50">
                {link.type === 'rotator' ? 'Rotador de Links' : 'Link Encurtado'}
              </span>

              {link.type === 'rotator' && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {link.rotationMode === 'round_robin'
                    ? '1 a 1 (50% / 50% Exato)'
                    : link.rotationMode === 'weighted'
                    ? 'Ponderado (%)'
                    : 'Sorteio Aleatório'}
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-white tracking-tight truncate">{link.title}</h3>
            {link.description && (
              <p className="text-xs text-purple-300 line-clamp-1">{link.description}</p>
            )}
          </div>

          {/* Quick Short Link Bar with Clear Copy and Open Buttons */}
          <div className="flex items-center gap-2 bg-[#0c0717] p-2 rounded-xl border border-purple-800/80 shrink-0">
            <div className="px-2.5 py-1 text-xs font-mono font-bold text-orange-400 select-all truncate max-w-[200px]">
              /r/{link.slug}
            </div>

            {/* Clear Button: Copiar Link */}
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                  : 'bg-purple-700 hover:bg-purple-600 text-white shadow-purple-950/50'
              }`}
              title="Copiar URL encurtada"
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

            {/* Clear Button: Abrir */}
            <a
              href={fullShortUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-[#1e1336] hover:bg-purple-800 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition border border-purple-700/60"
              title="Abrir no navegador"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir</span>
            </a>
          </div>
        </div>

        {/* Real-time simulation feedback alert */}
        {lastSimulation && (
          <div className="p-3 bg-gradient-to-r from-purple-900/90 to-orange-950/90 border border-orange-500 rounded-xl text-xs text-white flex items-center justify-between shadow-xl shadow-orange-950/40">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-orange-500 rounded-lg text-white font-bold">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>
                Simulação: Direcionado com sucesso para <strong>{lastSimulation.destinationTitle}</strong>
              </span>
            </div>
            <span className="text-orange-300 font-mono text-[11px] font-bold">
              Total do destino: {lastSimulation.count} cliques
            </span>
          </div>
        )}

        {/* Traffic Distribution Visualizer Bar */}
        {link.type === 'rotator' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                Divisão Real de Tráfego Entregue:
              </span>
              <span className="text-white font-bold bg-purple-900/50 px-2 py-0.5 rounded border border-purple-700/40">
                {totalClicks} acessos totais
              </span>
            </div>

            <div className="w-full h-3.5 bg-[#0b0615] rounded-full overflow-hidden flex border border-purple-900/70 p-0.5">
              {totalClicks === 0 ? (
                <div className="w-full h-full bg-purple-900/40 rounded-full flex items-center justify-center text-[10px] text-purple-300 font-semibold">
                  Aguardando primeiros cliques
                </div>
              ) : (
                link.destinations.map((dest, idx) => {
                  const percent = Math.round((dest.clicks / totalClicks) * 100) || 0;
                  const color = colors[idx % colors.length];
                  if (percent === 0) return null;
                  return (
                    <div
                      key={dest.id}
                      style={{ width: `${percent}%` }}
                      className={`${color.bg} h-full first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                      title={`${dest.title}: ${dest.clicks} cliques (${percent}%)`}
                    />
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Destinations List with clear labels */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
            <span>Destinos Cadastrados ({link.destinations.length}):</span>
            <span className="text-[11px] text-purple-400">
              {link.type === 'rotator' ? 'Rotacionando entre os contatos' : 'Destino único'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {link.destinations.map((dest, idx) => {
              const percent = totalClicks > 0 ? Math.round((dest.clicks / totalClicks) * 100) : 0;
              const color = colors[idx % colors.length];
              const isWhatsApp = dest.url.includes('wa.me') || dest.url.includes('whatsapp.com');

              return (
                <div
                  key={dest.id}
                  className="bg-[#0e0719] p-3 rounded-xl border border-purple-900/50 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${color.bg}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{dest.title}</span>
                          {isWhatsApp && (
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-1 rounded font-mono">
                              WhatsApp
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-purple-400/80 font-mono truncate max-w-[200px]" title={dest.url}>
                          {dest.url}
                        </p>
                      </div>
                    </div>

                    {/* Clear Button: Abrir Destino */}
                    <a
                      href={dest.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-purple-400 hover:text-orange-400 hover:bg-purple-900/40 rounded transition shrink-0"
                      title="Testar URL de destino direta"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-purple-900/30">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300 font-mono">
                        <strong className="text-orange-400 font-bold">{dest.clicks}</strong> cliques
                      </span>
                      <span className="text-purple-400">({percent}%)</span>
                    </div>

                    {link.rotationMode === 'weighted' && (
                      <span className="bg-purple-950 px-2 py-0.5 rounded text-[10px] text-purple-300 border border-purple-800 font-mono font-bold">
                        Peso: {dest.weight}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Footer: Clear, labeled, high-contrast buttons for each function */}
        <div className="pt-3.5 border-t border-purple-900/50 flex flex-wrap items-center justify-between gap-2">
          {/* Function Button 1: Testar Rotação (Simular Clique) */}
          {link.type === 'rotator' ? (
            <button
              onClick={handleSimulate}
              disabled={simulating || !link.isActive}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 hover:from-purple-600 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-purple-950/60 flex items-center gap-2 transition disabled:opacity-40 border border-orange-400/30 cursor-pointer active:scale-95"
              title="Simula 1 clique para ver a alternância entre os contatos imediatamente"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>{simulating ? 'Rotacionando...' : 'Testar Rotação (Simular)'}</span>
            </button>
          ) : (
            <div className="text-xs text-purple-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span>Link simples encurtado</span>
            </div>
          )}

          {/* Group of Distinct, Clear Function Buttons with Explicit Text */}
          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            {/* Function Button 2: QR Code */}
            <button
              onClick={() => onOpenQr(fullShortUrl, link.title)}
              className="px-3 py-1.5 text-purple-200 hover:text-white bg-[#1a1130] hover:bg-[#281b47] border border-purple-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Gerar e Baixar QR Code do Link"
            >
              <QrCode className="w-3.5 h-3.5 text-orange-400" />
              <span>QR Code</span>
            </button>

            {/* Function Button 3: Métricas */}
            <button
              onClick={() => onOpenMetrics(link)}
              className="px-3 py-1.5 text-purple-200 hover:text-white bg-[#1a1130] hover:bg-[#281b47] border border-purple-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Ver Estatísticas Detalhadas de Cliques"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-300" />
              <span>Métricas</span>
            </button>

            {/* Function Button 4: Editar */}
            <button
              onClick={() => onEdit(link)}
              className="px-3 py-1.5 text-purple-200 hover:text-white bg-[#1a1130] hover:bg-[#281b47] border border-purple-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Editar Destinos e Configurações"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Editar</span>
            </button>

            {/* Function Button 5: Pausar / Ativar */}
            <button
              onClick={() => onToggleActive(link.slug, link.isActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm border ${
                link.isActive
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
              title={link.isActive ? 'Pausar o redirecionamento' : 'Reativar o redirecionamento'}
            >
              {link.isActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ativar</span>
                </>
              )}
            </button>

            {/* Function Button 6: Excluir */}
            <button
              onClick={() => onDelete(link.slug)}
              className="px-3 py-1.5 text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Excluir este link permanentemente"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
