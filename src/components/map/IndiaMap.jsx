import React, { useState } from 'react';
import { RAILWAY_ZONES, CORRIDORS } from '../../data/mockData';
import { MapPin, Activity, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';

export default function IndiaMap({ onSelectZone }) {
  const [hoveredZone, setHoveredZone] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  // Major Railway Corridors paths on 0-100 coordinate map of India SVG
  const mapCorridors = [
    // Golden Quadrilateral
    { id: "GQ-DEL-MUM", from: { x: 40, y: 22 }, to: { x: 32, y: 52 }, label: "Delhi-Mumbai Trunk", status: "HEALTHY" },
    { id: "GQ-DEL-KOL", from: { x: 40, y: 22 }, to: { x: 74, y: 44 }, label: "Delhi-Kolkata Trunk", status: "UPCOMING_BLOCK" },
    { id: "GQ-MUM-CHE", from: { x: 32, y: 52 }, to: { x: 42, y: 78 }, label: "Mumbai-Chennai Trunk", status: "HEALTHY" },
    { id: "GQ-KOL-CHE", from: { x: 74, y: 44 }, to: { x: 42, y: 78 }, label: "Kolkata-Chennai Trunk", status: "ACTIVE_BLOCK" },
    { id: "GQ-DEL-CHE", from: { x: 40, y: 22 }, to: { x: 42, y: 78 }, label: "Grand Trunk Corridor", status: "HEALTHY" },
    // DFC Corridors
    { id: "DFC-EAST", from: { x: 40, y: 22 }, to: { x: 74, y: 44 }, label: "Eastern Dedicated Freight Corridor", status: "ACTIVE_BLOCK", isDfc: true },
    { id: "DFC-WEST", from: { x: 40, y: 22 }, to: { x: 26, y: 42 }, label: "Western Dedicated Freight Corridor", status: "HEALTHY", isDfc: true }
  ];

  return (
    <div className="relative w-full h-[520px] bg-[#071426] rounded-xl border border-[#12345A] overflow-hidden shadow-2xl flex flex-col justify-between select-none">
      {/* Map Control Header */}
      <div className="p-4 bg-[#0B1F3A] border-b border-[#12345A] flex flex-wrap items-center justify-between gap-3 z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
            <Radio className="w-4 h-4 text-[#1D4ED8] animate-pulse" />
            <span>ENTIRE INDIAN RAILWAYS NETWORK MAP</span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono">
            Interactive Zone Nodes • Active Corridor Maintenance • Real-Time AI Optimization
          </p>
        </div>

        {/* Legend Filter Tabs */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-md border transition-all ${
              activeTab === 'ALL'
                ? 'bg-[#1D4ED8] text-white border-white font-bold'
                : 'bg-[#071426] text-slate-300 border-[#12345A] hover:text-white'
            }`}
          >
            All 17 Zones
          </button>
          <button
            onClick={() => setActiveTab('BLOCKS')}
            className={`px-3 py-1 rounded-md border transition-all ${
              activeTab === 'BLOCKS'
                ? 'bg-[#12345A] text-white border-[#1D4ED8] font-bold'
                : 'bg-[#071426] text-slate-300 border-[#12345A] hover:text-white'
            }`}
          >
            Active Blocks (38)
          </button>
          <button
            onClick={() => setActiveTab('CRITICAL')}
            className={`px-3 py-1 rounded-md border transition-all ${
              activeTab === 'CRITICAL'
                ? 'bg-[#0B1F3A] text-white border-[#1D4ED8] font-bold'
                : 'bg-[#071426] text-slate-300 border-[#12345A] hover:text-white'
            }`}
          >
            Critical Maintenance (14)
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 bg-gradient-to-b from-[#071426] via-[#0B1F3A] to-[#020617]">
        {/* Background Radar Grid */}
        <div className="absolute inset-0 radar-bg opacity-30 pointer-events-none" />

        <svg viewBox="0 0 100 100" className="w-full h-full max-w-2xl max-h-[440px] drop-shadow-[0_0_25px_rgba(29,78,216,0.15)]">
          {/* India Boundary Outline Graphic */}
          <path
            d="M 38 12 Q 42 10 46 14 Q 50 16 54 18 L 60 22 Q 68 22 75 25 Q 85 24 90 28 L 88 34 L 80 34 L 75 40 L 72 48 L 66 58 L 56 68 L 46 84 L 42 88 L 38 80 L 34 72 L 32 60 L 26 50 L 22 38 L 26 28 L 32 20 Z"
            fill="rgba(11, 31, 58, 0.5)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Corridor Railway Lines */}
          {mapCorridors.map((c) => (
            <g key={c.id}>
              <line
                x1={c.from.x}
                y1={c.from.y}
                x2={c.to.x}
                y2={c.to.y}
                stroke={
                  c.status === 'ACTIVE_BLOCK' ? '#1D4ED8' :
                  c.status === 'UPCOMING_BLOCK' ? '#12345A' : '#12345A'
                }
                strokeWidth={c.isDfc ? '1.2' : '0.8'}
                strokeDasharray={c.isDfc ? '3 1.5' : c.status === 'ACTIVE_BLOCK' ? '2 2' : 'none'}
                className={c.status === 'ACTIVE_BLOCK' ? 'animated-rail-path' : ''}
              />
            </g>
          ))}

          {/* Zone Nodes */}
          {RAILWAY_ZONES.map((zone) => {
            const isHovered = hoveredZone?.id === zone.id;
            const hasActiveBlock = zone.activeBlocks > 0;
            const nodeColor = hasActiveBlock ? "#1D4ED8" : "#CBD5E1";

            return (
              <g
                key={zone.id}
                onClick={() => onSelectZone && onSelectZone(zone.id)}
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer group"
              >
                {/* Glowing Aura Ring */}
                <circle
                  cx={zone.mapPos.x}
                  cy={zone.mapPos.y}
                  r={hasActiveBlock ? 3.5 : 2.5}
                  fill={nodeColor}
                  fillOpacity={isHovered ? 0.6 : 0.3}
                  className={hasActiveBlock ? "animate-ping-slow" : ""}
                />

                {/* Core Node Circle */}
                <circle
                  cx={zone.mapPos.x}
                  cy={zone.mapPos.y}
                  r={isHovered ? 2.5 : 1.8}
                  fill={nodeColor}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                  className="transition-all duration-200"
                />

                {/* Zone Code Label */}
                <text
                  x={zone.mapPos.x}
                  y={zone.mapPos.y - 2.8}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="2.2"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                >
                  {zone.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Zone Detail Overlay Card */}
        {hoveredZone && (
          <div className="absolute top-6 right-6 w-72 bg-[#0B1F3A]/95 backdrop-blur-md border border-[#1D4ED8]/60 rounded-xl p-4 shadow-2xl z-20 font-sans animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#12345A] pb-2 mb-2">
              <div>
                <span className="text-[10px] font-mono text-[#1D4ED8] font-bold uppercase">{hoveredZone.code} ZONE</span>
                <h4 className="text-sm font-bold text-white leading-tight">{hoveredZone.name}</h4>
              </div>
              <span className="text-xs font-mono bg-[#071426] text-slate-200 px-2 py-0.5 rounded border border-[#12345A]">
                HQ: {hoveredZone.hq}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
              <div className="bg-[#071426]/80 p-2 rounded border border-[#12345A]">
                <span className="text-slate-300 block text-[10px]">Divisions</span>
                <span className="font-bold text-white text-sm">{hoveredZone.divisionsCount}</span>
              </div>
              <div className="bg-[#071426]/80 p-2 rounded border border-[#12345A]">
                <span className="text-slate-300 block text-[10px]">Stations</span>
                <span className="font-bold text-white text-sm">{hoveredZone.stationsCount}</span>
              </div>
              <div className="bg-[#071426]/80 p-2 rounded border border-[#12345A]">
                <span className="text-slate-300 block text-[10px]">Assets</span>
                <span className="font-bold text-white text-sm">{(hoveredZone.assetsCount / 1000).toFixed(0)}k</span>
              </div>
              <div className="bg-[#071426]/80 p-2 rounded border border-[#12345A]">
                <span className="text-slate-300 block text-[10px]">Asset Availability</span>
                <span className="font-bold text-[#1D4ED8] text-sm">{hoveredZone.availability}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono bg-[#071426] p-2 rounded border border-[#12345A]">
              <span className="text-slate-300">Active Blocks: <strong className="text-white">{hoveredZone.activeBlocks}</strong></span>
              <span className="text-slate-300">Requests: <strong className="text-slate-200">{hoveredZone.requestsCount}</strong></span>
            </div>

            <p className="text-[10px] text-center text-slate-300 mt-2 font-mono">
              Click node to inspect Zone & Division Dashboard →
            </p>
          </div>
        )}
      </div>

      {/* Map Footer Bar */}
      <div className="p-3 bg-[#0B1F3A] border-t border-[#12345A] flex flex-wrap items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-[0_0_8px_#ffffff]" />
            Healthy Route
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#12345A] inline-block shadow-[0_0_8px_#12345A]" />
            Upcoming Block
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] inline-block shadow-[0_0_8px_#1D4ED8]" />
            Active Maintenance Block
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] inline-block shadow-[0_0_8px_#1D4ED8]" />
            AI Optimized Mega-Block
          </span>
        </div>

        <span className="text-[11px] text-slate-300">
          Showing 17 Zones • 68 Divisions • 4 Major Trunk Corridors
        </span>
      </div>
    </div>
  );
}
