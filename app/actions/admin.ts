"use server";

import { db } from "@/lib/db/mock-store";
import { getCurrentUser } from "./auth";
import { logAudit } from "@/lib/audit";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { Role, Profile, Course } from "@/types/database";

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

export async function deleteUserAction(userId: string): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getCurrentUser();
  if (currentUser?.accessLevel !== "master") {
    return { success: false, error: "Apenas Administrador Master pode excluir cadastros." };
  }

  const profile = db.profiles.find((p) => p.id === userId);
  if (profile?.accessLevel === "master") {
    return { success: false, error: "Não é permitido excluir o usuário Master do sistema." };
  }

  db.profiles = db.profiles.filter((p) => p.id !== userId);
  db.userCourses = db.userCourses.filter((uc) => uc.userId !== userId);

  await logAudit({
    action: "USER_DELETED",
    userId,
    userEmail: profile?.email,
    metadata: { name: profile?.name },
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
