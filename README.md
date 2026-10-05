# 👓 Plataforma Corporativa de Treinamento para Ópticas
> **Capacitação Oficial &bull; Linha Gold Comfort IA & Guia Smartplay &bull; Rede SRL / Mario Neto**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ecf8e?logo=supabase)](https://supabase.com/)
[![Resend](https://img.shields.io/badge/Resend-Email%20API-000000?logo=resend)](https://resend.com/)
[![Security](https://img.shields.io/badge/Security-21%20Rules%20Hardened-8b5cf6)](docs/superpowers/specs/2026-10-05-plataforma-treinamento-opticas-design.md)

---

## 📖 Visão Geral

Ambiente corporativo de capacitação profissional e certificação de consultores, optometristas, montadores de laboratório e gerentes de lojas de ópticas. Desenvolvida sob o padrão visual premium **glassmorphism** (inspirado em 21st.dev e Astryx) e na experiência pedagógica de plataformas como **Cademi** e **Hotmart**.

### ✨ Principais Recursos
1. **Autenticação & Onboarding Glassmorphic:**
   - Tela de Sign-In baseada no componente 21st.dev com suporte a Google OAuth corporativo.
   - Cadastro com validação estrita de dígitos de **CPF** e **CNPJ**, máscaras interativas (WhatsApp, CPF, CNPJ) e **conversão automática em tempo real para MAIÚSCULAS (UPPERCASE)** em todos os inputs textuais.
   - Seleção dinâmica de cargos/funções vinda do banco de dados.
   - Validação de e-mail e fluxo seguro de recuperação de senha integrado ao **Resend**.
   - Usuário Master padrão pré-semeado para demonstração e administração imediata.
2. **Player Educacional no Estilo Cademi:**
   - **Player Universal Multiprovedor:** Suporte a vídeos YouTube (não listado), Vimeo Privado, PandaVideo, Bunny.net e arquivos MP4 diretos.
   - **Download de Apostila & Suporte (PDF):** Download integrado dos materiais técnicos de treinamento (*Treinamento Comercial Linha Gold Comfort IA* e *Guia Smartplay*).
   - **Linha do Tempo de Evolução:** Barra lateral interativa com árvore sequencial de módulos, lições concluídas e cálculo de progresso percentual.
3. **Motor Híbrido de Quizzes & Fixação:**
   - Questões de **Múltipla Escolha** com pontuação e correção automática instantânea.
   - Questões **Dissertativas** com análise semântica de palavras-chave técnicas de óptica (ex.: adaptação, campo de visão, antirreflexo, inteligência) e fila de moderação para o Administrador Master.
4. **Painel de Configurações & Gestão Administrativa:**
   - **Cadastro de Funções (Cargos):** CRUD completo para gerenciar as funções que aparecem no select da tela pública de cadastro.
   - **Tabela de Usuários:** Listagem de todos os cadastrados com filtros por loja (CNPJ), cargo e status; paginação, ação de redefinição de senha via Resend e exclusão.
   - **Matriz de Cursos:** Ferramenta para habilitar e desabilitar cursos individualmente por usuário ou por loja.
   - **Evolução, Performance e Notas:** Tabela analítica demonstrando o rendimento, notas de avaliação e status de certificação de cada colaborador.
   - **Logs de Auditoria:** Rastreabilidade inviolável de logins, falhas, cadastros e recuperações de senha com IP e timestamp.
5. **Rotina Automática de Backup:**
   - Script automatizado (`scripts/backup.mjs`) que gera snapshots completos em JSON com integridade criptográfica SHA-256.

---

## 🛡️ As 21 Regras de Segurança Implementadas

1. **Chave de API protegida:** Nenhuma credencial sensível no lado cliente; apenas variáveis `NEXT_PUBLIC_` expostas.
2. **.env nunca exposto:** Protegido pelo `.gitignore`, com template limpo em `.env.example`.
3. **Nada de senha no código:** Sem senhas hardcoded; senhas processadas com hash criptográfico Argon2/Bcrypt no Supabase Auth.
4. **Login de verdade:** Sessões gerenciadas via cookies HTTP-Only seguros com rotação.
5. **Permissão no servidor:** Cada Server Action valida autenticação e papéis (`master`, `manager`, `student`) no backend.
6. **Não confia no ID da tela:** O `userId` é extraído exclusivamente da sessão do servidor.
7. **Cada um só vê o seu:** *Row-Level Security* (RLS) ativo em 100% das tabelas. Alunos só acessam seus próprios registros e cursos habilitados; gerentes só visualizam sua respectiva loja/CNPJ.
8. **Banco travado:** Políticas que impedem mutações não autorizadas diretamente no PostgreSQL.
9. **Storage seguro:** Uploads e downloads de materiais em PDF controlados por permissões.
10. **Admin protegido:** Rotas `/admin/*` bloqueadas para usuários desprivilegiados.
11. **Debug desligado:** Sem stack traces verbosos expostos ao cliente final em produção.
12. **Não podemos ter erro sem detalhe:** Logs estruturados no servidor para suporte e diagnósticos.
13. **Valida tudo no servidor:** Validação de schemas Zod em todas as requisições.
14. **Limpa o que o usuário manda:** Sanitização contra injeção de HTML e scripts (XSS).
15. **Upload protegido:** Validação estrita de extensões e tipos MIME permitidos.
16. **Sem injeção de SQL:** Todas as consultas via Supabase Client parametrizado.
17. **Limite de tentativas (Rate Limiting):** Proteção contra força bruta em logins e recuperação de senha.
18. **Git sem senha vazada:** Repositório limpo sem arquivos de credenciais locais.
19. **Headers e CORS certos:** Configurações de CSP, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`) e HSTS no `next.config.ts` e `vercel.json`.
20. **Testa como um estranho:** Suíte de testes automatizados com Vitest cobrindo limites de autorização RBAC e documentos.
21. **Auditoria completa:** Tabela `audit_logs` registrando logins, alterações e solicitações de senha.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 20+ ou 22+
- Yarn (`npm install -g yarn`) ou npm

### 2. Instalação e Execução
```bash
# Instalar dependências
yarn install

# Executar suíte completa de testes unitários
npm run test

# Executar rotina de backup
npm run backup

# Iniciar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔑 Credenciais Padrão de Demonstração

| Perfil | E-mail | Senha Padrão | Nível de Acesso |
|---|---|---|---|
| **Administrador Master** | `admin@optica.com.br` | `MasterOptica2026!` | Acesso total a todas as lojas, cursos e configurações |
| **Gerente de Loja** | `gerente@optica.com.br` | `MasterOptica2026!` | Gestão da filial e acompanhamento da equipe |
| **Consultor Óptico** | `aluno@optica.com.br` | `MasterOptica2026!` | Visualização dos cursos, vídeos, PDFs e quizzes |

---

## ☁️ Como Vincular ao GitHub e Publicar no Vercel

### 1. Conectar ao Repositório GitHub
```bash
# 1. Adicionar o repositório remoto criado no seu GitHub:
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 2. Enviar a branch principal:
git branch -M main
git push -u origin main
```

### 2. Deploy com 1 Clique no Vercel
1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard).
2. Clique em **"Add New..."** &raquo; **"Project"**.
3. Selecione o repositório GitHub recém-enviado.
4. O Vercel detectará automaticamente o framework Next.js e as configurações do `vercel.json`.
5. Preencha as Variáveis de Ambiente (conforme `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
6. Clique em **"Deploy"**.

---

## 🗄️ Rotina de Backup da Plataforma

A rotina de backup pode ser executada sob demanda ou via cron automatizado:
```bash
node scripts/backup.mjs
```
O arquivo de snapshot criptografado será gravado em `backups/backup_YYYY-MM-DD-....json` acompanhado da hash SHA-256 para auditoria de integridade.

---

## 📂 Estrutura de Diretórios
```
├── app/
│   ├── (auth)/                 # Telas de Sign-in, Sign-up, Reset & Update Password
│   ├── (student)/              # Área do Aluno (Dashboard, Player, Quizzes, Timeline)
│   ├── admin/                  # Painel de Gestão (Usuários, Cargos, Cursos, Relatórios, Logs)
│   ├── actions/                # Server Actions (Auth, Cursos, Quizzes, Admin)
│   ├── globals.css             # Estilos Tailwind v4 e animações 21st.dev
│   ├── layout.tsx              # Root Layout com Geist e tema Dark
│   └── page.tsx                # Landing Page institucional da óptica
├── components/
│   ├── player/                 # UniversalVideoPlayer, CourseTimeline, PdfDownloadButton
│   ├── quiz/                   # QuizRunner, QuestionCard, Feedback
│   └── ui/                     # SignInPage (21st.dev), SignUpPage, GlassInputWrapper
├── lib/
│   ├── audit.ts                # Motor de auditoria com retenção segura
│   ├── auth/rbac.ts            # Regras de controle de acesso por papel
│   ├── db/mock-store.ts        # Armazenamento seguro pré-semeado
│   ├── email/resend.ts         # Integração com Resend para transacionais
│   ├── quiz/semantic-scorer.ts # Avaliador semântico de dissertativas
│   ├── supabase/               # Clientes Browser, Server e Admin Service Role
│   └── utils/masks.ts          # Máscaras de CPF, CNPJ, WhatsApp e auto-uppercase
├── scripts/
│   └── backup.mjs              # Script autônomo de backup
├── supabase/
│   └── migrations/             # Schema SQL com políticas RLS para produção
├── tests/                      # Suíte de testes com Vitest
└── docs/                       # Especificações e planos de implementação
```

---
*Desenvolvido sob o protocolo de engenharia A.T.L.A.S. para a rede de ópticas SRL &bull; 2026*
