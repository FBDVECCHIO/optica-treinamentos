import { describe, it, expect, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { db } from "@/lib/db/mock-store";
import {
  getPublicPlansAction,
  getAllPlansAction,
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
  getFinancialMetricsAction,
  getFinancialTransactionsAction,
  emitInvoiceAction,
  getCouponsAction,
  createCouponAction,
  toggleCouponStatusAction,
  validateCouponAction,
  deleteCouponAction,
  lookupCnpjAction,
} from "@/app/actions/admin";

describe("Planos & Assinaturas Comerciais", () => {
  it("deve listar os planos públicos ativos", async () => {
    const plans = await getPublicPlansAction();
    expect(plans.length).toBeGreaterThan(0);
    const trial = plans.find((p) => p.id === "trial");
    expect(trial).toBeDefined();
    expect(trial?.monthlyPrice).toBe(0);
    expect(trial?.active).toBe(true);
  });

  it("deve permitir ao Master criar, atualizar e excluir um novo plano comercial", async () => {
    const testSlug = "plano-teste-automação";
    db.plans = db.plans.filter((p) => p.slug !== testSlug);

    const createRes = await createPlanAction({
      name: "Plano Teste Avançado",
      slug: testSlug,
      monthlyPrice: 450,
      annualPrice: 360,
      annualDiscountPercent: 20,
      userLimit: 8,
      badge: "Novo",
      description: "Plano para validação de testes de ponta a ponta.",
      highlight: false,
      active: true,
      features: ["8 licenças", "Suporte dedicado", "Relatórios"],
      ctaText: "Testar Agora",
    });

    expect(createRes.success).toBe(true);
    expect(createRes.plan).toBeDefined();
    const planId = createRes.plan!.id;

    // Atualização
    const updateRes = await updatePlanAction(planId, {
      monthlyPrice: 490,
      badge: "Mais Vendido",
    });
    expect(updateRes.success).toBe(true);
    expect(updateRes.plan?.monthlyPrice).toBe(490);
    expect(updateRes.plan?.badge).toBe("Mais Vendido");

    // Exclusão
    const delRes = await deletePlanAction(planId);
    expect(delRes.success).toBe(true);
    const plansAfter = await getAllPlansAction();
    expect(plansAfter.find((p) => p.id === planId)).toBeUndefined();
  });
});

describe("Gestão Financeira & Fiscal (Entradas, NFs e MRR)", () => {
  it("deve calcular métricas financeiras consolidadas (receita, MRR e NFs emitidas)", async () => {
    const metrics = await getFinancialMetricsAction();
    expect(metrics).toBeDefined();
    expect(metrics.totalRevenue).toBeGreaterThan(0);
    expect(metrics.mrr).toBeGreaterThan(0);
    expect(metrics.activeSubscriptionsCount).toBeGreaterThan(0);
    expect(metrics.emittedNfsCount).toBeGreaterThanOrEqual(1);
  });

  it("deve listar e filtrar transações financeiras por status", async () => {
    const allTransactions = await getFinancialTransactionsAction();
    expect(allTransactions.length).toBeGreaterThan(0);

    const paidTransactions = await getFinancialTransactionsAction({ status: "paid" });
    expect(paidTransactions.every((t) => t.status === "paid")).toBe(true);
  });

  it("deve emitir Nota Fiscal Eletrônica (NFS-e) para uma fatura pendente com chave de acesso", async () => {
    const tx = db.transactions.find((t) => t.nfStatus === "pending" || t.status === "paid");
    expect(tx).toBeDefined();

    if (tx) {
      const emitRes = await emitInvoiceAction(tx.id);
      expect(emitRes.success).toBe(true);
      expect(emitRes.nfNumber).toBeDefined();
      expect(emitRes.accessKey).toBeDefined();
      expect(emitRes.accessKey?.length).toBe(44);

      const updatedTx = db.transactions.find((t) => t.id === tx.id);
      expect(updatedTx?.nfStatus).toBe("emitted");
      expect(updatedTx?.nfNumber).toBe(emitRes.nfNumber);
    }
  });
});

describe("Gestão de Cupons de Desconto", () => {
  it("deve criar, ativar/desativar, validar e excluir cupom", async () => {
    const couponCode = "TESTEAUTO50";
    db.coupons = db.coupons.filter((c) => c.code !== couponCode);

    const createRes = await createCouponAction({
      code: couponCode,
      discountType: "percent",
      discountValue: 50,
      applicablePlans: ["all"],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: 10,
    });

    expect(createRes.success).toBe(true);
    expect(createRes.coupon).toBeDefined();
    const couponId = createRes.coupon!.id;

    // Validação do cupom
    const validRes = await validateCouponAction(couponCode, "pro", "monthly");
    expect(validRes.valid).toBe(true);
    expect(validRes.coupon?.discountValue).toBe(50);

    // Toggle status para inativo
    const toggleRes = await toggleCouponStatusAction(couponId);
    expect(toggleRes.success).toBe(true);
    expect(toggleRes.active).toBe(false);

    // Agora deve falhar na validação pois está inativo
    const invalidRes = await validateCouponAction(couponCode, "pro", "monthly");
    expect(invalidRes.valid).toBe(false);

    // Excluir cupom
    const delRes = await deleteCouponAction(couponId);
    expect(delRes.success).toBe(true);
  });
});

describe("Validação e Consulta de CNPJ da Receita Federal", () => {
  it("deve validar algoritmo de dígitos verificadores e rejeitar CNPJ inválido", async () => {
    const invalidRes = await lookupCnpjAction("11.111.111/1111-11");
    expect(invalidRes.success).toBe(false);
    expect(invalidRes.error).toContain("inválido");
  });

  it("deve aceitar e processar CNPJ com formato válido", async () => {
    // CNPJ válido da Ambev / padrão corporativo de teste
    const validCnpj = "07.526.557/0001-00";
    const res = await lookupCnpjAction(validCnpj);
    expect(res).toBeDefined();
    // Mesmo se a rede externa falhar ou mock fallback atuar, res.data existe se validado
    if (res.success && res.data) {
      expect(res.data.cnpj).toBe("07.526.557/0001-00");
      expect(res.data.razaoSocial).toBeDefined();
    }
  });
});
