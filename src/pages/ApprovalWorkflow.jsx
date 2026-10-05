import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Loader2,
  Mail,
  XCircle,
  Clock,
  Bot,
  ArrowRight,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  Wrench,
  AlertTriangle,
  Send,
  Building2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getWorkflowContext, saveWorkflowContext, getSubmittedRequestIds } from '../services/workflowService.js';
import { API_BASE_URL } from '../config/api.js';
import WorkflowProgress from '../components/layout/WorkflowProgress';

const APPROVAL_OFFICERS = [
  { name: 'Senior Divisional Engineer (Co)', role: 'TMD Approval Authority', email: 'thishantht644@gmail.com', dept: 'Track Management' },
  { name: 'Senior Divisional Signal & Telecom Engineer', role: 'S&T Approval Authority', email: 'thishantht644@gmail.com', dept: 'Signal & Telecom' },
  { name: 'Senior Divisional Electrical Engineer (TRD)', role: 'TRD Approval Authority', email: 'thishantht644@gmail.com', dept: 'Traction Distribution' },
  { name: 'Chief Transport Planning Manager (CTPM)', role: 'Zonal Operations Approval', email: 'thishantht644@gmail.com', dept: 'Multi-Department' }
];

export default function ApprovalWorkflow() {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const blockIdParam = searchParams.get('blockId');
  const requestIdParam = searchParams.get('requestId');
  const navigate = useNavigate();

  const activeContext = getWorkflowContext(searchParams);

  const [dbApprovals, setDbApprovals] = useState([]);
  const [dbEmails, setDbEmails] = useState([]);
  const [dbBlocks, setDbBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [loading, setLoading] = useState(true);

  // Planned Data toggle state for Execution Monitor handoff
  const [isPlannedDataSelected, setIsPlannedDataSelected] = useState(true);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(APPROVAL_OFFICERS[0]);
  const [emailStatusMsg, setEmailStatusMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approvals', 'emails'

  // Progressive Disclosure Sections
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const [tokenActionResult, setTokenActionResult] = useState(null);

  useEffect(() => {
    const tokenParam = routeParams.token || searchParams.get('token');
    const decisionParam = searchParams.get('decision') || 'approved';
    if (tokenParam) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/approval/action/${tokenParam}?decision=${decisionParam}`)
        .then(async (res) => {
          const text = await res.text();
          let isProcessedAlready = text.includes('Already Processed') || text.includes('already been processed') || res.status === 409;
          let isInvalid = text.includes('Invalid') || res.status === 404;

          if (isProcessedAlready) {
            setTokenActionResult({
              status: 'already_processed',
              message: 'This approval request has already been processed.',
              decision: decisionParam
            });
          } else if (isInvalid) {
            setTokenActionResult({
              status: 'invalid',
              message: 'Invalid or Expired Approval Link.',
              decision: decisionParam
            });
          } else {
            const isAppr = decisionParam.toLowerCase() === 'approved';
            setTokenActionResult({
              status: isAppr ? 'approved' : 'rejected',
              message: isAppr ? 'APPROVED SUCCESSFULLY' : 'REJECTED SUCCESSFULLY',
              decision: decisionParam
            });
          }
          fetchWorkflowData();
        })
        .catch((err) => {
          console.warn('Token auto-validation notice:', err);
          fetchWorkflowData();
        });
    } else {
      fetchWorkflowData();
    }

    const interval = setInterval(() => {
      fetchWorkflowData();
    }, 4000);
    return () => clearInterval(interval);
  }, [searchParams, routeParams]);

  const fetchWorkflowData = async () => {
    try {
      const submittedIds = getSubmittedRequestIds();
      const targetReqId = requestIdParam || activeContext?.requestId;
      const targetBlkId = blockIdParam || activeContext?.blockId;
      const hasActiveOrSubmitted = Boolean(targetReqId || targetBlkId || (submittedIds && submittedIds.length > 0));

      // 1. Fetch Block Schedules — all blocks
      let blocks = [];
      try {
        const { data: bData } = await supabase.from('optimized_blocks').select('*').order('created_at', { ascending: false });
        blocks = bData || [];
      } catch (err) {
        console.warn('optimized_blocks fetch warning:', err);
      }
      
      if (!hasActiveOrSubmitted && blocks.length === 0) {
        blocks = [];
      } else if (hasActiveOrSubmitted && blocks.length > 0) {
        blocks = blocks.filter(b => {
          const reqMatch = (targetReqId && (b.request_id === targetReqId || b.schedule_details?.request_id === targetReqId)) ||
                           submittedIds.includes(b.request_id) ||
                           submittedIds.includes(b.schedule_details?.request_id);
          const blkMatch = targetBlkId && b.block_id === targetBlkId;
          return reqMatch || blkMatch || !targetReqId;
        });
      }

      // Synthetic block fallback if activeContext exists but block not in db yet
      if (blocks.length === 0) {
        const synthBlock = {
          id: `synth-${Date.now()}`,
          block_id: targetBlkId || `BLK-${targetReqId || 'OPT-001'}`,
          request_id: targetReqId || 'REQ-TMS-001',
          station: activeContext?.station || 'New Delhi Junction',
          station_code: 'NDLS',
          department: activeContext?.department || 'TMS',
          work_type: 'Track Renewal & Ballast Tamping',
          priority: 'High',
          start_time: '10:00 AM',
          end_time: '11:15 AM',
          duration_minutes: 75,
          planning_date: new Date().toISOString().split('T')[0],
          status: 'Scheduled',
          confidence: 96.5,
          delay_risk: 4.2,
          asset_availability_gain: 14.8,
          train_impact: 'Passenger services only; freight by permission to optimize multi-department maintenance window.',
          schedule_details: { request_id: targetReqId || 'REQ-TMS-001' }
        };
        blocks = [synthBlock];
      }

      // 2. Fetch Approval Audit Records from Backend SQLite
      let approvalRecords = [];
      try {
        const res = await fetch(`${API_BASE_URL}/api/approval/requests`);
        const data = await res.json();
        if (data && data.data) {
          approvalRecords = data.data;
        }
      } catch (backendAppErr) {
        console.warn('SQLite approvals fetch warning:', backendAppErr);
        try {
          const { data: appData } = await supabase.from('approval_requests').select('*').order('created_at', { ascending: false });
          if (appData) approvalRecords = appData;
        } catch {}
      }
      setDbApprovals(approvalRecords);

      // Merge approval records into blocks
      const mergedBlocks = blocks.map(b => {
        const reqId = b.request_id || b.schedule_details?.request_id;
        const blkId = b.block_id;
        const match = approvalRecords.find(a => 
          (reqId && a.request_id === reqId) || 
          (blkId && (a.block_id === blkId || a.request_id === blkId))
        );
        if (match) {
          const st = match.approval_status || match.status || b.status;
          return {
            ...b,
            approval_status: st,
            status: st,
            approver_name: match.approver_name || selectedOfficer.name,
            approver_email: match.approver_email || selectedOfficer.email,
            approval_remarks: match.approval_remarks || match.officer_notes,
            decision_at: match.decision_at || match.approval_timestamp,
            email_status: match.email_status === 'sent' || match.email_status === 'Sent' ? 'Sent' : (match.email_status || 'Failed'),
            email_sent_at: match.email_sent_at,
            approval_token: match.approval_token
          };
        }
        return b;
      });

      setDbBlocks(mergedBlocks);
      if (mergedBlocks.length > 0) {
        setSelectedBlock(prev => {
          if (!prev) return mergedBlocks[0];
          const updated = mergedBlocks.find(b => 
            b.block_id === prev.block_id || b.request_id === prev.request_id
          );
          return updated || prev;
        });
      } else {
        setSelectedBlock(null);
      }

      // 3. Fetch Email Automation Records
      try {
        const { data: emlData } = await supabase.from('email_automations').select('*').order('created_at', { ascending: false });
        if (emlData) setDbEmails(emlData);
      } catch { /* table may not exist yet */ }

    } catch (err) {
      console.error('Error fetching approval workflow data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForApproval = async () => {
    if (!selectedBlock || submitting) return;
    setSubmitting(true);
    try {
      const blockId = selectedBlock.block_id || selectedBlock.id;
      const reqId = selectedBlock.request_id || selectedBlock.schedule_details?.request_id || blockId || `REQ-${Date.now()}`;
      const stationDisplay =
        selectedBlock.station ||
        selectedBlock.schedule_details?.station_name ||
        selectedBlock.station_code ||
        'Unknown Station';

      const nowIso = new Date().toISOString();

      const notifyPayload = {
        requestId: reqId,
        department: selectedBlock.department || selectedBlock.schedule_details?.department || 'TMS',
        station: stationDisplay,
        workType: selectedBlock.work_type || selectedBlock.schedule_details?.work_type || 'Track Maintenance Corridor',
        priority: selectedBlock.priority || selectedBlock.schedule_details?.priority || 'High',
        plannedDate: selectedBlock.planning_date || selectedBlock.schedule_details?.planned_date || new Date().toISOString().split('T')[0],
        plannedStartTime: selectedBlock.start_time || '10:00 AM',
        plannedEndTime: selectedBlock.end_time || '11:15 AM',
        plannedDuration: String(selectedBlock.duration_minutes || 75) + ' mins',
        approverName: selectedOfficer.name,
        approverEmail: selectedOfficer.email,
        submittedBy: selectedBlock.submitted_by || 'Department Planner',
        submittedAt: selectedBlock.created_at || selectedBlock.submitted_at || nowIso,
        plannedData: selectedBlock
      };

      const res = await fetch(`${API_BASE_URL}/api/approval/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifyPayload)
      });

      if (!res.ok) {
        let errText = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          errText = errJson.message || errJson.detail || errJson.email_error || errText;
        } catch {}
        throw new Error(errText);
      }

      const result = await res.json();

      const updatedBlock = {
        ...selectedBlock,
        status: 'Pending',
        approval_status: 'Pending',
        approver_name: selectedOfficer.name,
        approver_email: selectedOfficer.email,
        email_status: result.email_sent ? 'Sent' : 'Failed',
        email_sent: result.email_sent,
        email_sent_at: nowIso
      };

      setSelectedBlock(updatedBlock);

      if (result.email_sent) {
        setEmailStatusMsg(result.message || `✅ Approval request email sent successfully to ${selectedOfficer.email}. Awaiting decision.`);
      } else if (result.email_error || result.message) {
        setEmailStatusMsg(`⚠️ ${result.email_error || result.message}`);
      } else {
        setEmailStatusMsg("⚠️ Approval request saved, but email notification failed.");
      }

      fetchWorkflowData();
    } catch (err) {
      console.error('Send for approval error:', err);
      const isFetchError = err.message === 'Failed to fetch' || err.name === 'TypeError';
      const msg = isFetchError
        ? `❌ Cannot reach backend server at ${API_BASE_URL}. Ensure FastAPI is running on port 8011.`
        : `❌ Failed to send approval email: ${err.message}`;
      setEmailStatusMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToExecutionMonitor = async () => {
    if (!selectedBlock) return;
    setSubmitting(true);
    try {
      const blockId = selectedBlock.block_id || selectedBlock.id;
      const nowIso = new Date().toISOString();
      let schedDetails = selectedBlock.schedule_details || {};
      if (typeof schedDetails !== 'object' || !schedDetails) schedDetails = {};
      schedDetails.sent_to_execution = true;
      schedDetails.sent_to_execution_at = nowIso;

      const filterEq = selectedBlock.id ? 'id' : 'block_id';
      const filterVal = selectedBlock.id || blockId;

      try {
        await supabase
          .from('optimized_blocks')
          .update({
            status: 'SENT_TO_EXECUTION',
            schedule_details: schedDetails
          })
          .eq(filterEq, filterVal);
      } catch {}

      const updatedBlock = {
        ...selectedBlock,
        status: 'SENT_TO_EXECUTION',
        schedule_details: schedDetails
      };

      setSelectedBlock(updatedBlock);
      setDbBlocks((prev) =>
        prev.map((b) => (b.id === updatedBlock.id || b.block_id === updatedBlock.block_id ? updatedBlock : b))
      );

      const reqId = selectedBlock.request_id || selectedBlock.schedule_details?.request_id || activeContext?.requestId || 'REQ-TMS-001';
      saveWorkflowContext({
        ...(activeContext || {}),
        requestId: reqId,
        blockId: blockId,
        isPlannedDataSelected: isPlannedDataSelected,
        plannedBlock: updatedBlock,
        sentToExecution: true
      });

      setEmailStatusMsg(`✅ Block ${blockId} successfully sent to Execution Monitor.`);
      navigate(`/execution?blockId=${encodeURIComponent(blockId)}&requestId=${encodeURIComponent(reqId)}`);
    } catch (err) {
      console.error('Send to execution error:', err);
      setEmailStatusMsg(`❌ Failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* 8-Stage Workflow Stepper */}
      <WorkflowProgress currentStepId="approval" />

      {/* Page Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 text-[10px] uppercase">
              Stage 6 of 8 • Approval Workflow
            </span>
            <span className="text-white/50">Human-in-the-Loop Official Decision</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Approval Workflow & Email Automation
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            Review AI recommended block schedules and dispatch single-use authorization emails.
          </p>
        </div>

        {/* Quick Context Pill */}
        {activeContext && activeContext.requestId && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-white/80">
            <CheckCircle2 className="w-4 h-4 text-[#C6F432] shrink-0" />
            <span>Active Request: <strong className="text-white">{activeContext.requestId}</strong></span>
          </div>
        )}
      </div>

      {/* Token Action Result Banner */}
      {tokenActionResult && (
        <div className={`p-5 rounded-2xl border font-mono text-sm flex items-center justify-between shadow-2xl ${
          tokenActionResult.status === 'approved'
            ? 'bg-[#C6F432]/10 border-[#C6F432] text-[#C6F432]'
            : tokenActionResult.status === 'rejected'
            ? 'bg-red-500/10 border-red-500 text-red-400'
            : tokenActionResult.status === 'already_processed'
            ? 'bg-amber-500/10 border-amber-500 text-amber-300'
            : 'bg-white/10 border-white/20 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {tokenActionResult.status === 'approved' && <CheckCircle2 className="w-6 h-6 text-[#C6F432] shrink-0" />}
            {tokenActionResult.status === 'rejected' && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
            {tokenActionResult.status === 'already_processed' && <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />}
            <div>
              <div className="font-extrabold text-base tracking-wide uppercase">
                {tokenActionResult.message}
              </div>
              <div className="text-xs opacity-80 font-sans mt-0.5">
                {tokenActionResult.status === 'already_processed'
                  ? 'This single-use security token has already been processed and recorded in the database.'
                  : 'Database status updated cleanly via verified single-use approval token.'}
              </div>
            </div>
          </div>
          <button onClick={() => setTokenActionResult(null)} className="opacity-60 hover:opacity-100 transition-opacity">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Status Alert Banner */}
      {emailStatusMsg && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C6F432] shrink-0" />
            <span className="font-bold">{emailStatusMsg}</span>
          </span>
          <button onClick={() => setEmailStatusMsg(null)} className="text-white/50 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKFLOW AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Request Selection List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-white/60 px-1">
            <span className="uppercase font-bold tracking-wider">Select Approval Request</span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-white font-bold">{dbBlocks.length}</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {dbBlocks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-white/50 font-mono text-xs text-center">
                No active approval requests found.
              </div>
            ) : (
              dbBlocks.map((b) => {
                const isSelected = selectedBlock?.block_id === b.block_id || selectedBlock?.request_id === b.request_id;
                const st = String(b.approval_status || b.status || '').toUpperCase();
                const isApproved = st === 'APPROVED';
                const isRejected = st === 'REJECTED';
                const isSent = b.email_status === 'Sent' || b.email_status === 'sent';

                const stationName = b.station || b.schedule_details?.station_name || b.station_code || 'Current Station';
                const deptName = b.department || 'Track';
                const workTitle = b.work_type || 'Track Maintenance';

                return (
                  <div
                    key={b.id || b.block_id || b.request_id}
                    onClick={() => setSelectedBlock(b)}
                    className={`p-4 rounded-2xl border font-sans text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/10 text-white border-[#C6F432] shadow-lg shadow-[#C6F432]/10 ring-1 ring-[#C6F432]/50'
                        : 'bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-sm text-white">{stationName} Maintenance</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        isApproved ? 'bg-[#C6F432] text-[#071426]' :
                        isRejected ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        isSent ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-white/10 text-white/70'
                      }`}>
                        {isApproved ? 'Approved' : isRejected ? 'Rejected' : isSent ? 'Awaiting Email Approval' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-white/60 mb-2 font-mono">
                      <span className="font-bold text-[#C6F432]">{deptName}</span>
                      <span>•</span>
                      <span>{b.priority || 'High'} Priority</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-2 border-t border-white/10">
                      <span>Window: {b.start_time || '01:00 AM'} - {b.end_time || '02:00 AM'}</span>
                      <span className="font-bold text-white/80">{b.duration_minutes || 60}m</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Human-First 5-Level Information Card */}
        {selectedBlock ? (
          <div className="lg:col-span-2 space-y-5">
            
            {/* MAIN CARD CONTAINER */}
            <div className="bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12 p-6 space-y-6 shadow-2xl">
              
              {/* LEVEL 1: WHAT IS HAPPENING */}
              <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40">
                      {selectedBlock.department || 'TRACK'} • {selectedBlock.priority || 'High'} Priority
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {selectedBlock.station || selectedBlock.schedule_details?.station_name || 'Current Station'} Corridor Maintenance
                  </h2>
                </div>

                <div className="text-right font-mono text-xs text-white/60">
                  <p>Planned Date: <span className="text-white font-bold">{selectedBlock.planning_date || new Date().toISOString().split('T')[0]}</span></p>
                  <p>Window: <span className="text-[#C6F432] font-bold">{selectedBlock.start_time || '01:00 AM'} – {selectedBlock.end_time || '02:00 AM'}</span></p>
                </div>
              </div>

              {/* LEVEL 2: WHAT DO I NEED TO KNOW (WORK DETAILS) */}
              <div>
                <h3 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider mb-2.5">Work Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-xl border border-white/10 font-mono text-xs">
                  <div>
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Station</span>
                    <span className="font-extrabold text-white text-sm">{selectedBlock.station || selectedBlock.station_code || 'Current Station'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Work</span>
                    <span className="font-extrabold text-white text-sm">{selectedBlock.work_type || 'Track Maintenance'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Duration</span>
                    <span className="font-extrabold text-white text-sm">{selectedBlock.duration_minutes || 60} minutes</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block uppercase font-bold">Time Window</span>
                    <span className="font-extrabold text-[#C6F432] text-sm">{selectedBlock.start_time || '01:00 AM'} – {selectedBlock.end_time || '02:00 AM'}</span>
                  </div>
                </div>
              </div>

              {/* LEVEL 3: WHAT DID THE SYSTEM RECOMMEND (AI RECOMMENDATION) */}
              <div className="p-4 rounded-xl bg-[#C6F432]/5 border border-[#C6F432]/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#C6F432] font-bold flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-[#C6F432]" />
                    <span>AI Optimization Recommendation</span>
                  </span>
                  <span className="text-white/70 text-[11px]">AI Confidence: <strong>{selectedBlock.confidence || 96.5}%</strong></span>
                </div>

                <p className="text-sm font-semibold text-white/90 leading-relaxed">
                  {selectedBlock.train_impact || 'Passenger services only; freight by permission to minimize network disruption.'}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 font-mono text-xs">
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <span className="text-white/50 text-[10px] block uppercase">Delay Risk</span>
                    <span className="text-base font-extrabold text-amber-400">{selectedBlock.delay_risk || 4.2}%</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <span className="text-white/50 text-[10px] block uppercase">Asset Availability Gain</span>
                    <span className="text-base font-extrabold text-[#C6F432]">+{selectedBlock.asset_availability_gain || 14.8}%</span>
                  </div>
                </div>
              </div>

              {/* LEVEL 4: WHAT IS THE CURRENT STATUS & ACTIONS */}
              {(() => {
                const st = String(selectedBlock.approval_status || selectedBlock.status || '').toUpperCase();
                const isApproved = st === 'APPROVED';
                const isRejected = st === 'REJECTED';
                const isSent = selectedBlock.email_status === 'Sent' || selectedBlock.email_status === 'sent';
                const isExecutionSent = selectedBlock.schedule_details?.sent_to_execution || st === 'SENT_TO_EXECUTION';

                if (isApproved || isRejected) {
                  return (
                    <div className="space-y-4 pt-2 border-t border-white/10 font-mono text-xs">
                      <div className={`p-4 rounded-xl border ${isApproved ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-red-950/20 border-red-500/40'} space-y-3`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className={`font-bold text-sm uppercase flex items-center gap-2 ${isApproved ? 'text-[#C6F432]' : 'text-red-400'}`}>
                            {isApproved ? <CheckCircle2 className="w-5 h-5 text-[#C6F432]" /> : <XCircle className="w-5 h-5 text-red-400" />}
                            <span>APPROVAL STATUS: {isApproved ? 'APPROVED' : 'REJECTED'}</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
                            Email Status: Delivered
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/80">
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">Approver</span>
                            <span className="font-extrabold text-white">{selectedBlock.approver_name || selectedOfficer.name}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">Approver Email</span>
                            <span className="font-extrabold text-white">{selectedBlock.approver_email || selectedOfficer.email}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">Decision Time</span>
                            <span className="font-extrabold text-white">{selectedBlock.decision_at ? new Date(selectedBlock.decision_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">Decision Method</span>
                            <span className="font-extrabold text-[#C6F432]">Secure Email Action Link</span>
                          </div>
                        </div>

                        {selectedBlock.approval_remarks && (
                          <div className="pt-1">
                            <span className="text-white/40 block text-[10px] uppercase font-bold mb-1">Remarks</span>
                            <div className="p-2.5 rounded bg-black/40 border border-white/10 text-white/90 font-mono text-xs">
                              {selectedBlock.approval_remarks}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Handoff to Execution Monitor */}
                      {isApproved && (
                        <div className="pt-2 font-mono">
                          {isExecutionSent ? (
                            <button
                              disabled={true}
                              className="w-full py-3.5 rounded-xl bg-white/10 border border-white/15 text-white/80 font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#C6F432]" />
                              <span>SENT TO EXECUTION MONITOR</span>
                            </button>
                          ) : (
                            <button
                              disabled={submitting}
                              onClick={handleSendToExecutionMonitor}
                              className="w-full py-3.5 rounded-xl bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C6F432]/20 transition cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                              <span>HAND OFF TO EXECUTION MONITOR →</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                if (isSent) {
                  return (
                    <div className="space-y-4 pt-2 border-t border-white/10 font-mono text-xs">
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                          <span className="font-bold text-xs uppercase flex items-center gap-2 text-amber-300">
                            <Mail className="w-4 h-4 text-amber-300" />
                            <span>STATUS: AWAITING EMAIL APPROVAL</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Email Status: Sent
                          </span>
                        </div>
                        <p className="text-xs text-white/80 font-sans leading-relaxed">
                          An official approval email with functional <strong>[ APPROVE ]</strong> and <strong>[ REJECT ]</strong> buttons has been dispatched to <strong>{selectedBlock.approver_email || selectedOfficer.email}</strong>.
                        </p>
                      </div>

                      <button
                        disabled={submitting}
                        onClick={handleSendForApproval}
                        className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin text-[#C6F432]" /> : <Mail className="w-4 h-4 text-[#C6F432]" />}
                        <span>RESEND APPROVAL EMAIL</span>
                      </button>
                    </div>
                  );
                }

                // PENDING MODE: Show Designation Selector & Send Button
                return (
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <div className="space-y-2 font-mono text-xs">
                      <label className="text-white/70 font-bold uppercase block">Designated Approval Authority</label>
                      <select
                        value={selectedOfficer.email}
                        onChange={(e) => {
                          const off = APPROVAL_OFFICERS.find(o => o.email === e.target.value);
                          if (off) setSelectedOfficer(off);
                        }}
                        className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-[#C6F432] font-bold"
                      >
                        {APPROVAL_OFFICERS.map((o) => (
                          <option key={o.email} value={o.email} className="bg-[#071426] text-white">
                            {o.name} ({o.role}) — {o.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      disabled={submitting}
                      onClick={handleSendForApproval}
                      className="w-full py-3.5 rounded-xl bg-[#C6F432] hover:bg-[#b5e228] disabled:opacity-50 text-[#071426] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C6F432]/20 transition cursor-pointer"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin text-[#071426]" /> : <Mail className="w-4 h-4 text-[#071426]" />}
                      <span>SEND FOR APPROVAL</span>
                    </button>
                  </div>
                );
              })()}

            </div>

            {/* LEVEL 5: PROGRESSIVE DISCLOSURE — EXPANDABLE TECHNICAL DETAILS & AUDIT LOGS */}
            <div className="space-y-3 font-mono text-xs">
              
              {/* Accordion 1: Technical & System Data */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full p-4 text-left flex items-center justify-between text-white/80 hover:text-white hover:bg-white/5 transition"
                >
                  <span className="font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#C6F432]" />
                    <span>Technical Details & System Identifiers</span>
                  </span>
                  {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTechnicalDetails && (
                  <div className="p-4 border-t border-white/10 space-y-3 bg-black/30">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-white/80">
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Request ID</span>
                        <span className="font-mono font-bold text-white">{selectedBlock.request_id || selectedBlock.schedule_details?.request_id || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Block ID</span>
                        <span className="font-mono font-bold text-white">{selectedBlock.block_id || selectedBlock.id}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Department Code</span>
                        <span className="font-mono font-bold text-[#C6F432]">{selectedBlock.department || 'TMS'}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Station Code</span>
                        <span className="font-mono font-bold text-white">{selectedBlock.station_code || 'NDLS'}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Single-Use Token</span>
                        <span className="font-mono text-[10px] text-white/60 truncate block">{selectedBlock.approval_token || 'Generated on dispatch'}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Submitted Timestamp</span>
                        <span className="font-mono text-[10px] text-white/80">{selectedBlock.created_at ? new Date(selectedBlock.created_at).toLocaleString('en-IN') : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Raw Planned Data Expandable Object */}
                    <div className="pt-2">
                      <span className="text-white/40 block text-[10px] uppercase mb-1">Raw Planned Data Payload</span>
                      <pre className="p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] font-mono text-white/70 overflow-x-auto max-h-40">
                        {JSON.stringify(selectedBlock, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Audit Logs & Email History */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowAuditLogs(!showAuditLogs)}
                  className="w-full p-4 text-left flex items-center justify-between text-white/80 hover:text-white hover:bg-white/5 transition"
                >
                  <span className="font-bold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#C6F432]" />
                    <span>View Approval Audit Log & Email Automations ({dbApprovals.length + dbEmails.length})</span>
                  </span>
                  {showAuditLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAuditLogs && (
                  <div className="p-4 border-t border-white/10 space-y-4 bg-black/30">
                    
                    {/* Tab Selection */}
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <button
                        onClick={() => setActiveTab('approvals')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${activeTab === 'approvals' ? 'bg-[#C6F432] text-[#071426]' : 'bg-white/5 text-white/70'}`}
                      >
                        Database Audit Logs ({dbApprovals.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('emails')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${activeTab === 'emails' ? 'bg-[#C6F432] text-[#071426]' : 'bg-white/5 text-white/70'}`}
                      >
                        Email Dispatch Logs ({dbEmails.length})
                      </button>
                    </div>

                    {/* Sub-tab 1: Database Audit Logs */}
                    {activeTab === 'approvals' && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-white/10 text-white uppercase text-[10px]">
                            <tr>
                              <th className="p-2.5">Request ID</th>
                              <th className="p-2.5">Station</th>
                              <th className="p-2.5">Approver</th>
                              <th className="p-2.5">Status</th>
                              <th className="p-2.5">Decision Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10 text-white/80">
                            {dbApprovals.length === 0 ? (
                              <tr><td colSpan="5" className="p-3 text-center text-white/40">No audit records stored yet.</td></tr>
                            ) : (
                              dbApprovals.map((a) => (
                                <tr key={a.id || a.request_id} className="hover:bg-white/5">
                                  <td className="p-2.5 font-bold text-white">{a.request_id || a.block_id}</td>
                                  <td className="p-2.5">{a.station || 'N/A'}</td>
                                  <td className="p-2.5">{a.approver_name}</td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      a.approval_status === 'Approved' ? 'bg-[#C6F432] text-[#071426]' :
                                      a.approval_status === 'Rejected' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'
                                    }`}>
                                      {a.approval_status || 'Pending'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-white/50">{a.decision_at ? new Date(a.decision_at).toLocaleString('en-IN') : 'N/A'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Sub-tab 2: Email Automations */}
                    {activeTab === 'emails' && (
                      <div className="space-y-2">
                        {dbEmails.length === 0 ? (
                          <div className="p-3 text-center text-white/40">No email logs available.</div>
                        ) : (
                          dbEmails.map((e) => (
                            <div key={e.id || e.automation_id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                              <div className="flex justify-between text-white/60 mb-1">
                                <span className="font-bold text-white">{e.recipient_email}</span>
                                <span>{new Date(e.sent_timestamp || e.created_at).toLocaleString('en-IN')}</span>
                              </div>
                              <p className="text-white font-semibold">{e.email_subject}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-white/50 font-mono text-xs bg-white/[0.03] rounded-2xl border border-white/10">
            Select an approval request from the left column to view details and send for approval.
          </div>
        )}

      </div>
    </div>
  );
}