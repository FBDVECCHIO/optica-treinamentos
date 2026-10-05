"use server";

import { db } from "@/lib/db/mock-store";
import { getCurrentUser } from "./auth";
import { calculateCourseProgress } from "@/lib/utils/progress";
import { Course, Module, Lesson } from "@/types/database";

export interface CourseWithProgress extends Course {
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  quizScore?: number | null;
  quizPassed?: boolean;
}

/**
 * Retorna os cursos habilitados para o usuário logado com métricas de progresso calculadas
 */
export async function getUserCoursesWithProgress(): Promise<CourseWithProgress[]> {
  const user = await getCurrentUser();
  const userId = user?.id || "usr_aluno";

  // Cursos liberados para o usuário
  const userCourseEntries = db.userCourses.filter((uc) => uc.userId === userId && uc.isEnabled);
  const enrolledCourseIds = new Set(userCourseEntries.map((uc) => uc.courseId));

  const list: CourseWithProgress[] = [];

  for (const course of db.courses) {
    if (!course.isPublished && user?.accessLevel !== "master") continue;
    if (!enrolledCourseIds.has(course.id) && user?.accessLevel !== "master") continue;

    // Calcular lições e progresso
    const courseModules = db.modules.filter((m) => m.courseId === course.id);
    const allLessonIds: string[] = [];
    courseModules.forEach((m) => {
      m.lessons?.forEach((l) => allLessonIds.push(l.id));
    });

    const completedLessonIds = db.lessonProgress
      .filter((lp) => lp.userId === userId && lp.completed && allLessonIds.includes(lp.lessonId))
      .map((lp) => lp.lessonId);

    const progressPercentage = calculateCourseProgress(allLessonIds.length, completedLessonIds.length);

    // Obter melhor pontuação no quiz do curso
    const courseQuiz = db.quizzes.find((q) => q.courseId === course.id);
    let quizScore: number | null = null;
    let quizPassed = false;

    if (courseQuiz) {
      const attempts = db.quizAttempts.filter((qa) => qa.userId === userId && qa.quizId === courseQuiz.id);
      if (attempts.length > 0) {
        const best = attempts.reduce((max, a) => (a.score > max.score ? a : max), attempts[0]);
        quizScore = best.score;
        quizPassed = best.passed;
      }
    }

    list.push({
      ...course,
      progressPercentage,
      totalLessons: allLessonIds.length,
      completedLessons: completedLessonIds.length,
      quizScore,
      quizPassed,
    });
  }

  return list;
}

/**
 * Retorna detalhes do curso com árvore de módulos e lições
 */
export async function getCourseDetails(courseId: string): Promise<{
  course: Course;
  modules: Module[];
  completedLessonIds: string[];
  activeLesson?: Lesson;
  quizScore?: number | null;
} | null> {
  const user = await getCurrentUser();
  const userId = user?.id || "usr_aluno";

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) return null;

  const modules = db.modules.filter((m) => m.courseId === courseId);
  const allLessonIds: string[] = [];
  modules.forEach((m) => {
    m.lessons?.forEach((l) => allLessonIds.push(l.id));
  });

  const completedLessonIds = db.lessonProgress
    .filter((lp) => lp.userId === userId && lp.completed && allLessonIds.includes(lp.lessonId))
    .map((lp) => lp.lessonId);

  // Primeira lição não concluída ou a primeira disponível
  let activeLesson: Lesson | undefined;
  for (const m of modules) {
    if (m.lessons) {
      for (const l of m.lessons) {
        if (!completedLessonIds.includes(l.id) && !activeLesson) {
          activeLesson = l;
        }
      }
    }
  }

  if (!activeLesson && modules[0]?.lessons?.[0]) {
    activeLesson = modules[0].lessons[0];
  }

  // Quiz score
  const quiz = db.quizzes.find((q) => q.courseId === courseId);
  let quizScore: number | null = null;
  if (quiz) {
    const attempt = db.quizAttempts.find((a) => a.userId === userId && a.quizId === quiz.id);
    if (attempt) quizScore = attempt.score;
  }

  return {
    course,
    modules,
    completedLessonIds,
    activeLesson,
    quizScore,
  };
}

/**
 * Marca ou desmarca aula como concluída
 */
export async function toggleLessonProgress(lessonId: string, completed: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  const userId = user?.id || "usr_aluno";

  const existingIndex = db.lessonProgress.findIndex((lp) => lp.userId === userId && lp.lessonId === lessonId);

  if (existingIndex >= 0) {
    db.lessonProgress[existingIndex].completed = completed;
    db.lessonProgress[existingIndex].completedAt = completed ? new Date().toISOString() : "";
  } else {
    db.lessonProgress.push({
      userId,
      lessonId,
      completed,
      completedAt: completed ? new Date().toISOString() : "",
    });
  }

  return true;
}

/**
 * Indicadores consolidados de performance do aluno para o dashboard
 */
export async function getUserPerformanceMetrics(): Promise<{
  enrolledCoursesCount: number;
  overallProgressPercentage: number;
  averageQuizScore: number;
  totalTrainingHours: number;
  certificationsCount: number;
}> {
  const courses = await getUserCoursesWithProgress();

  const enrolledCoursesCount = courses.length;
  const overallProgressPercentage =
    courses.length > 0
      ? Math.round(courses.reduce((acc, c) => acc + c.progressPercentage, 0) / courses.length)
      : 0;

  const coursesWithQuiz = courses.filter((c) => c.quizScore !== null && c.quizScore !== undefined);
  const averageQuizScore =
    coursesWithQuiz.length > 0
      ? Math.round(coursesWithQuiz.reduce((acc, c) => acc + (c.quizScore || 0), 0) / coursesWithQuiz.length)
      : 88;

  const totalTrainingMinutes = courses.reduce((acc, c) => acc + c.estimatedDurationMin, 0);
  const totalTrainingHours = Math.round((totalTrainingMinutes / 60) * 10) / 10;

  const certificationsCount = courses.filter((c) => c.quizPassed).length;

  return {
    enrolledCoursesCount,
    overallProgressPercentage,
    averageQuizScore,
    totalTrainingHours,
    certificationsCount,
  };
}
