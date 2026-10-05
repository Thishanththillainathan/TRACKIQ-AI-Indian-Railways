import React, { useState } from 'react';
import { X, Database, Layers, Search, Copy, Check } from 'lucide-react';

export default function AssetDetailsModal({ asset, isOpen, onClose }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !asset) return null;

  // Format field keys for human readability
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\.1/g, ' (Alt)')
      .replace(/\.2/g, ' (Sec)')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const allEntries = Object.entries(asset)
    .filter(([k]) => !['department', 'source_table'].includes(k))
    .map(([k, v]) => [
      k,
      (v === null || v === undefined || strVal(v).trim() === '') ? 'N/A' : v
    ]);

  function strVal(v) {
    if (v === null || v === undefined) return '';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }

  const filteredEntries = allEntries.filter(([k, v]) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return k.toLowerCase().includes(q) || strVal(v).toLowerCase().includes(q);
  });

  const recordId = asset["Asset ID"] || asset.asset_id || asset.Asset_ID || asset["Request ID"] || asset.request_id || asset.Request_ID || 'Record Details';

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(asset, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-blue-400 uppercase">
                <span>{asset.department || 'RAILWAY'} DATASET SPECIFICATION</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                  SOURCE: {asset.source_table || '3dept.xlsx'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {recordId}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 border border-slate-700 transition"
              title="Copy Raw JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable Data Key-Value Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Record Identifier</span>
              <span className="text-sm font-extrabold text-blue-400 truncate block">
                {recordId}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Asset / Work Type</span>
              <span className="text-sm font-bold text-slate-200 truncate block">
                {asset["Asset Type"] || asset.asset_category || asset.subsystem || asset["Work Type"] || asset["Block Type"] || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Station / Location</span>
              <span className="text-sm font-bold text-emerald-400 truncate block">
                {asset.Station || asset.station_name || asset.station_code || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Zone / Division</span>
              <span className="text-sm font-bold text-amber-400 truncate block">
                {asset.Zone || asset.zone || asset.Zone_Code || 'N/A'} / {asset.Division || asset.division || 'N/A'}
              </span>
            </div>
          </div>

          {/* Search inside fields */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Complete Dataset Attributes ({allEntries.length} Source Fields)</span>
            </h3>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter attributes..."
                className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-blue-500 w-full"
              />
            </div>
          </div>

          {/* Full Key-Value Field Registry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {filteredEntries.map(([key, val]) => (
              <div
                key={key}
                className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg flex flex-col justify-center space-y-1"
              >
                <span className="text-[10px] text-slate-400 font-bold uppercase truncate">
                  {formatKey(key)}
                </span>
                <span className={`text-xs font-semibold break-words ${val === 'N/A' ? 'text-slate-500 italic' : 'text-slate-100'}`}>
                  {strVal(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Source Dataset: {asset.source_table || '3dept.xlsx'} | Records Grounded
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg shadow transition"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
