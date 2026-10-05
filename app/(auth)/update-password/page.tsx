"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { GlassInputWrapper } from "@/components/ui/sign-in";
import { updatePasswordAction } from "@/app/actions/auth";

function UpdatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A nova senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setLoading(true);
    try {
      await updatePasswordAction(emailParam);
      setSuccess(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 1800);
    } catch {
      setError("Falha ao atualizar a senha. Solicite um novo link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl z-10">
      {success ? (
        <div className="text-center py-4 animate-element">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Senha Redefinida!</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Sua credencial foi alterada com sucesso. Redirecionando para a tela de login...
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
              Nova Senha de Acesso
            </h1>
            <p className="text-xs text-zinc-400">
              Digite e confirme sua nova senha para o usuário <strong className="text-zinc-200">{emailParam || "sua conta"}</strong>.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Nova Senha</label>
              <GlassInputWrapper>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-transparent text-sm p-3.5 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center p-1 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </GlassInputWrapper>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Confirmar Nova Senha</label>
              <GlassInputWrapper>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                />
              </GlassInputWrapper>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-violet-600 hover:bg-violet-500 py-3.5 font-medium text-white transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Salvar Nova Senha"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#09090b] text-[#fafafa] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/10 blur-[140px] pointer-events-none rounded-full" />
      <Suspense fallback={<div className="text-zinc-400 text-xs">Carregando token...</div>}>
        <UpdatePasswordContent />
      </Suspense>
    </div>
  );
}
