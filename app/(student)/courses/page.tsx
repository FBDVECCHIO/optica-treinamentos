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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col rounded-3xl bg-zinc-900/70 border border-white/10 overflow-hidden shadow-xl"
          >
            <div
              className="relative h-44 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              {course.quizPassed && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Aprovado no Quiz</span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">{course.title}</h2>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{course.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Progresso: {course.progressPercentage}%</span>
                  <span>{course.completedLessons} de {course.totalLessons} aulas</span>
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
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                      <span>Download PDF</span>
                    </a>
                  )}

                  <Link
                    href={`/courses/${course.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-all shadow-md shadow-violet-600/20 ml-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Acessar Player</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
