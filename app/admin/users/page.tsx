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
  Pencil,
  X,
  Save,
  Building2,
} from "lucide-react";
import {
  getUsersListAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
  deleteUserAction,
  updateUserAction,
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
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
    if (!confirm(`ATENÇÃO: Confirma a exclusão definitiva do colaborador ${user.name}?`)) return;
    const res = await deleteUserAction(user.id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setActionMessage(`Usuário ${user.name} excluído com sucesso.`);
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert(res.error || "Não foi possível excluir o usuário.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    const res = await updateUserAction(editingUser.id, editingUser);
    setEditLoading(false);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setActionMessage(`Dados de ${editingUser.name} alterados com sucesso.`);
      setEditingUser(null);
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert(res.error || "Falha ao salvar alterações.");
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
                        onClick={() => setEditingUser({ ...user })}
                        className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                        title="Alterar cadastro do colaborador"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

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

      {/* Modal de Edição de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-element">
          <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Alterar Cadastro do Colaborador</h2>
                <p className="text-xs text-zinc-400">Atualização de dados cadastrais e permissões</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value.toUpperCase() })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value.toLowerCase() })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">CPF</label>
                  <input
                    type="text"
                    value={editingUser.cpf}
                    onChange={(e) => setEditingUser({ ...editingUser, cpf: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Loja / Unidade</label>
                  <input
                    type="text"
                    value={editingUser.storeName || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, storeName: e.target.value.toUpperCase() })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">CNPJ da Filial</label>
                  <input
                    type="text"
                    value={editingUser.storeCnpj || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, storeCnpj: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Cargo / Função</label>
                  <select
                    value={editingUser.roleId || ""}
                    onChange={(e) => {
                      const sel = roles.find((r) => r.id === e.target.value);
                      setEditingUser({
                        ...editingUser,
                        roleId: e.target.value,
                        roleTitle: sel ? sel.title : editingUser.roleTitle,
                      });
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id} className="bg-zinc-900">
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Nível de Permissão</label>
                  <select
                    value={editingUser.accessLevel}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        accessLevel: e.target.value as "master" | "manager" | "student",
                      })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="student" className="bg-zinc-900">Aluno / Consultor</option>
                    <option value="manager" className="bg-zinc-900">Gerente de Loja</option>
                    <option value="master" className="bg-zinc-900">Administrador Master</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-zinc-400 font-medium block mb-1">Status da Conta</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={editingUser.active}
                      onChange={() => setEditingUser({ ...editingUser, active: true })}
                      className="accent-emerald-500"
                    />
                    <span className="text-emerald-400">Ativo</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={!editingUser.active}
                      onChange={() => setEditingUser({ ...editingUser, active: false })}
                      className="accent-red-500"
                    />
                    <span className="text-red-400">Bloqueado</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {editLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
