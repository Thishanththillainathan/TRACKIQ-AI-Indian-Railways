import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HardHat,
  RadioTower,
  Zap,
  Wrench,
  FileText,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Activity,
  Filter,
  Layers,
  ArrowLeft,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';
import { useRailwayNetwork } from '../context/RailwayNetworkContext';
import { getDepartmentData } from '../services/departmentDataService';
import { getZones, getDivisions } from '../services/railwayNetworkService';

const DEPT_CONFIGS = {
  TMS: {
    id: 'TMS',
    title: 'TRACK MANAGEMENT SYSTEM (TMS)',
    subtitle: 'Civil Engineering Wing — Track Infrastructure, Rail Geometry, Tamping & Ballast Maintenance',
    icon: HardHat,
    deptName: 'Track Management',
    badge: 'TMS DEPT'
  },
  SMMS: {
    id: 'SMMS',
    title: 'SIGNAL & TELECOMMUNICATION SYSTEM (SMMS)',
    subtitle: 'Signalling & Telecom Wing — Interlocking, Axle Counters, Point Machines, Kavach ATP & OFC Grid',
    icon: RadioTower,
    deptName: 'Signal & Telecommunication',
    badge: 'SMMS DEPT'
  },
  TRD: {
    id: 'TRD',
    title: 'TRACK DISTRIBUTION SYSTEM (TRD)',
    subtitle: 'Electrical Engineering Wing — 25kV OHE Catenary Power Lines, TSS Substations & SCADA Grid',
    icon: Zap,
    deptName: 'Traction Distribution',
    badge: 'TRD DEPT'
  }
};

export default function DepartmentDashboard({ embeddedDeptKey = null }) {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedZone, selectedDivision, selectedStation, showDashboard } = useRailwayNetwork();

  // Determine active department key
  const activeDeptKey = useMemo(() => {
    const key = (embeddedDeptKey || deptId || 'TMS').toUpperCase();
    if (key === 'ST' || key === 'SMMS') return 'SMMS';
    if (key === 'TRD') return 'TRD';
    return 'TMS';
  }, [embeddedDeptKey, deptId]);

  const config = DEPT_CONFIGS[activeDeptKey] || DEPT_CONFIGS.TMS;

  // Filter & Pagination state
  const [activeCategory, setActiveCategory] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setPageSize] = useState(50);

  // Sync with Railway Network Context when context changes
  useEffect(() => {
    if (selectedZone) setZoneFilter(selectedZone.code);
    if (selectedDivision) setDivisionFilter(selectedDivision.name);
  }, [selectedZone, selectedDivision]);

  // Fetched data state
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [kpis, setKpis] = useState({ totalRecords: 0, activeCount: 0, maintenanceCount: 0, criticalCount: 0, stationsCovered: 0 });
  const [datasetCounts, setDatasetCounts] = useState({ totalAssets: 0, totalMaintenance: 0, totalHistorical: 0, totalML: 0, totalMachines: 0 });
  const [dataSource, setDataSource] = useState('');
  const [loading, setLoading] = useState(true);

  const allZones = useMemo(() => getZones(), []);
  const availableDivisions = useMemo(() => getDivisions(zoneFilter === 'ALL' ? null : zoneFilter), [zoneFilter]);

  // Load department dataset
  useEffect(() => {
    fetchData();
  }, [activeDeptKey, activeCategory, page, limit, searchQuery, statusFilter, zoneFilter, divisionFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentData(activeDeptKey, {
        page,
        limit,
        category: activeCategory,
        search: searchQuery,
        zone: zoneFilter,
        division: divisionFilter,
        station: selectedStation ? selectedStation.code : '',
        status: statusFilter
      });

      if (res) {
        setRecords(Array.isArray(res.records) ? res.records : []);
        setTotalRecords(res.totalRecords ?? res.total_records ?? 0);
        setTotalPages(res.totalPages ?? res.total_pages ?? 1);
        if (res.kpis) {
          setKpis({
            totalRecords: res.kpis.totalRecords ?? res.kpis.total_records ?? 0,
            activeCount: res.kpis.activeCount ?? res.kpis.active_count ?? 0,
            maintenanceCount: res.kpis.maintenanceCount ?? res.kpis.maintenance_count ?? 0,
            criticalCount: res.kpis.criticalCount ?? res.kpis.critical_count ?? 0,
            stationsCovered: res.kpis.stationsCovered ?? res.kpis.stations_covered ?? 7439
          });
        }
        if (res.datasetCounts) setDatasetCounts(res.datasetCounts);
        setDataSource(res.sourceName || 'TRACKIQ System Dataset');
      }
    } catch (err) {
      console.error('Error loading department data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setZoneFilter('ALL');
    setDivisionFilter('ALL');
    setPage(1);
  };

  const categories = [
    { id: 'overview', label: 'All Records Overview', count: datasetCounts.totalOverview || kpis.totalRecords },
    { id: 'maintenance', label: 'Maintenance Records', count: datasetCounts.totalMaintenance || 56853 },
    { id: 'engineering', label: 'Engineering Records', count: datasetCounts.totalEngineering || 53619 },
    { id: 'operations', label: 'Operations Records', count: datasetCounts.totalOperations || 47527 },
    { id: 'work_assets', label: 'Work Requests', count: datasetCounts.totalWorkAssets || 60000 },
    { id: 'assets', label: 'Core Assets', count: datasetCounts.totalAssets || 16250 }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-white p-2 min-h-screen">
      {/* TOP NAVIGATION BAR WITH BACK BUTTON */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2 rounded-lg text-xs font-bold transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#C6F432] font-bold">
          <span>DEPARTMENT MODULES</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          <span className="text-black bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]">
            {config.title}
          </span>
        </div>
      </div>

      {/* DEPARTMENT HERO HEADER */}
      <div className="vision-card border border-white/12 rounded-2xl p-6 shadow-sm backdrop-blur-2xl bg-white/[0.045]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#C6F432]/18 border border-[#C6F432]/45 flex items-center justify-center font-mono font-extrabold text-[#C6F432] text-xl shadow shrink-0">
              <config.icon className="w-7 h-7 text-[#C6F432]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/70 uppercase mb-1">
                <span className="bg-[#C6F432]/20 text-[#C6F432] border border-[#C6F432]/30 px-2 py-0.5 rounded text-[10px]">{config.badge}</span>
                <span>DATASET: {dataSource || 'TRACKIQ Railway DB'}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {config.title}
              </h2>
              <p className="text-xs text-white/70 max-w-3xl mt-0.5 font-medium leading-relaxed">
                {config.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/requests')}
              className="flex items-center gap-2 bg-[#C6F432]/85 hover:bg-[#C6F432] text-black font-mono font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <FileText className="w-4 h-4 text-black" />
              <span>Submit {config.id} Maintenance Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* DEPARTMENT SUMMARY DYNAMIC KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl vision-card border border-white/12 bg-white/[0.045] backdrop-blur-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-white/70 font-bold font-mono">
            <span>TOTAL RECORDS</span>
            <Database className="w-4 h-4 text-[#C6F432]" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono">
            {(kpis?.totalRecords ?? kpis?.total_records ?? 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-white/50 font-mono mt-1">Ground dataset rows</p>
        </div>

        <div className="p-4 rounded-xl vision-card border border-white/12 bg-white/[0.045] backdrop-blur-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-white/70 font-bold font-mono">
            <span>OPERATIONAL ASSETS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400 font-mono">
            {(kpis?.activeCount ?? kpis?.active_count ?? 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-white/50 font-mono mt-1">Ready for train pathing</p>
        </div>

        <div className="p-4 rounded-xl vision-card border border-white/12 bg-white/[0.045] backdrop-blur-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-white/70 font-bold font-mono">
            <span>UNDER MAINTENANCE</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-400 font-mono">
            {(kpis?.maintenanceCount ?? kpis?.maintenance_count ?? 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-white/50 font-mono mt-1">Possession window open</p>
        </div>

        <div className="p-4 rounded-xl vision-card border border-white/12 bg-white/[0.045] backdrop-blur-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-white/70 font-bold font-mono">
            <span>CRITICAL / HIGH RISK</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-400 font-mono">
            {(kpis?.criticalCount ?? kpis?.critical_count ?? 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-white/50 font-mono mt-1">Requires urgent block</p>
        </div>

        <div className="p-4 rounded-xl vision-card border border-white/12 bg-white/[0.045] backdrop-blur-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-white/70 font-bold font-mono">
            <span>STATIONS COVERED</span>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono">
            {(kpis?.stationsCovered ?? kpis?.stations_covered ?? 7439).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-white/50 font-mono mt-1">Grounded across network</p>
        </div>
      </div>

      {/* CATEGORY TABS SELECTOR */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-2 font-mono text-xs">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => { setActiveCategory(c.id); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeCategory === c.id
                ? 'bg-[#C6F432]/20 border border-[#C6F432]/40 text-[#C6F432] shadow-sm'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <span>{c.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              activeCategory === c.id ? 'bg-[#C6F432]/25 text-[#C6F432]' : 'bg-white/10 text-white/80 border border-white/10'
            }`}>
              {(c.count ?? 0).toLocaleString('en-IN')}
            </span>
          </button>
        ))}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="vision-card border border-white/12 rounded-xl p-4 shadow-sm space-y-3 bg-white/[0.045]">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#C6F432]" />
            <span>DATA FILTER & SEARCH CONTROLS ({config.id})</span>
          </div>
          {(searchQuery || statusFilter !== 'ALL' || zoneFilter !== 'ALL' || divisionFilter !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#C6F432] hover:underline font-bold"
            >
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${config.id} asset ID, name, work type...`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-white/10 border border-white/15 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#C6F432] font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-white/50 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => { setZoneFilter(e.target.value); setDivisionFilter('ALL'); setPage(1); }}
            className="bg-[#121417] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#C6F432]"
          >
            <option value="ALL">All Zones (19)</option>
            {allZones.map(z => (
              <option key={z.code} value={z.code}>{z.code} — {z.name}</option>
            ))}
          </select>

          {/* Division Filter */}
          <select
            value={divisionFilter}
            onChange={(e) => { setDivisionFilter(e.target.value); setPage(1); }}
            className="bg-[#121417] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#C6F432]"
          >
            <option value="ALL">All Divisions ({availableDivisions.length})</option>
            {availableDivisions.map(d => (
              <option key={`${d.name}-${d.zoneCode}`} value={d.name}>{d.name} Division</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#121417] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#C6F432]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Active">Active</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Critical / Risk">Critical / Risk</option>
          </select>
        </div>
      </div>

      {/* DEPARTMENT DATA TABLE */}
      <div className="vision-card border border-white/12 rounded-xl overflow-hidden shadow-sm bg-white/[0.045]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/10 text-[#C6F432] font-mono uppercase font-bold text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">RECORD ID / ASSET ID</th>
                <th className="py-3 px-4">NAME / TYPE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">STATION</th>
                <th className="py-3 px-4">DIVISION / ZONE</th>
                <th className="py-3 px-4">STATUS / PRIORITY</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-mono text-white/60">
                    Loading complete {config.id} dataset...
                  </td>
                </tr>
              ) : (records || []).length > 0 ? (
                (records || []).map((r, idx) => (
                  <tr
                    key={`${r.id}-${idx}`}
                    onClick={() => navigate(`/departments/${config.id.toLowerCase()}/${encodeURIComponent(r.id)}`)}
                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-extrabold text-[#C6F432]">
                      <span className="px-2 py-1 rounded bg-white/10 border border-white/15">
                        {r.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white text-sm group-hover:underline">
                      <div>{r.asset_name}</div>
                      <div className="text-[10px] font-mono text-white/50 font-normal">{r.asset_type}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white/70">
                      <span className="bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {r.station}
                    </td>
                    <td className="py-3 px-4 font-mono text-white">
                      <div>{r.division}</div>
                      <div className="text-[10px] text-white/50 font-bold">{r.zone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        ['Operational', 'Active', 'Available', 'Normal'].includes(r.status)
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : ['Under Maintenance', 'In Maintenance', 'Reserved'].includes(r.status)
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/departments/${config.id.toLowerCase()}/${encodeURIComponent(r.id)}`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/15 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C6F432]" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-mono text-white/60">
                    No {config.id} records match the applied filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="bg-white/5 px-6 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-white/70 font-bold">
            <span>Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages ?? 1}</strong></span>
            <span>({(totalRecords ?? 0).toLocaleString('en-IN')} total {config.id} records)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1 text-[11px] text-white/70 font-bold">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-[#121417] border border-white/15 rounded px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
              </select>
            </div>

            {/* Pagination Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded disabled:opacity-40 font-bold"
              >
                {"« First"}
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded disabled:opacity-40 font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-3 py-1 bg-[#C6F432]/20 border border-[#C6F432]/40 text-[#C6F432] rounded font-bold">
                {page}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages ?? 1, p + 1))}
                disabled={page >= (totalPages ?? 1)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded disabled:opacity-40 font-bold flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(totalPages ?? 1)}
                disabled={page >= (totalPages ?? 1)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded disabled:opacity-40 font-bold"
              >
                {"Last »"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
