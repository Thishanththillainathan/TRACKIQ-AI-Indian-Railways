import React from 'react';
import { Cpu } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm font-sans">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="p-1 bg-black text-white rounded shrink-0">
          <Cpu className="w-3.5 h-3.5 text-white" />
        </span>
        <h2 className="text-xs sm:text-sm font-extrabold text-[#111111] tracking-tight leading-snug break-words">
          AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways
        </h2>
      </div>
    </div>
  );
}
