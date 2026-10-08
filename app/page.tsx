import Link from "next/link";
import {
  Glasses,
  Award,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Phone,
  MessageSquare,
  Gift,
  Zap,
} from "lucide-react";

const PLANS = [
  {
    id: "trial",
    name: "Degustação 15 Dias",
    price: "Grátis",
    period: "por 15 dias",
    userLimit: "Até 5 colaboradores",
    badge: "Sem Cartão de Crédito",
    highlight: true,
    description: "Perfeito para comprovar na prática a evolução do seu balcão.",
    cta: "Começar Degustação Gratuita",
    features: [
      "5 licenças para seus consultores",
      "Acesso completo aos vídeos e apostilas",
      "Quizzes com pontuação e ranking",
      "Certificados oficiais de conclusão",
    ],
  },
  {
    id: "essencial",
    name: "Essencial Balcão",
    price: "R$ 390",
    period: "/mês",
    userLimit: "Até 5 colaboradores",
    badge: "1 Loja Individual",
    highlight: false,
    description: "Para óticas de rua com equipe enxuta e foco em metas.",
    cta: "Contratar Essencial",
    features: [
      "5 licenças simultâneas",
      "Link de convite direto via WhatsApp",
      "Cobrança de progresso com 1 clique",
      "Cancelamento livre sem fidelidade",
    ],
  },
  {
    id: "pro",
    name: "Performance Pro",
    price: "R$ 790",
    period: "/mês",
    userLimit: "Até 15 colaboradores",
    badge: "Mais Escolhido",
    highlight: false,
    description: "Para lojas de shopping ou equipes comerciais robustas.",
    cta: "Contratar Pro",
    features: [
      "15 licenças simultâneas",
      "Certificados com logotipo da sua loja",
      "Relatórios de auditoria e avanço por módulo",
      "Cobrança direta via WhatsApp integrado",
    ],
  },
  {
    id: "master",
    name: "Rede Master",
    price: "R$ 1.490",
    period: "/mês",
    userLimit: "Até 50 colaboradores",
    badge: "Redes e Franquias",
    highlight: false,
    description: "Para redes de óticas que precisam de controle unificado.",
    cta: "Contratar Rede Master",
    features: [
      "50 licenças distribuídas em filiais",
      "Painel consolidado Matriz vs. Filiais",
      "Treinamentos customizados da sua rede",
      "Gerente de conta e suporte VIP",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#09090b] text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

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
            className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Acessar Conta
          </Link>
          <Link
            href="/contratar"
            className="text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/25 flex items-center gap-1.5"
          >
            <Gift className="w-4 h-4" />
            <span>Degustação 15 Dias</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
          <Award className="w-3.5 h-3.5 text-violet-400" />
          <span>Plataforma Oficial de Capacitação Técnica e Comercial de Ópticas</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
          Multiplique as Vendas da sua Óptica com Consultores Altamente Qualificados
        </h2>

        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mb-10 leading-relaxed">
          Treine sua equipe na <strong>Linha Gold Comfort</strong> e no <strong>Guia Smartplay</strong>. 
          Aumente o ticket médio, reduza erros de adaptação em lentes multifocais e acompanhe 
          o avanço de cada vendedor em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/contratar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-xl shadow-violet-600/25 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Iniciar Degustação Gratuita (15 Dias)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <span>Já sou Cadastrado &bull; Fazer Login</span>
          </Link>
        </div>

        {/* Como Funciona em 3 Passos Simples */}
        <div className="mt-24 w-full text-left space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              Simplicidade de Implantação
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Como Funciona para sua Loja em 3 Passos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-sm border border-violet-500/30">
                1
              </div>
              <h4 className="font-bold text-white text-base">Ative sua Loja Online</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Escolha o plano ideal ou comece com o teste gratuito de 15 dias. Sem burocracia e sem cartão de crédito para testar.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                2
              </div>
              <h4 className="font-bold text-white text-base">Envie o Link no WhatsApp da Equipe</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                O gerente copia o link exclusivo da loja e manda no grupo. Os vendedores entram direto, sem precisar digitar CNPJ.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                3
              </div>
              <h4 className="font-bold text-white text-base">Cobre no WhatsApp & Certifique</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Veja o progresso de cada aluno no painel. Cobre os atrasados com 1 clique no WhatsApp e emita certificados oficiais.
              </p>
            </div>
          </div>
        </div>

        {/* Tabela de Planos Comerciais */}
        <div id="planos" className="mt-24 w-full space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              Planos Transparentes
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Investimento que se Paga no Primeiro Mês
            </h3>
            <p className="text-xs text-zinc-400">
              Escolha a capacidade ideal para sua loja ou rede e cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                  plan.highlight
                    ? "bg-violet-600/15 border-violet-500 shadow-xl shadow-violet-950/40 relative"
                    : "bg-zinc-900/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                      {plan.badge}
                    </span>
                    <Users className="w-4 h-4 text-violet-400" />
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{plan.name}</h4>
                  <p className="text-xs text-zinc-400 mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-3xl font-black">{plan.price}</span>
                      <span className="text-xs text-zinc-400 font-normal">{plan.period}</span>
                    </div>
                    <span className="text-[11px] text-violet-400 font-semibold block mt-1">
                      {plan.userLimit}
                    </span>
                  </div>

                  <ul className="space-y-2 border-t border-white/5 pt-4 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/contratar"
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    plan.highlight
                      ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div>Plataforma Corporativa SRL Ópticas &bull; Capacitação Linha Gold Comfort e Smartplay &bull; 2026</div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hover:text-white transition-colors">Acesso de Alunos</Link>
          <Link href="/contratar" className="hover:text-white transition-colors">Contratação B2B</Link>
        </div>
      </footer>
    </div>
  );
}
