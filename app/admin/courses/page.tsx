"use client";

import { useEffect, useState, useTransition } from "react";
import {
  BookOpen,
  Plus,
  Video,
  FileText,
  UserCheck,
  CheckCircle2,
  Trash2,
  Pencil,
  ExternalLink,
  Award,
  Layers,
  HelpCircle,
  X,
  Save,
  Clock,
  Sparkles,
  PlayCircle,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getAllCoursesAdminAction,
  getUsersListAction,
  getUserCourseAccessMatrixAction,
  toggleCourseVisibilityForUserAction,
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  getCourseFullDetailsAction,
  saveCourseStructureAction,
} from "@/app/actions/admin";
import { Course, Profile, Module, Lesson, Quiz, QuizQuestion } from "@/types/database";

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "permissions">("timeline");

  // Estado do Modal de Criação / Edição Estrutural
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"general" | "pdf" | "modules" | "quiz" | "certificate">("general");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Campos do formulário estrutural
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("Comercial & Atendimento");
  const [estimatedDurationMin, setEstimatedDurationMin] = useState(120);
  const [isPublished, setIsPublished] = useState(true);
  const [pdfAttachmentName, setPdfAttachmentName] = useState("Apostila Oficial do Treinamento.pdf");
  const [pdfAttachmentUrl, setPdfAttachmentUrl] = useState("");
  const [certificateEnabled, setCertificateEnabled] = useState(true);
  const [minScoreToPass, setMinScoreToPass] = useState(70);

  // Módulos e Aulas
  const [modules, setModules] = useState<
    {
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
    }[]
  >([]);

  // Quiz
  const [quizTitle, setQuizTitle] = useState("Avaliação Final de Certificação");
  const [quizQuestions, setQuizQuestions] = useState<
    {
      id?: string;
      questionText: string;
      type: "multiple_choice" | "dissertative";
      points: number;
      orderIndex: number;
      options: { id: string; text: string }[];
      correctAnswer: string;
    }[]
  >([]);

  const [isSaving, startSaving] = useTransition();

  const loadData = async () => {
    const coursesList = await getAllCoursesAdminAction();
    setCourses(coursesList);
    const usersRes = await getUsersListAction({ pageSize: 50 });
    setUsers(usersRes.users);
    if (usersRes.users.length > 0 && !selectedUser) {
      setSelectedUser(usersRes.users[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      getUserCourseAccessMatrixAction(selectedUser).then((matrix) => {
        const map: Record<string, boolean> = {};
        matrix.forEach((item) => {
          map[item.courseId] = item.isEnabled;
        });
        setUserPermissions(map);
      });
    }
  }, [selectedUser]);

  const handleToggleCourse = async (courseId: string) => {
    if (!selectedUser) return;
    const currentState = !!userPermissions[courseId];
    const newState = !currentState;

    setUserPermissions((prev) => ({ ...prev, [courseId]: newState }));
    await toggleCourseVisibilityForUserAction(selectedUser, courseId, newState);

    const targetUser = users.find((u) => u.id === selectedUser);
    setFeedback(`Permissão do curso atualizada para ${targetUser?.name || "o colaborador"}.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Abrir Modal para Criar Novo Treinamento
  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setTitle("");
    setDescription("");
    setThumbnailUrl("https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=800&auto=format&fit=crop");
    setCategory("Comercial & Atendimento");
    setEstimatedDurationMin(120);
    setIsPublished(true);
    setPdfAttachmentName("Apostila Técnica do Treinamento.pdf");
    setPdfAttachmentUrl("/TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf");
    setCertificateEnabled(true);
    setMinScoreToPass(70);

    // Módulos iniciais pré-configurados para agilidade
    setModules([
      {
        title: "Módulo 1: Fundamentos e Tecnologia Óptica",
        description: "Introdução conceitual, diferenciais de produto e argumentação.",
        orderIndex: 1,
        lessons: [
          {
            title: "Aula 1: Apresentação da Linha e Conceitos Chave",
            videoProvider: "youtube",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            durationSeconds: 720,
            orderIndex: 1,
          },
        ],
      },
    ]);

    setQuizTitle("Avaliação de Certificação Oficial");
    setQuizQuestions([
      {
        questionText: "Qual é o principal benefício destacado neste treinamento para o paciente?",
        type: "multiple_choice",
        points: 25,
        orderIndex: 1,
        options: [
          { id: "A", text: "Apenas redução do tempo de montagem" },
          { id: "B", text: "Conforto visual aprimorado e adaptação espontânea" },
          { id: "C", text: "Ausência de necessidade de tomada de medidas pupilares" },
          { id: "D", text: "Disponibilidade em somente uma armação" },
        ],
        correctAnswer: "B",
      },
    ]);

    setModalTab("general");
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Treinamento Existente
  const handleOpenEditModal = async (course: Course) => {
    setEditingCourseId(course.id);
    setTitle(course.title);
    setDescription(course.description);
    setThumbnailUrl(course.thumbnailUrl);
    setCategory(course.category || "Comercial & Técnico");
    setEstimatedDurationMin(course.estimatedDurationMin || 120);
    setIsPublished(course.isPublished);
    setPdfAttachmentName(course.pdfAttachmentName || "Apostila Oficial.pdf");
    setPdfAttachmentUrl(course.pdfAttachmentUrl || "");
    setCertificateEnabled(course.certificateEnabled !== false);
    setMinScoreToPass(course.minScoreToPass || 70);

    // Buscar detalhes com módulos e quiz do servidor
    const details = await getCourseFullDetailsAction(course.id);
    if (details.modules.length > 0) {
      setModules(
        details.modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          orderIndex: m.orderIndex,
          lessons: (m.lessons || []).map((l) => ({
            id: l.id,
            title: l.title,
            description: l.description,
            videoProvider: l.videoProvider as any,
            videoUrl: l.videoUrl,
            durationSeconds: l.durationSeconds,
            orderIndex: l.orderIndex,
          })),
        }))
      );
    } else {
      setModules([]);
    }

    if (details.quiz) {
      setQuizTitle(details.quiz.title);
      setQuizQuestions(
        (details.quiz.questions || []).map((q) => ({
          id: q.id,
          questionText: q.questionText,
          type: q.type,
          points: q.points,
          orderIndex: q.orderIndex,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "A",
        }))
      );
    } else {
      setQuizTitle("Avaliação de Certificação");
      setQuizQuestions([]);
    }

    setModalTab("general");
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este treinamento e todos os seus módulos e quizzes?")) {
      return;
    }
    const res = await deleteCourseAction(courseId);
    if (res.success) {
      setFeedback("Treinamento excluído com sucesso.");
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } else {
      alert(res.error || "Erro ao excluir curso.");
    }
  };

  // Funções de manipulação de Módulos e Aulas
  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Módulo ${prev.length + 1}: Novo Módulo`,
        description: "",
        orderIndex: prev.length + 1,
        lessons: [
          {
            title: "Aula 1: Introdução ao Módulo",
            videoProvider: "youtube",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            durationSeconds: 600,
            orderIndex: 1,
          },
        ],
      },
    ]);
  };

  const handleRemoveModule = (mIdx: number) => {
    setModules((prev) => prev.filter((_, idx) => idx !== mIdx));
  };

  const handleAddLesson = (mIdx: number) => {
    setModules((prev) => {
      const clone = [...prev];
      const targetMod = clone[mIdx];
      targetMod.lessons.push({
        title: `Aula ${targetMod.lessons.length + 1}: Nova Aula em Vídeo`,
        videoProvider: "youtube",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        durationSeconds: 600,
        orderIndex: targetMod.lessons.length + 1,
      });
      return clone;
    });
  };

  const handleRemoveLesson = (mIdx: number, lIdx: number) => {
    setModules((prev) => {
      const clone = [...prev];
      clone[mIdx].lessons = clone[mIdx].lessons.filter((_, idx) => idx !== lIdx);
      return clone;
    });
  };

  // Funções de manipulação do Quiz
  const handleAddQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        questionText: `Pergunta ${prev.length + 1}: Digite o enunciado da questão avaliativa...`,
        type: "multiple_choice",
        points: 25,
        orderIndex: prev.length + 1,
        options: [
          { id: "A", text: "Alternativa A" },
          { id: "B", text: "Alternativa B" },
          { id: "C", text: "Alternativa C" },
          { id: "D", text: "Alternativa D" },
        ],
        correctAnswer: "A",
      },
    ]);
  };

  const handleRemoveQuestion = (qIdx: number) => {
    setQuizQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  // Salvar Treinamento Completo
  const handleSaveCompleteCourse = () => {
    if (!title.trim()) {
      alert("Informe o título do treinamento.");
      return;
    }

    startSaving(async () => {
      let targetId = editingCourseId;

      if (!targetId) {
        // Criar novo curso
        const created = await createCourseAction({
          title,
          description,
          thumbnailUrl,
          category,
          estimatedDurationMin,
          isPublished,
          pdfAttachmentName,
          pdfAttachmentUrl,
          certificateEnabled,
          minScoreToPass,
        });
        if (!created.success || !created.course) {
          alert(created.error || "Falha ao criar treinamento.");
          return;
        }
        targetId = created.course.id;
      } else {
        // Atualizar curso existente
        await updateCourseAction(targetId, {
          title,
          description,
          thumbnailUrl,
          category,
          estimatedDurationMin,
          isPublished,
          pdfAttachmentName,
          pdfAttachmentUrl,
          certificateEnabled,
          minScoreToPass,
        });
      }

      // Salvar a estrutura de Módulos, Aulas e Quiz
      await saveCourseStructureAction(targetId, {
        modules,
        quiz: {
          title: quizTitle,
          minScoreToPass,
          questions: quizQuestions,
        },
      });

      setFeedback("Treinamento estruturado e salvo com sucesso!");
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  return (
    <div className="space-y-8 animate-element max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Configurações &raquo; Centro de Gestão e Criação de Treinamentos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gestão Estrutural de Treinamentos
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Crie novos cursos, estruture módulos e aulas em vídeo (YouTube/Vimeo/MP4), anexe apostilas em PDF,
            configure avaliações com gabarito e gerencie a linha do tempo de avanço de cada treinamento.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-950 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Treinamento</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Navegação entre Abas */}
      <div className="flex border-b border-white/10 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === "timeline" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>Catálogo & Linha do Tempo ({courses.length})</span>
          {activeTab === "timeline" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === "permissions" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>Matriz de Liberação por Colaborador</span>
          {activeTab === "permissions" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Conteúdo Aba 1: Catálogo e Timeline dos Cursos */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between hover:border-violet-500/40 transition-all group"
            >
              <div>
                {/* Capa / Thumbnail */}
                <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Badges superiores */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-violet-600/90 text-white backdrop-blur-md">
                      {course.category || "Treinamento Oficial"}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md ${
                        course.isPublished
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {course.isPublished ? "Publicado" : "Rascunho"}
                    </span>
                  </div>

                  {course.certificateEnabled && (
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300" title="Certificado Habilitado">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-base font-bold text-white line-clamp-1">{course.title}</h2>
                  </div>
                </div>

                {/* Detalhes do Treinamento */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Grade de Indicadores do Curso */}
                  <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-black/40 border border-white/5 text-xs">
                    <div>
                      <span className="block font-bold text-white text-sm">
                        {course.modulesCount || 2}
                      </span>
                      <span className="text-[10px] text-zinc-500">Módulos</span>
                    </div>
                    <div>
                      <span className="block font-bold text-violet-400 text-sm">
                        {course.lessonsCount || 4}
                      </span>
                      <span className="text-[10px] text-zinc-500">Aulas em Vídeo</span>
                    </div>
                    <div>
                      <span className="block font-bold text-emerald-400 text-sm">
                        {Math.round((course.estimatedDurationMin || 120) / 60)}h
                      </span>
                      <span className="text-[10px] text-zinc-500">Carga Horária</span>
                    </div>
                  </div>

                  {/* Material em PDF */}
                  {course.pdfAttachmentUrl && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs border border-white/5">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-zinc-300 truncate text-[11px]">
                          {course.pdfAttachmentName || "Apostila Oficial"}
                        </span>
                      </div>
                      <a
                        href={course.pdfAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold shrink-0"
                      >
                        Baixar
                      </a>
                    </div>
                  )}

                  {/* Timeline de Execução e Avanço do Curso */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Estruturação do Treinamento</span>
                      <span className="text-emerald-400 font-medium">100% Concluído</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações do Card */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-white/5 mt-2">
                <button
                  onClick={() => handleOpenEditModal(course)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-violet-400" />
                  <span>Estruturar Treinamento</span>
                </button>

                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                  title="Excluir Treinamento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo Aba 2: Matriz de Permissões */}
      {activeTab === "permissions" && (
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">
                Matriz de Permissões: Habilitar / Desabilitar Cursos por Colaborador
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Selecione o Usuário:</span>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleTitle || "Aluno"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Treinamento</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5">Carga Horária</th>
                  <th className="p-3.5">Certificado</th>
                  <th className="p-3.5 text-right rounded-r-xl">Acesso do Colaborador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((course) => {
                  const isEnabled = !!userPermissions[course.id];
                  return (
                    <tr key={course.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-white">{course.title}</td>
                      <td className="p-3.5 text-zinc-400">{course.category || "Oficial"}</td>
                      <td className="p-3.5 text-zinc-400">{Math.round((course.estimatedDurationMin || 120) / 60)}h</td>
                      <td className="p-3.5">
                        {course.certificateEnabled ? (
                          <span className="text-emerald-400 font-semibold">Sim (&ge; {course.minScoreToPass || 70}%)</span>
                        ) : (
                          <span className="text-zinc-500">Não</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleCourse(course.id)}
                          className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                            isEnabled
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {isEnabled ? "Liberado" : "Bloqueado"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL ESTRUTURADOR DE TREINAMENTO (Criação e Edição Completa) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-element">
          <div className="w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header do Modal */}
            <div className="p-6 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span>{editingCourseId ? "Estruturar Treinamento Existente" : "Cadastrar Novo Treinamento"}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure módulos, aulas com vídeos, apostila em PDF, avaliação e regras de certificação.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-abas internas do Editor Estrutural */}
            <div className="flex border-b border-white/5 px-6 gap-6 text-xs font-semibold bg-zinc-900/20 shrink-0">
              <button
                onClick={() => setModalTab("general")}
                className={`py-3 transition-colors relative cursor-pointer ${
                  modalTab === "general" ? "text-violet-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                1. Informações Gerais
                {modalTab === "general" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
              </button>

              <button
                onClick={() => setModalTab("pdf")}
                className={`py-3 transition-colors relative cursor-pointer ${
                  modalTab === "pdf" ? "text-violet-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                2. Apostila / PDF
                {modalTab === "pdf" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
              </button>

              <button
                onClick={() => setModalTab("modules")}
                className={`py-3 transition-colors relative cursor-pointer ${
                  modalTab === "modules" ? "text-violet-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                3. Módulos & Vídeos ({modules.length})
                {modalTab === "modules" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
              </button>

              <button
                onClick={() => setModalTab("quiz")}
                className={`py-3 transition-colors relative cursor-pointer ${
                  modalTab === "quiz" ? "text-violet-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                4. Avaliação & Quiz ({quizQuestions.length})
                {modalTab === "quiz" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
              </button>

              <button
                onClick={() => setModalTab("certificate")}
                className={`py-3 transition-colors relative cursor-pointer ${
                  modalTab === "certificate" ? "text-violet-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                5. Certificado Oficial
                {modalTab === "certificate" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
              </button>
            </div>

            {/* Conteúdo com Scroll da Sub-aba Ativa */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
              {/* SUB-ABA 1: GERAL */}
              {modalTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-zinc-400 block mb-1.5 font-medium">Título Oficial do Treinamento</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Treinamento Comercial: Linha Gold Comfort IA"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 font-medium">Descrição Técnica e Comercial</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva os objetivos de aprendizagem para os consultores ópticos..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-zinc-400 block mb-1.5 font-medium">Categoria</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex: Lentes Multifocais"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1.5 font-medium">Carga Horária Estimada (min)</label>
                      <input
                        type="number"
                        value={estimatedDurationMin}
                        onChange={(e) => setEstimatedDurationMin(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1.5 font-medium">Status de Publicação</label>
                      <select
                        value={isPublished ? "true" : "false"}
                        onChange={(e) => setIsPublished(e.target.value === "true")}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="true">Publicado para Alunos</option>
                        <option value="false">Rascunho (Oculto)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 font-medium">URL da Imagem de Capa (Thumbnail)</label>
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* SUB-ABA 2: PDF */}
              {modalTab === "pdf" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-300">
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Material Didático em PDF
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      O arquivo anexado fica disponível diretamente na área do aluno para estudo, revisão e download de apostilas oficiais.
                    </p>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 font-medium">Nome do Arquivo PDF</label>
                    <input
                      type="text"
                      value={pdfAttachmentName}
                      onChange={(e) => setPdfAttachmentName(e.target.value)}
                      placeholder="Ex: Manual de Prescrição Gold Comfort IA.pdf"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 font-medium">Caminho ou Link do PDF</label>
                    <input
                      type="text"
                      value={pdfAttachmentUrl}
                      onChange={(e) => setPdfAttachmentUrl(e.target.value)}
                      placeholder="Ex: /TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf ou URL externa"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* SUB-ABA 3: MÓDULOS E AULAS COM VÍDEOS */}
              {modalTab === "modules" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Estrutura de Conteúdo Modular</h4>
                      <p className="text-zinc-400 text-[11px]">Organize o treinamento em módulos e adicione videoaulas.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Módulo</span>
                    </button>
                  </div>

                  {modules.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-white/5">
                      <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-400">Nenhum módulo adicionado ainda.</p>
                      <button
                        type="button"
                        onClick={handleAddModule}
                        className="mt-3 text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                      >
                        Clique para criar o primeiro módulo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modules.map((mod, mIdx) => (
                        <div key={mIdx} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) => {
                                const clone = [...modules];
                                clone[mIdx].title = e.target.value;
                                setModules(clone);
                              }}
                              className="font-bold text-white bg-transparent border-b border-white/10 focus:border-violet-500 focus:outline-none pb-1 flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(mIdx)}
                              className="text-zinc-500 hover:text-red-400 p-1"
                              title="Remover Módulo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Aulas do Módulo */}
                          <div className="pl-4 border-l-2 border-violet-500/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                                Aulas do Módulo ({mod.lessons.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddLesson(mIdx)}
                                className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Adicionar Aula</span>
                              </button>
                            </div>

                            {mod.lessons.map((les, lIdx) => (
                              <div key={lIdx} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={les.title}
                                    onChange={(e) => {
                                      const clone = [...modules];
                                      clone[mIdx].lessons[lIdx].title = e.target.value;
                                      setModules(clone);
                                    }}
                                    placeholder="Título da aula"
                                    className="font-medium text-white bg-transparent border-b border-white/10 focus:border-violet-500 focus:outline-none pb-0.5 text-xs flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLesson(mIdx, lIdx)}
                                    className="text-zinc-500 hover:text-red-400 p-1"
                                    title="Remover Aula"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[10px] text-zinc-500 block mb-0.5">Provedor</label>
                                    <select
                                      value={les.videoProvider}
                                      onChange={(e) => {
                                        const clone = [...modules];
                                        clone[mIdx].lessons[lIdx].videoProvider = e.target.value as any;
                                        setModules(clone);
                                      }}
                                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px]"
                                    >
                                      <option value="youtube">YouTube Embed</option>
                                      <option value="vimeo">Vimeo</option>
                                      <option value="direct_mp4">MP4 Direto</option>
                                    </select>
                                  </div>

                                  <div className="sm:col-span-2">
                                    <label className="text-[10px] text-zinc-500 block mb-0.5">URL do Vídeo</label>
                                    <input
                                      type="text"
                                      value={les.videoUrl}
                                      onChange={(e) => {
                                        const clone = [...modules];
                                        clone[mIdx].lessons[lIdx].videoUrl = e.target.value;
                                        setModules(clone);
                                      }}
                                      placeholder="https://www.youtube.com/watch?v=..."
                                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-[10px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-ABA 4: QUIZ E AVALIAÇÃO */}
              {modalTab === "quiz" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Configuração da Avaliação / Quiz</h4>
                      <p className="text-zinc-400 text-[11px]">Perguntas com gabarito automático para aprovação do aluno.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Pergunta</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-400 block mb-1">Título do Quiz</label>
                      <input
                        type="text"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Nota Mínima de Aprovação (%)</label>
                      <input
                        type="number"
                        value={minScoreToPass}
                        onChange={(e) => setMinScoreToPass(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-violet-400">Questão {qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-zinc-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="text-zinc-500 block mb-1 text-[11px]">Enunciado da Pergunta</label>
                          <input
                            type="text"
                            value={q.questionText}
                            onChange={(e) => {
                              const clone = [...quizQuestions];
                              clone[qIdx].questionText = e.target.value;
                              setQuizQuestions(clone);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                          />
                        </div>

                        {/* Alternativas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <span className="font-bold text-zinc-400">{opt.id}:</span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const clone = [...quizQuestions];
                                  clone[qIdx].options[oIdx].text = e.target.value;
                                  setQuizQuestions(clone);
                                }}
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-[11px]">Resposta Correta (Gabarito):</span>
                            <select
                              value={q.correctAnswer}
                              onChange={(e) => {
                                const clone = [...quizQuestions];
                                clone[qIdx].correctAnswer = e.target.value;
                                setQuizQuestions(clone);
                              }}
                              className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-emerald-400 font-bold"
                            >
                              <option value="A">Alternativa A</option>
                              <option value="B">Alternativa B</option>
                              <option value="C">Alternativa C</option>
                              <option value="D">Alternativa D</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-[11px]">Pontuação:</span>
                            <input
                              type="number"
                              value={q.points}
                              onChange={(e) => {
                                const clone = [...quizQuestions];
                                clone[qIdx].points = Number(e.target.value);
                                setQuizQuestions(clone);
                              }}
                              className="w-16 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-white text-center"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-ABA 5: CERTIFICADO */}
              {modalTab === "certificate" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> Certificação Oficial de Conclusão
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Ao atingir a pontuação mínima na avaliação final e concluir 100% das videoaulas, o aluno recebe o certificado em PDF com selo corporativo e notificação automática pelo Resend.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <input
                      type="checkbox"
                      id="certCheck"
                      checked={certificateEnabled}
                      onChange={(e) => setCertificateEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600"
                    />
                    <label htmlFor="certCheck" className="text-white font-medium cursor-pointer">
                      Habilitar Emissão Automática de Certificado para este Treinamento
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé Fixo do Modal com Ação de Salvar */}
            <div className="p-5 border-t border-white/5 bg-zinc-900/50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-zinc-500">
                Linha Gold Comfort IA &bull; Guia Smartplay &bull; Rede SRL
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveCompleteCourse}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-950 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Salvando Treinamento..." : "Salvar Treinamento Completo"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
