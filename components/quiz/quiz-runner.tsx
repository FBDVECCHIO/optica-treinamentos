"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, RotateCcw, Award } from "lucide-react";
import { Quiz, QuizQuestion } from "@/types/database";

interface QuizRunnerProps {
  quiz: Quiz;
  courseTitle: string;
  courseId: string;
  onSubmitAttempt?: (answers: Record<string, string>) => Promise<{
    score: number;
    passed: boolean;
    breakdown: Record<string, { isCorrect: boolean; points: number; feedback?: string }>;
  }>;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quiz,
  courseTitle,
  courseId,
  onSubmitAttempt,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    breakdown: Record<string, { isCorrect: boolean; points: number; feedback?: string }>;
  } | null>(null);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitAttempt) return;

    setSubmitting(true);
    try {
      const res = await onSubmitAttempt(answers);
      setResult(res);
    } catch {
      alert("Houve uma falha na submissão do quiz. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const questions = quiz.questions || [];

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar ao Player do Curso</span>
      </Link>

      {/* Header do Quiz */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Avaliação Oficial de Certificação</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          {quiz.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          Curso: <strong className="text-zinc-200">{courseTitle}</strong> &bull; Nota mínima para aprovação:{" "}
          <strong className="text-emerald-400">{quiz.minScoreToPass}%</strong>
        </p>
      </div>

      {result ? (
        /* Tela de Resultado do Quiz */
        <div className="p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl animate-element">
          <div className="text-center pb-8 border-b border-white/10">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border ${
                result.passed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {result.passed ? <Award className="w-8 h-8" /> : <RotateCcw className="w-8 h-8" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {result.passed ? "Parabéns! Você foi Aprovado!" : "Pontuação Insuficiente"}
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {result.passed
                ? "Sua nota foi computada e seu certificado da Linha Gold Comfort está disponível no painel."
                : "Você não atingiu a nota mínima de 70%. Revise o material didático em PDF e tente novamente."}
            </p>
            <div className="inline-block mt-4 px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-2xl font-black text-white">
              {result.score}%
            </div>
          </div>

          {/* Detalhamento das Respostas */}
          <div className="py-6 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Feedback Detalhado por Questão:
            </h3>
            {questions.map((q, idx) => {
              const item = result.breakdown[q.id];
              return (
                <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-white">
                      Questão {idx + 1}: {q.questionText}
                    </span>
                    {item?.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correta (+{item.points} pts)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Revisão (+{item?.points || 0} pts)
                      </span>
                    )}
                  </div>
                  {item?.feedback && (
                    <p className="text-[11px] text-zinc-400 mt-1 pl-2 border-l-2 border-violet-500/40">
                      {item.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="flex-1 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-all cursor-pointer"
            >
              Refazer Avaliação
            </button>
            <Link
              href={`/courses/${courseId}`}
              className="flex-1 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white text-center transition-all shadow-lg shadow-violet-600/20"
            >
              Retornar ao Curso
            </Link>
          </div>
        </div>
      ) : (
        /* Formulário de Perguntas do Quiz */
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q: QuizQuestion, idx: number) => (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-xl"
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-violet-400">Questão {idx + 1} de {questions.length}</span>
                <span className="text-zinc-500 font-mono">{q.points} Pontos &bull; {q.type === "multiple_choice" ? "Múltipla Escolha" : "Dissertativa"}</span>
              </div>

              <h3 className="text-sm sm:text-base font-medium text-white leading-relaxed mb-4">
                {q.questionText}
              </h3>

              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-2.5">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-center gap-3 cursor-pointer ${
                          selected
                            ? "bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-600/10"
                            : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            selected ? "bg-violet-600 text-white" : "border border-zinc-600 text-zinc-400"
                          }`}
                        >
                          {opt.id}
                        </div>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "dissertative" && (
                <div>
                  <textarea
                    rows={4}
                    required
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Escreva sua resposta detalhada abordando os argumentos técnicos e benefícios para o cliente..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    Dica: Inclua palavras-chave técnicas como adaptação, campos de visão, conforto e tecnologia digital.
                  </p>
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all shadow-xl shadow-violet-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Enviar Respostas e Obter Pontuação</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
