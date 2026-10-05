/**
 * TRACKIQ END-TO-END WORKFLOW INTEGRATION SERVICE
 * Manages active request context, state handoffs, Request ID continuity,
 * and session persistence across all 8 workflow modules:
 * Maintenance Requests -> ML Predictions -> AI Block Planner -> Block Schedule -> Digital Twin -> Approval Workflow -> Execution Monitor
 */

const WORKFLOW_STORAGE_KEY = 'trackiq_active_workflow_context';

/**
 * Saves or updates the active request workflow context in sessionStorage.
 */
export function saveWorkflowContext(contextObj) {
  if (!contextObj) return null;
  try {
    const existing = getWorkflowContext() || {};
    const newReqId = contextObj.requestId || contextObj.request_id;
    const oldReqId = existing.requestId || existing.request_id;
    const isNewRequest = newReqId && oldReqId && newReqId !== oldReqId;

    let baseContext = existing;
    if (isNewRequest) {
      // Clear request-specific downstream derived objects
      const { mlPredictions, recommendation, blockData, blockId, block_id, executionState, actualOutcome, ...cleanBase } = existing;
      baseContext = cleanBase;
    }

    const updated = {
      ...baseContext,
      ...contextObj,
      updated_at: new Date().toISOString()
    };
    sessionStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[WorkflowService] Failed to save context to sessionStorage:', err);
    return contextObj;
  }
}

/**
 * Retrieves the active request workflow context from URL params, location state, or sessionStorage.
 */
export function getWorkflowContext(searchParams = null, locationState = null) {
  let context = null;

  // 1. Try reading from sessionStorage
  try {
    const stored = sessionStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (stored) {
      context = JSON.parse(stored);
    }
  } catch (err) {
    console.warn('[WorkflowService] Failed to read stored context:', err);
  }

  // Helper to normalize priority
  const normalizePriority = (val) => {
    if (!val) return undefined;
    const str = String(val).toUpperCase();
    if (str.startsWith('P1') || str.includes('HIGH') || str.includes('CRITICAL')) return 'P1 - High';
    if (str.startsWith('P2') || str.includes('MEDIUM')) return 'P2 - Medium';
    if (str.startsWith('P3') || str.includes('LOW')) return 'P3 - Low';
    return val;
  };

  // 2. Override with location.state if provided
  if (locationState) {
    const reqId = locationState.requestId || locationState.request_id || locationState.recommendation?.request_id;
    if (reqId) {
      const isDifferentReq = context && (context.requestId !== reqId && context.request_id !== reqId);
      const baseContext = isDifferentReq ? {} : (context || {});

      const durMins = locationState.durationMins || locationState.duration_mins || (isDifferentReq ? undefined : context?.durationMins);
      const durHours = locationState.duration_hours || locationState.durationHours || locationState.plannedDuration || (durMins ? durMins / 60.0 : (isDifferentReq ? undefined : context?.duration_hours));

      context = {
        ...baseContext,
        requestId: reqId,
        request_id: reqId,
        department: locationState.department || locationState.recommendation?.department || baseContext?.department || 'TRACK',
        assetId: locationState.assetId || locationState.asset_id || baseContext?.assetId,
        asset_id: locationState.assetId || locationState.asset_id || baseContext?.asset_id,
        station: locationState.station || locationState.station_name || baseContext?.station,
        blockId: locationState.blockId || locationState.block_id || locationState.recommendation?.block_id || baseContext?.blockId,
        work_type: locationState.work_type || locationState.workType || (isDifferentReq ? undefined : baseContext?.work_type),
        workType: locationState.work_type || locationState.workType || (isDifferentReq ? undefined : baseContext?.workType),
        duration_hours: durHours,
        durationHours: durHours,
        plannedDuration: durHours,
        durationMins: durMins,
        duration_mins: durMins,
        priority: normalizePriority(locationState.priority || locationState.urgency) || (isDifferentReq ? undefined : baseContext?.priority),
        urgency: locationState.urgency || locationState.priority || (isDifferentReq ? undefined : baseContext?.urgency),
        zone: locationState.zone || (isDifferentReq ? undefined : baseContext?.zone),
        division: locationState.division || (isDifferentReq ? undefined : baseContext?.division)
      };
    }
  }

  // 3. Override with URL search parameters if provided
  if (searchParams) {
    const reqId = searchParams.get('requestId') || searchParams.get('request_id');
    const blockId = searchParams.get('blockId') || searchParams.get('block_id');
    const dept = searchParams.get('department') || searchParams.get('dept');

    if (reqId || blockId) {
      const isDifferentReq = reqId && context && (context.requestId !== reqId && context.request_id !== reqId);
      const baseContext = isDifferentReq ? {} : (context || {});

      context = {
        ...baseContext,
        requestId: reqId || baseContext?.requestId,
        request_id: reqId || baseContext?.request_id,
        blockId: blockId || baseContext?.blockId,
        block_id: blockId || baseContext?.block_id,
        department: dept || baseContext?.department || 'TRACK'
      };
    }
  }

  return context;
}

/**
 * Clears the active request workflow context.
 */
export function clearWorkflowContext() {
  try {
    sessionStorage.removeItem(WORKFLOW_STORAGE_KEY);
  } catch (err) {
    console.warn('[WorkflowService] Failed to clear context:', err);
  }
}

export function registerSubmittedRequestId(requestId) {
  if (!requestId) return;
  try {
    const key = 'trackiq_submitted_request_ids';
    const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
    if (!existing.includes(requestId)) {
      existing.push(requestId);
      sessionStorage.setItem(key, JSON.stringify(existing));
    }
  } catch (err) {
    console.warn('[WorkflowService] Failed to register submitted request ID:', err);
  }
}

export function getSubmittedRequestIds() {
  try {
    const key = 'trackiq_submitted_request_ids';
    return JSON.parse(sessionStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function isSubmittedOrActiveRequest(req, activeContext) {
  if (!req) return false;
  const reqId = String(req.request_id || req.id || '');
  const activeReqId = String(activeContext?.requestId || activeContext?.request_id || '');
  const activeBlockId = String(activeContext?.blockId || activeContext?.block_id || '');

  if (activeReqId && (reqId === activeReqId || req.request_id === activeReqId)) return true;
  if (activeBlockId && (req.block_id === activeBlockId || req.id === activeBlockId)) return true;

  const submittedIds = getSubmittedRequestIds();
  if (submittedIds.includes(reqId) || submittedIds.includes(req.request_id)) return true;

  if (reqId.startsWith('REQ-2026-') || reqId.startsWith('REQ-2025-') || reqId.startsWith('REQ-2027-')) {
    return true;
  }

  const statusStr = String(req.status || '').toUpperCase();
  if (['NEW', 'SUBMITTED', 'ML_PROCESSING', 'PLANNED', 'SCHEDULED', 'ACTIVE_WORKFLOW'].includes(statusStr)) {
    return true;
  }

  return false;
}

/**
 * Returns formatted metadata for workflow banner headers.
 */
export function getWorkflowBannerMeta(context) {
  if (!context || (!context.requestId && !context.request_id)) return null;
  const reqId = context.requestId || context.request_id;
  return {
    requestId: reqId,
    blockId: context.blockId || context.block_id || null,
    department: context.department || 'TRACK',
    station: context.station || context.station_name || 'Station Not Specified',
    assetId: context.assetId || context.asset_id || 'N/A',
    status: context.status || 'ACTIVE'
  };
}
