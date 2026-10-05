import Link from "next/link";
import { BookOpen, Award, Clock, ArrowRight, Play, CheckCircle2, FileText } from "lucide-react";
import { getUserCoursesWithProgress, getUserPerformanceMetrics } from "@/app/actions/courses";
import { getCurrentUser } from "@/app/actions/auth";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  const metrics = await getUserPerformanceMetrics();
  const courses = await getUserCoursesWithProgress();

  return (
    <div className="space-y-8 animate-element">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-900/40 via-zinc-900/80 to-zinc-900/90 border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-3">
            <span>Área do Consultor Óptico</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            Olá, {user?.name ? user.name.split(" ")[0] : "Consultor"}! Continue sua jornada de capacitação.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
            Acompanhe sua timeline de evolução, domine os diferenciais da Linha Gold Comfort e alcance a pontuação máxima nos quizzes oficiais.
          </p>
        </div>
      </div>

      {/* Indicadores de Performance (KPIs Solicitados) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cursos Inscritos */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Cursos Ativos</span>
            <BookOpen className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.enrolledCoursesCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Habilitados para você</p>
        </div>

        {/* KPI 2: Progresso Geral */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Progresso Médio</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{metrics.overallProgressPercentage}%</div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${metrics.overallProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Média nos Quizzes */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Média nos Quizzes</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{metrics.averageQuizScore}%</div>
          <p className="text-[11px] text-zinc-500 mt-1">Pontuação de fixação</p>
        </div>

        {/* KPI 4: Horas de Estudo */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Horas de Estudo</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">{metrics.totalTrainingHours}h</div>
          <p className="text-[11px] text-zinc-500 mt-1">Carga horária total</p>
        </div>
      </div>

      {/* Grade de Cursos do Aluno (Resumo de Performance por Curso) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Seus Treinamentos de Óptica
          </h3>
          <span className="text-xs text-zinc-400">
            {courses.length} curso(s) disponível(is)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-3xl bg-zinc-900/70 border border-white/10 overflow-hidden shadow-xl hover:border-violet-500/30 transition-all group"
            >
              {/* Thumbnail com badge */}
              <div
                className="relative h-44 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-violet-300">
                  {course.modulesCount || 2} Módulos &bull; {course.lessonsCount || 4} Aulas
                </div>
                {course.quizPassed && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Certificado</span>
                  </div>
                )}
              </div>

              {/* Informações e Progresso */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Evolução do Curso:</span>
                    <span className="font-bold text-white">{course.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-violet-600 h-full rounded-full transition-all"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {course.pdfAttachmentUrl && (
                      <a
                        href={course.pdfAttachmentUrl}
                        download
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-400" />
                        <span>Apostila em PDF</span>
                      </a>
                    )}

                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-all shadow-md shadow-violet-600/20 ml-auto"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{course.progressPercentage > 0 ? "Continuar" : "Iniciar"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
