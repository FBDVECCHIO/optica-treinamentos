"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getCourseQuiz, submitQuizAttemptAction } from "@/app/actions/quiz";
import { db } from "@/lib/db/mock-store";
import { Quiz } from "@/types/database";

export default function CourseQuizRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [courseTitle, setCourseTitle] = useState("Treinamento Óptico");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      const q = await getCourseQuiz(courseId);
      const c = db.courses.find((course) => course.id === courseId);
      if (c) setCourseTitle(c.title);
      setQuiz(q);
      setLoading(false);
    }
    loadQuiz();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 text-sm">
        Carregando perguntas da avaliação...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-8 text-center text-zinc-400 max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-white mb-2">Quiz não disponível</h2>
        <p className="text-xs text-zinc-400 mb-4">
          Ainda não foram cadastradas perguntas de fixação para este treinamento.
        </p>
        <Link
          href={`/courses/${courseId}`}
          className="text-xs text-violet-400 hover:underline"
        >
          Voltar para o curso
        </Link>
      </div>
    );
  }

  const handleSubmitAttempt = async (answers: Record<string, string>) => {
    return await submitQuizAttemptAction(courseId, answers);
  };

  return (
    <QuizRunner
      quiz={quiz}
      courseTitle={courseTitle}
      courseId={courseId}
      onSubmitAttempt={handleSubmitAttempt}
    />
  );
}
