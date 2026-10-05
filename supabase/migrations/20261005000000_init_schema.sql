-- ==============================================================================
-- SCHEMA INICIAL: PLATAFORMA DE TREINAMENTO CORPORATIVO PARA ÓPTICAS
-- Data: 05/10/2026
-- Regras de Segurança: RLS Ativo ("Cada um só vê o seu" / "Banco travado")
-- ==============================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Lojas / Unidades (Vínculo por CNPJ)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Cargos / Funções de Óptica (Alimenta o select no cadastro)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Convertido sempre para MAIÚSCULAS
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    store_id UUID REFERENCES public.stores(id) ON DELETE RESTRICT,
    role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
    access_level TEXT NOT NULL CHECK (access_level IN ('master', 'manager', 'student')) DEFAULT 'student',
    active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cursos de Treinamento
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    pdf_attachment_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    estimated_duration_min INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Associação Cursos x Usuários (Permite habilitar/desabilitar cursos por usuário)
CREATE TABLE IF NOT EXISTS public.user_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 7. Módulos do Curso
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Aulas / Lições (Vídeos)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_provider TEXT NOT NULL CHECK (video_provider IN ('youtube', 'vimeo', 'panda', 'bunny', 'direct_mp4')),
    video_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Progresso do Aluno (Timeline de Evolução)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, lesson_id)
);

-- 10. Quizzes de Fixação
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    min_score_to_pass NUMERIC(5,2) DEFAULT 70.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Questões do Quiz (Alternativas e Dissertativas)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'dissertative')),
    options JSONB, -- Array de objetos: [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}]
    correct_answer TEXT, -- Gabarito protegido
    rubric_keywords TEXT[], -- Palavras-chave para avaliação semântica
    points INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0
);

-- 12. Tentativas de Quiz do Aluno
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score NUMERIC(5,2) DEFAULT 0.0,
    passed BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted', 'pending_review', 'graded')) DEFAULT 'in_progress',
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES public.profiles(id)
);

-- 13. Respostas das Questões
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    points_awarded NUMERIC(5,2) DEFAULT 0.0,
    admin_feedback TEXT,
    status TEXT NOT NULL CHECK (status IN ('auto_graded', 'pending_review', 'reviewed')) DEFAULT 'auto_graded'
);

-- 14. Logs de Auditoria do Sistema
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ==============================================================================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions para checar perfil
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT access_level FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_store()
RETURNS UUID AS $$
  SELECT store_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- POLÍTICAS RLS:

-- Stores: Todos podem ler (para cadastro e seleção), apenas master pode gerenciar
CREATE POLICY "Leitura de lojas ativa para autenticados" ON public.stores
    FOR SELECT TO authenticated USING (active = true OR public.current_user_role() = 'master');
CREATE POLICY "Gestão de lojas apenas master" ON public.stores
    FOR ALL TO authenticated USING (public.current_user_role() = 'master');

-- Roles: Leitura pública para cadastro, gestão apenas master
CREATE POLICY "Leitura de cargos pública" ON public.roles
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Gestão de cargos apenas master" ON public.roles
    FOR ALL TO authenticated USING (public.current_user_role() = 'master');

-- Profiles: Cada um só vê o seu (aluno), gerente vê a sua loja, master vê todos
CREATE POLICY "Aluno lê próprio perfil" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid() OR
        (public.current_user_role() = 'manager' AND store_id = public.current_user_store()) OR
        public.current_user_role() = 'master'
    );
CREATE POLICY "Aluno atualiza próprio perfil básico" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid());
CREATE POLICY "Master gerencia qualquer perfil" ON public.profiles
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'master');

-- Courses: Aluno só vê cursos habilitados em user_courses e publicados; master vê tudo
CREATE POLICY "Cursos visíveis para aluno habilitado" ON public.courses
    FOR SELECT TO authenticated
    USING (
        public.current_user_role() = 'master' OR
        (is_published = true AND EXISTS (
            SELECT 1 FROM public.user_courses
            WHERE user_courses.course_id = courses.id
            AND user_courses.user_id = auth.uid()
            AND user_courses.is_enabled = true
        ))
    );
CREATE POLICY "Gestão de cursos master" ON public.courses
    FOR ALL TO authenticated USING (public.current_user_role() = 'master');

-- Lesson Progress: Aluno lê e atualiza seu próprio progresso
CREATE POLICY "Progresso individual do aluno" ON public.lesson_progress
    FOR ALL TO authenticated
    USING (
        user_id = auth.uid() OR
        public.current_user_role() = 'master' OR
        (public.current_user_role() = 'manager' AND EXISTS (
            SELECT 1 FROM public.profiles WHERE profiles.id = lesson_progress.user_id AND profiles.store_id = public.current_user_store()
        ))
    );

-- Audit Logs: Apenas Master lê
CREATE POLICY "Apenas Master visualiza logs de auditoria" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.current_user_role() = 'master');
CREATE POLICY "Inserção de logs por sistema" ON public.audit_logs
    FOR INSERT TO authenticated, anon WITH CHECK (true);

-- ==============================================================================
-- DADOS INICIAIS (SEED): CARGOS DE ÓPTICA
-- ==============================================================================
INSERT INTO public.roles (title, description, is_system) VALUES
('CONSULTOR ÓPTICO / VENDEDOR', 'Atendimento no balcão, apresentação de armações e prescrição de lentes oftálmicas', TRUE),
('GERENTE DE LOJA', 'Liderança de equipe comercial, metas e acompanhamento de indicadores da filial', TRUE),
('OPTOMETRISTA / TÉCNICO', 'Avaliação refrativa, contatologia e suporte técnico de lentes', TRUE),
('MONTADOR / LABORATÓRIO', 'Surfaçagem, corte de lentes, montagem e controle de qualidade', TRUE),
('ADMINISTRADOR MASTER', 'Acesso irrestrito a todas as operações e configurações da franqueadora', TRUE)
ON CONFLICT (title) DO NOTHING;

-- LOJA PADRÃO INICIAL
INSERT INTO public.stores (name, cnpj, address, active) VALUES
('ÓPTICA MODELO - MATRIZ SRL', '12.345.678/0001-95', 'AV. PRINCIPAL, 1000 - CENTRO', TRUE)
ON CONFLICT (cnpj) DO NOTHING;
