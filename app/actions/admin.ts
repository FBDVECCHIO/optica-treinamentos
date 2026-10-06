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
import { Role, Profile, Course, Module, Lesson, Quiz, QuizQuestion } from "@/types/database";
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

export async function createCourseAction(data: {
  title: string;
  description: string;
  thumbnailUrl?: string;
  pdfAttachmentUrl?: string;
  pdfAttachmentName?: string;
  category?: string;
  estimatedDurationMin?: number;
  certificateEnabled?: boolean;
  minScoreToPass?: number;
  isPublished?: boolean;
}): Promise<{ success: boolean; course?: Course; error?: string }> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master" && user?.accessLevel !== "manager") {
    return { success: false, error: "Apenas administradores podem cadastrar treinamentos." };
  }

  const cleanTitle = data.title.trim();
  if (!cleanTitle) {
    return { success: false, error: "O título do treinamento é obrigatório." };
  }

  const slug = cleanTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const newCourseId = `course_${Date.now()}`;
  const newCourse: Course = {
    id: newCourseId,
    title: cleanTitle,
    slug: slug || `curso-${Date.now()}`,
    description: data.description.trim(),
    thumbnailUrl:
      data.thumbnailUrl ||
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=800&auto=format&fit=crop",
    pdfAttachmentUrl: data.pdfAttachmentUrl,
    pdfAttachmentName: data.pdfAttachmentName || "Apostila Oficial do Treinamento.pdf",
    category: data.category || "Comercial & Técnico",
    certificateEnabled: data.certificateEnabled !== false,
    minScoreToPass: data.minScoreToPass || 70,
    timelineStatus: "active",
    isPublished: data.isPublished !== false,
    estimatedDurationMin: data.estimatedDurationMin || 120,
    modulesCount: 0,
    lessonsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.courses.push(newCourse);

  // Inscrever automaticamente todos os colaboradores cadastrados
  for (const profile of db.profiles) {
    db.userCourses.push({
      userId: profile.id,
      courseId: newCourseId,
      isEnabled: true,
    });
  }

  await logAudit({
    action: "COURSE_CREATED",
    userId: user?.id || "admin",
    userEmail: user?.email || "admin@optica.com.br",
    metadata: { courseId: newCourseId, title: cleanTitle },
  });

  return { success: true, course: newCourse };
}

export async function updateCourseAction(
  courseId: string,
  data: Partial<Course>
): Promise<{ success: boolean; course?: Course; error?: string }> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master" && user?.accessLevel !== "manager") {
    return { success: false, error: "Não autorizado." };
  }

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) {
    return { success: false, error: "Treinamento não localizado." };
  }

  if (data.title) course.title = data.title.trim();
  if (data.description) course.description = data.description.trim();
  if (data.thumbnailUrl) course.thumbnailUrl = data.thumbnailUrl;
  if (data.pdfAttachmentUrl !== undefined) course.pdfAttachmentUrl = data.pdfAttachmentUrl;
  if (data.pdfAttachmentName !== undefined) course.pdfAttachmentName = data.pdfAttachmentName;
  if (data.category !== undefined) course.category = data.category;
  if (data.certificateEnabled !== undefined) course.certificateEnabled = data.certificateEnabled;
  if (data.minScoreToPass !== undefined) course.minScoreToPass = data.minScoreToPass;
  if (data.isPublished !== undefined) course.isPublished = data.isPublished;
  if (data.estimatedDurationMin !== undefined) course.estimatedDurationMin = data.estimatedDurationMin;
  course.updatedAt = new Date().toISOString();

  await logAudit({
    action: "COURSE_UPDATED",
    userId: user?.id || "admin",
    userEmail: user?.email || "admin@optica.com.br",
    metadata: { courseId, changes: data },
  });

  return { success: true, course };
}

export async function deleteCourseAction(courseId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master") {
    return { success: false, error: "Apenas Administrador Master pode excluir treinamentos." };
  }

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) return { success: true };

  db.courses = db.courses.filter((c) => c.id !== courseId);
  db.modules = db.modules.filter((m) => m.courseId !== courseId);
  db.quizzes = db.quizzes.filter((q) => q.courseId !== courseId);
  db.userCourses = db.userCourses.filter((uc) => uc.courseId !== courseId);

  await logAudit({
    action: "COURSE_DELETED",
    userId: user.id,
    userEmail: user.email,
    metadata: { courseId, title: course.title },
  });

  return { success: true };
}

export async function getCourseFullDetailsAction(courseId: string): Promise<{
  course: Course | null;
  modules: Module[];
  quiz: Quiz | null;
}> {
  const course = db.courses.find((c) => c.id === courseId) || null;
  const courseModules = db.modules.filter((m) => m.courseId === courseId);
  const quiz = db.quizzes.find((q) => q.courseId === courseId) || null;

  return {
    course,
    modules: courseModules,
    quiz,
  };
}

export async function saveCourseStructureAction(
  courseId: string,
  data: {
    modules: {
      id?: string;
      title: string;
      description?: string;
      orderIndex: number;
      lessons: {
        id?: string;
        title: string;
        description?: string;
        videoProvider: "youtube" | "vimeo" | "direct_mp4";
        videoUrl: string;
        durationSeconds: number;
        orderIndex: number;
      }[];
    }[];
    quiz?: {
      title: string;
      minScoreToPass: number;
      questions: {
        id?: string;
        questionText: string;
        type: "multiple_choice" | "dissertative";
        points: number;
        orderIndex: number;
        options?: { id: string; text: string }[];
        correctAnswer?: string;
        rubricKeywords?: string[];
      }[];
    };
  }
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (user?.accessLevel !== "master" && user?.accessLevel !== "manager") {
    return { success: false, error: "Apenas administradores podem estruturar cursos." };
  }

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) return { success: false, error: "Curso não encontrado." };

  // Remove módulos antigos do curso e adiciona os novos
  db.modules = db.modules.filter((m) => m.courseId !== courseId);

  let totalLessons = 0;
  for (const m of data.modules) {
    const moduleId = m.id || `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const formattedLessons: Lesson[] = m.lessons.map((l, lIdx) => ({
      id: l.id || `les_${Date.now()}_${lIdx}`,
      moduleId,
      title: l.title,
      description: l.description,
      videoProvider: l.videoProvider,
      videoUrl: l.videoUrl,
      durationSeconds: l.durationSeconds || 600,
      orderIndex: l.orderIndex || lIdx + 1,
    }));

    totalLessons += formattedLessons.length;

    db.modules.push({
      id: moduleId,
      courseId,
      title: m.title,
      description: m.description,
      orderIndex: m.orderIndex,
      lessons: formattedLessons,
    });
  }

  // Atualiza contadores no curso
  course.modulesCount = data.modules.length;
  course.lessonsCount = totalLessons;
  course.updatedAt = new Date().toISOString();

  // Salva / Atualiza Quiz se fornecido
  if (data.quiz) {
    db.quizzes = db.quizzes.filter((q) => q.courseId !== courseId);
    const quizId = `quiz_${Date.now()}`;
    const quizQuestions: QuizQuestion[] = data.quiz.questions.map((q, qIdx) => ({
      id: q.id || `q_${quizId}_${qIdx}`,
      quizId,
      questionText: q.questionText,
      type: q.type,
      points: q.points || 25,
      orderIndex: q.orderIndex || qIdx + 1,
      options: q.options || [],
      correctAnswer: q.correctAnswer || "A",
      rubricKeywords: q.rubricKeywords || [],
    }));

    db.quizzes.push({
      id: quizId,
      courseId,
      title: data.quiz.title,
      minScoreToPass: data.quiz.minScoreToPass || 70,
      questions: quizQuestions,
    });
  }

  await logAudit({
    action: "COURSE_UPDATED",
    userId: user?.id || "admin",
    userEmail: user?.email || "admin@optica.com.br",
    metadata: { courseId, structureSaved: true, modulesCount: data.modules.length, lessonsCount: totalLessons },
  });

  return { success: true };
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

