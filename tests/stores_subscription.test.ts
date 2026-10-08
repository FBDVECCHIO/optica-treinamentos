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
  getStoresWithStatsAction,
  createStoreAction,
  updateStoreAction,
  toggleStoreStatusAction,
  deleteStoreAction,
} from "@/app/actions/admin";
import { loginAction, registerAction } from "@/app/actions/auth";

describe("Governança de Lojas, Planos e Cotas de Licenças (Multi-Tenancy)", () => {
  it("deve listar as lojas do sistema com estatísticas calculadas de ocupação", async () => {
    const stores = await getStoresWithStatsAction();
    expect(stores.length).toBeGreaterThan(0);

    const matriz = stores.find((s) => s.id === "store_matriz");
    expect(matriz).toBeDefined();
    expect(matriz?.name).toBe("ÓPTICA SRL - MATRIZ SÃO PAULO");
    expect(matriz?.subscriptionStatus).toBe("active");
    expect(matriz?.userLimit).toBe(50);
    expect(matriz?.activeUsersCount).toBeGreaterThanOrEqual(1);
    expect(matriz?.availableSeats).toBeDefined();
    expect(matriz?.usagePercent).toBeDefined();
  });

  it("deve cadastrar uma nova unidade com plano e cotas customizadas", async () => {
    const testCnpj = "99.888.777/0001-99";
    db.stores = db.stores.filter((s) => s.cnpj !== testCnpj);

    const res = await createStoreAction({
      name: "Ótica Teste Automação Express",
      cnpj: testCnpj,
      address: "Rua das Lentes, 123 - Curitiba/PR",
      phone: "(41) 99999-8888",
      planName: "Performance Pro (15 Licenças)",
      subscriptionStatus: "active",
      userLimit: 15,
      monthlyValue: 690,
      billingCycle: "monthly",
      notes: "Unidade franqueada de testes automatizados.",
    });

    expect(res.success).toBe(true);
    expect(res.store).toBeDefined();
    expect(res.store?.userLimit).toBe(15);
    expect(res.store?.subscriptionStatus).toBe("active");
  });

  it("deve suspender e reativar a assinatura de uma unidade", async () => {
    const testStore = db.stores.find((s) => s.cnpj === "99.888.777/0001-99");
    expect(testStore).toBeDefined();

    // Suspender
    const suspendRes = await toggleStoreStatusAction(testStore!.id, "suspended");
    expect(suspendRes.success).toBe(true);

    let updatedStore = db.stores.find((s) => s.id === testStore!.id);
    expect(updatedStore?.subscriptionStatus).toBe("suspended");
    expect(updatedStore?.active).toBe(false);

    // Reativar
    const reactivateRes = await toggleStoreStatusAction(testStore!.id, "active");
    expect(reactivateRes.success).toBe(true);

    updatedStore = db.stores.find((s) => s.id === testStore!.id);
    expect(updatedStore?.subscriptionStatus).toBe("active");
    expect(updatedStore?.active).toBe(true);
  });

  it("deve impedir exclusão de loja caso existam colaboradores associados", async () => {
    const res = await deleteStoreAction("store_matriz");
    expect(res.success).toBe(false);
    expect(res.error).toContain("colaborador(es) vinculado(s)");
  });

  it("deve permitir a exclusão de uma loja sem colaboradores vinculados", async () => {
    const testStore = db.stores.find((s) => s.cnpj === "99.888.777/0001-99");
    expect(testStore).toBeDefined();

    const res = await deleteStoreAction(testStore!.id);
    expect(res.success).toBe(true);
    expect(db.stores.some((s) => s.id === testStore!.id)).toBe(false);
  });

  it("deve impedir login de colaborador caso a loja esteja com status suspensa", async () => {
    const suspendedStore = db.stores.find((s) => s.id === "store_bh");
    expect(suspendedStore).toBeDefined();
    expect(suspendedStore?.subscriptionStatus).toBe("suspended");

    const suspendedEmail = "colaborador.savassi@teste.com";
    db.profiles = db.profiles.filter((p) => p.email !== suspendedEmail);
    db.profiles.push({
      id: "usr_suspended_test",
      name: "Vendedor Savassi",
      email: suspendedEmail,
      cpf: "111.222.333-44",
      phone: "31999990000",
      storeId: "store_bh",
      storeName: suspendedStore!.name,
      accessLevel: "student",
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.userCredentials[suspendedEmail] = "SenhaForte123!";

    const form = new FormData();
    form.append("email", suspendedEmail);
    form.append("password", "SenhaForte123!");

    const loginRes = await loginAction(form);

    expect(loginRes.success).toBe(false);
    expect(loginRes.error).toContain("temporariamente suspenso");
  });

  it("deve sempre permitir acesso do Administrador Master mesmo se houver restrições de loja", async () => {
    const form = new FormData();
    form.append("email", "fbdv1202@gmail.com");
    form.append("password", "@180414Fs");

    const loginRes = await loginAction(form);

    expect(loginRes.success).toBe(true);
  });

  it("deve impedir cadastro de novos colaboradores se a cota (seatLimit) for atingida", async () => {
    const cappedCnpj = "77.777.777/0001-77";
    db.stores = db.stores.filter((s) => s.cnpj !== cappedCnpj);
    db.stores.push({
      id: "store_capped_test",
      name: "ÓTICA COTA LIMITADA",
      cnpj: cappedCnpj,
      active: true,
      subscriptionStatus: "active",
      planName: "Teste Cota 1",
      userLimit: 1,
      createdAt: new Date().toISOString(),
    });

    db.profiles = db.profiles.filter((p) => p.email !== "ocupante@teste.com");
    db.profiles.push({
      id: "usr_occupying_seat",
      name: "Ocupante Cota",
      email: "ocupante@teste.com",
      cpf: "000.111.222-33",
      phone: "11999998888",
      storeId: "store_capped_test",
      storeName: "ÓTICA COTA LIMITADA",
      accessLevel: "student",
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const registerRes = await registerAction({
      name: "Segundo Vendedor",
      email: "segundo.vendedor@teste.com",
      cpf: "444.555.666-77",
      whatsapp: "11988887777",
      password: "SenhaSegura123!",
      storeCnpj: cappedCnpj,
      storeName: "Ótica Cota Limitada",
      address: "Rua Teste, 1",
      roleId: "role_consultor",
    });

    expect(registerRes.success).toBe(false);
    expect(registerRes.error).toContain("atingiu a cota máxima de 1 colaboradores");

    // Limpeza
    db.stores = db.stores.filter((s) => s.id !== "store_capped_test");
    db.profiles = db.profiles.filter((p) => p.storeId !== "store_capped_test");
  });
});
