import React, { useState, useEffect } from 'react';
import {
  X, RefreshCw, Filter, Sparkles, TrendingUp, BarChart2,
  Clock, AlertTriangle, CheckCircle2, RotateCcw, Save,
  ChevronRight, Layers, FileText, Database, ArrowUpRight,
  ArrowDownRight, Check, Search, Calendar, MapPin
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell
} from 'recharts';
import {
  fetchActualVsPlannedRecords,
  filterRecords,
  computeDashboardMetrics,
  buildChartData,
  generateAIPatternAnalysis,
  generateStructuredLearningInsights,
  saveInsightToSupabase
} from '../../services/actualVsPlannedAnalyzer';

export default function ActualVsPlannedAnalyzerModal({ isOpen, onClose, onInsightSaved }) {
  const [rawRecords, setRawRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatusMap, setSaveStatusMap] = useState({});

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: 'ALL',
    station: 'ALL',
    department: 'ALL',
    delayCategory: 'ALL',
    status: 'ALL',
    searchQuery: ''
  });

  // Chart View State
  const [activeChartTab, setActiveChartTab] = useState('DURATION'); // 'DURATION' | 'TREND' | 'STATION' | 'CATEGORY'
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchActualVsPlannedRecords();
      setRawRecords(data);
    } catch (err) {
      console.error('Failed to load actual vs planned records:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filtered dataset
  const filteredData = filterRecords(rawRecords, filters);
  const metrics = computeDashboardMetrics(filteredData);
  const chartData = buildChartData(filteredData);
  const aiAnalysis = generateAIPatternAnalysis(filteredData);
  const learningInsights = generateStructuredLearningInsights(filteredData);

  // Extract unique station codes / names for filter dropdown
  const uniqueStations = Array.from(
    new Set(rawRecords.map((r) => r.stationCode || r.stationName).filter(Boolean))
  );

  const handleSaveInsight = async (insight) => {
    setSaveStatusMap((prev) => ({ ...prev, [insight.id]: 'saving' }));
    const result = await saveInsightToSupabase(insight);
    if (result.success) {
      setSaveStatusMap((prev) => ({ ...prev, [insight.id]: 'saved' }));
      if (onInsightSaved) onInsightSaved();
    } else {
      setSaveStatusMap((prev) => ({ ...prev, [insight.id]: 'error' }));
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'On Time':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'Early Completion':
        return 'bg-blue-50 text-blue-800 border-blue-300 font-bold';
      case 'Minor Delay':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      case 'Major Delay':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
      case 'Overrun':
        return 'bg-red-100 text-red-900 border-red-400 font-extrabold';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-[#111111]">

        {/* TOP MODAL HEADER */}
        <div className="bg-[#111111] text-white p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <RotateCcw className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                <span>Learning Loop Feature</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Database Connected
                </span>
              </div>
              <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                Actual Data vs Planned Data Analyzer
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold rounded-lg border border-white/20 flex items-center gap-2 transition-all"
              title="Refresh Data from Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#FAFAFA]">

          {/* FILTER BAR */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider">
                <Filter className="w-4 h-4 text-[#111111]" />
                <span>Analyzer Filters & Search Controls</span>
              </div>
              <button
                onClick={() => setFilters({
                  dateRange: 'ALL',
                  station: 'ALL',
                  department: 'ALL',
                  delayCategory: 'ALL',
                  status: 'ALL',
                  searchQuery: ''
                })}
                className="text-[11px] font-medium text-[#555555] hover:text-[#111111] underline"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Date Range Filter */}
              <div>
                <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#111111]" /> Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="ALL">All Available Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="7DAYS">Last 7 Days</option>
                  <option value="30DAYS">Last 30 Days</option>
                </select>
              </div>

              {/* Station Filter */}
              <div>
                <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#111111]" /> Station
                </label>
                <select
                  value={filters.station}
                  onChange={(e) => setFilters({ ...filters, station: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="ALL">All Stations</option>
                  {uniqueStations.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1">
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="ALL">All Departments</option>
                  <option value="TRACK">Track (TMD)</option>
                  <option value="S&T">Signal & Telecom (S&T)</option>
                  <option value="TRD">Traction Distribution (TRD)</option>
                </select>
              </div>

              {/* Delay Category Filter */}
              <div>
                <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1">
                  Delay Category
                </label>
                <select
                  value={filters.delayCategory}
                  onChange={(e) => setFilters({ ...filters, delayCategory: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="ALL">All Categories</option>
                  <option value="On Time">On Time (±5 min)</option>
                  <option value="Minor Delay">Minor Delay (5-20 min)</option>
                  <option value="Major Delay">Major Delay (20-45 min)</option>
                  <option value="Overrun">Overrun (&gt;45 min)</option>
                  <option value="Early Completion">Early Completion (&lt;-5 min)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ACTIVE">Active / In-Progress</option>
                </select>
              </div>

              {/* Search Query */}
              <div>
                <label className="block text-[10px] text-[#555555] font-bold uppercase mb-1 flex items-center gap-1">
                  <Search className="w-3 h-3 text-[#111111]" /> Search Problem/Block
                </label>
                <input
                  type="text"
                  placeholder="e.g. CBE, Point Machine..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-2 font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>
          </div>

          {/* 1. SUMMARY CARDS DASHBOARD */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
            {[
              { label: "TOTAL PLANNED", value: metrics.totalPlanned, icon: Calendar, color: "border-l-4 border-l-blue-600" },
              { label: "TOTAL ACTUAL", value: metrics.totalActual, icon: Database, color: "border-l-4 border-l-purple-600" },
              { label: "SUCCESSFUL", value: metrics.successfullyCompleted, icon: CheckCircle2, color: "border-l-4 border-l-emerald-600" },
              { label: "DELAYED", value: metrics.delayed, icon: Clock, color: "border-l-4 border-l-amber-500" },
              { label: "OVERRUN", value: metrics.overrun, icon: AlertTriangle, color: "border-l-4 border-l-rose-600" },
              {
                label: "AVG VARIANCE",
                value: `${metrics.avgTimeVariance > 0 ? '+' : ''}${metrics.avgTimeVariance} min`,
                icon: RotateCcw,
                color: metrics.avgTimeVariance > 0 ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-emerald-500"
              },
              {
                label: "AVG PERF %",
                value: `${metrics.avgPerformancePct}%`,
                icon: TrendingUp,
                color: metrics.avgPerformancePct >= 90 ? "border-l-4 border-l-emerald-600" : "border-l-4 border-l-amber-600"
              },
              { label: "DATA MATCH %", value: `${metrics.dataMatchPct}%`, icon: Layers, color: "border-l-4 border-l-cyan-600" }
            ].map((card, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-3 border border-[#E5E5E5] shadow-sm flex flex-col justify-between ${card.color}`}>
                <div className="flex items-center justify-between text-[10px] text-[#555555] font-bold uppercase">
                  <span>{card.label}</span>
                  <card.icon className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <div className="text-base font-extrabold text-[#111111] mt-1">
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* 2. INTERACTIVE CHARTS DASHBOARD */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-sm space-y-4 font-mono">
            <div className="flex flex-wrap items-center justify-between border-b border-[#E5E5E5] pb-3 gap-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#111111]" />
                <h3 className="font-bold text-[#111111] uppercase tracking-wider text-xs">
                  VISUAL PERFORMANCE & VARIANCE ANALYZER CHARTS
                </h3>
              </div>

              {/* Chart Tab Switcher */}
              <div className="flex items-center bg-[#F7F7F7] p-1 rounded-lg border border-[#E5E5E5] text-[11px] font-bold">
                {[
                  { id: 'DURATION', label: 'Planned vs Actual Duration' },
                  { id: 'TREND', label: 'Delay & Performance Trend' },
                  { id: 'STATION', label: 'Station-wise Variance' },
                  { id: 'CATEGORY', label: 'Delay Classification' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChartTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      activeChartTab === tab.id
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'text-[#555555] hover:text-[#111111]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CHART RENDERER */}
            <div className="h-72 w-full pt-2">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-[#555555]">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading Chart Telemetry...
                </div>
              ) : filteredData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#555555]">
                  No matching maintenance records found for the current filters.
                </div>
              ) : activeChartTab === 'DURATION' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.durationChart} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="name" stroke="#555555" fontSize={11} />
                    <YAxis stroke="#555555" fontSize={11} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="planned" fill="#3B82F6" name="Planned Duration (min)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" fill="#10B981" name="Actual Duration (min)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : activeChartTab === 'TREND' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.trendChart} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="date" stroke="#555555" fontSize={11} />
                    <YAxis stroke="#555555" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="avgPerformance" stroke="#10B981" strokeWidth={2} name="Avg Performance %" />
                    <Line type="monotone" dataKey="avgVariance" stroke="#EF4444" strokeWidth={2} name="Avg Time Variance (min)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : activeChartTab === 'STATION' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.stationVarianceChart} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="station" stroke="#555555" fontSize={11} />
                    <YAxis stroke="#555555" fontSize={11} label={{ value: 'Avg Variance (min)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="avgVariance" fill="#F59E0B" name="Avg Variance (min)" radius={[4, 4, 0, 0]}>
                      {chartData.stationVarianceChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avgVariance > 10 ? '#EF4444' : entry.avgVariance > 0 ? '#F59E0B' : '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.categoryChart} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="category" stroke="#555555" fontSize={11} />
                    <YAxis stroke="#555555" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#6366F1" name="Number of Blocks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 3. AI ANALYSIS & PATTERN DETECTION PANEL */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] space-y-4 shadow-sm font-sans">
            <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
              <div className="p-1.5 bg-[#111111] text-white rounded-lg">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#111111] text-sm uppercase tracking-tight">
                  AI PATTERN ANALYSIS & ROOT CAUSE DIAGNOSTICS
                </h3>
                <p className="text-xs text-[#555555]">
                  Automated pattern recognition operating directly over actual database execution telemetry.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-1.5">
                <span className="text-[10px] text-[#555555] font-bold uppercase block">Frequent Overshoots</span>
                <p className="text-xs text-[#111111] font-semibold">{aiAnalysis.frequentExceeding}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-1.5">
                <span className="text-[10px] text-[#555555] font-bold uppercase block">Repeated Delay Stations</span>
                <p className="text-xs text-[#111111] font-semibold">{aiAnalysis.repeatedStationDelays}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-1.5">
                <span className="text-[10px] text-[#555555] font-bold uppercase block">Time-Consuming Failures</span>
                <p className="text-xs text-[#111111] font-semibold">{aiAnalysis.timeConsumingFailures}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-1.5">
                <span className="text-[10px] text-[#555555] font-bold uppercase block">Planning Inaccuracies</span>
                <p className="text-xs text-[#111111] font-semibold">{aiAnalysis.inaccuratePlanAreas}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-1.5">
                <span className="text-[10px] text-[#555555] font-bold uppercase block">Early Completions</span>
                <p className="text-xs text-[#111111] font-semibold">{aiAnalysis.fasterCompletions}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#111111] bg-[#111111] text-white space-y-1.5">
                <span className="text-[10px] text-amber-300 font-bold uppercase block">Recommended Planning Change</span>
                <p className="text-xs text-white font-medium">{aiAnalysis.futureRecommendations}</p>
              </div>
            </div>
          </div>

          {/* 4. LEARNING LOOP INTEGRATION & RECOMMENDATIONS CARDS */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] space-y-4 shadow-sm font-mono">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#111111]" />
                <h3 className="font-bold text-[#111111] uppercase tracking-wider text-xs">
                  LEARNING LOOP FEEDBACK INSIGHTS & FUTURE PLANNING ADJUSTMENTS ({learningInsights.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#555555] font-bold">
                FORMAT: PATTERN → PLANNED → ACTUAL → VARIANCE → ROOT CAUSE → LEARNING → RECOMMENDATION
              </span>
            </div>

            {learningInsights.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#555555]">
                No structured learning insights generated for current selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningInsights.map((insight) => {
                  const status = saveStatusMap[insight.id];
                  return (
                    <div key={insight.id} className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-3 shadow-sm flex flex-col justify-between">
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                          <span className="font-bold text-[#111111] uppercase">{insight.observedPattern}</span>
                          <span className="px-2 py-0.5 rounded bg-[#F7F7F7] border border-[#E5E5E5] text-[10px] font-bold">
                            Perf: {insight.performancePct}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-[#F7F7F7] p-2 rounded-lg text-[11px]">
                          <div>
                            <span className="text-[#555555] text-[9px] uppercase font-bold block">Planned</span>
                            <span className="font-bold text-[#111111]">{insight.plannedValue}</span>
                          </div>
                          <div>
                            <span className="text-[#555555] text-[9px] uppercase font-bold block">Actual</span>
                            <span className="font-bold text-[#111111]">{insight.actualValue}</span>
                          </div>
                          <div>
                            <span className="text-[#555555] text-[9px] uppercase font-bold block">Variance</span>
                            <span className={`font-bold ${insight.variance.includes('+') ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {insight.variance}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] font-sans">
                          <p className="text-[#555555]">
                            <strong className="text-[#111111] font-mono font-bold text-[10px] uppercase">Root Cause: </strong>
                            {insight.rootCause}
                          </p>
                          <p className="text-[#555555]">
                            <strong className="text-[#111111] font-mono font-bold text-[10px] uppercase">Learning: </strong>
                            {insight.learning}
                          </p>
                          <div className="p-2.5 rounded-lg bg-[#111111] text-white font-mono text-[11px] space-y-1">
                            <span className="text-amber-300 font-bold text-[10px] uppercase block">Recommended Planning Adjustment:</span>
                            <p className="font-medium text-white">{insight.recommendedAdjustment}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          onClick={() => handleSaveInsight(insight)}
                          disabled={status === 'saved' || status === 'saving'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                            status === 'saved'
                              ? 'bg-emerald-600 text-white'
                              : status === 'saving'
                              ? 'bg-gray-400 text-white'
                              : 'bg-[#111111] hover:bg-[#333333] text-white shadow-sm'
                          }`}
                        >
                          {status === 'saved' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Saved to Learning DB</span>
                            </>
                          ) : status === 'saving' ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Insight to Learning DB</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. DETAILED COMPARISON TABLE */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] space-y-4 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#111111]" />
                <h4 className="font-bold text-[#111111] uppercase tracking-wider text-xs">
                  PLANNED VS ACTUAL MAINTENANCE RECORDS ({filteredData.length} TOTAL)
                </h4>
              </div>
              <span className="text-[#555555] text-[10px] font-bold">
                FETCHED FROM SUPABASE <code className="text-[#111111]">execution_monitor</code> & <code className="text-[#111111]">optimized_blocks</code>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-[#111111] uppercase text-[10px] bg-[#F7F7F7]">
                    <th className="py-2.5 px-3 font-bold">BLOCK / REQ ID</th>
                    <th className="py-2.5 px-3 font-bold">STATION</th>
                    <th className="py-2.5 px-3 font-bold">DEPT</th>
                    <th className="py-2.5 px-3 font-bold">PLANNED WINDOW</th>
                    <th className="py-2.5 px-3 font-bold">ACTUAL WINDOW</th>
                    <th className="py-2.5 px-3 font-bold">PLANNED MINS</th>
                    <th className="py-2.5 px-3 font-bold">ACTUAL MINS</th>
                    <th className="py-2.5 px-3 font-bold">VARIANCE</th>
                    <th className="py-2.5 px-3 font-bold">PERF %</th>
                    <th className="py-2.5 px-3 font-bold">DELAY CATEGORY</th>
                    <th className="py-2.5 px-3 font-bold">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-[#111111]">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-8 text-center text-[#555555] text-xs">
                        No maintenance comparison records match your current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-[#F7F7F7] transition-colors cursor-pointer" onClick={() => setExpandedRowId(expandedRowId === item.id ? null : item.id)}>
                          <td className="py-3 px-3 font-bold text-[#111111]">{item.blockId}</td>
                          <td className="py-3 px-3 text-[#555555] font-medium">{item.stationName} ({item.stationCode})</td>
                          <td className="py-3 px-3 font-bold text-[#111111]">{item.department}</td>
                          <td className="py-3 px-3 text-[#555555] font-medium">{item.plannedStart} - {item.plannedEnd}</td>
                          <td className="py-3 px-3 font-bold text-[#111111]">{item.actualStart} - {item.actualEnd}</td>
                          <td className="py-3 px-3 font-bold text-[#111111]">{item.plannedDuration !== null ? `${item.plannedDuration}m` : 'N/A'}</td>
                          <td className="py-3 px-3 font-bold text-[#111111]">{item.actualDuration !== null ? `${item.actualDuration}m` : 'N/A'}</td>
                          <td className={`py-3 px-3 font-extrabold ${item.timeVariance > 0 ? 'text-rose-600' : item.timeVariance < 0 ? 'text-emerald-600' : 'text-[#111111]'}`}>
                            {item.timeVariance !== null ? `${item.timeVariance > 0 ? '+' : ''}${item.timeVariance}m` : 'N/A'}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#111111]">
                            {item.performancePct !== null ? `${item.performancePct}%` : 'N/A'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded border text-[10px] ${getCategoryBadgeClass(item.delayCategory)}`}>
                              {item.delayCategory}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRowId(expandedRowId === item.id ? null : item.id);
                              }}
                              className="text-[10px] font-bold text-[#111111] hover:underline flex items-center gap-1"
                            >
                              <span>{expandedRowId === item.id ? 'Hide' : 'Inspect'}</span>
                              <ChevronRight className={`w-3 h-3 transition-transform ${expandedRowId === item.id ? 'rotate-90' : ''}`} />
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDABLE ROW DRAWER */}
                        {expandedRowId === item.id && (
                          <tr className="bg-[#F7F7F7]">
                            <td colSpan="11" className="p-4 border-b border-[#E5E5E5]">
                              <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] space-y-3 font-sans text-xs">
                                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 font-mono">
                                  <span className="font-bold text-[#111111] uppercase">Activity Telemetry Breakdown • ID: {item.activityId}</span>
                                  <span className="text-[#555555] text-[11px]">Request: {item.requestId}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <span className="font-mono text-[10px] text-[#555555] font-bold uppercase block">Problem / Failure Description</span>
                                    <p className="text-[#111111] font-medium mt-0.5">{item.problemFound}</p>
                                  </div>
                                  <div>
                                    <span className="font-mono text-[10px] text-[#555555] font-bold uppercase block">Action Taken</span>
                                    <p className="text-[#111111] font-medium mt-0.5">{item.actionTaken}</p>
                                  </div>
                                  <div>
                                    <span className="font-mono text-[10px] text-[#555555] font-bold uppercase block">Reason for Deviation</span>
                                    <p className="text-rose-700 font-semibold mt-0.5">{item.reasonForDeviation}</p>
                                  </div>
                                </div>
                                <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between font-mono text-[11px] text-[#555555]">
                                  <span>Resources Assigned: <strong className="text-[#111111]">{item.resources}</strong></span>
                                  <span>Completion Status: <strong className="text-[#111111] uppercase">{item.status}</strong></span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white border-t border-[#E5E5E5] p-4 flex items-center justify-between font-mono text-xs">
          <div className="text-[#555555] flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#111111]" />
            <span>Actual Data vs Planned Data Analyzer • Closed-Loop Telemetry Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-bold rounded-lg shadow-sm transition-all"
          >
            CLOSE ANALYZER
          </button>
        </div>

      </div>
    </div>
  );
}
