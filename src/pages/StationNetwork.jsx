import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STATIONS as MOCK_STATIONS } from '../data/mockData';
import {
  Building2,
  Search,
  ArrowRight,
  MapPin,
  Activity,
  AlertTriangle,
  Wrench,
  TrainFront,
  RefreshCw,
  Database,
  Satellite,
} from 'lucide-react';
import StationSatelliteView from './StationSatelliteView';
import StationSatelliteModal from '../components/map/StationSatelliteModal';
import { supabase } from '../lib/supabaseClient';

// Normalise a Supabase station row into the shape StationSatelliteView expects
function normSupabaseStation(row) {
  return {
    id: row.id || row.station_code,
    code: row.station_code,
    name: row.station_name,
    station_code: row.station_code,
    station_name: row.station_name,
    zone_code: row.zone_code || '',
    zone_name: row.zone_name || '',
    zoneId: row.zone_code || '',
    state: row.state || '',
    division: row.division || '',
    latitude: row.latitude,
    longitude: row.longitude,
    lat: row.latitude,
    lon: row.longitude,
    station_type: row.station_type || '',
    google_maps_url: row.google_maps_url || (row.latitude && row.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${row.latitude},${row.longitude}`
      : ''),
    // fields StationSatelliteView may read:
    platforms: '',
    tracks: '',
    assetsCount: 0,
    availability: 100,
    activeMaintenance: 0,
    alertsCount: 0,
    aliases: [],
  };
}

export default function StationNetwork() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stationCodeParam = searchParams.get('code');

  const [query, setQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [activeModalStation, setActiveModalStation] = useState(null);

  // ── Station data state ─────────────────────────────────────
  const [supabaseStations, setSupabaseStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [dataSource, setDataSource] = useState('loading'); // 'supabase' | 'mock'

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoadingStations(true);
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('station_name', { ascending: true })
        .limit(10000);

      if (!error && data && data.length > 0) {
        setSupabaseStations(data.map(normSupabaseStation));
        setDataSource('supabase');
      } else {
        setDataSource('mock');
      }
    } catch {
      setDataSource('mock');
    } finally {
      setLoadingStations(false);
    }
  };

  // Use Supabase stations if available, otherwise fall back to mockData
  const STATIONS = supabaseStations.length > 0 ? supabaseStations : MOCK_STATIONS;

  // ============================================================
  // OPEN STATION FROM URL
  // ============================================================

  const selectedStation = useMemo(() => {
    if (!stationCodeParam) return null;

    const normalizedCode = stationCodeParam.trim().toUpperCase();

    return (
      STATIONS.find(
        (station) =>
          station.code?.toUpperCase() === normalizedCode
      ) || null
    );
  }, [stationCodeParam]);

  // ============================================================
  // IF URL CONTAINS STATION CODE
  // SHOW STATION DETAIL PAGE
  // ============================================================

  if (stationCodeParam) {
    if (!selectedStation) {
      return (
        <div className="min-h-[500px] flex items-center justify-center px-6 bg-white">
          <div className="max-w-md w-full bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-8 text-center shadow-md">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-[#111111]" />
            </div>

            <h2 className="text-xl font-bold text-[#111111]">
              Station Not Found
            </h2>

            <p className="text-sm text-[#555555] mt-2">
              No station exists with code:
            </p>

            <div className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-[#111111] font-mono font-bold">
              {stationCodeParam}
            </div>

            <button
              onClick={() => navigate('/stations')}
              className="mt-6 px-5 py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-xs font-mono font-bold transition-all shadow-sm"
            >
              ← BACK TO STATION NETWORK
            </button>
          </div>
        </div>
      );
    }

    return (
      <StationSatelliteView
        station={selectedStation}
        onBack={() => navigate('/stations')}
      />
    );
  }

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const filteredStations = STATIONS.filter((station) => {
    const searchText = query.trim().toLowerCase();

    const matchesQuery =
      !searchText ||
      station.name?.toLowerCase().includes(searchText) ||
      station.code?.toLowerCase().includes(searchText) ||
      station.state?.toLowerCase().includes(searchText) ||
      (station.aliases || []).some((alias) =>
        alias.toLowerCase().includes(searchText)
      );

    const matchesZone =
      selectedZoneFilter === 'ALL' ||
      station.zoneId === selectedZoneFilter;

    return matchesQuery && matchesZone;
  });

  // ============================================================
  // OPEN STATION
  // ============================================================

  const openStation = (station) => {
    if (!station?.code) {
      console.error('Station code missing:', station);
      return;
    }
    setActiveModalStation(station);
    navigate(
      `/stations?code=${encodeURIComponent(
        station.code.toUpperCase()
      )}`,
      { replace: true }
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-white p-2">

      {/* HEADER */}
      <div className="vision-card rounded-2xl p-5 border border-white/12 backdrop-blur-2xl bg-white/[0.045] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C6F432] font-bold uppercase mb-1">
              <Building2 className="w-4 h-4 text-[#C6F432]" />
              <span>INDIAN RAILWAYS STATION DIRECTORY</span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              SEARCH & DRILL DOWN INTO RAILWAY STATIONS
            </h2>

            <p className="text-xs text-[#555555] max-w-3xl mt-1 font-medium">
              Select any railway station to inspect its infrastructure, assets, maintenance condition, telemetry and AI block planning context.
            </p>
          </div>

          {/* SEARCH */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search station / code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-9 pr-3 py-2 text-xs text-[#111111] placeholder:text-[#777777] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] font-bold rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Zones</option>
              <option value="SR">Southern Railway</option>
              <option value="CR">Central Railway</option>
              <option value="NR">Northern Railway</option>
              <option value="ER">Eastern Railway</option>
              <option value="WR">Western Railway</option>
              <option value="SWR">South Western Railway</option>
              <option value="SCR">South Central Railway</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULT COUNT */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-semibold">
          <MapPin className="w-4 h-4 text-[#111111]" />
          {loadingStations ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#111111]" />
              Loading stations…
            </span>
          ) : (
            <>
              Showing <span className="text-[#111111] font-bold">{filteredStations.length}</span> stations
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded border font-bold text-[#111111] border-[#E5E5E5] bg-[#F7F7F7]">
                <Database className="w-3 h-3 inline mr-1 text-[#111111]" />
                {dataSource === 'supabase' ? 'Supabase stations table' : 'Mock data (Supabase stations table empty)'}
              </span>
            </>
          )}
        </div>

        <div className="text-[10px] font-mono text-[#777777] font-bold">
          CLICK ANY STATION TO OPEN DETAILS
        </div>
      </div>

      {/* STATION CARDS */}
      {filteredStations.length === 0 ? (
        <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-10 text-center shadow-sm">
          <Search className="w-10 h-10 mx-auto text-[#777777] mb-3" />
          <h3 className="text-[#111111] font-bold">No stations found</h3>
          <p className="text-xs text-[#555555] mt-1">Try another station name or station code.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => (
            <button
              key={station.id}
              onClick={() => openStation(station)}
              className="text-left vision-card rounded-xl p-5 border border-white/12 space-y-4 cursor-pointer group shadow-sm hover:border-[#C6F432]/50 hover:bg-white/[0.08] transition-all bg-white/[0.045] text-white"
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#C6F432]/20 border border-[#C6F432]/40 flex items-center justify-center font-mono font-bold text-[#C6F432] text-sm shadow-sm">
                    {station.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-[#C6F432] leading-tight transition-colors">
                      {station.name}
                    </h3>
                    <span className="text-[11px] font-mono text-white/60 font-semibold block mt-1">
                      {station.state} • Zone: {station.zoneId || station.zone_code || 'IR'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-[#C6F432] bg-[#C6F432]/10 px-2 py-1 rounded border border-[#C6F432]/30">
                  {station.availability}%
                </span>
              </div>

              {/* METRICS */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-white/[0.03] p-3 rounded-lg border border-white/10">
                <div>
                  <span className="text-white/50 block text-[10px] font-bold">Platforms</span>
                  <span className="font-bold text-white text-sm">{station.platforms || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px] font-bold">Tracks</span>
                  <span className="font-bold text-white text-sm">{station.tracks || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px] font-bold">Assets</span>
                  <span className="font-bold text-white text-sm">{station.assetsCount || 0}</span>
                </div>
              </div>

              {/* STATUS */}
              <div className="flex flex-wrap gap-2">
                {station.activeMaintenance > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded font-mono font-bold flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-amber-300" />
                    {station.activeMaintenance} Active
                  </span>
                )}

                {station.alertsCount > 0 && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-1 rounded font-mono font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-300" />
                    {station.alertsCount} Alerts
                  </span>
                )}

                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded font-mono font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-300" />
                  Operational
                </span>
              </div>

              {/* OPEN */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-white/50 font-mono font-bold">
                  STATION CODE: {station.code}
                </span>

                <span className="text-xs text-[#C6F432] font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open Station
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeModalStation && (
        <StationSatelliteModal
          station={activeModalStation}
          onClose={() => setActiveModalStation(null)}
        />
      )}
    </div>
  );
}