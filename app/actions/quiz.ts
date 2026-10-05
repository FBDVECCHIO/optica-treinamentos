"use server";

import { db } from "@/lib/db/mock-store";
import { getCurrentUser } from "./auth";
import { evaluateDissertativeAnswer } from "@/lib/quiz/semantic-scorer";
import { logAudit } from "@/lib/audit";
import { Quiz } from "@/types/database";

export interface SubmitQuizResult {
  score: number;
  passed: boolean;
  breakdown: Record<string, { isCorrect: boolean; points: number; feedback?: string }>;
}

/**
 * Obtém quiz e questões do curso
 */
export async function getCourseQuiz(courseId: string): Promise<Quiz | null> {
  const quiz = db.quizzes.find((q) => q.courseId === courseId);
  return quiz || null;
}

/**
 * Submissão e Avaliação Híbrida do Quiz
 */
export async function submitQuizAttemptAction(
  courseId: string,
  userAnswers: Record<string, string>
): Promise<SubmitQuizResult> {
  const user = await getCurrentUser();
  const userId = user?.id || "usr_aluno";

  const quiz = db.quizzes.find((q) => q.courseId === courseId);
  if (!quiz || !quiz.questions) {
    throw new Error("Quiz não encontrado para este curso.");
  }

  let totalPointsEarned = 0;
  let totalMaxPoints = 0;
  const breakdown: Record<string, { isCorrect: boolean; points: number; feedback?: string }> = {};

  for (const question of quiz.questions) {
    totalMaxPoints += question.points;
    const answer = userAnswers[question.id] || "";

    if (question.type === "multiple_choice") {
      const isCorrect = answer.trim().toUpperCase() === question.correctAnswer?.trim().toUpperCase();
      const points = isCorrect ? question.points : 0;
      totalPointsEarned += points;

      breakdown[question.id] = {
        isCorrect,
        points,
        feedback: isCorrect
          ? "Resposta exata conforme gabarito técnico oficial."
          : `Resposta incorreta. A alternativa correta era a (${question.correctAnswer}).`,
      };
    } else if (question.type === "dissertative") {
      const evalResult = evaluateDissertativeAnswer(
        answer,
        question.rubricKeywords || [],
        question.points
      );

      totalPointsEarned += evalResult.score;
      const isAcceptable = evalResult.score >= question.points * 0.7;

      breakdown[question.id] = {
        isCorrect: isAcceptable,
        points: evalResult.score,
        feedback: evalResult.feedback,
      };
    }
  }

  const finalPercentage = totalMaxPoints > 0 ? Math.round((totalPointsEarned / totalMaxPoints) * 100) : 0;
  const passed = finalPercentage >= quiz.minScoreToPass;

  // Registrar a tentativa no banco
  const attemptId = `att_${Date.now()}`;
  db.quizAttempts.push({
    id: attemptId,
    userId,
    quizId: quiz.id,
    score: finalPercentage,
    passed,
    status: "graded",
    submittedAt: new Date().toISOString(),
    gradedAt: new Date().toISOString(),
  });

  // Registrar no log de auditoria
  await logAudit({
    action: "QUIZ_SUBMITTED",
    userId,
    userEmail: user?.email,
    metadata: {
      courseId,
      quizId: quiz.id,
      score: finalPercentage,
      passed,
    },
  });

  return {
    score: finalPercentage,
    passed,
    breakdown,
  };
}
