"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
} from "lucide-react";
import { Profile } from "@/types/database";
import { ThemeToggle } from "@/components/theme-provider";
import { InstagramProfileModal } from "@/components/ui/instagram-profile-modal";

interface AdminSidebarProps {
  initialUser: Profile | null;
}

export function AdminSidebar({ initialUser }: AdminSidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<Profile | null>(initialUser);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isDragging, setIsDragging] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedWidth = localStorage.getItem("optica_sidebar_width");
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= 64 && parsed <= 500) {
        setSidebarWidth(parsed);
      }
    }

    const savedCollapsed = localStorage.getItem("optica_sidebar_collapsed");
    if (savedCollapsed === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("optica_sidebar_collapsed", String(next));
  };

  // Arrastador de Redimensionamento com o Mouse
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      let newWidth = moveEvent.clientX;
      if (newWidth < 100) {
        setIsCollapsed(true);
        newWidth = 72;
      } else {
        setIsCollapsed(false);
        if (newWidth > 420) newWidth = 420;
      }
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      localStorage.setItem("optica_sidebar_width", String(sidebarWidth));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const navItems = [
    { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/admin/users", label: "Lista de Usuários", icon: Users },
    { href: "/admin/roles", label: "Cadastro de Funções", icon: Briefcase },
    { href: "/admin/courses", label: "Gestão de Cursos", icon: BookOpen },
    { href: "/admin/quizzes", label: "Quizzes & Moderação", icon: HelpCircle },
    { href: "/admin/reports", label: "Evolução & Notas", icon: BarChart3 },
    { href: "/admin/emails", label: "Métricas de E-mails", icon: Mail },
    { href: "/admin/messages", label: "Gestão de Mensagens", icon: MessageSquare },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

  if (currentUser?.accessLevel === "master") {
    navItems.push({ href: "/admin/audit-logs", label: "Logs de Auditoria", icon: ShieldCheck });
  }

  const effectiveWidth = isCollapsed ? 72 : sidebarWidth;

  return (
    <>
      <aside
        ref={sidebarRef}
        style={{ width: `${effectiveWidth}px` }}
        className={`bg-zinc-950 border-r border-white/10 flex flex-col justify-between shrink-0 relative transition-[width] duration-150 select-none ${
          isDragging ? "transition-none" : ""
        }`}
      >
        {/* Topo da Sidebar */}
        <div className="p-4 flex flex-col">
          {/* Header com Logo e Botão Encolher/Expandir */}
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed ? (
              <Link href="/admin" className="flex items-center gap-2.5 truncate">
                <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 shrink-0">
                  <Glasses className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h1 className="font-bold text-xs tracking-tight text-white truncate">GESTÃO ÓPTICA</h1>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-wider truncate">
                    {currentUser?.accessLevel === "master" ? "SUPERADMIN" : "GERENTE DE LOJA"}
                  </p>
                </div>
              </Link>
            ) : (
              <Link href="/admin" className="mx-auto" title="Gestão Óptica">
                <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
                  <Glasses className="w-5 h-5" />
                </div>
              </Link>
            )}

            {/* Botão de Toggle Encolher/Expandir */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={toggleCollapse}
                title="Encolher Menu Lateral"
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Botão recolhido para expandir */}
          {isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Expandir Menu Lateral"
              className="mb-4 mx-auto p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Navegação Principal */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-violet-600 text-white font-semibold shadow-md shadow-violet-950/40"
                      : "text-zinc-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-violet-400"}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar com Foto Estilo Instagram & Ações */}
        <div className="p-4 border-t border-white/5 space-y-3 bg-zinc-950/60">
          {/* Avatar Estilo Instagram Stories */}
          <div
            onClick={() => setProfileModalOpen(true)}
            title="Minha Conta (Clique para abrir perfil Instagram)"
            className={`flex items-center gap-3 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* Círculo com Anel Gradiente Estilo Instagram Stories */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center border border-black">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs">
                      {currentUser?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isCollapsed && (
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-white truncate group-hover:text-violet-200">
                  {currentUser?.name || "USUÁRIO"}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {currentUser?.storeName || "Ver Perfil"}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span>Aluno</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/sign-in"
                className="text-[11px] text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {isCollapsed && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <ThemeToggle />
              <Link
                href="/sign-in"
                className="text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Divisor Arrastável na borda direita (Draggable Resize Handle) */}
        <div
          onMouseDown={startResizing}
          title="Arraste para redimensionar o menu lateral"
          className="absolute top-0 right-0 bottom-0 w-1.5 hover:w-2 bg-transparent hover:bg-violet-500/50 cursor-col-resize transition-all z-20 group"
        >
          <div className="w-0.5 h-8 bg-white/20 group-hover:bg-violet-400 rounded-full mx-auto my-auto absolute top-1/2 -translate-y-1/2 right-0.5" />
        </div>
      </aside>

      {/* Modal de Perfil Estilo Instagram */}
      <InstagramProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={currentUser}
        onProfileUpdated={(updated) => setCurrentUser(updated)}
      />
    </>
  );
}
