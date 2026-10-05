import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  ArrowLeft,
  Wrench,
  Activity,
  ChevronRight,
  Search,
  Grid,
  RefreshCw
} from 'lucide-react';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import { searchStations, deduplicateStations, getDivisions } from '../../services/railwayNetworkService';
import { supabase } from '../../lib/supabaseClient';

export default function DivisionDetailsView() {
  const { divisionId } = useParams();
  const navigate = useNavigate();
  const { selectedDivision: ctxDiv, selectedZone, setSelectedStation, setSelectedZone } = useRailwayNetwork();

  // Match selected division by param or context
  const selectedDivision = useMemo(() => {
    if (ctxDiv) return ctxDiv;
    if (divisionId) {
      const q = divisionId.toLowerCase();
      return getDivisions().find(d => d.name.toLowerCase() === q) || { name: divisionId };
    }
    return null;
  }, [ctxDiv, divisionId]);

  const [divisionStations, setDivisionStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [totalStnCount, setTotalStnCount] = useState(0);
  const [stnQuery, setStnQuery] = useState('');
  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    if (!selectedDivision) return;
    fetchDivisionData();
  }, [selectedDivision, stnQuery]);

  const fetchDivisionData = async () => {
    setLoadingStations(true);
    try {
      const res = await searchStations({
        query: stnQuery,
        division: selectedDivision.name,
        zoneCode: selectedDivision.zoneCode || selectedZone?.code || null,
        limit: 100,
        offset: 0
      });

      // Strict application-layer deduplication of stations
      const deduped = deduplicateStations(res.stations);
      setDivisionStations(deduped);
      setTotalStnCount(res.totalCount);

      // Fetch live maintenance requests for this division if available
      const { data: reqData } = await supabase
        .from('track_requests')
        .select('*')
        .ilike('division', `%${selectedDivision.name}%`)
        .limit(5);

      setActiveRequests(reqData || []);
    } catch (err) {
      console.warn('Error fetching division stations:', err);
    } finally {
      setLoadingStations(false);
    }
  };

  if (!selectedDivision) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-mono text-[#555555]">No Division selected.</p>
        <button
          onClick={showDashboard}
          className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans bg-white text-[#111111]">
      {/* NAVIGATION BAR & BACK BUTTON */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/railway-network/divisions')}
            className="flex items-center gap-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-black border border-[#D9D9D9] px-4 py-2 rounded-lg text-xs font-bold transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Divisions</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-3 py-2 bg-white hover:bg-[#F7F7F7] text-[#555555] hover:text-black border border-[#E5E5E5] rounded-lg text-xs font-semibold transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold">
          <span>RAILWAY NETWORK</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
          {selectedZone && (
            <>
              <button
                onClick={() => setSelectedZone(selectedZone)}
                className="hover:underline text-[#333333]"
              >
                {selectedZone.code}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
            </>
          )}
          <span className="text-black bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]">
            DIVISION: {selectedDivision.name}
          </span>
        </div>
      </div>

      {/* DIVISION HERO HEADER */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center font-mono font-extrabold text-white text-lg shadow">
              {selectedDivision.name.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#555555] uppercase mb-1">
                <MapPin className="w-4 h-4 text-black" />
                <span>RAILWAY DIVISIONAL OPERATIONAL UNIT</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
                {selectedDivision.name} Division
              </h2>
              <p className="text-xs text-[#555555] font-medium mt-0.5">
                Parent Zone: <strong className="text-black">{selectedDivision.zoneName || selectedDivision.zoneCode || 'Indian Railways'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-black font-bold">
              {totalStnCount > 0 ? totalStnCount : '50+'} STATIONS
            </span>
          </div>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#555555] font-bold">
            <span>REGISTERED STATIONS</span>
            <Building2 className="w-4 h-4 text-black" />
          </div>
          <div className="mt-3 text-2xl font-bold text-black font-mono">
            {loadingStations ? '...' : divisionStations.length}
          </div>
          <p className="text-[10px] text-[#777777] font-mono mt-1">Deduplicated station records</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#555555] font-bold">
            <span>ACTIVE BLOCK REQUESTS</span>
            <Wrench className="w-4 h-4 text-black" />
          </div>
          <div className="mt-3 text-2xl font-bold text-black font-mono">
            {activeRequests.length}
          </div>
          <p className="text-[10px] text-[#777777] font-mono mt-1">Live maintenance Queue</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#555555] font-bold">
            <span>DIVISION STATUS</span>
            <Activity className="w-4 h-4 text-black" />
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ACTIVE</span>
          </div>
          <p className="text-[10px] text-[#777777] font-mono mt-1">Division Control Live</p>
        </div>
      </div>

      {/* STATIONS IN THIS DIVISION */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-3">
          <h3 className="text-sm font-bold text-[#111111] font-mono uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-black" />
            <span>Stations in {selectedDivision.name} Division ({divisionStations.length})</span>
          </h3>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station in division..."
              value={stnQuery}
              onChange={(e) => setStnQuery(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-9 pr-3 py-1.5 text-xs text-black placeholder:text-[#777777] focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {loadingStations ? (
          <div className="flex items-center justify-center p-12 text-xs font-mono text-[#555555] gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            <span>Loading division stations...</span>
          </div>
        ) : divisionStations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {divisionStations.map((stn, idx) => (
              <div
                key={`${stn.code}-${idx}`}
                onClick={() => {
                  setSelectedStation(stn);
                  navigate(`/railway-network/stations/${stn.code}`);
                }}
                className="p-4 rounded-xl bg-white border border-[#E5E5E5] hover:border-black hover:bg-[#F7F7F7] cursor-pointer transition-all shadow-sm group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                    {stn.code}
                  </span>
                  {stn.state && (
                    <span className="text-[9px] font-mono text-[#555555] bg-[#F7F7F7] px-2 py-0.5 rounded border border-[#E5E5E5]">
                      {stn.state}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-black text-sm group-hover:underline leading-tight">
                    {stn.name}
                  </h4>
                  <p className="text-[10px] text-[#555555] font-mono mt-0.5">
                    Code: {stn.code}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#555555]">View Station</span>
                  <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] text-xs font-mono text-[#555555]">
            No stations found matching query in this division.
          </div>
        )}
      </div>
    </div>
  );
}
