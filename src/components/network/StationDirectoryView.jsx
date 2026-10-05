import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  X,
  MapPin,
  Grid,
  Satellite
} from 'lucide-react';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import { getZones, getDivisions, getStations } from '../../services/railwayNetworkService';
import StationSatelliteModal from '../map/StationSatelliteModal';

export default function StationDirectoryView() {
  const navigate = useNavigate();
  const { setSelectedStation } = useRailwayNetwork();

  const [query, setQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [selectedDivFilter, setSelectedDivFilter] = useState('ALL');

  const [stations, setStations] = useState([]);
  const [totalCount, setTotalCount] = useState(19299);
  const [loading, setLoading] = useState(true);
  const [activeSatelliteModalStation, setActiveSatelliteModalStation] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const allZones = useMemo(() => getZones(), []);
  const availableDivisions = useMemo(() => {
    return getDivisions(selectedZoneFilter === 'ALL' ? null : selectedZoneFilter);
  }, [selectedZoneFilter]);

  // Fetch stations with debounced query & pagination from master service
  useEffect(() => {
    fetchStationsData();
  }, [query, selectedZoneFilter, selectedDivFilter, page, pageSize]);

  const fetchStationsData = () => {
    setLoading(true);
    try {
      const res = getStations({
        page,
        limit: pageSize,
        search: query,
        zone: selectedZoneFilter === 'ALL' ? '' : selectedZoneFilter,
        division: selectedDivFilter === 'ALL' ? '' : selectedDivFilter
      });

      setStations(res.stations);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.warn('Error fetching stations directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans bg-white text-[#111111] p-6">
      {/* TOP BAR WITH BACK BUTTON */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-black border border-[#D9D9D9] px-4 py-2 rounded-lg text-xs font-bold transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold">
          <span>RAILWAY NETWORK</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
          <span className="text-black bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]">
            INDIAN RAILWAY STATION DIRECTORY
          </span>
        </div>
      </div>

      {/* DIRECTORY HEADER & SEARCH & FILTERS */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold uppercase mb-1">
              <Building2 className="w-4 h-4 text-black" />
              <span>OFFICIAL MASTER STATION DIRECTORY</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              INDIAN RAILWAY STATION DIRECTORY
            </h2>
            <p className="text-xs text-[#555555] max-w-3xl mt-1 font-medium">
              Complete catalog of deduplicated Indian Railway stations grounded from official S&T, TRD, CSV, and network master datasets. Search by station name or station code across all unique station records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-black bg-white px-3 py-2 rounded-lg border border-[#E5E5E5] shadow-sm">
              TOTAL UNIQUE STATIONS: {totalCount.toLocaleString('en-IN')}
            </span>

            {/* Zone Filter */}
            <select
              value={selectedZoneFilter}
              onChange={(e) => {
                setSelectedZoneFilter(e.target.value);
                setSelectedDivFilter('ALL');
                setPage(1);
              }}
              className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
            >
              <option value="ALL">All Zones (19)</option>
              {allZones.map(z => (
                <option key={z.code} value={z.code}>
                  {z.code} — {z.name}
                </option>
              ))}
            </select>

            {/* Division Filter */}
            <select
              value={selectedDivFilter}
              onChange={(e) => {
                setSelectedDivFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
            >
              <option value="ALL">All Divisions ({availableDivisions.length})</option>
              {availableDivisions.map(d => (
                <option key={`${d.name}-${d.zoneCode}`} value={d.name}>
                  {d.name} Division
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-64">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search station name / station code..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-9 pr-8 py-2 text-xs text-black placeholder:text-[#777777] focus:outline-none focus:border-black"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-[#777777] hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STATIONS TABLE */}
      <div className="border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm bg-white space-y-0">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#F7F7F7] text-[#555555] font-mono uppercase font-bold text-[10px] border-b border-[#E5E5E5]">
            <tr>
              <th className="py-3 px-4">STATION CODE</th>
              <th className="py-3 px-4">STATION NAME</th>
              <th className="py-3 px-4">DIVISION</th>
              <th className="py-3 px-4">ZONE CODE</th>
              <th className="py-3 px-4">STATE / REGION</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#555555]">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Searching complete Indian Railway station directory...</span>
                  </div>
                </td>
              </tr>
            ) : stations.length > 0 ? (
              stations.map((stn, idx) => (
                <tr
                  key={`${stn.code}-${idx}`}
                  onClick={() => {
                    setSelectedStation(stn);
                    navigate(`/railway-network/stations/${stn.code}`);
                  }}
                  className="hover:bg-[#F7F7F7] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-extrabold text-black">
                    <span className="w-12 h-7 rounded bg-black text-white flex items-center justify-center text-xs">
                      {stn.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-black text-sm group-hover:underline">
                    {stn.name}
                  </td>
                  <td className="py-3 px-4 font-medium text-black">
                    {stn.division ? `${stn.division} Division` : 'Divisional HQ'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-black">
                    <span className="bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 rounded">
                      {stn.zoneCode || stn.zoneName || 'IR'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#555555]">
                    {stn.state || 'India'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSatelliteModalStation(stn);
                        }}
                        className="flex items-center gap-1.5 bg-[#C6F432]/90 hover:bg-[#C6F432] text-black px-2.5 py-1 rounded text-xs font-mono font-bold transition shadow-sm"
                        title="Open Real Satellite View"
                      >
                        <Satellite className="w-3.5 h-3.5 text-black" />
                        <span>Satellite</span>
                      </button>

                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-black group-hover:underline">
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#555555]">
                  No station found matching query "{query}".
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION CONTROLS */}
        <div className="bg-[#F7F7F7] px-6 py-3 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#555555] font-bold">
            <span>Showing page <strong className="text-black">{page}</strong> of <strong className="text-black">{totalPages}</strong></span>
            <span>({totalCount.toLocaleString('en-IN')} total unique stations)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Select */}
            <div className="flex items-center gap-1 text-[11px] text-[#555555] font-bold">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-[#E5E5E5] rounded px-2 py-1 text-xs text-black focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
              </select>
            </div>

            {/* Pagination Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="px-2.5 py-1 bg-white hover:bg-[#E5E5E5] text-black border border-[#E5E5E5] rounded disabled:opacity-40 font-bold"
              >
                « First
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-2.5 py-1 bg-white hover:bg-[#E5E5E5] text-black border border-[#E5E5E5] rounded disabled:opacity-40 font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-3 py-1 bg-black text-white rounded font-bold">
                {page}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-2.5 py-1 bg-white hover:bg-[#E5E5E5] text-black border border-[#E5E5E5] rounded disabled:opacity-40 font-bold flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages}
                className="px-2.5 py-1 bg-white hover:bg-[#E5E5E5] text-black border border-[#E5E5E5] rounded disabled:opacity-40 font-bold"
              >
                Last »
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeSatelliteModalStation && (
        <StationSatelliteModal
          station={activeSatelliteModalStation}
          onClose={() => setActiveSatelliteModalStation(null)}
        />
      )}
    </div>
  );
}

