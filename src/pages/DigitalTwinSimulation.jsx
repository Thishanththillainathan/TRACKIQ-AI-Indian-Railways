import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Dna, Radio, Activity, Train, ShieldCheck, 
  AlertTriangle, RefreshCw, Clock, MapPin, Layers, Wifi, ArrowRight, CheckCircle2, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { getWorkflowContext, saveWorkflowContext, getSubmittedRequestIds } from '../services/workflowService.js';
import WorkflowProgress from '../components/layout/WorkflowProgress';
import { API_BASE_URL } from '../config/api.js';

export default function DigitalTwinSimulation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeContext = getWorkflowContext(searchParams, location.state);
  const submittedIds = getSubmittedRequestIds();
  const hasActiveOrSubmitted = Boolean(activeContext?.requestId || (submittedIds && submittedIds.length > 0));

  const [twinData, setTwinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Progressive disclosure toggle
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);

  const handleSendToApprovalWorkflow = (node) => {
    const reqId = activeContext?.requestId || (submittedIds.length > 0 ? submittedIds[0] : 'REQ-TMS-001');
    const blkId = activeContext?.blockId || (node ? `BLK-${node.station_code}-001` : 'BLK-TMS-001');
    saveWorkflowContext({
      ...(activeContext || {}),
      requestId: reqId,
      blockId: blkId,
      department: activeContext?.department || 'TMS',
      station: activeContext?.station || node?.station_name || 'Main Line',
      assetId: activeContext?.assetId || 'IR-AST-001',
      simulated: true,
      simulationTimestamp: new Date().toISOString()
    });
    navigate(`/approval?requestId=${encodeURIComponent(reqId)}&blockId=${encodeURIComponent(blkId)}`);
  };

  const fetchTwinState = async () => {
    setLoading(true);
    setError(null);
    try {
      const reqId = activeContext?.requestId || searchParams.get('requestId') || '';
      const blkId = activeContext?.blockId || searchParams.get('blockId') || '';
      const queryStr = (reqId || blkId) ? `?requestId=${encodeURIComponent(reqId)}&blockId=${encodeURIComponent(blkId)}` : '';
      const res = await fetch(`${API_BASE_URL}/api/digital-twin/state${queryStr}`);
      const data = await res.json();
      if (data.success) {
        setTwinData(data);
      } else {
        setError('Failed to fetch Digital Twin telemetry');
      }
    } catch (err) {
      setError('Digital Twin Telemetry Service Offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinState();
    const interval = setInterval(fetchTwinState, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* 8-Stage Workflow Stepper */}
      <WorkflowProgress currentStepId="digital-twin" />

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 text-[10px] uppercase">
              Stage 5 of 8 • Digital Twin Simulation
            </span>
            <span className="text-white/50">Live Network State Telemetry</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Dna className="w-6 h-6 text-[#C6F432]" />
            <span>Digital Twin Corridor Simulation</span>
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            Real-time simulation of train movements, track block occupancy, and signal interlocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 text-xs font-bold rounded-xl flex items-center gap-2 font-mono">
            <Radio className="w-3.5 h-3.5 text-[#C6F432] animate-pulse" />
            <span>LIVE TELEMETRY ACTIVE</span>
          </span>

          <button 
            onClick={fetchTwinState}
            className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/15 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#C6F432] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Workflow Context Banner */}
      {hasActiveOrSubmitted ? (
        <div className="p-5 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C6F432]/20 text-[#C6F432]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432]">
                  DIGITAL TWIN SIMULATED
                </span>
                <span className="font-extrabold text-white">{activeContext?.requestId || submittedIds[0]}</span>
                {activeContext?.blockId && (
                  <span className="text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                    Block: {activeContext.blockId}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Department: <strong className="text-white">{activeContext?.department || 'TRACK'}</strong> | Asset: <strong className="text-white">{activeContext?.assetId || activeContext?.asset_id || 'N/A'}</strong> | Station: <strong className="text-white">{activeContext?.station || activeContext?.station_name || 'Station Not Specified'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSendToApprovalWorkflow()}
            className="w-full md:w-auto px-5 py-3 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#C6F432]/20 transition cursor-pointer shrink-0"
          >
            <span>HAND OFF TO APPROVAL WORKFLOW</span>
            <ArrowRight className="w-4 h-4 text-[#071426]" />
          </button>
        </div>
      ) : null}

      {/* Main Telemetry & State View */}
      {loading && !twinData ? (
        <div className="p-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 text-center text-white/70 flex flex-col items-center justify-center gap-3">
          <Dna className="w-10 h-10 animate-spin text-[#C6F432]" />
          <p className="text-sm font-semibold">Connecting to Live Railway Digital Twin Telemetry Stream...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/40 rounded-2xl text-center text-red-300 font-semibold font-mono text-xs">
          {error}
        </div>
      ) : twinData ? (
        <div className="space-y-6">
          
          {/* LEVEL 1-4 TELEMETRY SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-4 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12">
              <span className="text-white/40 text-[10px] block uppercase font-bold">Active Blocks</span>
              <span className="text-2xl font-black text-white mt-1 block">{twinData.active_blocks_count || 1}</span>
              <span className="text-[10px] text-[#C6F432] font-semibold">Under Maintenance</span>
            </div>

            <div className="p-4 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12">
              <span className="text-white/40 text-[10px] block uppercase font-bold">Monitored Trains</span>
              <span className="text-2xl font-black text-[#C6F432] mt-1 block">{twinData.trains_monitored || 4}</span>
              <span className="text-[10px] text-white/60 font-semibold">Live Telemetry</span>
            </div>

            <div className="p-4 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12">
              <span className="text-white/40 text-[10px] block uppercase font-bold">Maintenance Assets</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{twinData.active_maintenance_assets || 2}</span>
              <span className="text-[10px] text-white/60 font-semibold">Track Work Active</span>
            </div>

            <div className="p-4 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12">
              <span className="text-white/40 text-[10px] block uppercase font-bold">Last Sync</span>
              <span className="text-sm font-bold text-[#C6F432] mt-2 block truncate">{twinData.timestamp ? new Date(twinData.timestamp).toLocaleTimeString() : 'Just now'}</span>
              <span className="text-[10px] text-white/50">5s Auto Refresh</span>
            </div>
          </div>

          {/* Digital Twin Network Track Nodes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-white/60 px-1">
              <span className="uppercase font-bold tracking-wider">Real-Time Track Corridor State Nodes</span>
              <span>{(twinData.digital_twin_nodes || []).length} Active Nodes</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(twinData.digital_twin_nodes || []).map((node, idx) => (
                <div key={idx} className="p-5 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-5 h-5 text-[#C6F432]" />
                      <div>
                        <h3 className="text-base font-extrabold text-white">{node.station_name} (<span className="font-mono text-[#C6F432]">{node.station_code}</span>)</h3>
                        <p className="text-[11px] font-mono text-white/50">Track ID: {node.track_id}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase ${
                      node.current_status === 'ACTIVE_BLOCK' ? 'bg-[#C6F432] text-[#071426]' :
                      'bg-white/10 text-white border border-white/15'
                    }`}>
                      {node.current_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/40 block font-bold uppercase">Operating State</span>
                      <span className="font-bold text-white">{node.operating_state}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/40 block font-bold uppercase">Active Work</span>
                      <span className="font-bold text-white">{node.work_type}</span>
                    </div>
                  </div>

                  {/* Trains in Vicinity */}
                  <div className="pt-2 border-t border-white/10 font-mono text-xs">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Trains in Vicinity</p>
                    {(node.trains_in_vicinity || []).map((t, tidx) => (
                      <div key={tidx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <Train className="w-4 h-4 text-[#C6F432]" />
                          <span className="font-bold text-white">{t.train_id} - {t.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white/70">{t.speed_kmh} km/h</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status?.includes('HELD') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-white'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSendToApprovalWorkflow(node)}
                    className="w-full py-3 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] rounded-xl text-xs font-black font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C6F432]/20 transition cursor-pointer"
                  >
                    <span>HAND OFF TO APPROVAL WORKFLOW →</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* LEVEL 5: PROGRESSIVE DISCLOSURE — RAW TELEMETRY PARAMETERS */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
            <button
              onClick={() => setShowTelemetryDetails(!showTelemetryDetails)}
              className="w-full p-4 text-left flex items-center justify-between text-white/80 hover:text-white hover:bg-white/5 transition"
            >
              <span className="font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C6F432]" />
                <span>View Full Telemetry Signal & Interlock Parameters</span>
              </span>
              {showTelemetryDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTelemetryDetails && (
              <div className="p-5 border-t border-white/10 space-y-3 bg-black/40">
                <div className="pt-1">
                  <span className="text-white/40 block text-[10px] uppercase mb-1">Raw Telemetry Data Stream</span>
                  <pre className="p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] text-white/70 overflow-x-auto max-h-48">
                    {JSON.stringify(twinData, null, 2)}
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
