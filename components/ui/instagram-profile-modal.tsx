"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  CheckCircle2,
  Building2,
  Briefcase,
  Mail,
  Phone,
  FileText,
  MapPin,
  ShieldCheck,
  Calendar,
  LogOut,
  Pencil,
  Save,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Profile } from "@/types/database";
import { updateUserProfileAction, logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-provider";
import { useRouter } from "next/navigation";

interface InstagramProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  onProfileUpdated?: (updated: Profile) => void;
}

export const InstagramProfileModal: React.FC<InstagramProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem selecionada deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await updateUserProfileAction({
        name,
        phone,
        address,
        avatarUrl,
      });

      if (res.success && res.user) {
        setFeedback("Dados da conta e foto atualizados com sucesso!");
        onProfileUpdated?.(res.user);
        setIsEditing(false);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(res.error || "Falha ao salvar alterações.");
      }
    } catch {
      setFeedback("Erro de comunicação ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/sign-in");
  };

  const isMaster = user.accessLevel === "master";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-element">
      <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Top Header estilo Instagram */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              @{user.email.split("@")[0].toLowerCase()}
            </span>
            <span className="p-0.5 rounded-full bg-blue-500 text-white" title="Conta Verificada">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback visual */}
        {feedback && (
          <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Conteúdo com Scroll */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Seção Principal: Avatar com Stories Ring + Métricas */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Círculo Estilo Instagram Stories */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xl shadow-purple-950/40">
                <div className="w-full h-full rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center border-2 border-black">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white font-bold text-2xl">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Trocar Foto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition-transform transform hover:scale-110 cursor-pointer"
                title="Alterar foto de perfil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Contadores Numéricos Estilo Instagram */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-4 gap-2 text-center py-2 px-3 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div>
                  <span className="block text-sm font-bold text-white">2</span>
                  <span className="text-[10px] text-zinc-400">Cursos</span>
                </div>
                <div>
                  <span className="block text-sm font-bold text-white">10</span>
                  <span className="text-[10px] text-zinc-400">Aulas</span>
                </div>
                <div>
                  <span className="block text-sm font-bold text-emerald-400">94%</span>
                  <span className="text-[10px] text-zinc-400">Média</span>
                </div>
                <div>
                  <span className="block text-sm font-bold text-amber-400">1</span>
                  <span className="text-[10px] text-zinc-400">Certif.</span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isEditing
                      ? "bg-violet-600 text-white border-violet-500"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Cancelar Edição" : "Editar Perfil"}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer"
                    title="Remover foto atual"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Biografia e Dados da Conta */}
          {!isEditing ? (
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-sm font-bold text-white">{user.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-violet-400 font-medium">
                    {user.roleTitle || (isMaster ? "ADMINISTRADOR MASTER" : "CONSULTOR ÓPTICO")}
                  </span>
                  <span className="text-zinc-600">&bull;</span>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider">
                    {user.accessLevel}
                  </span>
                </div>
              </div>

              {/* Grade de Informações Cadastrais */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-violet-400" /> E-mail
                  </span>
                  <span className="text-zinc-200 font-medium">{user.email}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-violet-400" /> Filial / Loja
                  </span>
                  <span className="text-zinc-200 font-medium">{user.storeName || "Matriz"}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-violet-400" /> CPF
                  </span>
                  <span className="text-zinc-300 font-mono">{user.cpf || "000.000.000-00"}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-violet-400" /> WhatsApp
                  </span>
                  <span className="text-zinc-300">{user.phone || "(11) 99999-9999"}</span>
                </div>

                {user.address && (
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-violet-400" /> Endereço
                    </span>
                    <span className="text-zinc-300 text-right truncate max-w-[200px]">
                      {user.address}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" /> Membro Desde
                  </span>
                  <span className="text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Modo de Edição */
            <div className="space-y-4 pt-2 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-violet-950 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? "Salvando..." : "Salvar Dados"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Logout */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500">
            Rede de Ópticas SRL &bull; 2026
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
