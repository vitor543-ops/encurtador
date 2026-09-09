import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e0836',
          light: '#ffffff',
        },
      })
        .then((res) => setDataUrl(res))
        .catch((err) => console.error('Erro ao gerar QR Code:', err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `rotalink-${title.toLowerCase().replace(/\s+/g, '-')}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#181126] border border-purple-800/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-950/50">
          <QrIcon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-purple-300 mb-5">
          Escaneie para testar o redirecionador automático no celular
        </p>

        <div className="bg-white p-4 rounded-xl inline-block shadow-xl border-4 border-orange-500/80 mb-4">
          {dataUrl ? (
            <img src={dataUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-lg" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-purple-950 text-xs">
              Gerando QR Code...
            </div>
          )}
        </div>

        <div className="bg-[#0e0919] p-2.5 rounded-lg border border-purple-800/50 flex items-center justify-between text-xs mb-5">
          <span className="text-orange-400 font-mono truncate mr-2">{url}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-purple-300 hover:text-white bg-purple-900/40 px-2.5 py-1 rounded transition shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-900/60 hover:bg-purple-800/70 border border-purple-700/60 text-xs font-semibold text-white transition"
          >
            <Download className="w-4 h-4 text-purple-300" />
            Baixar PNG
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-semibold text-white shadow-lg shadow-orange-950/40 transition"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Link
          </a>
        </div>
      </div>
    </div>
  );
};
