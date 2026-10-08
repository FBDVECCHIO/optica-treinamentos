"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Glasses,
  CheckCircle2,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Gift,
} from "lucide-react";
import { subscribeStoreAction } from "@/app/actions/auth";
import { maskCNPJ, maskPhone } from "@/lib/utils/masks";

const PLANS = [
  {
    id: "trial",
    name: "Degustação Gratuita (Trial 15 dias)",
    price: 0,
    period: "15 dias grátis",
    userLimit: 5,
    badge: "Sem Cartão de Crédito",
    highlight: true,
    description: "Ideal para testar na prática com sua equipe de balcão.",
    features: [
      "Até 5 colaboradores inclusos",
      "Acesso completo aos cursos oficiais",
      "Emissão de certificados com selo SRL",
      "Suporte via WhatsApp",
    ],
  },
  {
    id: "essencial",
    name: "Essencial Balcão (5 Licenças)",
    price: 390,
    period: "/mês",
    userLimit: 5,
    badge: "1 Loja Individual",
    highlight: false,
    description: "Para óticas de rua com equipe enxuta e foco em vendas.",
    features: [
      "Até 5 colaboradores simultâneos",
      "Quizzes avaliativos e ranking interno",
      "Link de convite direto por WhatsApp",
      "Cobrança mensal com cancelamento livre",
    ],
  },
  {
    id: "pro",
    name: "Performance Pro (15 Licenças)",
    price: 790,
    period: "/mês",
    userLimit: 15,
    badge: "Mais Escolhido",
    highlight: false,
    description: "Para lojas de shopping ou equipes comerciais robustas.",
    features: [
      "Até 15 colaboradores simultâneos",
      "Personalização de certificados com logo da loja",
      "Relatórios de auditoria e avanço por módulo",
      "Cobrança de alunos com 1 clique no WhatsApp",
    ],
  },
  {
    id: "master",
    name: "Rede Master Expansão (50 Licenças)",
    price: 1490,
    period: "/mês",
    userLimit: 50,
    badge: "Redes e Franquias",
    highlight: false,
    description: "Para redes de óticas que necessitam de consolidação de filiais.",
    features: [
      "Até 50 colaboradores em múltiplas filiais",
      "Gestão de matriz e filiais centralizada",
      "Treinamentos exclusivos customizados",
      "Gerente de conta e suporte prioritário",
    ],
  },
];

export default function ContratarPlanoPage() {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState("trial");

  // Dados da Empresa
  const [storeName, setStoreName] = useState("");
  const [storeCnpj, setStoreCnpj] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  // Dados do Gestor
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!storeName.trim() || !storeCnpj.trim() || !storePhone.trim() || !managerName.trim() || !managerEmail.trim() || !managerPassword) {
      setFormError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (managerPassword.length < 6) {
      setFormError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await subscribeStoreAction({
        storeName,
        storeCnpj,
        storePhone,
        storeAddress,
        managerName,
        managerEmail,
        managerPassword,
        planName: selectedPlan.name,
        userLimit: selectedPlan.userLimit,
        monthlyValue: selectedPlan.price,
        billingCycle: "monthly",
      });

      if (!res.success) {
        setFormError(res.error || "Falha ao processar contratação.");
      } else {
        router.push(res.redirectUrl || "/admin/users");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg block leading-tight">ÓPTICA TRAINING</span>
            <span className="text-xs text-zinc-400">Capacitação Profissional SRL &bull; Contratação B2B</span>
          </div>
        </div>

        <Link
          href="/sign-in"
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Já possui contrato? <strong className="text-violet-400 underline">Fazer Login</strong>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-8 space-y-8 flex-1">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ativação Imediata da Sua Óptica</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Escolha o Plano e Ative sua Unidade
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Comece com 15 dias de degustação gratuita sem compromisso ou contrate o plano ideal para a sua equipe.
          </p>
        </div>

        {/* Grade de Seleção de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? "bg-violet-600/15 border-violet-500 shadow-xl shadow-violet-950/50 scale-[1.02]"
                    : "bg-zinc-900/50 border-white/5 hover:border-white/20 text-zinc-300"
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500 text-white shadow">
                    SELECIONADO
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                      {plan.badge}
                    </span>
                    <Users className="w-4 h-4 text-violet-400" />
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{plan.name}</h3>
                  <p className="text-[11px] text-zinc-400 mb-3">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-2xl font-black">
                        {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
                      </span>
                      <span className="text-xs text-zinc-400 font-normal">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 border-t border-white/5 pt-3 mb-4">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="text-[11px] text-zinc-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-violet-600 text-white"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300"
                  }`}
                >
                  {isSelected ? "Plano Selecionado" : "Escolher Este"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Formulário de Cadastro da Óptica e do Gestor */}
        <div className="max-w-3xl mx-auto rounded-3xl bg-zinc-900/70 border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-400" />
                <span>Dados da Óptica Contratante & Gestor Responsável</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Plano selecionado: <strong className="text-white">{selectedPlan.name}</strong> ({selectedPlan.price === 0 ? "Degustação Gratuita" : `R$ ${selectedPlan.price}/mês`})
              </p>
            </div>
            {selectedPlan.price === 0 && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <Gift className="w-3.5 h-3.5" />
                <span>Sem Cartão de Crédito</span>
              </span>
            )}
          </div>

          {formError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção 1: Dados da Empresa */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                1. Informações da Óptica / Empresa
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">Nome da Ótica / Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Óptica Central da Visão"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">CNPJ da Ótica *</label>
                  <input
                    type="text"
                    required
                    value={storeCnpj}
                    onChange={(e) => setStoreCnpj(maskCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">WhatsApp / Telefone da Loja *</label>
                  <input
                    type="text"
                    required
                    value={storePhone}
                    onChange={(e) => setStorePhone(maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">Endereço da Unidade (Cidade/UF) *</label>
                  <input
                    type="text"
                    required
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Ex: Av. Paulista, 1000 - São Paulo - SP"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Dados do Gestor */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                2. Conta do Gestor Responsável (Dono ou Gerente)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">Nome Completo do Gestor *</label>
                  <input
                    type="text"
                    required
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Ex: Roberto Silva"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">E-mail de Acesso do Gestor *</label>
                  <input
                    type="email"
                    required
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    placeholder="gerente@optica.com.br"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">Crie sua Senha de Acesso *</label>
                <input
                  type="password"
                  required
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Botão de Finalização */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-6 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-violet-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {selectedPlan.price === 0
                        ? "Ativar Degustação Gratuita (15 Dias) & Acessar Painel"
                        : `Confirmar Adesão ao Plano ${selectedPlan.name}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2 text-center sm:text-left">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Dados protegidos por criptografia e conformidade LGPD</span>
              </div>
              <span>Liberação imediata do link de convite da sua equipe</span>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center text-xs text-zinc-600 pt-6 border-t border-white/5">
        SRL Ópticas &bull; Treinamentos Linha Gold Comfort e Smartplay &bull; 2026
      </footer>
    </div>
  );
}
