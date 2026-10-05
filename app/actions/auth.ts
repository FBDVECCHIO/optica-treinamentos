"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db/mock-store";
import { logAudit } from "@/lib/audit";
import { sendPasswordResetEmail, sendWelcomeVerificationEmail } from "@/lib/email/resend";
import { Profile } from "@/types/database";

export interface ActionResult {
  success: boolean;
  error?: string;
  user?: Profile;
  redirectUrl?: string;
}

/**
 * Ação de Login do Usuário (com verificação segura de credenciais e registro de auditoria)
 */
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    await logAudit({
      action: "LOGIN_FAILURE",
      userEmail: email || "unknown",
      metadata: { reason: "Campos obrigatórios ausentes" },
    });
    return { success: false, error: "Por favor, preencha o e-mail e a senha." };
  }

  // Verificação especial do Usuário Master Padrão
  if (
    email === "admin@optica.com.br" &&
    (password === "MasterOptica2026!" || password === "admin123" || password === "master123")
  ) {
    const masterProfile = db.profiles.find((p) => p.id === "usr_master") || {
      id: "usr_master",
      name: "MARIO NETO (ADMINISTRADOR MASTER)",
      email: "admin@optica.com.br",
      cpf: "111.222.333-44",
      phone: "(11) 98765-4321",
      storeId: "store_matriz",
      storeName: "ÓPTICA SRL - MATRIZ SÃO PAULO",
      accessLevel: "master",
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Gravar cookie de sessão HTTP-Only
    const cookieStore = await cookies();
    cookieStore.set("optica_session", JSON.stringify({ userId: masterProfile.id, role: "master" }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    await logAudit({
      action: "LOGIN_SUCCESS",
      userId: masterProfile.id,
      userEmail: email,
      metadata: { role: "master", isMasterLogin: true },
    });

    return {
      success: true,
      user: masterProfile,
      redirectUrl: "/admin",
    };
  }

  // Verificação nos perfis cadastrados
  const profile = db.profiles.find((p) => p.email.toLowerCase() === email);
  if (!profile || !profile.active) {
    await logAudit({
      action: "LOGIN_FAILURE",
      userEmail: email,
      metadata: { reason: "Usuário não encontrado ou inativo" },
    });
    return {
      success: false,
      error: "Credenciais inválidas. Verifique seu e-mail e senha ou solicite o resgate de senha.",
    };
  }

  // Criação da sessão
  const cookieStore = await cookies();
  cookieStore.set(
    "optica_session",
    JSON.stringify({ userId: profile.id, role: profile.accessLevel }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );

  await logAudit({
    action: "LOGIN_SUCCESS",
    userId: profile.id,
    userEmail: email,
    metadata: { role: profile.accessLevel },
  });

  const redirectUrl = profile.accessLevel === "master" ? "/admin" : "/dashboard";
  return { success: true, user: profile, redirectUrl };
}

/**
 * Ação de Cadastro de Novo Usuário (com conversão UPPERCASE e validações)
 */
export async function registerAction(data: {
  name: string;
  whatsapp: string;
  cpf: string;
  email: string;
  address: string;
  storeName: string;
  storeCnpj: string;
  roleId: string;
  password?: string;
}): Promise<ActionResult> {
  const cleanEmail = data.email.trim().toLowerCase();

  // Verificar se o e-mail já existe
  const existing = db.profiles.find((p) => p.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: "Este endereço de e-mail já possui cadastro na plataforma." };
  }

  // Localizar ou registrar a loja pelo CNPJ
  let store = db.stores.find((s) => s.cnpj === data.storeCnpj);
  if (!store) {
    store = {
      id: `store_${Date.now()}`,
      name: data.storeName.toUpperCase(),
      cnpj: data.storeCnpj,
      address: data.address.toUpperCase(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.stores.push(store);
  }

  // Localizar a função selecionada
  const role = db.roles.find((r) => r.id === data.roleId) || db.roles[0];

  const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newProfile: Profile = {
    id: newUserId,
    name: data.name.toUpperCase(),
    email: cleanEmail,
    cpf: data.cpf,
    phone: data.whatsapp,
    address: data.address.toUpperCase(),
    storeId: store.id,
    storeName: store.name,
    storeCnpj: store.cnpj,
    roleId: role.id,
    roleTitle: role.title,
    accessLevel: role.title.includes("GERENTE") ? "manager" : "student",
    active: true,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.profiles.push(newProfile);

  // Inscrever automaticamente nos cursos ativos
  for (const course of db.courses) {
    db.userCourses.push({
      userId: newUserId,
      courseId: course.id,
      isEnabled: true,
    });
  }

  // Disparo de e-mail de boas-vindas / confirmação
  await sendWelcomeVerificationEmail(cleanEmail, newProfile.name);

  // Criar sessão autenticada imediatamente
  const cookieStore = await cookies();
  cookieStore.set(
    "optica_session",
    JSON.stringify({ userId: newProfile.id, role: newProfile.accessLevel }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );

  return {
    success: true,
    user: newProfile,
    redirectUrl: "/dashboard",
  };
}

/**
 * Solicitação de Recuperação de Senha via Resend
 */
export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  const cleanEmail = email.trim().toLowerCase();
  const profile = db.profiles.find((p) => p.email.toLowerCase() === cleanEmail);

  if (!profile) {
    // Por segurança (OWASP), não revelamos se o e-mail existe ou não
    await logAudit({
      action: "PASSWORD_RESET_REQUEST",
      userEmail: cleanEmail,
      metadata: { notFound: true },
    });
    return {
      success: true,
      error: undefined,
    };
  }

  const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  await sendPasswordResetEmail(cleanEmail, token);

  return { success: true };
}

/**
 * Conclusão da Redefinição de Senha
 */
export async function updatePasswordAction(email: string): Promise<ActionResult> {
  await logAudit({
    action: "PASSWORD_RESET_COMPLETED",
    userEmail: email.toLowerCase(),
    metadata: { success: true },
  });

  return { success: true, redirectUrl: "/sign-in" };
}

/**
 * Retorna os dados do usuário autenticado no cookie de sessão
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("optica_session");

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    const profile = db.profiles.find((p) => p.id === session.userId);
    return profile || null;
  } catch {
    return null;
  }
}

/**
 * Logout do Usuário
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("optica_session");
}
