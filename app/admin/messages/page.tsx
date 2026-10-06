"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Mail,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Eye,
  Send,
  AlertCircle,
  Copy,
  Info,
  ShieldAlert,
} from "lucide-react";
import { EmailTemplate, DEFAULT_EMAIL_TEMPLATES } from "@/lib/email/templates";
import { getEmailTemplatesAction, saveEmailTemplateAction, sendDiagnosticEmailAction } from "@/app/actions/admin";

export default function AdminMessagesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>("tpl_password_reset");
  const [currentEdit, setCurrentEdit] = useState<EmailTemplate>(DEFAULT_EMAIL_TEMPLATES[1]);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const data = await getEmailTemplatesAction();
      if (data && data.length > 0) {
        setTemplates(data);
        const active = data.find((t) => t.id === selectedId) || data[0];
        setSelectedId(active.id);
        setCurrentEdit({ ...active });
      }
    });
  }, []);

  const handleSelectTemplate = (tpl: EmailTemplate) => {
    setSelectedId(tpl.id);
    setCurrentEdit({ ...tpl });
    setStatusMessage(null);
  };

  const handleFieldChange = (field: keyof EmailTemplate, value: string) => {
    setCurrentEdit((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInsertVariable = (variable: string) => {
    setCurrentEdit((prev) => ({
      ...prev,
      content: prev.content + " " + variable,
    }));
  };

  const handleSave = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveEmailTemplateAction(currentEdit.id, currentEdit);
      if (res.success && res.template) {
        setTemplates((prev) => prev.map((t) => (t.id === res.template!.id ? res.template! : t)));
        setStatusMessage({
          type: "success",
          text: `Modelo "${res.template.name}" atualizado e ativo para todos os envios automáticos!`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Falha ao gravar modelo.",
        });
      }
    });
  };

  const handleResetToDefault = () => {
    const original = DEFAULT_EMAIL_TEMPLATES.find((t) => t.id === currentEdit.id);
    if (original) {
      setCurrentEdit({ ...original });
      setStatusMessage({
        type: "success",
        text: "Padrão do sistema restaurado no formulário. Clique em Salvar para fixar.",
      });
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestResult("Informe um e-mail válido para disparar o teste.");
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendDiagnosticEmailAction(testEmail);
      if (res.success) {
        setTestResult(`✓ E-mail teste disparado via Resend com sucesso para ${testEmail}! (ID: ${res.messageId || "ok"})`);
      } else {
        setTestResult(`Falha no envio: ${res.error || "Erro de sandbox ou chave"}`);
      }
    } catch (e: any) {
      setTestResult(`Erro de execução: ${e?.message || "Inesperado"}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Variáveis simuladas para o Live Preview
  const sampleData: Record<string, string> = {
    nome: "Carlos Eduardo",
    email: "carlos.eduardo@optica.com.br",
    loja: "Óptica Central - Unidade 01",
    cargo: "Consultor Técnico",
    curso: "Linha Gold Comfort IA - Módulos 1 e 2",
    nota: "94",
    link: "https://optica-treinamentos.vercel.app/reset-password?token=preview_token_123",
  };

  // Preview interpolado
  const interpolate = (text: string) => {
    if (!text) return "";
    let res = text;
    for (const [k, v] of Object.entries(sampleData)) {
      res = res.replace(new RegExp(`{{${k}}}`, "g"), v);
    }
    return res;
  };

  const badgeColorStyles: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  };

  const currentBadgeStyle = badgeColorStyles[currentEdit.badgeColor] || badgeColorStyles.violet;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-wider">
            Comunicação Transacional
          </span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-xs text-zinc-400">Resend Engine Integrado</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Mail className="w-7 h-7 text-violet-400" />
          Gestão de Mensagens e E-mails
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
          Personalize as mensagens automáticas disparadas pela plataforma para redefinição de senha,
          recuperação, credenciamento de novos usuários e certificados com interpolação de variáveis dinâmicas.
        </p>
      </div>

      {/* Grid Principal: Seletor à Esquerda e Editor + Preview à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Painel Esquerdo: Lista de Modelos (4 colunas em lg) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Modelos Transacionais Ativos ({templates.length})
          </h2>

          <div className="space-y-2.5">
            {templates.map((tpl) => {
              const isSelected = tpl.id === selectedId;
              const badge = badgeColorStyles[tpl.badgeColor] || badgeColorStyles.violet;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-sm flex flex-col gap-2 relative overflow-hidden ${
                    isSelected
                      ? "bg-violet-600/10 border-violet-500/50 shadow-lg shadow-violet-950/40"
                      : "bg-zinc-900/60 border-white/5 hover:border-white/10 hover:bg-zinc-900/90"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-violet-500" />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white truncate">{tpl.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {tpl.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{tpl.description}</p>
                </button>
              );
            })}
          </div>

          {/* Teste Rápido de Disparo */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-xs space-y-3 mt-6">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <Send className="w-3.5 h-3.5 text-violet-400" />
              <span>Disparar E-mail Diagnóstico</span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Dispara uma mensagem de integridade diretamente pela API do Resend para certificar a conectividade.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="seu-email@dominio.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors"
              >
                {isSendingTest ? "Enviando..." : "Testar"}
              </button>
            </div>
            {testResult && (
              <p
                className={`text-[11px] p-2 rounded-lg ${
                  testResult.startsWith("✓")
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {testResult}
              </p>
            )}
          </div>
        </div>

        {/* Painel Central / Direito: Formulário + Live Preview (8 colunas em lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between text-xs border ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-zinc-500 hover:text-white text-xs ml-4"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Form de Edição */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>Editando:</span>
                  <span className="text-violet-400">{currentEdit.name}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">{currentEdit.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors"
                >
                  Restaurar Padrão
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-violet-950 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isPending ? "Salvando..." : "Salvar Alterações"}</span>
                </button>
              </div>
            </div>

            {/* Inputs do Formulário */}
            <div className="space-y-4 text-xs">
              {/* Assunto */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Assunto da Mensagem (Subject)
                </label>
                <input
                  type="text"
                  value={currentEdit.subject}
                  onChange={(e) => handleFieldChange("subject", e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500"
                  placeholder="Assunto exibido na caixa de entrada do colaborador"
                />
              </div>

              {/* Grid 2 colunas: Título e Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">
                    Título Principal no Cabeçalho
                  </label>
                  <input
                    type="text"
                    value={currentEdit.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500"
                    placeholder="Ex: Olá, {{nome}}!"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">
                    Texto do Badge Superior
                  </label>
                  <input
                    type="text"
                    value={currentEdit.badgeText}
                    onChange={(e) => handleFieldChange("badgeText", e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500"
                    placeholder="Ex: Credenciamento Ativo"
                  />
                </div>
              </div>

              {/* Variáveis Dinâmicas Disponíveis */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-400 font-medium">
                    Variáveis Dinâmicas Disponíveis (Clique para inserir no texto)
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentEdit.availableVariables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-300 font-mono text-[11px] transition-colors"
                      title="Clique para adicionar ao corpo do texto"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corpo da Mensagem */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Corpo do E-mail (Texto principal)
                </label>
                <textarea
                  rows={4}
                  value={currentEdit.content}
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 leading-relaxed font-sans"
                  placeholder="Escreva a mensagem que o destinatário receberá..."
                />
              </div>

              {/* Grid 2 colunas: Botão CTA e Rodapé */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">
                    Texto do Botão de Ação (CTA)
                  </label>
                  <input
                    type="text"
                    value={currentEdit.buttonText}
                    onChange={(e) => handleFieldChange("buttonText", e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500"
                    placeholder="Ex: Redefinir Minha Senha"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">
                    Nota de Rodapé / Segurança
                  </label>
                  <input
                    type="text"
                    value={currentEdit.footerNote}
                    onChange={(e) => handleFieldChange("footerNote", e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500"
                    placeholder="Ex: Se não solicitou, desconsidere..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Live Preview em Tempo Real */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                <span>Visualização em Tempo Real (Live Preview com dados simulados)</span>
              </h3>
              <span className="text-[11px] text-zinc-500">Renderização Responsiva</span>
            </div>

            {/* Simulação do Cliente de E-mail */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
              {/* Barra superior de cliente de e-mail */}
              <div className="bg-zinc-900/90 border-b border-white/5 p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono text-[11px]">De:</span>
                    <span className="text-zinc-300 font-medium">treinamentos@resend.dev</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Agora</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-[11px]">Para:</span>
                  <span className="text-zinc-400">{sampleData.email}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <span className="text-zinc-500 font-mono text-[11px]">Assunto:</span>
                  <span className="text-white font-semibold truncate">
                    {interpolate(currentEdit.subject)}
                  </span>
                </div>
              </div>

              {/* Corpo renderizado do e-mail */}
              <div className="p-6 sm:p-8 bg-[#09090b] flex justify-center">
                <div className="w-full max-w-lg bg-[#121217] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  {/* Top Branding */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <span className="text-xs font-bold tracking-wider text-white uppercase">
                      ÓPTICA SRL &bull; TREINAMENTOS
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${currentBadgeStyle.bg} ${currentBadgeStyle.text} ${currentBadgeStyle.border}`}
                    >
                      {currentEdit.badgeText}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white leading-snug">
                      {interpolate(currentEdit.title)}
                    </h4>
                    <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-line">
                      {interpolate(currentEdit.content)}
                    </p>

                    <div className="pt-2">
                      <span className="inline-block bg-violet-600 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg shadow-violet-900/40">
                        {currentEdit.buttonText}
                      </span>
                    </div>

                    <p className="pt-4 border-t border-white/5 text-[11px] leading-relaxed text-zinc-500">
                      {interpolate(currentEdit.footerNote)}
                    </p>
                  </div>

                  {/* Rodapé institucional */}
                  <div className="pt-4 border-t border-white/5 text-center">
                    <p className="text-[10px] text-zinc-600">
                      Linha Gold Comfort IA &bull; Guia Smartplay &bull; Rede SRL &bull; 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
