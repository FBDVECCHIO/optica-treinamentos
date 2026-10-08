import { describe, it, expect } from "vitest";
import {
  canAccessAdmin,
  canManageRoles,
  canViewAuditLogs,
  canManagePlans,
  canViewFinance,
} from "../lib/auth/rbac";

describe("Controle de Acesso Baseado em Papéis (RBAC)", () => {
  it("deve permitir acesso administrativo para master e manager, mas bloquear student", () => {
    expect(canAccessAdmin("master")).toBe(true);
    expect(canAccessAdmin("manager")).toBe(true);
    expect(canAccessAdmin("student")).toBe(false);
    expect(canAccessAdmin(undefined)).toBe(false);
  });

  it("deve reservar gestão de cargos e logs de auditoria exclusivamente para o Master", () => {
    expect(canManageRoles("master")).toBe(true);
    expect(canManageRoles("manager")).toBe(false);
    expect(canViewAuditLogs("master")).toBe(true);
    expect(canViewAuditLogs("manager")).toBe(false);
    expect(canManagePlans("master")).toBe(true);
    expect(canManagePlans("manager")).toBe(false);
    expect(canViewFinance("master")).toBe(true);
    expect(canViewFinance("manager")).toBe(false);
  });
});
