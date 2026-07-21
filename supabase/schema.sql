-- ==========================================
-- 1. LIMPEZA DO BANCO (Ordem reversa de FKs)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS task_files CASCADE;
DROP TABLE IF EXISTS task_steps CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================
-- 2. CRIAÇÃO DAS TABELAS
-- ==========================================

-- TABELA: profiles (Espelho do auth.users do Supabase)
CREATE TABLE profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- TABELA: user_preferences (Relação 1:1 com profiles)
CREATE TABLE user_preferences (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  font_size varchar,
  contrast_level bool,
  high_element_spacing bool,
  ui_mode bool,
  visual_feedback bool,
  extra_confirm bool,
  has_configured bool DEFAULT false,
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id)
);

-- TABELA: categories (Relação 1:N com tasks)
CREATE TABLE categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- TABELA: tasks (Relação 1:N com profiles e categories)
CREATE TABLE tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  is_completed bool DEFAULT false,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);

-- TABELA: task_steps (Relação 1:N com tasks)
CREATE TABLE task_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  step_order int4 NOT NULL,
  instruction text NOT NULL,
  is_completed bool DEFAULT false,
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT task_steps_pkey PRIMARY KEY (id)
);

-- TABELA: task_files (Relação de Anexos para Tasks ou Steps)
CREATE TABLE task_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  step_id uuid REFERENCES task_steps(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT task_files_pkey PRIMARY KEY (id),
  
  -- Regra: O arquivo deve pertencer estritamente a uma task OU a um step
  CONSTRAINT chk_file_owner CHECK (
    (task_id IS NOT NULL AND step_id IS NULL) OR
    (task_id IS NULL AND step_id IS NOT NULL)
  )
);

-- ==========================================
-- 3. SEGURANÇA: HABILITAR RLS (Row Level Security)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. POLÍTICAS DE RLS (Row Level Security)
-- ==========================================

-- profiles
CREATE POLICY "Permitir que usuários leiam o próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Permitir que usuários criem o próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir que usuários atualizem o próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_preferences
CREATE POLICY "Permitir que usuários leiam as próprias preferências" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Permitir que usuários criem as próprias preferências" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir que usuários atualizem as próprias preferências" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- categories (Acesso geral para leitura, criação e atualização por RLS pode ser expandida, ou deixar livre de leitura)
CREATE POLICY "Permitir leitura geral de categorias" ON categories
  FOR SELECT TO authenticated USING (true);

-- tasks
CREATE POLICY "Permitir que usuários acessem suas próprias tarefas" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- task_steps
CREATE POLICY "Permitir que usuários acessem os passos de suas tarefas" ON task_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_steps.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- task_files
CREATE POLICY "Permitir que usuários acessem os arquivos de suas tarefas" ON task_files
  FOR ALL USING (
    (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_files.task_id 
      AND tasks.user_id = auth.uid()
    )) OR
    (step_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM task_steps
      JOIN tasks ON tasks.id = task_steps.task_id
      WHERE task_steps.id = task_files.step_id 
      AND tasks.user_id = auth.uid()
    ))
  );

-- ==========================================
-- 5. TRIGGER PARA SINCRONIZAÇÃO AUTOMÁTICA
-- ==========================================
-- Função que cria o perfil e preferências padrão logo após o cadastro no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Cria o perfil do usuário
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'nome', 'Usuário SeniorEase'),
    new.email
  );

  -- Cria as preferências padrão do usuário (tamanho de fonte padrão, contraste desativado, etc)
  INSERT INTO public.user_preferences (
    user_id,
    font_size,
    contrast_level,
    high_element_spacing,
    ui_mode,
    visual_feedback,
    extra_confirm,
    has_configured
  )
  VALUES (
    new.id,
    'padrao', -- font_size ("padrao", "grande", "muito-grande")
    false,    -- contrast_level (alto contraste desligado)
    false,    -- high_element_spacing (amplo vs confortavel desligado)
    false,    -- ui_mode (modo simples desativado por padrão)
    true,     -- visual_feedback (feedback visual ativo por padrão)
    false,    -- extra_confirm (segurança de confirmação desativada por padrão)
    false     -- has_configured (falso na primeira criação)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associa a função ao trigger pós-cadastro
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
