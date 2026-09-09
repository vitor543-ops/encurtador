import React, { useState, useEffect } from 'react';
import { RotaLinkItem, RotationMode, User } from '../types';
import { WhatsAppHelperModal } from './WhatsAppHelperModal';
import {
  X,
  Plus,
  Trash2,
  Shuffle,
  RefreshCw,
  Percent,
  MessageSquare,
  Link as LinkIcon,
  Sparkles,
  HelpCircle,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editLink?: RotaLinkItem | null;
  baseUrl: string;
  currentUser?: User | null;
  initialType?: 'rotator' | 'single';
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editLink,
  baseUrl,
  currentUser,
  initialType = 'rotator',
}) => {
  const [type, setType] = useState<'rotator' | 'single'>('rotator');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [rotationMode, setRotationMode] = useState<RotationMode>('round_robin');
  const [destinations, setDestinations] = useState<
    Array<{ id?: string; title: string; url: string; weight: number }>
  >([
    { title: 'WhatsApp Atendente 1', url: '', weight: 50 },
    { title: 'WhatsApp Atendente 2', url: '', weight: 50 },
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [targetDestIndex, setTargetDestIndex] = useState<number | null>(null);

  useEffect(() => {
    if (editLink) {
      setType(editLink.type);
      setTitle(editLink.title);
      setSlug(editLink.slug);
      setRotationMode(editLink.rotationMode);
      setDestinations(
        editLink.destinations.map((d) => ({
          id: d.id,
          title: d.title,
          url: d.url,
          weight: d.weight,
        }))
      );
    } else {
      setType(initialType);
      setTitle('');
      setSlug('');
      setRotationMode('round_robin');
      if (initialType === 'single') {
        setDestinations([{ title: 'Destino', url: '', weight: 100 }]);
      } else {
        setDestinations([
          { title: 'WhatsApp 1 (ex: Você)', url: '', weight: 50 },
          { title: 'WhatsApp 2 (ex: Parceiro/Atendente)', url: '', weight: 50 },
        ]);
      }
    }
    setError('');
  }, [editLink, isOpen, initialType]);

  if (!isOpen) return null;

  // Add new destination row
  const addDestination = () => {
    const newCount = destinations.length + 1;
    const equalWeight = Math.floor(100 / newCount);
    const updated = destinations.map((d) => ({ ...d, weight: equalWeight }));
    updated.push({
      title: `Destino ${newCount}`,
      url: '',
      weight: 100 - equalWeight * (newCount - 1),
    });
    setDestinations(updated);
  };

  // Remove destination
  const removeDestination = (index: number) => {
    if (destinations.length <= 1) return;
    const filtered = destinations.filter((_, i) => i !== index);
    const equalWeight = Math.floor(100 / filtered.length);
    const adjusted = filtered.map((d, i) => ({
      ...d,
      weight: i === filtered.length - 1 ? 100 - equalWeight * (filtered.length - 1) : equalWeight,
    }));
    setDestinations(adjusted);
  };

  // Split weights equally
  const splitEqually = () => {
    const count = destinations.length;
    if (count === 0) return;
    const baseWeight = Math.floor(100 / count);
    const remainder = 100 % count;
    setDestinations(
      destinations.map((d, i) => ({
        ...d,
        weight: i === 0 ? baseWeight + remainder : baseWeight,
      }))
    );
  };

  const handleDestinationChange = (
    index: number,
    field: 'title' | 'url' | 'weight',
    value: any
  ) => {
    const updated = [...destinations];
    updated[index] = { ...updated[index], [field]: value };
    setDestinations(updated);
  };

  const handleOpenWhatsAppHelper = (index: number) => {
    setTargetDestIndex(index);
    setWhatsAppModalOpen(true);
  };

  const handleApplyWhatsAppUrl = (url: string, suggestedTitle: string) => {
    if (targetDestIndex !== null && targetDestIndex < destinations.length) {
      const updated = [...destinations];
      updated[targetDestIndex].url = url;
      if (suggestedTitle) {
        updated[targetDestIndex].title = suggestedTitle;
      }
      setDestinations(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Por favor, informe o título do link.');
      return;
    }

    // Validate destinations
    const activeList = type === 'single' ? [destinations[0]] : destinations;
    for (let i = 0; i < activeList.length; i++) {
      const d = activeList[i];
      if (!d.url.trim()) {
        setError(`O link do destino ${i + 1} (${d.title || 'Sem nome'}) está vazio.`);
        return;
      }
    }

    if (type === 'rotator' && activeList.length < 2) {
      setError('Um rotador de links precisa de pelo menos 2 links de destino.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        type,
        rotationMode,
        destinations: activeList,
        userId: currentUser?.id || undefined,
        userEmail: currentUser?.email || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar link.');
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = destinations.reduce((sum, d) => sum + (Number(d.weight) || 0), 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
        <div className="bg-[#181126] border border-purple-800/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-white max-h-[92vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-5 pb-4 border-b border-purple-900/40 shrink-0">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500">
                <LinkIcon className="w-5 h-5 text-white" />
              </span>
              {editLink ? 'Editar Link' : 'Criar Novo Link ou Rotador'}
            </h3>
            <p className="text-xs text-purple-300 mt-1">
              Configure seu link encurtado ou rotador com divisão de tráfego entre múltiplos WhatsApps
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-600/50 rounded-xl text-xs text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 pr-1 custom-scrollbar">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-2">Tipo de Link</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('rotator')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    type === 'rotator'
                      ? 'bg-purple-900/40 border-orange-500 ring-1 ring-orange-500 shadow-lg shadow-purple-950/50'
                      : 'bg-[#0e0919] border-purple-900/50 text-purple-300 hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-orange-400" />
                      Rotador de Links
                    </span>
                    {type === 'rotator' && (
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <span className="text-xs text-purple-300">
                    Alterna entre 2 ou mais links (ex: 50% para um WhatsApp e 50% para outro)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('single')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    type === 'single'
                      ? 'bg-purple-900/40 border-orange-500 ring-1 ring-orange-500 shadow-lg shadow-purple-950/50'
                      : 'bg-[#0e0919] border-purple-900/50 text-purple-300 hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-purple-400" />
                      Encurtador Simples
                    </span>
                    {type === 'single' && (
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <span className="text-xs text-purple-300">
                    Encurta apenas um único endereço de destino com métricas
                  </span>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Título do Link / Campanha *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Plantão WhatsApp Equipe de Vendas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#0e0919] border border-purple-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Slug Personalizado (Opcional)
                </label>
                <div className="flex items-center bg-[#0e0919] border border-purple-800/60 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500 transition">
                  <span className="text-purple-400 text-xs font-mono select-none mr-1">
                    /r/
                  </span>
                  <input
                    type="text"
                    placeholder="ex: zap-plantao"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                    className="w-full bg-transparent text-white placeholder-purple-400/40 focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rotation Strategy (only for rotators) */}
            {type === 'rotator' && (
              <div className="bg-[#0e0919] p-4 rounded-xl border border-purple-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Modo de Rotação
                  </label>
                  <span className="text-[11px] text-orange-400 font-medium">
                    {rotationMode === 'round_robin' && '50% / 50% sequencial exato (1 para cada)'}
                    {rotationMode === 'weighted' && 'Defina pesos percentuais'}
                    {rotationMode === 'random' && 'Sorteio aleatório a cada clique'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRotationMode('round_robin')}
                    className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition ${
                      rotationMode === 'round_robin'
                        ? 'bg-gradient-to-r from-purple-700 to-orange-600 text-white border-transparent shadow'
                        : 'bg-[#181126] border-purple-800/40 text-purple-300 hover:border-purple-700'
                    }`}
                  >
                    1 para cada (50/50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotationMode('weighted')}
                    className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition ${
                      rotationMode === 'weighted'
                        ? 'bg-gradient-to-r from-purple-700 to-orange-600 text-white border-transparent shadow'
                        : 'bg-[#181126] border-purple-800/40 text-purple-300 hover:border-purple-700'
                    }`}
                  >
                    Ponderado (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotationMode('random')}
                    className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition ${
                      rotationMode === 'random'
                        ? 'bg-gradient-to-r from-purple-700 to-orange-600 text-white border-transparent shadow'
                        : 'bg-[#181126] border-purple-800/40 text-purple-300 hover:border-purple-700'
                    }`}
                  >
                    Aleatório
                  </button>
                </div>

                {rotationMode === 'weighted' && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-purple-300">
                      Soma dos pesos: <strong className={totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}>{totalWeight}%</strong>
                    </span>
                    <button
                      type="button"
                      onClick={splitEqually}
                      className="text-xs font-bold text-orange-400 hover:text-white bg-purple-900/60 hover:bg-purple-800 px-3 py-1.5 rounded-lg border border-purple-700 transition cursor-pointer"
                    >
                      Dividir Igualmente ({Math.floor(100 / destinations.length)}% cada)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Destinations list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  {type === 'rotator' ? `Links de Destino da Rotação (${destinations.length})` : 'Link de Destino'}
                </label>
                {type === 'rotator' && (
                  <button
                    type="button"
                    onClick={addDestination}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3.5 py-1.5 rounded-xl transition shadow-md shadow-orange-950/40 border border-orange-400/40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Outro Link
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {(type === 'single' ? [destinations[0]] : destinations).map((dest, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#0e0919] border border-purple-800/50 rounded-xl space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-md bg-purple-900/70 text-orange-400 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Nome identificador (ex: WhatsApp Júlia)"
                          value={dest.title}
                          onChange={(e) => handleDestinationChange(idx, 'title', e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold text-white placeholder-purple-400/40 focus:outline-none border-b border-transparent focus:border-purple-600"
                        />
                      </div>

                      {type === 'rotator' && rotationMode === 'weighted' && (
                        <div className="flex items-center gap-1 shrink-0 bg-purple-950 px-2 py-1 rounded-lg border border-purple-800">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={dest.weight}
                            onChange={(e) =>
                              handleDestinationChange(idx, 'weight', parseInt(e.target.value) || 0)
                            }
                            className="w-10 bg-transparent text-right text-xs font-bold text-orange-400 focus:outline-none"
                          />
                          <span className="text-xs text-purple-300 font-bold">%</span>
                        </div>
                      )}

                      {type === 'rotator' && destinations.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeDestination(idx)}
                          className="text-purple-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/40 transition cursor-pointer"
                          title="Remover destino"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://wa.me/5511... ou https://seusite.com"
                        value={dest.url}
                        onChange={(e) => handleDestinationChange(idx, 'url', e.target.value)}
                        required
                        className="flex-1 bg-[#181126] border border-purple-800/60 rounded-lg px-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 font-mono transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsAppHelper(idx)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 hover:text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer shadow-sm"
                        title="Gerar link de WhatsApp automaticamente"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+ WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview of Short Link */}
            <div className="p-3.5 bg-purple-950/40 rounded-xl border border-purple-800/40 flex items-center justify-between text-xs">
              <span className="text-purple-300 font-medium">URL curta final:</span>
              <span className="text-orange-400 font-mono font-bold">
                {baseUrl}/r/{slug || 'codigo'}
              </span>
            </div>

            {/* Actions: Clear, high contrast buttons */}
            <div className="pt-3 border-t border-purple-900/40 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-purple-300 hover:text-white rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/80 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-xl shadow-orange-950/60 border border-orange-400/40 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Salvando...' : editLink ? 'Salvar Alterações' : 'Salvar e Ativar Link'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <WhatsAppHelperModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        onApply={handleApplyWhatsAppUrl}
      />
    </>
  );
};
