"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { GlassInputWrapper } from "@/components/ui/sign-in";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      await requestPasswordResetAction(email);
      setSubmitted(true);
    } catch {
      setError("Houve uma falha na solicitação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#09090b] text-[#fafafa] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl z-10">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o Login</span>
        </Link>

        {submitted ? (
          <div className="text-center py-4 animate-element">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Instruções Enviadas!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Se houver uma conta associada a <strong className="text-white">{email}</strong>, o link de recuperação foi enviado pelo serviço seguro **Resend**. Verifique sua caixa de entrada e spam.
            </p>
            <Link
              href="/sign-in"
              className="w-full block py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-all shadow-lg shadow-violet-600/20"
            >
              Retornar para o Login
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
                Resgatar Senha
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Informe o e-mail cadastrado na plataforma para receber o link de redefinição imediata via Resend.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-400" />
                  E-mail de Cadastro
                </label>
                <GlassInputWrapper>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@optica.com.br"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                  />
                </GlassInputWrapper>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-violet-600 hover:bg-violet-500 py-3.5 font-medium text-white transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Enviar Link de Resgate"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
