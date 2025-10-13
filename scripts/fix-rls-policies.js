#!/usr/bin/env node

/**
 * Fix RLS Policies Script
 *
 * This script connects to Supabase and creates all necessary RLS policies
 * for the FlowMatrix AI Client Interface.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql(sql, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return false;
    }
    console.log(`✅ Success`);
    return true;
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`);
    return false;
  }
}

async function fixRlsPolicies() {
  console.log('🚀 Starting RLS Policy Fix...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);

  // Read the SQL file
  const fs = require('fs');
  const path = require('path');
  const sqlPath = path.join(__dirname, '../docs/FIX_RLS_POLICIES.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Split into individual statements (simple split by semicolon)
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`\n📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Extract description from statement
    let description = `Statement ${i + 1}/${statements.length}`;
    if (stmt.includes('DROP POLICY')) {
      const match = stmt.match(/DROP POLICY IF EXISTS "([^"]+)"/);
      description = match ? `Drop policy: ${match[1]}` : 'Drop policy';
    } else if (stmt.includes('CREATE POLICY')) {
      const match = stmt.match(/CREATE POLICY "([^"]+)"/);
      description = match ? `Create policy: ${match[1]}` : 'Create policy';
    } else if (stmt.includes('ALTER TABLE')) {
      const match = stmt.match(/ALTER TABLE (\w+)/);
      description = match ? `Configure table: ${match[1]}` : 'Alter table';
    }

    const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' });

    if (error) {
      console.log(`❌ ${description} - ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${description}`);
      successCount++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 All RLS policies fixed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh your dashboard: http://localhost:3000/dashboard/client');
    console.log('   2. You should now see the metrics displayed correctly');
  } else {
    console.log('\n⚠️  Some statements failed. Check the errors above.');
  }
}

fixRlsPolicies().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
