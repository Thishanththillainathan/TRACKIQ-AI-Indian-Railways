import React, { useState, useEffect } from 'react';
import { 
  Cpu, Search, RefreshCw, AlertTriangle, 
  Users, Wrench, Clock, Layers, ChevronLeft, ChevronRight, Bot, Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDepartment, DEPARTMENT_METADATA } from '../utils/departmentClassifier';
import { API_BASE_URL } from '../config/api.js';

export default function Engineering() {
  const [requests, setRequests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpis, setKpis] = useState({ total_requests: 0, avg_technicians: 0, avg_manpower: 0, avg_planned_duration: 0, total_assets_involved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        work_type: workTypeFilter,
        severity: severityFilter,
        department: departmentFilter
      });
      const res = await fetch(`${API_BASE_URL}/api/engineering/requests?${params}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setTotalCount(data.total_count || 0);
        setKpis(data.kpis || {});
      } else {
        setError(data.error || 'Failed to fetch engineering requests');
      }
    } catch (err) {
      setError(`Backend service connection error. Please ensure TRACKIQ backend is running at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, workTypeFilter, severityFilter, departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-6 bg-white min-h-screen text-black space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F5F5F5] text-black rounded-xl border border-[#D9D9D9]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black tracking-tight">2. Engineering Module</h1>
              <p className="text-xs text-[#808080] font-medium">Technical Work Requests, Resource Allocations & Department Classification (125,000+ Requests)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRequests} 
            className="flex items-center gap-2 px-3.5 py-2 bg-black hover:bg-[#333333] text-white text-xs font-semibold rounded-lg border border-black transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#D9D9D9] shadow-sm">
          <p className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Total Requests</p>
          <p className="text-2xl font-extrabold text-black mt-1">{kpis.total_requests?.toLocaleString()}</p>
          <span className="text-[10px] text-black font-semibold">Classified Requests</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#D9D9D9] shadow-sm">
          <p className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Avg Technicians</p>
          <p className="text-2xl font-extrabold text-black mt-1">{kpis.avg_technicians} / job</p>
          <span className="text-[10px] text-[#808080]">Specialist Crew</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#D9D9D9] shadow-sm">
          <p className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Avg Manpower</p>
          <p className="text-2xl font-extrabold text-black mt-1">{kpis.avg_manpower} personnel</p>
          <span className="text-[10px] text-[#808080]">Labor Deployment</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#D9D9D9] shadow-sm">
          <p className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Avg Planned Dur</p>
          <p className="text-2xl font-extrabold text-black mt-1">{kpis.avg_planned_duration} hrs</p>
          <span className="text-[10px] text-[#808080]">Estimated Duration</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#D9D9D9] shadow-sm">
          <p className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Assets Involved</p>
          <p className="text-2xl font-extrabold text-black mt-1">{kpis.total_assets_involved?.toLocaleString()}</p>
          <span className="text-[10px] text-[#808080]">Total Infrastructure</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#F5F5F5] p-4 rounded-xl border border-[#D9D9D9]">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#808080]" />
            <input 
              type="text"
              placeholder="Search Request ID, Asset ID, Station, Work Type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#D9D9D9] text-black placeholder-[#808080] text-xs rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-black"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-black hover:bg-[#333333] text-white text-xs font-semibold rounded-lg shadow transition">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Department Filter Buttons */}
          <div className="flex items-center bg-white border border-[#D9D9D9] rounded-lg p-1 font-mono text-xs">
            {['ALL', 'SMMS', 'TMS', 'TRD'].map(dept => (
              <button
                key={dept}
                type="button"
                onClick={() => { setDepartmentFilter(dept); setPage(1); }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  departmentFilter === dept 
                    ? 'bg-black text-white'
                    : 'text-[#808080] hover:text-black'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <select 
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            className="bg-white border border-[#D9D9D9] text-black text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-black font-semibold"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Moderate">Moderate</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-[#D9D9D9] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-black flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm font-medium">Loading Engineering Dataset...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-black bg-[#F5F5F5] border border-[#D9D9D9] rounded-xl m-4">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-black" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-[#808080]">
            <p className="text-base font-semibold">No engineering requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-black text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-black">
                <tr>
                  <th className="p-3">Department</th>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Asset ID</th>
                  <th className="p-3">Station</th>
                  <th className="p-3">Work Type</th>
                  <th className="p-3">Problem Type</th>
                  <th className="p-3">Technicians</th>
                  <th className="p-3">Manpower</th>
                  <th className="p-3">Planned Dur</th>
                  <th className="p-3 text-right">AI Planner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D9D9] font-mono">
                {requests.map((r, idx) => {
                  const dept = r.department || getDepartment(r);
                  const deptMeta = DEPARTMENT_METADATA[dept] || DEPARTMENT_METADATA.TMS;
                  return (
                    <tr key={idx} className="hover:bg-[#F5F5F5] transition font-sans odd:bg-white even:bg-[#F5F5F5]">
                      <td className="p-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${deptMeta.badgeClass}`}>
                          {dept}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-black">{r["Request ID"]}</td>
                      <td className="p-3 font-mono text-black">{r["Asset ID"]}</td>
                      <td className="p-3 text-black">{r["Station"]}</td>
                      <td className="p-3 font-medium text-black">{r["Work Type"]}</td>
                      <td className="p-3 text-[#333333] max-w-xs truncate">{r["Problem Type"]}</td>
                      <td className="p-3 font-mono text-black font-bold">{r["Number of Technicians"]} techs</td>
                      <td className="p-3 font-mono text-black font-bold">{r["Manpower Used"]} staff</td>
                      <td className="p-3 text-black font-mono font-bold">{r["Planned Duration"]} hrs</td>
                      <td className="p-3 text-right font-mono">
                        <button 
                          onClick={() => navigate('/ai-planner', { state: { request_id: r["Request ID"], asset_id: r["Asset ID"], station: r["Station"], work_type: r["Work Type"], planned_duration: r["Planned Duration"] } })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black hover:bg-[#333333] text-white rounded border border-black transition text-[11px] font-semibold"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Send to Planner</span>
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
        <div className="p-4 bg-[#F5F5F5] border-t border-[#D9D9D9] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-black">
          <div>
            Showing <span className="font-semibold text-black">{requests.length}</span> of <span className="font-semibold text-black">{totalCount.toLocaleString()}</span> requests (Page {page} of {totalPages})
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 bg-white hover:bg-[#E5E5E5] disabled:opacity-40 text-black rounded border border-[#D9D9D9] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-black">Page {page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-white hover:bg-[#E5E5E5] disabled:opacity-40 text-black rounded border border-[#D9D9D9] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
