"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Filter, Search, Clock, Laptop } from "lucide-react";
import { getAuditLogs } from "@/lib/audit";
import { AuditLog } from "@/types/database";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAuditLogs({ limit: 100 }).then(setLogs);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (search) {
      const term = search.toLowerCase();
      const email = log.userEmail?.toLowerCase() || "";
      const act = log.action.toLowerCase();
      if (!email.includes(term) && !act.includes(term) && !log.ipAddress?.includes(term)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-element">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Configurações &raquo; Trilha Inviolável de Auditoria</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Logs de Auditoria e Segurança do Sistema
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Rastreabilidade em conformidade com as 21 regras de segurança: registros de cadastro, tentativas de login e resgates de senha via Resend.
        </p>
      </div>

      {/* Filtros */}
      <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por e-mail, ação ou IP..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-black/40 border border-white/10 text-xs text-white rounded-2xl px-3 py-2.5 focus:outline-none w-full sm:w-auto"
          >
            <option value="all" className="bg-zinc-900">Todas as Ações</option>
            <option value="LOGIN_SUCCESS" className="bg-zinc-900">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILURE" className="bg-zinc-900">LOGIN_FAILURE</option>
            <option value="PASSWORD_RESET_REQUEST" className="bg-zinc-900">PASSWORD_RESET_REQUEST</option>
            <option value="PASSWORD_RESET_COMPLETED" className="bg-zinc-900">PASSWORD_RESET_COMPLETED</option>
            <option value="USER_REGISTERED" className="bg-zinc-900">USER_REGISTERED</option>
            <option value="USER_UPDATED" className="bg-zinc-900">USER_UPDATED</option>
            <option value="COURSE_ACCESS_TOGGLED" className="bg-zinc-900">COURSE_ACCESS_TOGGLED</option>
            <option value="QUIZ_SUBMITTED" className="bg-zinc-900">QUIZ_SUBMITTED</option>
            <option value="CERTIFICATE_ISSUED" className="bg-zinc-900">CERTIFICATE_ISSUED</option>
            <option value="DIAGNOSTIC_EMAIL_SENT" className="bg-zinc-900">DIAGNOSTIC_EMAIL_SENT</option>
            <option value="ADMIN_PASSWORD_RESET" className="bg-zinc-900">ADMIN_PASSWORD_RESET</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="p-4 pl-6">Data / Hora</th>
                <th className="p-4">Ação Registrada</th>
                <th className="p-4">Usuário / E-mail</th>
                <th className="p-4">Endereço IP</th>
                <th className="p-4 pr-6">Metadados Técnicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filteredLogs.map((log) => {
                const isFail = log.action.includes("FAILURE");
                const isReset = log.action.includes("RESET");
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                          isFail
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : isReset
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{log.userEmail || "Não informado"}</div>
                      {log.userId && <div className="text-[10px] text-zinc-500 font-mono">{log.userId}</div>}
                    </td>
                    <td className="p-4 font-mono text-zinc-400 text-[11px]">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="p-4 pr-6 font-mono text-[10px] text-zinc-400 max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    Nenhum registro de auditoria atende aos critérios filtrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
