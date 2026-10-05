"use client";

import { useState } from "react";
import { HelpCircle, CheckCircle2, Award, Clock, ArrowRight, Shield } from "lucide-react";
import { db } from "@/lib/db/mock-store";

export default function AdminQuizzesPage() {
  const [quizzes] = useState(db.quizzes);
  const [attempts] = useState(db.quizAttempts);
  const [selectedQuiz, setSelectedQuiz] = useState(quizzes[0]?.id || "");

  const activeQuiz = quizzes.find((q) => q.id === selectedQuiz) || quizzes[0];
  const activeCourse = db.courses.find((c) => c.id === activeQuiz?.courseId);

  return (
    <div className="space-y-8 animate-element">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Configurações &raquo; Quizzes e Avaliações</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Gestão de Quizzes, Gabaritos e Moderação
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Cruzamento automático de respostas de fixação, gabaritos de múltipla escolha e critérios semânticos para dissertativas.
        </p>
      </div>

      {/* Seletor de Quiz */}
      <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
        {quizzes.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setSelectedQuiz(q.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedQuiz === q.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {q.title}
          </button>
        ))}
      </div>

      {/* Detalhes do Quiz Ativo */}
      {activeQuiz && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono">Curso Vinculado:</span>
              <h3 className="text-base font-semibold text-white">{activeCourse?.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Nota Mínima de Aprovação: <strong className="text-emerald-400">{activeQuiz.minScoreToPass}%</strong> &bull; Total de Questões: {activeQuiz.questions?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-xs text-violet-300 text-center">
              <span className="block text-[10px] text-zinc-400 uppercase">Aprovações</span>
              <span className="text-lg font-bold text-white">{attempts.filter((a) => a.passed).length} Certificados</span>
            </div>
          </div>

          {/* Lista de Questões e Gabaritos Protegidos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Banco de Questões e Gabarito Técnico</h3>

            {activeQuiz.questions?.map((q, idx) => (
              <div
                key={q.id}
                className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-violet-400">Questão {idx + 1} &bull; {q.type === "multiple_choice" ? "Múltipla Escolha" : "Dissertativa"}</span>
                  <span className="text-zinc-500 font-mono">{q.points} Pontos</span>
                </div>

                <p className="text-sm text-white font-medium">{q.questionText}</p>

                {q.type === "multiple_choice" && q.options && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {q.options.map((opt) => {
                      const isCorrect = opt.id === q.correctAnswer;
                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-white/5 border-white/5 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">({opt.id})</span>
                            <span>{opt.text}</span>
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Gabarito Oficial
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "dissertative" && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Palavras-chave esperadas na avaliação semântica inteligente:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {q.rubricKeywords?.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 rounded-xl bg-violet-600/10 border border-violet-500/30 text-violet-300 text-[11px]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
