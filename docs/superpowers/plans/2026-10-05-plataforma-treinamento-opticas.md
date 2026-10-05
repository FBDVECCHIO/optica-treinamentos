# Plano de Implementação: Plataforma de Treinamento Corporativo para Ópticas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma plataforma de treinamento corporativo completa para ópticas com gestão multi-loja (por CNPJ), autenticação glassmorphic (21st.dev/Astryx), player de cursos estilo Cademi com timeline de evolução, quizzes híbridos (alternativas e dissertativas com moderação), painel administrativo com auditoria e rotina de backup.

**Architecture:** Next.js 15 (App Router, Server Actions, React 19) com Tailwind CSS v4, Lucide Icons, Shadcn UI, banco de dados relacional PostgreSQL/Supabase com Row-Level Security ("cada um só vê o seu"), autenticação segura (Email e Google OAuth), serviço de e-mail via Resend, player universal e proteção de cabeçalhos HTTP.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, tw-animate-css, Lucide React, Supabase (PostgreSQL / RLS / Auth / Storage), Resend, Zod, Agent-Browser.

**Spec:** [docs/superpowers/specs/2026-10-05-plataforma-treinamento-opticas-design.md](docs/superpowers/specs/2026-10-05-plataforma-treinamento-opticas-design.md)

## Global Constraints

- **Segurança:** RLS ativo em 100% das tabelas; sem senhas em código fonte; chaves de API restritas no servidor; validação Zod rigorosa em todas as entradas.
- **Frontend & UX:** Design glassmorphic escuro baseado no componente 21st.dev fornecido; conversão obrigatória em tempo real de textos para UPPERCASE nos cadastros; máscaras para CPF, WhatsApp, CNPJ e Datas.
- **Player & Cursos:** Suporte a vídeos YouTube (não listado), Vimeo, PandaVideo, Bunny e MP4 direto; download de materiais em PDF integrado; timeline visual de progresso.
- **Auditoria:** Registro de IPs, ações de login, recuperação de senha e alterações cadastrais em `audit_logs`.
- **Rotina de Backup:** Script automatizado de exportação e documentação detalhada no README.

---

### Task 1: Scaffolding do Projeto Next.js 15, Tailwind v4, Animações e Cabeçalhos de Segurança

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `.env.example`
- Create: `.gitignore`
- Test: `tests/config.test.ts`

**Interfaces:**
- Consumes: Node.js 22, npm 11
- Produces: Base do projeto com suporte a TypeScript, Tailwind CSS v4, `@import "tw-animate-css"`, Lucide Icons, cabeçalhos de segurança HTTP (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff).

- [ ] **Step 1: Escrever teste de validação de configuração**

```typescript
// tests/config.test.ts
import { describe, it, expect } from 'vitest';
import nextConfig from '../next.config';

describe('Security Headers Configuration', () => {
  it('should include strict security headers', async () => {
    if (nextConfig.headers) {
      const headers = await nextConfig.headers();
      const globalHeaders = headers.find(h => h.source === '/(.*)');
      expect(globalHeaders).toBeDefined();
      const keys = globalHeaders?.headers.map(h => h.key);
      expect(keys).toContain('X-Frame-Options');
      expect(keys).toContain('X-Content-Type-Options');
      expect(keys).toContain('Strict-Transport-Security');
    }
  });
});
```

- [ ] **Step 2: Inicializar o Next.js 15 com TypeScript, Tailwind CSS e Dependências**

Executar no terminal:
`npm init -y`
Instalar dependências de produção: `next@latest react@latest react-dom@latest lucide-react clsx tailwind-merge zod tw-animate-css`
Instalar dependências de desenvolvimento: `typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss vitest`

- [ ] **Step 3: Configurar `next.config.ts` com Cabeçalhos de Segurança e Imagens Externas**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.21st.dev' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  }
};

export default nextConfig;
```

- [ ] **Step 4: Configurar `app/globals.css` com Tailwind 4 e Animações Solicitadas**

Incluir animações `fadeSlideIn`, `slideRightIn` e `testimonialIn` exatamente conforme o código do usuário:
```css
@import "tailwindcss";
@import "tw-animate-css";

@keyframes fadeSlideIn {
  from { opacity: 0; filter: blur(4px); transform: translateY(10px); }
  to { opacity: 1; filter: blur(0px); transform: translateY(0px); }
}

@keyframes slideRightIn {
  from { opacity: 0; filter: blur(4px); transform: translateX(-20px); }
  to { opacity: 1; filter: blur(0px); transform: translateX(0px); }
}

@keyframes testimonialIn {
  from { opacity: 0; filter: blur(4px); transform: translateY(10px) scale(0.95); }
  to { opacity: 1; filter: blur(0px); transform: translateY(0px) scale(1); }
}

.animate-element { animation: fadeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-slide-right { animation: slideRightIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-testimonial { animation: testimonialIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.animate-delay-100 { animation-delay: 100ms; }
.animate-delay-200 { animation-delay: 200ms; }
.animate-delay-300 { animation-delay: 300ms; }
.animate-delay-400 { animation-delay: 400ms; }
.animate-delay-500 { animation-delay: 500ms; }
.animate-delay-600 { animation-delay: 600ms; }
.animate-delay-700 { animation-delay: 700ms; }
.animate-delay-800 { animation-delay: 800ms; }
.animate-delay-900 { animation-delay: 900ms; }
.animate-delay-1000 { animation-delay: 1000ms; }
.animate-delay-1200 { animation-delay: 1200ms; }
.animate-delay-1400 { animation-delay: 1400ms; }

:root {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #18181b;
  --card-foreground: #fafafa;
  --primary: #8b5cf6;
  --primary-foreground: #ffffff;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --border: #27272a;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow-x: hidden;
}
```

- [ ] **Step 5: Executar testes de build e commit inicial**

Executar: `npx vitest run tests/config.test.ts`
Commit: `git commit -m "feat(core): scaffold Next.js 15, Tailwind v4, security headers and animations"`

---

### Task 2: Modelo de Dados (Supabase/PostgreSQL), Políticas RLS e Motor de Auditoria

**Files:**
- Create: `supabase/migrations/20261005000000_init_schema.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `lib/db/mock-store.ts` (armazenamento persistente local seguro para testes rápidos em dev sem bloquear ausência de credencial externa)
- Create: `lib/audit.ts`
- Create: `types/database.ts`
- Test: `tests/audit.test.ts`

**Interfaces:**
- Consumes: Variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Produces: `logAudit(action, metadata, userId, ip, userAgent)`, tipos `Store`, `Role`, `Profile`, `Course`, `Module`, `Lesson`, `Quiz`, `AuditLog`.

- [ ] **Step 1: Escrever teste do motor de auditoria**

```typescript
// tests/audit.test.ts
import { describe, it, expect } from 'vitest';
import { logAudit, getAuditLogs } from '../lib/audit';

describe('Audit Logging System', () => {
  it('should record an audit event and allow querying', async () => {
    const entry = await logAudit({
      action: 'LOGIN_SUCCESS',
      userId: 'usr_test_123',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 Test',
      metadata: { email: 'TESTE@OPTICA.COM.BR' }
    });
    expect(entry).toBeDefined();
    expect(entry.action).toBe('LOGIN_SUCCESS');

    const logs = await getAuditLogs({ limit: 10 });
    expect(logs.some(l => l.action === 'LOGIN_SUCCESS')).toBe(true);
  });
});
```

- [ ] **Step 2: Criar o script SQL de migração com todas as tabelas e políticas RLS**

Criar `supabase/migrations/20261005000000_init_schema.sql` cobrindo rigorosamente:
`stores`, `roles`, `profiles`, `courses`, `user_courses`, `modules`, `lessons`, `lesson_progress`, `quizzes`, `questions`, `quiz_attempts`, `quiz_answers`, `audit_logs` e políticas RLS `ENABLE ROW LEVEL SECURITY`.

- [ ] **Step 3: Implementar cliente Supabase e Camada Híbrida de Armazenamento Local Seguro**

Criar `lib/supabase/server.ts` e `lib/db/mock-store.ts` com dados pré-semeados dos cursos de óptica (*Gold Comfort* e *Smartplay*), lojas, cargos padrão e usuário Master (`admin@optica.com.br` / senha configurável).

- [ ] **Step 4: Executar testes de auditoria e commit**

Executar: `npx vitest run tests/audit.test.ts`
Commit: `git commit -m "feat(db): create database schema, RLS policies, types and audit logger"`

---

### Task 3: Autenticação Glassmorphic, Máscaras, Auto-UPPERCASE e Resend E-mails

**Files:**
- Create: `components/ui/sign-in.tsx`
- Create: `components/ui/sign-up.tsx`
- Create: `components/ui/password-strength.tsx`
- Create: `lib/utils/masks.ts`
- Create: `lib/email/resend.ts`
- Create: `app/(auth)/sign-in/page.tsx`
- Create: `app/(auth)/sign-up/page.tsx`
- Create: `app/(auth)/reset-password/page.tsx`
- Create: `app/(auth)/update-password/page.tsx`
- Create: `app/actions/auth.ts`
- Test: `tests/masks.test.ts`

**Interfaces:**
- Consumes: `lib/audit.ts`, `lib/db/mock-store.ts`, `lib/supabase/server.ts`
- Produces: Componentes de autenticação com validação client & server, máscaras de CPF, CNPJ e WhatsApp, uppercase em tempo real, rotas `/sign-in`, `/sign-up`, `/reset-password`.

- [ ] **Step 1: Escrever teste para funções de máscara e validação de documentos**

```typescript
// tests/masks.test.ts
import { describe, it, expect } from 'vitest';
import { maskCPF, maskPhone, maskCNPJ, isValidCPF, isValidCNPJ } from '../lib/utils/masks';

describe('Masks and Validators', () => {
  it('should mask CPF correctly', () => {
    expect(maskCPF('12345678901')).toBe('123.456.789-01');
  });

  it('should mask Phone correctly', () => {
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('should mask CNPJ correctly', () => {
    expect(maskCNPJ('12345678000195')).toBe('12.345.678/0001-95');
  });

  it('should validate CPF checksum', () => {
    expect(isValidCPF('11111111111')).toBe(false);
  });
});
```

- [ ] **Step 2: Implementar máscaras e auto-uppercase em `lib/utils/masks.ts`**

- [ ] **Step 3: Criar o componente `SignInPage` conforme especificação 21st.dev**

Copiar e integrar exatamente o componente de SignIn especificado pelo usuário em `components/ui/sign-in.tsx`, adaptando os seletores e submissão para Server Action.

- [ ] **Step 4: Criar o componente `SignUpPage` com todos os campos exigidos**

Campos: Nome Completo (UPPERCASE), WhatsApp, CPF, E-mail, Endereço, Senha com medidor de força, Loja e CNPJ da loja, Cargo (select dinâmico com cargos ópticos pré-cadastrados).

- [ ] **Step 5: Implementar Server Actions de autenticação, recuperação de senha com Resend e registro de auditoria**

Em `app/actions/auth.ts`:
- `handleRegister(formData)`
- `handleLogin(formData)`
- `handleGoogleSignIn()`
- `handlePasswordResetRequest(email)`
- `handleUpdatePassword(token, newPassword)`

- [ ] **Step 6: Executar testes de máscara e commit**

Executar: `npx vitest run tests/masks.test.ts`
Commit: `git commit -m "feat(auth): add 21st.dev glassmorphic sign-in, sign-up with masks, uppercase and Resend flows"`

---

### Task 4: Portal do Aluno: Player Cademi, Vídeo Universal, PDFs e Timeline de Progresso

**Files:**
- Create: `components/player/universal-video-player.tsx`
- Create: `components/player/course-timeline.tsx`
- Create: `components/player/pdf-download-button.tsx`
- Create: `app/(student)/dashboard/page.tsx`
- Create: `app/(student)/courses/page.tsx`
- Create: `app/(student)/courses/[id]/page.tsx`
- Create: `app/actions/courses.ts`
- Test: `tests/player.test.ts`

**Interfaces:**
- Consumes: `courses`, `modules`, `lessons`, `lesson_progress`, `user_courses`
- Produces: Player multimídia, timeline de evolução sequencial, botão seguro para download do PDF (*Linha Gold Comfort* / *Guia Smartplay*), dashboard do aluno com indicadores de performance.

- [ ] **Step 1: Escrever teste de progressão de aulas**

```typescript
// tests/player.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCourseProgress } from '../lib/utils/progress';

describe('Course Progress Calculation', () => {
  it('should calculate accurate percentage of completion', () => {
    const totalLessons = 10;
    const completedLessonIds = ['l1', 'l2', 'l3', 'l4', 'l5'];
    const progress = calculateCourseProgress(totalLessons, completedLessonIds.length);
    expect(progress).toBe(50);
  });
});
```

- [ ] **Step 2: Implementar o `UniversalVideoPlayer`**

Suportar embed inteligente de YouTube unlisted, Vimeo, PandaVideo, Bunny.net e tag `<video>` nativa para MP4.

- [ ] **Step 3: Implementar a `CourseTimeline`**

Exibir a trilha de aprendizagem estilo Cademi com módulos expansíveis, indicador de aula ativa, checkmark de concluída e tempo de duração.

- [ ] **Step 4: Implementar o Dashboard com Indicador de Performance**

Cards com:
- Total de Cursos Inscritos;
- Progresso Geral (%);
- Média das Notas nos Quizzes;
- Horas de Treinamento Dedicadas;
- Lista de cursos com botão "Continuar Treinamento".

- [ ] **Step 5: Executar testes e commit**

Executar: `npx vitest run tests/player.test.ts`
Commit: `git commit -m "feat(player): implement Cademi-style video player, PDF download and course progression timeline"`

---

### Task 5: Motor de Quizzes: Múltipla Escolha e Dissertativa com Avaliação Semântica

**Files:**
- Create: `lib/quiz/semantic-scorer.ts`
- Create: `components/quiz/quiz-runner.tsx`
- Create: `components/quiz/quiz-result.tsx`
- Create: `app/(student)/courses/[id]/quiz/page.tsx`
- Create: `app/actions/quiz.ts`
- Test: `tests/quiz.test.ts`

**Interfaces:**
- Consumes: `quizzes`, `questions`, `quiz_attempts`, `quiz_answers`
- Produces: Interface de quiz para o aluno, correção automática de alternativas, pré-pontuação semântica de dissertativas com envio para moderação.

- [ ] **Step 1: Escrever teste do avaliador semântico de dissertativas**

```typescript
// tests/quiz.test.ts
import { describe, it, expect } from 'vitest';
import { evaluateDissertativeAnswer } from '../lib/quiz/semantic-scorer';

describe('Semantic Dissertative Scorer', () => {
  it('should award points based on technical optical keywords presence', () => {
    const rubric = ['lente progressiva', 'campo de visão', 'antirreflexo', 'distorção'];
    const answer = 'A lente progressiva Gold Comfort otimiza o campo de visão e reduz a distorção lateral com antirreflexo de alta durabilidade.';
    const result = evaluateDissertativeAnswer(answer, rubric, 10);
    expect(result.score).toBeGreaterThanOrEqual(7.5);
    expect(result.matchedKeywords).toContain('campo de visão');
  });
});
```

- [ ] **Step 2: Implementar o algoritmo de avaliação semântica em `lib/quiz/semantic-scorer.ts`**

- [ ] **Step 3: Criar o componente `QuizRunner` e página do quiz**

Suportar perguntas de múltipla escolha com opções embaralhadas e perguntas dissertativas com campo de resposta estruturado.

- [ ] **Step 4: Integrar submissão com Server Action `submitQuizAttempt`**

Gravar pontuação na tabela `quiz_attempts` e marcar status `auto_graded` ou `pending_review`.

- [ ] **Step 5: Executar testes de quiz e commit**

Executar: `npx vitest run tests/quiz.test.ts`
Commit: `git commit -m "feat(quiz): add hybrid quiz engine with multiple-choice and semantic dissertative grading"`

---

### Task 6: Painel Administrativo Completo: Cargos, Usuários, Cursos, Quizzes, Relatórios e Logs

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/roles/page.tsx`
- Create: `app/admin/users/page.tsx`
- Create: `app/admin/courses/page.tsx`
- Create: `app/admin/quizzes/page.tsx`
- Create: `app/admin/reports/page.tsx`
- Create: `app/admin/audit-logs/page.tsx`
- Create: `app/actions/admin.ts`
- Test: `tests/admin.test.ts`

**Interfaces:**
- Consumes: Privilégio `master` / `manager`, todas as tabelas do banco
- Produces: Painel com CRUD de cargos, tabela de usuários com reset e exclusão, organizador de cursos e matriz de liberação individual, fila de correção de dissertativas, tabela de evolução e visualizador de logs.

- [ ] **Step 1: Escrever teste de autorização de rotas administrativas**

```typescript
// tests/admin.test.ts
import { describe, it, expect } from 'vitest';
import { canAccessAdmin } from '../lib/auth/rbac';

describe('RBAC Admin Authorization', () => {
  it('should allow master and manager but deny student', () => {
    expect(canAccessAdmin('master')).toBe(true);
    expect(canAccessAdmin('manager')).toBe(true);
    expect(canAccessAdmin('student')).toBe(false);
  });
});
```

- [ ] **Step 2: Implementar layout administrativo e proteção de rotas com RBAC**

- [ ] **Step 3: Implementar Gestão de Cargos (`/admin/roles`)**

CRUD de cargos para popular o select de cadastro.

- [ ] **Step 4: Implementar Tabela de Usuários (`/admin/users`)**

Listagem com busca, filtros por loja/cargo/status, paginação, ação de reset de senha (via Resend ou manual), alteração e exclusão lógica.

- [ ] **Step 5: Implementar Gestão de Cursos e Matriz de Permissões (`/admin/courses`)**

Upload de cursos, gerenciamento de módulos, e funcionalidade para **habilitar e desabilitar cursos individualmente por usuário**.

- [ ] **Step 6: Implementar Fila de Correção de Dissertativas e Tabela de Evolução (`/admin/quizzes` e `/admin/reports`)**

Moderação de notas das respostas dissertativas e análise de performance dos colaboradores.

- [ ] **Step 7: Implementar Visualizador de Logs de Auditoria (`/admin/audit-logs`)**

Tabela detalhada com IPs, timestamps, eventos de login, resets de senha e cadastros.

- [ ] **Step 8: Executar testes de administração e commit**

Executar: `npx vitest run tests/admin.test.ts`
Commit: `git commit -m "feat(admin): create complete management suite with users, roles, courses, quizzes, reports and audit logs"`

---

### Task 7: Rotina Automática de Backup, Versionamento Git e Preparação para Vercel

**Files:**
- Create: `scripts/backup.ts`
- Create: `vercel.json`
- Create: `README.md`
- Test: `tests/backup.test.ts`

**Interfaces:**
- Consumes: Banco de dados, arquivos de configuração
- Produces: Script de backup com exportação JSON/SQL criptografada, repositório git inicializado, `vercel.json`, documentação completa no README.

- [ ] **Step 1: Escrever teste do script de backup**

```typescript
// tests/backup.test.ts
import { describe, it, expect } from 'vitest';
import { createDatabaseSnapshot } from '../scripts/backup';

describe('Automated Backup System', () => {
  it('should create an encrypted or structured JSON snapshot of all system tables', async () => {
    const snapshot = await createDatabaseSnapshot();
    expect(snapshot).toBeDefined();
    expect(snapshot.timestamp).toBeDefined();
    expect(snapshot.tables).toContain('courses');
    expect(snapshot.tables).toContain('users');
  });
});
```

- [ ] **Step 2: Implementar `scripts/backup.ts`**

Exportar snapshot com timestamp, metadados de cursos, quizzes, logs e usuários.

- [ ] **Step 3: Criar `vercel.json` e documentação de deploy**

- [ ] **Step 4: Escrever `README.md` detalhado**

Explicando a arquitetura, variáveis de ambiente, instruções para vincular ao Vercel e GitHub, e operação da plataforma.

- [ ] **Step 5: Executar testes de backup e commit**

Executar: `npx vitest run tests/backup.test.ts`
Commit: `git commit -m "feat(ops): add automated backup script, vercel config and comprehensive README"`

---

### Task 8: Validação End-to-End Automatizada com Agent-Browser

**Files:**
- Create: `tests/e2e-browser-test.ts`

**Interfaces:**
- Consumes: Servidor Next.js rodando localmente
- Produces: Validação com screenshots dos fluxos de Login, Cadastro com máscaras e UPPERCASE, Player de Cursos com Timeline, Quiz e Painel Administrativo.

- [ ] **Step 1: Subir o servidor de desenvolvimento em porta local**
- [ ] **Step 2: Executar automação com `agent-browser`**
  - Abrir tela de `/sign-in` e verificar layout glassmorphic.
  - Abrir `/sign-up`, preencher formulário e validar máscaras e conversão para maiúsculas.
  - Realizar login com usuário Master e validar painel administrativo (`/admin`).
  - Navegar no player do curso de óptica e verificar timeline e botões de PDF.
  - Responder quiz e verificar cálculo de pontuação.
- [ ] **Step 3: Gerar capturas de tela comprobatórias e registrar no relatório de walkthrough**
