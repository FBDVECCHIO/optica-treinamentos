import Link from "next/link";
import { Glasses, Award, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#09090b]">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-lg text-white">ÓPTICA TRAINING</h1>
            <p className="text-xs text-zinc-400">Capacitação Profissional SRL</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Acessar Conta
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/20"
          >
            Criar Cadastro
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-8 animate-element animate-delay-100">
          <Award className="w-3.5 h-3.5 text-violet-400" />
          <span>Certificação Oficial de Equipes Ópticas</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15] mb-6 animate-element animate-delay-200">
          Excelência em Atendimento, Lentes e Vendas Ópticas
        </h2>

        <p className="text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed animate-element animate-delay-300">
          Aprenda os segredos da Linha Gold Comfort, domine o Guia Smartplay e impulsione a performance comercial da sua loja com treinamentos em vídeo, apostilas técnicas e quizzes de certificação.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-element animate-delay-400">
          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all shadow-xl shadow-violet-600/25 group"
          >
            <span>Iniciar Treinamento</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-200 font-medium transition-all"
          >
            <span>Cadastrar Minha Óptica</span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-2">Módulos Estruturados</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Vídeos em alta resolução e download imediato do material de apoio e manuais em PDF.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-2">Quizzes & Certificação</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Questões práticas e dissertativas para fixação real de conceitos ópticos e pontuação de equipe.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-2">Gestão Multi-Loja por CNPJ</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Painel para gerentes acompanharem o progresso, notas e certificação de cada colaborador.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-zinc-500">
        Plataforma Corporativa SRL Ópticas &bull; Treinamento Linha Gold Comfort e Smartplay &bull; 2026
      </footer>
    </div>
  );
}
