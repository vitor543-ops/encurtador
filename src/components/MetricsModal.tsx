import React, { useState } from 'react';
import { RotaLinkItem } from '../types';
import { X, BarChart3, RotateCcw, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface MetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: RotaLinkItem;
  onResetStats: (slug: string) => Promise<void>;
}

export const MetricsModal: React.FC<MetricsModalProps> = ({
  isOpen,
  onClose,
  link,
  onResetStats,
}) => {
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    try {
      setResetting(true);
      await onResetStats(link.slug);
      setConfirmReset(false);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const totalClicks = link.totalClicks || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#181126] border border-purple-800/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-purple-900/40 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{link.title}</h3>
            <p className="text-xs text-purple-300 font-mono">/r/{link.slug}</p>
          </div>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0e0919] p-4 rounded-xl border border-purple-800/40">
              <span className="text-xs font-semibold text-purple-400 block mb-1">Total de Cliques</span>
              <span className="text-2xl font-black text-orange-400">{totalClicks}</span>
            </div>
            <div className="bg-[#0e0919] p-4 rounded-xl border border-purple-800/40">
              <span className="text-xs font-semibold text-purple-400 block mb-1">Modo de Rotação</span>
              <span className="text-sm font-bold text-purple-200 capitalize">
                {link.rotationMode === 'round_robin'
                  ? 'Sequencial (50/50)'
                  : link.rotationMode === 'weighted'
                  ? 'Ponderado (%)'
                  : 'Aleatório'}
              </span>
            </div>
            <div className="bg-[#0e0919] p-4 rounded-xl border border-purple-800/40">
              <span className="text-xs font-semibold text-purple-400 block mb-1">Destinos Ativos</span>
              <span className="text-2xl font-black text-purple-200">
                {link.destinations.filter((d) => d.isActive).length} / {link.destinations.length}
              </span>
            </div>
          </div>

          {/* Destination Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-2">
              Distribuição por Destino
            </h4>
            <div className="space-y-3">
              {link.destinations.map((dest, idx) => {
                const percent = totalClicks > 0 ? Math.round((dest.clicks / totalClicks) * 100) : 0;
                const isPurple = idx % 2 === 0;

                return (
                  <div
                    key={dest.id}
                    className="p-3.5 bg-[#0e0919] rounded-xl border border-purple-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[65%]">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isPurple ? 'bg-purple-500' : 'bg-orange-500'
                          }`}
                        />
                        <span className="font-semibold text-white truncate">{dest.title}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-purple-300">
                          <strong className="text-white">{dest.clicks}</strong> cliques ({percent}%)
                        </span>
                        {link.rotationMode === 'weighted' && (
                          <span className="bg-purple-900/60 text-orange-300 text-[11px] px-2 py-0.5 rounded font-mono">
                            Meta: {dest.weight}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-purple-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPurple ? 'bg-purple-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-purple-400/80 pt-1">
                      <span className="font-mono truncate max-w-[80%]">{dest.url}</span>
                      {dest.lastClickedAt && (
                        <span className="shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {new Date(dest.lastClickedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Clicks Log */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-2">
              Histórico Recente de Acessos
            </h4>
            {link.recentClicks && link.recentClicks.length > 0 ? (
              <div className="bg-[#0e0919] rounded-xl border border-purple-800/40 divide-y divide-purple-900/30 max-h-48 overflow-y-auto">
                {link.recentClicks.map((log) => (
                  <div key={log.id} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white font-medium truncate">{log.destinationTitle}</span>
                    </div>
                    <span className="text-[11px] text-purple-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleString([], {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0e0919] p-6 rounded-xl border border-purple-800/40 text-center text-xs text-purple-400">
                Nenhum clique registrado ainda. Use o botão de teste para simular o redirecionamento.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-purple-900/40 flex items-center justify-between shrink-0">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300 font-medium">Zerar todas as contagens?</span>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition"
              >
                {resetting ? 'Zerando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-purple-300 hover:text-white text-xs"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-rose-400 py-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Zerar Estatísticas
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-900/60 hover:bg-purple-800/80 text-white text-xs font-semibold rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
