import { logAudit, getAuditLogs } from "@/lib/audit";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
  latencyMs?: number;
}

export interface ResendEmailEvent {
  id: string;
  to: string[];
  from: string;
  subject: string;
  createdAt: string;
  lastEvent: string;
  category: "PASSWORD_RESET" | "WELCOME" | "CERTIFICATE" | "DIAGNOSTIC" | "ADMIN_RESET" | "GENERAL";
}

export interface ResendMetricsSummary {
  apiKeyConfigured: boolean;
  apiKeyStatus: "ACTIVE" | "INVALID" | "NOT_CONFIGURED";
  keyName: string;
  fromEmail: string;
  domainVerified: boolean;
  domainName: string;
  latencyMs: number;
  totalSent: number;
  deliveredCount: number;
  deliveryRate: number;
  byCategory: {
    passwordReset: number;
    welcome: number;
    certificate: number;
    diagnostic: number;
    adminReset: number;
  };
  recentEmails: ResendEmailEvent[];
}

/**
 * Envio de e-mail de recuperação de senha via Resend
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
  userIp?: string
): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://optica-treinamentos.vercel.app";
  const resetUrl = `${appUrl}/update-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;
  const apiKey = process.env.RESEND_API_KEY;
  const startTime = Date.now();

  if (!apiKey || apiKey.startsWith("re_123456789")) {
    await logAudit({
      action: "PASSWORD_RESET_REQUEST",
      userEmail: toEmail,
      ip: userIp || "127.0.0.1",
      metadata: { resetUrl, provider: "mock_development", status: "simulated" },
    });
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      previewUrl: resetUrl,
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Treinamentos Optica <onboarding@resend.dev>",
        to: [toEmail],
        subject: "Redefinição de Senha - Plataforma de Treinamento para Ópticas",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 40px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #a78bfa; background: rgba(167, 139, 250, 0.1); padding: 4px 10px; border-radius: 20px;">Segurança de Acesso</span>
            </div>
            <h2 style="color: #ffffff; margin-bottom: 12px; font-size: 22px;">Recuperação de Senha</h2>
            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">Você solicitou a redefinição de sua senha de acesso à Plataforma de Treinamento Corporativo para Ópticas (Linha Gold Comfort IA / Guia Smartplay).</p>
            <div style="margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Redefinir Minha Senha</a>
            </div>
            <p style="color: #71717a; font-size: 12px; line-height: 1.5;">Se você não solicitou esta redefinição, desconsidere este e-mail. Por segurança, este link expira em 15 minutos.</p>
          </div>
        `,
      }),
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.message || "Erro no envio pelo Resend";
      await logAudit({
        action: "PASSWORD_RESET_REQUEST",
        userEmail: toEmail,
        ip: userIp || "127.0.0.1",
        metadata: { resetUrl, error: errorMsg, provider: "resend_api" },
      });
      return { success: false, error: errorMsg, latencyMs };
    }

    await logAudit({
      action: "PASSWORD_RESET_REQUEST",
      userEmail: toEmail,
      ip: userIp || "127.0.0.1",
      metadata: { resetUrl, resendId: data.id, provider: "resend_api", status: "sent" },
    });

    return { success: true, messageId: data.id, latencyMs };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Falha de conexão com Resend";
    return { success: false, error: errorMsg, latencyMs: Date.now() - startTime };
  }
}

/**
 * Envio de e-mail de confirmação de cadastro e boas-vindas
 */
export async function sendWelcomeVerificationEmail(
  toEmail: string,
  userName: string,
  userIp?: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const startTime = Date.now();

  if (!apiKey || apiKey.startsWith("re_123456789")) {
    await logAudit({
      action: "USER_REGISTERED",
      userEmail: toEmail,
      ip: userIp || "127.0.0.1",
      metadata: { name: userName, confirmationSent: true, provider: "mock_development" },
    });
    return { success: true, messageId: `welcome_${Date.now()}`, latencyMs: Date.now() - startTime };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Treinamentos Optica <onboarding@resend.dev>",
        to: [toEmail],
        subject: "Bem-vindo à Plataforma de Treinamentos para Ópticas",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 40px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
            <div style="margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #34d399; background: rgba(52, 211, 153, 0.1); padding: 4px 10px; border-radius: 20px;">Credenciamento Ativo</span>
            </div>
            <h2 style="color: #ffffff; margin-bottom: 12px; font-size: 22px;">Olá, ${userName}!</h2>
            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">Seu cadastro na plataforma corporativa foi concluído com sucesso. Os módulos da <strong>Linha Gold Comfort IA</strong> e do <strong>Guia Smartplay</strong> já estão liberados para seu estudo.</p>
            <div style="margin: 28px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://optica-treinamentos.vercel.app"}/dashboard" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">Acessar Treinamentos</a>
            </div>
          </div>
        `,
      }),
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Erro ao enviar e-mail", latencyMs };
    }

    await logAudit({
      action: "USER_REGISTERED",
      userEmail: toEmail,
      ip: userIp || "127.0.0.1",
      metadata: { name: userName, resendId: data.id, provider: "resend_api" },
    });

    return { success: true, messageId: data.id, latencyMs };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erro de conexão";
    return { success: false, error: errorMsg, latencyMs: Date.now() - startTime };
  }
}

/**
 * Envio de e-mail de certificado emitido para o aluno
 */
export async function sendCertificateEmail(
  toEmail: string,
  userName: string,
  courseTitle: string,
  score: number,
  userIp?: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const startTime = Date.now();

  if (!apiKey || apiKey.startsWith("re_123456789")) {
    await logAudit({
      action: "CERTIFICATE_ISSUED",
      userEmail: toEmail,
      ip: userIp || "127.0.0.1",
      metadata: { userName, courseTitle, score, provider: "mock_development" },
    });
    return { success: true, messageId: `cert_${Date.now()}`, latencyMs: Date.now() - startTime };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Treinamentos Optica <onboarding@resend.dev>",
        to: [toEmail],
        subject: `🏆 Parabéns! Certificado de Conclusão: ${courseTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 40px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
            <div style="margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 4px 10px; border-radius: 20px;">Certificação Conquistada</span>
            </div>
            <h2 style="color: #ffffff; margin-bottom: 12px; font-size: 22px;">Parabéns, ${userName}!</h2>
            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">Você obteve <strong>${score}%</strong> de aproveitamento no treinamento <strong>${courseTitle}</strong> e seu certificado oficial já está disponível no seu painel.</p>
          </div>
        `,
      }),
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();
    return { success: res.ok, messageId: data.id, latencyMs };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erro ao enviar certificado";
    return { success: false, error: errorMsg, latencyMs: Date.now() - startTime };
  }
}

/**
 * Envio de e-mail de teste de diagnóstico em tempo real (Disparado pelo Painel Admin)
 */
export async function sendDiagnosticTestEmail(
  toEmail: string,
  userIp?: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const startTime = Date.now();

  if (!apiKey || apiKey.startsWith("re_123456789")) {
    return {
      success: false,
      error: "Chave RESEND_API_KEY não configurada no ambiente.",
      latencyMs: 0,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Treinamentos Optica <onboarding@resend.dev>",
        to: [toEmail],
        subject: `[DIAGNÓSTICO] Teste de Conexão Resend - ${new Date().toLocaleTimeString("pt-BR")}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 36px; border-radius: 12px; max-width: 520px; margin: 0 auto; border: 1px solid rgba(139, 92, 246, 0.3);">
            <h3 style="color: #a78bfa; margin-top: 0;">Diagnóstico Resend API OK</h3>
            <p style="color: #d4d4d8; font-size: 13px;">Este é um disparo de teste automático emitido pelo Painel de Controle da Plataforma de Treinamento Corporativo.</p>
            <p style="color: #71717a; font-size: 11px;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Erro retornado pela API do Resend", latencyMs };
    }

    await logAudit({
      action: "DIAGNOSTIC_EMAIL_SENT",
      userEmail: toEmail,
      ip: userIp || "127.0.0.1",
      metadata: { resendId: data.id, latencyMs },
    });

    return { success: true, messageId: data.id, latencyMs };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Falha na conexão de rede com o Resend";
    return { success: false, error: errorMsg, latencyMs: Date.now() - startTime };
  }
}

/**
 * Consulta e consolidação em tempo real das Métricas de E-mails do Resend
 */
export async function getResendLiveMetrics(): Promise<ResendMetricsSummary> {
  const apiKey = process.env.RESEND_API_KEY;
  const isKeyPresent = Boolean(apiKey && !apiKey.startsWith("re_123456789"));
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Treinamentos Optica <onboarding@resend.dev>";

  let keyStatus: "ACTIVE" | "INVALID" | "NOT_CONFIGURED" = isKeyPresent ? "ACTIVE" : "NOT_CONFIGURED";
  let keyName = "optica-treinamentos";
  let domainVerified = false;
  let domainName = "resend.dev (Sandbox Padrão)";
  let latencyMs = 0;
  const apiEmails: ResendEmailEvent[] = [];

  if (isKeyPresent) {
    const startTime = Date.now();
    try {
      // 1. Validar Chave de API e listar
      const keysRes = await fetch("https://api.resend.com/api-keys", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(4000),
      });

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        const activeKey = keysData.data?.find((k: { id?: string; name?: string }) => k.name === "optica-treinamentos");
        if (activeKey) {
          keyName = activeKey.name;
        }
      } else {
        keyStatus = "INVALID";
      }

      // 2. Checar domínios
      const domRes = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(4000),
      });
      if (domRes.ok) {
        const domData = await domRes.json();
        if (domData.data && domData.data.length > 0) {
          const firstDomain = domData.data[0];
          domainName = firstDomain.name;
          domainVerified = firstDomain.status === "verified";
        }
      }

      // 3. Listar e-mails disparados via Resend
      const emailsRes = await fetch("https://api.resend.com/emails", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(4000),
      });

      latencyMs = Date.now() - startTime;

      if (emailsRes.ok) {
        const emailsData = await emailsRes.json();
        if (Array.isArray(emailsData.data)) {
          for (const em of emailsData.data) {
            let cat: ResendEmailEvent["category"] = "GENERAL";
            const sub = (em.subject || "").toLowerCase();
            if (sub.includes("senha") || sub.includes("recupera")) cat = "PASSWORD_RESET";
            else if (sub.includes("bem-vindo") || sub.includes("cadastro")) cat = "WELCOME";
            else if (sub.includes("certificado")) cat = "CERTIFICATE";
            else if (sub.includes("diagnóstico") || sub.includes("diagnostico")) cat = "DIAGNOSTIC";

            apiEmails.push({
              id: em.id,
              to: Array.isArray(em.to) ? em.to : [em.to || "desconhecido"],
              from: em.from || fromEmail,
              subject: em.subject || "Sem assunto",
              createdAt: em.created_at,
              lastEvent: em.last_event || "sent",
              category: cat,
            });
          }
        }
      }
    } catch {
      keyStatus = "INVALID";
    }
  }

  // Correlacionar com logs de auditoria do sistema interno
  const systemLogs = await getAuditLogs({ limit: 100 });
  const emailLogs = systemLogs.filter((l) =>
    ["PASSWORD_RESET_REQUEST", "USER_REGISTERED", "CERTIFICATE_ISSUED", "DIAGNOSTIC_EMAIL_SENT"].includes(l.action)
  );

  const byCategory = {
    passwordReset: emailLogs.filter((l) => l.action === "PASSWORD_RESET_REQUEST").length,
    welcome: emailLogs.filter((l) => l.action === "USER_REGISTERED").length,
    certificate: emailLogs.filter((l) => l.action === "CERTIFICATE_ISSUED").length,
    diagnostic: emailLogs.filter((l) => l.action === "DIAGNOSTIC_EMAIL_SENT").length,
    adminReset: emailLogs.filter((l) => l.action === "ADMIN_PASSWORD_RESET").length,
  };

  const totalSent = Math.max(apiEmails.length, emailLogs.length);
  const deliveredCount = apiEmails.filter((e) => e.lastEvent === "delivered").length || totalSent;
  const deliveryRate = totalSent > 0 ? Math.round((deliveredCount / totalSent) * 100) : 100;

  return {
    apiKeyConfigured: isKeyPresent,
    apiKeyStatus: keyStatus,
    keyName,
    fromEmail,
    domainVerified,
    domainName,
    latencyMs,
    totalSent,
    deliveredCount,
    deliveryRate,
    byCategory,
    recentEmails: apiEmails.length > 0 ? apiEmails : emailLogs.map((l) => ({
      id: (l.metadata?.resendId as string) || l.id,
      to: [l.userEmail || "aluno@optica.com.br"],
      from: fromEmail,
      subject: l.action === "PASSWORD_RESET_REQUEST" ? "Redefinição de Senha" : "Confirmação de Cadastro",
      createdAt: l.createdAt,
      lastEvent: l.metadata?.status === "sent" ? "delivered" : "sent",
      category: l.action === "PASSWORD_RESET_REQUEST" ? "PASSWORD_RESET" : "WELCOME",
    })),
  };
}

