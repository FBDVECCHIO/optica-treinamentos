import { logAudit } from "@/lib/audit";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Envio de e-mail de recuperação de senha via Resend (com fallback seguro em desenvolvimento)
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
  userIp?: string
): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/update-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;
  const apiKey = process.env.RESEND_API_KEY;

  // Registrar auditoria da requisição de resgate
  await logAudit({
    action: "PASSWORD_RESET_REQUEST",
    userEmail: toEmail,
    ip: userIp || "127.0.0.1",
    metadata: { resetUrl, provider: apiKey ? "resend_api" : "development_mock" },
  });

  if (!apiKey || apiKey.startsWith("re_123456789")) {
    console.log(`[RESEND SIMULATION] E-mail de redefinição para ${toEmail}: ${resetUrl}`);
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      previewUrl: resetUrl,
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
        from: process.env.RESEND_FROM_EMAIL || "Treinamentos Óptica <onboarding@resend.dev>",
        to: [toEmail],
        subject: "Redefinição de Senha - Plataforma de Treinamento para Ópticas",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 40px; border-radius: 12px; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #a78bfa; margin-bottom: 8px;">Recuperação de Senha</h2>
            <p style="color: #a1a1aa; font-size: 14px;">Você solicitou a redefinição de sua senha de acesso à Plataforma de Treinamento Corporativo para Ópticas.</p>
            <div style="margin: 28px 0;">
              <a href="${resetUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
            </div>
            <p style="color: #71717a; font-size: 12px;">Se você não solicitou esta redefinição, por favor desconsidere este e-mail. Este link expira em 15 minutos.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.message || "Erro ao disparar e-mail no Resend" };
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Falha de conexão com Resend";
    return { success: false, error: errorMsg };
  }
}

/**
 * Envio de e-mail de confirmação de cadastro
 */
export async function sendWelcomeVerificationEmail(
  toEmail: string,
  userName: string,
  userIp?: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  await logAudit({
    action: "USER_REGISTERED",
    userEmail: toEmail,
    ip: userIp || "127.0.0.1",
    metadata: { name: userName, confirmationSent: true },
  });

  if (!apiKey || apiKey.startsWith("re_123456789")) {
    console.log(`[RESEND SIMULATION] E-mail de boas-vindas enviado para ${toEmail}`);
    return { success: true, messageId: `welcome_${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Treinamentos Óptica <onboarding@resend.dev>",
        to: [toEmail],
        subject: "Bem-vindo à Plataforma de Treinamentos para Ópticas",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 40px; border-radius: 12px; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #a78bfa;">Olá, ${userName}!</h2>
            <p style="color: #a1a1aa; font-size: 14px;">Seu cadastro na plataforma corporativa foi realizado com sucesso. Seus cursos e materiais da Linha Gold Comfort e Guia Smartplay estão disponíveis.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      return { success: false, error: "Falha ao enviar e-mail de confirmação" };
    }
    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch {
    return { success: false, error: "Erro de rede no envio de confirmação" };
  }
}
