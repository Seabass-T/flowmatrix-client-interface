-- ============================================================================
-- FINAL FIX: Store Role in JWT Token Metadata
-- ============================================================================
-- This script solves the RLS permission issues by storing the user role
-- in auth.users.raw_user_meta_data so it's available in the JWT token
-- without needing to query the public.users table.
--
-- This eliminates ALL RLS issues with the users table.
-- ============================================================================

-- ============================================================================
-- STEP 1: Update existing users - copy role from public.users to auth.users
-- ============================================================================

-- Update all existing users to have role in their metadata
UPDATE auth.users
SET raw_user_meta_data =
  COALESCE(raw_user_meta_data, '{}'::jsonb) ||
  jsonb_build_object('role', (
    SELECT role FROM public.users WHERE public.users.id = auth.users.id
  ))
WHERE id IN (SELECT id FROM public.users WHERE role IS NOT NULL);

-- Verify the update worked
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as role_in_jwt,
  pu.role as role_in_table
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.role IS NOT NULL;

-- ============================================================================
-- STEP 2: Create trigger function to auto-sync role changes
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_role_to_auth_users ON public.users;
DROP FUNCTION IF EXISTS sync_role_to_auth_metadata();

-- Create function to sync role to auth.users metadata
CREATE OR REPLACE FUNCTION sync_role_to_auth_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users metadata whenever public.users.role changes
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on public.users table
CREATE TRIGGER sync_role_to_auth_users
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_auth_metadata();

-- ============================================================================
-- STEP 3: Create function to handle new user signups
-- ============================================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to set up new users with default 'client' role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users with default 'client' role
  INSERT INTO public.users (id, email, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'client',  -- Default role
    NOW()
  );

  -- Update auth.users metadata with role
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', 'client')
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STEP 4: Test the setup
-- ============================================================================

-- Verify all existing users now have role in metadata
SELECT
  'Existing users with role in JWT:' as info,
  COUNT(*) as count
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
WHERE au.raw_user_meta_data->>'role' IS NOT NULL;

-- Show all users with their roles
SELECT
  au.email,
  au.raw_user_meta_data->>'role' as jwt_role,
  pu.role as table_role,
  CASE
    WHEN au.raw_user_meta_data->>'role' = pu.role THEN '✅ Synced'
    ELSE '❌ Out of sync'
  END as status
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
ORDER BY au.email;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- After running this script:
-- 1. All existing users have 'role' in their JWT token (raw_user_meta_data)
-- 2. Any future changes to public.users.role will auto-sync to JWT
-- 3. New signups will automatically get 'client' role in both tables
-- 4. No more database queries needed to get user role - read from JWT!
-- ============================================================================

SELECT '✅ Role sync setup complete! Users can now login without RLS issues.' as message;
