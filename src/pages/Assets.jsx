import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter,
  ShieldAlert,
  Activity,
  CheckCircle2,
  MapPin,
  Building2,
  TrainFront,
  ChevronDown,
  Database,
  Radio,
  Layers3,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  ASSET_MASTER,
  RAILWAY_ASSET_TYPES,
  normalizeRailwayText,
  findStation,
  findZone,
  findDivision,
} from "../data/mockData";

// ============================================================
// HELPERS
// ============================================================

const getStatusMeta = (asset) => {
  const status = String(asset?.status || "").toUpperCase();

  if (
    status.includes("CRITICAL") ||
    status.includes("FAULT")
  ) {
    return {
      label: "CRITICAL",
      icon: ShieldAlert,
      className: "text-[#111111] bg-[#F7F7F7] border-[#D0D0D0] font-bold",
    };
  }

  if (
    status.includes("UPCOMING") ||
    status.includes("VERIFICATION")
  ) {
    return {
      label:
        status === "VERIFICATION_REQUIRED"
          ? "VERIFICATION REQUIRED"
          : "UPCOMING",
      icon: Activity,
      className: "text-[#111111] bg-[#F7F7F7] border-[#D0D0D0] font-bold",
    };
  }

  if (
    status.includes("ACTIVE") ||
    status.includes("BLOCK")
  ) {
    return {
      label: "ACTIVE BLOCK",
      icon: Activity,
      className: "text-[#111111] bg-[#F7F7F7] border-[#D0D0D0] font-bold",
    };
  }

  return {
    label: "HEALTHY",
    icon: CheckCircle2,
    className: "text-[#111111] bg-[#F7F7F7] border-[#D0D0D0] font-bold",
  };
};

const resolveAssetForDisplay = (asset) => {
  const station =
    findStation(
      asset?.stationOrBlockSection ||
      asset?.stationCode ||
      asset?.station?.code ||
      ""
    ) || null;

  const zone =
    findZone(
      asset?.zone ||
      asset?.zoneCode ||
      station?.zone ||
      ""
    ) || null;

  const division =
    findDivision(
      asset?.division ||
      asset?.divisionCode ||
      station?.division ||
      ""
    ) || null;

  const id =
    asset?.id ||
    asset?.assetId ||
    asset?.code ||
    "ASSET-001";

  const name =
    asset?.name ||
    asset?.assetName ||
    asset?.title ||
    "Railway Asset";

  const type =
    asset?.assetType ||
    asset?.type ||
    asset?.category ||
    "Track Asset";

  const description =
    asset?.description ||
    asset?.assetDescription ||
    asset?.remarks ||
    "Standard Indian Railways infrastructure asset.";

  const department =
    asset?.department ||
    asset?.dept ||
    "TMD";

  const location =
    asset?.stationOrBlockSection ||
    station?.name ||
    "Main Line Corridor";

  const source =
    asset?.source ||
    (asset?.isPrototype ? "SYSTEM DATA" : "PDF DATASET");

  const verification =
    asset?.verificationStatus ||
    "Verified Railway Asset";

  const status =
    asset?.status ||
    "HEALTHY";

  const statusMeta = getStatusMeta(asset);

  return {
    ...asset,
    id,
    name,
    resolvedAssetType: type,
    resolvedDescription: description,
    resolvedZone: zone?.name || asset?.zone || "Southern Railway",
    resolvedZoneCode: zone?.code || asset?.zoneCode || "SR",
    resolvedDivision: division?.name || asset?.division || "Chennai",
    resolvedDivisionCode: division?.code || asset?.divisionCode || "MAS",
    resolvedHQ: zone?.headquarters || "Chennai",
    resolvedStation: station?.name || location,
    resolvedStationCode: station?.code || asset?.stationCode || "--",
    resolvedDepartment: department,
    resolvedLocation: location,
    resolvedSource: source,
    resolvedVerification: verification,
    resolvedStatus: status,
    statusMeta,
  };
};

export default function Assets() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const userDept = authUser?.role === 'TMS_OFFICER' ? 'TMS' : authUser?.role === 'SMMS_OFFICER' ? 'SMMS' : authUser?.role === 'TRD_OFFICER' ? 'TRD' : null;

  const initialQuery =
    searchParams.get("id") ||
    searchParams.get("asset") ||
    "";

  const initialType =
    searchParams.get("type") || "ALL";

  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState(userDept || "ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    if (userDept) {
      setDeptFilter(userDept);
    }
  }, [userDept]);

  const displayAssets = useMemo(() => {
    return ASSET_MASTER.map(resolveAssetForDisplay);
  }, []);

  const assetTypeOptions = useMemo(() => {
    const pdfTypes = RAILWAY_ASSET_TYPES.map((item) => item.name);
    const prototypeTypes = displayAssets.map((asset) => asset.resolvedAssetType).filter(Boolean);
    return [...new Set([...pdfTypes, ...prototypeTypes])].sort();
  }, [displayAssets]);

  const zoneOptions = useMemo(() => {
    return [...new Set(displayAssets.map((asset) => asset.resolvedZone).filter(Boolean))].sort();
  }, [displayAssets]);

  const divisionOptions = useMemo(() => {
    return [...new Set(displayAssets.map((asset) => asset.resolvedDivision).filter(Boolean))].sort();
  }, [displayAssets]);

  const departmentOptions = useMemo(() => {
    return [...new Set(displayAssets.map((asset) => asset.resolvedDepartment).filter(Boolean))].sort();
  }, [displayAssets]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = normalizeRailwayText(query);

    // Cross-department search block for officer roles
    if (userDept) {
      const q = normalizedQuery.toUpperCase();
      if (userDept === 'TMS' && (q.includes('SMMS') || q.includes('SIGNAL') || q.includes('S&T') || q.includes('TRD') || q.includes('TRACTION') || q.includes('OHE') || q.includes('AST-SIG'))) {
        return [];
      }
      if (userDept === 'SMMS' && (q.includes('TMS') || q.includes('TRACK') || q.includes('TRD') || q.includes('TRACTION') || q.includes('OHE') || q.includes('AST-TRK'))) {
        return [];
      }
      if (userDept === 'TRD' && (q.includes('TMS') || q.includes('TRACK') || q.includes('SMMS') || q.includes('SIGNAL') || q.includes('S&T') || q.includes('AST-TRK') || q.includes('AST-SIG'))) {
        return [];
      }
    }

    return displayAssets.filter((asset) => {
      // Enforce strict department isolation if user is department officer
      if (userDept) {
        const assetDept = (asset.resolvedDepartment || '').toUpperCase();
        if (userDept === 'TMS' && !['TMS', 'TMD', 'CIVIL', 'TRACK'].some(d => assetDept.includes(d))) return false;
        if (userDept === 'SMMS' && !['SMMS', 'ST', 'S&T', 'SIGNAL'].some(d => assetDept.includes(d))) return false;
        if (userDept === 'TRD' && !['TRD', 'TRACTION', 'OHE', 'ELECTRICAL'].some(d => assetDept.includes(d))) return false;
      }

      const matchesQuery =
        !normalizedQuery ||
        [
          asset.id,
          asset.name,
          asset.resolvedAssetType,
          asset.resolvedDescription,
          asset.resolvedZone,
          asset.resolvedDivision,
          asset.resolvedStation,
          asset.resolvedStationCode,
          asset.resolvedDepartment,
          asset.resolvedLocation,
        ]
          .filter(Boolean)
          .some((value) => normalizeRailwayText(value).includes(normalizedQuery));

      const matchesType = typeFilter === "ALL" || normalizeRailwayText(asset.resolvedAssetType) === normalizeRailwayText(typeFilter);
      const matchesZone = zoneFilter === "ALL" || asset.resolvedZone === zoneFilter;
      const matchesDivision = divisionFilter === "ALL" || asset.resolvedDivision === divisionFilter;
      const matchesDepartment = deptFilter === "ALL" || asset.resolvedDepartment === deptFilter;
      const matchesSource = sourceFilter === "ALL" || asset.resolvedSource === sourceFilter;

      return matchesQuery && matchesType && matchesZone && matchesDivision && matchesDepartment && matchesSource;
    });
  }, [displayAssets, query, typeFilter, zoneFilter, divisionFilter, deptFilter, sourceFilter]);

  const totalAssets = displayAssets.length;
  const filteredCount = filteredAssets.length;
  const pdfAssetCount = displayAssets.filter((asset) => asset.resolvedSource === "PDF DATASET").length;
  const prototypeAssetCount = displayAssets.filter((asset) => asset.resolvedSource === "SYSTEM DATA").length;

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("ALL");
    setZoneFilter("ALL");
    setDivisionFilter("ALL");
    setDeptFilter("ALL");
    setSourceFilter("ALL");
  };

  const openAsset = (asset) => {
    const stationCode = asset.resolvedStationCode;
    if (stationCode && stationCode !== "--") {
      navigate(`/stations?code=${encodeURIComponent(stationCode)}`);
      return;
    }
    navigate(`/stations?search=${encodeURIComponent(asset.resolvedLocation)}`);
  };

  return (
    <div className="min-h-screen text-white p-2">
      {/* HEADER */}
      <div className="mb-7">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[#C6F432] mb-2 font-bold">
              <Layers3 size={14} className="text-[#C6F432]" />
              Railway Asset Intelligence
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Railway Assets
            </h1>
            <p className="text-[#555555] text-sm mt-2 max-w-3xl font-medium">
              Unified view of railway assets and source-mapped asset types with Zone → Division → Station / Block Section hierarchy.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] px-4 py-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">Total</div>
              <div className="text-xl font-bold mt-1 text-[#111111]">{totalAssets.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] px-4 py-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">PDF Mapped</div>
              <div className="text-xl font-bold mt-1 text-[#111111]">{pdfAssetCount.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] px-4 py-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">System Data</div>
              <div className="text-xl font-bold mt-1 text-[#111111]">{prototypeAssetCount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS CONTAINER */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-[#F7F7F7] p-4 mb-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search asset, Asset ID, SSDAC, station, division, zone..."
              className="w-full h-12 rounded-xl border border-[#E5E5E5] bg-white pl-11 pr-4 outline-none text-sm text-[#111111] placeholder:text-[#777777] focus:border-[#111111]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="h-12 px-5 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#F0F0F0] flex items-center justify-center gap-2 text-sm text-[#111111] font-bold transition shadow-sm"
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={15} className={showFilters ? "rotate-180 transition" : "transition"} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mt-4">
            <FilterSelect label="Asset Type" value={typeFilter} onChange={setTypeFilter} options={["ALL", ...assetTypeOptions]} />
            <FilterSelect label="Zone" value={zoneFilter} onChange={setZoneFilter} options={["ALL", ...zoneOptions]} />
            <FilterSelect label="Division" value={divisionFilter} onChange={setDivisionFilter} options={["ALL", ...divisionOptions]} />
            <FilterSelect label="Department" value={deptFilter} onChange={setDeptFilter} options={["ALL", ...departmentOptions]} />
            <FilterSelect label="Source" value={sourceFilter} onChange={setSourceFilter} options={["ALL", "PDF DATASET", "SYSTEM DATA"]} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-[#E5E5E5]">
          <div className="text-xs text-[#555555] font-semibold">
            Showing <span className="text-[#111111] font-bold">{filteredCount.toLocaleString()}</span> matched assets
          </div>
          <button type="button" onClick={clearFilters} className="text-xs font-bold text-[#111111] hover:underline transition">
            Clear all filters
          </button>
        </div>
      </div>

      {/* ASSET GRID OR EMPTY STATE */}
      {filteredAssets.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-12 text-center shadow-sm">
          <Database size={34} className="mx-auto text-[#777777] mb-4" />
          <h3 className="text-base font-bold text-[#111111]">No matching assets</h3>
          <p className="text-sm text-[#555555] mt-2">Try a different asset type, station, division or search term.</p>
          <button type="button" onClick={clearFilters} className="mt-5 px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#111111] text-white text-sm font-bold hover:bg-[#333333]">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const StatusIcon = asset.statusMeta.icon;
            return (
              <button
                key={`${asset.resolvedSource}-${asset.id}`}
                type="button"
                onClick={() => openAsset(asset)}
                className="text-left rounded-2xl border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] hover:border-[#111111] transition-all overflow-hidden shadow-sm group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] font-bold">
                          {asset.resolvedDepartment}
                        </span>
                        <span className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-md border ${asset.statusMeta.className}`}>
                          <span className="flex items-center gap-1.5">
                            <StatusIcon size={12} />
                            {asset.statusMeta.label}
                          </span>
                        </span>
                      </div>

                      <h2 className="font-bold text-base leading-snug text-[#111111]">
                        {asset.resolvedAssetType}
                      </h2>
                      <p className="text-xs text-[#555555] font-semibold mt-1 break-all">
                        Asset ID: {asset.id}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl p-3 border border-[#E5E5E5] bg-[#F7F7F7]">
                      <Radio size={19} className="text-[#111111]" />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold mb-1">
                      Asset Description
                    </div>
                    <p className="text-sm text-[#111111] font-medium leading-relaxed">
                      {asset.resolvedDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <InfoItem icon={TrainFront} label="Zone" value={`${asset.resolvedZone} (${asset.resolvedZoneCode})`} />
                    <InfoItem icon={Building2} label="Headquarters" value={asset.resolvedHQ} />
                    <InfoItem icon={Building2} label="Division" value={`${asset.resolvedDivision} (${asset.resolvedDivisionCode})`} />
                    <InfoItem icon={MapPin} label="Station / Block Section" value={`${asset.resolvedLocation}${asset.resolvedStationCode && asset.resolvedStationCode !== "--" ? ` (${asset.resolvedStationCode})` : ""}`} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-3">
                      <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">Asset Type</div>
                      <div className="text-sm text-[#111111] font-bold mt-1">{asset.resolvedAssetType}</div>
                    </div>
                    <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-3">
                      <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">Source</div>
                      <div className="text-sm text-[#111111] font-bold mt-1">{asset.resolvedSource}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">Data / Verification Status</div>
                    <div className="text-xs text-[#111111] font-bold mt-1">{asset.resolvedVerification}</div>
                  </div>

                  {asset.resolvedSource === "SYSTEM DATA" && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MetricBox label="Health" value={typeof asset.healthPct === "number" ? `${asset.healthPct}%` : asset.statusMeta.label} />
                      <MetricBox label="AI Priority" value={typeof asset.aiPriorityScore === "number" ? `${asset.aiPriorityScore}` : "Source-Mapped"} />
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E5E5E5]">
                    <span className="text-xs text-[#555555] font-semibold">Open station / location</span>
                    <span className="text-xs font-bold text-[#111111] group-hover:underline transition">View details →</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[#777777] font-bold mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm text-[#111111] font-bold outline-none focus:border-[#111111]"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option === "ALL" ? `All ${label}s` : option}</option>
        ))}
      </select>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-3 min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#777777] font-bold">
        <Icon size={11} className="text-[#111111]" />
        {label}
      </div>
      <div className="text-xs font-bold text-[#111111] mt-1 leading-relaxed break-words">{value}</div>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">{label}</div>
      <div className="text-sm font-bold text-[#111111] mt-1">{value}</div>
    </div>
  );
}