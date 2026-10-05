# Especificação Técnica de Design: Plataforma de Treinamento para Ópticas

**Data:** 05/10/2026  
**Status:** Aprovado para Implementação  
**Arquitetura:** Next.js 15 (App Router) + Supabase (PostgreSQL, Auth, RLS, Storage) + Tailwind CSS v4 + Shadcn UI + Resend

---

## 1. Visão Geral do Sistema

Plataforma completa de treinamento corporativo desenvolvida especificamente para redes e lojas de ópticas (referência comercial: SRL / Mario Neto / Linha Gold Comfort / Smartplay). A solução atende a uma hierarquia multi-loja (por CNPJ), provê onboarding avançado com validação e máscaras em tempo real, entrega de cursos modulares com suporte a vídeo universal e download de PDFs protegidos, motor de quizzes híbrido (alternativo e dissertativo com moderação), timeline de progresso por aluno, painel administrativo centralizado com auditoria estrita e rotina automatizada de backup.

Inspirada nas melhores práticas visuais do **21st.dev**, **Astryx** e na usabilidade de plataformas como **Cademi** e **Hotmart**.

---

## 2. Modelo de Dados e Segurança de Banco (PostgreSQL / Supabase)

### 2.1 Esquema Relacional

```
[stores]
- id: uuid (PK)
- name: text (Nome Fantasia / Razão Social)
- cnpj: text (UNIQUE, formato 00.000.000/0000-00)
- address: text
- active: boolean (default true)
- created_at: timestamptz

[roles]
- id: uuid (PK)
- title: text (UNIQUE - ex: "CONSULTOR ÓPTICO", "GERENTE DE LOJA", "OPTOMETRISTA", "MONTADOR/LABORATÓRIO", "ADMINISTRADOR MASTER")
- description: text
- is_system: boolean (default false)
- created_at: timestamptz

[profiles]
- id: uuid (PK, references auth.users.id on delete cascade)
- name: text (sempre em MAIÚSCULAS)
- email: text (UNIQUE)
- cpf: text (UNIQUE, formato 000.000.000-00)
- phone: text (formato (00) 00000-0000)
- address: text
- store_id: uuid (FK -> stores.id)
- role_id: uuid (FK -> roles.id)
- access_level: text ('master' | 'manager' | 'student')
- active: boolean (default true)
- email_verified: boolean (default false)
- created_at: timestamptz
- updated_at: timestamptz

[courses]
- id: uuid (PK)
- title: text
- description: text
- slug: text (UNIQUE)
- thumbnail_url: text
- pdf_attachment_url: text (Supabase Storage path)
- is_published: boolean (default false)
- estimated_duration_min: integer (default 0)
- created_at: timestamptz
- updated_at: timestamptz

[user_courses]
- id: uuid (PK)
- user_id: uuid (FK -> profiles.id on delete cascade)
- course_id: uuid (FK -> courses.id on delete cascade)
- is_enabled: boolean (default true)
- enrolled_at: timestamptz (default now())
- UNIQUE(user_id, course_id)

[modules]
- id: uuid (PK)
- course_id: uuid (FK -> courses.id on delete cascade)
- title: text
- description: text
- order_index: integer (default 0)
- created_at: timestamptz

[lessons]
- id: uuid (PK)
- module_id: uuid (FK -> modules.id on delete cascade)
- title: text
- description: text
- video_provider: text ('youtube' | 'vimeo' | 'panda' | 'bunny' | 'direct_mp4')
- video_url: text
- duration_seconds: integer (default 0)
- order_index: integer (default 0)
- created_at: timestamptz

[lesson_progress]
- id: uuid (PK)
- user_id: uuid (FK -> profiles.id on delete cascade)
- lesson_id: uuid (FK -> lessons.id on delete cascade)
- completed: boolean (default false)
- completed_at: timestamptz
- UNIQUE(user_id, lesson_id)

[quizzes]
- id: uuid (PK)
- course_id: uuid (FK -> courses.id on delete cascade)
- title: text
- min_score_to_pass: numeric (default 70.0)
- created_at: timestamptz

[questions]
- id: uuid (PK)
- quiz_id: uuid (FK -> quizzes.id on delete cascade)
- question_text: text
- type: text ('multiple_choice' | 'dissertative')
- options: jsonb (para múltipla escolha: [{id: 1, text: 'Opção A'}, ...])
- correct_answer: text (armazenado com segurança, inacessível a alunos)
- rubric_keywords: text[] (palavras-chave e critérios para correção semântica de dissertativas)
- points: integer (default 10)
- order_index: integer (default 0)

[quiz_attempts]
- id: uuid (PK)
- user_id: uuid (FK -> profiles.id on delete cascade)
- quiz_id: uuid (FK -> quizzes.id on delete cascade)
- score: numeric (default 0.0)
- passed: boolean (default false)
- status: text ('in_progress' | 'submitted' | 'pending_review' | 'graded')
- submitted_at: timestamptz
- graded_at: timestamptz
- graded_by: uuid (FK -> profiles.id)

[quiz_answers]
- id: uuid (PK)
- attempt_id: uuid (FK -> quiz_attempts.id on delete cascade)
- question_id: uuid (FK -> questions.id on delete cascade)
- user_answer: text
- is_correct: boolean
- points_awarded: numeric (default 0)
- admin_feedback: text
- status: text ('auto_graded' | 'pending_review' | 'reviewed')

[audit_logs]
- id: uuid (PK)
- user_id: uuid (nullable, FK -> profiles.id on delete set null)
- action: text ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_COMPLETED', 'USER_REGISTERED', 'USER_UPDATED', 'USER_DELETED', 'COURSE_ACCESS_TOGGLED')
- ip_address: text
- user_agent: text
- metadata: jsonb
- created_at: timestamptz default now()
```

### 2.2 Políticas de Segurança RLS (Row-Level Security)
1. **Regra "Cada um só vê o seu":**
   - Usuário aluno só pode ler seu próprio registro na tabela `profiles`, seu próprio `lesson_progress` e seus próprios envios em `quiz_attempts`.
   - Gerente de Loja (`manager`) possui leitura nos perfis, progresso e notas pertencentes estritamente à sua `store_id`.
   - Administrador Master possui acesso irrestrito de leitura e escrita em todas as tabelas.
2. **Regra "Banco Travado":**
   - RLS ativo em 100% das tabelas. Sem RLS desligado sob nenhuma circunstância.
   - O campo `correct_answer` e `rubric_keywords` da tabela `questions` é protegido: consultas diretas de clientes autenticados como aluno têm permissão negada nas colunas de gabarito ou a validação é executada via Server Actions isoladas (SECURITY DEFINER / Service Role).
3. **Regra "Admin Protegido":**
   - A tabela `audit_logs` só pode ser lida por usuários autenticados cujo perfil possua `access_level = 'master'`.
   - Inserções em `audit_logs` ocorrem apenas por Server Actions via chave de serviço ou função do sistema.

---

## 3. Arquitetura Frontend e Experiência do Usuário (UX/UI)

### 3.1 Design System & Componentes
- **Tema e Estilo:** Base escura e elegante inspirada em 21st.dev e Astryx, com acentos em violeta e esmeralda para sinalização de progresso.
- **Glassmorphism:** Componentes em camadas com backdrop blur (`backdrop-blur-xl`), bordas sutis (`border-white/10`) e tipografia Geist.
- **Máscaras e Tratamento de Input:**
  - `CPF`: `999.999.999-99` (com validação de algoritmo de dígitos verificadores).
  - `WhatsApp`: `(99) 99999-9999`.
  - `CNPJ`: `99.999.999/9999-99` (com validação de cálculo de CNPJ).
  - **Conversão Automática:** Todo caractere textual digitado nos inputs de cadastro é imediatamente convertido para **UPPERCASE** via state/handler nativo antes de qualquer submissão.
- **Autenticação:**
  - Implementação fiel e expandida do componente `SignInPage` fornecido pelo usuário.
  - Tela de Sign-Up com os campos obrigatórios: Nome, WhatsApp, CPF, E-mail, Endereço, Senha com confirmação e medidor de força, Loja (vínculo por CNPJ) e Cargo (select vindo de `roles`).
  - Login social via Google OAuth integrado ao Supabase Auth.
  - Recuperação de senha com envio de e-mails transacionais via Resend.
  - Usuário Master padrão pré-semeado no setup inicial.

### 3.2 Ambiente do Aluno (Player Cademi-Style)
- **Dashboard:**
  - Métricas de desempenho consolidado: Cursos Concluídos, Aulas Assistidas, Média Geral nos Quizzes e Horas de Estudo.
  - Grade de cursos habilitados com thumbnail, badge de progresso percentual e link direto para retomar onde parou.
- **Player Educacional:**
  - Player de vídeo universal com suporte a YouTube (não listado), Vimeo, PandaVideo, Bunny.net e arquivos MP4.
  - Botão de **Download do Material Didático (PDF)** com verificação de autorização e entrega de URL assinada.
  - **Timeline de Evolução:** Barra lateral interativa com a árvore sequencial de módulos e aulas, marcando automaticamente o status concluído ao término da aula.
- **Motor de Quiz de Fixação:**
  - Interface moderna para resolução de questões.
  - Para questões de múltipla escolha: correção e feedback imediatos no envio.
  - Para questões dissertativas: análise semântica de correspondência a palavras-chave técnicas de óptica (ex.: termos técnicos de lentes progressivas Gold Comfort e guia Smartplay), atribuindo pontuação preliminar e sinalizando para moderação do Master.

### 3.3 Painel Administrativo e Configurações (Master / Gerente)
- **Gestão de Funções (Cargos):**
  - Criação, edição e exclusão de cargos que abastecem o select no cadastro público.
- **Gestão de Usuários:**
  - Tabela com filtros combinados (Loja, Cargo, Status, busca por Nome/CPF), paginação e ordenação.
  - Ações rápidas: Reset de senha (envio de link via Resend ou redefinição manual), edição de privilégios e exclusão de cadastro.
- **Gestão de Cursos e Conteúdo:**
  - Construtor de módulos, ordenação arrastável de aulas e uploads de PDFs e thumbnails.
  - **Matriz de Permissões de Curso:** Ativar ou desativar a visibilidade de qualquer curso para cada usuário individualmente ou por loja.
- **Gestão de Quizzes e Gabaritos:**
  - Construtor de perguntas com chave de resposta, alternativas e critérios dissertativos.
  - Fila de correção manual para perguntas dissertativas pendentes.
- **Relatório de Evolução e Notas:**
  - Tabela analítica com pontuação média, taxa de acerto por questão, evolução na timeline e certificados emitidos.
- **Trilha de Auditoria (Logs):**
  - Monitoramento de acessos, IPs, tentativas falhas de login, solicitações de reset de senha e alterações cadastrais.

---

## 4. Segurança da Informação (As 21 Diretrizes)

1. **Chave de API protegida:** Variáveis de ambiente divididas entre públicas (`NEXT_PUBLIC_`) e restritas de servidor (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`).
2. **.env nunca exposto:** Inclusão no `.gitignore`, verificação pré-commit e templates `.env.example` sem valores sensíveis.
3. **Nada de senha no código:** Sem senhas hardcoded; senhas armazenadas com hash criptográfico Argon2/Bcrypt no Supabase Auth.
4. **Login de verdade:** Sessões gerenciadas via cookies HTTP-Only seguros com rotação de tokens.
5. **Permissão no servidor:** Cada Server Action e API Route valida a sessão e a role do usuário antes de qualquer operação.
6. **Não confia no ID da tela:** O `user_id` em operações de aluno é extraído diretamente do token de sessão validado pelo servidor, nunca do payload da requisição.
7. **Cada um só vê o seu:** RLS ativo em 100% das tabelas.
8. **Banco travado:** Políticas que impedem mutações não autorizadas mesmo em caso de falha de validação no frontend.
9. **Storage seguro:** Bucket `course-materials` privado, acessível apenas via URLs pré-assinadas com tempo de expiração curto (15 minutos).
10. **Admin protegido:** Rotas `/admin/*` protegidas por middleware e checagem de perfil no nível de layout e Server Component.
11. **Debug desligado:** Variáveis e logs de depuração detalhados desativados em ambiente de produção.
12. **Não podemos ter erro sem detalhe:** Logs estruturados no servidor com rastreabilidade interna, mas mensagens genéricas e seguras entregues ao cliente.
13. **Valida tudo no servidor:** Schemas Zod em todas as entradas de dados.
14. **Limpa o que o usuário manda:** Sanitização de HTML e strings contra XSS e injection.
15. **Upload protegido:** Validação rigorosa de extensão, MIME-type (`application/pdf`, `image/png`, etc.) e limite de tamanho.
16. **Sem injeção de SQL:** Todas as consultas via Supabase Client parametrizado.
17. **Limite de tentativas (Rate Limiting):** Controle de frequência de requisições em endpoints de login e recuperação de senha.
18. **Git sem senha vazada:** Repositório limpo sem arquivos locais de credenciais.
19. **Headers e CORS certos:** Configuração de CSP (Content Security Policy), X-Frame-Options, X-Content-Type-Options e HSTS no `next.config.ts`.
20. **Testa como um estranho:** Testes automatizados de permissão simulando tentativas de acesso não autorizado entre alunos e lojas diferentes.
21. **Auditoria completa:** Registro permanente em `audit_logs`.

---

## 5. Rotina de Backup Automatizado

- Script de backup automatizado (`scripts/backup.ts`) para exportar o snapshot completo dos metadados de cursos, quizzes, configurações e auditoria em JSON estruturado e encriptado.
- Instrução de cron e documentação de exportação diária via pg_dump / Supabase CLI no `README.md`.

---

## 6. Plano de Testes e Validação com Agent-Browser

- Testes end-to-end automatizados via `/agent-browser`:
  - Fluxo 1: Onboarding e Cadastro com máscaras e conversão para UPPERCASE.
  - Fluxo 2: Login com usuário Master padrão e navegação no painel de administração.
  - Fluxo 3: Acesso do aluno ao curso, player de vídeo, download de PDF e timeline de evolução.
  - Fluxo 4: Realização de quiz e verificação de pontuação.
  - Fluxo 5: Teste de segurança (tentativa de acesso a rota `/admin` por aluno desprivilegiado -> bloqueio imediato).
