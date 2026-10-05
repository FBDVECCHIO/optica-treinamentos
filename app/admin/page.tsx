import Link from "next/link";
import { Users, Building2, BookOpen, HelpCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { db } from "@/lib/db/mock-store";

export default function AdminOverviewPage() {
  const totalUsers = db.profiles.length;
  const totalStores = db.stores.length;
  const totalCourses = db.courses.length;
  const totalAttempts = db.quizAttempts.length;
  const recentLogs = db.auditLogs.slice(0, 5);

  return (
    <div className="space-y-8 animate-element">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Painel de Controle e Gestão da Rede
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Supervisão consolidada de lojas, usuários cadastrados, matriz de treinamentos e segurança.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Usuários Cadastrados</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalUsers}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Consultores e Gerentes</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Lojas / CNPJs</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{totalStores}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Filiais credenciadas</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Cursos Ativos</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{totalCourses}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Gold Comfort & Smartplay</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Quizzes Realizados</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{totalAttempts}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Tentativas submetidas</p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/users"
          className="p-6 rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-violet-500/30 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
              Gestão de Usuários
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Listar colaboradores, redefinir senhas, habilitar acessos e filtrar por loja e cargo.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-400 font-medium">
            <span>Acessar Tabela</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/roles"
          className="p-6 rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-violet-500/30 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
              Cadastro de Funções
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Gerenciar os cargos disponíveis no dropdown do cadastro público de colaboradores.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span>Gerenciar Funções</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/courses"
          className="p-6 rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-violet-500/30 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
              Matriz de Cursos
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Habilitar e desabilitar treinamentos individualmente por usuário ou filial.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <span>Configurar Matriz</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Logs de Auditoria Recentes */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Eventos Recentes de Auditoria</h3>
          </div>
          <Link href="/admin/audit-logs" className="text-xs text-violet-400 hover:underline">
            Ver Todos os Logs
          </Link>
        </div>

        <div className="divide-y divide-white/5 text-xs">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-zinc-300 font-semibold">{log.action}</span>
                <span className="text-zinc-500 ml-2">&bull; {log.userEmail || "Sistema"}</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                {new Date(log.createdAt).toLocaleTimeString("pt-BR")} &bull; IP: {log.ipAddress}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
