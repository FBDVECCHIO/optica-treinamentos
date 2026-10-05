"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Video,
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from "lucide-react";
import {
  getAllCoursesAdminAction,
  getUsersListAction,
  getUserCourseAccessMatrixAction,
  toggleCourseVisibilityForUserAction,
} from "@/app/actions/admin";
import { Course, Profile } from "@/types/database";

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    getAllCoursesAdminAction().then(setCourses);
    getUsersListAction({ pageSize: 50 }).then((res) => {
      setUsers(res.users);
      if (res.users.length > 0) {
        setSelectedUser(res.users[0].id);
      }
    });
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
    setFeedback(`Permissão do curso atualizada para ${targetUser?.name || "o usuário"}.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-8 animate-element">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Configurações &raquo; Gestão de Conteúdo e Acessos</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Gestão de Cursos e Matriz de Liberação por Usuário
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Ative ou desative o acesso a qualquer curso individualmente para cada colaborador ou gerente de óptica.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Matriz de Habilitação Individual Solicitada */}
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
              className="bg-black/50 border border-white/10 text-xs text-white rounded-2xl px-3 py-2 focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-zinc-900">
                  {u.name} ({u.roleTitle || u.accessLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-black/20">
          {courses.map((course) => {
            const isEnabled = !!userPermissions[course.id];
            return (
              <div key={course.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{course.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {course.modulesCount || 2} Módulos &bull; PDF Anexo: {course.pdfAttachmentName || "Sim"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleCourse(course.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isEnabled
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {isEnabled ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                      <span>Habilitado</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-red-400" />
                      <span>Desabilitado</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Geral de Cursos da Plataforma */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Cursos Cadastrados na Plataforma</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-semibold text-white">{course.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold">
                    Publicado
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-violet-400" /> Aulas em Vídeo
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-red-400" /> Apostila PDF
                  </span>
                </div>

                <a
                  href={`/courses/${course.id}`}
                  className="text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Abrir Player</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
