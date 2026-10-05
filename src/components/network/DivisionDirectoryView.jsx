import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  ArrowLeft,
  ChevronRight,
  Grid,
  X
} from 'lucide-react';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import { getDivisions, getZones } from '../../services/railwayNetworkService';

export default function DivisionDirectoryView() {
  const navigate = useNavigate();
  const { setSelectedDivision } = useRailwayNetwork();

  const [query, setQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');

  const allZones = useMemo(() => getZones(), []);
  const allDivisions = useMemo(() => getDivisions(), []);

  const filteredDivisions = useMemo(() => {
    let result = allDivisions;

    if (selectedZoneFilter !== 'ALL') {
      result = result.filter(d => d.zoneCode && d.zoneCode.toUpperCase() === selectedZoneFilter.toUpperCase());
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.zoneName && d.zoneName.toLowerCase().includes(q)) ||
        (d.zoneCode && d.zoneCode.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allDivisions, selectedZoneFilter, query]);

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
            DIVISION DIRECTORY
          </span>
        </div>
      </div>

      {/* DIRECTORY HEADER & SEARCH & ZONE FILTER */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold uppercase mb-1">
              <MapPin className="w-4 h-4 text-black" />
              <span>INDIAN RAILWAYS DIVISIONAL DIRECTORY</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              ALL RAILWAY DIVISIONS
            </h2>
            <p className="text-xs text-[#555555] max-w-3xl mt-1 font-medium">
              Browse all {allDivisions.length} operational railway divisions across Indian Railways. Filter by parent zone or search by division name.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-black bg-white px-3 py-2 rounded-lg border border-[#E5E5E5] shadow-sm">
              TOTAL DIVISIONS: {allDivisions.length}
            </span>

            {/* Zone Filter Dropdown */}
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
            >
              <option value="ALL">All Zones (19)</option>
              {allZones.map(z => (
                <option key={z.code} value={z.code}>
                  {z.code} — {z.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-60">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search division name..."
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

      {/* DIVISIONS TABLE */}
      <div className="border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#F7F7F7] text-[#555555] font-mono uppercase font-bold text-[10px] border-b border-[#E5E5E5]">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">DIVISION NAME</th>
              <th className="py-3 px-4">PARENT ZONE</th>
              <th className="py-3 px-4">ZONE CODE</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] bg-white">
            {filteredDivisions.map((div, idx) => (
              <tr
                key={`${div.name}-${idx}`}
                onClick={() => {
                  setSelectedDivision(div);
                  navigate(`/railway-network/divisions/${div.name}`);
                }}
                className="hover:bg-[#F7F7F7] cursor-pointer transition-colors group"
              >
                <td className="py-3 px-4 font-mono font-bold text-[#555555]">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 font-bold text-black text-sm group-hover:underline">
                  {div.name} Division
                </td>
                <td className="py-3 px-4 font-medium text-black">
                  {div.zoneName || 'Indian Railways'}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-black">
                  <span className="bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 rounded">
                    {div.zoneCode || 'IR'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-black group-hover:underline">
                    <span>Open Details</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDivisions.length === 0 && (
          <div className="p-12 text-center text-xs font-mono text-[#555555]">
            No divisions found matching filters.
          </div>
        )}
      </div>
    </div>
  );
}
