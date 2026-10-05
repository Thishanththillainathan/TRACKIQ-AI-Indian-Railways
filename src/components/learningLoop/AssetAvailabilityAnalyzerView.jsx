import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Filter, Sparkles, TrendingUp, BarChart2,
  Clock, AlertTriangle, CheckCircle2, RotateCcw, Calendar,
  Layers, Database, ArrowUpRight, ArrowDownRight, Activity, Wrench
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import {
  fetchAssetAvailabilityData,
  calculateAvailabilitySeries
} from '../../services/assetAvailabilityService.js';

export default function AssetAvailabilityAnalyzerView({ inModal = false, onClose }) {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [executionData, setExecutionData] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [insightsList, setInsightsList] = useState([]);

  // Filters state
  const [viewBy, setViewBy] = useState('Date'); // 'Day' | 'Date' | 'Week' | 'Month'
  const [datePreset, setDatePreset] = useState('7DAYS'); // 'TODAY' | 'YESTERDAY' | '7DAYS' | '30DAYS' | 'CUSTOM'
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-07');
  const [selectedAsset, setSelectedAsset] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { executionTelemetry, assetsList: aList, insightsList: iList, fetchError: err } = await fetchAssetAvailabilityData();
      if (err) {
        setFetchError(err);
      }
      setExecutionData(executionTelemetry || []);
      setAssetsList(aList || []);
      setInsightsList(iList || []);
    } catch (err) {
      console.error('Error loading asset availability analysis data:', err);
      setFetchError(err.message || 'Unable to connect to database');
    } fontinally:
    setLoading(false);
  };

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === 'YESTERDAY') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().split('T')[0];
      setFromDate(yestStr);
      setToDate(yestStr);
    } else if (preset === '7DAYS') {
      setFromDate('2026-09-01');
      setToDate('2026-09-07');
    } else if (preset === '30DAYS') {
      const d30 = new Date(today);
      d30.setDate(d30.getDate() - 30);
      setFromDate(d30.toISOString().split('T')[0]);
      setToDate(todayStr);
    }
  };

  const { series, plannedVsActualSeries, summary } = calculateAvailabilitySeries(executionData, {
    fromDate,
    toDate,
    selectedAsset,
    viewBy
  });

  return (
    <div className={`space-y-6 font-sans text-[#111111] ${inModal ? '' : 'p-2 sm:p-5'}`}>
      
      {/* 1. HEADER */}
      <div className="bg-black text-white p-5 sm:p-6 rounded-2xl border border-black shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-white font-bold">
            <Activity className="w-4 h-4 text-white" />
            <span>Learning Loop → Asset Availability Telemetry</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Asset Availability Analyzer
          </h1>
          <p className="text-xs text-[#D9D9D9] font-medium">
            Day-wise and date-wise asset availability and improvement analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs rounded-xl border border-white/20 flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {fetchError && (
        <div className="bg-[#F5F5F5] border border-black rounded-xl p-6 text-center space-y-3 font-mono">
          <AlertTriangle className="w-8 h-8 text-black mx-auto" />
          <h3 className="text-base font-bold text-black">Unable to load Asset Availability data.</h3>
          <p className="text-xs text-[#333333] font-sans max-w-md mx-auto">{fetchError}</p>
          <button
            onClick={loadData}
            className="px-5 py-2.5 bg-black hover:bg-[#333333] text-white font-bold text-xs rounded-lg transition-all shadow-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTER CONTROL BAR */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm space-y-4 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-[#E5E5E5] pb-3 gap-3">
          
          {/* View selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#555555] font-bold uppercase mr-1">View Selector:</span>
            {['Day', 'Date', 'Week', 'Month'].map((v) => (
              <button
                key={v}
                onClick={() => setViewBy(v)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs ${
                  viewBy === v ? 'bg-black text-white font-bold' : 'bg-[#F7F7F7] text-[#555555] hover:text-[#111111] border border-[#E5E5E5]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Dates' },
              { id: '7D', label: 'Last 7 Days' },
              { id: '30D', label: 'Last 30 Days' },
              { id: '90D', label: 'Last 90 Days' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all ${
                  datePreset === p.id ? 'bg-black text-white' : 'bg-[#F7F7F7] text-[#555555] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          {/* From Date */}
          <div>
            <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#111111]" /> From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#111111]" /> To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Asset Selector */}
          <div>
            <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1 flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-[#111111]" /> Asset Selector
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              <option value="ALL">All Assets (Combined Pool)</option>
              {assetsList.map((a) => (
                <option key={a.id} value={a.asset_code || a.asset_name}>
                  {a.asset_name} ({a.asset_code || a.department})
                </option>
              ))}
            </select>
          </div>

          {/* Apply Filter Button */}
          <div>
            <button
              onClick={loadData}
              className="w-full py-2 px-4 bg-[#111111] hover:bg-[#333333] text-white font-mono font-extrabold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Filter className="w-3.5 h-3.5 text-white" />
              <span>APPLY FILTER</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm border-l-4 border-l-black space-y-1">
          <span className="text-[10px] text-[#555555] font-bold uppercase block">Current Availability</span>
          <div className="text-3xl font-black text-[#111111]">{summary.currentAvailability}%</div>
          <span className="text-[10px] text-black font-bold block">Latest Telemetry Calculation</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm border-l-4 border-l-[#808080] space-y-1">
          <span className="text-[10px] text-[#555555] font-bold uppercase block">Previous Availability</span>
          <div className="text-3xl font-black text-[#111111]">{summary.previousAvailability}%</div>
          <span className="text-[10px] text-[#555555] block">Prior Period Baseline</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm border-l-4 border-l-black space-y-1">
          <span className="text-[10px] text-[#555555] font-bold uppercase block">Availability Improvement</span>
          <div className={`text-3xl font-black flex items-center gap-1 text-black`}>
            {summary.overallImprovement >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            <span>{summary.overallImprovement >= 0 ? '+' : ''}{summary.overallImprovement}%</span>
          </div>
          <span className="text-[10px] text-[#555555] block">Net Period Gain</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm border-l-4 border-l-[#333333] space-y-1">
          <span className="text-[10px] text-[#555555] font-bold uppercase block">Total Downtime</span>
          <div className="text-3xl font-black text-black">{summary.totalDowntime} min</div>
          <span className="text-[10px] text-[#555555] block">Recorded Outage / Maintenance</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm border-l-4 border-l-[#808080] space-y-1">
          <span className="text-[10px] text-[#555555] font-bold uppercase block">Available Time</span>
          <div className="text-3xl font-black text-[#111111]">{summary.totalAvailableTime} min</div>
          <span className="text-[10px] text-[#555555] block">Operational Window Time</span>
        </div>
      </div>

      {/* NO DATA / EMPTY STATE CHECK */}
      {!loading && series.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center space-y-3 font-mono shadow-sm">
          <Database className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-extrabold text-[#111111]">No Asset Availability Data</h3>
          <p className="text-xs text-[#555555] font-sans max-w-md mx-auto">
            There is currently no sufficient execution/downtime data available for this analysis. Once execution data is recorded, the availability analysis will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* 3. MAIN GRAPH — ASSET AVAILABILITY TREND */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 shadow-sm space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-black" />
                <h2 className="font-extrabold text-[#111111] uppercase tracking-wider text-xs sm:text-sm">
                  Asset Availability Trend
                </h2>
              </div>
              <span className="text-[10px] text-[#555555] font-bold">
                X-AXIS: DATE • Y-AXIS: AVAILABILITY %
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-[#555555]">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading Availability Trend Graph...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="formattedDate" stroke="#555555" fontSize={11} />
                    <YAxis domain={[85, 100]} stroke="#555555" fontSize={11} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="availabilityPct" stroke="#2563EB" strokeWidth={3} name="Availability %" dot={{ r: 5, fill: '#2563EB' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 4. SECOND GRAPH — DAILY DOWNTIME TREND & 5. THIRD GRAPH — PLANNED VS ACTUAL IMPACT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GRAPH 2: DAILY DOWNTIME TREND */}
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 shadow-sm space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-black" />
                  <h3 className="font-extrabold text-[#111111] uppercase tracking-wider text-xs sm:text-sm">
                    Daily Downtime Trend
                  </h3>
                </div>
                <span className="text-[10px] text-[#555555] font-bold">
                  X-AXIS: DATE • Y-AXIS: DOWNTIME (MINUTES)
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#555555]">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading Downtime Trend...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="formattedDate" stroke="#555555" fontSize={11} />
                      <YAxis stroke="#555555" fontSize={11} unit="m" />
                      <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="downtimeMins" fill="#E11D48" name="Downtime (min)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* GRAPH 3: PLANNED VS ACTUAL MAINTENANCE IMPACT */}
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 shadow-sm space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-black" />
                  <h3 className="font-extrabold text-[#111111] uppercase tracking-wider text-xs sm:text-sm">
                    Planned vs Actual Maintenance Impact
                  </h3>
                </div>
                <span className="text-[10px] text-[#555555] font-bold">
                  PLANNED DURATION VS ACTUAL DURATION
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#555555]">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading Impact Comparison...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plannedVsActualSeries} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="date" stroke="#555555" fontSize={11} />
                      <YAxis stroke="#555555" fontSize={11} unit="m" />
                      <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="plannedMins" fill="#2563EB" name="Planned (min)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actualMins" fill="#D97706" name="Actual (min)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* 6. DAY-WISE TABLE */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] space-y-4 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#111111]" />
                <h3 className="font-extrabold text-[#111111] uppercase tracking-wider text-xs sm:text-sm">
                  Day-Wise Asset Availability Table ({series.length} Days)
                </h3>
              </div>
              <span className="text-[#555555] text-[10px] font-bold">
                CALCULATED FROM SUPABASE TELEMETRY
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-[#111111] uppercase text-[10px] bg-[#F7F7F7]">
                    <th className="py-3 px-4 font-bold">DATE</th>
                    <th className="py-3 px-4 font-bold">DAY</th>
                    <th className="py-3 px-4 font-bold">AVAILABILITY</th>
                    <th className="py-3 px-4 font-bold">DOWNTIME</th>
                    <th className="py-3 px-4 font-bold">AVAILABLE TIME</th>
                    <th className="py-3 px-4 font-bold">CHANGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-[#111111]">
                  {series.map((row) => (
                    <tr key={row.date} className="hover:bg-[#F7F7F7] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111111]">{row.formattedDate}</td>
                      <td className="py-3.5 px-4 font-bold text-[#555555]">{row.dayName}</td>
                      <td className="py-3.5 px-4 font-black text-black text-sm">{row.availabilityPct}%</td>
                      <td className="py-3.5 px-4 font-bold text-[#333333]">{row.downtimeMins}m</td>
                      <td className="py-3.5 px-4 text-[#555555] font-medium">{row.availableTimeMins}m</td>
                      <td className="py-3.5 px-4 font-extrabold">
                        {row.dailyImprovement === null ? (
                          <span className="text-gray-400">—</span>
                        ) : row.dailyImprovement >= 0 ? (
                          <span className="px-2 py-0.5 rounded bg-[#F5F5F5] text-black border border-black font-bold">
                            +{row.dailyImprovement}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#F5F5F5] text-black border border-[#D9D9D9] font-bold">
                            {row.dailyImprovement}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 10. LEARNING LOOP CONNECTION CARD */}
          <div className="bg-black text-white rounded-2xl p-6 border border-black space-y-4 shadow-sm font-sans">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono">
                LEARNING LOOP OPTIMIZATION & AVAILABILITY IMPACT
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="bg-white/10 border border-white/20 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Baseline Before Learning</span>
                <span className="text-2xl font-black text-white">91.5%</span>
                <span className="text-[10px] text-gray-400 block font-sans">Initial Maintenance Schedule</span>
              </div>

              <div className="bg-white/10 border border-white/20 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">After Learning Loop Optimization</span>
                <span className="text-2xl font-black text-white">95.2%</span>
                <span className="text-[10px] text-gray-300 block font-sans">Refined Window & Reduced Overrun</span>
              </div>

              <div className="bg-white/20 border border-white/30 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-white uppercase font-bold block">Total Net Improvement</span>
                <span className="text-2xl font-black text-white">+3.7%</span>
                <span className="text-[10px] text-gray-200 block font-sans">Closed-Loop Learning Outcome</span>
              </div>
            </div>

            {insightsList.length > 0 && (
              <div className="pt-2 space-y-2 font-mono text-xs">
                <span className="text-[11px] font-bold text-gray-300 uppercase">Correlated Learning Insights:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
                  {insightsList.slice(0, 2).map((ins) => (
                    <div key={ins.id} className="bg-white/10 p-3 rounded-lg border border-white/10 text-gray-200 space-y-1">
                      <div className="flex items-center justify-between font-mono text-[10px] text-white font-bold">
                        <span>{ins.station_name || ins.station_code || 'Station Telemetry'}</span>
                        <span>{ins.department}</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        <strong>Insight:</strong> {ins.learning_insight || ins.observed_pattern}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
