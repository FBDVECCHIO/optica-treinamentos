# Treinamento Comercial de Alto Impacto - Lentes com Área de Relaxamento: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Desenvolver e compilar um treinamento comercial de alto impacto em PDF Widescreen (16:9) focado na capacitação de consultores de óptica para conversão de lentes de relaxamento VS Gold Comfort e Gold Comfort IA vs. lentes comuns e concorrentes de mercado.

**Architecture:** O material será construído em arquitetura HTML5/CSS3 editorial de alta fidelidade com estilos para impressão em 16:9 (`@page { size: 1920px 1080px; margin: 0; }`), contendo 13 lâminas visuais com diagramas vetoriais SVG, tabelas comparativas limpas, scripts dialogados e caixas de destaque. A geração do PDF final será automatizada via script Python utilizando Playwright/Chromium (Microsoft Edge).

**Tech Stack:** HTML5, CSS3 moderno (Flexbox, CSS Grid, tipografia Google Fonts Inter/Outfit), vetores SVG inline, Python 3.12+ (uv), Playwright.

**Spec:** `docs/superpowers/specs/2026-10-01-treinamento-comercial-gold-comfort-design.md`

## Global Constraints

- **Formato:** Lâminas Horizontais Widescreen (16:9 - 1920x1080 px).
- **Público-Alvo:** Consultores e vendedores de balcão de ópticas (B2C).
- **Sigilo Comercial:** PROIBIDO incluir qualquer menção a custo de laboratório, markups ou margens internas da loja. Comparativos financeiros exclusivamente baseados em Preço de Venda ao Consumidor (PVC) e custo diluído diário.
- **Identidade Visual:** Clean, minimalista, alta legibilidade, paleta Deep Navy, White/Snow, Electric Cyan (IA) e Alert Coral (fadiga).
- **Arquivo Final de Saída:** `G:\Meu Drive\MACPRADO OK\CLIENTES\SRL\MARIO NETO\2026\TREINAMENTOS\TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf`.

---

### Task 1: Estrutura Base e Pipeline de Compilação PDF

**Files:**
- Create: `render_pdf.py`
- Test: Execução via `uv run --with playwright python render_pdf.py`

**Interfaces:**
- Produces: Script de automação capaz de converter qualquer arquivo HTML de slides em PDF vetorial 16:9 de 1920x1080 px com fidelidade gráfica total.

- [ ] **Step 1: Criar o script de compilação Playwright `render_pdf.py`**
- [ ] **Step 2: Executar teste de fumaça (smoke test) com slide de teste**
- [ ] **Step 3: Validar a geração do arquivo PDF e resolução de tela**

---

### Task 2: Componentes Vetoriais SVG e Elementos Gráficos de Alto Impacto

**Files:**
- Create: `templates/components_svg.html` ou arquivo de assets SVG inline

**Interfaces:**
- Produces: Diagramas visuais em código SVG limpo e escalável:
  1. Anatomia do Músculo Ciliar e Cristalino sob tensão vs. repouso.
  2. Metáfora Visual: Autofoco Mecânico (Câmera) vs. Autofoco Biológico (Olho Humano).
  3. Lente 2 em 1: Esquema de onda com zona de longe e zona ativa de relaxamento inferior.
  4. Ícones técnicos (IA, Blue Cut, UV, Alta Definição Freeform, Olho Seco/Fadiga).

- [ ] **Step 1: Criar SVG vetorial do mecanismo acomodativo do olho humano e fadiga ciliar**
- [ ] **Step 2: Criar SVG vetorial comparativo da Câmera (mecânico) vs. Olho (biológico)**
- [ ] **Step 3: Criar SVG do conceito óptico 2 em 1 com gradiente de potência**
- [ ] **Step 4: Validar renderização e proporções dos vetores**

---

### Task 3: Arquitetura HTML5 e Estilos CSS3 Widescreen (16:9)

**Files:**
- Create: `treinamento_gold_comfort.html`
- Create: `styles/slides.css`

**Interfaces:**
- Consumes: Componentes SVG da Task 2
- Produces: Framework de slides 16:9 com sistema de grid, tipografia responsiva para impressão, cabeçalhos, rodapés com numeração e estilos de componentes reutilizáveis (cards, badges, balões de script, tabelas comparativas).

- [ ] **Step 1: Criar folha de estilo CSS com reset, `@page` size 1920x1080px e variáveis de cores**
- [ ] **Step 2: Desenvolver o container de lâmina (`.slide`) com quebra de página precisa (`page-break-after: always`)**
- [ ] **Step 3: Testar renderização de layout base no navegador headless**

---

### Task 4: Implementação das Lâminas 1 a 7 (Abertura, Fisiologia e Produto)

**Files:**
- Modify: `treinamento_gold_comfort.html`

**Interfaces:**
- Produces: Conteúdo completo das primeiras 7 lâminas:
  - **Slide 1:** Capa de Alto Impacto.
  - **Slide 2:** O Ponto Cego do Balcão em 2026 (Astenopia e vida digital).
  - **Slide 3:** A Fisiologia da Fadiga (Músculo ciliar e a metáfora do autofoco).
  - **Slide 4:** A Ilusão das Lentes Prontas & Visão Simples Tradicional.
  - **Slide 5:** A Fórmula "2 em 1" (Longe perfeito + relaxamento ativo).
  - **Slide 6:** Salto Tecnológico: Gold Comfort Standard vs. Gold Comfort IA (Cálculo preditivo).
  - **Slide 7:** Matriz de Segmentação por Potência (D0.40 a D1.25 por faixa etária e perfil).

- [ ] **Step 1: Codificar Slides 1, 2 e 3 com narrativa envolvente e diagramas SVG**
- [ ] **Step 2: Codificar Slides 4, 5 e 6 com comparativo das lentes comuns vs 2 em 1 vs IA**
- [ ] **Step 3: Codificar Slide 7 com a tabela visual de segmentação D0.40 a D1.25**
- [ ] **Step 4: Renderizar parcial via script e inspecionar visualmente**

---

### Task 5: Implementação das Lâminas 8 a 13 (Mercado, Psicologia, Scripts e Fechamento)

**Files:**
- Modify: `treinamento_gold_comfort.html`

**Interfaces:**
- Produces: Conteúdo completo das lâminas 8 a 13:
  - **Slide 8:** Duelo de Titãs (Matriz Concorrencial vs. Eyezen, Sync III e Zeiss).
  - **Slide 9:** A Equação Financeira para o Consumidor (Sweet Spot e diluição diária).
  - **Slide 10:** Os 4 Pilares Psicológicos da Venda Consultiva.
  - **Slide 11:** Script de Ouro de Balcão (Sondagem e pitch 2 em 1).
  - **Slide 12:** Arsenal de Quebra de Objeções (Receita, Preço vs. Pronta, Adaptação, Marcas).
  - **Slide 13:** Conclusão & Checklist do Consultor de Alta Conversão.

- [ ] **Step 1: Codificar Slide 8 (Tabela Concorrencial) e Slide 9 (Sweet Spot de Preço ao Consumidor)**
- [ ] **Step 2: Codificar Slide 10 (Gatilhos Psicológicos) e Slide 11 (Script de Balcão)**
- [ ] **Step 3: Codificar Slide 12 (Quebra de Objeções) e Slide 13 (Checklist e Conclusão)**
- [ ] **Step 4: Realizar validação de texto e alinhamento visual**

---

### Task 6: Compilação do PDF Final e Inspeção Editorial

**Files:**
- Execute: `render_pdf.py`
- Output: `G:\Meu Drive\MACPRADO OK\CLIENTES\SRL\MARIO NETO\2026\TREINAMENTOS\TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf`

**Interfaces:**
- Consumes: `treinamento_gold_comfort.html`
- Produces: PDF editorial final de 13 páginas de altíssima definição.

- [ ] **Step 1: Executar compilação completa do PDF através do Playwright**
- [ ] **Step 2: Verificar contagem de páginas (exatamente 13 lâminas)**
- [ ] **Step 3: Extrair amostras visuais de páginas para garantia de qualidade estética**
- [ ] **Step 4: Registrar conclusão e disponibilizar caminho para o usuário**
