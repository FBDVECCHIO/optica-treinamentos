"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Glasses,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
} from "lucide-react";
import { getStoreInviteDetailsAction, registerFromInviteAction } from "@/app/actions/auth";
import { maskPhone } from "@/lib/utils/masks";

interface StoreInviteData {
  id: string;
  name: string;
  cnpj: string;
  userLimit: number;
  activeUsersCount: number;
  availableSeats: number;
  active: boolean;
  subscriptionStatus?: string;
}

export default function StoreInvitePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const [store, setStore] = useState<StoreInviteData | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!storeId) return;

    getStoreInviteDetailsAction(storeId).then((res) => {
      setLoadingStore(false);
      if (res.success && res.store) {
        setStore(res.store);
      } else {
        setStoreError(res.error || "Loja ou convite não encontrado.");
      }
    });
  }, [storeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !phone.trim() || !email.trim() || !password) {
      setFormError("Por favor, preencha todos os campos do formulário.");
      return;
    }

    if (password.length < 6) {
      setFormError("A senha deve ter no mínimo 6 dígitos.");
      return;
    }

    startTransition(async () => {
      const res = await registerFromInviteAction({
        storeId,
        name,
        phone,
        email,
        password,
      });

      if (!res.success) {
        setFormError(res.error || "Falha ao concluir o cadastro.");
      } else {
        router.push(res.redirectUrl || "/courses");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg block leading-tight">ÓPTICA NA PRÁTICA</span>
            <span className="text-xs text-zinc-400">Plataforma de Capacitação SRL</span>
          </div>
        </div>

        <Link
          href="/sign-in"
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Já tem conta? <strong className="text-violet-400 underline">Fazer Login</strong>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-lg mx-auto w-full my-8 flex-1 flex flex-col justify-center">
        {loadingStore ? (
          <div className="p-8 rounded-3xl bg-zinc-900/60 border border-white/10 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Carregando dados da unidade e convite...</p>
          </div>
        ) : storeError ? (
          <div className="p-8 rounded-3xl bg-zinc-900/60 border border-red-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Convite Não Encontrado</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
              {storeError} Solicite ao seu gerente de ótica um novo link de convite atualizado.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-all"
            >
              Voltar ao Início
            </Link>
          </div>
        ) : store ? (
          <div className="rounded-3xl bg-zinc-900/70 border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Banner da Loja Convidante */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600/15 via-violet-500/5 to-transparent border border-violet-500/20 space-y-2">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Convite Oficial de Capacitação</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {store.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                <span className="font-mono">CNPJ: {store.cnpj}</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {store.availableSeats > 0
                    ? `${store.availableSeats} vaga(s) disponível(is)`
                    : "Cota Completa"}
                </span>
              </div>
            </div>

            {store.availableSeats <= 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2 text-center">
                <AlertTriangle className="w-5 h-5 mx-auto text-amber-400" />
                <p className="font-semibold">Vagas Esgotadas para esta Unidade</p>
                <p className="text-[11px] text-zinc-400">
                  O limite de {store.userLimit} colaboradores desta loja foi atingido.
                  Solicite ao seu gerente a ampliação do plano corporativo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Criar seu Acesso de Consultor</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Seu cadastro será vinculado automaticamente à sua loja, liberando os treinamentos.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-300 block mb-1">WhatsApp / Celular</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(maskPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-300 block mb-1">Seu E-mail</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="consultor@loja.com.br"
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">Crie sua Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 px-4 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-950 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Ingressar na Equipe & Iniciar Treinamentos</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Acesso individual protegido e certificado emitido em seu nome</span>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-zinc-600 pt-6 border-t border-white/5">
        SRL Ópticas &bull; Treinamentos Linha Gold Comfort e Smartplay &bull; 2026
      </footer>
    </div>
  );
}
