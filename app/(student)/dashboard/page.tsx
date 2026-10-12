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
          <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A]">
            Seus Treinamentos de Óptica
          </h3>
          <span className="text-xs text-[#6F7780] font-medium">
            {courses.length} curso(s) disponível(is)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-3xl bg-white border border-[#C9D0D6] overflow-hidden shadow-sm hover:border-[#0A0A0A]/40 transition-all group"
            >
              <div>
                {/* Thumbnail com badge */}
                <div className="relative h-36 w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#0A0A0A] text-[#C7FF2E] backdrop-blur-md">
                      {course.category || "Oficial"}
                    </span>
                    {course.quizPassed && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" />
                        <span>Certificado</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-3.5 right-3.5">
                    <h4 className="text-sm font-bold text-white line-clamp-1">{course.title}</h4>
                  </div>
                </div>

                {/* Detalhes do Treinamento Compactados */}
                <div className="p-4 space-y-3">
                  <p className="text-[11px] text-[#6F7780] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Grade de Indicadores Rápidos */}
                  <div className="grid grid-cols-3 gap-1.5 text-center p-2 rounded-2xl bg-[#F7F7F1] border border-[#C9D0D6] text-xs">
                    <div>
                      <span className="block font-bold text-[#0A0A0A] text-xs">
                        {course.completedLessons || 0}/{course.totalLessons || 0}
                      </span>
                      <span className="text-[9px] text-[#6F7780]">Aulas</span>
                    </div>
                    <div>
                      <span className="block font-bold text-[#0A0A0A] text-xs">
                        {course.progressPercentage}%
                      </span>
                      <span className="text-[9px] text-[#6F7780]">Evolução</span>
                    </div>
                    <div>
                      <span className="block font-bold text-[#0A0A0A] text-xs">
                        {Math.round((course.estimatedDurationMin || 120) / 60)}h
                      </span>
                      <span className="text-[9px] text-[#6F7780]">Duração</span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#6F7780]">Evolução do Curso</span>
                      <span className="text-[#0A0A0A] font-bold">{course.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#C9D0D6]/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C7FF2E] rounded-full transition-all"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Ações: PDF e Link Player */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#C9D0D6]/60">
                    {course.pdfAttachmentUrl ? (
                      <a
                        href={course.pdfAttachmentUrl}
                        download
                        className="inline-flex items-center gap-1 text-[11px] text-[#6F7780] hover:text-[#0A0A0A] transition-colors font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-500" />
                        <span>Apostila</span>
                      </a>
                    ) : (
                      <div />
                    )}

                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C7FF2E] hover:bg-[#b5ee24] text-xs font-extrabold text-[#0A0A0A] transition-all shadow-md shadow-[#C7FF2E]/25"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{course.progressPercentage > 0 ? "Continuar" : "Iniciar"}</span>
                      <ArrowRight className="w-3 h-3" />
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
