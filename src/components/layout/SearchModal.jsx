import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, Wrench, FileText, Bot, MapPin } from 'lucide-react';
import { STATIONS, STATION_ASSETS, MAINTENANCE_REQUESTS, RAILWAY_ZONES } from '../../data/mockData';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredStations = STATIONS.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.code.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAssets = STATION_ASSETS.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) || 
    a.id.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRequests = MAINTENANCE_REQUESTS.filter(r => 
    r.id.toLowerCase().includes(query.toLowerCase()) || 
    r.problem.toLowerCase().includes(query.toLowerCase())
  );

  const filteredZones = RAILWAY_ZONES.filter(z =>
    z.name.toLowerCase().includes(query.toLowerCase()) ||
    z.code.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectStation = (stationCode) => {
    onClose();
    navigate(`/stations?code=${stationCode}`);
  };

  const handleSelectAsset = (assetId) => {
    onClose();
    navigate(`/assets?id=${assetId}`);
  };

  const handleSelectRequest = (requestId) => {
    onClose();
    navigate(`/requests?id=${requestId}`);
  };

  const handleSelectZone = (zoneId) => {
    onClose();
    navigate(`/zones?zone=${zoneId}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B1F3A] border border-[#12345A] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#12345A] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#1D4ED8]" />
          <input
            type="text"
            autoFocus
            placeholder="Search Station (e.g. Coimbatore, MAS), Asset ID, Request, Zone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-white placeholder-slate-400 font-sans text-sm focus:outline-none w-full"
          />
          <button onClick={onClose} className="p-1 hover:bg-[#12345A] text-slate-300 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 font-sans">
          {/* Quick Zone Results */}
          {filteredZones.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-slate-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1D4ED8]" /> Railway Zones
              </p>
              <div className="grid grid-cols-2 gap-2">
                {filteredZones.slice(0, 4).map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => handleSelectZone(zone.id)}
                    className="p-2 bg-[#071426]/80 hover:bg-[#12345A]/60 border border-[#12345A] rounded-lg text-left transition-all text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-white">{zone.name}</span>
                      <span className="text-[10px] text-slate-300 block">{zone.hq} HQ</span>
                    </div>
                    <span className="text-[10px] font-mono bg-[#1D4ED8] text-white px-1.5 py-0.5 rounded">
                      {zone.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Station Results */}
          {filteredStations.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-slate-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Stations ({filteredStations.length})
              </p>
              <div className="space-y-1">
                {filteredStations.map(stn => (
                  <button
                    key={stn.id}
                    onClick={() => handleSelectStation(stn.code)}
                    className="w-full p-2.5 bg-[#071426]/60 hover:bg-[#12345A]/60 border border-[#12345A] rounded-lg text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono bg-[#1D4ED8] text-white px-2 py-0.5 rounded font-bold text-[11px]">
                        {stn.code}
                      </span>
                      <div>
                        <span className="font-semibold text-white">{stn.name}</span>
                        <span className="text-[10px] text-slate-300 block">{stn.state} • {stn.platforms} Platforms</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-white bg-[#12345A] px-2 py-0.5 rounded border border-[#12345A]">
                      {stn.availability}% Health
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Asset Results */}
          {filteredAssets.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-slate-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#1D4ED8]" /> Railway Assets ({filteredAssets.length})
              </p>
              <div className="space-y-1">
                {filteredAssets.map(ast => (
                  <button
                    key={ast.id}
                    onClick={() => handleSelectAsset(ast.id)}
                    className="w-full p-2.5 bg-[#071426]/60 hover:bg-[#12345A]/60 border border-[#12345A] rounded-lg text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-[#1D4ED8] text-[11px] block">{ast.id}</span>
                      <span className="font-semibold text-white">{ast.name}</span>
                      <span className="text-[10px] text-slate-300 block">Dept: {ast.dept} • Station: {ast.stationCode}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      ast.status === 'CRITICAL' ? 'bg-[#0B1F3A] text-white border border-[#12345A]' :
                      ast.status === 'UPCOMING' ? 'bg-[#12345A] text-slate-200 border border-[#12345A]' :
                      'bg-[#0B1F3A] text-white border border-[#12345A]'
                    }`}>
                      {ast.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Requests */}
          {filteredRequests.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-slate-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1D4ED8]" /> Maintenance Requests ({filteredRequests.length})
              </p>
              <div className="space-y-1">
                {filteredRequests.map(req => (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequest(req.id)}
                    className="w-full p-2.5 bg-[#071426]/60 hover:bg-[#12345A]/60 border border-[#12345A] rounded-lg text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-slate-300 text-[11px] block">{req.id} • {req.dept}</span>
                      <span className="font-semibold text-white">{req.problem}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-[#0B1F3A] text-white px-2 py-0.5 rounded border border-[#12345A]">
                      {req.safetyCriticality}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredStations.length === 0 && filteredAssets.length === 0 && filteredRequests.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-8">
              No railway entities matching "{query}" found in prototype database.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
