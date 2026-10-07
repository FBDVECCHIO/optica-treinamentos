"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, ShieldCheck, Printer, Download, Eye, Sparkles, X } from "lucide-react";

export interface CertificateTemplateMeta {
  id: string;
  name: string;
  theme: string;
  accentColor: string;
  borderColor: string;
  badgeText: string;
}

export const CERTIFICATE_TEMPLATES: CertificateTemplateMeta[] = [
  {
    id: "1",
    name: "Esmeralda Clássico SRL",
    theme: "from-emerald-950 via-zinc-950 to-emerald-950",
    accentColor: "text-amber-400",
    borderColor: "border-amber-400/70",
    badgeText: "SELO DE HONRA CORPORATIVA",
  },
  {
    id: "2",
    name: "Ouro Supremo Prestige",
    theme: "from-amber-950/90 via-zinc-950 to-amber-950/80",
    accentColor: "text-amber-300",
    borderColor: "border-amber-300/80",
    badgeText: "CERTIFICAÇÃO DE EXCELÊNCIA",
  },
  {
    id: "3",
    name: "Safira Tech Óptica IA",
    theme: "from-blue-950 via-slate-950 to-indigo-950",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/70",
    badgeText: "HOMOLOGAÇÃO DIGITAL 2026",
  },
  {
    id: "4",
    name: "Modern Dark Glass",
    theme: "from-zinc-900 via-zinc-950 to-violet-950/60",
    accentColor: "text-violet-400",
    borderColor: "border-violet-500/60",
    badgeText: "PADRÃO TECNOLÓGICO ÓPTICO",
  },
  {
    id: "5",
    name: "Clean Minimalista Luxo",
    theme: "from-slate-900 via-zinc-900 to-stone-900",
    accentColor: "text-rose-400",
    borderColor: "border-zinc-300/60",
    badgeText: "CHANCELARIA INSTITUCIONAL",
  },
];

export interface CertificateRendererProps {
  templateId?: string;
  courseTitle: string;
  studentName?: string;
  completionDate?: string;
  location?: string;
  customLogoUrl?: string;
  customBgUrl?: string;
  score?: number;
  durationHours?: number;
  verificationCode?: string;
  isMiniature?: boolean;
  allowOpenFull?: boolean;
}

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  templateId = "1",
  courseTitle,
  studentName = "COLABORADOR CONCLUINTE",
  completionDate,
  location = "São Paulo - SP",
  customLogoUrl,
  customBgUrl,
  score = 100,
  durationHours = 2,
  verificationCode = "SRL-CERT-2026",
  isMiniature = false,
  allowOpenFull = true,
}) => {
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);

  const selectedTemplate =
    CERTIFICATE_TEMPLATES.find((t) => t.id === templateId) || CERTIFICATE_TEMPLATES[0];

  const formattedDate =
    completionDate ||
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const handlePrint = () => {
    window.print();
  };

  // Renderização do Corpo do Certificado
  const CertificateBody = ({ miniature }: { miniature: boolean }) => (
    <div
      className={`relative overflow-hidden transition-all duration-300 flex flex-col justify-between text-center select-none ${
        miniature
          ? "w-full aspect-[16/10] p-3 rounded-2xl text-[8px]"
          : "w-full max-w-4xl aspect-[16/10] p-8 md:p-12 rounded-3xl text-sm shadow-2xl"
      } bg-gradient-to-br ${selectedTemplate.theme} border-4 ${selectedTemplate.borderColor}`}
      style={
        customBgUrl
          ? {
              backgroundImage: `url(${customBgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Moldura de Fundo / Bordas Geométricas Clássicas */}
      <div className="absolute inset-1.5 md:inset-3 border border-white/15 pointer-events-none rounded-xl" />
      <div className="absolute inset-2.5 md:inset-5 border border-dashed border-white/10 pointer-events-none rounded-lg" />

      {/* Marca d'água holográfica de fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Award className={miniature ? "w-24 h-24" : "w-72 h-72"} />
      </div>

      {/* Top Header: Logo & Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 md:gap-3">
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt="Logo Corporativo"
              className={miniature ? "h-4 object-contain" : "h-10 md:h-12 object-contain"}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-lg bg-white/10 border border-white/20">
                <Award className={`${miniature ? "w-3 h-3" : "w-6 h-6"} ${selectedTemplate.accentColor}`} />
              </div>
              <span className={`font-black tracking-wider uppercase ${miniature ? "text-[8px]" : "text-sm md:text-base"} text-white`}>
                SRL Ópticas
              </span>
            </div>
          )}
        </div>

        <div
          className={`px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 uppercase tracking-widest font-bold ${
            miniature ? "text-[6px]" : "text-[10px]"
          } ${selectedTemplate.accentColor}`}
        >
          {selectedTemplate.badgeText}
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-10 my-auto space-y-1 md:space-y-3">
        <h2
          className={`font-serif uppercase tracking-widest font-bold text-white/90 ${
            miniature ? "text-[9px]" : "text-lg md:text-2xl"
          }`}
        >
          Certificado de Capacitação
        </h2>

        <p className={`text-zinc-300 font-light ${miniature ? "text-[7px]" : "text-xs md:text-sm"}`}>
          Certificamos com honras e conformidade técnica oficial que
        </p>

        <h3
          className={`font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-100 uppercase ${
            miniature ? "text-[11px]" : "text-xl md:text-3xl"
          }`}
        >
          {studentName}
        </h3>

        <p className={`text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed ${miniature ? "text-[6px] line-clamp-1" : "text-xs md:text-sm"}`}>
          concluiu com êxito todas as etapas teórico-práticas do treinamento oficial
        </p>

        <div
          className={`inline-block font-bold px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-white ${
            miniature ? "text-[7px] max-w-[90%] truncate" : "text-sm md:text-lg"
          }`}
        >
          {courseTitle}
        </div>
      </div>

      {/* Rodapé: Local, Data, Selo e Assinaturas */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-end justify-between text-left">
        {/* Assinatura 1 */}
        <div className="space-y-0.5">
          <div className={`border-b border-white/30 ${miniature ? "w-14" : "w-36 md:w-44"}`} />
          <p className={`font-bold text-white uppercase ${miniature ? "text-[5px]" : "text-[10px] md:text-xs"}`}>
            Diretoria de Treinamentos
          </p>
          <p className={`text-zinc-400 ${miniature ? "text-[4px]" : "text-[9px]"}`}>
            {location}
          </p>
        </div>

        {/* Selo Central */}
        <div className="text-center px-1">
          <div
            className={`mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 text-zinc-950 font-black flex items-center justify-center shadow-lg ${
              miniature ? "w-5 h-5 text-[6px]" : "w-12 h-12 text-sm"
            }`}
          >
            ★
          </div>
          <span className={`block font-mono text-zinc-400 mt-0.5 ${miniature ? "text-[5px]" : "text-[9px]"}`}>
            {formattedDate}
          </span>
        </div>

        {/* Assinatura 2 & Código de Verificação */}
        <div className="space-y-0.5 text-right">
          <div className={`border-b border-white/30 ml-auto ${miniature ? "w-14" : "w-36 md:w-44"}`} />
          <p className={`font-bold text-white uppercase ${miniature ? "text-[5px]" : "text-[10px] md:text-xs"}`}>
            Chancela Técnica SRL
          </p>
          <p className={`text-zinc-400 font-mono ${miniature ? "text-[4px]" : "text-[8px]"}`}>
            {verificationCode} &bull; {score}%
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Visualização Padrão / Miniatura */}
      <div className="relative group">
        <CertificateBody miniature={isMiniature} />

        {/* Overlay com botão de visualização em tela cheia se for miniatura e allowOpenFull for true */}
        {isMiniature && allowOpenFull && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setIsFullModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[10px] flex items-center gap-1 shadow-lg cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Ver Certificado</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Certificado em Alta Resolução / Impressão */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-element">
          <div className="relative w-full max-w-5xl flex flex-col items-center">
            {/* Barra de Ações Superior */}
            <div className="w-full flex items-center justify-between pb-4 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm">Visualizador Oficial de Certificado</span>
                <span className="text-xs text-zinc-400 font-mono">({selectedTemplate.name})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Gerar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Renderizador do Certificado em Alta Fidelidade */}
            <CertificateBody miniature={false} />
          </div>
        </div>
      )}
    </>
  );
};
