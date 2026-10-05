"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Users,
  Search,
  Filter,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import {
  getUsersListAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
  deleteUserAction,
  getRolesAction,
} from "@/app/actions/admin";
import { Profile, Role } from "@/types/database";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = () => {
    startTransition(async () => {
      const data = await getUsersListAction({
        search,
        roleId: selectedRole,
        status: selectedStatus,
        page,
        pageSize: 8,
      });
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    });
  };

  useEffect(() => {
    getRolesAction().then(setRoles);
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedRole, selectedStatus, page]);

  const handleResetPassword = async (user: Profile) => {
    if (!confirm(`Deseja enviar um link de redefinição de senha para ${user.email} via Resend?`)) return;
    const res = await resetUserPasswordAction(user.id);
    setActionMessage(res.message);
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleToggleStatus = async (user: Profile) => {
    const res = await toggleUserStatusAction(user.id);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: res.active } : u))
      );
    }
  };

  const handleDeleteUser = async (user: Profile) => {
    if (!confirm(`ATENÇÃO: Confirma a exclusão definitiva do usuário ${user.name}?`)) return;
    const res = await deleteUserAction(user.id);
    if (res.success) {
      fetchUsers();
      setActionMessage(`Usuário ${user.name} excluído com sucesso.`);
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6 animate-element">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Gestão Corporativa de Colaboradores</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Lista Geral de Cadastrados ({totalCount})
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Acompanhe todos os consultores, gerentes e técnicos vinculados às lojas e CNPJs.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-element">
          {actionMessage}
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por Nome, E-mail ou CPF..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Filtro por Cargo */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(1);
            }}
            className="bg-black/40 border border-white/10 text-xs text-white rounded-2xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all" className="bg-zinc-900">Todos os Cargos</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id} className="bg-zinc-900">
                {r.title}
              </option>
            ))}
          </select>

          {/* Filtro por Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="bg-black/40 border border-white/10 text-xs text-white rounded-2xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all" className="bg-zinc-900">Todos os Status</option>
            <option value="active" className="bg-zinc-900">Ativos</option>
            <option value="inactive" className="bg-zinc-900">Inativos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="p-4 pl-6">Colaborador / E-mail</th>
                <th className="p-4">CPF / WhatsApp</th>
                <th className="p-4">Loja & CNPJ</th>
                <th className="p-4">Cargo</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-semibold text-white uppercase">{user.name}</div>
                    <div className="text-[11px] text-zinc-400">{user.email}</div>
                  </td>
                  <td className="p-4 font-mono text-[11px]">
                    <div>{user.cpf}</div>
                    <div className="text-zinc-500">{user.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-zinc-200">{user.storeName || "Matriz"}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{user.storeCnpj || "Não informado"}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-violet-300">
                      {user.roleTitle || user.accessLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        user.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {user.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{user.active ? "Ativo" : "Bloqueado"}</span>
                    </button>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(user)}
                        className="p-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 transition-all cursor-pointer"
                        title="Disparar link de redefinição de senha via Resend"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {user.accessLevel !== "master" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                          title="Excluir cadastro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Nenhum colaborador localizado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <div>
            Página <strong className="text-white">{page}</strong> de <strong className="text-white">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
