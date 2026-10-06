"use client";

import React, { useState } from "react";
import { X, Sparkles, UserCheck } from "lucide-react";
import { GoogleIcon } from "./sign-in";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, name: string) => void;
  isLoading?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  if (!isOpen) return null;

  const handleQuickSelect = (email: string, name: string) => {
    onConfirm(email, name);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName || customEmail.split("@")[0].toUpperCase();
    onConfirm(customEmail, name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-element">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <GoogleIcon />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Fazer login com o Google</h2>
            <p className="text-xs text-zinc-400">Plataforma de Treinamento SRL Ópticas</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
          Selecione uma conta Google homologada ou informe seu Gmail corporativo para autenticação automática segura:
        </p>

        {/* Contas Rápidas de Homologação */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickSelect("fbdv1202@gmail.com", "FÁBIO B. DEL VECCHIO (ADMINISTRADOR MASTER)")}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-violet-600/15 hover:bg-violet-600/30 border border-violet-500/40 hover:border-violet-400 text-left transition-all group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                F
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-violet-200">
                  FÁBIO B. DEL VECCHIO (Master Oficial)
                </p>
                <p className="text-[11px] text-violet-300/80">fbdv1202@gmail.com</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-violet-400 group-hover:text-white" />
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickSelect("admin@optica.com.br", "ADMINISTRADOR MASTER")}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-violet-200">
                  MARIO NETO (Master)
                </p>
                <p className="text-[11px] text-zinc-400">admin@optica.com.br</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-zinc-500 group-hover:text-violet-400" />
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickSelect("consultor.google@optica.com.br", "CONSULTOR HOMOLOGADO")}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-emerald-200">
                  CONSULTOR DE LOJA
                </p>
                <p className="text-[11px] text-zinc-400">consultor.google@optica.com.br</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
          </button>
        </div>

        {/* Divisor */}
        <div className="relative flex items-center justify-center my-4">
          <span className="w-full border-t border-white/10"></span>
          <span className="px-3 text-[11px] text-zinc-500 bg-zinc-900 absolute uppercase tracking-wider">
            Ou use sua conta Gmail
          </span>
        </div>

        {/* Formulário de Gmail Customizado */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">
              Seu Nome Completo
            </label>
            <input
              type="text"
              placeholder="ex: SEU NOME"
              value={customName}
              onChange={(e) => setCustomName(e.target.value.toUpperCase())}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">
              Endereço Gmail / Google Workspace *
            </label>
            <input
              type="email"
              required
              placeholder="seu.email@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !customEmail}
            className="w-full mt-2 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "Validando Token Google..." : "Autorizar Acesso via Google"}</span>
          </button>
        </form>

        <p className="text-[10px] text-zinc-500 text-center mt-4">
          Conexão protegida com OAuth 2.0 / OpenID Connect sob os 21 mandamentos de segurança.
        </p>
      </div>
    </div>
  );
};
