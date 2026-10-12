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
    <div className="min-h-screen bg-[#F7F7F1] text-[#0A0A0A] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#C9D0D6] px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0A0A0A] text-[#C7FF2E] shadow-sm">
                <Glasses className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-[#0A0A0A] tracking-tight">ÓPTICA NA PRÁTICA</h1>
                <p className="text-[10px] text-[#6F7780] uppercase font-medium">{storeName}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#C9D0D6] text-xs">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-[#0A0A0A] hover:bg-[#C9D0D6]/30 transition-colors flex items-center gap-1.5 font-semibold"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/courses"
                className="px-3 py-1.5 rounded-lg text-[#0A0A0A] hover:bg-[#C9D0D6]/30 transition-colors flex items-center gap-1.5 font-semibold"
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
                className="px-3 py-1.5 rounded-xl bg-[#0A0A0A] text-[#C7FF2E] hover:bg-[#262626] transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Painel de Gestão</span>
              </Link>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-[#C9D0D6]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#0A0A0A] leading-tight">{userName}</p>
                <p className="text-[10px] text-[#6F7780]">{userRole}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-[#C7FF2E] flex items-center justify-center text-xs font-bold shadow-sm">
                <User className="w-4 h-4" />
              </div>
            </div>

            <Link
              href="/sign-in"
              className="p-2 rounded-xl text-[#6F7780] hover:text-red-600 hover:bg-red-50 transition-colors"
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
      <footer className="border-t border-[#C9D0D6] py-4 px-6 text-center text-xs text-[#6F7780]">
        Plataforma Corporativa SRL Ópticas &bull; Treinamentos Linha Gold Comfort & Guia Smartplay &bull; 2026
      </footer>
    </div>
  );
}
