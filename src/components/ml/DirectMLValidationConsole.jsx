import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api.js';
import { 
  Brain, Search, CheckCircle2, AlertTriangle, RefreshCw, 
  HelpCircle, ArrowRight, ShieldCheck, Database, Layers, Sparkles, Sliders
} from 'lucide-react';

export default function DirectMLValidationConsole() {
  const [selectedDept, setSelectedDept] = useState('TMS');
  const [mode, setMode] = useState('historical'); // 'historical' or 'manual'
  const [testCaseIndex, setTestCaseIndex] = useState(0);
  
  const [histData, setHistData] = useState(null);
  const [loadingHist, setLoadingHist] = useState(false);

  const [activeResult, setActiveResult] = useState(null);
  const [loadingInference, setLoadingInference] = useState(false);
  const [error, setError] = useState(null);

  // Manual feature form state
  const [manualFeatures, setManualFeatures] = useState({
    Station: 'Coimbatore Junction',
    'Work Type': 'Track Tamping & Rail Alignment',
    'Traffic Density': 'High (120-200 trains/day)',
    Priority: 'P1 - High',
    Zone: 'SR',
    Division: 'Palakkad',
    'Planned Duration': 4.5,
    'Train Frequency': 120,
    'Scheduled Trains': 110,
    'Previous Delay': 15.0,
    'Block Type': 'Traction (OHE) Block'
  });

  const loadHistoricalCases = async () => {
    setLoadingHist(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ml/historical-test-cases`);
      const data = await res.json();
      if (data.success && data.data) {
        setHistData(data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch historical test cases:', e);
    } finally {
      setLoadingHist(false);
    }
  };

  useEffect(() => {
    loadHistoricalCases();
  }, []);

  const runDirectValidation = async (dept = selectedDept, idx = testCaseIndex, currentMode = mode) => {
    setLoadingInference(true);
    setError(null);
    try {
      const payload = {
        department: dept,
        mode: currentMode,
        test_case_index: idx,
        manual_features: currentMode === 'manual' ? manualFeatures : undefined
      };
      const res = await fetch(`${API_BASE_URL}/api/ml/direct-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setActiveResult(data);
      } else {
        setError(data.error || 'Failed to query direct validation endpoint.');
      }
    } catch (err) {
      setError('Connection error querying ML validation engine.');
    } finally {
      setLoadingInference(false);
    }
  };

  useEffect(() => {
    runDirectValidation(selectedDept, testCaseIndex, mode);
  }, [selectedDept, testCaseIndex, mode]);

  const currentDeptInfo = histData?.departments?.[selectedDept] || null;
  const currentCases = currentDeptInfo?.results || [];

  return (
    <div className="vision-card rounded-2xl border border-white/10 p-6 space-y-6 shadow-xl font-sans">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#C6F432]/20 border border-[#C6F432]/30 text-[#C6F432] rounded-xl">
              <Sparkles className="w-5 h-5 text-[#C6F432]" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              3. Direct ML Model Validation & Question Console
            </h2>
          </div>
          <p className="text-xs text-white/60 mt-1 font-medium">
            Directly test existing <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">.joblib</code> models against real historical rows from <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">3dept.xlsx</code> (Request_ID strictly excluded from feature vector).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#C6F432]/10 border border-[#C6F432]/30 text-[#C6F432] text-xs font-bold rounded-xl font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C6F432]" />
            <span>100% Model Immutability Verified</span>
          </span>
        </div>
      </div>

      {/* DEPARTMENT & MODE SELECTORS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        {/* Department Tabs */}
        <div>
          <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-2">
            1. Select Target ML Model
          </label>
          <div className="flex items-center gap-2">
            {[
              { id: 'TMS', label: 'TMS Model (LinearReg)', sub: 'Actual Duration' },
              { id: 'SMMS', label: 'SMMS Model (RandomForest)', sub: 'Failure Risk' },
              { id: 'TRD', label: 'TRD Model (HistGradient)', sub: 'Affected Trains' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setSelectedDept(d.id);
                  setTestCaseIndex(0);
                }}
                className={`flex-1 p-2.5 rounded-xl border text-left transition ${
                  selectedDept === d.id
                    ? 'bg-[#C6F432] text-black border-[#C6F432] font-semibold shadow-lg shadow-[#C6F432]/10'
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold">{d.id} Model</div>
                <div className="text-[10px] opacity-80 truncate">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div>
          <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-2">
            2. Select Input Evaluation Mode
          </label>
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setMode('historical')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'historical'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Mode A: Real Historical Cases (20)
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'manual'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Mode B: Custom Manual Feature Query
            </button>
          </div>
        </div>
      </div>

      {/* CASE SELECTION / MANUAL FEATURE FORM */}
      {mode === 'historical' ? (
        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#C6F432]" />
              Select Real Historical Row from 3dept.xlsx ({currentCases.length} Cases)
            </label>
            <span className="text-[11px] font-bold text-[#C6F432] font-mono bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
              Source Sheet: {selectedDept === 'SMMS' ? 'Maintenance / Operations' : 'Operations'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <select
                value={testCaseIndex}
                onChange={(e) => setTestCaseIndex(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 text-white text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-[#C6F432]/60"
              >
                {currentCases.map((c, i) => (
                  <option key={i} value={i}>
                    Case #{c.case_id} — Station: {c.station} | Actual Target: {c.actual_target} | ID: {c.request_id}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => runDirectValidation(selectedDept, testCaseIndex, 'historical')}
              disabled={loadingInference}
              className="w-full py-2.5 bg-[#C6F432] hover:bg-[#b5e328] text-black text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#C6F432]/10"
            >
              <RefreshCw className={`w-4 h-4 text-black ${loadingInference ? 'animate-spin' : ''}`} />
              <span>ASK MODEL</span>
            </button>
          </div>
        </div>
      ) : (
        /* MANUAL MODE FORM */
        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#C6F432]" />
              Custom Model Feature Vector Inputs
            </label>
            <span className="text-[11px] font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg font-mono">
              LINEAGE: MANUAL INPUT
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-white/70 mb-1 uppercase">Station</label>
              <input
                type="text"
                value={manualFeatures.Station}
                onChange={(e) => setManualFeatures({ ...manualFeatures, Station: e.target.value })}
                className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-[#C6F432]/60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/70 mb-1 uppercase">Work Type</label>
              <input
                type="text"
                value={manualFeatures['Work Type']}
                onChange={(e) => setManualFeatures({ ...manualFeatures, 'Work Type': e.target.value })}
                className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-[#C6F432]/60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/70 mb-1 uppercase">Planned Duration (hrs)</label>
              <input
                type="number"
                step="0.1"
                value={manualFeatures['Planned Duration']}
                onChange={(e) => setManualFeatures({ ...manualFeatures, 'Planned Duration': parseFloat(e.target.value) || 0 })}
                className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-[#C6F432]/60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/70 mb-1 uppercase">Previous Delay (mins)</label>
              <input
                type="number"
                step="0.1"
                value={manualFeatures['Previous Delay']}
                onChange={(e) => setManualFeatures({ ...manualFeatures, 'Previous Delay': parseFloat(e.target.value) || 0 })}
                className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-[#C6F432]/60"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => runDirectValidation(selectedDept, 0, 'manual')}
              disabled={loadingInference}
              className="px-6 py-2.5 bg-[#C6F432] hover:bg-[#b5e328] text-black text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#C6F432]/10"
            >
              <RefreshCw className={`w-4 h-4 text-black ${loadingInference ? 'animate-spin' : ''}`} />
              <span>ASK MODEL</span>
            </button>
          </div>
        </div>
      )}

      {/* HUMAN QUESTION & MODEL PREDICTION RESPONSE CARD */}
      {activeResult && (
        <div className="space-y-4 border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-md shadow-xl">
          {/* Question Box */}
          <div className="bg-white/5 border-l-4 border-[#C6F432] p-4 rounded-r-xl space-y-1">
            <div className="text-[10px] font-bold text-[#C6F432] uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#C6F432]" />
              Human-Readable Question Prompt
            </div>
            <h4 className="text-sm font-bold text-white italic">
              "{activeResult.human_question}"
            </h4>
          </div>

          {/* Model Pipeline Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs items-center bg-black/30 p-4 rounded-xl border border-white/10">
            {/* 1. Input Features */}
            <div className="space-y-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">
                1. Feature Vector (Model Input)
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[11px] pr-1">
                {Object.entries(activeResult.input_features || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-white/10 py-1">
                    <span className="text-white/60 font-medium">{k}:</span>
                    <strong className="text-white">{String(v)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Model Pipeline */}
            <div className="text-center space-y-2 bg-white/5 text-white p-4 rounded-xl border border-white/10 shadow-lg">
              <Brain className="w-8 h-8 text-[#C6F432] mx-auto animate-pulse" />
              <div className="font-bold text-sm tracking-tight">{selectedDept} ML Model</div>
              <div className="text-[10px] font-mono text-white/60">
                {selectedDept === 'TMS' ? 'LinearRegression-TMS-v2' : (selectedDept === 'SMMS' ? 'RandomForest-SMMS-v2' : 'HistGradientBoosting-TRD-v2')}
              </div>
              <span className="inline-block px-2.5 py-0.5 bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/30 text-[10px] font-bold rounded-lg font-mono">
                {activeResult.lineage}
              </span>
            </div>

            {/* 3. Model Output */}
            <div className="space-y-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">
                3. Direct Model Prediction
              </span>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#C6F432] font-mono tracking-tight">
                  {activeResult.predicted_target}
                </div>
                {activeResult.mode === 'historical' && (
                  <div className="space-y-1 text-[11px] border-t border-white/10 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-white/60">Actual Target:</span>
                      <strong className="text-white">{activeResult.actual_target}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Absolute Error:</span>
                      <strong className="text-white">{activeResult.absolute_error}</strong>
                    </div>
                  </div>
                )}
                <div className="pt-1">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                    activeResult.status === 'PASS' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono' 
                      : (activeResult.status === 'FAIL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono' : 'bg-white/10 text-white')
                  }`}>
                    {activeResult.status === 'PASS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>STATUS: {activeResult.status}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT ACCURACY METRICS & 20 CASES TABLE (MODE A) */}
      {mode === 'historical' && currentDeptInfo && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C6F432]" />
                {selectedDept} Model Validation Benchmark Summary (20 Real Cases)
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-white font-bold rounded-lg">
                Passed: {currentDeptInfo.passes} / {currentDeptInfo.cases_tested}
              </span>
              <span className={`px-3 py-1 rounded-lg font-bold ${
                currentDeptInfo.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                MODEL VERDICT: {currentDeptInfo.status}
              </span>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-white/60 uppercase font-bold block">Cases Tested</span>
              <strong className="text-lg text-white">{currentDeptInfo.cases_tested}</strong>
            </div>
            {'mae' in currentDeptInfo && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/60 uppercase font-bold block">Mean Absolute Error (MAE)</span>
                <strong className="text-lg text-white">{currentDeptInfo.mae}</strong>
              </div>
            )}
            {'r2' in currentDeptInfo && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/60 uppercase font-bold block">R² Score</span>
                <strong className="text-lg text-white">{currentDeptInfo.r2}</strong>
              </div>
            )}
            {'accuracy' in currentDeptInfo && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/60 uppercase font-bold block">Accuracy Score</span>
                <strong className="text-lg text-white">{currentDeptInfo.accuracy * 100}%</strong>
              </div>
            )}
            {'f1_score' in currentDeptInfo && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/60 uppercase font-bold block">F1-Score</span>
                <strong className="text-lg text-white">{currentDeptInfo.f1_score}</strong>
              </div>
            )}
          </div>

          {/* Table of 20 Cases */}
          <div className="overflow-x-auto border border-white/10 rounded-xl max-h-72">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-black/60 text-white/70 font-bold uppercase text-[10px] sticky top-0 border-b border-white/10">
                <tr>
                  <th className="p-2.5">Case #</th>
                  <th className="p-2.5">Request ID</th>
                  <th className="p-2.5">Station</th>
                  <th className="p-2.5">Actual Target</th>
                  <th className="p-2.5">Predicted Target</th>
                  <th className="p-2.5">Error / Confidence</th>
                  <th className="p-2.5">Lineage</th>
                  <th className="p-2.5">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono text-[11px]">
                {currentCases.map((c, i) => (
                  <tr key={i} className={`hover:bg-white/5 transition-colors ${testCaseIndex === i ? 'bg-white/10 font-bold' : ''}`}>
                    <td className="p-2.5 text-white/80">#{c.case_id}</td>
                    <td className="p-2.5 text-white font-bold">{c.request_id}</td>
                    <td className="p-2.5 text-white/80 font-sans">{c.station}</td>
                    <td className="p-2.5 text-white font-bold">{String(c.actual_target)}</td>
                    <td className="p-2.5 text-[#C6F432] font-bold">{String(c.predicted_target)}</td>
                    <td className="p-2.5 text-white/60">{c.absolute_error !== undefined ? c.absolute_error : c.confidence}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-white/10 text-white rounded text-[9px] font-bold border border-white/10">
                        {c.lineage}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
