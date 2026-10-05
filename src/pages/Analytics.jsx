import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Zap, Activity, Filter, Calendar as CalendarIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import { supabase } from '../lib/supabaseClient';

// Helper: parse a date string safely
function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// Helper: week label from a Date object
function weekLabel(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - d.getDay());
  return weekStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// Helper: "DD Mon" label
function dayLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function Analytics() {
  const [presetFilter, setPresetFilter] = useState('30DAYS');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [deptFilter, setDeptFilter] = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');

  // Raw fetched data
  const [dbBlocks, setDbBlocks] = useState([]);
  const [dbRequests, setDbRequests] = useState([]);
  const [dbHistory, setDbHistory] = useState([]);
  const [dbPredictions, setDbPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Re-run fetch when filters change so we always work with fresh data
  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [blocksRes, tmdRes, stRes, trdRes, histRes, predRes] = await Promise.all([
        supabase.from('optimized_blocks').select('*').order('created_at', { ascending: true }),
        supabase.from('tmd_requests').select('*').order('created_at', { ascending: true }),
        supabase.from('st_requests').select('*').order('created_at', { ascending: true }),
        supabase.from('trd_requests').select('*').order('created_at', { ascending: true }),
        supabase.from('historical_outcomes').select('*').order('created_at', { ascending: true }),
        supabase.from('ml_predictions').select('*').order('created_at', { ascending: true }),
      ]);

      setDbBlocks(blocksRes.data || []);
      const allReqs = [
        ...(tmdRes.data || []).map(r => ({ ...r, dept_label: 'TMD' })),
        ...(stRes.data || []).map(r => ({ ...r, dept_label: 'S&T' })),
        ...(trdRes.data || []).map(r => ({ ...r, dept_label: 'TRD' })),
      ];
      setDbRequests(allReqs);
      setDbHistory(histRes.data || []);
      setDbPredictions(predRes.data || []);
    } catch (err) {
      console.error('Error fetching analytics datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (preset) => {
    setPresetFilter(preset);
    const today = new Date();
    let start = new Date();

    if (preset === 'TODAY') {
      start = new Date(today);
    } else if (preset === '7DAYS') {
      start.setDate(today.getDate() - 7);
    } else if (preset === '30DAYS') {
      start.setDate(today.getDate() - 30);
    }

    if (preset !== 'CUSTOM') {
      setFromDate(start.toISOString().split('T')[0]);
      setToDate(today.toISOString().split('T')[0]);
    }
  };

  // ── Filter helpers ──────────────────────────────────────────────────
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  const inRange = (row) => {
    const d = parseDate(row.created_at || row.planning_date || row.maintenance_date);
    if (!d) return true; // include rows without dates rather than excluding
    return d >= from && d <= to;
  };

  const matchesDept = (row) => {
    if (deptFilter === 'ALL') return true;
    const dept = (row.department || row.dept_label || '').toUpperCase();
    return dept.includes(deptFilter.replace('&', '').trim());
  };

  const filteredBlocks = useMemo(() =>
    dbBlocks.filter(r => inRange(r) && matchesDept(r)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbBlocks, fromDate, toDate, deptFilter]
  );

  const filteredRequests = useMemo(() =>
    dbRequests.filter(r => inRange(r) && matchesDept(r)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbRequests, fromDate, toDate, deptFilter]
  );

  // ── Chart 1: Blocks created per week (stacked by status) ────────────
  const blockTrendData = useMemo(() => {
    if (filteredBlocks.length === 0) return [];
    const buckets = {};
    filteredBlocks.forEach(b => {
      const d = parseDate(b.created_at || b.planning_date);
      if (!d) return;
      const label = weekLabel(d);
      if (!buckets[label]) buckets[label] = { period: label, Scheduled: 0, Approved: 0, Completed: 0, Other: 0 };
      const status = (b.status || 'Other');
      if (['Scheduled', 'Approved', 'Completed'].includes(status)) {
        buckets[label][status] = (buckets[label][status] || 0) + 1;
      } else {
        buckets[label].Other += 1;
      }
    });
    return Object.values(buckets);
  }, [filteredBlocks]);

  // ── Chart 2: Requests by department ──────────────────────────────────
  const requestsByDeptData = useMemo(() => {
    const counts = { TMD: 0, 'S&T': 0, TRD: 0 };
    filteredRequests.forEach(r => {
      const dl = r.dept_label || '';
      if (dl in counts) counts[dl] += 1;
    });
    return Object.entries(counts).map(([dept, count]) => ({ dept, count }));
  }, [filteredRequests]);

  // ── Chart 3: Cumulative blocks saved over time ─────────────────────
  const cumulativeBlocksData = useMemo(() => {
    if (filteredBlocks.length === 0) return [];
    const sorted = [...filteredBlocks]
      .map(b => ({ ...b, _d: parseDate(b.created_at || b.planning_date) }))
      .filter(b => b._d)
      .sort((a, b) => a._d - b._d);

    const result = [];
    sorted.forEach((b, i) => {
      result.push({
        day: dayLabel(b._d),
        totalBlocks: i + 1,
        status: b.status || 'Scheduled',
      });
    });
    // Deduplicate same-day entries, keeping last
    const deduped = {};
    result.forEach(r => { deduped[r.day] = r; });
    return Object.values(deduped);
  }, [filteredBlocks]);

  // ── ML prediction history by model type ─────────────────────────────
  const predictionCountData = useMemo(() => {
    const counts = {};
    dbPredictions.forEach(p => {
      const mt = p.model_type || 'Unknown';
      counts[mt] = (counts[mt] || 0) + 1;
    });
    return Object.entries(counts).map(([model, count]) => ({ model, count }));
  }, [dbPredictions]);

  // ── Summary KPIs ────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    totalBlocks: filteredBlocks.length,
    approvedBlocks: filteredBlocks.filter(b => b.status === 'Approved').length,
    completedBlocks: filteredBlocks.filter(b => b.status === 'Completed').length,
    totalRequests: filteredRequests.length,
    pendingRequests: filteredRequests.filter(r => (r.status || '').toLowerCase().includes('pending')).length,
    sentToAI: filteredRequests.filter(r => (r.status || '').toLowerCase().includes('sent')).length,
  }), [filteredBlocks, filteredRequests]);

  const hasBlockData = filteredBlocks.length > 0;
  const hasRequestData = filteredRequests.length > 0;

  const EmptyState = ({ message }) => (
    <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
      <AlertTriangle className="w-8 h-8 opacity-40" />
      <p className="text-xs font-mono text-center max-w-xs">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 font-sans bg-white text-black">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9D9D9] rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#333333] font-bold uppercase mb-1">
            <BarChart3 className="w-4 h-4 text-black" />
            <span>LIVE OPERATIONAL ANALYTICS</span>
          </div>
          <h2 className="text-xl font-extrabold text-black tracking-tight">
            BLOCK SCHEDULE & DEPARTMENT PERFORMANCE ANALYTICS
          </h2>
          <p className="text-xs text-[#333333] max-w-3xl mt-1">
            Charts built from live Supabase records. Filters affect all charts in real time.
          </p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          disabled={loading}
          className="flex items-center gap-2 bg-black hover:bg-[#333333] text-white font-mono font-bold text-xs px-4 py-2.5 rounded-lg border border-black transition"
        >
          <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 border border-[#D9D9D9] bg-[#F5F5F5] space-y-3 font-mono text-xs shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-black" />
            <span className="font-bold text-black uppercase">DATE RANGE:</span>
            {['TODAY', '7DAYS', '30DAYS', 'CUSTOM'].map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all ${
                  presetFilter === preset
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-[#D9D9D9] hover:bg-[#F5F5F5]'
                }`}
              >
                {preset === 'TODAY' ? 'TODAY' : preset === '7DAYS' ? 'LAST 7 DAYS' : preset === '30DAYS' ? 'LAST 30 DAYS' : 'CUSTOM'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#333333]">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white border border-[#D9D9D9] rounded px-2.5 py-1 text-black font-mono text-xs focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="TMD">Track Management (TMD)</option>
              <option value="S&T">Signal & Telecom (S&T)</option>
              <option value="TRD">Traction Distribution (TRD)</option>
            </select>
          </div>
        </div>
        {presetFilter === 'CUSTOM' && (
          <div className="flex items-center gap-4 pt-2 border-t border-[#D9D9D9]">
            <div className="flex items-center gap-2">
              <span className="text-[#333333]">From Date:</span>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border border-[#D9D9D9] rounded px-2.5 py-1 text-black font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#333333]">To Date:</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="bg-white border border-[#D9D9D9] rounded px-2.5 py-1 text-black font-mono text-xs" />
            </div>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {[
          { label: 'Total Blocks', value: kpis.totalBlocks, color: 'text-black' },
          { label: 'Approved', value: kpis.approvedBlocks, color: 'text-black' },
          { label: 'Completed', value: kpis.completedBlocks, color: 'text-black' },
          { label: 'Total Requests', value: kpis.totalRequests, color: 'text-black' },
          { label: 'Pending', value: kpis.pendingRequests, color: 'text-black' },
          { label: 'Sent to AI', value: kpis.sentToAI, color: 'text-black' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#D9D9D9] rounded-xl p-3 text-center shadow-sm">
            <p className={`text-2xl font-extrabold ${kpi.color}`}>{loading ? '—' : kpi.value}</p>
            <p className="text-[#808080] text-[10px] uppercase mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Blocks per Week by Status */}
        <div className="rounded-xl p-5 border border-[#D9D9D9] bg-white space-y-3 font-mono text-xs shadow-sm">
          <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-2">
            <span className="font-bold text-black uppercase">1. OPTIMIZED BLOCKS PER WEEK (BY STATUS)</span>
            <span className="text-black font-bold">{filteredBlocks.length} blocks</span>
          </div>
          <div className="h-64 w-full">
            {hasBlockData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D9" />
                  <XAxis dataKey="period" stroke="#333333" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#333333" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D9', borderRadius: '8px', color: '#000000' }} />
                  <Legend />
                  <Bar dataKey="Scheduled" fill="#2563EB" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Approved" fill="#059669" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Completed" fill="#D97706" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Other" fill="#6B7280" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No optimized block records found for the selected date range and department filter." />
            )}
          </div>
        </div>

        {/* Chart 2: Maintenance Requests by Department */}
        <div className="rounded-xl p-5 border border-[#D9D9D9] bg-white space-y-3 font-mono text-xs shadow-sm">
          <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-2">
            <span className="font-bold text-black uppercase">2. MAINTENANCE REQUESTS BY DEPARTMENT</span>
            <span className="text-black font-bold">{filteredRequests.length} requests</span>
          </div>
          <div className="h-64 w-full">
            {hasRequestData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestsByDeptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D9" />
                  <XAxis type="number" stroke="#333333" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="dept" stroke="#333333" tick={{ fontSize: 10 }} width={40} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D9', borderRadius: '8px', color: '#000000' }} />
                  <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
                    {requestsByDeptData.map((entry, index) => {
                      const colors = { TMD: '#2563EB', 'S&T': '#0D9488', TRD: '#7C3AED' };
                      return <Cell key={`cell-dept-${index}`} fill={colors[entry.dept] || '#2563EB'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No maintenance request records found for the selected filters." />
            )}
          </div>
        </div>

        {/* Chart 3: Cumulative blocks over time */}
        <div className="rounded-xl p-5 border border-[#D9D9D9] bg-white space-y-3 font-mono text-xs shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-2">
            <span className="font-bold text-black uppercase">3. CUMULATIVE BLOCKS SCHEDULED OVER SELECTED DATE RANGE</span>
            <span className="text-black font-bold">{filteredBlocks.length} total</span>
          </div>
          <div className="h-64 w-full">
            {hasBlockData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeBlocksData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D9" />
                  <XAxis dataKey="day" stroke="#333333" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#333333" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D9', borderRadius: '8px', color: '#000000' }} />
                  <Area type="monotone" dataKey="totalBlocks" name="Cumulative Blocks" stroke="#2563EB" fill="rgba(37, 99, 235, 0.2)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No block records available. Schedule blocks via the AI Block Planner to populate this chart." />
            )}
          </div>
        </div>

        {/* Chart 4: ML Predictions by model type */}
        {dbPredictions.length > 0 && (
          <div className="rounded-xl p-5 border border-[#D9D9D9] bg-white space-y-3 font-mono text-xs shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-2">
              <span className="font-bold text-black uppercase">4. ML PREDICTION HISTORY BY MODEL TYPE</span>
              <span className="text-black font-bold">{dbPredictions.length} total predictions</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictionCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D9" />
                  <XAxis dataKey="model" stroke="#333333" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#333333" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9D9D9', borderRadius: '8px', color: '#000000' }} />
                  <Bar dataKey="count" name="Predictions" radius={[4, 4, 0, 0]}>
                    {predictionCountData.map((entry, index) => {
                      const palette = ['#0D9488', '#2563EB', '#7C3AED', '#D97706', '#059669', '#DC2626'];
                      return <Cell key={`cell-pred-${index}`} fill={palette[index % palette.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Data Source Note */}
      <div className="text-center font-mono text-[10px] text-[#808080] pb-4">
        All charts built from live Supabase tables: optimized_blocks · tmd_requests · st_requests · trd_requests · ml_predictions
        &nbsp;·&nbsp; Filters active: date {fromDate} → {toDate}, dept: {deptFilter}
      </div>
    </div>
  );
}

