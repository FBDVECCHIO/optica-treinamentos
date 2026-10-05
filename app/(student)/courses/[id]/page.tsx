"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, CheckCircle2, HelpCircle } from "lucide-react";
import { UniversalVideoPlayer } from "@/components/player/universal-video-player";
import { CourseTimeline } from "@/components/player/course-timeline";
import { PdfDownloadButton } from "@/components/player/pdf-download-button";
import { getCourseDetails, toggleLessonProgress } from "@/app/actions/courses";
import { Course, Module, Lesson } from "@/types/database";

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCourseDetails(courseId);
      if (data) {
        setCourse(data.course);
        setModules(data.modules);
        setCompletedLessonIds(data.completedLessonIds);
        setActiveLesson(data.activeLesson || null);
        setQuizScore(data.quizScore || null);
      }
      setLoading(false);
    }
    loadData();
  }, [courseId]);

  const handleToggleComplete = async () => {
    if (!activeLesson) return;
    const isCurrentlyCompleted = completedLessonIds.includes(activeLesson.id);
    const newCompleted = !isCurrentlyCompleted;

    if (newCompleted) {
      setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
    } else {
      setCompletedLessonIds((prev) => prev.filter((id) => id !== activeLesson.id));
    }

    await toggleLessonProgress(activeLesson.id, newCompleted);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400 text-sm">
        Carregando player de treinamento...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>Curso não encontrado.</p>
        <Link href="/courses" className="text-violet-400 hover:underline mt-2 inline-block">
          Voltar para meus treinamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-element">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Meus Treinamentos</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {course.title}
          </h1>
        </div>

        {/* Botão de Download de PDF da Lição / Apostila */}
        <div className="shrink-0">
          <PdfDownloadButton
            pdfUrl={course.pdfAttachmentUrl || "/TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf"}
            pdfTitle={course.pdfAttachmentName || "Apostila Técnica Oficial"}
            fileSize="1.8 MB"
          />
        </div>
      </div>

      {/* Grid Principal: Player à Esquerda, Timeline à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1 e 2: Player de Vídeo e Materiais da Aula */}
        <div className="lg:col-span-2 space-y-6">
          {activeLesson ? (
            <UniversalVideoPlayer
              title={activeLesson.title}
              provider={activeLesson.videoProvider}
              videoUrl={activeLesson.videoUrl}
              isCompleted={completedLessonIds.includes(activeLesson.id)}
              onMarkCompleted={handleToggleComplete}
            />
          ) : (
            <div className="w-full aspect-video bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-400 text-sm border border-white/10">
              Selecione uma aula na timeline para iniciar.
            </div>
          )}

          {/* Descrição e Conceitos da Aula Ativa */}
          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Resumo Pedagógico da Lição</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {activeLesson?.description || course.description}
            </p>

            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Status da Lição: {completedLessonIds.includes(activeLesson?.id || "") ? "Concluída" : "Pendente"}</span>
              </div>
              <Link
                href={`/courses/${course.id}/quiz`}
                className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ir para o Quiz de Fixação</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna 3: Linha do Tempo de Evolução Sequencial */}
        <div className="lg:col-span-1">
          <CourseTimeline
            courseId={course.id}
            modules={modules}
            activeLessonId={activeLesson?.id}
            completedLessonIds={completedLessonIds}
            quizAvailable={true}
            quizScore={quizScore}
            onSelectLesson={(lesson) => setActiveLesson(lesson)}
          />
        </div>
      </div>
    </div>
  );
}
