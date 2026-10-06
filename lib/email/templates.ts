export interface EmailTemplate {
  id: string;
  key: "welcome" | "password_reset" | "password_changed" | "certificate" | "admin_reset";
  name: string;
  description: string;
  subject: string;
  title: string;
  badgeText: string;
  badgeColor: string;
  content: string;
  buttonText: string;
  footerNote: string;
  availableVariables: string[];
  updatedAt: string;
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl_welcome",
    key: "welcome",
    name: "Cadastro e Boas-Vindas",
    description: "Disparado imediatamente quando um novo colaborador é cadastrado na plataforma.",
    subject: "Bem-vindo à Plataforma de Treinamentos para Ópticas",
    title: "Olá, {{nome}}!",
    badgeText: "Credenciamento Ativo",
    badgeColor: "emerald",
    content: "Seu cadastro na plataforma corporativa da unidade {{loja}} foi concluído com sucesso. Os módulos da Linha Gold Comfort IA e do Guia Smartplay já estão liberados para seu estudo e capacitação técnica.",
    buttonText: "Acessar Treinamentos",
    footerNote: "Caso tenha dúvidas sobre seus acessos, procure a gerência da sua filial.",
    availableVariables: ["{{nome}}", "{{email}}", "{{loja}}", "{{cargo}}", "{{link}}"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_password_reset",
    key: "password_reset",
    name: "Recuperação / Redefinição de Senha",
    description: "Disparado quando o usuário solicita recuperação de senha na tela de login.",
    subject: "Redefinição de Senha - Plataforma de Treinamento para Ópticas",
    title: "Recuperação de Senha",
    badgeText: "Segurança de Acesso",
    badgeColor: "violet",
    content: "Você solicitou a redefinição de sua senha de acesso à Plataforma de Treinamento Corporativo para Ópticas (Linha Gold Comfort IA / Guia Smartplay). Clique no botão abaixo para definir sua nova senha com segurança.",
    buttonText: "Redefinir Minha Senha",
    footerNote: "Se você não solicitou esta redefinição, desconsidere este e-mail. Por segurança, este link expira em 15 minutos.",
    availableVariables: ["{{nome}}", "{{email}}", "{{link}}"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_password_changed",
    key: "password_changed",
    name: "Confirmação de Senha Alterada",
    description: "Disparado como notificação de segurança após a conclusão de uma troca de senha.",
    subject: "Sua Senha Foi Alterada com Sucesso - Treinamentos Óptica",
    title: "Senha Atualizada com Sucesso",
    badgeText: "Alerta de Segurança",
    badgeColor: "blue",
    content: "Informamos que a senha de acesso à conta de {{email}} foi alterada com sucesso no sistema. Se você realizou essa alteração, nenhuma ação adicional é necessária.",
    buttonText: "Acessar Plataforma",
    footerNote: "Caso você NÃO tenha realizado esta alteração, contate imediatamente o Administrador Master da sua rede.",
    availableVariables: ["{{nome}}", "{{email}}", "{{link}}"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_certificate",
    key: "certificate",
    name: "Emissão de Certificado Conquistado",
    description: "Disparado quando o colaborador atinge a pontuação mínima (>= 70%) e conclui o treinamento.",
    subject: "🏆 Parabéns! Certificado de Conclusão: {{curso}}",
    title: "Parabéns, {{nome}}!",
    badgeText: "Certificação Emitida",
    badgeColor: "amber",
    content: "Você atingiu {{nota}}% de aproveitamento nas avaliações do curso {{curso}} pela unidade {{loja}}. Seu certificado oficial já está emitido e disponível para download.",
    buttonText: "Baixar Meu Certificado",
    footerNote: "O certificado possui reconhecimento oficial para atendimento técnico e comercial em lentes oftálmicas.",
    availableVariables: ["{{nome}}", "{{curso}}", "{{nota}}", "{{loja}}", "{{link}}"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_admin_reset",
    key: "admin_reset",
    name: "Reset de Senha Solicitado pelo Gestor",
    description: "Disparado quando o Administrador Master aciona a ação de redefinição de senha na tabela de usuários.",
    subject: "Instruções de Acesso - Redefinição Solicitada pelo Administrador",
    title: "Link Prioritário de Acesso",
    badgeText: "Ação Administrativa",
    badgeColor: "purple",
    content: "O Administrador Master da sua rede solicitou a redefinição da sua senha de acesso. Clique no botão seguro abaixo para criar suas novas credenciais.",
    buttonText: "Definir Nova Senha",
    footerNote: "Este link é exclusivo para seu e-mail e possui validade temporária de 15 minutos.",
    availableVariables: ["{{nome}}", "{{email}}", "{{link}}"],
    updatedAt: new Date().toISOString(),
  },
];

// Singleton em memória para armazenar os templates ativos
const globalTpl = global as unknown as { __opticaTemplates?: EmailTemplate[] };
export const emailTemplatesStore: EmailTemplate[] =
  globalTpl.__opticaTemplates || JSON.parse(JSON.stringify(DEFAULT_EMAIL_TEMPLATES));

if (process.env.NODE_ENV !== "production") {
  globalTpl.__opticaTemplates = emailTemplatesStore;
}

/**
 * Retorna todos os templates de e-mail configurados
 */
export function getAllEmailTemplates(): EmailTemplate[] {
  return [...emailTemplatesStore];
}

/**
 * Retorna um template específico por chave
 */
export function getEmailTemplateByKey(key: EmailTemplate["key"]): EmailTemplate {
  const found = emailTemplatesStore.find((t) => t.key === key);
  return found || DEFAULT_EMAIL_TEMPLATES.find((t) => t.key === key)!;
}

/**
 * Atualiza um template de e-mail existente
 */
export function updateEmailTemplate(
  id: string,
  data: Partial<EmailTemplate>
): EmailTemplate | null {
  const index = emailTemplatesStore.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = emailTemplatesStore[index];
  const updated: EmailTemplate = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  emailTemplatesStore[index] = updated;
  return updated;
}

/**
 * Renderiza o template de e-mail com interpolação de variáveis e HTML responsivo
 */
export function renderEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; html: string } {
  let subject = template.subject;
  let title = template.title;
  let content = template.content;
  let buttonText = template.buttonText;
  let footerNote = template.footerNote;

  // Substituição de todas as variáveis {{chave}}
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    subject = subject.replace(regex, val);
    title = title.replace(regex, val);
    content = content.replace(regex, val);
    buttonText = buttonText.replace(regex, val);
    footerNote = footerNote.replace(regex, val);
  }

  const link = variables["link"] || "https://optica-treinamentos.vercel.app";

  const badgeHex =
    template.badgeColor === "emerald"
      ? "#34d399"
      : template.badgeColor === "amber"
      ? "#fbbf24"
      : template.badgeColor === "blue"
      ? "#60a5fa"
      : "#a78bfa";

  const badgeBg =
    template.badgeColor === "emerald"
      ? "rgba(52, 211, 153, 0.15)"
      : template.badgeColor === "amber"
      ? "rgba(251, 191, 36, 0.15)"
      : template.badgeColor === "blue"
      ? "rgba(96, 165, 250, 0.15)"
      : "rgba(167, 139, 250, 0.15)";

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #fafafa;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #121217; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
              <!-- Top Branding -->
              <tr>
                <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-size: 13px; font-weight: bold; letter-spacing: 0.05em; color: #ffffff; text-transform: uppercase;">ÓPTICA SRL &bull; TREINAMENTOS</span>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${badgeBg}; color: ${badgeHex};">
                          ${template.badgeText}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Conteúdo Principal -->
              <tr>
                <td style="padding: 36px;">
                  <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                    ${title}
                  </h1>
                  <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.65; color: #a1a1aa;">
                    ${content}
                  </p>
                  
                  <div style="margin: 32px 0;">
                    <a href="${link}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 0.02em;">
                      ${buttonText}
                    </a>
                  </div>

                  <p style="margin: 28px 0 0 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; line-height: 1.5; color: #71717a;">
                    ${footerNote}
                  </p>
                </td>
              </tr>

              <!-- Rodapé Institucional -->
              <tr>
                <td style="background-color: #0d0d12; padding: 20px 36px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #52525b;">
                    Linha Gold Comfort IA &bull; Guia Smartplay &bull; Rede SRL &bull; 2026
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html };
}
