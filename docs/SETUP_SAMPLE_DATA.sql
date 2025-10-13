-- ============================================================================
-- FlowMatrix AI Client Interface - Sample Data Setup
-- ============================================================================
-- This script creates sample data for testing the client dashboard
--
-- Instructions:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Update the user_id in the INSERT statements below (your actual user ID)
-- 4. Run the script
-- 5. Refresh your dashboard
--
-- Current User ID from error: a3fa6f8e-339b-4696-9faa-a3d4f365e723
-- ============================================================================

-- ============================================================================
-- STEP 1: Create a Client Company (Example: UBL Group)
-- ============================================================================

INSERT INTO clients (id, company_name, industry, avg_employee_wage)
VALUES (
  'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', -- Client ID
  'UBL Group',                              -- Company name
  'Construction',                           -- Industry
  26.00                                     -- Average employee wage ($26/hr)
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Link User to Client Company
-- ============================================================================
-- Replace 'a3fa6f8e-339b-4696-9faa-a3d4f365e723' with your actual user ID

INSERT INTO user_clients (user_id, client_id)
VALUES (
  'a3fa6f8e-339b-4696-9faa-a3d4f365e723',  -- Your user ID (CHANGE THIS!)
  'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6'   -- Client ID from Step 1
)
ON CONFLICT (user_id, client_id) DO NOTHING;

-- ============================================================================
-- STEP 3: Create Sample Projects (Active Systems)
-- ============================================================================

-- Project 1: Email Organizer & Summarizer (Active)
INSERT INTO projects (
  id,
  client_id,
  name,
  status,
  hours_saved_daily,
  employee_wage,
  dev_cost,
  implementation_cost,
  monthly_maintenance,
  go_live_date
) VALUES (
  'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'Email Organizer & Summarizer',
  'active',
  1.00,     -- 1 hour saved per day
  26.00,    -- $26/hr wage
  0.00,     -- No dev cost (free tier)
  0.00,     -- No implementation cost
  0.00,     -- No monthly maintenance
  '2025-07-10'  -- Go live date (adjust to ~3 months ago)
)
ON CONFLICT (id) DO NOTHING;

-- Project 2: Developer Email Outreach (Active)
INSERT INTO projects (
  id,
  client_id,
  name,
  status,
  hours_saved_monthly,
  employee_wage,
  dev_cost,
  implementation_cost,
  monthly_maintenance,
  go_live_date
) VALUES (
  'p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'Developer Email Outreach',
  'active',
  3.00,     -- 3 hours saved per month
  26.00,    -- $26/hr wage
  0.00,     -- No dev cost
  0.00,     -- No implementation cost
  0.00,     -- No monthly maintenance
  '2025-07-10'  -- Go live date
)
ON CONFLICT (id) DO NOTHING;

-- Project 3: Company ERP (In Development)
INSERT INTO projects (
  id,
  client_id,
  name,
  status,
  hours_saved_weekly,
  employee_wage,
  dev_cost,
  implementation_cost,
  monthly_maintenance,
  go_live_date
) VALUES (
  'p3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'Company ERP System',
  'dev',
  35.00,    -- Projected 35 hours saved per week
  30.00,    -- $30/hr wage
  0.00,     -- Dev cost TBD
  0.00,     -- Implementation cost TBD
  0.00,     -- Maintenance cost TBD
  NULL      -- Not live yet (in development)
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Create Sample Tasks
-- ============================================================================

-- Task 1: Completed task for Email Organizer
INSERT INTO tasks (project_id, description, is_completed, due_date, completed_at)
VALUES (
  'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'Initial setup and training for email organizer',
  TRUE,
  '2025-07-15',
  '2025-07-14'
)
ON CONFLICT DO NOTHING;

-- Task 2: Pending task for Email Organizer
INSERT INTO tasks (project_id, description, is_completed, due_date)
VALUES (
  'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'Review client feedback on email tagging logic',
  FALSE,
  '2025-10-20'
)
ON CONFLICT DO NOTHING;

-- Task 3: Pending task for ERP System
INSERT INTO tasks (project_id, description, is_completed, due_date)
VALUES (
  'p3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'Provide feedback on ERP wireframes',
  FALSE,
  '2025-10-25'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Create Sample Notes
-- ============================================================================

-- Note 1: FlowMatrix AI note for Email Organizer
INSERT INTO notes (project_id, author_id, note_type, content)
VALUES (
  'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'a3fa6f8e-339b-4696-9faa-a3d4f365e723',  -- Your user ID (CHANGE THIS!)
  'flowmatrix_ai',
  'Email system is now live and monitoring performance. Saving approximately 1 hour per day in email organization tasks.'
)
ON CONFLICT DO NOTHING;

-- Note 2: Client note for Email Organizer
INSERT INTO notes (project_id, author_id, note_type, content)
VALUES (
  'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'a3fa6f8e-339b-4696-9faa-a3d4f365e723',  -- Your user ID (CHANGE THIS!)
  'client',
  'We are seeing some emails not getting tagged correctly in the construction category. Can we review the tagging logic?'
)
ON CONFLICT DO NOTHING;

-- Note 3: FlowMatrix AI note for ERP System
INSERT INTO notes (project_id, author_id, note_type, content)
VALUES (
  'p3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
  'a3fa6f8e-339b-4696-9faa-a3d4f365e723',  -- Your user ID (CHANGE THIS!)
  'flowmatrix_ai',
  'ERP development started. Estimated 3 weeks to MVP. Projected to save 35 hours per week once live.'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION: Check that everything was created
-- ============================================================================

-- Check clients
SELECT 'Clients Created:' as info, COUNT(*) as count FROM clients WHERE id = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';

-- Check user_clients
SELECT 'User-Client Links:' as info, COUNT(*) as count FROM user_clients WHERE client_id = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';

-- Check projects
SELECT 'Projects Created:' as info, COUNT(*) as count FROM projects WHERE client_id = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';

-- Check tasks
SELECT 'Tasks Created:' as info, COUNT(*) as count FROM tasks WHERE project_id IN (
  SELECT id FROM projects WHERE client_id = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6'
);

-- Check notes
SELECT 'Notes Created:' as info, COUNT(*) as count FROM notes WHERE project_id IN (
  SELECT id FROM projects WHERE client_id = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6'
);

-- ============================================================================
-- Expected Results:
-- ============================================================================
-- After running this script, your dashboard should show:
--
-- Total ROI: ~$2,418 (based on 3 months of 1 hr/day at $26/hr + 3 hrs/month)
--   - Email Organizer: 1 hr/day × $26/hr × 90 days = $2,340
--   - Developer Outreach: 3 hrs/month × $26/hr × 3 months = $234
--   - ERP System: Not live yet, excluded from ROI
--
-- Time Saved: ~93 hours (all time)
--   - Email Organizer: 1 hr/day × 90 days = 90 hours
--   - Developer Outreach: 3 hours total over 3 months
--   - ERP System: Not live yet, excluded
--
-- Total Costs: $0 (all systems are free tier)
-- ============================================================================
