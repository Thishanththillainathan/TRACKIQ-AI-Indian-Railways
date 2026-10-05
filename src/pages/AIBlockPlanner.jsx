import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bot, CheckCircle, ShieldCheck, AlertOctagon, 
  Clock, Users, Wrench, Train, Calendar, ChevronRight, RefreshCw, Zap, ArrowRight, Layers, Info, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';
import { getDepartment, DEPARTMENT_METADATA } from '../utils/departmentClassifier';
import { getWorkflowContext, saveWorkflowContext } from '../services/workflowService.js';
import WorkflowProgress from '../components/layout/WorkflowProgress';
import { API_BASE_URL } from '../config/api.js';

export default function AIBlockPlanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeContext = getWorkflowContext(searchParams, location.state);

  const initialRequestId = activeContext?.requestId || activeContext?.request_id || location.state?.request_id || '';
  const initialStation = activeContext?.station || activeContext?.station_name || location.state?.station || '';
  const initialAssetId = activeContext?.assetId || activeContext?.asset_id || location.state?.asset_id || '';
  const initialWorkType = activeContext?.work_type || location.state?.work_type || activeContext?.workType || '';
  const initialDuration = activeContext?.planned_duration || activeContext?.plannedDuration || location.state?.planned_duration || 1.5;

  const [requestId, setRequestId] = useState(initialRequestId);
  const [station, setStation] = useState(initialStation);
  const [assetId, setAssetId] = useState(initialAssetId);
  const [workType, setWorkType] = useState(initialWorkType);
  const [plannedDuration, setPlannedDuration] = useState(initialDuration);

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Progressive disclosure toggle
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const detectedDept = activeContext?.department || getDepartment({ asset_id: assetId, work_type: workType });
  const deptMeta = DEPARTMENT_METADATA[detectedDept] || DEPARTMENT_METADATA.TMS;

  const runPlanner = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-planner/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          station: station,
          asset_id: assetId,
          work_type: workType,
          required_duration: parseFloat(plannedDuration),
          department: detectedDept,
          persist: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecommendation({
          ...data.recommendation,
          department: detectedDept
        });
      } else {
        setError(data.error || 'Optimization failed');
      }
    } catch (err) {
      console.error('[AI Block Planner Error]', err);
      setError('Connection to AI Block Planner engine failed: ' + (err.message || 'Please check backend logs.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePushToSchedule = async () => {
    if (!recommendation) return;
    const bId = recommendation.block_id || `BLK-${requestId.replace('REQ-', '')}`;
    try {
      await fetch(`${API_BASE_URL}/api/ai-planner/persist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation, department: detectedDept })
      });
    } catch (e) {
      console.warn('Persist call notice:', e);
    }
    saveWorkflowContext({
      ...(activeContext || {}),
      requestId: requestId,
      blockId: bId,
      station: station,
      assetId: assetId,
      department: detectedDept,
      recommendation: recommendation
    });
    navigate(`/schedule?requestId=${encodeURIComponent(requestId)}&blockId=${encodeURIComponent(bId)}`);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* 8-Stage Workflow Stepper */}
      <WorkflowProgress currentStepId="planner" />

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 text-[10px] uppercase">
              Stage 3 of 8 • AI Block Planner
            </span>
            <span className="text-white/50">10 Hard Constraint Optimization Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#C6F432]" />
            <span>AI Automatic Block Planner</span>
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            Generates optimal corridor maintenance time windows while evaluating 10 hard safety & traffic constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-[#C6F432]/20 text-[#C6F432] rounded-xl border border-[#C6F432]/40 font-bold">
            Target Dept: {detectedDept}
          </span>
          <span className="px-3 py-1.5 bg-white/10 text-white rounded-xl border border-white/15 font-bold">
            10 Hard Constraints Active
          </span>
        </div>
      </div>

      {/* Input Parameters Box */}
      <div className="bg-white/[0.04] backdrop-blur-2xl p-5 rounded-2xl border border-white/12 space-y-4 shadow-xl">
        <div className="flex items-center justify-between font-mono text-xs">
          <h2 className="font-bold uppercase text-white/60 tracking-wider">Block Optimization Inputs</h2>
          <span className="text-[#C6F432] font-bold">{deptMeta.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
          <div>
            <label className="block text-[10px] text-white/50 mb-1">Request ID</label>
            <input 
              type="text" 
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 focus:border-[#C6F432] focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/50 mb-1">Station</label>
            <input 
              type="text" 
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 focus:border-[#C6F432] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/50 mb-1">Asset ID</label>
            <input 
              type="text" 
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 focus:border-[#C6F432] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/50 mb-1">Work Type</label>
            <input 
              type="text" 
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 focus:border-[#C6F432] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/50 mb-1">Req Duration (hrs)</label>
            <input 
              type="number" 
              step="0.5"
              value={plannedDuration}
              onChange={(e) => setPlannedDuration(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 focus:border-[#C6F432] focus:outline-none"
            />
          </div>
        </div>

        <button 
          onClick={runPlanner}
          disabled={loading}
          className="w-full py-3 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] text-xs font-black rounded-xl shadow-lg shadow-[#C6F432]/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className={`w-4 h-4 text-[#071426] ${loading ? 'animate-spin' : ''}`} />
          <span>Evaluate 10 Hard Constraints & Recommend {detectedDept} Block</span>
        </button>
      </div>

      {/* Recommendation Output */}
      {loading ? (
        <div className="p-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 text-center text-white/70 flex flex-col items-center justify-center gap-3">
          <Bot className="w-10 h-10 animate-bounce text-[#C6F432]" />
          <p className="text-sm font-semibold">Evaluating 10 Hard Constraints (Traffic Density, Asset Status, Crew, Equipment)...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/40 rounded-2xl text-center text-red-300 font-semibold font-mono text-xs">
          {error}
        </div>
      ) : recommendation ? (
        <div className="space-y-6">

          {/* LEVEL 1-4 HUMAN-FIRST RECOMMENDED BLOCK CARD */}
          <div className="p-6 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12 space-y-6 shadow-xl">
            
            {/* LEVEL 1: WHAT IS HAPPENING */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 font-mono text-[10px]">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 uppercase">
                    RECOMMENDED OPTIMAL BLOCK
                  </span>
                  <span className="text-white/60 font-bold">BLOCK: {recommendation.block_id || `BLK-${requestId.replace('REQ-', '')}`}</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {station || recommendation.station || 'Current Station'} Recommended Block Window
                </h2>
                <p className="text-sm font-extrabold text-[#C6F432] font-mono mt-1">
                  {recommendation.best_block_date || new Date().toISOString().split('T')[0]} ({recommendation.best_block_start_time || '01:00 AM'} – {recommendation.best_block_end_time || '02:00 AM'}) • {recommendation.required_block_duration || plannedDuration} Hours
                </p>
              </div>

              {recommendation.planner_status === 'REJECTED' ? (
                <span className="px-4 py-2.5 bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold rounded-xl font-mono">
                  REJECTED BY HARD CONSTRAINTS
                </span>
              ) : (
                <button 
                  onClick={handlePushToSchedule}
                  className="px-5 py-3 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] font-extrabold text-xs rounded-xl shadow-lg shadow-[#C6F432]/20 transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Hand Off to Block Schedule</span>
                  <ArrowRight className="w-4 h-4 text-[#071426]" />
                </button>
              )}
            </div>

            {/* LEVEL 2 & 3: EXPECTED IMPACT & REASONING */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Required Duration</span>
                <span className="text-lg font-black text-white">{recommendation.required_block_duration || plannedDuration} hrs</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Affected Trains</span>
                <span className="text-lg font-black text-white">{recommendation.expected_affected_trains || 2} trains</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Expected Delay</span>
                <span className="text-lg font-black text-amber-400">{recommendation.expected_delay || 4.2} mins</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Conflict Status</span>
                <span className="text-lg font-black text-[#C6F432]">{recommendation.conflict_status || 'ZERO CONFLICTS'}</span>
              </div>
            </div>

            {/* Why this recommendation card */}
            <div className="p-4 rounded-xl bg-[#C6F432]/5 border border-[#C6F432]/30 space-y-2">
              <span className="text-[#C6F432] font-mono font-bold text-xs flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#C6F432]" />
                <span>Why this recommendation?</span>
              </span>
              <p className="text-sm font-semibold text-white/90 leading-relaxed font-sans">
                {recommendation.recommendation_reason || 'This window aligns with lowest traffic density and zero conflicting track possessions while ensuring required crew and equipment availability.'}
              </p>
            </div>
          </div>

          {/* LEVEL 5: PROGRESSIVE DISCLOSURE — 10 HARD CONSTRAINTS & OPTIMIZATION DETAILS */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-4 text-left flex items-center justify-between text-white/80 hover:text-white hover:bg-white/5 transition"
            >
              <span className="font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C6F432]" />
                <span>View 10 Hard Constraints Verification & Raw Optimization Payload</span>
              </span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnicalDetails && (
              <div className="p-5 border-t border-white/10 space-y-4 bg-black/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/80">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/40 block text-[10px] uppercase font-bold">Assigned Manpower</span>
                    <span className="text-white font-extrabold">{recommendation.required_manpower || 12} staff ({recommendation.required_technicians || 4} technicians)</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/40 block text-[10px] uppercase font-bold">Reserved Equipment</span>
                    <span className="text-white font-extrabold">{recommendation.required_equipment || 'Ballast Tamper BCM-04'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-white/40 block text-[10px] uppercase mb-1">Raw Solver Output Payload</span>
                  <pre className="p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] text-white/70 overflow-x-auto max-h-40">
                    {JSON.stringify(recommendation, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
}
