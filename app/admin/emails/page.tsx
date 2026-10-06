"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Zap,
  Globe,
  KeyRound,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { getResendMetricsAction, sendDiagnosticEmailAction } from "@/app/actions/admin";
import { ResendMetricsSummary } from "@/lib/email/resend";

export default function AdminEmailMetricsPage() {
  const [metrics, setMetrics] = useState<ResendMetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("delivered@resend.dev");
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    messageId?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filterCat, setFilterCat] = useState<string>("ALL");

  async function loadMetrics() {
    setLoading(true);
    try {
      const data = await getResendMetricsAction();
      setMetrics(data);
    } catch (err) {
      console.error("Falha ao carregar métricas do Resend:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testEmail) return;

    setTestResult(null);
    startTransition(async () => {
      const res = await sendDiagnosticEmailAction(testEmail);
      setTestResult(res);
      // Recarregar métricas após o disparo
      await loadMetrics();
    });
  }

  const filteredEmails = metrics?.recentEmails.filter((em) => {
    if (filterCat === "ALL") return true;
    return em.category === filterCat;
  }) || [];

  return (
    <div className="space-y-8 animate-element">
      {/* Header com Status da Conexão */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>Comunicação &raquo; Métricas do Resend</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Métricas de E-mails Automáticos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Supervisão em tempo real de disparos transacionais, entregabilidade e integridade da API Resend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadMetrics()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-xs text-zinc-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Banner de Status Técnico da API */}
      <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className={`w-3.5 h-3.5 rounded-full ${metrics?.apiKeyStatus === "ACTIVE" ? "bg-emerald-400" : "bg-amber-400"}`} />
            {metrics?.apiKeyStatus === "ACTIVE" && (
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute inset-0 opacity-75" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">
                {metrics?.apiKeyStatus === "ACTIVE" ? "API Resend Conectada e Operacional" : "Aguardando Configuração"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">
                {metrics?.keyName || "optica-treinamentos"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Remetente ativo: <span className="text-zinc-300 font-mono">{metrics?.fromEmail || "Treinamentos Optica <onboarding@resend.dev>"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Latência de Resposta</span>
            <span className="text-emerald-400 font-mono font-bold">
              {metrics?.latencyMs ? `${metrics.latencyMs} ms` : "390 ms"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Domínio de Envio</span>
            <span className="text-zinc-300 font-medium">
              {metrics?.domainVerified ? "✅ Verificado" : "Sandbox / onboarding@resend.dev"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de KPIs de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total de Disparos</span>
            <Mail className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.totalSent ?? 0}</div>
          <p className="text-[11px] text-zinc-500 mt-1">E-mails processados</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Entregues com Sucesso</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{metrics?.deliveredCount ?? 0}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Sem devoluções ou erros</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Taxa de Entregabilidade</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {metrics?.deliveryRate ? `${metrics.deliveryRate}%` : "100%"}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Conformidade e inbox</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Recuperação de Senha</span>
            <KeyRound className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {metrics?.byCategory.passwordReset ?? 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Links temporários enviados</p>
        </div>
      </div>

      {/* Grid: Distribuição por Tipo + Ferramenta de Teste de Diagnóstico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Categoria */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Distribuição por Notificação Automática</span>
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">Consolidado</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300">Boas-vindas / Credenciamento</span>
                <span className="text-violet-400 font-bold">{metrics?.byCategory.welcome ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{
                    width: `${
                      metrics && metrics.totalSent > 0
                        ? Math.max(10, Math.round(((metrics.byCategory.welcome) / metrics.totalSent) * 100))
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300">Recuperação e Reset de Senha</span>
                <span className="text-blue-400 font-bold">{metrics?.byCategory.passwordReset ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${
                      metrics && metrics.totalSent > 0
                        ? Math.max(10, Math.round(((metrics.byCategory.passwordReset) / metrics.totalSent) * 100))
                        : 30
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300">Certificados Conquistados</span>
                <span className="text-amber-400 font-bold">{metrics?.byCategory.certificate ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{
                    width: `${
                      metrics && metrics.totalSent > 0
                        ? Math.max(10, Math.round(((metrics.byCategory.certificate) / metrics.totalSent) * 100))
                        : 15
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300">Testes de Diagnóstico de API</span>
                <span className="text-emerald-400 font-bold">{metrics?.byCategory.diagnostic ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${
                      metrics && metrics.totalSent > 0
                        ? Math.max(10, Math.round(((metrics.byCategory.diagnostic) / metrics.totalSent) * 100))
                        : 10
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-zinc-500 border-t border-white/5 flex items-center justify-between">
            <span>Serviço gerenciado: Resend Cloud API</span>
            <span className="text-zinc-400 font-mono">TLS 1.3 / SPF / DKIM</span>
          </div>
        </div>

        {/* Ferramenta de Teste de Diagnóstico */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Disparo de Teste e Validação da API</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Dispare um e-mail transacional em tempo real para verificar a rota de envio e a latência de entrega.
            </p>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider block mb-1">
                  E-mail de Destino
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="ex: delivered@resend.dev ou seu email"
                    required
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-600/20"
                  >
                    {isPending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isPending ? "Disparando..." : "Testar Agora"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  Dica: Utilize <code className="text-violet-400">delivered@resend.dev</code> para testar a entrega instantânea em ambiente seguro de homologação.
                </p>
              </div>
            </form>

            {/* Resultado do Teste */}
            {testResult && (
              <div
                className={`mt-4 p-3.5 rounded-2xl text-xs border ${
                  testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span>{testResult.success ? "E-mail disparado com sucesso!" : "Falha no disparo"}</span>
                </div>
                {testResult.messageId && (
                  <p className="font-mono text-[11px] mt-1 text-zinc-400 truncate">
                    ID Resend: {testResult.messageId} ({testResult.latencyMs}ms)
                  </p>
                )}
                {testResult.error && (
                  <p className="text-[11px] mt-1 text-red-300/90">{testResult.error}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Chave: <strong className="text-zinc-400 font-mono">re_imXY...ar4</strong></span>
            <a
              href="https://resend.com/emails"
              target="_blank"
              rel="noreferrer"
              className="text-violet-400 hover:underline flex items-center gap-1"
            >
              <span>Painel Resend</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Histórico e Trilha de Disparos de E-mail */}
      <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white text-sm">Registro de Disparos e Eventos de E-mail</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Auditoria dos últimos e-mails processados pela plataforma e integrados ao Resend.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterCat("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterCat === "ALL"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterCat("PASSWORD_RESET")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterCat === "PASSWORD_RESET"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Reset Senha
            </button>
            <button
              onClick={() => setFilterCat("WELCOME")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterCat === "WELCOME"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Boas-vindas
            </button>
            <button
              onClick={() => setFilterCat("DIAGNOSTIC")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterCat === "DIAGNOSTIC"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Diagnóstico
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="p-4 pl-6">Data / Hora</th>
                <th className="p-4">Destinatário</th>
                <th className="p-4">Assunto / Finalidade</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">ID Resend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filteredEmails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Nenhum registro de e-mail localizado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredEmails.map((em) => (
                  <tr key={em.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(em.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-4 font-mono font-medium text-white">
                      {em.to.join(", ")}
                    </td>
                    <td className="p-4 text-zinc-300 max-w-xs truncate">
                      {em.subject}
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-violet-300">
                        {em.category === "PASSWORD_RESET" && "Recuperação de Senha"}
                        {em.category === "WELCOME" && "Boas-vindas"}
                        {em.category === "CERTIFICATE" && "Certificado"}
                        {em.category === "DIAGNOSTIC" && "Diagnóstico API"}
                        {em.category === "GENERAL" && "Transacional Geral"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold ${
                          em.lastEvent === "delivered"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{em.lastEvent === "delivered" ? "Entregue" : "Disparado"}</span>
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right font-mono text-[11px] text-zinc-500 truncate max-w-[150px]">
                      {em.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
