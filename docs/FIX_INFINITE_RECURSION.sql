-- ============================================================================
-- Fix Infinite Recursion in RLS Policies
-- ============================================================================
-- The "users" table policies are causing infinite recursion because they
-- query the same table they're protecting.
--
-- FIX: Remove the recursive policies and allow direct access based on auth.uid()
-- ============================================================================

-- Drop the problematic policies on users table
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Employees can view all users" ON users;
DROP POLICY IF EXISTS "Employees can manage users" ON users;

-- Create simple, non-recursive policies
-- Allow users to view their own record (no recursion)
CREATE POLICY "Users can view own record"
ON users
FOR SELECT
USING (id = auth.uid());

-- Allow employees to view all users (no recursion - uses auth metadata)
CREATE POLICY "Employees can view all users"
ON users
FOR SELECT
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
  OR id = auth.uid()
);

-- Allow employees to update users
CREATE POLICY "Employees can update users"
ON users
FOR UPDATE
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- Allow employees to insert users
CREATE POLICY "Employees can insert users"
ON users
FOR INSERT
WITH CHECK (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- ============================================================================
-- Also fix other policies that reference users table
-- ============================================================================

-- Fix user_clients policies
DROP POLICY IF EXISTS "Employees can view all client associations" ON user_clients;
DROP POLICY IF EXISTS "Employees can manage client associations" ON user_clients;

CREATE POLICY "Employees can view all client associations"
ON user_clients
FOR SELECT
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
  OR user_id = auth.uid()
);

CREATE POLICY "Employees can manage client associations"
ON user_clients
FOR ALL
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- Fix clients policies
DROP POLICY IF EXISTS "Employees can view all clients" ON clients;
DROP POLICY IF EXISTS "Employees can manage clients" ON clients;

CREATE POLICY "Employees can view all clients"
ON clients
FOR SELECT
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
  OR id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can manage clients"
ON clients
FOR ALL
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- Fix projects policies
DROP POLICY IF EXISTS "Employees can view all projects" ON projects;
DROP POLICY IF EXISTS "Employees can manage all projects" ON projects;

CREATE POLICY "Employees can view all projects"
ON projects
FOR SELECT
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
  OR client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can manage all projects"
ON projects
FOR ALL
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- Fix notes policies
DROP POLICY IF EXISTS "Employees can manage all notes" ON notes;

CREATE POLICY "Employees can manage all notes"
ON notes
FOR ALL
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- Fix tasks policies
DROP POLICY IF EXISTS "Employees can manage all tasks" ON tasks;

CREATE POLICY "Employees can manage all tasks"
ON tasks
FOR ALL
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- Fix files policies
DROP POLICY IF EXISTS "Employees can manage all files" ON files;

CREATE POLICY "Employees can manage all files"
ON files
FOR ALL
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

-- Fix testimonials policies
DROP POLICY IF EXISTS "Employees can view all testimonials" ON testimonials;

CREATE POLICY "Employees can view all testimonials"
ON testimonials
FOR SELECT
USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'employee'
);

SELECT 'Infinite recursion fixed! Try logging in again.' as message;
