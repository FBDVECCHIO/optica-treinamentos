"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, PlayCircle, HelpCircle, Clock, ChevronDown } from "lucide-react";
import { Module, Lesson } from "@/types/database";

interface CourseTimelineProps {
  courseId: string;
  modules: Module[];
  activeLessonId?: string;
  completedLessonIds: string[];
  quizAvailable?: boolean;
  quizScore?: number | null;
  onSelectLesson?: (lesson: Lesson) => void;
}

export const CourseTimeline: React.FC<CourseTimelineProps> = ({
  courseId,
  modules,
  activeLessonId,
  completedLessonIds,
  quizAvailable = true,
  quizScore,
  onSelectLesson,
}) => {
  // Contagem de progresso
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="w-full bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
      {/* Header do Progresso Geral */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-white tracking-wide uppercase">Linha do Tempo de Evolução</span>
          <span className="font-bold text-violet-400">{progressPercent}% Concluído</span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-emerald-400 rounded-full transition-all duration-500 shadow-lg shadow-violet-500/20"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
          <span>{completedCount} de {totalLessons} aulas concluídas</span>
          <span>{progressPercent === 100 ? "Pronto para o Quiz!" : "Em andamento"}</span>
        </p>
      </div>

      {/* Árvore de Módulos e Lições estilo Timeline */}
      <div className="space-y-6">
        {modules.map((mod, modIdx) => (
          <div key={mod.id} className="relative pl-6 border-l-2 border-zinc-800">
            {/* Marcador do Módulo */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-violet-600 border-2 border-zinc-950 flex items-center justify-center text-[9px] font-bold text-white">
              {modIdx + 1}
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
                <span>{mod.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </h4>
              {mod.description && (
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{mod.description}</p>
              )}
            </div>

            {/* Lista de Aulas do Módulo */}
            <div className="space-y-2 mt-2">
              {mod.lessons?.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                const isCompleted = completedLessonIds.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson?.(lesson)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? "bg-violet-600/20 border border-violet-500/40 text-white shadow-md shadow-violet-600/10"
                        : "bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300"
                    }`}
                  >
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-violet-400 animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{lesson.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{Math.round(lesson.durationSeconds / 60)} min</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Nó Final da Timeline: Quiz de Fixação e Certificação */}
        {quizAvailable && (
          <div className="relative pl-6 border-l-2 border-emerald-500/40 pt-2">
            <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-white">
              <HelpCircle className="w-2.5 h-2.5" />
            </div>

            <Link
              href={`/courses/${courseId}/quiz`}
              className="block p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Etapa Final de Fixação
                  </span>
                  <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                    Quiz de Certificação Comercial
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Questões de múltipla escolha e dissertativas para validar seu aprendizado.
                  </p>
                </div>
                {quizScore !== undefined && quizScore !== null && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Sua Nota</span>
                    <span className="text-sm font-bold text-emerald-400">{quizScore}%</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
