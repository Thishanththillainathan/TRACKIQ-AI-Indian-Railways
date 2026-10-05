import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Network,
  Grid,
  MapPin,
  Building2,
  ChevronRight,
  X
} from 'lucide-react';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import { getZones, getDivisions, getNetworkKPIs } from '../../services/railwayNetworkService';

export default function SidebarRailwayNetwork() {
  const location = useLocation();
  const { selectedZone, selectedDivision, selectedStation, clearNetworkFilter } = useRailwayNetwork();

  // Master counts dynamically calculated
  const totalZones = useMemo(() => getZones().length, []);
  const totalDivisions = useMemo(() => getDivisions().length, []);
  const totalStationsCount = useMemo(() => getNetworkKPIs().totalStations, []);

  const isZonesActive = location.pathname.startsWith('/railway-network/zones');
  const isDivisionsActive = location.pathname.startsWith('/railway-network/divisions');
  const isStationsActive = location.pathname.startsWith('/railway-network/stations');

  return (
    <div className="space-y-1 pt-2 border-t border-white/10">
      {/* SECTION HEADER */}
      <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-extrabold text-white/40 uppercase tracking-widest font-mono">
        <div className="flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-[#C6F432]" />
          <span>Railway Network</span>
        </div>
        {(selectedZone || selectedDivision || selectedStation) && (
          <button
            onClick={clearNetworkFilter}
            className="text-[9px] text-[#C6F432] bg-[#C6F432]/18 border border-[#C6F432]/45 hover:bg-[#C6F432]/30 px-2 py-0.5 rounded-full font-bold transition-all flex items-center gap-1 shadow-sm shadow-[#C6F432]/10"
            title="Clear Railway Network Filters"
          >
            <X className="w-2.5 h-2.5 text-[#C6F432]" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ACTIVE FILTER SUMMARY BADGE IF SET */}
      {(selectedZone || selectedDivision || selectedStation) && (
        <div className="mx-3 my-1 p-2.5 rounded-2xl bg-white/10 border border-white/15 text-[10px] font-mono leading-tight space-y-1">
          <div className="text-[#C6F432] font-extrabold flex items-center justify-between">
            <span>ACTIVE SELECTION:</span>
            <span className="w-2 h-2 rounded-full bg-[#C6F432] animate-pulse"></span>
          </div>
          {selectedZone && (
            <div className="font-bold text-white truncate">
              Zone: <span className="text-white/80">{selectedZone.name} ({selectedZone.code})</span>
            </div>
          )}
          {selectedDivision && (
            <div className="font-bold text-white truncate">
              Div: <span className="text-white/80">{selectedDivision.name}</span>
            </div>
          )}
          {selectedStation && (
            <div className="font-bold text-white truncate">
              Stn: <span className="text-white/80">{selectedStation.name} ({selectedStation.code})</span>
            </div>
          )}
        </div>
      )}

      {/* 1. ZONES DEDICATED ROUTE LINK */}
      <NavLink
        to="/railway-network/zones"
        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs transition-all ${
          isZonesActive
            ? 'bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold shadow-sm shadow-[#C6F432]/10'
            : 'text-white/70 bg-transparent border border-transparent hover:bg-white/10 hover:text-white font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Grid className={`w-3.5 h-3.5 shrink-0 ${isZonesActive ? 'text-[#C6F432]' : 'text-white/80'}`} />
          <span>Zones</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
            isZonesActive ? 'bg-[#C6F432]/25 text-[#C6F432]' : 'bg-white/10 text-white/60 border border-white/10'
          }`}>
            {totalZones}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 ${isZonesActive ? 'text-[#C6F432]' : 'text-white/60'}`} />
        </div>
      </NavLink>

      {/* 2. DIVISIONS DEDICATED ROUTE LINK */}
      <NavLink
        to="/railway-network/divisions"
        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs transition-all ${
          isDivisionsActive
            ? 'bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold shadow-sm shadow-[#C6F432]/10'
            : 'text-white/70 bg-transparent border border-transparent hover:bg-white/10 hover:text-white font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDivisionsActive ? 'text-[#C6F432]' : 'text-white/80'}`} />
          <span>Divisions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
            isDivisionsActive ? 'bg-[#C6F432]/25 text-[#C6F432]' : 'bg-white/10 text-white/60 border border-white/10'
          }`}>
            {totalDivisions}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 ${isDivisionsActive ? 'text-[#C6F432]' : 'text-white/60'}`} />
        </div>
      </NavLink>

      {/* 3. STATIONS DEDICATED ROUTE LINK */}
      <NavLink
        to="/railway-network/stations"
        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs transition-all ${
          isStationsActive
            ? 'bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold shadow-sm shadow-[#C6F432]/10'
            : 'text-white/70 bg-transparent border border-transparent hover:bg-white/10 hover:text-white font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Building2 className={`w-3.5 h-3.5 shrink-0 ${isStationsActive ? 'text-[#C6F432]' : 'text-white/80'}`} />
          <span>Stations</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
            isStationsActive ? 'bg-[#C6F432]/25 text-[#C6F432]' : 'bg-white/10 text-white/60 border border-white/10'
          }`}>
            {totalStationsCount.toLocaleString('en-IN')}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 ${isStationsActive ? 'text-[#C6F432]' : 'text-white/60'}`} />
        </div>
      </NavLink>
    </div>
  );
}
