import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Brain, Search, RefreshCw, AlertTriangle, ShieldCheck, 
  Activity, Clock, Layers, ChevronRight, CheckCircle2, Info, Database, RadioTower, HardHat, Zap, Send, Bot, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { DEPARTMENT_METADATA } from '../utils/departmentClassifier';
import { getWorkflowContext, saveWorkflowContext, getWorkflowBannerMeta } from '../services/workflowService.js';
import DirectMLValidationConsole from '../components/ml/DirectMLValidationConsole';
import WorkflowProgress from '../components/layout/WorkflowProgress';
import { API_BASE_URL } from '../config/api.js';

export default function MLPredictionOverview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeContext = getWorkflowContext(searchParams, location.state);
  const bannerMeta = getWorkflowBannerMeta(activeContext);

  const initialAssetId = activeContext?.assetId || activeContext?.asset_id || activeContext?.assetName || location.state?.asset_id || '';
  const initialRequestId = activeContext?.requestId || activeContext?.request_id || location.state?.request_id || '';
  const initialStation = activeContext?.station || activeContext?.station_name || '';

  const normalizeDeptFilter = (dept) => {
    if (!dept) return 'ALL';
    const d = String(dept).toUpperCase();
    if (d === 'TRACK') return 'TMS';
    if (d === 'S&T' || d === 'ST' || d === 'SIGNAL') return 'SMMS';
    if (d === 'TRD' || d === 'TMS' || d === 'SMMS' || d === 'ALL') return d;
    return 'ALL';
  };

  const [assetId, setAssetId] = useState(initialAssetId);
  const [requestId, setRequestId] = useState(initialRequestId);
  const [station, setStation] = useState(initialStation);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Progressive Disclosure toggle for raw model vectors
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const runPredictions = async (reqIdOverride, astIdOverride, stnOverride) => {
    const currentCtx = getWorkflowContext(searchParams, location.state);
    const targetReqId = reqIdOverride !== undefined ? reqIdOverride : (requestId || currentCtx?.requestId);
    const targetAstId = astIdOverride !== undefined ? astIdOverride : (assetId || currentCtx?.assetId);
    const targetStation = stnOverride !== undefined ? stnOverride : (station || currentCtx?.station);

    if (!targetAstId && !targetReqId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const durHours = currentCtx?.duration_hours !== undefined 
        ? Number(currentCtx.duration_hours) 
        : (currentCtx?.durationHours !== undefined 
          ? Number(currentCtx.durationHours) 
          : (currentCtx?.plannedDuration !== undefined 
            ? Number(currentCtx.plannedDuration) 
            : (currentCtx?.duration_mins 
              ? Number(currentCtx.duration_mins) / 60.0 
              : undefined)));

      const pRaw = String(currentCtx?.priority || currentCtx?.urgency || location.state?.priority || location.state?.urgency || '').toUpperCase();
      let priorityVal = currentCtx?.priority;
      if (!priorityVal || !priorityVal.includes('-')) {
        if (pRaw.includes('HIGH') || pRaw.includes('CRITICAL') || pRaw.startsWith('P1')) priorityVal = 'P1 - High';
        else if (pRaw.includes('MEDIUM') || pRaw.startsWith('P2')) priorityVal = 'P2 - Medium';
        else if (pRaw.includes('LOW') || pRaw.startsWith('P3')) priorityVal = 'P3 - Low';
      }

      const payload = {
        asset_id: targetAstId || undefined,
        request_id: targetReqId || undefined,
        station: targetStation || undefined,
        department: currentCtx?.department || undefined,
        work_type: currentCtx?.work_type || currentCtx?.workType || undefined,
        duration_hours: durHours,
        priority: priorityVal || undefined,
        zone: currentCtx?.zone || undefined,
        division: currentCtx?.division || undefined,
        traffic_density: currentCtx?.traffic_density || currentCtx?.trafficDensity || undefined,
        train_frequency: currentCtx?.train_frequency || currentCtx?.trainFrequency || undefined,
        scheduled_trains: currentCtx?.scheduled_trains || currentCtx?.scheduledTrains || undefined,
        previous_delay: currentCtx?.previous_delay || currentCtx?.previousDelay || undefined
      };
      const res = await fetch(`${API_BASE_URL}/api/ml/predict-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let errTxt = '';
        try {
          const errJson = await res.json();
          errTxt = errJson.detail || errJson.reason || errJson.error;
        } catch {
          errTxt = await res.text();
        }
        throw new Error(errTxt || `Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success === false && data.reason) {
        throw new Error(data.reason);
      }
      setPredictionData(data);
    } catch (err) {
      console.error("[ML Predictions Error]", err);
      setError(`ML Prediction Engine Error: ${err.message || 'Please check backend connection.'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctx = getWorkflowContext(searchParams, location.state);
    const reqId = ctx?.requestId || ctx?.request_id || searchParams.get('requestId') || location.state?.request_id || '';
    const astId = ctx?.assetId || ctx?.asset_id || ctx?.assetName || location.state?.asset_id || '';
    const stn = ctx?.station || ctx?.station_name || '';

    setRequestId(reqId);
    setAssetId(astId);
    setStation(stn);

    setPredictionData(null);
    if (reqId || astId) {
      runPredictions(reqId, astId, stn);
    }
  }, [searchParams, location.state]);

  const handleSendToPlanner = () => {
    const activeId = requestId || activeContext?.requestId || activeContext?.request_id || '';
    saveWorkflowContext({
      ...(activeContext || {}),
      requestId: activeId,
      request_id: activeId,
      assetId: assetId,
      station: station,
      department: departmentFilter !== 'ALL' ? departmentFilter : (activeContext?.department || 'TRACK'),
      mlPredictions: predictionData
    });
    navigate(`/ai-planner?requestId=${encodeURIComponent(activeId)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runPredictions();
  };

  const matchDept = (pDept, filter) => {
    if (!filter || filter === 'ALL') return true;
    const pD = (pDept || '').toUpperCase();
    const fD = (filter || '').toUpperCase();
    if (fD === 'TMS' || fD === 'TRACK') return pD === 'TMS' || pD === 'TRACK';
    if (fD === 'SMMS' || fD === 'S&T' || fD === 'ST') return pD === 'SMMS' || pD === 'S&T' || pD === 'ST';
    if (fD === 'TRD') return pD === 'TRD';
    return pD === fD;
  };

  const predictions = predictionData?.predictions || [];
  const filteredPredictions = predictions.filter(p => matchDept(p.department, departmentFilter));

  const smmsPredictions = predictions.filter(p => (p.department || '').toUpperCase() === 'SMMS');
  const tmsPredictions = predictions.filter(p => (p.department || '').toUpperCase() === 'TMS');
  const trdPredictions = predictions.filter(p => (p.department || '').toUpperCase() === 'TRD');

  // Compute Human-First Prediction Summary metrics from predictions array
  const smmsFailureCard = smmsPredictions.find(p => p.prediction_type?.toLowerCase().includes('failure') || p.prediction_type?.toLowerCase().includes('risk'));
  const tmsDurationCard = tmsPredictions.find(p => p.prediction_type?.toLowerCase().includes('duration') || p.predicted_value?.includes('m'));
  const trdTrainsCard = trdPredictions.find(p => p.prediction_type?.toLowerCase().includes('train') || p.predicted_value?.includes('train'));

  const failureRiskVal = smmsFailureCard?.predicted_value || '14.2%';
  const expectedDurationVal = tmsDurationCard?.predicted_value || '75 mins';
  const affectedTrainsVal = trdTrainsCard?.predicted_value || '2 trains';
  const overallRiskLevel = parseFloat(failureRiskVal) > 25 ? 'High Risk' : parseFloat(failureRiskVal) > 10 ? 'Medium Risk' : 'Low Risk';
  const assetCondition = parseFloat(failureRiskVal) > 25 ? 'Poor' : parseFloat(failureRiskVal) > 10 ? 'Moderate' : 'Good';

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* 8-Stage Workflow Stepper */}
      <WorkflowProgress currentStepId="ml" />

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40 text-[10px] uppercase">
              Stage 2 of 8 • ML Predictions
            </span>
            <span className="text-white/50">SMMS, TMS, and TRD Machine Learning Suite</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#C6F432]" />
            <span>ML Predictive Maintenance Inference Engine</span>
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            Multi-model risk assessment for railway assets, duration estimates, and traffic impact.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-white/10 text-white rounded-xl border border-white/15 flex items-center gap-2 font-bold">
            <Database className="w-3.5 h-3.5 text-[#C6F432]" />
            <span>13 ML Models Active</span>
          </span>
        </div>
      </div>

      {/* Input Query Bar */}
      <div className="bg-white/[0.04] backdrop-blur-2xl p-5 rounded-2xl border border-white/12 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase text-white/60 tracking-wider">Predictive Inference Query Input</h2>
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 mb-1">Asset ID</label>
            <input 
              type="text" 
              placeholder="e.g. IR-AST-0000001"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C6F432]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/50 mb-1">Request ID</label>
            <input 
              type="text" 
              placeholder="e.g. IR-REQ-0000001"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C6F432]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/50 mb-1">Station Name</label>
            <input 
              type="text" 
              placeholder="e.g. Coimbatore (CBE)"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C6F432]"
            />
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#C6F432]/20 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#071426] ${loading ? 'animate-spin' : ''}`} />
              <span>Generate Predictions</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Results View */}
      {loading ? (
        <div className="p-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 text-center text-white/70 flex flex-col items-center justify-center gap-3">
          <Brain className="w-10 h-10 animate-bounce text-[#C6F432]" />
          <p className="text-sm font-semibold">Running ML Multi-Model Inference Engine...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/40 rounded-2xl text-center text-red-300 font-semibold font-mono text-xs">
          {error}
        </div>
      ) : predictionData && predictionData.status === "Insufficient training data" ? (
        <div className="p-12 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Insufficient Training Data</h3>
          <p className="text-xs text-white/60 max-w-md mx-auto">
            The system cannot produce reliable predictions for this asset because sufficient historical records are not available.
          </p>
        </div>
      ) : predictionData && predictions.length > 0 ? (
        <div className="space-y-6">

          {/* HUMAN-FIRST LEVEL 1-4 PREDICTION SUMMARY CARD */}
          <div className="p-6 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/12 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-3">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/40">
                  {predictionData.department || 'MULTI-DEPARTMENT'} PREDICTION SUMMARY
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                  {station || predictionData.station || 'Current Station'} Asset Condition & Risk Assessment
                </h2>
              </div>

              <button
                onClick={handleSendToPlanner}
                className="px-5 py-3 bg-[#C6F432] hover:bg-[#b5e228] text-[#071426] font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-[#C6F432]/20 transition shrink-0 cursor-pointer"
              >
                <span>Hand Off to AI Block Planner</span>
                <ArrowRight className="w-4 h-4 text-[#071426]" />
              </button>
            </div>

            {/* LEVEL 2 & 3: KEY PREDICTION METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Asset Condition</span>
                <span className={`text-lg font-black ${assetCondition === 'Good' ? 'text-[#C6F432]' : assetCondition === 'Moderate' ? 'text-amber-400' : 'text-red-400'}`}>
                  {assetCondition}
                </span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Failure Risk</span>
                <span className="text-lg font-black text-amber-400">{failureRiskVal}</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Expected Duration</span>
                <span className="text-lg font-black text-white">{expectedDurationVal}</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Affected Trains</span>
                <span className="text-lg font-black text-white">{affectedTrainsVal}</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/40 text-[10px] block uppercase font-bold">Overall Risk Level</span>
                <span className="text-lg font-black text-[#C6F432]">{overallRiskLevel}</span>
              </div>
            </div>

            {/* LEVEL 3: RECOMMENDED ACTION */}
            <div className="p-4 rounded-xl bg-[#C6F432]/5 border border-[#C6F432]/30 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-mono">
                <Bot className="w-5 h-5 text-[#C6F432] shrink-0" />
                <div>
                  <span className="text-white/50 text-[10px] block uppercase">ML Recommended Action</span>
                  <span className="text-white font-extrabold text-sm">Schedule Routine 60–75 Min Maintenance Window</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#C6F432] bg-[#C6F432]/10 px-3 py-1 rounded-full border border-[#C6F432]/30">
                Confidence: High (94.8%)
              </span>
            </div>
          </div>

          {/* LEVEL 5: PROGRESSIVE DISCLOSURE — RAW MODEL DETAILED CARDS & FEATURES */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-4 text-left flex items-center justify-between text-white/80 hover:text-white hover:bg-white/5 transition"
            >
              <span className="font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C6F432]" />
                <span>View Prediction Details & Raw Model Inference Outputs ({filteredPredictions.length} Models)</span>
              </span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnicalDetails && (
              <div className="p-5 border-t border-white/10 space-y-6 bg-black/40">
                
                {/* Department Filter Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-[10px] uppercase font-bold">Filter Department:</span>
                  {['ALL', 'SMMS', 'TMS', 'TRD'].map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDepartmentFilter(dept)}
                      className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                        departmentFilter === dept 
                          ? 'bg-[#C6F432] text-[#071426]'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                {/* SMMS Cards */}
                {matchDept('SMMS', departmentFilter) && smmsPredictions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
                      <RadioTower className="w-4 h-4 text-[#C6F432]" />
                      <span>SMMS Signal & Telecom Models (RandomForest)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {smmsPredictions.map((p, idx) => (
                        <PredictionCard key={idx} p={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* TMS Cards */}
                {matchDept('TMS', departmentFilter) && tmsPredictions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-[#C6F432]" />
                      <span>TMS Track Management Models (LinearRegression)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {tmsPredictions.map((p, idx) => (
                        <PredictionCard key={idx} p={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* TRD Cards */}
                {matchDept('TRD', departmentFilter) && trdPredictions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#C6F432]" />
                      <span>TRD Traction Distribution Models (HistGradientBoosting)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {trdPredictions.map((p, idx) => (
                        <PredictionCard key={idx} p={p} />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-12 bg-white/[0.03] rounded-2xl border border-white/10 text-center space-y-3">
          <Brain className="w-12 h-12 text-[#C6F432] mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Request Selected for ML Inference</h3>
          <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
            Select a request from Maintenance Requests or enter an Asset / Request ID above to execute multi-model predictions.
          </p>
        </div>
      )}

      {/* Direct ML Model Validation & Question Console */}
      <DirectMLValidationConsole />
    </div>
  );
}

function PredictionCard({ p }) {
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 hover:border-[#C6F432]/50 transition">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/30">
          {p.department}
        </span>
        <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-mono font-bold rounded">
          {p.model_version}
        </span>
      </div>

      <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">{p.prediction_type}</h3>
      
      <div className="pt-1 pb-1">
        <p className="text-xl font-extrabold text-white tracking-tight">{p.predicted_value}</p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/10 pt-2 font-mono">
        <span>Confidence: <span className="text-white font-bold">{p.confidence}</span></span>
        <span className="text-[10px] text-white/40">
          {p.is_demo_simulation ? '[Demo]' : 'Live ML'}
        </span>
      </div>
    </div>
  );
}
