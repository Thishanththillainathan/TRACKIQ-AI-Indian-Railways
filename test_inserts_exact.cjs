const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://utrhtyjbhwyecxizmveo.supabase.co';
const supabaseAnonKey = 'sb_publishable_osJQECIQcys5TXUsKSWdCg__ZSApBOM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOptimizedBlocks() {
  console.log('Testing optimized_blocks...');
  const row = {
    block_id: 'BLK-TEST-001',
    station_name: 'Salem Junction',
    station_code: 'SA',
    zone: 'Southern Railway',
    division: 'Salem',
    corridor: 'Erode - Jolarpettai',
    planning_date: '2026-09-04',
    start_time: '02:30:00',
    end_time: '03:45:00',
    duration_mins: 75,
    total_jobs: 3,
    track_jobs_count: 1,
    st_jobs_count: 1,
    trd_jobs_count: 1,
    train_impact: 'LOW',
    delay_risk_pct: 4.2,
    confidence: 94.6,
    asset_availability_gain: 6.8,
    merged_jobs: [{ id: '1', dept: 'TRACK' }],
    status: 'OPTIMIZED'
  };
  const { data, error } = await supabase.from('optimized_blocks').insert([row]).select();
  if (error) {
    console.log('optimized_blocks error:', error);
  } else {
    console.log('optimized_blocks SUCCESS:', data);
    await supabase.from('optimized_blocks').delete().eq('block_id', 'BLK-TEST-001');
  }
}

async function testOfficerApprovals() {
  console.log('Testing officer_approvals...');
  const row = {
    block_id: 'BLK-TEST-001',
    zone: 'Southern Railway',
    division: 'Salem',
    station_name: 'Salem Junction',
    station_code: 'SA',
    planning_date: '2026-09-04',
    start_time: '02:30 AM',
    end_time: '03:45 AM',
    duration_mins: 75,
    combined_jobs: [{ id: '1', dept: 'TRACK' }],
    combined_jobs_count: 3,
    ai_confidence: 94.6,
    delay_risk_pct: 4.2,
    asset_availability_gain: '+6.8%',
    status: 'PENDING_OFFICER',
    source: 'AI_BLOCK_PLANNER'
  };
  const { data, error } = await supabase.from('officer_approvals').insert([row]).select();
  if (error) {
    console.log('officer_approvals error:', error);
  } else {
    console.log('officer_approvals SUCCESS:', data);
    await supabase.from('officer_approvals').delete().eq('block_id', 'BLK-TEST-001');
  }
}

async function run() {
  await testOptimizedBlocks();
  await testOfficerApprovals();
}

run();
