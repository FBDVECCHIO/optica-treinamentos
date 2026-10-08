"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  Check,
  Clock,
  Search,
  Filter,
  Plus,
  Tag,
  Percent,
  CreditCard,
  QrCode,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  X,
  RefreshCw,
  Power,
  Trash2,
} from "lucide-react";
import {
  getFinancialMetricsAction,
  getFinancialTransactionsAction,
  emitInvoiceAction,
  getCouponsAction,
  createCouponAction,
  toggleCouponStatusAction,
  deleteCouponAction,
  lookupCnpjAction,
} from "@/app/actions/admin";
import { FinancialTransaction, Coupon, CnpjLookupResult } from "@/types/database";
import { maskCNPJ } from "@/lib/utils/masks";

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "coupons" | "cnpj">("invoices");

  // Métricas
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    mrr: 0,
    activeSubscriptionsCount: 0,
    pendingDueCount: 0,
    emittedNfsCount: 0,
  });

  // Transações / Faturamento
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCycle, setSelectedCycle] = useState("all");

  // Cupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponValue, setCouponValue] = useState(15);
  const [couponPlan, setCouponPlan] = useState("all");
  const [couponValidUntil, setCouponValidUntil] = useState("2026-12-31");
  const [couponMaxUses, setCouponMaxUses] = useState(100);

  // Consulta de CNPJ
  const [lookupInput, setLookupInput] = useState("");
  const [cnpjResult, setCnpjResult] = useState<CnpjLookupResult | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadAll = () => {
    startTransition(async () => {
      const [m, t, c] = await Promise.all([
        getFinancialMetricsAction(),
        getFinancialTransactionsAction({
          search,
          status: selectedStatus,
          billingCycle: selectedCycle,
        }),
        getCouponsAction(),
      ]);
      setMetrics(m);
      setTransactions(t);
      setCoupons(c);
    });
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedStatus, selectedCycle]);

  const handleEmitNf = async (txId: string) => {
    const res = await emitInvoiceAction(txId);
    if (res.success && res.transaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? res.transaction! : t))
      );
      setMetrics((m) => ({ ...m, emittedNfsCount: m.emittedNfsCount + 1 }));
      setFeedback({
        message: `Nota Fiscal ${res.transaction.nfNumber} emitida com sucesso!`,
        type: "success",
      });
    } else {
      setFeedback({ message: res.error || "Erro ao emitir NF.", type: "error" });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = await createCouponAction({
      code: couponCode,
      discountType: couponType,
      discountValue: Number(couponValue),
      applicablePlans: [couponPlan],
      validUntil: new Date(`${couponValidUntil}T23:59:59Z`).toISOString(),
      maxUses: Number(couponMaxUses),
      active: true,
    });

    if (res.success && res.coupon) {
      setCoupons((prev) => [res.coupon!, ...prev]);
      setIsCouponModalOpen(false);
      setFeedback({ message: `Cupom ${res.coupon.code} criado com sucesso!`, type: "success" });
    } else {
      setFeedback({ message: res.error || "Erro ao criar cupom.", type: "error" });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleCoupon = async (id: string) => {
    const res = await toggleCouponStatusAction(id);
    if (res.success) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: res.active! } : c))
      );
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Deseja realmente remover este cupom de desconto?")) return;
    const res = await deleteCouponAction(id);
    if (res.success) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleLookupCnpj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    setCnpjLoading(true);
    setCnpjError(null);
    setCnpjResult(null);

    const res = await lookupCnpjAction(lookupInput);
    setCnpjLoading(false);
    if (res.success && res.data) {
      setCnpjResult(res.data);
    } else {
      setCnpjError(res.error || "Não foi possível consultar este CNPJ.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Administração Financeira &bull; Fiscal & Entradas B2B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fiscal & Entradas de Assinaturas
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Acompanhe em tempo real as entradas de contratantes (Stripe, Pix e Boletos), emita Notas Fiscais
            de Serviço (NFS-e), gerencie cupons promocionais e valide CNPJs para faturamento automático.
          </p>
        </div>
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

      {/* Grid de Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Receita Total Realizada */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Faturamento Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            R$ {metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-500">Total pago por óticas clientes</p>
        </div>

        {/* MRR Mensalidade Recorrente */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>MRR Recorrente</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-violet-400">
            R$ {metrics.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-zinc-500">Receita mensal estimada</p>
        </div>

        {/* Assinaturas Ativas */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Lojas Ativas</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.activeSubscriptionsCount}</div>
          <p className="text-[10px] text-zinc-500">Contratos vigentes no ar</p>
        </div>

        {/* Vencimentos Próximos */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>A Vencer (15 dias)</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{metrics.pendingDueCount}</div>
          <p className="text-[10px] text-zinc-500">Faturas aguardando liquidação</p>
        </div>

        {/* NFS-e Emitidas */}
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>NFS-e Emitidas</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.emittedNfsCount}</div>
          <p className="text-[10px] text-zinc-500">Notas com chave na SEFAZ</p>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex border-b border-white/10 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === "invoices" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>1. Entradas, Assinaturas & Notas Fiscais ({transactions.length})</span>
          {activeTab === "invoices" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === "coupons" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>2. Cupons de Desconto & Benefícios ({coupons.length})</span>
          {activeTab === "coupons" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("cnpj")}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === "cnpj" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>3. Validador de CNPJ & Emissão Automática</span>
          {activeTab === "cnpj" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ABA 1: TRANSAÇÕES, VENCIMENTOS E NOTAS FISCAIS */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por Ótica, CNPJ ou NF..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-black/40 border border-white/10 text-xs text-white rounded-2xl px-3 py-2.5 focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="paid">Faturas Pagas</option>
                <option value="pending">Aguardando Pagamento</option>
              </select>

              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="bg-black/40 border border-white/10 text-xs text-white rounded-2xl px-3 py-2.5 focus:outline-none"
              >
                <option value="all">Todos os Ciclos</option>
                <option value="monthly">Mensalidades</option>
                <option value="annual">Planos Anuais</option>
              </select>
            </div>
          </div>

          {/* Tabela de Transações */}
          <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Ótica / CNPJ</th>
                    <th className="p-4">Plano & Ciclo</th>
                    <th className="p-4">Valor Faturado</th>
                    <th className="p-4">Forma de Pagamento</th>
                    <th className="p-4">Vencimento / Liquidação</th>
                    <th className="p-4">Status da NFS-e</th>
                    <th className="p-4 pr-6 text-right">Ações Fiscais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-white uppercase">{tx.storeName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{tx.storeCnpj}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-white">{tx.planName}</div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/5 border border-white/10 text-violet-300 mt-0.5">
                          {tx.billingCycle === "annual" ? "Contrato Anual (20% off)" : "Recorrente Mensal"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white text-sm">
                          R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        {tx.discountApplied > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            Cupom {tx.couponCode}: -R$ {tx.discountApplied.toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-white">
                          {tx.paymentMethod === "credit_card" && <CreditCard className="w-3.5 h-3.5 text-violet-400" />}
                          {tx.paymentMethod === "pix" && <QrCode className="w-3.5 h-3.5 text-emerald-400" />}
                          {tx.paymentMethod === "boleto" && <FileText className="w-3.5 h-3.5 text-amber-400" />}
                          <span>
                            {tx.paymentMethod === "credit_card" ? "Cartão de Crédito" : tx.paymentMethod === "pix" ? "PIX Instantâneo" : "Boleto Bancário"}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase">Via {tx.paymentGateway}</span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-white">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{new Date(tx.dueDate).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <span
                          className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                            tx.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {tx.status === "paid" ? "Liquidado" : "Aguardando Pagamento"}
                        </span>
                      </td>

                      <td className="p-4">
                        {tx.nfStatus === "emitted" ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{tx.nfNumber || "Emitida"}</span>
                            </span>
                            {tx.nfKey && (
                              <div className="text-[9px] font-mono text-zinc-500 truncate max-w-[140px]" title={tx.nfKey}>
                                Chave: {tx.nfKey.slice(0, 16)}...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-white/10">
                            <Clock className="w-3 h-3" />
                            <span>Pendente Emissão</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 pr-6 text-right">
                        {tx.nfStatus === "emitted" ? (
                          <a
                            href={tx.nfUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Ver Espelho</span>
                          </a>
                        ) : tx.status === "paid" ? (
                          <button
                            type="button"
                            onClick={() => handleEmitNf(tx.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-md shadow-emerald-950 transition-all cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Emitir NFS-e</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">Aguardando liquidação</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-500">
                        Nenhuma transação localizada com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CUPONS DE DESCONTO & BENEFÍCIOS */}
      {activeTab === "coupons" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Cupons de Desconto & Benefícios Comerciais</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Crie códigos promocionais para feiras, parcerias com distribuidoras ou incentivos de fechamento.
              </p>
            </div>

            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-950 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Cupom</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-violet-400 px-2.5 py-1 rounded-xl bg-violet-600/10 border border-violet-500/20">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(coupon.id)}
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors ${
                        coupon.active
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-white/10"
                      }`}
                    >
                      {coupon.active ? "Ativo" : "Pausado"}
                    </button>
                  </div>

                  <div className="text-xl font-black text-white">
                    {coupon.discountType === "percent" ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue} OFF`}
                  </div>

                  <div className="text-xs text-zinc-400 mt-1">
                    Válido para: <strong className="text-zinc-200 uppercase">{coupon.applicablePlans.join(", ")}</strong>
                  </div>

                  <div className="mt-3 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Usos: {coupon.usedCount} de {coupon.maxUses}</span>
                    <span>Expira em: {new Date(coupon.validUntil).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Excluir Cupom"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: VALIDADOR DE CNPJ & AUTOMAÇÃO FISCAL */}
      {activeTab === "cnpj" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Validador de CNPJ & Conexão com a Receita Federal</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Teste a consulta automática de CNPJ que valida a aptidão cadastral da ótica no momento do checkout e automatiza a emissão de Notas Fiscais.
            </p>
          </div>

          <form onSubmit={handleLookupCnpj} className="flex gap-2">
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(maskCNPJ(e.target.value))}
              placeholder="Digite o CNPJ da óptica (ex: 12.345.678/0001-95)..."
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
            />
            <button
              type="submit"
              disabled={cnpjLoading}
              className="px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-950 transition-all shrink-0"
            >
              {cnpjLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Consultar Cadastro</span>
                </>
              )}
            </button>
          </form>

          {cnpjError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cnpjError}</span>
            </div>
          )}

          {cnpjResult && (
            <div className="p-6 rounded-3xl bg-zinc-900/70 border border-emerald-500/30 space-y-4 backdrop-blur-xl animate-element">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">CNPJ Consultado</span>
                  <div className="font-mono font-bold text-white text-sm">{cnpjResult.cnpj}</div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{cnpjResult.situacao} NA RECEITA FEDERAL</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Razão Social Oficial</span>
                  <strong className="text-white block mt-0.5">{cnpjResult.razaoSocial}</strong>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[11px]">Nome Fantasia</span>
                  <strong className="text-white block mt-0.5">{cnpjResult.nomeFantasia || "Não informado"}</strong>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block text-[11px]">Endereço Fiscal Cadastrado</span>
                  <strong className="text-zinc-200 block mt-0.5">
                    {cnpjResult.endereco.logradouro}, {cnpjResult.endereco.numero} - {cnpjResult.endereco.bairro}, {cnpjResult.endereco.municipio} - {cnpjResult.endereco.uf}
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Empresa válida e apta para faturamento de mensalidade SaaS e emissão automática de NFS-e no fechamento do contrato.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO DE CUPOM */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-violet-400" />
                <span>Novo Cupom de Desconto</span>
              </h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-medium">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: PROMO2026"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Tipo</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Desconto</label>
                  <input
                    type="number"
                    min="1"
                    value={couponValue}
                    onChange={(e) => setCouponValue(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Limite de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={couponMaxUses}
                    onChange={(e) => setCouponMaxUses(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Validade</label>
                  <input
                    type="date"
                    value={couponValidUntil}
                    onChange={(e) => setCouponValidUntil(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold cursor-pointer"
                >
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
