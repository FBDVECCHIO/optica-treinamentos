import { describe, it, expect } from "vitest";
import { logAudit, getAuditLogs } from "../lib/audit";

describe("Audit Logging System", () => {
  it("deve registrar evento de auditoria com metadados e permitir consulta", async () => {
    const entry = await logAudit({
      action: "LOGIN_SUCCESS",
      userId: "usr_test_123",
      userEmail: "TESTE@OPTICA.COM.BR",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0 Vitest Test",
      metadata: { role: "CONSULTOR ÓPTICO" },
    });

    expect(entry).toBeDefined();
    expect(entry.id).toMatch(/^log_/);
    expect(entry.action).toBe("LOGIN_SUCCESS");
    expect(entry.userEmail).toBe("TESTE@OPTICA.COM.BR");

    const logs = await getAuditLogs({ action: "LOGIN_SUCCESS", limit: 5 });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs.some((l) => l.id === entry.id)).toBe(true);
  });
});
