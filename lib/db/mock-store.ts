import {
  Store,
  Role,
  Profile,
  Course,
  Module,
  Lesson,
  Quiz,
  QuizAttempt,
  AuditLog,
  Category,
  SystemSettings,
  IssuedCertificate,
} from "@/types/database";

// In-Memory & Local Database Store with Pre-Seeded Optical Data & Disk Persistence
class DatabaseStore {
  public stores: Store[] = [
    {
      id: "store_matriz",
      name: "ÓPTICA SRL - MATRIZ SÃO PAULO",
      cnpj: "12.345.678/0001-95",
      address: "AV. PAULISTA, 1500 - BELA VISTA, SÃO PAULO - SP",
      active: true,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "store_filial1",
      name: "ÓPTICA SRL - FILIAL SHOPPING",
      cnpj: "12.345.678/0002-76",
      address: "SHOPPING METRÔ TAUBATÉ, LOJA 45",
      active: true,
      createdAt: new Date("2026-01-15").toISOString(),
    },
    {
      id: "store_franqueado",
      name: "ÓPTICA PARCEIRA MARIO NETO",
      cnpj: "98.765.432/0001-10",
      address: "RUA DO COMÉRCIO, 250 - CENTRO",
      active: true,
      createdAt: new Date("2026-02-01").toISOString(),
    },
  ];

  public roles: Role[] = [
    {
      id: "role_consultor",
      title: "CONSULTOR ÓPTICO / VENDEDOR",
      description: "Atendimento comercial no balcão, recomendação de armações e prescrição de lentes oftálmicas",
      isSystem: true,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "role_gerente",
      title: "GERENTE DE LOJA",
      description: "Gestão operacional, treinamento da equipe e acompanhamento de metas da filial",
      isSystem: true,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "role_optometrista",
      title: "OPTOMETRISTA / TÉCNICO ÓPTICO",
      description: "Avaliação refrativa, ergonomia visual e acompanhamento técnico de adaptação de lentes progressivas",
      isSystem: true,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "role_montador",
      title: "MONTADOR / LABORATÓRIO",
      description: "Bisotagem, montagem em armações solares e receituário, verificação no lensômetro",
      isSystem: true,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "role_master",
      title: "ADMINISTRADOR MASTER",
      description: "Gestão global da rede, cursos, auditoria e cadastros",
      isSystem: true,
      createdAt: new Date("2026-01-01").toISOString(),
    },
  ];

  public profiles: Profile[] = [
    {
      id: "usr_fbdv",
      name: "FÁBIO B. DEL VECCHIO (ADMINISTRADOR MASTER)",
      email: "fbdv1202@gmail.com",
      cpf: "123.456.789-00",
      phone: "(11) 99999-8888",
      address: "AV. PAULISTA, 1500 - SÃO PAULO - SP",
      storeId: "store_matriz",
      storeName: "ÓPTICA SRL - MATRIZ SÃO PAULO",
      storeCnpj: "12.345.678/0001-95",
      roleId: "role_master",
      roleTitle: "ADMINISTRADOR MASTER",
      accessLevel: "master",
      active: true,
      emailVerified: true,
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "usr_master",
      name: "MARIO NETO (ADMINISTRADOR MASTER)",
      email: "admin@optica.com.br",
      cpf: "111.222.333-44",
      phone: "(11) 98765-4321",
      address: "AV. PAULISTA, 1500 - SÃO PAULO - SP",
      storeId: "store_matriz",
      storeName: "ÓPTICA SRL - MATRIZ SÃO PAULO",
      storeCnpj: "12.345.678/0001-95",
      roleId: "role_master",
      roleTitle: "ADMINISTRADOR MASTER",
      accessLevel: "master",
      active: true,
      emailVerified: true,
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "usr_gerente",
      name: "CARLOS GERENTE DE FILIAL",
      email: "gerente@optica.com.br",
      cpf: "222.333.444-55",
      phone: "(11) 97777-8888",
      address: "RUA DAS FLORES, 120",
      storeId: "store_matriz",
      storeName: "ÓPTICA SRL - MATRIZ SÃO PAULO",
      storeCnpj: "12.345.678/0001-95",
      roleId: "role_gerente",
      roleTitle: "GERENTE DE LOJA",
      accessLevel: "manager",
      active: true,
      emailVerified: true,
      createdAt: new Date("2026-02-01").toISOString(),
      updatedAt: new Date("2026-02-01").toISOString(),
    },
    {
      id: "usr_aluno",
      name: "JULIANA CONSULTORA ÓPTICA",
      email: "aluno@optica.com.br",
      cpf: "333.444.555-66",
      phone: "(11) 96666-5555",
      address: "AV. BRASIL, 300",
      storeId: "store_matriz",
      storeName: "ÓPTICA SRL - MATRIZ SÃO PAULO",
      storeCnpj: "12.345.678/0001-95",
      roleId: "role_consultor",
      roleTitle: "CONSULTOR ÓPTICO / VENDEDOR",
      accessLevel: "student",
      active: true,
      emailVerified: true,
      createdAt: new Date("2026-02-10").toISOString(),
      updatedAt: new Date("2026-02-10").toISOString(),
    },
  ];

  public courses: Course[] = [
    {
      id: "course_gold_comfort",
      title: "Treinamento Comercial: Linha Gold Comfort IA",
      slug: "linha-gold-comfort-ia",
      description: "Capacitação completa sobre tecnologia de lentes multifocais digitais, campos visuais ampliados, tratamento antirreflexo e técnicas de venda de alto valor.",
      thumbnailUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=800&auto=format&fit=crop",
      pdfAttachmentUrl: "/TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf",
      pdfAttachmentName: "Apostila Comercial Gold Comfort IA.pdf",
      isPublished: true,
      estimatedDurationMin: 180,
      modulesCount: 3,
      lessonsCount: 6,
      createdAt: new Date("2026-01-10").toISOString(),
      updatedAt: new Date("2026-01-10").toISOString(),
    },
    {
      id: "course_smartplay",
      title: "Guia Oficial Smartplay: Atendimento e Precisão Óptica",
      slug: "guia-smartplay-optica",
      description: "Manual operacional para consultores ópticos: tomada de medidas pupilares (DNP), altura de montagem, ajustes anatômicos de armação e pós-venda.",
      thumbnailUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800&auto=format&fit=crop",
      pdfAttachmentUrl: "/GUIA SMARTPLAY.pdf",
      pdfAttachmentName: "Guia Oficial Smartplay Ópticas.pdf",
      isPublished: true,
      estimatedDurationMin: 120,
      modulesCount: 2,
      lessonsCount: 4,
      createdAt: new Date("2026-01-15").toISOString(),
      updatedAt: new Date("2026-01-15").toISOString(),
    },
  ];

  // Credenciais / Senhas de Acesso do Sistema (Persistência com fallback seguro)
  public userCredentials: Record<string, string> = {
    "admin@optica.com.br": "MasterOptica2026!",
    "fbdv1202@gmail.com": "@180414Fs",
    "gerente@optica.com.br": "gerente123",
    "aluno@optica.com.br": "aluno123",
  };

  // Associação Usuário -> Curso (Controle de Habilitação)
  public userCourses: { userId: string; courseId: string; isEnabled: boolean }[] = [
    { userId: "usr_fbdv", courseId: "course_gold_comfort", isEnabled: true },
    { userId: "usr_fbdv", courseId: "course_smartplay", isEnabled: true },
    { userId: "usr_master", courseId: "course_gold_comfort", isEnabled: true },
    { userId: "usr_master", courseId: "course_smartplay", isEnabled: true },
    { userId: "usr_gerente", courseId: "course_gold_comfort", isEnabled: true },
    { userId: "usr_gerente", courseId: "course_smartplay", isEnabled: true },
    { userId: "usr_aluno", courseId: "course_gold_comfort", isEnabled: true },
    { userId: "usr_aluno", courseId: "course_smartplay", isEnabled: true },
  ];

  public modules: Module[] = [
    {
      id: "mod_gc_1",
      courseId: "course_gold_comfort",
      title: "Módulo 1: Fundamentos da Linha Gold Comfort",
      description: "Entenda o conceito de inteligência visual e os diferenciais da tecnologia Freeform.",
      orderIndex: 1,
      lessons: [
        {
          id: "les_gc_101",
          moduleId: "mod_gc_1",
          title: "Aula 1: Apresentação da Linha e Conceito de Conforto Visual",
          description: "Visão panorâmica dos perfis de usuários e indicação de dioptrias.",
          videoProvider: "youtube",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Link de exemplo unlisted/embed
          durationSeconds: 720,
          orderIndex: 1,
        },
        {
          id: "les_gc_102",
          moduleId: "mod_gc_1",
          title: "Aula 2: Geometria de Lentes Progressivas Digitais",
          description: "Como a tecnologia de cálculo por IA elimina aberrações laterais.",
          videoProvider: "youtube",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSeconds: 960,
          orderIndex: 2,
        },
      ],
    },
    {
      id: "mod_gc_2",
      courseId: "course_gold_comfort",
      title: "Módulo 2: Argumentação Comercial e Venda Consultiva",
      description: "Como encantar o cliente no balcão e demonstrar valor perceptível.",
      orderIndex: 2,
      lessons: [
        {
          id: "les_gc_201",
          moduleId: "mod_gc_2",
          title: "Aula 1: Quebra de Objeções sobre Lentes Multifocais",
          description: "Superando o medo de adaptação e reforçando a garantia de satisfação.",
          videoProvider: "youtube",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSeconds: 840,
          orderIndex: 1,
        },
        {
          id: "les_gc_202",
          moduleId: "mod_gc_2",
          title: "Aula 2: Demonstração Prática com o Guia Smartplay",
          description: "O passo a passo para usar os mostruários e testes no balcão da ótica.",
          videoProvider: "youtube",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSeconds: 900,
          orderIndex: 2,
        },
      ],
    },
  ];

  // Progresso do Aluno
  public lessonProgress: { userId: string; lessonId: string; completed: boolean; completedAt: string }[] = [
    {
      userId: "usr_aluno",
      lessonId: "les_gc_101",
      completed: true,
      completedAt: new Date("2026-02-11").toISOString(),
    },
  ];

  // Quizzes de Fixação
  public quizzes: Quiz[] = [
    {
      id: "quiz_gold_comfort",
      courseId: "course_gold_comfort",
      title: "Avaliação de Certificação: Linha Gold Comfort IA",
      minScoreToPass: 70,
      questions: [
        {
          id: "q1",
          quizId: "quiz_gold_comfort",
          questionText: "Qual é o principal benefício da tecnologia digital Freeform na Linha Gold Comfort?",
          type: "multiple_choice",
          orderIndex: 1,
          points: 25,
          options: [
            { id: "A", text: "Diminuição do custo da armação" },
            { id: "B", text: "Redução de aberrações periféricas e amplitude de campo de visão perto e longe" },
            { id: "C", text: "Apenas coloração mais escura em ambientes externos" },
            { id: "D", text: "Eliminação total de necessidade de tomada de medidas pupilares" },
          ],
          correctAnswer: "B",
        },
        {
          id: "q2",
          quizId: "quiz_gold_comfort",
          questionText: "Para qual perfil de paciente as lentes Gold Comfort são prioritariamente recomendadas?",
          type: "multiple_choice",
          orderIndex: 2,
          points: 25,
          options: [
            { id: "A", text: "Apenas crianças menores de 10 anos" },
            { id: "B", text: "Usuários présbitas que necessitam de visão nítida contínua (perto, intermediário e longe)" },
            { id: "C", text: "Somente para prática de esportes aquáticos" },
            { id: "D", text: "Pacientes sem nenhuma queixa de visão cansada" },
          ],
          correctAnswer: "B",
        },
        {
          id: "q3",
          quizId: "quiz_gold_comfort",
          questionText: "Explique com suas palavras como você abordaria um cliente receoso de usar lentes multifocais, utilizando os diferenciais da Gold Comfort IA.",
          type: "dissertative",
          orderIndex: 3,
          points: 50,
          rubricKeywords: [
            "adaptação",
            "campo de visão",
            "inteligência",
            "suavidade",
            "garantia",
            "conforto",
            "distorção",
          ],
        },
      ],
    },
  ];

  // Categorias de Treinamentos Cadastradas
  public categories: Category[] = [
    {
      id: "cat_multifocais",
      name: "Lentes Multifocais",
      description: "Geometrias progressivas, campos visuais ampliados e personalização digital Freeform.",
      coursesCount: 1,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "cat_tecnologia",
      name: "Tratamentos & Tecnologia",
      description: "Camadas antirreflexo de alta durabilidade, proteção UV400, luz azul e fotossensíveis.",
      coursesCount: 1,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "cat_comercial",
      name: "Atendimento & Venda Consultiva",
      description: "Técnicas de abordagem, sondagem de necessidades e superação de objeções no balcão.",
      coursesCount: 1,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "cat_optometria",
      name: "Optometria & Medidas Ópticas",
      description: "Tomada precisa de DNP, altura pupilar, ângulo pantoscópico e ergonomia visual.",
      coursesCount: 1,
      createdAt: new Date("2026-01-01").toISOString(),
    },
    {
      id: "cat_laboratorio",
      name: "Laboratório & Montagem",
      description: "Bisotagem, montagem em armações especiais, verificação no lensômetro e controle de qualidade.",
      coursesCount: 1,
      createdAt: new Date("2026-01-01").toISOString(),
    },
  ];

  // Configurações Globais do Sistema (Área de Login e Identidade Visual)
  public settings: SystemSettings = {
    loginHeroImageUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=1200&auto=format&fit=crop",
    loginHeroTitle: "Capacitação Técnica de Alta Performance",
    loginHeroSubtitle: "Aumente a conversão de lentes de valor agregado, elimine erros de adaptação e garanta a satisfação do cliente da ótica.",
    updatedAt: new Date("2026-01-01").toISOString(),
  };

  // Certificados Oficiais Emitidos
  public certificates: IssuedCertificate[] = [
    {
      id: "cert_aluno_gc_01",
      userId: "usr_aluno",
      userName: "JULIANA CONSULTORA ÓPTICA",
      courseId: "course_gold_comfort",
      courseTitle: "Treinamento Comercial: Linha Gold Comfort IA",
      category: "Lentes Multifocais",
      templateId: "1",
      location: "São Paulo - SP",
      score: 85,
      issuedAt: new Date("2026-02-15T14:30:00Z").toISOString(),
      verificationCode: "SRL-CERT-2026-GC85",
    },
  ];

  public quizAttempts: QuizAttempt[] = [];

  // Logs de Auditoria do Sistema
  public auditLogs: AuditLog[] = [
    {
      id: "log_init_01",
      userId: "usr_master",
      userEmail: "admin@optica.com.br",
      action: "USER_REGISTERED",
      ipAddress: "127.0.0.1",
      userAgent: "A.T.L.A.S. System Init",
      metadata: { role: "ADMINISTRADOR MASTER", systemInit: true },
      createdAt: new Date("2026-01-01T08:00:00Z").toISOString(),
    },
  ];

  constructor() {
    this.loadFromDisk();
  }

  /**
   * Salva o estado atual do banco de dados no disco rígido para evitar perda em F5/Ctrl+F5
   */
  public saveToDisk(): void {
    if (typeof window !== "undefined") return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, "database.json");
      const payload = {
        stores: this.stores,
        roles: this.roles,
        profiles: this.profiles,
        courses: this.courses,
        modules: this.modules,
        lessonProgress: this.lessonProgress,
        quizzes: this.quizzes,
        quizAttempts: this.quizAttempts,
        auditLogs: this.auditLogs,
        categories: this.categories,
        settings: this.settings,
        certificates: this.certificates,
        userCredentials: this.userCredentials,
        userCourses: this.userCourses,
      };
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
    } catch {
      // Ignora erro em ambientes restritos
    }
  }

  /**
   * Carrega os dados persistidos do disco rígido
   */
  public loadFromDisk(): boolean {
    if (typeof window !== "undefined") return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const filePath = path.join(process.cwd(), "data", "database.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(raw);
        if (Array.isArray(data.stores)) this.stores = data.stores;
        if (Array.isArray(data.roles)) this.roles = data.roles;
        if (Array.isArray(data.profiles)) this.profiles = data.profiles;
        if (Array.isArray(data.courses)) this.courses = data.courses;
        if (Array.isArray(data.modules)) this.modules = data.modules;
        if (Array.isArray(data.lessonProgress)) this.lessonProgress = data.lessonProgress;
        if (Array.isArray(data.quizzes)) this.quizzes = data.quizzes;
        if (Array.isArray(data.quizAttempts)) this.quizAttempts = data.quizAttempts;
        if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
        if (Array.isArray(data.categories)) this.categories = data.categories;
        if (data.settings && typeof data.settings === "object") this.settings = data.settings;
        if (Array.isArray(data.certificates)) this.certificates = data.certificates;
        if (data.userCredentials && typeof data.userCredentials === "object") this.userCredentials = data.userCredentials;
        if (Array.isArray(data.userCourses)) this.userCourses = data.userCourses;
        return true;
      }
    } catch {
      // Ignora erro de leitura
    }
    return false;
  }
}

// Instância Singleton do Banco
const globalDb = global as unknown as { __opticaDb?: DatabaseStore };
export const db = globalDb.__opticaDb || new DatabaseStore();
if (process.env.NODE_ENV !== "production") {
  globalDb.__opticaDb = db;
}
