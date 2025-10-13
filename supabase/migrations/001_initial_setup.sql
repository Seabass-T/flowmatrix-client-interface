-- FlowMatrix AI Client Interface - Initial Database Setup
-- This script creates all necessary tables and Row-Level Security (RLS) policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('client', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can do anything"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================================
-- 2. CLIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  industry TEXT,
  avg_employee_wage DECIMAL(10,2) DEFAULT 25.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
CREATE POLICY "Employees can read all clients"
  ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

CREATE POLICY "Clients can read their own client data"
  ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clients
      WHERE user_clients.client_id = clients.id
      AND user_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update all clients"
  ON public.clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

CREATE POLICY "Anyone can insert clients (for signup)"
  ON public.clients
  FOR INSERT
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients(company_name);

-- ============================================================================
-- 3. USER_CLIENTS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);

-- Enable RLS
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own client associations"
  ON public.user_clients
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Employees can read all client associations"
  ON public.user_clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

CREATE POLICY "Anyone can insert user_clients (for signup)"
  ON public.user_clients
  FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON public.user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_client_id ON public.user_clients(client_id);

-- ============================================================================
-- 4. PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'dev', 'proposed', 'inactive')) DEFAULT 'proposed',
  description TEXT,

  -- Time savings (store one of these)
  hours_saved_daily DECIMAL(10,2),
  hours_saved_weekly DECIMAL(10,2),
  hours_saved_monthly DECIMAL(10,2),

  -- Financial data
  employee_wage DECIMAL(10,2) DEFAULT 25.00,
  dev_cost DECIMAL(10,2) DEFAULT 0,
  implementation_cost DECIMAL(10,2) DEFAULT 0,
  monthly_maintenance DECIMAL(10,2) DEFAULT 0,

  -- Dates
  go_live_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Employees can do anything with projects"
  ON public.projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

CREATE POLICY "Clients can read their own projects"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clients
      WHERE user_clients.client_id = projects.client_id
      AND user_clients.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- ============================================================================
-- 5. NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('client', 'flowmatrix_ai')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read notes for their projects"
  ON public.notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.user_clients ON projects.client_id = user_clients.client_id
      WHERE projects.id = notes.project_id
      AND user_clients.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

CREATE POLICY "Users can create notes for their projects"
  ON public.notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.user_clients ON projects.client_id = user_clients.client_id
      WHERE projects.id = notes.project_id
      AND user_clients.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON public.notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_author_id ON public.notes(author_id);

-- ============================================================================
-- 6. TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read tasks for their projects"
  ON public.tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.user_clients ON projects.client_id = user_clients.client_id
      WHERE projects.id = tasks.project_id
      AND user_clients.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

CREATE POLICY "Employees can modify tasks"
  ON public.tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);

-- ============================================================================
-- 7. FILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read files for their projects"
  ON public.files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.user_clients ON projects.client_id = user_clients.client_id
      WHERE projects.id = files.project_id
      AND user_clients.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

CREATE POLICY "Employees can manage files"
  ON public.files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'employee'
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);

-- ============================================================================
-- 8. TESTIMONIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read testimonials"
  ON public.testimonials
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create testimonials for their client"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clients
      WHERE user_clients.client_id = testimonials.client_id
      AND user_clients.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_testimonials_client_id ON public.testimonials(client_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete! All tables, RLS policies, and triggers created.';
END $$;
