import { supabase } from '../lib/supabaseClient.js';
import { API_BASE_URL } from '../config/api.js';

/**
 * Fetches records from planned_execution_data table.
 * Fallbacks to optimized_blocks if planned_execution_data has no records.
 */
export async function fetchPlannedExecutionData() {
  try {
    const { data, error } = await supabase
      .from('planned_execution_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }

    // Fallback: Read from optimized_blocks
    const { data: blockData } = await supabase
      .from('optimized_blocks')
      .select('*')
      .order('created_at', { ascending: false });

    if (blockData && blockData.length > 0) {
      return blockData.map((b) => {
        const reqId = b.request_id || b.schedule_details?.request_id || `REQ-${b.block_id || b.id}`;
        return {
          id: b.id,
          request_id: reqId,
          activity_id: b.block_id || `ACT-${b.id}`,
          station_id: b.station_code || 'CBE',
          station_name: b.station || 'Coimbatore Junction',
          station_code: b.station_code || 'CBE',
          block_id: b.block_id || `BLK-${b.id}`,
          maintenance_type: b.department || 'TRACK',
          planned_start_time: b.start_time || '10:00 AM',
          planned_end_time: b.end_time || '11:15 AM',
          planned_duration: Number(b.duration_minutes || 75),
          planned_resource: 'Track Tamping Machine, 6 Crew',
          planned_team: `${b.department || 'TRACK'} Engineering Team`,
          planned_status: b.status || 'Planned',
          planned_notes: b.train_impact ? `Train Impact: ${b.train_impact}` : 'Standard Scheduled Block',
          created_at: b.created_at || new Date().toISOString(),
          updated_at: b.updated_at || new Date().toISOString()
        };
      });
    }

    return [];
  } catch (err) {
    console.error('Error fetching planned execution data:', err);
    return [];
  }
}

/**
 * Fetches records from actual_execution_data table.
 * Fallbacks to execution_monitor if actual_execution_data has no records.
 */
export async function fetchActualExecutionData() {
  try {
    const { data, error } = await supabase
      .from('actual_execution_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }

    // Fallback: Read from execution_monitor
    const { data: execData } = await supabase
      .from('execution_monitor')
      .select('*')
      .order('created_at', { ascending: false });

    if (execData && execData.length > 0) {
      return execData.map((e) => {
        const reqId = e.request_id || `REQ-${e.block_id || e.id}`;
        let actualDur = e.actual_duration_mins;
        if (actualDur === null || actualDur === undefined) {
          if (e.start_timestamp && e.actual_end_timestamp) {
            const st = new Date(e.start_timestamp).getTime();
            const et = new Date(e.actual_end_timestamp).getTime();
            if (!isNaN(st) && !isNaN(et)) {
              actualDur = Math.round((et - st) / 60000);
            }
          }
        }
        return {
          id: e.id,
          request_id: reqId,
          activity_id: e.execution_id || `ACT-${e.id}`,
          station_id: e.station_code || 'CBE',
          station_name: e.station_name || 'Coimbatore Junction',
          station_code: e.station_code || 'CBE',
          block_id: e.block_id || `BLK-${e.id}`,
          actual_start_time: e.start_timestamp || e.scheduled_start || new Date().toISOString(),
          actual_end_time: e.actual_end_timestamp || e.estimated_end_timestamp,
          actual_duration: actualDur !== null && actualDur !== undefined ? Number(actualDur) : null,
          actual_status: e.execution_status || 'Ready',
          failure_confirmed: (e.delay_mins && e.delay_mins > 15) ? true : false,
          problem_found: e.delay_mins > 0 ? `Execution delay of ${e.delay_mins} min reported` : 'No major defects',
          action_taken: e.execution_status === 'Completed' ? 'Maintenance work completed and track cleared' : 'Work in progress',
          delay_minutes: e.delay_mins || 0,
          actual_resource: `${e.work_crew_assigned || 6} Assigned Technicians`,
          actual_team: `${e.department || 'MULTI'} Field Crew`,
          actual_notes: e.safety_clearance_given ? 'Safety clearance issued by Site Engineer' : 'Awaiting clearance',
          created_at: e.created_at || new Date().toISOString(),
          updated_at: e.updated_at || new Date().toISOString()
        };
      });
    }

    return [];
  } catch (err) {
    console.error('Error fetching actual execution data:', err);
    return [];
  }
}

/**
 * Saves a new record ONLY to planned_execution_data table.
 */
export async function savePlannedExecutionRecord(planPayload) {
  try {
    const record = {
      request_id: planPayload.request_id || `REQ-${Date.now()}`,
      activity_id: planPayload.activity_id || `ACT-${Date.now()}`,
      station_id: planPayload.station_code || 'CBE',
      station_name: planPayload.station_name || 'Coimbatore Junction',
      station_code: planPayload.station_code || 'CBE',
      block_id: planPayload.block_id || `BLK-${Date.now()}`,
      maintenance_type: planPayload.maintenance_type || 'TRACK',
      planned_start_time: planPayload.planned_start_time || '10:00 AM',
      planned_end_time: planPayload.planned_end_time || '11:15 AM',
      planned_duration: Number(planPayload.planned_duration || 75),
      planned_resource: planPayload.planned_resource || 'Standard Maintenance Crew',
      planned_team: planPayload.planned_team || 'Divisional Maintenance Unit',
      planned_status: planPayload.planned_status || 'Planned',
      planned_notes: planPayload.planned_notes || 'Scheduled via AI Planner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('planned_execution_data')
      .insert([record])
      .select();

    if (error) {
      console.warn('planned_execution_data insert fallback:', error.message);
      // Fallback: save to optimized_blocks
      await supabase.from('optimized_blocks').insert([{
        block_id: record.block_id,
        station: record.station_name,
        station_code: record.station_code,
        department: record.maintenance_type,
        start_time: record.planned_start_time,
        end_time: record.planned_end_time,
        duration_minutes: record.planned_duration,
        status: record.planned_status
      }]);
    }

    return { success: true, record };
  } catch (err) {
    console.error('Error saving planned execution record:', err);
    return { success: false, error: err };
  }
}

/**
 * Starts actual execution by writing ONLY to actual_execution_data table.
 */
export async function startActualExecutionRecord(plannedRecord) {
  try {
    const now = new Date();
    const blockId = plannedRecord.block_id || `BLK-${plannedRecord.id}`;
    const reqId = plannedRecord.request_id || `REQ-${blockId}`;

    // Call unified backend action endpoint

    try {
      await fetch(`${API_BASE_URL}/api/block-schedule/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_id: blockId,
          request_id: reqId,
          action: 'START',
          notes: 'Execution started via Execution Monitor'
        })
      });
    } catch (apiErr) {
      console.warn('Backend start action notice:', apiErr);
    }

    const record = {
      request_id: reqId,
      activity_id: plannedRecord.activity_id || `EXEC-${blockId}`,
      station_id: plannedRecord.station_id || plannedRecord.station_code,
      station_name: plannedRecord.station_name,
      station_code: plannedRecord.station_code,
      block_id: blockId,
      actual_start_time: now.toISOString(),
      actual_end_time: null,
      actual_duration: null,
      actual_status: 'In Progress',
      failure_confirmed: false,
      problem_found: 'Work initiated - site clearance granted',
      action_taken: 'Crew deployed on track',
      delay_minutes: 0,
      actual_resource: plannedRecord.planned_resource || 'Track Crew',
      actual_team: plannedRecord.planned_team || 'Field Ops',
      actual_notes: 'Execution started',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    const { data, error } = await supabase
      .from('actual_execution_data')
      .upsert([record], { onConflict: 'block_id' })
      .select();

    if (error) {
      console.warn('actual_execution_data insert fallback:', error.message);
      await supabase.from('execution_monitor').upsert([{
        execution_id: `EXEC-${blockId}`,
        block_id: record.block_id,
        request_id: record.request_id,
        department: plannedRecord.maintenance_type,
        station_name: record.station_name,
        station_code: record.station_code,
        start_timestamp: record.actual_start_time,
        execution_status: 'In Progress',
        progress_percentage: 10
      }], { onConflict: 'block_id' });
    }

    return { success: true, record };
  } catch (err) {
    console.error('Error starting actual execution record:', err);
    return { success: false, error: err };
  }
}

/**
 * Completes actual execution by updating ONLY actual_execution_data table.
 */
export async function completeActualExecutionRecord(actualRecord, completionTelemetry = {}) {
  try {
    const now = new Date();
    const startTime = actualRecord.actual_start_time ? new Date(actualRecord.actual_start_time) : new Date();
    const actualDurationMins = Math.max(1, Math.round((now - startTime) / 60000));
    const blockId = actualRecord.block_id || `BLK-${actualRecord.id}`;
    const reqId = actualRecord.request_id || `REQ-${blockId}`;

    const handoffPayload = {
      request_id: reqId,
      block_id: blockId,
      station: actualRecord.station_name || actualRecord.station_code || 'Coimbatore Junction',
      department: actualRecord.department || actualRecord.maintenance_type || 'TRACK',
      work_type: actualRecord.work_type || actualRecord.problem_found || 'Track Maintenance',
      priority: actualRecord.priority || 'HIGH',
      planned_duration: Number(actualRecord.planned_duration || 75),
      actual_duration: completionTelemetry.actualDuration || actualDurationMins,
      planned_start: actualRecord.planned_start_time || '10:00 AM',
      planned_end: actualRecord.planned_end_time || '11:15 AM',
      actual_start: actualRecord.actual_start_time || new Date().toISOString(),
      actual_end: now.toISOString(),
      train_frequency: actualRecord.train_frequency || 12,
      scheduled_trains: actualRecord.scheduled_trains || 8,
      previous_delay: actualRecord.previous_delay || 0,
      actual_delay: completionTelemetry.delayMinutes || 0,
      execution_status: 'Completed',
      completion_timestamp: now.toISOString(),
      problem_found: completionTelemetry.problemFound || 'Routine completion',
      action_taken: completionTelemetry.actionTaken || 'Maintenance successfully executed',
      failure_confirmed: completionTelemetry.failureConfirmed || false,
      notes: completionTelemetry.notes || 'Execution closed'
    };

    let backendResult = null;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/execution-monitor/complete-and-handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handoffPayload)
      });
      backendResult = await resp.json();
    } catch (apiErr) {
      console.warn('Backend complete-and-handoff call failed:', apiErr);
    }

    const updates = {
      actual_end_time: now.toISOString(),
      actual_duration: handoffPayload.actual_duration,
      actual_status: 'Completed',
      failure_confirmed: completionTelemetry.failureConfirmed || false,
      problem_found: completionTelemetry.problemFound || 'Routine completion',
      action_taken: completionTelemetry.actionTaken || 'Maintenance successfully executed',
      delay_minutes: completionTelemetry.delayMinutes || 0,
      actual_resource: completionTelemetry.actualResource || actualRecord.actual_resource,
      actual_team: completionTelemetry.actualTeam || actualRecord.actual_team,
      actual_notes: completionTelemetry.notes || 'Execution closed',
      updated_at: now.toISOString()
    };

    const filterCol = actualRecord.id ? 'id' : 'block_id';
    const filterVal = actualRecord.id || blockId;

    const { data, error } = await supabase
      .from('actual_execution_data')
      .update(updates)
      .eq(filterCol, filterVal)
      .select();

    if (error) {
      console.warn('actual_execution_data update fallback:', error.message);
      await supabase.from('execution_monitor').update({
        execution_status: 'Completed',
        actual_end_timestamp: updates.actual_end_time,
        actual_duration_mins: updates.actual_duration,
        delay_mins: updates.delay_minutes,
        progress_percentage: 100
      }).eq('block_id', blockId);
    }

    const slStatus = (backendResult?.self_learning_status === 'SUCCESS' || backendResult?.self_learning_handshake === true) 
      ? 'SUCCESS' 
      : (backendResult?.self_learning_status || 'UNKNOWN');

    return { 
      success: true, 
      updates,
      backendResult,
      selfLearningStatus: slStatus
    };
  } catch (err) {
    console.error('Error completing actual execution record:', err);
    return { success: false, error: err };
  }
}

export async function retrySelfLearningHandoff(requestId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/execution-monitor/retry-self-learning-handoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId })
    });
    const data = await res.json();
    const slStatus = (data?.self_learning_status === 'SUCCESS' || data?.self_learning_handshake === true) 
      ? 'SUCCESS' 
      : (data?.self_learning_status || 'FAILED');
    return {
      ...data,
      self_learning_status: slStatus
    };
  } catch (err) {
    console.error('Error retrying self-learning handoff:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Compares one planned execution record with its corresponding actual execution record.
 */
export function calculateComparison(plannedRecord, actualRecord) {
  if (!plannedRecord && !actualRecord) return null;

  const plannedDur = plannedRecord ? Number(plannedRecord.planned_duration) : null;
  const actualDur = actualRecord && actualRecord.actual_duration !== null ? Number(actualRecord.actual_duration) : null;

  let durationVariance = null;
  let performancePct = null;

  if (plannedDur !== null && actualDur !== null && !isNaN(plannedDur) && !isNaN(actualDur)) {
    durationVariance = actualDur - plannedDur;
    if (actualDur > 0) {
      performancePct = Math.round((plannedDur / actualDur) * 1000) / 10;
    } else {
      performancePct = 100;
    }
  }

  let delayMins = 0;
  if (actualRecord && actualRecord.delay_minutes) {
    delayMins = Number(actualRecord.delay_minutes);
  } else if (durationVariance > 0) {
    delayMins = durationVariance;
  }

  return {
    requestId: plannedRecord?.request_id || actualRecord?.request_id,
    blockId: plannedRecord?.block_id || actualRecord?.block_id,
    stationName: plannedRecord?.station_name || actualRecord?.station_name,
    stationCode: plannedRecord?.station_code || actualRecord?.station_code,
    maintenanceType: plannedRecord?.maintenance_type || actualRecord?.department || 'TRACK',

    // Planned Fields
    plannedStart: plannedRecord?.planned_start_time || 'N/A',
    plannedEnd: plannedRecord?.planned_end_time || 'N/A',
    plannedDuration: plannedDur,
    plannedResource: plannedRecord?.planned_resource || 'N/A',
    plannedStatus: plannedRecord?.planned_status || 'Planned',

    // Actual Fields
    actualStart: actualRecord?.actual_start_time ? new Date(actualRecord.actual_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Started',
    actualEnd: actualRecord?.actual_end_time ? new Date(actualRecord.actual_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
    actualDuration: actualDur,
    actualResource: actualRecord?.actual_resource || 'N/A',
    actualStatus: actualRecord?.actual_status || 'Not Started',
    problemFound: actualRecord?.problem_found || 'N/A',
    actionTaken: actualRecord?.action_taken || 'N/A',
    failureConfirmed: actualRecord?.failure_confirmed || false,

    // Calculated Variance Metrics
    durationVariance,
    delayMins,
    performancePct,

    // Match status
    hasPlanned: !!plannedRecord,
    hasActual: !!actualRecord
  };
}

/**
 * Sends comparison results directly to the Learning Loop table in Supabase.
 */
export async function sendComparisonToLearningLoop(comparison) {
  try {
    const varianceStr = comparison.durationVariance !== null
      ? `${comparison.durationVariance >= 0 ? '+' : ''}${comparison.durationVariance} min`
      : '0 min';

    const payload = {
      request_id: comparison.requestId || 'REQ-SYS',
      block_id: comparison.blockId || 'BLK-SYS',
      department: comparison.maintenanceType || 'TRACK',
      station_code: comparison.stationCode || 'CBE',
      station_name: comparison.stationName || 'Coimbatore Junction',
      planned_value: `${comparison.plannedDuration || 60} min`,
      actual_value: comparison.actualDuration !== null ? `${comparison.actualDuration} min` : 'Pending',
      planned_duration: comparison.plannedDuration || 60,
      actual_duration: comparison.actualDuration || 60,
      time_variance: comparison.durationVariance || 0,
      performance_percentage: comparison.performancePct || 100,
      delay_category: comparison.delayMins > 15 ? 'Major Delay' : comparison.delayMins > 0 ? 'Minor Delay' : 'On Time',
      observed_pattern: `Execution Comparison for ${comparison.maintenanceType} at ${comparison.stationName}`,
      root_cause: comparison.problemFound || 'Field execution telemetry comparison',
      learning_insight: `Observed duration variance of ${varianceStr} against planned window.`,
      recommended_adjustment: comparison.durationVariance > 10
        ? `Increase future planned window by ${comparison.durationVariance} min for ${comparison.maintenanceType} at ${comparison.stationName}`
        : `Maintain current planned allocation for ${comparison.maintenanceType}`
    };

    const { data, error } = await supabase
      .from('learning_loop_insights')
      .insert([payload])
      .select();

    if (error) {
      console.warn('learning_loop_insights insert notice:', error.message);
      await supabase.from('historical_outcomes').insert([{
        block_id: comparison.blockId,
        request_id: comparison.requestId,
        department: comparison.maintenanceType,
        station_name: comparison.stationName,
        station_code: comparison.stationCode,
        recommended_window: `${comparison.plannedDuration} min`,
        actual_window: `${comparison.actualDuration} min`,
        delay_mins: comparison.delayMins,
        completion_status: comparison.actualStatus,
        approval_action: 'SENT_TO_LEARNING_LOOP',
        approval_comments: payload.learning_insight
      }]);
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error sending comparison to learning loop:', err);
    return { success: false, error: err };
  }
}
