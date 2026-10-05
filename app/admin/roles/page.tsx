"use client";

import { useEffect, useState } from "react";
import { Briefcase, Plus, Trash2, Shield, CheckCircle2 } from "lucide-react";
import { getRolesAction, createRoleAction, deleteRoleAction } from "@/app/actions/admin";
import { Role } from "@/types/database";

export default function RolesAdminPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadRoles = async () => {
    const list = await getRolesAction();
    setRoles(list);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const res = await createRoleAction(title, description);
    if (res.success) {
      setTitle("");
      setDescription("");
      setMessage(`Função ${title.toUpperCase()} cadastrada com sucesso! Já está disponível na tela de cadastro.`);
      loadRoles();
      setTimeout(() => setMessage(null), 5000);
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (roleId: string, roleTitle: string) => {
    if (!confirm(`Deseja remover a função "${roleTitle}"?`)) return;
    const res = await deleteRoleAction(roleId);
    if (res.success) {
      loadRoles();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-8 animate-element max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Configurações &raquo; Funções e Cargos</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Cadastro de Funções de Óptica
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Cadastre as opções que aparecem dinamicamente no campo &quot;Cargo&quot; da tela pública de cadastro.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Formulário para Cadastrar Nova Função */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-violet-400" />
          <span>Adicionar Novo Cargo / Função</span>
        </h3>

        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
              Título da Função (em maiúsculas)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value.toUpperCase())}
              placeholder="EX: VENDEDOR TÉCNICO DE LENTES ESPECIAIS"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
              Descrição / Atribuições da Função
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da responsabilidade técnica ou comercial no balcão"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Salvar Nova Função</span>
          </button>
        </form>
      </div>

      {/* Lista de Funções Cadastradas */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-4">
          Funções Disponíveis para Seleção ({roles.length})
        </h3>

        <div className="divide-y divide-white/5">
          {roles.map((role) => (
            <div key={role.id} className="py-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white uppercase">{role.title}</span>
                  {role.isSystem && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-medium">
                      Padrão do Sistema
                    </span>
                  )}
                </div>
                {role.description && (
                  <p className="text-xs text-zinc-400 mt-1">{role.description}</p>
                )}
              </div>

              {!role.isSystem && (
                <button
                  type="button"
                  onClick={() => handleDelete(role.id, role.title)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remover função"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
