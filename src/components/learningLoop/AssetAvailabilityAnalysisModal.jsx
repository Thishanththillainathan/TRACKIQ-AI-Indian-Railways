import React from 'react';
import { X, Activity } from 'lucide-react';
import AssetAvailabilityAnalyzerView from './AssetAvailabilityAnalyzerView';

export default function AssetAvailabilityAnalysisModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto font-sans text-[#111111] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-[#111111] text-white px-5 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                <span>Learning Loop Outcome Module</span>
                <span>•</span>
                <span className="text-emerald-400">Day & Date Wise Asset Telemetry</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Asset Availability Analyzer Modal
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAFAFA]">
          <AssetAvailabilityAnalyzerView inModal={true} onClose={onClose} />
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white border-t border-[#E5E5E5] px-6 py-3 flex items-center justify-end font-mono text-xs">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-bold rounded-lg shadow-sm transition-all"
          >
            CLOSE ANALYSIS
          </button>
        </div>

      </div>
    </div>
  );
}
