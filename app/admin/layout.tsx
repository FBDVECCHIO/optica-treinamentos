import Link from "next/link";
import {
  Glasses,
  Users,
  Briefcase,
  BookOpen,
  HelpCircle,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  ExternalLink,
  LogOut,
  Mail,
  MessageSquare,
} from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const userName = user?.name || "ADMINISTRADOR MASTER";
  const userRole = user?.accessLevel === "master" ? "SUPERADMIN" : "GERENTE DE LOJA";
  const storeName = user?.storeName || "REDE DE ÓPTICAS";

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col md:flex-row">
      {/* Sidebar de Gestão */}
      <aside className="w-full md:w-64 bg-zinc-950 border-r border-white/10 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white">GESTÃO ÓPTICA</h1>
              <p className="text-[10px] text-zinc-400 uppercase">{userRole}</p>
            </div>
          </Link>

          {/* Links do Menu Administrativo */}
          <nav className="space-y-1 text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-violet-400" />
              <span>Visão Geral</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Users className="w-4 h-4 text-violet-400" />
              <span>Lista de Usuários</span>
            </Link>

            <Link
              href="/admin/roles"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-violet-400" />
              <span>Cadastro de Funções</span>
            </Link>

            <Link
              href="/admin/courses"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span>Gestão de Cursos</span>
            </Link>

            <Link
              href="/admin/quizzes"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-violet-400" />
              <span>Quizzes & Moderação</span>
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span>Evolução & Notas</span>
            </Link>

            <Link
              href="/admin/emails"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Mail className="w-4 h-4 text-violet-400" />
              <span>Métricas de E-mails</span>
            </Link>

            <Link
              href="/admin/messages"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span>Gestão de Mensagens</span>
            </Link>

            {user?.accessLevel === "master" && (
              <Link
                href="/admin/audit-logs"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Logs de Auditoria</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Footer da Sidebar com dados do gestor */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-colors"
          >
            <span>Ver como Aluno</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-xs">
            <p className="font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-zinc-400 truncate">{storeName}</p>
          </div>

          <Link
            href="/sign-in"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 transition-colors px-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </Link>
        </div>
      </aside>

      {/* Conteúdo Principal do Painel */}
      <main className="flex-1 p-6 sm:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
