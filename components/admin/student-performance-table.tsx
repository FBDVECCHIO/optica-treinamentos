"use client";

import React, { useState } from "react";
import {
  Plus,
  Minus,
  Award,
  CheckCircle2,
  Printer,
  Eye,
  Search,
  BookOpen,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import { StudentPerformanceReportItem } from "@/app/actions/admin";
import { IssuedCertificate } from "@/types/database";
import { CertificateRenderer } from "@/components/certificates/certificate-renderer";

interface StudentPerformanceTableProps {
  initialStudents: StudentPerformanceReportItem[];
}

export const StudentPerformanceTable: React.FC<StudentPerformanceTableProps> = ({
  initialStudents,
}) => {
  const [students] = useState<StudentPerformanceReportItem[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [selectedCertForModal, setSelectedCertForModal] = useState<IssuedCertificate | null>(null);

  const toggleExpand = (userId: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const filteredStudents = students.filter((st) => {
    const term = searchTerm.toLowerCase();
    return (
      st.userName.toLowerCase().includes(term) ||
      st.userEmail.toLowerCase().includes(term) ||
      st.storeName.toLowerCase().includes(term) ||
      st.roleTitle.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por colaborador, e-mail, loja ou cargo..."
            className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>Total:</span>
          <span className="font-bold text-white">{filteredStudents.length}</span>
          <span>colaborador(es) listado(s)</span>
        </div>
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 text-xs">
                    Nenhum colaborador encontrado para a busca informada.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isExpanded = !!expandedUsers[st.userId];
                  const hasCertificates = st.completedCourses.length > 0;
                  const isPassed = st.averageScore >= 70 || hasCertificates;

                  return (
                    <React.Fragment key={st.userId}>
                      {/* Linha Principal do Colaborador */}
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {/* Botão '+' para Expandir Acordeão */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(st.userId)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                isExpanded
                                  ? "bg-violet-600 text-white shadow-md shadow-violet-950"
                                  : "bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300"
                              }`}
                              title={isExpanded ? "Ocultar Cursos e Certificados" : "Ver Cursos Concluídos e Certificados"}
                            >
                              {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>

                            <div>
                              <div className="font-semibold text-white uppercase">{st.userName}</div>
                              <div className="text-[11px] text-zinc-400">{st.userEmail}</div>
                            </div>
                          </div>
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
                              isPassed
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
                              <span>{st.completedCourses.length} Certificado(s)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px]">
                              <span>Em Treinamento</span>
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Linha Expansível do Acordeão */}
                      {isExpanded && (
                        <tr className="bg-black/40 border-b border-violet-500/20 animate-element">
                          <td colSpan={6} className="p-6 pl-14">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                  <Award className="w-4 h-4 text-amber-400" />
                                  <span>Histórico de Treinamentos e Miniaturas de Certificados</span>
                                </h4>
                                <span className="text-[11px] text-zinc-400">
                                  {st.completedCourses.length} curso(s) concluído(s) com certificação
                                </span>
                              </div>

                              {st.completedCourses.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 text-center text-zinc-400 text-xs">
                                  Este colaborador ainda está assistindo às videoaulas e não possui certificados emitidos até o momento.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {st.completedCourses.map((cc, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="p-4 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                                    >
                                      {/* Miniatura Gráfica do Certificado */}
                                      <div
                                        onClick={() => cc.certificate && setSelectedCertForModal(cc.certificate)}
                                        className="cursor-pointer group relative"
                                        title="Clique para abrir e baixar em tamanho oficial"
                                      >
                                        <CertificateRenderer
                                          templateId={cc.certificate?.templateId || "1"}
                                          courseTitle={cc.courseTitle}
                                          studentName={st.userName}
                                          completionDate={new Date(cc.completedAt).toLocaleDateString("pt-BR")}
                                          location={cc.certificate?.location || "São Paulo - SP"}
                                          score={cc.score}
                                          customLogoUrl={cc.certificate?.customLogoUrl}
                                          customBgUrl={cc.certificate?.customBgUrl}
                                          verificationCode={cc.certificate?.verificationCode}
                                          isMiniature={true}
                                          allowOpenFull={false}
                                        />

                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2 backdrop-blur-xs">
                                          <span className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-lg">
                                            <Eye className="w-3 h-3" />
                                            <span>Ampliar</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* Metadados do Treinamento e Botão de Download */}
                                      <div className="space-y-3">
                                        <div>
                                          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[9px] font-semibold uppercase">
                                            {cc.category || "Oficial"}
                                          </span>
                                          <h5 className="font-bold text-white text-xs mt-1 line-clamp-1">
                                            {cc.courseTitle}
                                          </h5>
                                          <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-1">
                                            <span>Nota: <strong className="text-emerald-400">{cc.score}%</strong></span>
                                            <span>&bull;</span>
                                            <span>Concluído em: {new Date(cc.completedAt).toLocaleDateString("pt-BR")}</span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => cc.certificate && setSelectedCertForModal(cc.certificate)}
                                          className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                        >
                                          <Printer className="w-3.5 h-3.5" />
                                          <span>Baixar / Imprimir Certificado</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Impressão e Visualização do Certificado em Alta Resolução */}
      {selectedCertForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-element">
          <div className="relative w-full max-w-4xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm">Certificado Oficial SRL</span>
                <span className="text-xs text-zinc-400 font-mono">({selectedCertForModal.verificationCode})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Gerar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCertForModal(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <CertificateRenderer
              templateId={selectedCertForModal.templateId}
              courseTitle={selectedCertForModal.courseTitle}
              studentName={selectedCertForModal.userName}
              completionDate={new Date(selectedCertForModal.issuedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              location={selectedCertForModal.location}
              customLogoUrl={selectedCertForModal.customLogoUrl}
              customBgUrl={selectedCertForModal.customBgUrl}
              score={selectedCertForModal.score}
              verificationCode={selectedCertForModal.verificationCode}
              isMiniature={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
