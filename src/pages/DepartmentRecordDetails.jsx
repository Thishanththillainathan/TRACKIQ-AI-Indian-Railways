import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Database,
  Wrench,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles
} from 'lucide-react';
import { getDepartmentRecordDetails } from '../services/departmentDataService';

export default function DepartmentRecordDetails() {
  const { deptId, recordId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const normDept = (deptId || 'TMS').toUpperCase();

  useEffect(() => {
    fetchRecord();
  }, [deptId, recordId]);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const data = await getDepartmentRecordDetails(normDept, recordId);
      setDetails(data);
    } catch (err) {
      console.error('Error fetching record details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-[#555555]">
        Loading {normDept} record details for "{recordId}"...
      </div>
    );
  }

  const rec = details?.record || {};

  return (
    <div className="space-y-6 pb-12 font-sans text-white p-2 min-h-screen">
      {/* TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/departments/${normDept.toLowerCase()}`)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2 rounded-lg text-xs font-bold transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to {normDept} Department</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2 bg-white hover:bg-[#F7F7F7] text-[#555555] hover:text-black border border-[#E5E5E5] rounded-lg text-xs font-semibold transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold">
          <span>{normDept} DEPARTMENT</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
          <span className="text-black bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]">
            RECORD: {rec.id || recordId}
          </span>
        </div>
      </div>

      {/* RECORD HEADER CARD */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#555555] uppercase mb-1">
              <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">{normDept} RECORD DETAILS</span>
              <span>CATEGORY: {rec.category || 'DEPARTMENT ITEM'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">{rec.asset_name || rec.title || recordId}</h1>
            <p className="text-xs text-[#555555] font-mono mt-1">ID: {rec.id || recordId} • Station: {rec.station} • Division: {rec.division} ({rec.zone})</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/requests')}
              className="flex items-center gap-2 bg-black hover:bg-[#333333] text-white font-mono font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Submit Maintenance Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECORD ATTRIBUTES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">RECORD / ASSET ID</span>
          <span className="font-extrabold text-black text-sm">{rec.id || recordId}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">DEPARTMENT & WING</span>
          <span className="font-extrabold text-black text-sm">{rec.department || normDept}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">STATUS / PRIORITY</span>
          <span className={`inline-block px-2 py-0.5 rounded font-bold ${
            ['Operational', 'Active', 'Available', 'Normal'].includes(rec.status)
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {rec.status || 'Active'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">CONDITION INDEX</span>
          <span className="font-extrabold text-emerald-600 text-sm">{rec.condition_index || 85}% (Good)</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">STATION / LOCATION</span>
          <span className="font-bold text-black">{rec.station || 'Coimbatore'}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">DIVISION & ZONE</span>
          <span className="font-bold text-black">{rec.division} ({rec.zone})</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">WORK / SUBSYSTEM TYPE</span>
          <span className="font-bold text-black">{rec.work_type || rec.asset_type}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm space-y-1">
          <span className="text-[#777777] block font-bold">RECORD DATE / TIMESTAMP</span>
          <span className="font-bold text-black">{rec.date || '2026-09-01'}</span>
        </div>
      </div>

      {/* RAW DATA DUMP OF SOURCE FIELDS */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3 text-xs font-mono font-bold text-black">
          <Layers className="w-4 h-4 text-black" />
          <span>AUTHORITATIVE SOURCE FIELDS (DATA / ML/DATA REPOSITORY)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
          {Object.entries(rec).map(([k, v]) => {
            if (typeof v === 'object' || v === null || v === undefined) return null;
            return (
              <div key={k} className="p-2.5 bg-[#F7F7F7] rounded-lg border border-[#E5E5E5]">
                <span className="text-[#777777] font-bold block text-[10px] uppercase">{k}</span>
                <span className="text-black font-semibold break-all">{String(v)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LINKED MAINTENANCE REQUESTS & ML PREDICTIONS */}
      {details?.linkedMaintenance && details.linkedMaintenance.length > 0 && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 text-xs font-mono font-bold text-black">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>LINKED MAINTENANCE REQUESTS ({details.linkedMaintenance.length})</span>
            </div>
          </div>

          <div className="divide-y divide-[#E5E5E5] font-sans text-xs">
            {details.linkedMaintenance.map((m, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-black">{m.work_type || m.asset_name}</div>
                  <div className="text-mono text-[10px] text-[#777777]">ID: {m.id} • Station: {m.station}</div>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded">
                  {m.status || 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
