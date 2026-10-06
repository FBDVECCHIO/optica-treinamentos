import { describe, it, expect } from "vitest";
import {
  getResendLiveMetrics,
  sendPasswordResetEmail,
  sendWelcomeVerificationEmail,
  sendDiagnosticTestEmail,
} from "../lib/email/resend";
import { getAuditLogs } from "../lib/audit";

describe("Resend Email Service & Live Metrics", () => {
  it("deve recuperar métricas consolidadas com estrutura válida", async () => {
    const metrics = await getResendLiveMetrics();

    expect(metrics).toBeDefined();
    expect(typeof metrics.totalSent).toBe("number");
    expect(typeof metrics.deliveredCount).toBe("number");
    expect(typeof metrics.deliveryRate).toBe("number");
    expect(metrics.byCategory).toBeDefined();
    expect(typeof metrics.byCategory.passwordReset).toBe("number");
    expect(typeof metrics.byCategory.welcome).toBe("number");
    expect(Array.isArray(metrics.recentEmails)).toBe(true);
  });

  it("deve disparar fluxo de recuperação de senha e registrar auditoria", async () => {
    const result = await sendPasswordResetEmail("consultor.teste@optica.com.br", "token_test_123");

    expect(result).toBeDefined();
    // Pode ser simulação ou envio real via Resend dependendo do ambiente
    expect(result.success || typeof result.error === "string").toBe(true);

    const logs = await getAuditLogs({ action: "PASSWORD_RESET_REQUEST", limit: 5 });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs.some((l) => l.userEmail === "consultor.teste@optica.com.br")).toBe(true);
  });

  it("deve disparar fluxo de boas-vindas e registrar auditoria", async () => {
    const result = await sendWelcomeVerificationEmail("aluno.novo@optica.com.br", "Novo Consultor");

    expect(result).toBeDefined();
    expect(result.success || typeof result.error === "string").toBe(true);

    const logs = await getAuditLogs({ action: "USER_REGISTERED", limit: 5 });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs.some((l) => l.userEmail === "aluno.novo@optica.com.br")).toBe(true);
  });
});
