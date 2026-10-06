export type UserRole = "master" | "manager" | "student";

export interface Store {
  id: string;
  name: string;
  cnpj: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  title: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address?: string;
  storeId?: string;
  storeName?: string;
  storeCnpj?: string;
  roleId?: string;
  roleTitle?: string;
  accessLevel: UserRole;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  pdfAttachmentUrl?: string;
  pdfAttachmentName?: string;
  isPublished: boolean;
  estimatedDurationMin: number;
  modulesCount?: number;
  lessonsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  videoProvider: "youtube" | "vimeo" | "panda" | "bunny" | "direct_mp4";
  videoUrl: string;
  durationSeconds: number;
  orderIndex: number;
  completed?: boolean;
}

export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  type: "multiple_choice" | "dissertative";
  options?: QuizQuestionOption[];
  correctAnswer?: string; // Hidden from student queries
  rubricKeywords?: string[]; // Keywords expected in dissertative responses
  points: number;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  minScoreToPass: number;
  questions?: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  status: "in_progress" | "submitted" | "pending_review" | "graded";
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILURE"
    | "PASSWORD_RESET_REQUEST"
    | "PASSWORD_RESET_COMPLETED"
    | "USER_REGISTERED"
    | "USER_UPDATED"
    | "USER_DELETED"
    | "COURSE_ACCESS_TOGGLED"
    | "QUIZ_SUBMITTED"
    | "CERTIFICATE_ISSUED"
    | "DIAGNOSTIC_EMAIL_SENT"
    | "ADMIN_PASSWORD_RESET"
    | "TEMPLATE_UPDATED"
    | "SETTINGS_UPDATED";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
