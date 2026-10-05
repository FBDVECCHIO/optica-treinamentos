import Link from "next/link";
import { Glasses, User, LogOut, Shield, BookOpen, LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const userName = user?.name || "COLABORADOR ÓPTICO";
  const userRole = user?.roleTitle || "CONSULTOR ÓPTICO";
  const storeName = user?.storeName || "ÓPTICA SRL MATRIZ";
  const isPrivileged = user?.accessLevel === "master" || user?.accessLevel === "manager";

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
                <Glasses className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white tracking-tight">ÓPTICA TRAINING</h1>
                <p className="text-[10px] text-zinc-400 uppercase">{storeName}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10 text-xs">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/courses"
                className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Meus Treinamentos</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isPrivileged && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 transition-all text-xs font-medium flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Painel de Gestão</span>
              </Link>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{userName}</p>
                <p className="text-[10px] text-zinc-400">{userRole}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            </div>

            <Link
              href="/sign-in"
              className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sair da Plataforma"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-zinc-500">
        Plataforma Corporativa SRL Ópticas &bull; Treinamentos Linha Gold Comfort & Guia Smartplay &bull; 2026
      </footer>
    </div>
  );
}
