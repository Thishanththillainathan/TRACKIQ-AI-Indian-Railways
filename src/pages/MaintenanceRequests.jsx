import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  FileText,
  Plus,
  Bot,
  X,
  Loader2,
  RefreshCw,
  Send,
  MapPin,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Eye,
  Wrench,
  Cpu,
  Activity,
  Info,
  Brain
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import { sendRequestToMLPredictions, getLocalSentRequestIds } from '../services/mlPredictionsService.js';
import { saveWorkflowContext, getWorkflowContext, registerSubmittedRequestId, isSubmittedOrActiveRequest } from '../services/workflowService.js';
import Maintenance from './Maintenance';
import Engineering from './Engineering';
import Operations from './Operations';
import { useAuth } from '../context/AuthContext';
import WorkflowProgress from '../components/layout/WorkflowProgress';

/* =========================================================
   RAILWAY DATA & CONSTANTS
========================================================= */

const RAILWAY_DATA = [
  {
    code: 'CR',
    name: 'Central Railway',
    divisions: ['Mumbai', 'Bhusawal', 'Nagpur', 'Solapur', 'Pune']
  },
  {
    code: 'ER',
    name: 'Eastern Railway',
    divisions: ['Howrah', 'Sealdah', 'Asansol', 'Malda']
  },
  {
    code: 'ECR',
    name: 'East Central Railway',
    divisions: [
      'Danapur',
      'Dhanbad',
      'Pt. Deen Dayal Upadhyaya',
      'Samastipur',
      'Sonpur'
    ]
  },
  {
    code: 'ECOR',
    name: 'East Coast Railway',
    divisions: ['Khurda Road', 'Sambalpur', 'Rayagada']
  },
  {
    code: 'NR',
    name: 'Northern Railway',
    divisions: [
      'Ambala',
      'Delhi',
      'Firozpur',
      'Lucknow',
      'Moradabad',
      'Jammu'
    ]
  },
  {
    code: 'NCR',
    name: 'North Central Railway',
    divisions: ['Prayagraj', 'Agra', 'Jhansi']
  },
  {
    code: 'NER',
    name: 'North Eastern Railway',
    divisions: ['Izzatnagar', 'Lucknow', 'Varanasi']
  },
  {
    code: 'NFR',
    name: 'Northeast Frontier Railway',
    divisions: ['Katihar', 'Alipurduar', 'Rangiya', 'Lumding', 'Tinsukia']
  },
  {
    code: 'NWR',
    name: 'North Western Railway',
    divisions: ['Jaipur', 'Ajmer', 'Bikaner', 'Jodhpur']
  },
  {
    code: 'SR',
    name: 'Southern Railway',
    divisions: [
      'Chennai',
      'Tiruchchirappalli',
      'Madurai',
      'Palakkad',
      'Salem',
      'Thiruvananthapuram'
    ]
  },
  {
    code: 'SCR',
    name: 'South Central Railway',
    divisions: [
      'Secunderabad',
      'Hyderabad',
      'Vijayawada',
      'Guntakal',
      'Guntur',
      'Nanded'
    ]
  },
  {
    code: 'SER',
    name: 'South Eastern Railway',
    divisions: ['Kharagpur', 'Adra', 'Chakradharpur', 'Ranchi']
  },
  {
    code: 'SECR',
    name: 'South East Central Railway',
    divisions: ['Bilaspur', 'Raipur', 'Nagpur']
  },
  {
    code: 'SWR',
    name: 'South Western Railway',
    divisions: ['Hubballi', 'Bengaluru', 'Mysuru']
  },
  {
    code: 'WR',
    name: 'Western Railway',
    divisions: [
      'Mumbai Central',
      'Vadodara',
      'Ratlam',
      'Rajkot',
      'Bhavnagar',
      'Ahmedabad'
    ]
  },
  {
    code: 'WCR',
    name: 'West Central Railway',
    divisions: ['Jabalpur', 'Bhopal', 'Kota']
  }
];

const RESOURCE_OPTIONS = {
  TRACK: [
    'Tamping Express (09-3X)',
    'Dynamic Track Stabilizer (DTS)',
    'Ballast Regulating Machine (BRM)',
    'Rail Grinding Machine (RGM)',
    'Track Relaying Train (TRT)',
    'Gang Tool Kit & Ultrasonic Flaw Detector'
  ],
  'S&T': [
    'Integrated Testing Vehicle (ITV)',
    'Point Machine Alignment Rig',
    'Axle Counter Test Kit',
    'Signal Cable Fault Locator',
    'Track Circuit Measuring Kit',
    'Interlocking Tester & Multimeter'
  ],
  TRD: [
    'OHE Inspection Car (TOWER WAGON)',
    'Wire Tensioning Device Rig',
    'Insulator Washing Jet Truck',
    'Catenary Height Measuring Laser Meter',
    'Section Insulator Testing Kit',
    'Earthing Discharge Rod & Safety Gear'
  ]
};

const DEPARTMENT_WORK_TYPES = {
  TRACK: [
    'Track Tamping & Rail Alignment',
    'Ballast Cleaning & Deep Screening',
    'Rail Renewal & Welding',
    'Turnout & Point Machine Overhaul',
    'Corrective Repair',
    'Preventive Maintenance',
    'Renewal / Replacement',
    'Special Inspection & Testing'
  ],
  'S&T': [
    'Point Machine Repair & Calibration',
    'Signal Interlocking & Cable Testing',
    'Axle Counter Calibration',
    'Track Circuit Maintenance',
    'Corrective Repair',
    'Preventive Maintenance',
    'Renewal / Replacement',
    'Special Inspection & Testing'
  ],
  TRD: [
    'OHE Inspection & Maintenance',
    'Tower Car Patrolling',
    'Catenary Wire Tensioning',
    'Transformer Substation Maintenance',
    'Corrective Repair',
    'Preventive Maintenance',
    'Renewal / Replacement',
    'Special Inspection & Testing'
  ]
};

const getZoneObject = (zoneName) =>
  RAILWAY_DATA.find(
    (item) =>
      item.name.toLowerCase() === (zoneName || '').toLowerCase()
  );

const getTableName = (dept) => {
  const normalized = (dept || '').toUpperCase().trim();

  if (normalized === 'TRACK') return 'track_requests';
  if (normalized === 'S&T') return 'st_requests';
  if (normalized === 'TRD') return 'trd_requests';

  return null;
};

/* =========================================================
   DATE & TIME HELPERS
========================================================= */

export function formatTime24To12(time24) {
  if (!time24) return '';

  const parts = String(time24).split(':');

  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';

  if (isNaN(h)) return time24;

  const period = h >= 12 ? 'PM' : 'AM';

  if (h === 0) {
    h = 12;
  } else if (h > 12) {
    h -= 12;
  }

  const formattedH = String(h).padStart(2, '0');

  return `${formattedH}:${m} ${period}`;
}

export function parseDateTimeFromRequest(req) {
  if (!req) {
    return {
      dateStr: '9999-12-31',
      minutes: 0,
      createdAt: 0
    };
  }

  let dateStr = req.requested_date || '';
  let windowText = req.requested_window || '';
  let timeStr = windowText;

  if (windowText.includes('|')) {
    const parts = windowText.split('|');

    if (!dateStr) {
      dateStr = parts[0].trim();
    }

    timeStr = parts[1] ? parts[1].trim() : '';
  }

  if (!dateStr) {
    const match = windowText.match(/\d{4}-\d{2}-\d{2}/);

    if (match) {
      dateStr = match[0];
    }
  }

  if (!dateStr && req.created_at) {
    try {
      dateStr = new Date(req.created_at)
        .toISOString()
        .split('T')[0];
    } catch (e) {
      dateStr = '9999-12-31';
    }
  }

  let minutes = 0;

  /*
    Supports:
    09:30
    09:30 AM
    09:30 PM
    9:30 AM
    9:30 PM
  */
  const timeMatch = String(timeStr).match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const mins = parseInt(timeMatch[2], 10);

    const ampm = timeMatch[3]
      ? timeMatch[3].toUpperCase()
      : null;

    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    }

    if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }

    minutes = hours * 60 + mins;
  }

  const createdAt = req.created_at
    ? new Date(req.created_at).getTime()
    : 0;

  return {
    dateStr: dateStr || '9999-12-31',
    minutes,
    createdAt
  };
}

export function sortRequestsByDateTime(list = []) {
  return [...list].sort((a, b) => {
    const infoA = parseDateTimeFromRequest(a);
    const infoB = parseDateTimeFromRequest(b);

    if (infoA.dateStr !== infoB.dateStr) {
      return infoA.dateStr.localeCompare(infoB.dateStr);
    }

    if (infoA.minutes !== infoB.minutes) {
      return infoA.minutes - infoB.minutes;
    }

    return infoA.createdAt - infoB.createdAt;
  });
}

/* =========================================================
   MAINTENANCE OUTCOME HELPERS & COMPONENT
========================================================= */

const OUTCOME_DELIMITER = '\n\n--- MAINTENANCE OUTCOME ---\n';

export function parseOutcomeFromRequest(req) {
  if (!req) {
    return {
      status: 'Open',
      problemFound: '',
      actionTaken: '',
      repairDuration: '',
      failureConfirmed: 'No',
      resolvedDateTime: ''
    };
  }

  let outcome = {
    status: req.status || 'Open',
    problemFound: req.problem_found || '',
    actionTaken: req.action_taken || '',
    repairDuration: req.repair_duration || '',
    failureConfirmed:
      req.failure_confirmed === 'Yes' || req.failure_confirmed === true ? 'Yes' : 'No',
    resolvedDateTime: req.resolved_date_time || req.resolved_at || ''
  };

  const desc = req.problem_description || '';
  if (desc.includes(OUTCOME_DELIMITER)) {
    const parts = desc.split(OUTCOME_DELIMITER);
    const jsonStr = parts[1];
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed) {
        if (parsed.status) outcome.status = parsed.status;
        if (parsed.problemFound !== undefined) outcome.problemFound = parsed.problemFound;
        if (parsed.actionTaken !== undefined) outcome.actionTaken = parsed.actionTaken;
        if (parsed.repairDuration !== undefined) outcome.repairDuration = parsed.repairDuration;
        if (parsed.failureConfirmed !== undefined) outcome.failureConfirmed = parsed.failureConfirmed;
        if (parsed.resolvedDateTime !== undefined) outcome.resolvedDateTime = parsed.resolvedDateTime;
      }
    } catch (e) {
      console.warn('Failed to parse outcome JSON:', e);
    }
  }

  if (req.status && ['OPEN', 'IN PROGRESS', 'RESOLVED'].includes(String(req.status).toUpperCase())) {
    const formattedMap = { OPEN: 'Open', 'IN PROGRESS': 'In Progress', RESOLVED: 'Resolved' };
    outcome.status = formattedMap[String(req.status).toUpperCase()] || req.status;
  } else if (!outcome.status || outcome.status === 'PENDING_AI' || outcome.status === 'SENT_TO_AI') {
    outcome.status = 'Open';
  }

  return outcome;
}

export function getCleanProblemDescription(descStr) {
  if (!descStr) return '';
  if (descStr.includes(OUTCOME_DELIMITER)) {
    return descStr.split(OUTCOME_DELIMITER)[0].trim();
  }
  return descStr;
}

function MaintenanceOutcomeCard({ req, onSaveOutcome }) {
  const initialOutcome = useMemo(() => parseOutcomeFromRequest(req), [req]);

  const [status, setStatus] = useState(initialOutcome.status);
  const [problemFound, setProblemFound] = useState(initialOutcome.problemFound);
  const [actionTaken, setActionTaken] = useState(initialOutcome.actionTaken);
  const [repairDuration, setRepairDuration] = useState(initialOutcome.repairDuration);
  const [failureConfirmed, setFailureConfirmed] = useState(initialOutcome.failureConfirmed);
  const [resolvedDateTime, setResolvedDateTime] = useState(initialOutcome.resolvedDateTime);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const o = parseOutcomeFromRequest(req);
    setStatus(o.status);
    setProblemFound(o.problemFound);
    setActionTaken(o.actionTaken);
    setRepairDuration(o.repairDuration);
    setFailureConfirmed(o.failureConfirmed);
    setResolvedDateTime(o.resolvedDateTime);
  }, [req]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    const payload = {
      status,
      problemFound,
      actionTaken,
      repairDuration: repairDuration ? Number(repairDuration) : '',
      failureConfirmed,
      resolvedDateTime
    };

    const success = await onSaveOutcome(req, payload);
    setIsSaving(false);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-[#E5E5E5] bg-[#FAFAFA] p-4 rounded-xl space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <h5 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#111111]" />
          Maintenance Outcome
        </h5>
        {isSaved && (
          <span className="text-[11px] font-bold text-black bg-[#F5F5F5] border border-[#D9D9D9] px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" /> Saved to Supabase
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* 1. Status Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-[#525252] uppercase mb-1">
            Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111111] font-semibold rounded-lg p-2 focus:outline-none focus:border-[#111111] shadow-sm"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* 5. Failure Confirmed */}
        <div>
          <label className="block text-[10px] font-bold text-[#525252] uppercase mb-1">
            Failure Confirmed *
          </label>
          <select
            value={failureConfirmed}
            onChange={(e) => setFailureConfirmed(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111111] font-semibold rounded-lg p-2 focus:outline-none focus:border-[#111111] shadow-sm"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* 2. Problem Found */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-[#525252] uppercase mb-1">
            Problem Found
          </label>
          <textarea
            rows={2}
            placeholder="Details of defect or root cause found during inspection..."
            value={problemFound}
            onChange={(e) => setProblemFound(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111111] rounded-lg p-2 focus:outline-none focus:border-[#111111] shadow-sm"
          />
        </div>

        {/* 3. Action Taken */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-[#525252] uppercase mb-1">
            Action Taken
          </label>
          <textarea
            rows={2}
            placeholder="Action taken by technician to resolve issue..."
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111111] rounded-lg p-2 focus:outline-none focus:border-[#111111] shadow-sm"
          />
        </div>

        {/* 4. Repair Duration */}
        <div>
          <label className="block text-[10px] font-bold text-[#525252] uppercase mb-1">
            Repair Duration (Minutes)
          </label>
          <input
            type="number"
            min="0"
            placeholder="Duration in minutes (e.g. 45)"
            value={repairDuration}
            onChange={(e) => setRepairDuration(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111111] rounded-lg p-2 focus:outline-none focus:border-[#111111] shadow-sm"
          />
        </div>

        {/* 6. Resolved Date & Time */}
        <div>
          <label className="block text-[10px] font-bold text-[#525252] uppercase mb-1">
            Resolved Date & Time
          </label>
          <input
            type="datetime-local"
            value={resolvedDateTime}
            onChange={(e) => setResolvedDateTime(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111111] rounded-lg p-2 focus:outline-none focus:border-[#111111] shadow-sm"
          />
        </div>

        {/* SAVE BUTTON */}
        <div className="md:col-span-2 flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-[#111111] hover:bg-[#262626] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                SAVING TO SUPABASE...
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                UPDATE OUTCOME
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MaintenanceRequests({ initialTab }) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('sub') || searchParams.get('tab') || initialTab || 'requests';
  const activeSubTab = ['requests', 'maintenance', 'engineering', 'operations'].includes(String(rawTab).toLowerCase()) 
    ? String(rawTab).toLowerCase() 
    : 'requests';

  const setSubTab = (tabId) => {
    setSearchParams({ sub: tabId });
  };

  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);

  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState('ALL');

  const [requests, setRequests] = useState([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const [sentToMlIds, setSentToMlIds] = useState(() => getLocalSentRequestIds());
  const [sendingMlMap, setSendingMlMap] = useState({});

  const extractWorkTypeFromReq = (req) => {
    let wt = req.work_type || req.workType;
    if (!wt && req.problem_description && req.problem_description.includes('[Work Type:')) {
      const match = req.problem_description.match(/\[Work Type:\s*([^\]]+)\]/);
      if (match) wt = match[1].trim();
    }
    if (!wt) {
      const dept = (req.department || 'TRACK').toUpperCase();
      wt = dept === 'TRD' ? 'OHE Inspection & Maintenance' : (dept === 'S&T' || dept === 'ST' ? 'Point Machine Repair & Calibration' : 'Track Tamping & Rail Alignment');
    }
    return wt;
  };

  const handleSendToML = async (req) => {
    const reqId = req.request_id || req.id;
    setSendingMlMap((prev) => ({ ...prev, [reqId]: 'sending' }));

    const durHours = req.duration_hours || (req.duration_mins ? (req.duration_mins / 60.0) : (req.planned_duration || 1.5));
    const workTypeVal = extractWorkTypeFromReq(req);
    const pRaw = String(req.priority || req.urgency || '').toUpperCase();
    const normPriority = (req.priority && req.priority.startsWith('P') && req.priority.includes('-'))
      ? req.priority
      : (pRaw.includes('HIGH') || pRaw.includes('CRITICAL') || pRaw.startsWith('P1') ? 'P1 - High' : (pRaw.includes('MEDIUM') || pRaw.startsWith('P2') ? 'P2 - Medium' : 'P3 - Low'));

    saveWorkflowContext({
      requestId: reqId,
      request_id: reqId,
      department: req.department || 'TRACK',
      assetName: req.asset_name,
      assetId: req.asset_id || req.asset_name,
      asset_id: req.asset_id || req.asset_name,
      station: req.station_name || req.station,
      stationName: req.station_name || req.station,
      stationCode: req.station_code,
      division: req.division,
      zone: req.zone,
      work_type: workTypeVal,
      workType: workTypeVal,
      problemDescription: req.problem_description,
      urgency: req.urgency,
      priority: normPriority,
      durationMins: req.duration_mins,
      duration_mins: req.duration_mins,
      duration_hours: durHours,
      durationHours: durHours,
      plannedDuration: durHours,
      planned_duration: durHours,
      resourcesRequired: req.resources_required,
      requestedWindow: req.requested_window,
      requestedDate: req.requested_date,
      status: req.status || 'ML_PROCESSING'
    });

    const tableName = getTableName(req.department || department);
    const result = await sendRequestToMLPredictions(reqId, tableName);
    if (result.success) {
      setSendingMlMap((prev) => ({ ...prev, [reqId]: 'sent' }));
      setSentToMlIds((prev) => new Set([...prev, String(reqId)]));
    }
  };

  const handleSendToMLPredictions = (req) => {
    const reqId = req.request_id || req.id;
    const durHours = req.duration_hours || (req.duration_mins ? (req.duration_mins / 60.0) : (req.planned_duration || 1.5));
    const workTypeVal = extractWorkTypeFromReq(req);
    const pRaw = String(req.priority || req.urgency || '').toUpperCase();
    const normPriority = (req.priority && req.priority.startsWith('P') && req.priority.includes('-'))
      ? req.priority
      : (pRaw.includes('HIGH') || pRaw.includes('CRITICAL') || pRaw.startsWith('P1') ? 'P1 - High' : (pRaw.includes('MEDIUM') || pRaw.startsWith('P2') ? 'P2 - Medium' : 'P3 - Low'));

    saveWorkflowContext({
      requestId: reqId,
      request_id: reqId,
      department: req.department || 'TRACK',
      assetName: req.asset_name,
      assetId: req.asset_id || req.asset_name,
      asset_id: req.asset_id || req.asset_name,
      station: req.station_name || req.station,
      stationName: req.station_name || req.station,
      stationCode: req.station_code,
      division: req.division,
      zone: req.zone,
      work_type: workTypeVal,
      workType: workTypeVal,
      problemDescription: req.problem_description,
      urgency: req.urgency,
      priority: normPriority,
      durationMins: req.duration_mins,
      duration_mins: req.duration_mins,
      duration_hours: durHours,
      durationHours: durHours,
      plannedDuration: durHours,
      planned_duration: durHours,
      resourcesRequired: req.resources_required,
      requestedWindow: req.requested_window,
      requestedDate: req.requested_date,
      status: req.status || 'ML_PROCESSING'
    });
    setSelectedDetailRequest(null);
    navigate(`/ml-predictions?requestId=${encodeURIComponent(reqId)}`);
  };

  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const [showNewModal, setShowNewModal] = useState(false);

  // Lock background page scrolling when modal is active, restore on close
  useEffect(() => {
    if (showNewModal || selectedDetailRequest || deletingItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showNewModal, selectedDetailRequest, deletingItem]);

  /* =======================================================
     NEW REQUEST FORM STATE
  ======================================================= */

  const [newDepartment, setNewDepartment] = useState('TRACK');
  const [newAsset, setNewAsset] = useState('');
  const [newWorkType, setNewWorkType] = useState('Track Tamping & Rail Alignment');
  const [newStation, setNewStation] = useState('');
  const [newStationCode, setNewStationCode] = useState('');
  const [newDivision, setNewDivision] = useState('');
  const [newZone, setNewZone] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newCriticality, setNewCriticality] = useState('HIGH');
  const [newRequestedDate, setNewRequestedDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newResources, setNewResources] = useState('');
  const [newTrainImpact, setNewTrainImpact] = useState('Low');

  const currentNewZone = getZoneObject(newZone);
  const divisionOptions = currentNewZone?.divisions || [];

  useEffect(() => {
    if (!newZone) return;

    if (
      newDivision &&
      divisionOptions.includes(newDivision)
    ) {
      return;
    }

    setNewDivision(divisionOptions[0] || '');
  }, [newZone, newDivision, divisionOptions]);

  /* =======================================================
     FETCH REQUESTS FROM SUPABASE
  ======================================================= */

  const fetchRequests = async (dept = department) => {
    setLoadingRequests(true);

    let effectiveDept = dept;
    if (authUser?.role === 'TMS_OFFICER') {
      effectiveDept = 'TRACK';
    } else if (authUser?.role === 'SMMS_OFFICER') {
      effectiveDept = 'S&T';
    } else if (authUser?.role === 'TRD_OFFICER') {
      effectiveDept = 'TRD';
    }

    try {
      let mergedData = [];

      if (!effectiveDept || effectiveDept === 'ALL') {
        const tableNames = [
          'track_requests',
          'st_requests',
          'trd_requests'
        ];

        const results = await Promise.all(
          tableNames.map(async (tableName) => {
            const { data, error } = await supabase
              .from(tableName)
              .select('*');

            if (error) {
              console.error(
                `Failed to fetch ${tableName}:`,
                error
              );

              return [];
            }

            return data || [];
          })
        );

        mergedData = [
          ...results[0],
          ...results[1],
          ...results[2]
        ];
      } else {
        const tableName = getTableName(effectiveDept);

        if (tableName) {
          const { data, error } = await supabase
            .from(tableName)
            .select('*');

          if (!error && data) {
            mergedData = data;
          } else if (error) {
            console.error(
              `Failed to fetch ${tableName}:`,
              error
            );
          }
        }
      }

      const uniqueMap = new Map();

      for (const item of mergedData) {
        const key = item.request_id || item.id;

        if (key && !uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      }

      const uniqueList = Array.from(uniqueMap.values());

      const sorted = sortRequestsByDateTime(uniqueList);

      setRequests(sorted);
    } catch (error) {
      console.error('Request loading failed:', error);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  /* =======================================================
     LOAD USER SESSION
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoadingUser(true);

      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        const activeUser = session?.user || null;

        if (!activeUser) {
          if (mounted) {
            setUser(null);
            setDepartment('ALL');
            await fetchRequests('ALL');
          }

          return;
        }

        if (!mounted) return;

        setUser(activeUser);

        let userDept =
          activeUser.user_metadata?.department || 'ALL';

        userDept = String(userDept)
          .trim()
          .toUpperCase();

        if (
          !['TRACK', 'S&T', 'TRD', 'ALL'].includes(userDept)
        ) {
          userDept = 'ALL';
        }

        if (mounted) {
          setDepartment(userDept);

          setNewDepartment(
            userDept === 'ALL'
              ? 'TRACK'
              : userDept
          );

          await fetchRequests(userDept);
        }
      } catch (error) {
        console.error('User loading error:', error);

        if (mounted) {
          setDepartment('ALL');
          await fetchRequests('ALL');
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        const u = session?.user || null;

        setUser(u);

        let dept =
          u?.user_metadata?.department || 'ALL';

        dept = String(dept)
          .trim()
          .toUpperCase();

        if (
          !['TRACK', 'S&T', 'TRD', 'ALL'].includes(dept)
        ) {
          dept = 'ALL';
        }

        setDepartment(dept);

        fetchRequests(dept);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  /* =======================================================
     MODAL & FORM HELPERS
  ======================================================= */

  const resetForm = () => {
    const defaultZone = getZoneObject('Southern Railway')
      ? 'Southern Railway'
      : RAILWAY_DATA[0].name;

    const defaultDivision =
      getZoneObject(defaultZone)?.divisions?.[0] || '';

    const activeDept = department === 'ALL' ? 'TRACK' : department;
    setNewDepartment(activeDept);
    setNewWorkType(DEPARTMENT_WORK_TYPES[activeDept]?.[0] || 'Track Tamping & Rail Alignment');

    setNewAsset('');
    setNewStation('');
    setNewStationCode('');
    setNewDivision(defaultDivision);
    setNewZone(defaultZone);
    setNewProblem('');
    setNewCriticality('HIGH');
    setNewRequestedDate('');
    setNewStartTime('');
    setNewEndTime('');
    setNewDuration('');
    setNewResources('');
    setNewTrainImpact('Low');
  };

  const openNewRequestModal = () => {
    if (!user) {
      alert(
        'Authentication required. Redirecting to Officer Login page...'
      );

      navigate('/login');
      return;
    }

    resetForm();
    setShowNewModal(true);
  };

  const generateRequestId = () => {
    const year = new Date().getFullYear();

    const random = Math.floor(
      1000 + Math.random() * 9000
    );

    return `REQ-${year}-${random}`;
  };

  /* =======================================================
     HANDLE SUBMIT NEW MAINTENANCE REQUEST
  ======================================================= */

  const handleAddRequest = async (e) => {
    e.preventDefault();

    if (!user) {
      alert(
        'User session not found. Redirecting to login page...'
      );

      navigate('/login');
      return;
    }

    if (!newDepartment) {
      alert(
        'Validation Error: Please select a department.'
      );
      return;
    }

    if (!newRequestedDate.trim()) {
      alert(
        'Validation Error: Maintenance Date is required. Please select a date from the calendar.'
      );
      return;
    }

    if (!newStartTime.trim()) {
      alert(
        'Validation Error: Start Time is required. Please select a start time.'
      );
      return;
    }

    if (!newEndTime.trim()) {
      alert(
        'Validation Error: End Time is required. Please select an end time.'
      );
      return;
    }

    const durationVal = Number(newDuration);

    if (
      !newDuration ||
      isNaN(durationVal) ||
      durationVal <= 0
    ) {
      alert(
        'Validation Error: Duration in minutes is required and must be greater than 0.'
      );
      return;
    }

    const [startH, startM] =
      newStartTime.split(':').map(Number);

    const [endH, endM] =
      newEndTime.split(':').map(Number);

    const startMins =
      (startH || 0) * 60 + (startM || 0);

    const endMins =
      (endH || 0) * 60 + (endM || 0);

    if (endMins <= startMins) {
      alert(
        'Validation Error: End time must be later than Start time.'
      );
      return;
    }

    if (!newResources.trim()) {
      alert(
        'Validation Error: Please select at least one machine/resource.'
      );
      return;
    }

    const tableName = getTableName(newDepartment);

    if (!tableName) {
      alert('Invalid department.');
      return;
    }

    try {
      setSubmitting(true);

      const requestId = generateRequestId();

      const urgency =
        newCriticality === 'CRITICAL' ||
        newCriticality === 'HIGH'
          ? 'HIGH'
          : 'LOW';

      const start12 =
        formatTime24To12(newStartTime);

      const end12 =
        formatTime24To12(newEndTime);

      const windowFormatted =
        `${start12} - ${end12}`;

      const requestedWindow =
        `${newRequestedDate} | ${windowFormatted}`;

      const formattedProblem = newProblem
        ? `[Work Type: ${newWorkType}] ${newProblem} [Criticality: ${newCriticality}]`
        : `[Work Type: ${newWorkType}] [Criticality: ${newCriticality}]`;

      const requestData = {
        request_id: requestId,
        department: newDepartment,
        asset_name: newAsset,
        station_name: newStation,
        station_code: newStationCode,
        division: newDivision,
        zone: newZone,
        problem_description: formattedProblem,
        urgency,
        duration_mins: durationVal,
        resources_required: newResources,
        requested_window: requestedWindow,
        status: 'PENDING_AI'
      };

      let insertErr = null;

      try {
        const { error } = await supabase
          .from(tableName)
          .insert([
            {
              ...requestData,
              requested_date: newRequestedDate
            }
          ]);

        insertErr = error;
      } catch (err) {
        insertErr = err;
      }

      if (insertErr) {
        const { error: retryErr } =
          await supabase
            .from(tableName)
            .insert([requestData]);

        if (retryErr) {
          console.error(
            'Insert error:',
            retryErr
          );

          alert(
            `Failed to submit request.\n\n${retryErr.message}`
          );

          return;
        }
      }

      const newId = requestData.request_id || requestData.id;
      registerSubmittedRequestId(newId);

      const durHoursVal = durationVal ? (durationVal / 60.0) : 1.5;
      const cRaw = String(newCriticality || '').toUpperCase();
      const normPriority = (cRaw.includes('HIGH') || cRaw.includes('CRITICAL') || cRaw.startsWith('P1'))
        ? 'P1 - High'
        : (cRaw.includes('MEDIUM') || cRaw.startsWith('P2') ? 'P2 - Medium' : 'P3 - Low');

      saveWorkflowContext({
        requestId: newId,
        request_id: newId,
        department: newDepartment,
        assetName: newAsset,
        assetId: newAsset,
        asset_id: newAsset,
        station: newStation,
        stationName: newStation,
        stationCode: newStationCode,
        division: newDivision,
        zone: newZone,
        work_type: newWorkType,
        workType: newWorkType,
        problemDescription: newProblem,
        urgency: newCriticality,
        priority: normPriority,
        duration_hours: durHoursVal,
        durationHours: durHoursVal,
        plannedDuration: durHoursVal,
        planned_duration: durHoursVal,
        duration_mins: durationVal,
        durationMins: durationVal,
        resourcesRequired: newResources,
        status: 'SUBMITTED'
      });

      await fetchRequests(department);

      resetForm();
      setShowNewModal(false);

      alert(
        'Maintenance request submitted successfully and saved to Supabase queue.'
      );
    } catch (error) {
      console.error(
        'Submission error:',
        error
      );

      alert(
        `Submission error: ${error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     CURRENT BATCH ID
  ======================================================= */

  const getCurrentBatchId = () => {
    let batchId = sessionStorage.getItem(
      'railopt_current_batch_id'
    );

    if (!batchId) {
      batchId = `BATCH-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

      sessionStorage.setItem(
        'railopt_current_batch_id',
        batchId
      );
    }

    return batchId;
  };

  /* =======================================================
     HANDLE SEND TO AI BLOCK PLANNER
  ======================================================= */

  const handleSendToAI = async (req) => {
    if (sendingId) return;

    setSendingId(
      req.id || req.request_id
    );

    try {
      const dept = (
        req.department ||
        department ||
        'TRACK'
      )
        .toUpperCase()
        .trim();

      const tableName = getTableName(dept);

      if (!tableName) {
        alert(
          `Invalid department: ${dept}`
        );

        return;
      }

      /* ---------------------------------------------------
         1. MARK SOURCE REQUEST AS SENT_TO_AI
      --------------------------------------------------- */

      if (req.id) {
        const { error: updateByIdError } =
          await supabase
            .from(tableName)
            .update({
              status: 'SENT_TO_AI'
            })
            .eq('id', req.id);

        if (updateByIdError) {
          console.warn(
            'Status update by id warning:',
            updateByIdError
          );
        }
      }

      if (req.request_id) {
        const { error: updateByRequestIdError } =
          await supabase
            .from(tableName)
            .update({
              status: 'SENT_TO_AI'
            })
            .eq(
              'request_id',
              req.request_id
            );

        if (updateByRequestIdError) {
          console.warn(
            'Status update by request_id warning:',
            updateByRequestIdError
          );
        }
      }

      /* ---------------------------------------------------
         2. GET / CREATE CURRENT PLANNING BATCH
      --------------------------------------------------- */

      const batchId =
        getCurrentBatchId();

      const receivedAt =
        new Date().toISOString();

      /* ---------------------------------------------------
         3. INSERT INTO AI PLANNER REQUESTS

         IMPORTANT:
         source_table is REQUIRED by Supabase schema.
      --------------------------------------------------- */

      const aiPayload = {
        request_id:
          req.request_id ||
          `REQ-AI-${Date.now()}`,

        user_id:
        
          user?.id ||
          '00000000-0000-0000-0000-000000000000',

          source_table: tableName,

        /*
          FIX:
          This was missing before and caused:

          null value in column "source_table"
          violates not-null constraint
        */
        source_table: tableName,

        department:
          req.department || dept,

        asset_name:
          req.asset_name ||
          'Maintenance Task',

        station_name:
          req.station_name || '',

        station_code:
          req.station_code || '',

        division:
          req.division || '',

        zone:
          req.zone || '',

        problem_description:
          req.problem_description || '',

        safety_criticality:
          req.urgency || 'HIGH',

        urgency:
          req.urgency || 'HIGH',

        duration_mins:
          req.duration_mins || 60,

        resources_required:
          req.resources_required || '',

        requested_window:
          req.requested_window || '',

        requested_date:
          req.requested_date ||
          new Date()
            .toISOString()
            .split('T')[0],

        received_at:
          receivedAt,

        status: 'RECEIVED',

        train_impact:
          req.train_impact || 'Low',

        batch_id:
          batchId,

        batch_sent_at:
          receivedAt
      };

      console.log(
        'AI Planner Payload:',
        aiPayload
      );

      /* ---------------------------------------------------
         4. INSERT AI PLANNER REQUEST
      --------------------------------------------------- */

      const {
        error: aiInsertError
      } = await supabase
        .from('ai_planner_requests')
        .insert([aiPayload]);

      if (aiInsertError) {
        console.error(
          'ai_planner_requests insert failed:',
          aiInsertError
        );

        if (
          aiInsertError.code === '42501' ||
          aiInsertError.message?.includes(
            'row-level security'
          )
        ) {
          alert(
            'Database permission error: Cannot insert into ai_planner_requests.\n\n' +
              'Fix: Check the ai_planner_requests RLS INSERT policy in Supabase.\n\n' +
              `Error detail: ${aiInsertError.message}`
          );
        } else {
          alert(
            `Failed to send to AI Planner: ${aiInsertError.message}`
          );
        }

        /* -----------------------------------------------
           ROLLBACK SOURCE STATUS
        ----------------------------------------------- */

        if (
          tableName &&
          req.request_id
        ) {
          await supabase
            .from(tableName)
            .update({
              status: 'PENDING_AI'
            })
            .eq(
              'request_id',
              req.request_id
            );
        }

        return;
      }

      /* ---------------------------------------------------
         5. INSERT AI PLANNER ALERT
            NON-CRITICAL
      --------------------------------------------------- */

      try {
        const {
          error: alertInsertError
        } = await supabase
          .from('ai_planner_alerts')
          .insert([
            {
              request_id:
                req.request_id ||
                aiPayload.request_id,

              department:
                req.department || dept,

              alert_type:
                'AI_REQUEST_RECEIVED',

              message:
                `${req.department || dept} maintenance request ${
                  req.request_id || ''
                } received by AI Block Planner (Batch: ${batchId}).`,

              status: 'UNREAD'
            }
          ]);

        if (alertInsertError) {
          console.warn(
            'AI planner alert insert warning:',
            alertInsertError
          );
        }
      } catch (alertErr) {
        console.warn(
          'Alert insertion notice:',
          alertErr
        );
      }

      /* ---------------------------------------------------
         6. REFRESH SOURCE QUEUE
      --------------------------------------------------- */

      await fetchRequests(
        department
      );

      /* ---------------------------------------------------
         7. SUCCESS
      --------------------------------------------------- */

      alert(
        `✅ Request ${
          req.request_id || ''
        } sent to AI Block Planner.\n\n` +
          `Batch ID: ${batchId}\n\n` +
          `Open AI Block Planner to see the current planning batch.`
      );
    } catch (error) {
      console.error(
        'Send to AI error:',
        error
      );

      alert(
        `Failed to send request to AI: ${error.message}`
      );
    } finally {
      setSendingId(null);
    }
  };

  /* =======================================================
     HANDLE DELETE REQUEST
  ======================================================= */

  const confirmDeleteRequest = async () => {
    if (!deletingItem) return;

    const target = deletingItem;

    setDeletingItem(null);
    setLoadingRequests(true);

    try {
      const dept = (
        target.department ||
        department ||
        'TRACK'
      )
        .toUpperCase()
        .trim();

      const tableName =
        getTableName(dept);

      if (tableName) {
        if (target.id) {
          const {
            error: deleteByIdError
          } = await supabase
            .from(tableName)
            .delete()
            .eq('id', target.id);

          if (deleteByIdError) {
            console.warn(
              'Delete by id warning:',
              deleteByIdError
            );
          }
        }

        if (target.request_id) {
          const {
            error: deleteByRequestIdError
          } = await supabase
            .from(tableName)
            .delete()
            .eq(
              'request_id',
              target.request_id
            );

          if (deleteByRequestIdError) {
            console.warn(
              'Delete by request_id warning:',
              deleteByRequestIdError
            );
          }
        }
      }

      if (target.request_id) {
        const {
          error: aiDeleteError
        } = await supabase
          .from('ai_planner_requests')
          .delete()
          .eq(
            'request_id',
            target.request_id
          );

        if (aiDeleteError) {
          console.warn(
            'AI planner delete warning:',
            aiDeleteError
          );
        }
      }

      await fetchRequests(
        department
      );

      alert(
        `Request ${
          target.request_id || ''
        } deleted permanently from database.`
      );
    } catch (error) {
      console.error(
        'Delete error:',
        error
      );

      alert(
        `Failed to delete request: ${error.message}`
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  /* =======================================================
     HANDLE SAVE MAINTENANCE OUTCOME
  ======================================================= */

  const handleSaveOutcome = async (req, outcomePayload) => {
    const dept = (req.department || department || 'TRACK').toUpperCase().trim();
    const tableName = getTableName(dept);
    if (!tableName) {
      alert(`Invalid department: ${dept}`);
      return false;
    }

    const cleanBaseDesc = getCleanProblemDescription(req.problem_description);
    const serializedDesc = `${cleanBaseDesc}${OUTCOME_DELIMITER}${JSON.stringify(outcomePayload)}`;

    const newStatus = outcomePayload.status || req.status || 'Open';

    try {
      const updatePayload = {
        status: newStatus,
        problem_description: serializedDesc
      };

      let updateErr = null;

      if (req.id) {
        const { error } = await supabase
          .from(tableName)
          .update(updatePayload)
          .eq('id', req.id);
        updateErr = error;
      } else if (req.request_id) {
        const { error } = await supabase
          .from(tableName)
          .update(updatePayload)
          .eq('request_id', req.request_id);
        updateErr = error;
      }

      if (updateErr) {
        console.error('Save outcome error:', updateErr);
        alert(`Failed to save outcome: ${updateErr.message}`);
        return false;
      }

      await fetchRequests(department);
      return true;
    } catch (err) {
      console.error('Save outcome exception:', err);
      alert(`Save outcome failed: ${err.message}`);
      return false;
    }
  };

  /* =======================================================
     FILTERED & SORTED LISTS
  ======================================================= */

  const activeContext = getWorkflowContext(searchParams);

  const waitingRequests = useMemo(() => {
    const list = requests.filter((r) => {
      const st = String(
        r.status || 'PENDING_AI'
      )
        .toUpperCase()
        .trim();

      const isPendingStatus = (
        st === 'PENDING_AI' ||
        st === 'PENDING' ||
        st === 'WAITING' ||
        st === 'OPEN' ||
        st === 'SUBMITTED' ||
        st === 'ML_PROCESSING'
      );
      if (!isPendingStatus) return false;

      // Temporarily hide default old historical items on fresh load unless submitted/active
      return isSubmittedOrActiveRequest(r, activeContext);
    });

    return sortRequestsByDateTime(
      list
    );
  }, [requests, activeContext]);

  const historyRequests = useMemo(() => {
    const list = requests.filter((r) => {
      const st = String(
        r.status || ''
      )
        .toUpperCase()
        .trim();

      return (
        st !== 'PENDING_AI' &&
        st !== 'PENDING' &&
        st !== 'WAITING' &&
        st !== 'OPEN'
      );
    });

    return sortRequestsByDateTime(
      list
    );
  }, [requests]);

  const filterList = (list) => {
    return list.filter((req) => {
      // Department Officer Filtering
      if (authUser?.role === 'TMS_OFFICER') {
        const dept = String(req.department || '').toUpperCase().trim();
        if (dept !== 'TRACK' && dept !== 'TMS') return false;
      } else if (authUser?.role === 'SMMS_OFFICER') {
        const dept = String(req.department || '').toUpperCase().trim();
        if (dept !== 'S&T' && dept !== 'SMMS' && dept !== 'SIGNAL') return false;
      } else if (authUser?.role === 'TRD_OFFICER') {
        const dept = String(req.department || '').toUpperCase().trim();
        if (dept !== 'TRD' && dept !== 'TRACTION') return false;
      }

      if (urgencyFilter !== 'ALL') {
        const u = String(
          req.urgency || ''
        )
          .toUpperCase()
          .trim();

        if (u !== urgencyFilter) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredWaitingRequests =
    useMemo(
      () =>
        filterList(
          waitingRequests
        ),
      [
        waitingRequests,
        urgencyFilter,
        authUser
      ]
    );

  const filteredHistoryRequests =
    useMemo(
      () =>
        filterList(
          historyRequests
        ),
      [
        historyRequests,
        urgencyFilter,
        authUser
      ]
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="p-6 space-y-6 font-sans relative z-10 bg-[#FAFAFA] min-h-screen">
      <WorkflowProgress currentStepId="requests" />

      {/* ===================================================
          INTERNAL MODULE SUB-NAVIGATION (4 SEPARATE SECTIONS)
      =================================================== */}
      <div className="bg-[#0F172A] text-slate-100 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 py-1 font-mono">
            SECTION:
          </span>
          {[
            { id: 'requests', label: 'Requests', icon: FileText, badge: 'Queue & Intake' },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench, badge: 'Asset Logs' },
            { id: 'engineering', label: 'Engineering', icon: Cpu, badge: 'Work Requests' },
            { id: 'operations', label: 'Operations', icon: Activity, badge: 'Traffic Events' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === tab.id
                  ? 'bg-black text-white border border-black shadow-sm'
                  : 'bg-[#F5F5F5] text-black hover:bg-[#E5E5E5] border border-[#D9D9D9]'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-white' : 'text-[#333333]'}`} />
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSubTab === tab.id ? 'bg-[#333333] text-white' : 'bg-[#D9D9D9] text-black'
              }`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
        <div className="text-[11px] font-mono text-slate-400 px-3 font-semibold hidden md:block">
          Module 1: Maintenance Requests
        </div>
      </div>

      {activeSubTab === 'maintenance' ? (
        <Maintenance />
      ) : activeSubTab === 'engineering' ? (
        <Engineering />
      ) : activeSubTab === 'operations' ? (
        <Operations />
      ) : (
        <>
          {/* ===================================================
              TOP HEADER
          =================================================== */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5F5F5] border border-[#E5E5E5] p-6 rounded-2xl shadow-sm">

        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#737373] tracking-widest uppercase mb-1">
            <FileText className="w-4 h-4 text-[#111111]" />
            DEPARTMENTAL MAINTENANCE REQUEST MANAGEMENT
          </div>

          <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            {department &&
            department !== 'ALL'
              ? `${department} MAINTENANCE REQUEST QUEUE`
              : 'ALL DEPARTMENT MAINTENANCE REQUEST QUEUES'}
          </h2>

          <p className="text-xs text-[#525252] max-w-3xl mt-1 font-medium">
            Permanent database-backed maintenance requests queue sorted by Requested Date & Time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">

          {user && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-left shadow-sm">
              <div className="text-[9px] text-[#737373] font-bold uppercase tracking-wider">
                LOGGED IN OFFICER
              </div>

              <div className="text-xs text-[#111111] font-bold">
                {user.email}
              </div>
            </div>
          )}

          <button
            onClick={() =>
              fetchRequests(
                department
              )
            }
            disabled={loadingRequests}
            className="p-2.5 bg-white hover:bg-[#F5F5F5] text-[#111111] rounded-xl border border-[#E5E5E5] hover:border-[#D4D4D4] shadow-sm transition-all disabled:opacity-40"
            title="Refresh from Supabase"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loadingRequests
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </button>

          <button
            onClick={
              openNewRequestModal
            }
            className="flex items-center gap-2 bg-white hover:bg-[#F5F5F5] text-[#111111] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#E5E5E5] hover:border-[#D4D4D4] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#111111]" />
            SUBMIT NEW REQUEST
          </button>

          <button
            onClick={() =>
              navigate('/ai-planner')
            }
            className="flex items-center gap-2 bg-[#111111] hover:bg-[#262626] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Bot className="w-4 h-4" />
            OPEN AI BLOCK PLANNER
          </button>

        </div>
      </div>

      {/* ===================================================
          AUTH BANNER
      =================================================== */}

      {!user && !loadingUser && (
        <div className="glass-panel rounded-xl p-5 border border-[#1D4ED8]/60 bg-[#F7F7F7] flex flex-wrap items-center justify-between gap-4 font-mono">

          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-[#60A5FA]" />
              <span>
                AUTHENTICATION REQUIRED TO SUBMIT REQUESTS
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1">
              Log in with your official Indian Railways credentials to submit and manage requests.
            </p>
          </div>

          <button
            onClick={() =>
              navigate('/login')
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            <span>
              LOG IN / REGISTER OFFICER
            </span>

            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* ===================================================
          FILTER & DEPARTMENT TABS
      =================================================== */}

      <div className="bg-[#F5F5F5] rounded-2xl p-4 border border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3 text-xs relative z-20 shadow-sm">

        <div className="flex flex-wrap items-center gap-2">

          <span className="text-[#737373] text-[10px] font-extrabold uppercase tracking-wider mr-1">
            DEPARTMENT:
          </span>

          {[
            { id: 'ALL', label: 'All Departments' },
            { id: 'TRACK', label: 'Track Management System (TMS)' },
            { id: 'S&T', label: 'Signal & Telecommunication System (SMMS)' },
            { id: 'TRD', label: 'Track Distribution System (TRD)' }
          ].map((deptTab) => (
            <button
              key={deptTab.id}
              onClick={() => {
                setDepartment(deptTab.id);
                fetchRequests(deptTab.id);
              }}
              className={`px-3 py-2 rounded-xl font-bold text-xs transition-all border ${
                department === deptTab.id
                  ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                  : 'bg-white text-[#525252] hover:text-[#111111] border-[#E5E5E5] hover:border-[#D4D4D4] hover:bg-[#FAFAFA]'
              }`}
            >
              {deptTab.label}
            </button>
          ))}


          <select
            value={urgencyFilter}
            onChange={(e) =>
              setUrgencyFilter(
                e.target.value
              )
            }
            className="bg-white border border-[#E5E5E5] text-[#111111] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#111111] ml-2 shadow-sm"
          >
            <option value="ALL">
              All Urgencies
            </option>

            <option value="HIGH">
              High Urgency
            </option>

            <option value="MEDIUM">
              Medium Urgency
            </option>

            <option value="LOW">
              Low Urgency
            </option>
          </select>

        </div>

      </div>      {/* ===================================================
          SECTION 1: WAITING FOR ML PREDICTIONS
      =================================================== */}

      <div className="space-y-4">

        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">

          <div className="flex items-center gap-2">

            <Clock className="w-5 h-5 text-[#111111]" />

            <h3 className="text-base font-extrabold text-[#111111] tracking-wide uppercase">
              WAITING FOR ML PREDICTIONS
            </h3>

            <span className="px-3 py-1 rounded-full bg-[#E5E5E5] text-[#111111] border border-[#D4D4D4] text-xs font-bold">
              {filteredWaitingRequests.length} QUEUED
            </span>

          </div>

          <div className="text-[10px] text-[#737373] font-bold uppercase tracking-wider">
            ORDERED BY: REQUESTED MAINTENANCE DATE → START TIME
          </div>

        </div>

        {loadingRequests ? (

          <div className="bg-white rounded-2xl p-10 border border-[#E5E5E5] flex justify-center shadow-sm">

            <div className="flex items-center gap-3 text-[#525252] text-xs font-semibold">

              <Loader2 className="w-5 h-5 animate-spin text-[#111111]" />

              Loading database-backed queue...

            </div>

          </div>

        ) : filteredWaitingRequests.length === 0 ? (

          <div className="bg-white rounded-2xl p-12 border border-[#E5E5E5] text-center shadow-sm space-y-3">

            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111] mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7 text-[#111111]" />
            </div>

            <h4 className="text-base font-bold text-[#111111]">
              No Pending Requests in Waiting Queue
            </h4>

            <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
              All submitted requests have either been sent to ML Predictions or no pending requests exist.
            </p>

          </div>

        ) : (

          filteredWaitingRequests.map(
            (req) => {
              const dtInfo =
                parseDateTimeFromRequest(
                  req
                );

              return (
                <div
                  key={
                    req.id ||
                    req.request_id
                  }
                  onClick={() => setSelectedDetailRequest(req)}
                  className="bg-white rounded-2xl p-5 border border-[#D9D9D9] hover:border-black transition-all duration-200 space-y-4 shadow-sm hover:shadow-md relative z-10 cursor-pointer group"
                >

                  {/* CARD HEADER */}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">

                    <div className="flex items-center gap-3 flex-wrap">

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDetailRequest(req); }}
                        className="text-xs font-bold text-white bg-black hover:bg-[#333333] px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                        title="Click to view full request details"
                      >
                        <Eye className="w-3.5 h-3.5 text-white" />
                        <span>{req.request_id || req.id}</span>
                      </button>

                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]">
                        {req.department}
                      </span>

                      <span className="text-xs text-[#525252] font-semibold flex items-center gap-1.5">

                        <MapPin className="w-3.5 h-3.5 text-[#111111]" />

                        <strong className="text-[#111111]">
                          {req.station_name ||
                            'Station Not Specified'}

                          {req.station_code
                            ? ` (${req.station_code})`
                            : ''}
                        </strong>

                        {req.division && (
                          <>
                            {' '}
                            • Division:{' '}
                            {req.division}
                          </>
                        )}

                      </span>

                    </div>

                    <div className="flex items-center gap-2 text-xs">

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDetailRequest(req); }}
                        className="px-2.5 py-1 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-black font-bold border border-[#D9D9D9] rounded-lg flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-black" />
                        <span>View Details</span>
                      </button>

                      <span className="px-3 py-1 rounded-lg font-bold bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] flex items-center gap-1.5 font-mono">

                        <Clock className="w-3.5 h-3.5 text-[#111111]" />

                        WAITING FOR ML PREDICTIONS

                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingItem(
                            req
                          );
                        }}
                        className="p-2 bg-white hover:bg-[#F5F5F5] text-[#525252] hover:text-[#111111] rounded-lg border border-[#E5E5E5] transition"
                        title="Delete Request Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

                    <div className="md:col-span-2 space-y-2">

                      <span className="text-[#737373] text-[10px] uppercase font-bold tracking-wider block">
                        Asset & Problem Description
                      </span>

                      <h4 className="font-bold text-[#111111] text-sm font-sans">
                        {req.asset_name ||
                          'Asset not specified'}
                      </h4>

                      <p className="text-[#525252] font-sans text-xs bg-[#F5F5F5] p-3.5 rounded-xl border border-[#E5E5E5]">
                        {getCleanProblemDescription(req.problem_description) ||
                          'No description provided.'}
                      </p>

                    </div>

                    <div className="space-y-2 bg-[#F5F5F5] p-3.5 rounded-xl border border-[#E5E5E5]">

                      <div>

                        <span className="text-[#737373] text-[10px] block font-bold tracking-wider uppercase mb-1">
                          REQUESTED MAINTENANCE DATE & TIME
                        </span>

                        <span className="font-bold text-[#111111] text-xs flex items-center gap-1.5 mt-0.5">

                          <Calendar className="w-3.5 h-3.5 text-[#111111]" />

                          {dtInfo.dateStr}

                        </span>

                        <span className="text-[#525252] text-xs block font-bold mt-1">
                          {req.requested_window ||
                            'Not specified'}{' '}
                          ({req.duration_mins ||
                            60}
                          m)
                        </span>

                      </div>

                      <div className="pt-2 border-t border-[#E5E5E5]">

                        <span className="text-[#737373] text-[9px] block uppercase font-bold">
                          SUBMITTED TIMESTAMP
                        </span>

                        <span className="text-[#525252] text-[10px] font-semibold">
                          {req.created_at
                            ? new Date(
                                req.created_at
                              ).toLocaleString(
                                'en-IN'
                              )
                            : 'Just now'}
                        </span>

                      </div>

                      <div>

                        <span className="text-[#737373] text-[9px] block uppercase font-bold">
                          RESOURCES REQUIRED
                        </span>

                        <span className="text-[#525252] text-[10px] font-semibold block">
                          {req.resources_required ||
                            'Standard Team'}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* MAINTENANCE OUTCOME SECTION */}
                  <MaintenanceOutcomeCard
                    req={req}
                    onSaveOutcome={handleSaveOutcome}
                  />

                  {/* CARD FOOTER */}

                  <div className="border-t border-[#E5E5E5] pt-3 flex flex-wrap items-center justify-between gap-3">

                    <div className="text-xs text-[#737373] font-medium">
                      Pass request context to ML Predictions engine for multi-model duration & failure risk assessment.
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendToMLPredictions(req);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Send className="w-3.5 h-3.5 text-purple-200" />
                      <span>SEND TO ML PREDICTIONS →</span>
                    </button>

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

      {/* ===================================================
          SECTION 2: REQUEST HISTORY
      =================================================== */}

      <div className="space-y-4 pt-4">

        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">

          <div className="flex items-center gap-2">

            <FileText className="w-5 h-5 text-[#111111]" />

            <h3 className="text-base font-extrabold text-[#111111] tracking-wide uppercase">
              REQUEST HISTORY
            </h3>

            <span className="px-3 py-1 rounded-full bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] text-xs font-bold">
              {filteredHistoryRequests.length} RECORDS
            </span>

          </div>

        </div>

        {filteredHistoryRequests.length ===
        0 ? (

          <div className="bg-white rounded-2xl p-10 border border-[#E5E5E5] text-center text-xs text-[#737373] shadow-sm">
            No processed requests in history yet.
          </div>

        ) : (

          filteredHistoryRequests.map(
            (req) => {
              const dtInfo =
                parseDateTimeFromRequest(
                  req
                );

              const statusUpper =
                String(
                  req.status || ''
                )
                  .toUpperCase()
                  .trim();

              let statusBadge = (
                <span className="px-3 py-1 rounded-lg font-bold bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] text-xs">
                  SENT TO AI PLANNER
                </span>
              );

              if (
                statusUpper === 'RESOLVED' ||
                statusUpper === 'COMPLETED'
              ) {
                statusBadge = (
                  <span className="px-3 py-1 rounded-lg font-bold bg-[#111111] text-white text-xs shadow-sm">
                    {statusUpper === 'RESOLVED' ? 'RESOLVED' : 'COMPLETED'}
                  </span>
                );
              } else if (statusUpper === 'IN PROGRESS') {
                statusBadge = (
                  <span className="px-3 py-1 rounded-lg font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/30 text-xs">
                    IN PROGRESS
                  </span>
                );
              } else if (statusUpper === 'OPEN') {
                statusBadge = (
                  <span className="px-3 py-1 rounded-lg font-bold bg-white/10 text-white border border-white/20 text-xs">
                    OPEN
                  </span>
                );
              } else if (
                statusUpper === 'CANCELLED'
              ) {
                statusBadge = (
                  <span className="px-3 py-1 rounded-lg font-bold bg-white/5 text-white/50 border border-white/10 text-xs">
                    CANCELLED
                  </span>
                );
              }

              const cleanProblem = getCleanProblemDescription(req.problem_description);

              return (
                <div
                  key={
                    req.id ||
                    req.request_id
                  }
                  onClick={() => setSelectedDetailRequest(req)}
                  className="bg-white rounded-2xl p-4 border border-[#D9D9D9] hover:border-black transition-all duration-200 space-y-3 shadow-sm hover:shadow-md relative z-10 cursor-pointer group"
                >

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">

                    <div className="flex items-center gap-3 flex-wrap">

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDetailRequest(req); }}
                        className="font-bold text-white bg-black hover:bg-[#333333] px-2.5 py-0.5 rounded-md flex items-center gap-1 transition"
                        title="Click to view full request details"
                      >
                        <Eye className="w-3 h-3 text-white" />
                        <span>{req.request_id || req.id}</span>
                      </button>

                      <span className="font-bold px-2.5 py-0.5 rounded-md border bg-[#F5F5F5] text-[#111111] border-[#D9D9D9]">
                        {req.department}
                      </span>

                      <span className="text-[#525252] font-semibold">
                        {req.station_name}{' '}
                        ({req.station_code}) •{' '}
                        {req.asset_name}
                      </span>

                    </div>

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDetailRequest(req); }}
                        className="px-2 py-0.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-black font-bold border border-[#D9D9D9] rounded-md flex items-center gap-1 text-[11px] transition"
                      >
                        <Eye className="w-3 h-3 text-black" />
                        <span>View Details</span>
                      </button>

                      {statusBadge}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingItem(
                            req
                          );
                        }}
                        className="p-1.5 text-[#737373] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-lg transition"
                        title="Delete Request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                  {cleanProblem && (
                    <p className="text-[#525252] font-sans text-xs bg-[#F5F5F5] p-3 rounded-xl border border-[#D9D9D9]">
                      {cleanProblem}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-xs text-[#737373] pt-2 border-t border-[#E5E5E5]">

                    <div>
                      Maintenance:{' '}
                      <strong className="text-[#111111]">
                        {dtInfo.dateStr}
                      </strong>{' '}
                      |{' '}
                      {req.requested_window}{' '}
                      ({req.duration_mins ||
                        60}
                      m)
                    </div>

                    <div>
                      Submitted:{' '}
                      {req.created_at
                        ? new Date(
                            req.created_at
                          ).toLocaleString(
                            'en-IN'
                          )
                        : 'N/A'}
                    </div>

                  </div>

                  {/* EXPLICIT ML PREDICTIONS FORWARDING ACTION */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] font-mono text-xs">
                    <span className="text-[10px] text-[#737373] font-bold uppercase flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-[#111111]" />
                      ML Workflow: {sentToMlIds.has(String(req.request_id || req.id)) || req.sent_to_ml_prediction ? 'Queued for ML Inference' : 'Not Sent to ML'}
                    </span>

                    <button
                      onClick={() => handleSendToML(req)}
                      disabled={sentToMlIds.has(String(req.request_id || req.id)) || req.sent_to_ml_prediction || sendingMlMap[req.request_id || req.id] === 'sending'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm ${
                        sentToMlIds.has(String(req.request_id || req.id)) || req.sent_to_ml_prediction
                          ? 'bg-[#F5F5F5] text-black border border-[#D9D9D9] cursor-default font-bold'
                          : sendingMlMap[req.request_id || req.id] === 'sending'
                          ? 'bg-[#E5E5E5] text-black cursor-wait'
                          : 'bg-black hover:bg-[#333333] text-white'
                      }`}
                    >
                      {sentToMlIds.has(String(req.request_id || req.id)) || req.sent_to_ml_prediction ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                          <span>Sent to ML Predictions ✓</span>
                        </>
                      ) : sendingMlMap[req.request_id || req.id] === 'sending' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send to ML Predictions</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* MAINTENANCE OUTCOME SECTION */}
                  <MaintenanceOutcomeCard
                    req={req}
                    onSaveOutcome={handleSaveOutcome}
                  />

                </div>
              );
            }
          )

        )}

      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {deletingItem && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white border border-[#D9D9D9] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 font-mono">

            <div className="flex items-center gap-3 text-black">

              <AlertTriangle className="w-6 h-6 shrink-0" />

              <h3 className="text-base font-bold text-black">
                DELETE MAINTENANCE REQUEST
              </h3>

            </div>

            <p className="text-xs text-[#333333] leading-relaxed">

              Delete maintenance request{' '}

              <strong className="text-black">
                {deletingItem.request_id ||
                  deletingItem.id}
              </strong>{' '}

              permanently from the Supabase database?

              <br />

              <span className="text-black font-bold block mt-1">
                This record will be permanently deleted and cannot be undone.
              </span>

            </p>

            <div className="flex justify-end gap-3 pt-2">

              <button
                onClick={() =>
                  setDeletingItem(null)
                }
                className="px-4 py-2 bg-white hover:bg-[#F5F5F5] text-black text-xs font-bold rounded-lg border border-[#D9D9D9]"
              >
                Cancel
              </button>

              <button
                onClick={
                  confirmDeleteRequest
                }
                className="px-4 py-2 bg-black hover:bg-[#333333] text-white text-xs font-bold rounded-lg shadow-lg"
              >
                Delete Permanently
              </button>

            </div>

          </div>

        </div>,
        document.body
      )}

      {/* =====================================================
          NEW REQUEST MODAL
      ====================================================== */}

      {showNewModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden">

          <div className="vision-card rounded-2xl w-full max-w-2xl sm:max-w-3xl p-4 sm:p-5 shadow-2xl max-h-[88vh] flex flex-col border border-white/10 font-sans my-auto">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5 shrink-0">

              <h3 className="text-base font-bold text-white flex items-center gap-2">

                <Plus className="w-4 h-4 text-[#C6F432]" />

                Submit New Maintenance Request

              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowNewModal(
                    false
                  );

                  resetForm();
                }}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            <form
              onSubmit={
                handleAddRequest
              }
              className="space-y-2.5 text-xs overflow-y-auto pr-1 flex-1"
            >

              {/* ROW 1 */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Department *
                  </label>

                  <select
                    required
                    value={
                      newDepartment
                    }
                    onChange={(e) => {
                      const dept = e.target.value;
                      setNewDepartment(dept);
                      setNewWorkType(DEPARTMENT_WORK_TYPES[dept]?.[0] || 'Track Tamping & Rail Alignment');
                      setNewResources('');
                    }}
                    className="w-full bg-white/5 border border-white/10 text-white font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  >

                    <option value="TRACK">
                      Track Maintenance (TRACK)
                    </option>

                    <option value="S&T">
                      Signalling & Telecommunication (S&T)
                    </option>

                    <option value="TRD">
                      Traction Distribution (TRD)
                    </option>

                  </select>

                </div>

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Work Type (Maintenance Activity) *
                  </label>

                  <select
                    required
                    value={newWorkType}
                    onChange={(e) => setNewWorkType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  >
                    {(DEPARTMENT_WORK_TYPES[newDepartment] || DEPARTMENT_WORK_TYPES.TRACK).map((wt) => (
                      <option key={wt} value={wt}>
                        {wt}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="md:col-span-2">

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Asset Name *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Turnout Switch #104A / Point Machine"
                    value={newAsset}
                    onChange={(e) =>
                      setNewAsset(
                        e.target.value
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  />

                </div>

              </div>

              {/* ROW 2 */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Station Name *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore Junction"
                    value={newStation}
                    onChange={(e) =>
                      setNewStation(
                        e.target.value
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  />

                </div>

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Station Code *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. CBE"
                    value={
                      newStationCode
                    }
                    onChange={(e) =>
                      setNewStationCode(
                        e.target.value.toUpperCase()
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  />

                </div>

              </div>

              {/* ROW 3 */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Railway Zone *
                  </label>

                  <select
                    value={newZone}
                    onChange={(e) =>
                      setNewZone(
                        e.target.value
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 text-white font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  >

                    {RAILWAY_DATA.map(
                      (z) => (
                        <option
                          key={z.code}
                          value={z.name}
                        >
                          {z.name} (
                          {z.code})
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Division *
                  </label>

                  <select
                    value={
                      newDivision
                    }
                    onChange={(e) =>
                      setNewDivision(
                        e.target.value
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 text-white font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  >

                    {divisionOptions.map(
                      (d) => (
                        <option
                          key={d}
                          value={d}
                        >
                          {d} Division
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* ROW 4 */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/5 p-2.5 rounded-lg border border-white/10">

                <div>

                  <label className="text-[#C6F432] block mb-0.5 uppercase font-semibold text-[9px] tracking-wider">
                    Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={
                      newRequestedDate
                    }
                    onChange={(e) =>
                      setNewRequestedDate(
                        e.target.value
                      )
                    }
                    className="w-full bg-black/40 border border-white/10 text-white rounded-md px-2 py-1 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  />

                </div>

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[9px] tracking-wider">
                    Start Time *
                  </label>

                  <input
                    type="time"
                    required
                    value={
                      newStartTime
                    }
                    onChange={(e) =>
                      setNewStartTime(
                        e.target.value
                      )
                    }
                    className="w-full bg-black/40 border border-white/10 text-white rounded-md px-2 py-1 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  />

                </div>

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[9px] tracking-wider">
                    End Time *
                  </label>

                  <input
                    type="time"
                    required
                    value={
                      newEndTime
                    }
                    onChange={(e) =>
                      setNewEndTime(
                        e.target.value
                      )
                    }
                    className="w-full bg-black/40 border border-white/10 text-white rounded-md px-2 py-1 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  />

                </div>

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[9px] tracking-wider">
                    Duration (Mins) *
                  </label>

                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 105"
                    value={
                      newDuration
                    }
                    onChange={(e) =>
                      setNewDuration(
                        e.target.value
                      )
                    }
                    className="w-full bg-black/40 border border-white/10 text-white rounded-md px-2 py-1 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  />

                </div>

              </div>

              {/* ROW 5 */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Required Machine / Resource *
                  </label>

                  <select
                    required
                    value={
                      newResources
                    }
                    onChange={(e) =>
                      setNewResources(
                        e.target.value
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 text-white font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  >

                    <option value="">
                      -- Select Required Resource --
                    </option>

                    {(
                      RESOURCE_OPTIONS[
                        newDepartment
                      ] ||
                      RESOURCE_OPTIONS.TRACK
                    ).map((r) => (
                      <option
                        key={r}
                        value={r}
                      >
                        {r}
                      </option>
                    ))}

                  </select>

                </div>

                <div>

                  <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                    Safety Criticality *
                  </label>

                  <select
                    value={
                      newCriticality
                    }
                    onChange={(e) =>
                      setNewCriticality(
                        e.target.value
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 text-white font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                  >

                    <option value="HIGH">
                      High Criticality
                    </option>

                    <option value="CRITICAL">
                      Critical
                    </option>

                    <option value="MEDIUM">
                      Medium Criticality
                    </option>

                    <option value="LOW">
                      Low Criticality
                    </option>

                  </select>

                </div>

              </div>

              {/* PROBLEM DESCRIPTION */}

              <div>

                <label className="text-white/70 block mb-0.5 uppercase font-semibold text-[10px] tracking-wider">
                  Problem Description / Work Justification *
                </label>

                <textarea
                  required
                  rows={2}
                  placeholder="Describe track defect, signal replacement, OHE maintenance needs..."
                  value={
                    newProblem
                  }
                  onChange={(e) =>
                    setNewProblem(
                      e.target.value
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6F432]/60 text-xs"
                />

              </div>

              {/* SUBMIT BUTTON */}

              <div className="flex justify-end gap-2.5 pt-2.5 border-t border-white/10">

                <button
                  type="button"
                  onClick={() => {
                    setShowNewModal(
                      false
                    );

                    resetForm();
                  }}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg font-medium text-xs border border-white/10 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C6F432]/85 text-black hover:bg-[#C6F432] disabled:opacity-50 rounded-lg font-bold text-xs shadow-md shadow-[#C6F432]/10 transition-all flex items-center gap-1.5"
                >

                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      SUBMIT TO PERMANENT QUEUE
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>,
        document.body
      )}

        </>
      )}

      {/* =====================================================
          REQUEST DETAILS MODAL
      ====================================================== */}
      {selectedDetailRequest && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="vision-card rounded-2xl w-full max-w-3xl p-6 shadow-2xl max-h-[88vh] overflow-y-auto font-sans text-white space-y-5 border border-white/10 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-black bg-[#C6F432]/85 px-3.5 py-1.5 rounded-xl shadow-md font-mono">
                  {selectedDetailRequest.request_id || selectedDetailRequest.id}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg border bg-white/5 text-white border-white/10 uppercase font-mono">
                  {selectedDetailRequest.department} DEPARTMENT
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedDetailRequest.urgency || 'HIGH'} URGENCY
                </span>
              </div>
              <button
                onClick={() => setSelectedDetailRequest(null)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#C6F432]" />
                  Location & Asset Information
                </h4>
                <div className="space-y-1.5 font-medium text-white/80">
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Asset Name:</span> <strong className="text-white block">{selectedDetailRequest.asset_name || 'N/A'}</strong></div>
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Station:</span> <strong className="text-white block">{selectedDetailRequest.station_name} ({selectedDetailRequest.station_code})</strong></div>
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Division:</span> <strong className="text-white block">{selectedDetailRequest.division || 'N/A'}</strong></div>
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Zone:</span> <strong className="text-white block">{selectedDetailRequest.zone || 'N/A'}</strong></div>
                </div>
              </div>

              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#C6F432]" />
                  Window & Resources
                </h4>
                <div className="space-y-1.5 font-medium text-white/80">
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Maintenance Window:</span> <strong className="text-white block">{selectedDetailRequest.requested_window || 'N/A'}</strong></div>
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Planned Duration:</span> <strong className="text-white block">{selectedDetailRequest.duration_mins || 60} Minutes</strong></div>
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Required Resources:</span> <strong className="text-white block">{selectedDetailRequest.resources_required || 'Standard Team'}</strong></div>
                  <div><span className="text-white/60 font-bold uppercase text-[10px]">Current Status:</span> <strong className="text-[#C6F432] block font-bold">{selectedDetailRequest.status || 'Open'}</strong></div>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
              <span className="text-white/60 font-bold uppercase text-[10px] block">Full Problem Description</span>
              <p className="text-white font-medium whitespace-pre-wrap leading-relaxed">
                {getCleanProblemDescription(selectedDetailRequest.problem_description) || 'No problem description provided.'}
              </p>
            </div>

            {/* Outcome Component inside Modal */}
            <MaintenanceOutcomeCard
              req={selectedDetailRequest}
              onSaveOutcome={handleSaveOutcome}
            />

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedDetailRequest(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs rounded-xl transition border border-white/10"
              >
                ← Back to Queue
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendToMLPredictions(selectedDetailRequest)}
                  className="px-5 py-2.5 bg-[#C6F432]/85 hover:bg-[#C6F432] text-black font-bold text-xs rounded-xl shadow-md shadow-[#C6F432]/10 flex items-center gap-1.5 transition-all"
                >
                  <Brain className="w-4 h-4 text-black" />
                  <span>SEND TO ML PREDICTIONS →</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}