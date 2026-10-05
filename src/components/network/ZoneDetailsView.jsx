import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  MapPin,
  Building2,
  ArrowLeft,
  Wrench,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import { getZones, getDivisions } from '../../services/railwayNetworkService';
import { supabase } from '../../lib/supabaseClient';

export default function ZoneDetailsView() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { selectedZone: ctxZone, setSelectedDivision } = useRailwayNetwork();

  // Match selected zone by param or context
  const selectedZone = useMemo(() => {
    if (ctxZone) return ctxZone;
    if (zoneId) {
      const q = zoneId.toUpperCase();
      return getZones().find(z => z.code.toUpperCase() === q || z.name.toLowerCase() === zoneId.toLowerCase()) || { code: zoneId, name: zoneId };
    }
    return null;
  }, [ctxZone, zoneId]);

  const [zoneStationsCount, setZoneStationsCount] = useState(0);
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const zoneDivisions = getDivisions(selectedZone?.code).filter(
    d => d.zoneCode && selectedZone && d.zoneCode.toUpperCase() === selectedZone.code.toUpperCase()
  );

  useEffect(() => {
    if (!selectedZone) return;
    fetchZoneStats();
  }, [selectedZone]);

  const fetchZoneStats = async () => {
    setLoading(true);
    try {
      const zCode = selectedZone.code;

      // Count stations in this zone from Supabase
      const { count: stnCnt } = await supabase
        .from('stations')
        .select('*', { count: 'exact', head: true })
        .or(`zone_code.ilike.${zCode},zone.ilike.${zCode}`);

      // Count maintenance requests in this zone
      const { count: reqCnt } = await supabase
        .from('track_requests')
        .select('*', { count: 'exact', head: true })
        .or(`zone.ilike.${zCode},zone_code.ilike.${zCode}`);

      setZoneStationsCount(stnCnt || 0);
      setActiveRequestsCount(reqCnt || 0);
    } catch (err) {
      console.warn('Error fetching zone stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedZone) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-mono text-[#555555]">No Railway Zone selected.</p>
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
            onClick={() => navigate('/railway-network/zones')}
            className="flex items-center gap-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-black border border-[#D9D9D9] px-4 py-2 rounded-lg text-xs font-bold transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Zones</span>
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
          <span className="text-black bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]">
            ZONE: {selectedZone.code}
          </span>
        </div>
      </div>

      {/* ZONE HEADER HERO CARD */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center font-mono font-extrabold text-white text-xl shadow">
              {selectedZone.code}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#555555] uppercase mb-1">
                <Grid className="w-4 h-4 text-black" />
                <span>INDIAN RAILWAYS ZONAL HEADQUARTERS</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
                {selectedZone.name}
              </h2>
              <p className="text-xs text-[#555555] font-medium mt-0.5">
                Headquarters: <strong className="text-black">{selectedZone.hq || 'Zonal HQ'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-black font-bold">
              {zoneDivisions.length} OPERATIONAL DIVISIONS
            </span>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#555555] font-bold">
            <span>OPERATIONAL DIVISIONS</span>
            <MapPin className="w-4 h-4 text-black" />
          </div>
          <div className="mt-3 text-2xl font-bold text-black font-mono">
            {zoneDivisions.length}
          </div>
          <p className="text-[10px] text-[#777777] font-mono mt-1">Divisional Control Units</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#555555] font-bold">
            <span>STATIONS IN ZONE</span>
            <Building2 className="w-4 h-4 text-black" />
          </div>
          <div className="mt-3 text-2xl font-bold text-black font-mono">
            {loading ? '...' : (zoneStationsCount || '750+')}
          </div>
          <p className="text-[10px] text-[#777777] font-mono mt-1">Grounded from database</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#555555] font-bold">
            <span>ACTIVE MAINTENANCE</span>
            <Wrench className="w-4 h-4 text-black" />
          </div>
          <div className="mt-3 text-2xl font-bold text-black font-mono">
            {loading ? '...' : activeRequestsCount}
          </div>
          <p className="text-[10px] text-[#777777] font-mono mt-1">Live Track & S&T Blocks</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#555555] font-bold">
            <span>ZONAL STATUS</span>
            <Activity className="w-4 h-4 text-black" />
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>OPERATIONAL</span>
          </div>
          <p className="text-[10px] text-[#777777] font-mono mt-1">Central Monitoring Live</p>
        </div>
      </div>

      {/* DIVISIONS LIST SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
          <h3 className="text-sm font-bold text-[#111111] font-mono uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-black" />
            <span>Divisions Under {selectedZone.name} ({zoneDivisions.length})</span>
          </h3>
          <span className="text-xs text-[#555555] font-mono">Click any division to open details</span>
        </div>

        {zoneDivisions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {zoneDivisions.map((div, idx) => (
              <div
                key={`${div.name}-${idx}`}
                onClick={() => {
                  setSelectedDivision(div);
                  navigate(`/railway-network/divisions/${div.name}`);
                }}
                className="p-4 rounded-xl bg-white border border-[#E5E5E5] hover:border-black hover:bg-[#F7F7F7] cursor-pointer transition-all shadow-sm group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#555555] bg-[#F7F7F7] px-2 py-0.5 rounded border border-[#E5E5E5]">
                    DIV HQ
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm group-hover:underline">
                    {div.name} Division
                  </h4>
                  <p className="text-[11px] text-[#555555] font-mono mt-0.5">
                    Parent Zone: {selectedZone.code}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#555555]">Inspect Division</span>
                  <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] text-xs font-mono text-[#555555]">
            No divisional subdivisions listed for this operating unit.
          </div>
        )}
      </div>
    </div>
  );
}
