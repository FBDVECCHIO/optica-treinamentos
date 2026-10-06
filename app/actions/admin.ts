"use server";

import { db } from "@/lib/db/mock-store";
import { getCurrentUser } from "./auth";
import { logAudit } from "@/lib/audit";
import {
  sendPasswordResetEmail,
  getResendLiveMetrics,
  sendDiagnosticTestEmail,
  ResendMetricsSummary,
} from "@/lib/email/resend";
import { Role, Profile, Course } from "@/types/database";
import {
  getAllEmailTemplates,
  updateEmailTemplate,
  EmailTemplate,
} from "@/lib/email/templates";

/**
 * 1. GESTÃO DE FUNÇÕES / CARGOS (Alimenta o select no cadastro)
 */
export async function getRolesAction(): Promise<Role[]> {
  return [...db.roles];
}

export async function createRoleAction(title: string, description?: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master") {
    return { success: false, error: "Apenas Administrador Master pode criar cargos." };
  }

  const cleanTitle = title.trim().toUpperCase();
  if (db.roles.some((r) => r.title === cleanTitle)) {
    return { success: false, error: "Este cargo já existe no sistema." };
  }

  const newRole: Role = {
    id: `role_${Date.now()}`,
    title: cleanTitle,
    description: description?.trim() || "",
    isSystem: false,
    createdAt: new Date().toISOString(),
  };

  db.roles.push(newRole);

  await logAudit({
    action: "USER_UPDATED",
    userId: user.id,
    userEmail: user.email,
    metadata: { createdRole: cleanTitle },
  });

  return { success: true };
}

export async function deleteRoleAction(roleId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master") {
    return { success: false, error: "Não autorizado." };
  }

  const role = db.roles.find((r) => r.id === roleId);
  if (role?.isSystem) {
    return { success: false, error: "Cargos nativos do sistema não podem ser removidos." };
  }

  db.roles = db.roles.filter((r) => r.id !== roleId);
  return { success: true };
}

/**
 * 2. GESTÃO DE USUÁRIOS CADASTRADOS (Tabela com Filtros, Paginação e Reset)
 */
export async function getUsersListAction(options?: {
  search?: string;
  storeId?: string;
  roleId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  users: Profile[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const currentUser = await getCurrentUser();
  let list = [...db.profiles];

  // Se for gerente, isolamento por loja: só vê a própria loja! (Regra: Cada um só vê o seu)
  if (currentUser?.accessLevel === "manager" && currentUser.storeId) {
    list = list.filter((u) => u.storeId === currentUser.storeId);
  }

  // Filtros
  if (options?.search) {
    const term = options.search.toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.cpf.includes(term)
    );
  }

  if (options?.storeId && options.storeId !== "all") {
    list = list.filter((u) => u.storeId === options.storeId);
  }

  if (options?.roleId && options.roleId !== "all") {
    list = list.filter((u) => u.roleId === options.roleId);
  }

  if (options?.status && options.status !== "all") {
    const isActive = options.status === "active";
    list = list.filter((u) => u.active === isActive);
  }

  const total = list.length;
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const offset = (page - 1) * pageSize;

  return {
    users: list.slice(offset, offset + pageSize),
    total,
    page,
    totalPages,
  };
}

export async function resetUserPasswordAction(userId: string): Promise<{ success: boolean; message: string }> {
  const user = db.profiles.find((p) => p.id === userId);
  if (!user) return { success: false, message: "Usuário não localizado." };

  const token = `reset_${Date.now()}`;
  await sendPasswordResetEmail(user.email, token);

  return {
    success: true,
    message: `Link de redefinição de senha disparado com sucesso para ${user.email} via Resend.`,
  };
}

export async function toggleUserStatusAction(userId: string): Promise<{ success: boolean; active: boolean }> {
  const profile = db.profiles.find((p) => p.id === userId);
  if (!profile) return { success: false, active: false };

  profile.active = !profile.active;
  profile.updatedAt = new Date().toISOString();

  await logAudit({
    action: "USER_UPDATED",
    userId,
    userEmail: profile.email,
    metadata: { newStatusActive: profile.active },
  });

  return { success: true, active: profile.active };
}

export async function updateUserAction(
  userId: string,
  data: {
    name?: string;
    email?: string;
    cpf?: string;
    phone?: string;
    storeName?: string;
    storeCnpj?: string;
    roleId?: string;
    accessLevel?: "master" | "manager" | "student";
    active?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.accessLevel !== "master" && currentUser.accessLevel !== "manager") {
    return { success: false, error: "Apenas administradores podem editar colaboradores." };
  }

  const profile = db.profiles.find((p) => p.id === userId);
  if (!profile) {
    return { success: false, error: "Usuário não localizado no sistema." };
  }

  if (data.name) profile.name = data.name.trim().toUpperCase();
  if (data.email) profile.email = data.email.trim().toLowerCase();
  if (data.cpf) profile.cpf = data.cpf.trim();
  if (data.phone) profile.phone = data.phone.trim();
  if (data.storeName) profile.storeName = data.storeName.trim().toUpperCase();
  if (data.storeCnpj) profile.storeCnpj = data.storeCnpj.trim();
  if (data.roleId) {
    profile.roleId = data.roleId;
    const role = db.roles.find((r) => r.id === data.roleId);
    if (role) profile.roleTitle = role.title;
  }
  if (data.accessLevel) {
    profile.accessLevel = data.accessLevel;
  }
  if (typeof data.active === "boolean") {
    profile.active = data.active;
  }
  profile.updatedAt = new Date().toISOString();

  await logAudit({
    action: "USER_UPDATED",
    userId: profile.id,
    userEmail: profile.email,
    metadata: { updatedBy: currentUser?.email || "admin@optica.com.br", changes: data },
  });

  return { success: true };
}

export async function deleteUserAction(userId: string): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getCurrentUser();
  // Se for gerente tentando excluir, não permite
  if (currentUser && currentUser.accessLevel === "manager") {
    return { success: false, error: "Gerentes de loja não têm permissão para excluir colaboradores." };
  }

  const profile = db.profiles.find((p) => p.id === userId);
  if (!profile) {
    // Se já foi excluído da memória
    return { success: true };
  }

  if (profile.accessLevel === "master" || profile.id === "usr_master") {
    return { success: false, error: "Não é permitido excluir o usuário Administrador Master do sistema." };
  }

  db.profiles = db.profiles.filter((p) => p.id !== userId);
  db.userCourses = db.userCourses.filter((uc) => uc.userId !== userId);

  await logAudit({
    action: "USER_DELETED",
    userId,
    userEmail: profile.email,
    metadata: { name: profile.name, deletedBy: currentUser?.email || "admin@optica.com.br" },
  });

  return { success: true };
}

/**
 * 3. GESTÃO DE CURSOS E MATRIZ DE PERMISSÕES INDIVIDUAIS POR USUÁRIO
 */
export async function getAllCoursesAdminAction(): Promise<Course[]> {
  return [...db.courses];
}

export async function toggleCourseVisibilityForUserAction(
  userId: string,
  courseId: string,
  isEnabled: boolean
): Promise<{ success: boolean }> {
  const existing = db.userCourses.find((uc) => uc.userId === userId && uc.courseId === courseId);
  if (existing) {
    existing.isEnabled = isEnabled;
  } else {
    db.userCourses.push({ userId, courseId, isEnabled });
  }

  await logAudit({
    action: "COURSE_ACCESS_TOGGLED",
    userId,
    metadata: { courseId, isEnabled },
  });

  return { success: true };
}

export async function getUserCourseAccessMatrixAction(userId: string): Promise<{ courseId: string; isEnabled: boolean }[]> {
  return db.courses.map((course) => {
    const record = db.userCourses.find((uc) => uc.userId === userId && uc.courseId === course.id);
    return {
      courseId: course.id,
      isEnabled: record ? record.isEnabled : false,
    };
  });
}

/**
 * 4. RELATÓRIOS ANALÍTICOS DE EVOLUÇÃO, PERFORMANCE E NOTAS POR USUÁRIO
 */
export async function getStudentPerformanceReportAction(): Promise<{
  userId: string;
  userName: string;
  userEmail: string;
  storeName: string;
  roleTitle: string;
  coursesStarted: number;
  coursesCompleted: number;
  averageScore: number;
  lastActivity: string;
}[]> {
  const currentUser = await getCurrentUser();
  let students = db.profiles.filter((p) => p.accessLevel !== "master");

  if (currentUser?.accessLevel === "manager" && currentUser.storeId) {
    students = students.filter((p) => p.storeId === currentUser.storeId);
  }

  return students.map((student) => {
    const attempts = db.quizAttempts.filter((qa) => qa.userId === student.id);
    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;

    return {
      userId: student.id,
      userName: student.name,
      userEmail: student.email,
      storeName: student.storeName || "Matriz",
      roleTitle: student.roleTitle || "Consultor",
      coursesStarted: 2,
      coursesCompleted: attempts.filter((a) => a.passed).length,
      averageScore: avgScore,
      lastActivity: student.updatedAt || student.createdAt,
    };
  });
}

/**
 * 5. MÉTRICAS E DISPARO DE E-MAILS AUTOMÁTICOS VIA RESEND
 */
export async function getResendMetricsAction(): Promise<ResendMetricsSummary> {
  return await getResendLiveMetrics();
}

export async function sendDiagnosticEmailAction(toEmail: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  latencyMs?: number;
}> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master" && user?.accessLevel !== "manager") {
    return { success: false, error: "Apenas administradores podem disparar testes de diagnóstico." };
  }
  return await sendDiagnosticTestEmail(toEmail);
}

/**
 * 6. GESTÃO E PERSONALIZAÇÃO DE MENSAGENS / TEMPLATES DE E-MAIL
 */
export async function getEmailTemplatesAction(): Promise<EmailTemplate[]> {
  return getAllEmailTemplates();
}

export async function saveEmailTemplateAction(
  id: string,
  data: Partial<EmailTemplate>
): Promise<{ success: boolean; error?: string; template?: EmailTemplate }> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master" && user?.accessLevel !== "manager") {
    return { success: false, error: "Apenas administradores podem alterar modelos de mensagens." };
  }

  const updated = updateEmailTemplate(id, data);
  if (!updated) {
    return { success: false, error: "Modelo de e-mail não encontrado." };
  }

  await logAudit({
    action: "TEMPLATE_UPDATED",
    userId: user?.id || "master",
    userEmail: user?.email || "admin@optica.com.br",
    metadata: { updatedTemplateId: id, templateName: updated.name },
  });

  return { success: true, template: updated };
}

