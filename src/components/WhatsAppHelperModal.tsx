import React, { useState } from 'react';
import { MessageSquare, Check, X, Phone, Send } from 'lucide-react';

interface WhatsAppHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (url: string, suggestedTitle: string) => void;
}

export const WhatsAppHelperModal: React.FC<WhatsAppHelperModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [countryCode, setCountryCode] = useState('55');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [attendantName, setAttendantName] = useState('');
  const [customMessage, setCustomMessage] = useState('Olá! Gostaria de mais informações sobre o produto.');

  if (!isOpen) return null;

  // Clean phone string
  const cleanPhone = (countryCode + phoneNumber).replace(/\D/g, '');
  const generatedUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}${customMessage ? `?text=${encodeURIComponent(customMessage)}` : ''}`
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanPhone) return;
    const title = attendantName.trim() ? `WhatsApp ${attendantName.trim()}` : `WhatsApp ${phoneNumber}`;
    onApply(generatedUrl, title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#181126] border border-purple-800/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Gerador de Link WhatsApp
              <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-medium">
                Prático
              </span>
            </h3>
            <p className="text-xs text-purple-300">Gera um link wa.me direto para o atendente com mensagem pronta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">
              Nome do Atendente / Destinatário (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Júlia (Vendas) ou Marcos (Suporte)"
              value={attendantName}
              onChange={(e) => setAttendantName(e.target.value)}
              className="w-full bg-[#0e0919] border border-purple-800/60 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">DDI País</label>
              <div className="flex items-center bg-[#0e0919] border border-purple-800/60 rounded-lg px-3 py-2.5 text-sm">
                <span className="text-purple-400 mr-1">+</span>
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="55"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-purple-200 mb-1">DDD + Número de WhatsApp</label>
              <div className="flex items-center bg-[#0e0919] border border-purple-800/60 rounded-lg px-3.5 py-2.5 text-sm focus-within:border-orange-500 transition">
                <Phone className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="11 99999-8888"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full bg-transparent text-white placeholder-purple-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">Mensagem Inicial Pré-preenchida</label>
            <textarea
              rows={2}
              placeholder="Mensagem que o cliente enviará ao abrir a conversa..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-[#0e0919] border border-purple-800/60 rounded-lg px-3.5 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          {generatedUrl && (
            <div className="p-3 bg-purple-950/60 border border-purple-700/50 rounded-xl text-xs space-y-1">
              <span className="text-purple-300 font-medium block">Link gerado automaticamente:</span>
              <span className="text-orange-300 font-mono break-all select-all block bg-black/40 p-2 rounded border border-purple-900/50">
                {generatedUrl}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-purple-300 hover:text-white hover:bg-purple-900/30 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!phoneNumber.trim()}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs rounded-lg shadow-lg shadow-orange-950/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              Inserir no Destino
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
