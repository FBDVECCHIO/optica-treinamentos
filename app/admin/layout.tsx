import { getCurrentUser } from "@/app/actions/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar Retrátil & Redimensionável com Perfil Instagram */}
      <AdminSidebar initialUser={user} />

      {/* Conteúdo Principal do Painel */}
      <main className="flex-1 p-6 sm:p-10 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
