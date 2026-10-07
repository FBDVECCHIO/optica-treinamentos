import { BarChart3 } from "lucide-react";
import { getStudentPerformanceReportAction } from "@/app/actions/admin";
import { StudentPerformanceTable } from "@/components/admin/student-performance-table";

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
          Tabela consolidada de desempenho dos colaboradores de todas as filiais e lojas franqueadas. Clique no botão &quot;+&quot; para expandir o histórico de cursos concluídos e visualizar os certificados emitidos.
        </p>
      </div>

      <StudentPerformanceTable initialStudents={students} />
    </div>
  );
}

