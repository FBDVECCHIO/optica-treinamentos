import Link from "next/link";
import {
  Glasses,
  Award,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Gift,
} from "lucide-react";
import { getPublicPlansAction } from "@/app/actions/admin";
import { Plan } from "@/types/database";

const FALLBACK_PLANS: Plan[] = [
  {
    id: "trial",
    name: "Degustação 15 Dias",
    slug: "trial-15-dias",
    monthlyPrice: 0,
    annualPrice: 0,
    annualDiscountPercent: 0,
    userLimit: 5,
    badge: "Sem Cartão de Crédito",
    highlight: true,
    active: true,
    description: "Perfeito para comprovar na prática a evolução do seu balcão.",
    ctaText: "Começar Degustação Gratuita",
    features: [
      "5 licenças para seus consultores",
      "Acesso completo aos vídeos e apostilas",
      "Quizzes com pontuação e ranking",
      "Certificados oficiais de conclusão",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "essencial",
    name: "Essencial Balcão (5 Licenças)",
    slug: "essencial-balcao",
    monthlyPrice: 390,
    annualPrice: 312,
    annualDiscountPercent: 20,
    userLimit: 5,
    badge: "1 Loja Individual",
    highlight: false,
    active: true,
    description: "Para óticas de rua com equipe enxuta e foco em metas.",
    ctaText: "Contratar Essencial",
    features: [
      "5 licenças simultâneas",
      "Link de convite direto via WhatsApp",
      "Cobrança de progresso com 1 clique",
      "Cancelamento livre sem fidelidade",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pro",
    name: "Performance Pro (15 Licenças)",
    slug: "performance-pro",
    monthlyPrice: 790,
    annualPrice: 632,
    annualDiscountPercent: 20,
    userLimit: 15,
    badge: "Mais Escolhido",
    highlight: false,
    active: true,
    description: "Para lojas de shopping ou equipes comerciais robustas.",
    ctaText: "Contratar Pro",
    features: [
      "15 licenças simultâneas",
      "Certificados com logotipo da sua loja",
      "Relatórios de auditoria e avanço por módulo",
      "Cobrança direta via WhatsApp integrado",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "master",
    name: "Rede Master Expansão (50 Licenças)",
    slug: "rede-master-expansao",
    monthlyPrice: 1490,
    annualPrice: 1192,
    annualDiscountPercent: 20,
    userLimit: 50,
    badge: "Redes e Franquias",
    highlight: false,
    active: true,
    description: "Para redes de óticas que precisam de controle unificado.",
    ctaText: "Contratar Rede Master",
    features: [
      "50 licenças distribuídas em filiais",
      "Painel consolidado Matriz vs. Filiais",
      "Treinamentos customizados da sua rede",
      "Gerente de conta e suporte VIP",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default async function HomePage() {
  let plans: Plan[] = [];
  try {
    const fetched = await getPublicPlansAction();
    if (fetched && fetched.length > 0) {
      plans = fetched;
    } else {
      plans = FALLBACK_PLANS;
    }
  } catch {
    plans = FALLBACK_PLANS;
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#F7F7F1] text-[#0A0A0A]">
      {/* Background Glows Sutis */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#C7FF2E]/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#C9D0D6]/20 blur-[140px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-[#C9D0D6]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#0A0A0A] text-[#C7FF2E] shadow-sm">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-lg text-[#0A0A0A]">ÓPTICA NA PRÁTICA</h1>
            <p className="text-xs text-[#6F7780]">Capacitação Profissional SRL</p>
          </div>
        </div>

        {/* Botões Agrupados no Canto Direito */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/sign-in"
            className="text-xs sm:text-sm font-semibold text-[#0A0A0A] hover:text-black px-3.5 py-2 rounded-xl hover:bg-[#C9D0D6]/40 transition-all text-right"
          >
            <span className="hidden sm:inline">Já sou cadastrado / </span>Acessar Conta
          </Link>
          <Link
            href="/contratar"
            className="text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl bg-[#C7FF2E] hover:bg-[#b5ee24] text-[#0A0A0A] transition-all shadow-md shadow-[#C7FF2E]/25 flex items-center gap-1.5 shrink-0"
          >
            <Gift className="w-4 h-4" />
            <span>Degustação 15 Dias</span>
          </Link>
        </div>
      </header>

      {/* Hero & Conteúdo Principal */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-20 flex-1 flex flex-col justify-center">
        {/* Hero em 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-left w-full">
          {/* Coluna Esquerda: Proposta de Valor e Chamada de Ação */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C9D0D6] text-xs text-[#0A0A0A] shadow-sm">
              <Award className="w-3.5 h-3.5 text-[#0A0A0A]" />
              <span className="font-semibold">Plataforma Oficial de Capacitação Técnica e Comercial de Ópticas</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A0A0A] leading-[1.15]">
              Construa sua Plataforma Especializada de Treinamentos.
            </h2>

            <p className="text-sm sm:text-base text-[#6F7780] leading-relaxed max-w-2xl font-normal">
              Treine sua equipe com temas relevantes segmentados por você. Aumente o ticket médio, reduza erros de adaptação em lentes e acompanhe o avanço de cada vendedor em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/contratar"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C7FF2E] hover:bg-[#b5ee24] text-[#0A0A0A] font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-[#C7FF2E]/30 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Iniciar Degustação Gratuita (15 Dias)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#planos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-[#C9D0D6] hover:bg-[#F7F7F1] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
              >
                <span>Conhecer Planos Comerciais</span>
              </a>
            </div>
          </div>

          {/* Coluna Direita: Cards dos 3 Passos de Implantação */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="p-5 rounded-3xl bg-white border border-[#C9D0D6] shadow-sm space-y-1.5 relative overflow-hidden transition-all hover:border-[#0A0A0A]/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#0A0A0A] text-[#C7FF2E] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-[#0A0A0A] text-sm">Ative sua Loja Online</h3>
              </div>
              <p className="text-xs text-[#6F7780] leading-relaxed pl-12">
                Escolha o plano ideal ou comece com o teste gratuito de 15 dias. Sem burocracia e sem cartão de crédito para testar.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#C9D0D6] shadow-sm space-y-1.5 relative overflow-hidden transition-all hover:border-[#0A0A0A]/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#0A0A0A] text-[#C7FF2E] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-[#0A0A0A] text-sm">Envie o Link no WhatsApp da Equipe</h3>
              </div>
              <p className="text-xs text-[#6F7780] leading-relaxed pl-12">
                O gerente copia o link exclusivo da loja e manda no grupo. Os vendedores entram direto, sem precisar digitar CNPJ.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#C9D0D6] shadow-sm space-y-1.5 relative overflow-hidden transition-all hover:border-[#0A0A0A]/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#0A0A0A] text-[#C7FF2E] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-[#0A0A0A] text-sm">Cobre no WhatsApp & Certifique</h3>
              </div>
              <p className="text-xs text-[#6F7780] leading-relaxed pl-12">
                Veja o progresso de cada aluno no painel. Cobre os atrasados com 1 clique no WhatsApp e emita certificados oficiais.
              </p>
            </div>
          </div>
        </div>

        {/* Seção Inferior do Hero: Tabela de Planos Comerciais */}
        <div id="planos" className="mt-20 pt-10 border-t border-[#C9D0D6] w-full space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-1">
            <span className="text-xs font-bold text-[#6F7780] uppercase tracking-wider">
              Planos Comerciais & Assinaturas
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A0A0A] whitespace-nowrap">
              Investimento que se Paga no Primeiro Mês
            </h3>
            <p className="text-xs text-[#6F7780]">
              Escolha a capacidade ideal para sua ótica ou rede e cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                  plan.highlight
                    ? "bg-white border-2 border-[#0A0A0A] ring-2 ring-[#C7FF2E] shadow-xl relative"
                    : "bg-white border border-[#C9D0D6] shadow-sm hover:border-[#6F7780]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F7F7F1] border border-[#C9D0D6] text-[#0A0A0A]">
                      {plan.badge || "Plano Oficial"}
                    </span>
                    <Users className="w-4 h-4 text-[#0A0A0A]" />
                  </div>

                  <h4 className="text-base font-extrabold text-[#0A0A0A] mb-1">{plan.name}</h4>
                  <p className="text-xs text-[#6F7780] mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1 text-[#0A0A0A]">
                      <span className="text-3xl font-black">
                        {plan.monthlyPrice === 0 ? "Grátis" : `R$ ${plan.monthlyPrice}`}
                      </span>
                      <span className="text-xs text-[#6F7780] font-normal">
                        {plan.monthlyPrice === 0 ? "por 15 dias" : "/mês"}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#0A0A0A] font-bold block mt-1">
                      Até {plan.userLimit} colaboradores
                    </span>
                  </div>

                  <ul className="space-y-2 border-t border-[#C9D0D6]/60 pt-4 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="text-xs text-[#0A0A0A] flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/contratar?plano=${plan.id}`}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    plan.highlight
                      ? "bg-[#C7FF2E] hover:bg-[#b5ee24] text-[#0A0A0A] shadow-md shadow-[#C7FF2E]/30"
                      : "bg-[#0A0A0A] hover:bg-[#262626] text-[#F7F7F1]"
                  }`}
                >
                  <span>{plan.ctaText || "Contratar Agora"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#C9D0D6] max-w-7xl mx-auto w-full px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F7780]">
        <div>Óptica Na Prática &bull; Plataforma Corporativa de Treinamentos &bull; 2026</div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hover:text-[#0A0A0A] transition-colors font-medium">Acesso de Alunos & Gerentes</Link>
          <Link href="/contratar" className="hover:text-[#0A0A0A] transition-colors font-medium">Contratação B2B</Link>
        </div>
      </footer>
    </div>
  );
}
