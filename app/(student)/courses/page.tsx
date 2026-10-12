import Link from "next/link";
import { Play, Award, FileText, ArrowRight } from "lucide-react";
import { getUserCoursesWithProgress } from "@/app/actions/courses";

export default async function CoursesListPage() {
  const courses = await getUserCoursesWithProgress();

  return (
    <div className="space-y-6 animate-element">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Meus Cursos de Treinamento</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Capacitação técnica em lentes oftálmicas, técnicas comerciais e atendimento de excelência.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col justify-between rounded-3xl bg-zinc-900/70 border border-white/10 overflow-hidden shadow-xl hover:border-violet-500/40 transition-all group"
          >
            <div>
              {/* Capa / Thumbnail Compacta */}
              <div className="relative h-36 w-full bg-zinc-950 overflow-hidden">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Badges superiores */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-violet-600 text-white backdrop-blur-md">
                    {course.category || "Oficial"}
                  </span>
                  {course.quizPassed && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                      <Award className="w-2.5 h-2.5" />
                      <span>Certificado</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 left-3.5 right-3.5">
                  <h2 className="text-sm font-bold text-white line-clamp-1">{course.title}</h2>
                </div>
              </div>

              {/* Detalhes do Treinamento Compactados */}
              <div className="p-4 space-y-3">
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Grade de Indicadores Rápidos */}
                <div className="grid grid-cols-3 gap-1.5 text-center p-2 rounded-2xl bg-black/40 border border-white/5 text-xs">
                  <div>
                    <span className="block font-bold text-white text-xs">
                      {course.completedLessons || 0}/{course.totalLessons || 0}
                    </span>
                    <span className="text-[9px] text-zinc-500">Aulas</span>
                  </div>
                  <div>
                    <span className="block font-bold text-violet-400 text-xs">
                      {course.progressPercentage}%
                    </span>
                    <span className="text-[9px] text-zinc-500">Evolução</span>
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-400 text-xs">
                      {Math.round((course.estimatedDurationMin || 120) / 60)}h
                    </span>
                    <span className="text-[9px] text-zinc-500">Duração</span>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">Progresso Geral</span>
                    <span className="text-emerald-400 font-medium">{course.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Ações: PDF e Player */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  {course.pdfAttachmentUrl ? (
                    <a
                      href={course.pdfAttachmentUrl}
                      download
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                      <span>PDF</span>
                    </a>
                  ) : (
                    <div />
                  )}

                  <Link
                    href={`/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all shadow-md shadow-violet-600/20"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Acessar Player</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
