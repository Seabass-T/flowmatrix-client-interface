# FlowMatrix AI Client Interface - Quick Start Guide

## 🚨 Current Issue: RLS Policies Missing

Your dashboard is showing "Account Setup Required" because **Row-Level Security (RLS) policies are not configured** in your Supabase database.

### What's Happening

- ✅ User account exists: `a3fa6f8e-339b-4696-9faa-a3d4f365e723`
- ✅ User role is set to: `client`
- ✅ Data exists in `user_clients` table
- ❌ **RLS policies are blocking the query**

The database query is being blocked because Supabase RLS is enabled but policies haven't been created to allow users to read their own data.

---

## 🔧 Fix (5 minutes)

### Step 1: Run RLS Policy Script

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file: `docs/FIX_RLS_POLICIES.sql`
3. Copy the **entire contents** (all ~450 lines)
4. Paste into Supabase SQL Editor
5. Click **"Run"**

**What this does:**
- Drops any existing (incorrect) RLS policies
- Creates comprehensive RLS policies for all tables
- Allows clients to view their own data
- Allows employees to view all data
- Enables proper security while maintaining functionality

### Step 2: Add Sample Data (Optional but Recommended)

1. Still in **Supabase SQL Editor**
2. Open the file: `docs/SETUP_SAMPLE_DATA.sql`
3. **Update line 103** with your user ID: `a3fa6f8e-339b-4696-9faa-a3d4f365e723`
4. **Update line 106** with your user ID again
5. Copy the entire contents
6. Paste into Supabase SQL Editor
7. Click **"Run"**

**What this creates:**
- 1 Client Company: "UBL Group" (Construction industry)
- 3 Projects:
  - Email Organizer (Active) - saves 1 hr/day
  - Developer Email Outreach (Active) - saves 3 hrs/month
  - Company ERP System (In Development)
- Sample tasks and notes
- Expected ROI: ~$2,418
- Expected Time Saved: ~93 hours

### Step 3: Refresh Dashboard

1. Go back to your dashboard: `http://localhost:3000/dashboard/client`
2. **Hard refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. You should now see:
   - ✅ Total ROI metric
   - ✅ Time Saved metric
   - ✅ Total Costs metric
   - ✅ Time range filter working

---

## 📊 Expected Results

After running both SQL scripts, your dashboard will show:

### Overview Metrics
- **Total ROI**: $2,418 (MTD ▲ 12%)
- **Time Saved**: 93 hrs (all time ▲ 8%)
- **Total Costs**: $0 (all time)

### Time Range Filter
You can toggle between:
- Last 7 Days
- Last Month
- Last Quarter
- All Time (default)

Metrics recalculate automatically based on selected range.

---

## 🔍 How to Verify RLS Policies Are Working

### Test 1: Check Policies Exist
Run in Supabase SQL Editor:
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected**: You should see ~21 policies across all tables.

### Test 2: Test User Access
Run in Supabase SQL Editor:
```sql
-- This should return YOUR user_clients record
SELECT * FROM user_clients
WHERE user_id = 'a3fa6f8e-339b-4696-9faa-a3d4f365e723';
```

**Expected**: Should return 1 row with your user_id and client_id.

### Test 3: Check Dashboard Logs
In your terminal running `pnpm dev`, you should see:
```
User not associated with a client company yet: a3fa6f8e-339b-4696-9faa-a3d4f365e723
```

**After Fix**: This message should disappear and you'll see the dashboard load successfully.

---

## 🐛 Troubleshooting

### Issue: Still seeing "Account Setup Required"

**Solution 1: Clear Supabase Cache**
```sql
-- Run in Supabase SQL Editor
SELECT auth.uid(); -- Should return your user ID
```

**Solution 2: Check RLS is Enabled**
```sql
-- Run in Supabase SQL Editor
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
All tables should show `rowsecurity = true`.

**Solution 3: Verify Data Exists**
```sql
-- Check user exists
SELECT * FROM users WHERE id = 'a3fa6f8e-339b-4696-9faa-a3d4f365e723';

-- Check user_clients link exists
SELECT * FROM user_clients WHERE user_id = 'a3fa6f8e-339b-4696-9faa-a3d4f365e723';

-- Check client exists
SELECT * FROM clients;
```

### Issue: Getting 403 Forbidden Errors

This means RLS policies are too restrictive. Re-run `FIX_RLS_POLICIES.sql`.

### Issue: No Data Showing on Dashboard

Make sure you ran `SETUP_SAMPLE_DATA.sql` and updated the user IDs.

---

## 📁 File Structure

```
flowmatrix-client-interface/
├── docs/
│   ├── FIX_RLS_POLICIES.sql       ← **RUN THIS FIRST**
│   ├── SETUP_SAMPLE_DATA.sql      ← Run this second
│   ├── QUICKSTART_GUIDE.md        ← You are here
│   └── PRD.md                     ← Full requirements
├── app/
│   └── dashboard/
│       └── client/
│           └── page.tsx           ← Dashboard implementation
└── components/
    ├── MetricCard.tsx             ← Metric display
    └── TimeRangeFilter.tsx        ← Time range selector
```

---

## ✅ Success Checklist

- [ ] Ran `FIX_RLS_POLICIES.sql` in Supabase
- [ ] Ran `SETUP_SAMPLE_DATA.sql` in Supabase (updated user IDs)
- [ ] Refreshed dashboard (hard refresh)
- [ ] See 3 metric cards with real data
- [ ] Time range filter buttons work
- [ ] No errors in browser console
- [ ] No errors in terminal (pnpm dev)

---

## 🚀 Next Steps (After Dashboard Works)

1. **Add More Projects**: Create additional projects in Supabase
2. **Customize Company**: Update company name/industry in `clients` table
3. **Add Team Members**: Invite additional users to your client company
4. **Implement Project Cards**: Build out the project cards section (next sprint)
5. **Add Notes System**: Implement the dual notes panel (next sprint)

---

## 📞 Need Help?

**Check Logs:**
- Browser Console (F12 → Console tab)
- Terminal running `pnpm dev`

**Common Log Messages:**
- `User not associated with a client company yet` → RLS policies issue
- `Error fetching user client data: PGRST116` → RLS policies blocking query
- `Error fetching projects` → Projects table RLS issue

**All these are fixed by running `FIX_RLS_POLICIES.sql`**

---

## 🎯 Summary

**Root Cause**: Missing RLS policies on `user_clients` table
**Fix**: Run `docs/FIX_RLS_POLICIES.sql`
**Time**: 5 minutes
**Result**: Fully functional dashboard with real ROI metrics

**After fix, dashboard displays:**
- ✅ Aggregate ROI calculations
- ✅ Time saved metrics
- ✅ Total costs
- ✅ Time range filtering
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
