"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Sparkles,
  Users,
  Check,
  AlertTriangle,
  ArrowRight,
  Eye,
  Percent,
  X,
  Layers,
} from "lucide-react";
import {
  getAllPlansAction,
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
} from "@/app/actions/admin";
import { Plan } from "@/types/database";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Formulário
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState(390);
  const [annualDiscountPercent, setAnnualDiscountPercent] = useState(20);
  const [userLimit, setUserLimit] = useState(5);
  const [badge, setBadge] = useState("Mais Escolhido");
  const [description, setDescription] = useState("");
  const [highlight, setHighlight] = useState(false);
  const [active, setActive] = useState(true);
  const [featuresText, setFeaturesText] = useState("");
  const [ctaText, setCtaText] = useState("Contratar Agora");

  const loadPlans = async () => {
    setLoading(true);
    const data = await getAllPlansAction();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlanId(null);
    setName("");
    setSlug("");
    setMonthlyPrice(390);
    setAnnualDiscountPercent(20);
    setUserLimit(5);
    setBadge("1 Loja Individual");
    setDescription("Plano sob medida para equipes de atendimento e balcão.");
    setHighlight(false);
    setActive(true);
    setFeaturesText(
      "Até 5 colaboradores simultâneos\nQuizzes avaliativos e ranking\nLink de convite direto por WhatsApp\nCancelamento livre"
    );
    setCtaText("Contratar Plano");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setName(plan.name);
    setSlug(plan.slug);
    setMonthlyPrice(plan.monthlyPrice);
    setAnnualDiscountPercent(plan.annualDiscountPercent || 20);
    setUserLimit(plan.userLimit);
    setBadge(plan.badge);
    setDescription(plan.description);
    setHighlight(plan.highlight);
    setActive(plan.active);
    setFeaturesText(plan.features.join("\n"));
    setCtaText(plan.ctaText || "Contratar Agora");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    // Cálculo do valor com desconto anual
    const calculatedAnnualPrice = Math.round(
      monthlyPrice * (1 - (annualDiscountPercent || 0) / 100)
    );

    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      monthlyPrice: Number(monthlyPrice),
      annualPrice: calculatedAnnualPrice,
      annualDiscountPercent: Number(annualDiscountPercent),
      userLimit: Number(userLimit),
      badge: badge.trim(),
      description: description.trim(),
      highlight,
      active,
      features,
      ctaText: ctaText.trim() || "Contratar Agora",
    };

    if (editingPlanId) {
      const res = await updatePlanAction(editingPlanId, payload);
      if (res.success) {
        setFeedback({ message: "Plano comercial atualizado com sucesso!", type: "success" });
      } else {
        setFeedback({ message: res.error || "Erro ao atualizar plano.", type: "error" });
      }
    } else {
      const res = await createPlanAction(payload);
      if (res.success) {
        setFeedback({ message: "Novo plano cadastrado e refletido no site!", type: "success" });
      } else {
        setFeedback({ message: res.error || "Erro ao criar plano.", type: "error" });
      }
    }

    setIsSaving(false);
    setIsModalOpen(false);
    loadPlans();
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = async (id: string, planName: string) => {
    if (!confirm(`Confirma a exclusão do plano "${planName}"? Ele deixará de ser ofertado no site principal.`)) return;

    const res = await deletePlanAction(id);
    if (res.success) {
      setFeedback({ message: `Plano "${planName}" excluído.`, type: "success" });
      loadPlans();
    } else {
      setFeedback({ message: res.error || "Erro ao excluir.", type: "error" });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Administração SaaS &bull; Catálogo Comercial de Planos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Planos Comerciais & Assinaturas
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Configure os planos de contratação, limites de licenças, preços mensais e descontos anuais.
            Todas as alterações realizadas aqui são refletidas imediatamente na página principal e no checkout.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-950 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Plano</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grade de Planos Atuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
              plan.highlight
                ? "bg-violet-600/10 border-violet-500/60 shadow-xl shadow-violet-950/40"
                : "bg-zinc-900/60 border-white/10"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                  {plan.badge || "Plano"}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    plan.active
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-zinc-700/40 text-zinc-400 border border-zinc-600/40"
                  }`}
                >
                  {plan.active ? "Visível no Site" : "Inativo"}
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-1">{plan.name}</h2>
              <p className="text-[11px] text-zinc-400 mb-4 line-clamp-2">{plan.description}</p>

              <div className="mb-4 p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-2xl font-black">
                    {plan.monthlyPrice === 0 ? "Grátis" : `R$ ${plan.monthlyPrice}`}
                  </span>
                  <span className="text-xs text-zinc-400">/mês</span>
                </div>

                {plan.annualDiscountPercent > 0 && plan.monthlyPrice > 0 && (
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>
                      R$ {plan.annualPrice}/mês no anual ({plan.annualDiscountPercent}% off)
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-violet-400 font-medium mt-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Até {plan.userLimit} colaboradores</span>
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

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(plan)}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(plan.id, plan.name)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                title="Excluir Plano"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE PLANO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span>{editingPlanId ? "Editar Plano Comercial" : "Novo Plano Comercial"}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Defina os parâmetros que serão exibidos na página principal e no checkout.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Nome do Plano *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Performance Pro"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Etiqueta / Badge *</label>
                  <input
                    type="text"
                    required
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: Mais Escolhido"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">Descrição Resumida</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Para lojas de shopping ou equipes comerciais robustas..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Desconto Plano Anual (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={annualDiscountPercent}
                    onChange={(e) => setAnnualDiscountPercent(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Limite de Usuários (Vagas)</label>
                  <input
                    type="number"
                    min="1"
                    value={userLimit}
                    onChange={(e) => setUserLimit(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">
                  Recursos Inclusos (1 por linha)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Até 15 colaboradores simultâneos&#10;Certificados com logotipo da sua loja&#10;Cobrança direta via WhatsApp"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkHighlight"
                    checked={highlight}
                    onChange={(e) => setHighlight(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 cursor-pointer"
                  />
                  <label htmlFor="chkHighlight" className="text-zinc-300 font-medium cursor-pointer">
                    Cartão em Destaque (Borda Neon)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkActive"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 cursor-pointer"
                  />
                  <label htmlFor="chkActive" className="text-zinc-300 font-medium cursor-pointer">
                    Ativo para Contratação
                  </label>
                </div>

                <div>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Texto do Botão: Contratar"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-violet-950 cursor-pointer"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Salvar Alterações do Plano</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
