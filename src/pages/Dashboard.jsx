import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import {
  Building2,
  Grid,
  MapPin,
  Wrench,
  FileText,
  Calendar,
  TrainTrack,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Layers,
  ChevronDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap,
  RadioTower,
  HardHat,
  Search,
  Sliders,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

import RailwayNetworkMap from '../components/RailwayNetworkMap';
import RailwayWorkManager from '../components/RailwayWorkManager';
import { supabase } from '../lib/supabaseClient';
import { useRailwayNetwork } from '../context/RailwayNetworkContext';
import { getNetworkKPIs } from '../services/railwayNetworkService';

// Dummy overview line chart data
const overviewLineData = [
  { time: '08:00', price: 23800 },
  { time: '10:00', price: 24100 },
  { time: '12:00', price: 23950 },
  { time: '14:00', price: 24400 },
  { time: '16:00', price: 24250 },
  { time: '18:00', price: 24657.09 },
  { time: '20:00', price: 24500 },
];

// Monthly General Statistics Combo Data (Jan - Dec)
const monthlyStatsData = [
  { month: 'Jan', maintenance: 420, engineering: 350, operations: 230 },
  { month: 'Feb', maintenance: 380, engineering: 320, operations: 210 },
  { month: 'Mar', maintenance: 450, engineering: 390, operations: 260 },
  { month: 'Apr', maintenance: 510, engineering: 440, operations: 290 },
  { month: 'May', maintenance: 480, engineering: 410, operations: 270 },
  { month: 'Jun', maintenance: 540, engineering: 460, operations: 310 },
  { month: 'Jul', maintenance: 600, engineering: 520, operations: 350 },
  { month: 'Aug', maintenance: 570, engineering: 490, operations: 330 },
  { month: 'Sep', maintenance: 630, engineering: 550, operations: 370 },
  { month: 'Oct', maintenance: 590, engineering: 510, operations: 340 },
  { month: 'Nov', maintenance: 660, engineering: 580, operations: 390 },
  { month: 'Dec', maintenance: 710, engineering: 620, operations: 420 },
];

// Department Dominance Pie Data (visionOS Colors: Lime, Orange, Red, Purple, Teal)
const dominanceData = [
  { name: 'Track Mgmt (TMS)', value: 42, color: '#C6F432' },
  { name: 'Signal & Telecom (S&T)', value: 24, color: '#FF8A00' },
  { name: 'Traction (TRD)', value: 18, color: '#FF4D4D' },
  { name: 'Rolling Stock', value: 10, color: '#A855F7' },
  { name: 'Interlocking & Safety', value: 6, color: '#14B8A6' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeView } = useRailwayNetwork();
  const networkKPIs = getNetworkKPIs();

  // Interactive Wallet-style Segment Toggle
  const [walletTab, setWalletTab] = useState('planned'); // 'planned' or 'active'
  const [selectedDept, setSelectedDept] = useState('TMS');
  const [historyFilter, setHistoryFilter] = useState('ALL');

  const [dbStats, setDbStats] = useState({
    totalZones: networkKPIs.totalZones,
    totalDivisions: networkKPIs.totalDivisions,
    totalStations: networkKPIs.totalStations,
    totalAssets: 49031,
    activeRequests: 142,
    todaysBlocks: 28,
    trainsOperatingNow: 2859,
    assetAvailability: 98.4
  });

  const [recentBlocks, setRecentBlocks] = useState([]);

  useEffect(() => {
    fetchLiveStats();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('dashboard_vision_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'optimized_blocks' }, fetchLiveStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'block_schedules' }, fetchLiveStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLiveStats = async () => {
    try {
      const { count: tmdAssetCount } = await supabase.from('tmd_assets').select('*', { count: 'exact', head: true });
      const { count: stAssetCount } = await supabase.from('st_assets').select('*', { count: 'exact', head: true });
      const { count: trdAssetCount } = await supabase.from('trd_assets').select('*', { count: 'exact', head: true });
      const { count: genericAssetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true });

      const totalAssets = (tmdAssetCount || 0) + (stAssetCount || 0) + (trdAssetCount || 0) + (genericAssetCount || 0);

      const { count: trackReq } = await supabase.from('track_requests').select('*', { count: 'exact', head: true });
      const { count: stReq } = await supabase.from('st_requests').select('*', { count: 'exact', head: true });
      const { count: trdReq } = await supabase.from('trd_requests').select('*', { count: 'exact', head: true });
      const { count: tmdReq } = await supabase.from('tmd_requests').select('*', { count: 'exact', head: true });
      
      const totalRequestsCount = (trackReq || 0) + (stReq || 0) + (trdReq || 0) + (tmdReq || 0);

      const { count: optBlocksCount } = await supabase.from('optimized_blocks').select('*', { count: 'exact', head: true });
      const { count: blkSchedCount } = await supabase.from('block_schedules').select('*', { count: 'exact', head: true });

      const totalBlocksCount = (optBlocksCount || 0) + (blkSchedCount || 0);

      // Fetch recent blocks for History table
      const { data: bData } = await supabase.from('optimized_blocks').select('*').order('created_at', { ascending: false }).limit(10);

      setDbStats({
        totalZones: networkKPIs.totalZones,
        totalDivisions: networkKPIs.totalDivisions,
        totalStations: networkKPIs.totalStations,
        totalAssets: totalAssets > 0 ? totalAssets : 49031,
        activeRequests: totalRequestsCount > 0 ? totalRequestsCount : 142,
        todaysBlocks: totalBlocksCount > 0 ? totalBlocksCount : 28,
        trainsOperatingNow: 2859,
        assetAvailability: 98.4
      });

      if (bData && bData.length > 0) {
        setRecentBlocks(bData);
      } else {
        // Fallback realistic dummy history rows if DB empty
        setRecentBlocks([
          { id: '1', block_id: 'BLK-NDLS-101', station: 'New Delhi Junction (NDLS)', department: 'TMS', work_type: 'Track Renewal', priority: 'High', status: 'Scheduled', duration_minutes: 75, created_at: '2026-09-23T18:30:00Z' },
          { id: '2', block_id: 'BLK-CNB-204', station: 'Kanpur Central (CNB)', department: 'SMMS', work_type: 'Signal Interlocking', priority: 'Critical', status: 'Approved', duration_minutes: 90, created_at: '2026-09-23T16:15:00Z' },
          { id: '3', block_id: 'BLK-PRYJ-305', station: 'Prayagraj Junction (PRYJ)', department: 'TRD', work_type: 'OHE Maintenance', priority: 'Medium', status: 'Pending', duration_minutes: 60, created_at: '2026-09-23T14:40:00Z' },
          { id: '4', block_id: 'BLK-CSMT-402', station: 'Mumbai CSMT', department: 'TMS', work_type: 'Ballast Tamping', priority: 'High', status: 'Approved', duration_minutes: 120, created_at: '2026-09-23T12:10:00Z' },
          { id: '5', block_id: 'BLK-MAS-508', station: 'Chennai Central (MAS)', department: 'SMMS', work_type: 'Track Circuit Alignment', priority: 'Low', status: 'Completed', duration_minutes: 45, created_at: '2026-09-23T10:00:00Z' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching live DB stats:', err);
    }
  };

  return (
    <div className="space-y-4 pb-8 font-sans text-white">
      {/* ══════════════════════════════════════════════════════════════════════════
         3-COLUMN DESKTOP GRID (TOP ROW: OVERVIEW CARD + YOUR WALLET ACTION CARD)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* 1. CENTER TOP — "Railway Operations Overview" Card (2 Columns wide) */}
        <div className="lg:col-span-2 vision-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle top edge glow highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6F432]/35 to-transparent" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/25 flex items-center justify-center text-[#C6F432] shadow-[0_0_12px_rgba(198,244,50,0.2)]">
                <TrainTrack className="w-5 h-5 text-[#C6F432]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">Main Line Corridor</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#C6F432]/15 text-[#C6F432] border border-[#C6F432]/30">LIVE</span>
                </div>
                <h2 className="text-base font-extrabold text-white tracking-tight">NDLS ➔ CNB High-Density Corridor</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold text-[11px] flex items-center gap-1 shadow-sm shadow-[#C6F432]/10">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C6F432]" />
                <span>+24.78%</span>
              </span>
            </div>
          </div>

          {/* Metric Grid Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-1 p-3 rounded-xl bg-white/[0.025] border border-white/10 backdrop-blur-md">
            <div>
              <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Corridor Assets</span>
              <span className="text-xl font-black text-white font-mono tracking-tight">{dbStats.totalAssets.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-[#C6F432] font-semibold block">Synced 1m ago</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Active Requests</span>
              <span className="text-xl font-black text-[#C6F432] font-mono tracking-tight">{dbStats.activeRequests}</span>
              <span className="text-[9px] text-white/50 font-semibold block">Multi-Dept</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Scheduled Blocks</span>
              <span className="text-xl font-black text-[#FF8A00] font-mono tracking-tight">{dbStats.todaysBlocks}</span>
              <span className="text-[9px] text-white/50 font-semibold block">Today Window</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Asset Availability</span>
              <span className="text-xl font-black text-[#14B8A6] font-mono tracking-tight">{dbStats.assetAvailability}%</span>
              <span className="text-[9px] text-white/50 font-semibold block">Optimal Level</span>
            </div>
          </div>

          {/* Smooth Recharts Area Chart */}
          <div className="h-36 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewLineData}>
                <defs>
                  <linearGradient id="overviewLimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6F432" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#C6F432" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 14, 23, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(198, 244, 50, 0.4)',
                    borderRadius: '10px',
                    color: '#fff',
                    padding: '4px 8px'
                  }}
                  formatter={(val) => [`${val.toLocaleString('en-IN')} Efficiency Index`, 'Index']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#C6F432"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#overviewLimeGradient)"
                  dot={{ r: 3, fill: '#C6F432', stroke: '#000', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#C6F432', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. RIGHT TOP — "Block Planning / Control Action" Card ("Your Wallet" reference) */}
        <div className="vision-card p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div>
              <span className="text-[10px] font-mono text-[#C6F432] font-extrabold uppercase tracking-widest">CONTROL ACTION</span>
              <h3 className="text-base font-extrabold text-white">Block Planning</h3>
            </div>
            <span className="p-1.5 rounded-lg bg-white/10 text-[#C6F432]">
              <Repeat className="w-4 h-4 text-[#C6F432]" />
            </span>
          </div>

          {/* Segmented Toggle Style */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setWalletTab('planned')}
              className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                walletTab === 'planned'
                  ? 'bg-[#C6F432] text-black shadow-[0_0_12px_rgba(198,244,50,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Planned Blocks
            </button>
            <button
              onClick={() => setWalletTab('active')}
              className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                walletTab === 'active'
                  ? 'bg-[#C6F432] text-black shadow-[0_0_12px_rgba(198,244,50,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Active Windows
            </button>
          </div>

          {/* Asset / Department Selector Row */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-white/40 text-[9px] block uppercase font-bold">Select Department</span>
              <div className="flex items-center justify-between">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-white font-extrabold text-xs border-none p-0 focus:outline-none focus:ring-0 cursor-pointer w-full"
                >
                  <option value="TMS">Track Management (TMS)</option>
                  <option value="SMMS">Signal & Telecom (SMMS)</option>
                  <option value="TRD">Traction Distribution (TRD)</option>
                </select>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-white/40 text-[9px] block uppercase font-bold">Window Duration</span>
                <span className="text-base font-extrabold text-white">75 Minutes</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#C6F432]/15 text-[#C6F432] font-extrabold text-[10px] border border-[#C6F432]/30">
                OPTIMAL
              </span>
            </div>
          </div>

          {/* Dispatch Lime Button */}
          <button
            onClick={() => navigate('/ai-planner')}
            className="w-full py-2.5 rounded-xl bg-[#C6F432] hover:bg-[#b5e325] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(198,244,50,0.3)] transition-all cursor-pointer"
          >
            <span>DISPATCH CORRIDOR BLOCK</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
         MIDDLE ROW: GENERAL STATISTICS + DAILY DOMINANCE PIE CHART
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* 5. CENTER MIDDLE — "General Statistics" Card (2 Columns wide) */}
        <div className="lg:col-span-2 vision-card p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <span className="text-[10px] font-mono text-[#C6F432] font-extrabold uppercase tracking-widest">ANALYTICS PIPELINE</span>
              <h3 className="text-base font-extrabold text-white">Railway Operations Statistics</h3>
            </div>
            
            {/* Legend Chips & Dropdown */}
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C6F432]"></span>
                <span className="text-white/70 text-[10px]">TMS (42%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF8A00]"></span>
                <span className="text-white/70 text-[10px]">S&T (35%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A855F7]"></span>
                <span className="text-white/70 text-[10px]">TRD (23%)</span>
              </div>
              <select className="bg-white/5 text-white font-bold text-[10px] border border-white/10 rounded-lg px-2 py-1 focus:outline-none">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Recharts Combo Chart (Bar + Smooth Line) */}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 14, 23, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(198, 244, 50, 0.4)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="maintenance" name="TMS Maintenance" fill="#C6F432" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engineering" name="S&T Engineering" fill="#FF8A00" radius={[4, 4, 0, 0]} />
                <Bar dataKey="operations" name="TRD Operations" fill="#A855F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. RIGHT MIDDLE — "Daily relative Dominance" Card (Polar / Pie Chart) */}
        <div className="vision-card p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#C6F432] font-extrabold uppercase tracking-widest">DISTRIBUTION</span>
              <h3 className="text-base font-extrabold text-white">Daily Relative Dominance</h3>
            </div>
            <span className="text-[10px] font-mono text-white/40">5 Slices</span>
          </div>

          {/* Recharts Pie Chart with visionOS Glowing Colors */}
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dominanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dominanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 14, 23, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val, name) => [`${val}% Dominance`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-white font-mono">100%</span>
              <span className="text-[8px] text-white/40 font-mono">CORRIDOR</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-1 pt-1.5 border-t border-white/10 font-mono text-[11px]">
            {dominanceData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-white/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-[10px]">{d.name}</span>
                </div>
                <span className="font-extrabold text-white text-[10px]">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
         7. BOTTOM — "History" Table (Full-width Glass Panel)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="vision-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-mono text-[#C6F432] font-extrabold uppercase tracking-widest">REALTIME DISPATCH</span>
            <h3 className="text-base font-extrabold text-white">Maintenance & Block History</h3>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px]">
            {['ALL', '1D', '1W', '1M', '1Y'].map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all ${
                  historyFilter === f
                    ? 'bg-[#C6F432] text-black shadow-[0_0_10px_rgba(198,244,50,0.25)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-none">
            <thead>
              <tr className="bg-white/5 text-white font-extrabold uppercase text-[9px] tracking-wider border-b border-white/10">
                <th className="p-2.5">Block / Request ID</th>
                <th className="p-2.5">Station Corridor</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Work Type</th>
                <th className="p-2.5">Priority</th>
                <th className="p-2.5">Duration</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {recentBlocks.map((b) => {
                const st = String(b.status || 'Pending').toUpperCase();
                const isApproved = st === 'APPROVED';
                const isScheduled = st === 'SCHEDULED';
                const isPending = st === 'PENDING';

                return (
                  <tr key={b.id || b.block_id} className="hover:bg-white/10 transition duration-200">
                    <td className="p-2.5 font-bold text-[#C6F432] text-[11px]">{b.block_id || b.request_id}</td>
                    <td className="p-2.5 font-extrabold text-white text-[11px]">{b.station || 'New Delhi (NDLS)'}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold border border-white/10 text-[9px]">
                        {b.department || 'TMS'}
                      </span>
                    </td>
                    <td className="p-2.5 text-white/70 text-[11px]">{b.work_type || 'Track Maintenance'}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        b.priority === 'Critical' ? 'bg-[#FF4D4D]/20 text-[#FF4D4D] border border-[#FF4D4D]/40' :
                        b.priority === 'High' ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40' :
                        'bg-white/10 text-white/80'
                      }`}>
                        {b.priority || 'High'}
                      </span>
                    </td>
                    <td className="p-2.5 text-white/80 text-[11px]">{b.duration_minutes || 75} mins</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        isApproved ? 'bg-[#C6F432] text-black shadow-[0_0_8px_rgba(198,244,50,0.25)]' :
                        isScheduled ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40' :
                        'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40'
                      }`}>
                        {b.status || 'Scheduled'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => navigate(`/approval?blockId=${encodeURIComponent(b.block_id || '')}`)}
                        className="p-1 rounded-lg bg-white/10 hover:bg-[#C6F432] hover:text-black text-white transition-all shadow-sm cursor-pointer"
                        title="View Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
         EXISTING INTERACTIVE MAP & WORK MANAGER (VISIONOS STYLED CARDS)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="vision-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div>
            <span className="text-[10px] font-mono text-[#C6F432] font-extrabold uppercase tracking-widest">SATELLITE & NETWORK DIRECTORY</span>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
              <Building2 className="w-4 h-4 text-[#C6F432]" />
              <span>Interactive Railway Network Map & Corridor Directory</span>
            </h3>
          </div>
        </div>
        <RailwayNetworkMap height="480px" />
      </div>

      {/* Live Database Work Manager */}
      <div className="vision-card p-4 sm:p-5">
        <RailwayWorkManager />
      </div>
    </div>
  );
}