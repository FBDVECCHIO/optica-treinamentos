export type UserRole = "master" | "manager" | "student";

export type SubscriptionStatus = "active" | "trial" | "suspended" | "canceled";
export type BillingCycle = "monthly" | "quarterly" | "annual" | "trade_partner";

export interface Store {
  id: string;
  name: string;
  cnpj: string;
  address?: string;
  phone?: string;
  active: boolean;
  planName?: string;
  subscriptionStatus?: SubscriptionStatus;
  userLimit?: number;
  validUntil?: string;
  monthlyValue?: number;
  billingCycle?: BillingCycle;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
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
  avatarUrl?: string;
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
  category?: string;
  certificateEnabled?: boolean;
  minScoreToPass?: number;
  certificateTemplateId?: string;
  certificateCustomLogoUrl?: string;
  certificateCustomBgUrl?: string;
  certificateLocation?: string;
  timelineStatus?: "draft" | "active" | "archived";
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
    | "SETTINGS_UPDATED"
    | "COURSE_CREATED"
    | "COURSE_UPDATED"
    | "COURSE_DELETED"
    | "CATEGORY_CREATED"
    | "CATEGORY_UPDATED"
    | "CATEGORY_DELETED"
    | "STORE_CREATED"
    | "STORE_UPDATED"
    | "STORE_STATUS_TOGGLED"
    | "STORE_DELETED"
    | "PLAN_CREATED"
    | "PLAN_UPDATED"
    | "PLAN_DELETED"
    | "COUPON_CREATED"
    | "COUPON_DELETED"
    | "INVOICE_EMITTED";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  coursesCount?: number;
  createdAt: string;
}

export interface SystemSettings {
  loginHeroImageUrl?: string;
  loginHeroTitle?: string;
  loginHeroSubtitle?: string;
  updatedAt: string;
}

export interface IssuedCertificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  category?: string;
  templateId: string;
  location: string;
  customLogoUrl?: string;
  customBgUrl?: string;
  score: number;
  issuedAt: string;
  verificationCode: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  annualPrice: number; // Preço com desconto anual
  annualDiscountPercent: number; // Ex: 20
  userLimit: number;
  badge: string;
  description: string;
  highlight: boolean;
  active: boolean;
  features: string[];
  ctaText: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  applicablePlans: string[]; // "all" ou IDs dos planos
  validUntil: string;
  maxUses: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  storeId: string;
  storeName: string;
  storeCnpj: string;
  planName: string;
  billingCycle: "monthly" | "annual";
  amount: number;
  discountApplied: number;
  couponCode?: string;
  paymentMethod: "credit_card" | "pix" | "boleto" | "faturado";
  paymentGateway: "stripe" | "asaas" | "mercadopago" | "simulado";
  status: "paid" | "pending" | "refunded" | "failed";
  dueDate: string;
  paidAt?: string;
  nfStatus: "emitted" | "pending" | "processing" | "canceled";
  nfNumber?: string;
  nfKey?: string;
  nfUrl?: string;
  createdAt: string;
}

export interface CnpjLookupResult {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  situacao: string; // "ATIVA", etc.
  dataAbertura?: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  telefone?: string;
  email?: string;
  valido: boolean;
}

