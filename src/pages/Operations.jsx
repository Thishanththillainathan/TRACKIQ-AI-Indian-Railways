import React, { useState, useEffect } from 'react';
import { 
  Activity, Search, RefreshCw, AlertTriangle, 
  Train, Clock, ShieldAlert, BarChart2, Filter, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDepartment, DEPARTMENT_METADATA } from '../utils/departmentClassifier';
import { API_BASE_URL } from '../config/api.js';

export default function Operations() {
  const [operations, setOperations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpis, setKpis] = useState({ total_operations: 0, scheduled_trains: 0, affected_trains: 0, avg_delay: 0, avg_actual_duration: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [densityFilter, setDensityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const navigate = useNavigate();

  const fetchOperations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        priority: priorityFilter,
        traffic_density: densityFilter,
        department: departmentFilter
      });
      const res = await fetch(`${API_BASE_URL}/api/operations/data?${params}`);
      const data = await res.json();
      if (data.success) {
        setOperations(data.operations || []);
        setTotalCount(data.total_count || 0);
        setKpis(data.kpis || {});
      } else {
        setError(data.error || 'Failed to fetch operations data');
      }
    } catch (err) {
      setError(`Backend service connection error. Please ensure TRACKIQ backend is running at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [page, priorityFilter, densityFilter, departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOperations();
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-6 bg-white min-h-screen text-black space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black tracking-tight">3. Operations Module</h1>
              <p className="text-xs text-[#333333] font-medium">Traffic Impact, Scheduled & Affected Trains, Delay Metrics & Department Classification (105,000+ Operational Events)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOperations} 
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F5F5F5] text-black text-xs font-semibold rounded-md border border-[#D9D9D9] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-black ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-lg border border-[#D9D9D9]">
          <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-wider">Total Operations</p>
          <p className="text-2xl font-bold text-black mt-1">{kpis.total_operations?.toLocaleString()}</p>
          <span className="text-[10px] text-black font-medium">Classified Events</span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#D9D9D9]">
          <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-wider">Scheduled Trains</p>
          <p className="text-2xl font-bold text-black mt-1">{kpis.scheduled_trains?.toLocaleString()}</p>
          <span className="text-[10px] text-[#333333]">Total Timetable</span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#D9D9D9]">
          <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-wider">Affected Trains</p>
          <p className="text-2xl font-bold text-black mt-1">{kpis.affected_trains?.toLocaleString()}</p>
          <span className="text-[10px] text-[#333333] font-medium">Traffic Impact</span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#D9D9D9]">
          <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-wider">Avg Delay</p>
          <p className="text-2xl font-bold text-black mt-1">{kpis.avg_delay} mins</p>
          <span className="text-[10px] text-[#333333]">Delay Penalty</span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#D9D9D9]">
          <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-wider">Avg Duration</p>
          <p className="text-2xl font-bold text-black mt-1">{kpis.avg_actual_duration} hrs</p>
          <span className="text-[10px] text-[#333333]">Actual Block Time</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#F5F5F5] p-4 rounded-lg border border-[#D9D9D9]">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-black" />
            <input 
              type="text"
              placeholder="Search Request ID, Station, Asset ID, Priority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#D9D9D9] text-black placeholder-[#777777] text-xs rounded-md pl-9 pr-4 py-2.5 focus:outline-none focus:border-black"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-black hover:bg-[#222222] text-white text-xs font-semibold rounded-md transition">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Department Filter Buttons */}
          <div className="flex items-center bg-white border border-[#D9D9D9] rounded-md p-1 font-mono text-xs">
            {['ALL', 'SMMS', 'TMS', 'TRD'].map(dept => (
              <button
                key={dept}
                type="button"
                onClick={() => { setDepartmentFilter(dept); setPage(1); }}
                className={`px-3 py-1.5 rounded font-bold transition-all ${
                  departmentFilter === dept 
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-[#F0F0F0]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <select 
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="bg-white border border-[#D9D9D9] text-black text-xs rounded-md px-3 py-2.5 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="P1 - Emergency">P1 - Emergency</option>
            <option value="P2 - High Priority">P2 - High Priority</option>
            <option value="P3 - Routine">P3 - Routine</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-lg border border-[#D9D9D9] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#333333] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm font-medium">Loading Operations Dataset...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-black bg-[#F5F5F5] border border-black rounded-lg m-4">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-black" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : operations.length === 0 ? (
          <div className="p-12 text-center text-[#333333]">
            <p className="text-base font-semibold">No operations records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black border-collapse">
              <thead className="bg-black uppercase text-[10px] font-extrabold text-white tracking-wider border-b border-black">
                <tr>
                  <th className="p-3">Department</th>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Station</th>
                  <th className="p-3">Asset ID</th>
                  <th className="p-3">Block Type</th>
                  <th className="p-3">Planned / Actual</th>
                  <th className="p-3">Traffic Density</th>
                  <th className="p-3">Sched / Affected</th>
                  <th className="p-3">Delay</th>
                  <th className="p-3 text-right">Block Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D9D9] font-mono">
                {operations.map((r, idx) => {
                  const dept = r.department || getDepartment(r);
                  return (
                    <tr key={idx} className="hover:bg-[#F0F0F0] transition font-sans">
                      <td className="p-3 font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white">
                          {dept}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-black">{r["Request ID"]}</td>
                      <td className="p-3 text-black font-medium">{r["Station"]}</td>
                      <td className="p-3 font-mono text-[#333333]">{r["Asset ID"]}</td>
                      <td className="p-3 text-black font-semibold">{r["Block Type"]}</td>
                      <td className="p-3 font-mono text-black">{r["Planned Duration"]}h / {r["Actual Duration"]}h</td>
                      <td className="p-3 text-[#333333] text-[11px]">{r["Traffic Density"]}</td>
                      <td className="p-3 font-mono font-bold text-black">{r["Scheduled Trains"]} / <span className="text-black font-bold">{r["Affected Trains"]}</span></td>
                      <td className="p-3 font-mono text-[#333333]">{r["Previous Delay"]} mins</td>
                      <td className="p-3 text-right font-mono">
                        <button 
                          onClick={() => navigate('/schedule', { state: { request_id: r["Request ID"], station: r["Station"], block_type: r["Block Type"] } })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black hover:bg-[#222222] text-white rounded transition text-[11px] font-semibold"
                        >
                          <Calendar className="w-3 h-3 text-white" />
                          <span>Schedule</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-[#F5F5F5] border-t border-[#D9D9D9] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#333333]">
          <div>
            Showing <span className="font-semibold text-black">{operations.length}</span> of <span className="font-semibold text-black">{totalCount.toLocaleString()}</span> operations (Page {page} of {totalPages})
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 bg-white hover:bg-[#F0F0F0] disabled:opacity-40 text-black rounded border border-[#D9D9D9] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-black">Page {page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-white hover:bg-[#F0F0F0] disabled:opacity-40 text-black rounded border border-[#D9D9D9] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function strIncludes(str, sub) {
  return str && str.toString().includes(sub);
}
