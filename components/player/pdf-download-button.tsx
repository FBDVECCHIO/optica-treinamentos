"use client";

import React, { useState } from "react";
import { FileText, Download, Check } from "lucide-react";

interface PdfDownloadButtonProps {
  pdfUrl?: string;
  pdfTitle?: string;
  fileSize?: string;
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  pdfUrl = "/TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf",
  pdfTitle = "Apostila Técnica & Comercial (PDF)",
  fileSize = "1.8 MB",
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Simula disparo e restaura estado
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  return (
    <a
      href={pdfUrl}
      download
      onClick={handleDownload}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-violet-500/30 transition-all text-xs font-medium text-white group shadow-lg cursor-pointer"
    >
      <div className="p-2 rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
        <FileText className="w-4 h-4" />
      </div>
      <div className="text-left">
        <div className="font-semibold text-zinc-100 group-hover:text-white flex items-center gap-1.5">
          <span>{pdfTitle}</span>
          <span className="text-[10px] text-zinc-500 font-normal">({fileSize})</span>
        </div>
        <div className="text-[11px] text-zinc-400">Clique para baixar o material de apoio oficial</div>
      </div>
      <div className="ml-auto pl-2 text-zinc-400 group-hover:text-violet-400">
        {downloading ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
      </div>
    </a>
  );
};
