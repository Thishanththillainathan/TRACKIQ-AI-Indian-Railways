const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://utrhtyjbhwyecxizmveo.supabase.co';
const supabaseAnonKey = 'sb_publishable_osJQECIQcys5TXUsKSWdCg__ZSApBOM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const tables = [
    'ai_planner_requests', 'alerts', 'ai_planner_alerts', 'notifications',
    'optimized_blocks', 'block_schedule', 'officer_approvals', 'approvals', 'historical_outcomes'
  ];

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`${t}: NOT FOUND (${error.message})`);
    } else {
      console.log(`${t}: EXISTS (rows: ${data.length})`);
    }
  }
}

check();
