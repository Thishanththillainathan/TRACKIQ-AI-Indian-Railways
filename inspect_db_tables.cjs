const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://utrhtyjbhwyecxizmveo.supabase.co';
const supabaseAnonKey = 'sb_publishable_osJQECIQcys5TXUsKSWdCg__ZSApBOM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectDatabase() {
  const tables = [
    'assets', 'machines', 'railway_assets',
    'track_requests', 'st_requests', 'trd_requests',
    'ai_planner_requests',
    'alerts', 'ai_planner_alerts', 'notifications',
    'optimized_blocks', 'block_schedule',
    'officer_approvals', 'approvals',
    'historical_outcomes', 'learning_loop', 'execution_monitor'
  ];

  console.log('=== INSPECTING SUPABASE TABLES ===\n');

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(2);
    if (error) {
      console.log(`Table '${t}': NOT ACCESSIBLE / DOES NOT EXIST (${error.message})`);
    } else {
      console.log(`✅ Table '${t}' EXISTS (${data.length} rows preview)`);
      if (data.length > 0) {
        console.log(`   Columns in '${t}':`, Object.keys(data[0]));
      } else {
        // Test common column names
        const candidateCols = [
          'id', 'created_at', 'updated_at', 'request_id', 'block_id', 'user_id',
          'department', 'asset_name', 'asset_type', 'asset_code', 'station_name', 'station_code',
          'division', 'zone', 'problem_description', 'urgency', 'safety_criticality',
          'duration_mins', 'resources_required', 'requested_window', 'requested_date',
          'received_at', 'status', 'start_time', 'end_time', 'train_impact',
          'confidence', 'ai_confidence', 'delay_risk', 'asset_availability_gain',
          'merged_jobs', 'combined_jobs', 'alert_type', 'message', 'read',
          'simulation_status', 'approval_status', 'source'
        ];
        const colsFound = [];
        for (const c of candidateCols) {
          const { error: cErr } = await supabase.from(t).select(c).limit(1);
          if (!cErr) colsFound.push(c);
        }
        console.log(`   Columns in empty table '${t}':`, colsFound);
      }
    }
  }
}

inspectDatabase();
