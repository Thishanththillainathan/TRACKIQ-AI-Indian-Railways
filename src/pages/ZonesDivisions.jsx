import React, { useState } from 'react';
import { Search, X, MapPin, Grid } from 'lucide-react';

const railwayZones = [
  {
    id: 1,
    zone: "Central Railway",
    headquarters: "Mumbai",
    divisions: [
      "Mumbai (CST)",
      "Bhusawal",
      "Nagpur",
      "Solapur",
      "Pune"
    ]
  },
  {
    id: 2,
    zone: "Eastern Railway",
    headquarters: "Kolkata",
    divisions: [
      "Asansol",
      "Howrah",
      "Malda",
      "Sealdah"
    ]
  },
  {
    id: 3,
    zone: "East Central Railway",
    headquarters: "Hajipur",
    divisions: [
      "Danapur",
      "Dhanbad",
      "Mughalsarai",
      "Samastipur",
      "Sonpur"
    ]
  },
  {
    id: 4,
    zone: "East Coast Railway",
    headquarters: "Bhubaneswar",
    divisions: [
      "Khurda Road",
      "Sambalpur",
      "Waltair"
    ]
  },
  {
    id: 5,
    zone: "Northern Railway",
    headquarters: "New Delhi",
    divisions: [
      "Ambala",
      "Delhi",
      "Lucknow",
      "Moradabad",
      "Ferozpur"
    ]
  },
  {
    id: 6,
    zone: "North Central Railway",
    headquarters: "Allahabad",
    divisions: [
      "Allahabad",
      "Agra",
      "Jhansi"
    ]
  },
  {
    id: 7,
    zone: "North Eastern Railway",
    headquarters: "Gorakhpur",
    divisions: [
      "Lucknow",
      "Izzatnagar",
      "Varanasi"
    ]
  },
  {
    id: 8,
    zone: "Northeast Frontier Railway",
    headquarters: "Guwahati",
    divisions: [
      "Katihar",
      "Alipurduar",
      "Rangiya",
      "Lumding",
      "Tinsukia"
    ]
  },
  {
    id: 9,
    zone: "North Western Railway",
    headquarters: "Jaipur",
    divisions: [
      "Ajmer",
      "Bikaner",
      "Jaipur",
      "Jodhpur"
    ]
  },
  {
    id: 10,
    zone: "Southern Railway",
    headquarters: "Chennai",
    divisions: [
      "Chennai",
      "Madurai",
      "Palghat",
      "Trichy",
      "Trivandrum",
      "Salem"
    ]
  },
  {
    id: 11,
    zone: "South Central Railway",
    headquarters: "Secunderabad",
    divisions: [
      "Guntakal",
      "Guntur",
      "Hyderabad",
      "Nanded",
      "Secunderabad",
      "Vijayawada"
    ]
  },
  {
    id: 12,
    zone: "South Eastern Railway",
    headquarters: "Kolkata",
    divisions: [
      "Adra",
      "Chakradharpur",
      "Kharagpur",
      "Ranchi"
    ]
  },
  {
    id: 13,
    zone: "South East Central Railway",
    headquarters: "Bilaspur",
    divisions: [
      "Bilaspur",
      "Nagpur",
      "Raipur"
    ]
  },
  {
    id: 14,
    zone: "South Western Railway",
    headquarters: "Hubli",
    divisions: [
      "Bangalore",
      "Hubli",
      "Mysore"
    ]
  },
  {
    id: 15,
    zone: "Western Railway",
    headquarters: "Mumbai",
    divisions: [
      "Mumbai (Central)",
      "Vadodara",
      "Ratlam",
      "Ahmedabad",
      "Rajkot",
      "Bhavnagar"
    ]
  },
  {
    id: 16,
    zone: "West Central Railway",
    headquarters: "Jabalpur",
    divisions: [
      "Bhopal",
      "Jabalpur",
      "Kota"
    ]
  },
  {
    id: 17,
    zone: "Metro Railway",
    headquarters: "Kolkata",
    divisions: []
  }
];

export default function ZonesDivisions() {

  // IMPORTANT:
  // Initially NO zone is selected.
  const [selectedZone, setSelectedZone] = useState(null);

  const [filterQuery, setFilterQuery] = useState('');

  // Search filter
  const filteredZones = railwayZones.filter((zone) =>
    zone.zone.toLowerCase().includes(filterQuery.toLowerCase()) ||
    zone.headquarters.toLowerCase().includes(filterQuery.toLowerCase()) ||
    zone.divisions.some((division) =>
      division.toLowerCase().includes(filterQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 font-sans text-white p-2">

      {/* HEADER */}
      <div className="vision-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C6F432] font-bold uppercase mb-1">
            <Grid className="w-4 h-4 text-[#C6F432]" />
            <span>
              ADMINISTRATIVE HIERARCHY — RAILWAY ZONES & DIVISIONS
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            INDIAN RAILWAYS ZONES & DIVISIONS OVERVIEW
          </h2>
          <p className="text-xs text-white/60 max-w-3xl mt-1 font-medium">
            Browse Indian Railway zones and click any zone to view its headquarters and divisions.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Zone or Division..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/12 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#C6F432]/60"
          />
        </div>
      </div>

      {/* 17 RAILWAY ZONES */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
          ALL INDIAN RAILWAY ZONES
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className="vision-card p-4 transition-all cursor-pointer space-y-3"
            >
              {/* TOP */}
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center text-black bg-[#C6F432]/85 shadow-sm">
                  {getZoneCode(zone.zone)}
                </span>
                <span className="text-[10px] font-mono text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/10 font-bold">
                  HQ: {zone.headquarters}
                </span>
              </div>

              {/* NAME */}
              <div>
                <h4 className="font-bold text-white text-sm leading-tight">
                  {zone.zone}
                </h4>
                <p className="text-[11px] text-white/60 font-mono mt-1 font-semibold">
                  {zone.divisions.length} Divisions
                </p>
              </div>

              {/* BOTTOM */}
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
                <span className="text-white font-bold">
                  HQ: {zone.headquarters}
                </span>
                <span className="text-[#C6F432] font-bold">
                  Click →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* NO RESULT */}
        {filteredZones.length === 0 && (
          <div className="text-center py-10 text-white/50 font-mono text-sm">
            No railway zone found.
          </div>
        )}
      </div>

      {/* ZONE DETAILS MODAL */}
      {selectedZone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          onClick={() => setSelectedZone(null)}
        >
          <div
            className="w-full max-w-2xl vision-card border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#C6F432]/18 border border-[#C6F432]/45 flex items-center justify-center font-mono font-bold text-[#C6F432] text-base">
                  {getZoneCode(selectedZone.zone)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">
                    {selectedZone.zone}
                  </h2>
                  <p className="text-xs text-[#555555] font-mono font-bold">
                    Headquarters:{" "}
                    <span className="text-[#111111]">
                      {selectedZone.headquarters}
                    </span>
                  </p>
                </div>
              </div>

              {/* CLOSE */}
              <button
                onClick={() => setSelectedZone(null)}
                className="w-9 h-9 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#111111] hover:bg-[#F0F0F0] transition shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#111111]" />
                <h3 className="text-xs font-mono font-bold text-[#555555] uppercase tracking-wider">
                  Divisions
                </h3>
              </div>

              {selectedZone.divisions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedZone.divisions.map((division, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] hover:border-[#111111] transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-md bg-[#111111] flex items-center justify-center text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-[#111111]">
                          {division}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-sm text-[#555555]">
                  No divisions applicable for Metro Railway.
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="px-5 py-4 border-t border-[#E5E5E5] bg-[#F7F7F7] flex justify-end">
              <button
                onClick={() => setSelectedZone(null)}
                className="px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-xs font-bold transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ================================================= */
/* ZONE CODE FUNCTION */
/* ================================================= */

function getZoneCode(zoneName) {

  const codes = {
    "Central Railway": "CR",
    "Eastern Railway": "ER",
    "East Central Railway": "ECR",
    "East Coast Railway": "ECoR",
    "Northern Railway": "NR",
    "North Central Railway": "NCR",
    "North Eastern Railway": "NER",
    "Northeast Frontier Railway": "NFR",
    "North Western Railway": "NWR",
    "Southern Railway": "SR",
    "South Central Railway": "SCR",
    "South Eastern Railway": "SER",
    "South East Central Railway": "SECR",
    "South Western Railway": "SWR",
    "Western Railway": "WR",
    "West Central Railway": "WCR",
    "Metro Railway": "MR"
  };

  return codes[zoneName] || "R";
}