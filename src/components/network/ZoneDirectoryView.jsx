import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Search,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Building2,
  X
} from 'lucide-react';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import { getZones } from '../../services/railwayNetworkService';

export default function ZoneDirectoryView() {
  const navigate = useNavigate();
  const { setSelectedZone } = useRailwayNetwork();

  const [query, setQuery] = useState('');

  const allZones = useMemo(() => getZones(), []);

  const filteredZones = useMemo(() => {
    if (!query.trim()) return allZones;
    const q = query.trim().toLowerCase();
    return allZones.filter(z =>
      z.name.toLowerCase().includes(q) ||
      z.code.toLowerCase().includes(q) ||
      (z.hq && z.hq.toLowerCase().includes(q))
    );
  }, [allZones, query]);

  return (
    <div className="space-y-6 pb-12 font-sans bg-white text-[#111111] p-6">
      {/* TOP BAR WITH BACK BUTTON */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-black border border-[#D9D9D9] px-4 py-2 rounded-lg text-xs font-bold transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold">
          <span>RAILWAY NETWORK</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
          <span className="text-black bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]">
            ZONE DIRECTORY
          </span>
        </div>
      </div>

      {/* DIRECTORY HEADER & SEARCH */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold uppercase mb-1">
              <Grid className="w-4 h-4 text-black" />
              <span>INDIAN RAILWAYS ZONAL DIRECTORY</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              ALL OPERATIONAL RAILWAY ZONES
            </h2>
            <p className="text-xs text-[#555555] max-w-3xl mt-1 font-medium">
              Browse all {allZones.length} administrative Indian Railway zones. Click any zone to open its dedicated details view, headquarters, and division registry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-black bg-white px-3 py-2 rounded-lg border border-[#E5E5E5] shadow-sm">
              TOTAL ZONES: {allZones.length}
            </span>

            <div className="relative w-64">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search zone name / code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-9 pr-8 py-2 text-xs text-black placeholder:text-[#777777] focus:outline-none focus:border-black"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#777777] hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ZONE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredZones.map((zone) => (
          <div
            key={zone.code}
            onClick={() => {
              setSelectedZone(zone);
              navigate(`/railway-network/zones/${zone.code}`);
            }}
            className="p-5 rounded-xl bg-white border border-[#E5E5E5] hover:border-black hover:bg-[#F7F7F7] cursor-pointer transition-all shadow-sm group space-y-3 flex flex-col justify-between"
          >
            {/* CARD TOP */}
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-lg bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center shadow-sm">
                {zone.code}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#555555] bg-[#F7F7F7] px-2 py-0.5 rounded border border-[#E5E5E5]">
                {zone.divisions ? zone.divisions.length : 0} DIVISIONS
              </span>
            </div>

            {/* CARD BODY */}
            <div>
              <h3 className="font-bold text-black text-base group-hover:underline leading-tight">
                {zone.name}
              </h3>
              <p className="text-xs text-[#555555] font-mono mt-1 font-semibold">
                HQ: <strong className="text-black">{zone.hq || 'Zonal HQ'}</strong>
              </p>
            </div>

            {/* CARD FOOTER */}
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
              <span className="text-black font-bold">Open Zone Details</span>
              <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className="p-12 text-center bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] text-xs font-mono text-[#555555]">
          No railway zone found matching "{query}".
        </div>
      )}
    </div>
  );
}
