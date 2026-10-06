import { describe, it, expect } from "vitest";
import {
  DEFAULT_EMAIL_TEMPLATES,
  getAllEmailTemplates,
  getEmailTemplateByKey,
  updateEmailTemplate,
  renderEmailTemplate,
} from "@/lib/email/templates";

describe("Gestão de Templates de E-mail (Resend Engine)", () => {
  it("deve carregar a lista de templates padrão com os 5 eventos do sistema", () => {
    const list = getAllEmailTemplates();
    expect(list.length).toBeGreaterThanOrEqual(5);

    const keys = list.map((t) => t.key);
    expect(keys).toContain("welcome");
    expect(keys).toContain("password_reset");
    expect(keys).toContain("password_changed");
    expect(keys).toContain("certificate");
    expect(keys).toContain("admin_reset");
  });

  it("deve recuperar template por chave específica", () => {
    const resetTpl = getEmailTemplateByKey("password_reset");
    expect(resetTpl).toBeDefined();
    expect(resetTpl.subject).toContain("Redefinição de Senha");
    expect(resetTpl.availableVariables).toContain("{{link}}");
  });

  it("deve interpolar variáveis dinâmicas no HTML e no Subject do e-mail", () => {
    const welcomeTpl = getEmailTemplateByKey("welcome");
    const { subject, html } = renderEmailTemplate(welcomeTpl, {
      nome: "Carlos Eduardo",
      loja: "Óptica Central SRL",
      link: "https://optica-treinamentos.vercel.app/dashboard",
    });

    expect(html).toContain("Olá, Carlos Eduardo!");
    expect(html).toContain("Óptica Central SRL");
    expect(html).toContain("https://optica-treinamentos.vercel.app/dashboard");
    expect(html).toContain("ÓPTICA SRL &bull; TREINAMENTOS");
    expect(subject).toBe(welcomeTpl.subject);
  });

  it("deve atualizar um template de e-mail e refletir na listagem", () => {
    const tpl = getEmailTemplateByKey("admin_reset");
    const customSubject = "Urgente: Redefina sua senha da Óptica SRL";

    const updated = updateEmailTemplate(tpl.id, {
      subject: customSubject,
      buttonText: "Acessar Agora Imediatamente",
    });

    expect(updated).not.toBeNull();
    expect(updated?.subject).toBe(customSubject);
    expect(updated?.buttonText).toBe("Acessar Agora Imediatamente");

    const fetched = getEmailTemplateByKey("admin_reset");
    expect(fetched.subject).toBe(customSubject);
  });
});
