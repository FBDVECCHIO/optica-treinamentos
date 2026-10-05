import { BarChart3, Award, CheckCircle2, Building2 } from "lucide-react";
import { getStudentPerformanceReportAction } from "@/app/actions/admin";

export default async function AdminReportsPage() {
  const students = await getStudentPerformanceReportAction();

  return (
    <div className="space-y-6 animate-element">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Configurações &raquo; Relatórios Pedagógicos e Comerciais</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Análise de Evolução, Performance e Notas por Usuário
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tabela consolidada de desempenho dos colaboradores de todas as filiais e lojas franqueadas.
        </p>
      </div>

      {/* Tabela de Relatório */}
      <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="p-4 pl-6">Colaborador / E-mail</th>
                <th className="p-4">Loja / Unidade</th>
                <th className="p-4">Cargo</th>
                <th className="p-4 text-center">Cursos Inscritos</th>
                <th className="p-4 text-center">Média nos Quizzes</th>
                <th className="p-4 pr-6 text-right">Status de Certificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {students.map((st) => {
                const isPassed = st.averageScore >= 70;
                return (
                  <tr key={st.userId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-white uppercase">{st.userName}</div>
                      <div className="text-[11px] text-zinc-400">{st.userEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-zinc-200">{st.storeName}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-violet-300">
                        {st.roleTitle}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono">
                      {st.coursesStarted} curso(s)
                    </td>
                    <td className="p-4 text-center font-mono font-bold">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl ${
                          st.averageScore >= 70
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : st.averageScore > 0
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {st.averageScore > 0 ? `${st.averageScore}%` : "Pendente"}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Certificado Emitido</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px]">
                          <span>Em Treinamento</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
