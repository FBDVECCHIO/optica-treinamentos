"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, RotateCcw } from "lucide-react";

interface UniversalVideoPlayerProps {
  title: string;
  provider: "youtube" | "vimeo" | "panda" | "bunny" | "direct_mp4";
  videoUrl: string;
  isCompleted?: boolean;
  onMarkCompleted?: () => void;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  title,
  provider,
  videoUrl,
  isCompleted = false,
  onMarkCompleted,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper para extrair ID do YouTube se aplicável
  const getEmbedUrl = (url: string) => {
    if (provider === "youtube" || url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("v=")) {
        videoId = url.split("v=")[1]?.split("&")[0] || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (url.includes("embed/")) {
        return url;
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
    }
    if (provider === "vimeo" || url.includes("vimeo.com")) {
      const vimeoId = url.split("/").filter(Boolean).pop();
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Container do Player em proporção 16:9 */}
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
        {!isPlaying ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-tr from-zinc-950 via-zinc-900 to-violet-950/40">
            {/* Overlay com título e botão de play */}
            <div className="text-center p-6 z-10">
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center mx-auto mb-4 transition-all transform group-hover:scale-110 shadow-xl shadow-violet-600/40 cursor-pointer"
                aria-label="Iniciar Reprodução"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
              <h3 className="text-base sm:text-lg font-semibold text-white max-w-lg mx-auto">
                {title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Clique para reproduzir esta aula em alta definição
              </p>
            </div>
          </div>
        ) : provider === "direct_mp4" ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
            onEnded={() => onMarkCompleted?.()}
          />
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>

      {/* Barra de Ações da Aula */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ao concluir o vídeo, confirme a lição para registrar na sua timeline de evolução.
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkCompleted}
          className={`px-5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
            isCompleted
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
              : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25"
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aula Concluída</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Marcar como Concluída</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
