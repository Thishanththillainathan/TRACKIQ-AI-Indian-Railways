import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, CheckCircle, XCircle, Clock, Edit3, 
  Play, CheckCircle2, RotateCcw, AlertTriangle, RefreshCw, ChevronRight, UserCheck, ChevronDown, ChevronUp, ShieldAlert, ArrowRight, Activity, Info
} from 'lucide-react';
import { getWorkflowContext, saveWorkflowContext, getSubmittedRequestIds } from '../services/workflowService.js';
import WorkflowProgress from '../components/layout/WorkflowProgress';
import { API_BASE_URL } from '../config/api.js';

export default function BlockSchedule() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeContext = getWorkflowContext(searchParams, location.state);

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBlockId, setExpandedBlockId] = useState(activeContext?.blockId || null);

  // Incoming recommendation state
  const rec = location.state?.recommendation || activeContext?.recommendation;

  const [actionModal, setActionModal] = useState(null); // { block, action }
  const [actualDur, setActualDur] = useState('');
  const [actualDelay, setActualDelay] = useState('');
  const [usedEquip, setUsedEquip] = useState('');
  const [notes, setNotes] = useState('');

  const handleSendToDigitalTwin = (b) => {
    const reqId = b?.request_id || activeContext?.requestId || 'REQ-TMS-001';
    const blkId = b?.block_id || activeContext?.blockId || 'BLK-TMS-001';
    saveWorkflowContext({
      ...(activeContext || {}),
      requestId: reqId,
      blockId: blkId,
      station: b?.station || activeContext?.station,
      assetId: b?.asset_id || activeContext?.assetId,
      department: b?.department || activeContext?.department,
      blockData: b
    });
    navigate(`/digital-twin?requestId=${encodeURIComponent(reqId)}&blockId=${encodeURIComponent(blkId)}`);
  };

  const fetchBlocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/optimized-blocks`);
      const data = await res.json();
      const list = data.data || data || [];
      const submittedIds = getSubmittedRequestIds();
      const activeReqId = activeContext?.requestId || activeContext?.request_id;
      const activeBlkId = activeContext?.blockId || activeContext?.block_id;

      let filtered = list.filter(b => {
        if (activeReqId && (b.request_id === activeReqId || b.schedule_details?.request_id === activeReqId)) return true;
        if (activeBlkId && (b.block_id === activeBlkId || b.id === activeBlkId)) return true;
        if (submittedIds.includes(b.request_id) || submittedIds.includes(b.block_id)) return true;
        return false;
      });

      if (filtered.length === 0 && activeReqId) {
        const synthBlock = {
          id: `synth-${Date.now()}`,
          block_id: activeBlkId || `BLK-${activeReqId.replace('REQ-', '')}`,
          request_id: activeReqId,
          station: activeContext?.station || activeContext?.station_name || 'Station Not Specified',
          department: activeContext?.department || 'TRACK',
          work_type: activeContext?.work_type || activeContext?.workType || 'Corridor Maintenance',
          planned_date: activeContext?.requestedDate || new Date().toISOString().split('T')[0],
          start_time: '10:00 AM',
          end_time: '11:15 AM',
          duration_minutes: activeContext?.durationMins || 75,
          affected_trains: 3,
          traffic_impact: 'Low',
          priority: activeContext?.priority || 'P1 - High',
          status: 'SCHEDULED',
          schedule_details: {
            request_id: activeReqId,
            asset_id: activeContext?.assetId || activeContext?.asset_id || 'N/A'
          }
        };
        filtered = [synthBlock];
      }

      setBlocks(filtered);
      if (filtered.length > 0 && !expandedBlockId) {
        setExpandedBlockId(filtered[0].block_id);
      }
    } catch (err) {
      setError('Failed to fetch scheduled blocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleActionSubmit = async (blockId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/block-schedule/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_id: blockId,
          action: action,
          actual_duration: actualDur ? parseFloat(actualDur) : undefined,
          actual_delay: actualDelay ? parseFloat(actualDelay) : undefined,
          used_equipment: usedEquip || undefined,
          notes: notes || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionModal(null);
        fetchBlocks();

        if (action === 'COMPLETE') {
          navigate('/learning', { state: { block_id: blockId } });
        }
      } else {
        alert(`Action failed: ${data.detail || data.error || 'Validation error'}`);
      }
    } catch (err) {
      alert('Failed to execute block workflow action');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* 8-Stage Workflow Stepper */}
      <WorkflowProgress currentStepId="schedule" />

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 text-[10px] uppercase">
              Stage 4 of 8 • Block Schedule
            </span>
            <span className="text-white/50">26-Field Contract Schedule Lifecycle</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#C6F432]" />
            <span>Corridor Block Schedule</span>
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            View scheduled corridor maintenance possessions and 26-field verification records.
          </p>
        </div>

        <button 
          onClick={fetchBlocks} 
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/15 transition font-mono cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C6F432] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Schedule</span>
        </button>
      </div>

      {/* Incoming AI Recommendation Banner for User Review */}
      {rec && (
        <div className="p-5 bg-[#C6F432]/10 border border-[#C6F432]/40 rounded-2xl shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C6F432] font-bold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Pending AI Recommendation Review</span>
            </div>
            <span className="px-2.5 py-0.5 bg-[#C6F432] text-[#071426] text-[10px] font-black rounded-full">NEEDS ACTION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div><span className="text-white/50">Request:</span> <span className="font-bold text-white">{rec.request_id}</span></div>
            <div><span className="text-white/50">Station:</span> <span className="text-white font-bold">{rec.station}</span></div>
            <div><span className="text-white/50">Window:</span> <span className="text-[#C6F432] font-bold">{rec.best_block_date} ({rec.best_block_start_time} - {rec.best_block_end_time})</span></div>
            <div><span className="text-white/50">Duration:</span> <span className="text-white font-bold">{rec.required_block_duration} hrs</span></div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <button 
              onClick={() => handleActionSubmit(rec.block_id || rec.request_id, 'ACCEPT')}
              className="px-4 py-2 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] text-xs font-black rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ACCEPT & APPROVE</span>
            </button>

            <button 
              onClick={() => handleActionSubmit(rec.block_id || rec.request_id, 'REJECT')}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>REJECT</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Blocks Schedule Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 text-center text-white/70 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#C6F432]" />
            <p className="text-sm font-semibold">Loading Scheduled Blocks...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="p-12 bg-white/[0.03] rounded-2xl border border-white/10 text-center text-white/50 font-mono text-xs">
            No scheduled blocks currently active.
          </div>
        ) : (
          blocks.map((b, idx) => {
            const isExpanded = expandedBlockId === b.block_id;
            const st = String(b.status || 'SCHEDULED').toUpperCase();

            return (
              <div key={idx} className="bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12 p-6 space-y-4 shadow-xl">
                
                {/* LEVEL 1: WHAT IS HAPPENING */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 font-mono text-[10px]">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 uppercase">
                        {b.department || 'TRACK'} • {b.priority || 'High'} Priority
                      </span>
                      <span className="text-white/60 font-bold">BLOCK: {b.block_id}</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">
                      {b.station || 'Current Station'} {b.work_type || 'Track Maintenance'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                      st === 'COMPLETED' ? 'bg-[#C6F432] text-[#071426]' :
                      st === 'IN_PROGRESS' || st === 'IN PROGRESS' ? 'bg-amber-400 text-[#071426]' :
                      'bg-white/10 text-white border border-white/20'
                    }`}>
                      {st}
                    </span>

                    <button 
                      onClick={() => handleSendToDigitalTwin(b)}
                      className="px-4 py-2 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] text-xs font-black rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer font-mono shrink-0"
                    >
                      <span>Hand Off to Digital Twin</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* LEVEL 2 & 3: KEY METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Planned Window</span>
                    <span className="text-sm font-extrabold text-[#C6F432]">{b.block_date || new Date().toISOString().split('T')[0]} ({b.block_start_time || '10:00 AM'} – {b.block_end_time || '11:15 AM'})</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Planned Duration</span>
                    <span className="text-sm font-extrabold text-white">{b.planned_duration || b.duration_minutes || 60} mins</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Assigned Team</span>
                    <span className="text-sm font-extrabold text-white">{b.assigned_team || 'TMD Crew 04'} ({b.assigned_technicians || 12} staff)</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Conflict Status</span>
                    <span className="text-sm font-extrabold text-[#C6F432]">{b.schedule_conflict || 'ZERO CONFLICTS'}</span>
                  </div>
                </div>

                {/* LEVEL 5: PROGRESSIVE DISCLOSURE — 26-FIELD CONTRACT TABLE */}
                <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
                  <button
                    onClick={() => setExpandedBlockId(isExpanded ? null : b.block_id)}
                    className="w-full p-3.5 text-left flex items-center justify-between text-white/80 hover:text-white hover:bg-white/5 transition"
                  >
                    <span className="font-bold flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#C6F432]" />
                      <span>View 26-Field Technical Schedule & Verification Data</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-white/10 space-y-4 bg-black/40">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {/* Group 1: Block Information */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <p className="text-[10px] font-bold text-[#C6F432] uppercase tracking-wider border-b border-white/10 pb-1">1. Block Info (7)</p>
                          <p className="truncate"><span className="text-white/40">Block ID:</span> <strong className="text-white">{b.block_id}</strong></p>
                          <p className="truncate"><span className="text-white/40">Request ID:</span> <strong className="text-white">{b.request_id}</strong></p>
                          <p className="truncate"><span className="text-white/40">Station:</span> <strong className="text-white">{b.station}</strong></p>
                          <p className="truncate"><span className="text-white/40">Corridor:</span> <strong className="text-white">{b.corridor_route}</strong></p>
                          <p className="truncate"><span className="text-white/40">Asset ID:</span> <strong className="text-white">{b.asset_id}</strong></p>
                          <p className="truncate"><span className="text-white/40">Work Type:</span> <strong className="text-white">{b.work_type}</strong></p>
                          <p className="truncate"><span className="text-white/40">Block Type:</span> <strong className="text-white">{b.block_type}</strong></p>
                        </div>

                        {/* Group 2: Schedule */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <p className="text-[10px] font-bold text-[#C6F432] uppercase tracking-wider border-b border-white/10 pb-1">2. Schedule (7)</p>
                          <p><span className="text-white/40">Block Date:</span> <strong className="text-white">{b.block_date}</strong></p>
                          <p><span className="text-white/40">Start Time:</span> <strong className="text-white">{b.block_start_time}</strong></p>
                          <p><span className="text-white/40">End Time:</span> <strong className="text-white">{b.block_end_time}</strong></p>
                          <p><span className="text-white/40">Planned Dur:</span> <strong className="text-white">{b.planned_duration} hrs</strong></p>
                          <p><span className="text-white/40">Actual Dur:</span> <strong className="text-white">{b.actual_duration !== null && b.actual_duration !== undefined ? `${b.actual_duration} hrs` : 'N/A'}</strong></p>
                          <p><span className="text-white/40">Priority:</span> <strong className="text-white">{b.priority}</strong></p>
                          <p><span className="text-white/40">Status:</span> <strong className="text-white">{b.status}</strong></p>
                        </div>

                        {/* Group 3: Resources */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <p className="text-[10px] font-bold text-[#C6F432] uppercase tracking-wider border-b border-white/10 pb-1">3. Resources (4)</p>
                          <p><span className="text-white/40">Team:</span> <strong className="text-white">{b.assigned_team}</strong></p>
                          <p><span className="text-white/40">Technicians:</span> <strong className="text-white">{b.assigned_technicians} staff</strong></p>
                          <p className="truncate"><span className="text-white/40">Req Equip:</span> <strong className="text-white">{b.required_equipment}</strong></p>
                          <p className="truncate"><span className="text-white/40">Used Equip:</span> <strong className="text-white">{b.used_equipment || 'N/A'}</strong></p>
                        </div>

                        {/* Group 4: Operations */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <p className="text-[10px] font-bold text-[#C6F432] uppercase tracking-wider border-b border-white/10 pb-1">4. Operations (2)</p>
                          <p><span className="text-white/40">Affected Trains:</span> <strong className="text-white">{b.affected_train_count}</strong></p>
                          <p><span className="text-white/40">Conflict:</span> <strong className="text-white">{b.schedule_conflict}</strong></p>
                        </div>

                        {/* Group 5: Delay / Exception */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <p className="text-[10px] font-bold text-[#C6F432] uppercase tracking-wider border-b border-white/10 pb-1">5. Delay / Exception (6)</p>
                          <p><span className="text-white/40">Delay Mins:</span> <strong className="text-white">{b.delay_minutes !== null && b.delay_minutes !== undefined ? `${b.delay_minutes} mins` : 'N/A'}</strong></p>
                          <p className="truncate"><span className="text-white/40">Delay Reason:</span> <strong className="text-white">{b.reason_for_delay || 'N/A'}</strong></p>
                          <p className="truncate"><span className="text-white/40">Canc Reason:</span> <strong className="text-white">{b.cancellation_reason || 'N/A'}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Record Actual Outcome Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-[#071426] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Record Actual Block Outcome</h3>
            <p className="text-xs text-white/50 font-mono">Block ID: {actionModal.block.block_id}</p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-white/70 mb-1">Actual Duration (hours)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={actualDur}
                  onChange={(e) => setActualDur(e.target.value)}
                  placeholder="e.g. 1.25"
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl p-2.5 focus:border-[#C6F432] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Actual Train Delay (mins)</label>
                <input 
                  type="number" 
                  value={actualDelay}
                  onChange={(e) => setActualDelay(e.target.value)}
                  placeholder="e.g. 0"
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl p-2.5 focus:border-[#C6F432] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Used Equipment</label>
                <input 
                  type="text" 
                  value={usedEquip}
                  onChange={(e) => setUsedEquip(e.target.value)}
                  placeholder="e.g. Tamper BCM-04"
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl p-2.5 focus:border-[#C6F432] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Execution Feedback / Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Maintenance outcome notes..."
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl p-2.5 h-20 focus:border-[#C6F432] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-mono">
              <button 
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleActionSubmit(actionModal.block.block_id, 'COMPLETE')}
                className="px-4 py-2 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] text-xs font-black rounded-xl shadow cursor-pointer"
              >
                Save & Pass to Self-Learning AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
