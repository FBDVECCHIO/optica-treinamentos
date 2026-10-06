"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// --- HELPER COMPONENTS (ICONS) ---

export const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  errorMessage?: string | null;
  isLoading?: boolean;
}

// --- SUB-COMPONENTS ---

export const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

export const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-5 w-64 shadow-2xl`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl border border-white/10" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-white">{testimonial.name}</p>
      <p className="text-xs text-zinc-400">{testimonial.handle}</p>
      <p className="mt-1 text-xs text-zinc-300 line-clamp-3">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Bem-vindo</span>,
  description = "Acesse a plataforma oficial de capacitação das ópticas parceiras.",
  heroImageSrc = "https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=1200&auto=format&fit=crop",
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  errorMessage,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-[#09090b] text-[#fafafa]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-3 animate-element animate-delay-100">
                <span>Plataforma Oficial SRL Ópticas</span>
              </div>
              <h1 className="animate-element animate-delay-100 text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                {title}
              </h1>
              <p className="animate-element animate-delay-200 text-sm text-zinc-400 mt-2">
                {description}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs animate-element">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">E-mail Cadastrado</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="seu.email@optica.com.br"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-zinc-500"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Sua Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center p-1.5 text-zinc-400 hover:text-white transition-colors"
                      aria-label="Alternar visualização da senha"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" defaultChecked />
                  <span>Manter conectado</span>
                </label>
                <a
                  href="#reset"
                  onClick={(e) => {
                    e.preventDefault();
                    onResetPassword?.();
                  }}
                  className="hover:underline text-violet-400 transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-violet-600 hover:bg-violet-500 py-4 font-medium text-white transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Entrar na Plataforma"
                )}
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center my-1">
              <span className="w-full border-t border-white/10"></span>
              <span className="px-4 text-xs text-zinc-500 bg-[#09090b] absolute">Ou continue com</span>
            </div>

            <button
              type="button"
              onClick={onGoogleSignIn}
              className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-white/10 rounded-2xl py-3.5 hover:bg-white/5 transition-colors text-sm font-medium text-zinc-200 cursor-pointer"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <div className="animate-element animate-delay-900 pt-2 text-center text-xs text-zinc-400">
              <p>
                Novo na equipe da óptica?{" "}
                <a
                  href="#signup"
                  onClick={(e) => {
                    e.preventDefault();
                    onCreateAccount?.();
                  }}
                  className="text-violet-400 hover:underline transition-colors font-medium ml-1"
                >
                  Criar Cadastro
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden lg:block flex-1 relative p-6">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-6 rounded-3xl bg-cover bg-center border border-white/10 shadow-2xl overflow-hidden"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          >
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

            <div className="absolute top-10 left-10 max-w-sm text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-violet-300 font-medium mb-3">
                Linha Gold Comfort & Smartplay
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Capacitação Técnica de Alta Performance
              </h2>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                Aumente a conversão de lentes de valor agregado, elimine erros de adaptação e garanta a satisfação do cliente da ótica.
              </p>
            </div>

            {testimonials.length > 0 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-6 w-full justify-center">
                <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
                {testimonials[1] && (
                  <div className="hidden xl:flex">
                    <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
