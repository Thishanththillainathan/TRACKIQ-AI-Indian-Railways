import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  Building2,
  Activity,
  Radio,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  MapPin,
  Gauge,
  Zap,
  ShieldAlert,
  Clock,
  ExternalLink,
  Navigation,
} from 'lucide-react';

import {
  STATIONS as MOCK_STATIONS,
  STATION_ASSETS,
  MAINTENANCE_REQUESTS,
} from '../data/mockData';
import { getStations } from '../services/railwayNetworkService';

export default function StationSatelliteView({ station: propStation, onBack }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { stationId: paramStationId } = useParams();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Resolve station from prop, search parameter (?code=), path parameter (:stationId), or fallback to MOCK_STATIONS[0]
  const station = useMemo(() => {
    if (propStation) return propStation;

    const codeParam = searchParams.get('code') || paramStationId;
    if (codeParam) {
      const norm = codeParam.trim().toUpperCase();
      const mockMatch = MOCK_STATIONS.find(
        (s) => s.code?.toUpperCase() === norm || s.id?.toUpperCase() === norm || s.name?.toUpperCase() === norm
      );
      if (mockMatch) return mockMatch;

      try {
        const masterRes = getStations({ search: norm, limit: 5 });
        const masterMatch = masterRes.stations.find(
          (s) => s.code?.toUpperCase() === norm || s.id?.toUpperCase() === norm || s.name?.toUpperCase() === norm
        );
        if (masterMatch) return masterMatch;
      } catch (err) {
        console.warn('Error resolving station from master database:', err);
      }
    }

    return MOCK_STATIONS[0] || null;
  }, [propStation, searchParams, paramStationId]);

  const rawLat = station?.latitude ?? station?.lat ?? station?.coordinates?.lat ?? null;
  const rawLng = station?.longitude ?? station?.lng ?? station?.lon ?? station?.coordinates?.lng ?? null;

  const lat = (rawLat !== null && rawLat !== undefined && !isNaN(Number(rawLat))) ? Number(rawLat) : null;
  const lng = (rawLng !== null && rawLng !== undefined && !isNaN(Number(rawLng))) ? Number(rawLng) : null;

  let googleMapsUrl = station?.google_maps_url || station?.googleMapsUrl || station?.google_maps || '';
  if (!googleMapsUrl && lat !== null && lng !== null) {
    googleMapsUrl = `https://www.google.com/maps/@${lat},${lng},18z/data=!3m1!1e3`;
  }

  useEffect(() => {
    if (!mapContainerRef.current || lat === null || lng === null) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-station-pulse-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(198, 244, 50, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 4px; border-radius: 50%; background-color: #C6F432; border: 2px solid white; box-shadow: 0 0 14px rgba(198,244,50,0.8); display: flex; items-center; justify-content: center;">
            <svg style="width: 16px; height: 16px; color: black; margin: 4px auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #0F172A; padding: 4px;">
          <strong style="color: #0F172A; font-size: 13px;">${station?.name || 'Station'} (${station?.code || 'STN'})</strong><br/>
          <span style="color: #475569;">Lat: ${lat.toFixed(6)}°, Lng: ${lng.toFixed(6)}°</span><br/>
          ${googleMapsUrl ? `<a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #0284C7; font-weight: bold; text-decoration: underline;">Open in Google Maps ↗</a>` : ''}
        </div>
      `)
      .openPopup();

    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, station?.code, station?.name, googleMapsUrl]);

  /* ---------------------------------------------------------
     SAFE HELPERS
  --------------------------------------------------------- */

  const normalize = (value) =>
    String(value ?? '')
      .trim()
      .toUpperCase();

  const stationCode = normalize(station?.code);

  const stationId = normalize(station?.id);

  /*
   * Different mockData versions may use different station fields.
   * This helper supports all common possibilities.
   */
  const belongsToStation = (item) => {
    if (!item || !station) return false;

    const possibleCodes = [
      item.stationCode,
      item.station_code,
      item.station,
      item.station?.code,
      item.stationId,
      item.station_id,
      item.locationCode,
      item.location_code,
    ]
      .filter(Boolean)
      .map(normalize);

    if (possibleCodes.length === 0) {
      return false;
    }

    return (
      possibleCodes.includes(stationCode) ||
      possibleCodes.includes(stationId)
    );
  };

  /* ---------------------------------------------------------
     STATION ASSETS
  --------------------------------------------------------- */

  const stationAssets = useMemo(() => {
    if (!Array.isArray(STATION_ASSETS)) {
      return [];
    }

    const matchingAssets = STATION_ASSETS.filter(belongsToStation);

    return matchingAssets;
  }, [station, stationCode, stationId]);

  /*
   * Department filter
   */
  const filteredAssets = useMemo(() => {
    if (selectedDeptFilter === 'ALL') {
      return stationAssets;
    }

    return stationAssets.filter(
      (asset) => normalize(asset.dept) === normalize(selectedDeptFilter)
    );
  }, [stationAssets, selectedDeptFilter]);

  /*
   * Select first available asset automatically.
   */
  useEffect(() => {
    if (filteredAssets.length === 0) {
      setSelectedAsset(null);
      return;
    }

    const stillExists = filteredAssets.some(
      (asset) => asset.id === selectedAsset?.id
    );

    if (!stillExists) {
      setSelectedAsset(filteredAssets[0]);
    }
  }, [filteredAssets, selectedAsset?.id]);

  /* ---------------------------------------------------------
     MAINTENANCE REQUESTS
  --------------------------------------------------------- */

  const stationMaintenance = useMemo(() => {
    if (!Array.isArray(MAINTENANCE_REQUESTS)) {
      return [];
    }

    return MAINTENANCE_REQUESTS.filter(belongsToStation);
  }, [station, stationCode, stationId]);

  /* ---------------------------------------------------------
     DYNAMIC VALUES
  --------------------------------------------------------- */

  const platformCount = Math.max(
    Number(station?.platforms) || 0,
    1
  );

  const trackCount = Math.max(
    Number(station?.tracks) || 0,
    1
  );

  const assetCount =
    Number(station?.assetsCount) ||
    stationAssets.length ||
    0;

  const availability =
    Number(station?.availability) || 0;

  const activeMaintenance =
    Number(station?.activeMaintenance) || stationMaintenance.length || 0;

  const alertsCount =
    Number(station?.alertsCount) || 0;

  /* ---------------------------------------------------------
     DYNAMIC TRACKS
  --------------------------------------------------------- */

  const trackRows = Array.from(
    { length: Math.min(trackCount, 12) },
    (_, index) => {
      const number = index + 1;

      let status = 'HEALTHY';

      if (index === 3 && activeMaintenance > 0) {
        status = 'CRITICAL';
      } else if (index === 5 && activeMaintenance > 0) {
        status = 'ACTIVE_BLOCK';
      } else if (index === 2) {
        status = 'UPCOMING';
      }

      return {
        id: `TRACK-${number}`,
        label: `Track ${number}`,
        status,
      };
    }
  );

  /* ---------------------------------------------------------
     STATUS COLOR
  --------------------------------------------------------- */

  const getStatusClasses = (status) => {
    switch (normalize(status)) {
      case 'CRITICAL':
        return {
          marker:
            'bg-black text-white border border-black shadow-sm font-bold',
          text: 'text-black font-bold',
        };

      case 'ACTIVE_BLOCK':
        return {
          marker:
            'bg-black text-white border border-black shadow-sm',
          text: 'text-black font-bold',
        };

      case 'UPCOMING':
        return {
          marker:
            'bg-[#333333] text-white border border-[#333333]',
          text: 'text-[#333333] font-semibold',
        };

      default:
        return {
          marker:
            'bg-[#F5F5F5] text-black border border-[#D9D9D9]',
          text: 'text-black',
        };
    }
  };

  /* ---------------------------------------------------------
     DEPARTMENT ICON
  --------------------------------------------------------- */

  const getDepartmentLabel = (dept) => {
    const value = normalize(dept);

    if (value === 'TRACK') return 'TRK';
    if (value === 'S&T') return 'SIG';
    if (value === 'TRD') return 'TRD';

    return value.slice(0, 3) || 'AST';
  };

  /* ---------------------------------------------------------
     AI PLANNER
  --------------------------------------------------------- */

  const openAIPlanner = () => {
    const code = station?.code || '';

    navigate(
      `/ai-planner?station=${encodeURIComponent(code)}`
    );
  };

  /* ---------------------------------------------------------
     INVALID STATION
  --------------------------------------------------------- */

  if (!station) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-white p-5">
        <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-8 text-center shadow-md max-w-md w-full">
          <ShieldAlert className="w-10 h-10 text-[#111111] mx-auto mb-3" />

          <h2 className="text-lg font-bold text-[#111111]">
            Station Not Found
          </h2>

          <p className="text-sm text-[#555555] mt-2">
            The requested railway station could not be loaded.
          </p>

          <button
            onClick={() => navigate('/stations')}
            className="mt-5 px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-xs font-mono font-bold transition shadow-sm"
          >
            BACK TO STATIONS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-white p-2">

      {/* HEADER */}
      <div className="vision-card border border-white/12 rounded-2xl p-5 shadow-sm backdrop-blur-2xl bg-white/[0.045]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-lg text-xs font-mono flex items-center gap-2 transition-all shadow-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back to Network</span>
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#C6F432] font-bold uppercase">
                <Building2 className="w-4 h-4 text-[#C6F432]" />
                <span>SATELLITE & AERIAL YARD VIEW — {station?.code}</span>
              </div>

              <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
                {station?.name}
              </h2>

              <span className="text-xs font-mono text-white/70 font-semibold">
                Zone: <strong className="text-white">{station?.zoneId || station?.zone || 'N/A'}</strong>
                {' • '}
                Division: <strong className="text-white">{station?.division || station?.divisionName || 'N/A'}</strong>
                {' • '}
                State: <strong className="text-white">{station?.state || 'N/A'}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#C6F432]/85 hover:bg-[#C6F432] text-black px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition shadow"
              >
                <Navigation className="w-4 h-4 text-black" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>
            )}

            <button
              onClick={openAIPlanner}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 font-mono font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Bot className="w-4 h-4 text-[#C6F432]" />
              <span>GENERATE AI BLOCK PLAN</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SATELLITE / YARD PANEL */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-[540px] vision-card border border-white/12 rounded-2xl overflow-hidden shadow-xl bg-[#0B0C0D]">
            
            {/* Top Bar Overlay */}
            <div className="absolute top-0 left-0 right-0 z-30 p-3 bg-black/80 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Radio className="w-4 h-4 text-[#C6F432] animate-pulse" />
                <span>REAL-TIME INTERACTIVE SATELLITE OVERLAY</span>
              </div>

              <div className="flex items-center gap-2">
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-[#C6F432]/20 hover:bg-[#C6F432]/30 text-[#C6F432] border border-[#C6F432]/40 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition"
                  >
                    <span>Google Maps Satellite</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Station Coordinates & Details Badge */}
            <div className="absolute top-16 left-5 z-20 bg-black/85 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-lg font-mono text-xs space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C6F432]" />
                <span className="font-bold text-white text-sm">
                  {station?.name} ({station?.code})
                </span>
              </div>
              {lat !== null && lng !== null ? (
                <p className="text-[11px] text-emerald-400 font-bold">
                  Lat: {lat.toFixed(6)}° N • Lng: {lng.toFixed(6)}° E
                </p>
              ) : (
                <p className="text-[11px] text-rose-400 font-bold">
                  Coordinates: Unavailable
                </p>
              )}
              <p className="text-[10px] text-white/60 font-medium">
                {platformCount} Platforms • {trackCount} Lines
              </p>
            </div>

            {/* Leaflet Satellite Map Render Container */}
            {lat !== null && lng !== null ? (
              <>
                <div ref={mapContainerRef} className="w-full h-full min-h-[540px] z-10" />

                {/* Map Bottom Legend Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-30 p-3 bg-black/80 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#C6F432]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Esri High-Resolution Satellite Imagery Stream Active</span>
                  </div>

                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-[#C6F432] underline font-bold"
                    >
                      Open in Google Maps ↗
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full h-full min-h-[540px] flex items-center justify-center p-8 bg-white/[0.02]">
                <div className="text-center max-w-md space-y-3 vision-card p-6 border border-white/12 bg-white/[0.045] rounded-2xl">
                  <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
                  <h3 className="text-base font-bold text-white font-mono">
                    Satellite imagery unavailable for this station because coordinates are missing.
                  </h3>
                  <p className="text-xs text-white/60 font-mono">
                    Station details, platforms, tracks, and AI planning features remain available below.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SELECTED ASSET */}
          {selectedAsset && (
            <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-white bg-[#111111] px-2 py-1 rounded">
                      {selectedAsset.id || 'ASSET'}
                    </span>
                    <span className="text-[10px] font-mono text-[#555555] font-bold">
                      Dept: {selectedAsset.dept || 'N/A'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#111111] mt-1">
                    {selectedAsset.name || 'Railway Asset'}
                  </h4>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded border border-[#E5E5E5]">
                    <span className="text-[#555555] font-bold">Health</span>
                    <strong className="text-[#111111] ml-2 font-bold">{selectedAsset.healthPct ?? 'N/A'}%</strong>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-[#E5E5E5]">
                    <span className="text-[#555555] font-bold">AI Risk</span>
                    <strong className="text-[#111111] ml-2 font-bold">{selectedAsset.aiPriorityScore ?? 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Sensor readings */}
              {selectedAsset.sensorReadings &&
                typeof selectedAsset.sensorReadings === 'object' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(selectedAsset.sensorReadings).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-lg border border-[#E5E5E5]"
                      >
                        <span className="text-[9px] text-[#777777] uppercase block font-mono font-bold">
                          {key}
                        </span>
                        <span className="font-bold text-[#111111] text-xs font-mono mt-1 block">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* History */}
              {Array.isArray(selectedAsset.history) && selectedAsset.history.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#555555] uppercase mb-2">
                    <Clock className="w-3.5 h-3.5 text-[#111111]" />
                    Recent Maintenance History
                  </div>

                  <div className="space-y-1">
                    {selectedAsset.history.slice(0, 5).map((historyItem, index) => (
                      <div
                        key={index}
                        className="bg-white p-2.5 rounded border border-[#E5E5E5] flex flex-wrap justify-between gap-2 text-[10px] font-mono"
                      >
                        <span className="text-[#111111] font-semibold">
                          {historyItem.act || historyItem.action || 'Maintenance activity'}
                        </span>
                        <span className="text-[#555555] font-bold">
                          {historyItem.date || 'N/A'} • {historyItem.tech || 'Technician N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Station Operations */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111] uppercase">
                <Activity className="w-4 h-4 text-[#111111]" />
                <span>STATION OPERATIONS SNAPSHOT</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between bg-white p-3 rounded border border-[#E5E5E5]">
                <span className="text-[#555555] font-bold">Platforms</span>
                <span className="font-bold text-[#111111]">{platformCount}</span>
              </div>

              <div className="flex justify-between bg-white p-3 rounded border border-[#E5E5E5]">
                <span className="text-[#555555] font-bold">Tracks & Loops</span>
                <span className="font-bold text-[#111111]">{trackCount}</span>
              </div>

              <div className="flex justify-between bg-white p-3 rounded border border-[#E5E5E5]">
                <span className="text-[#555555] font-bold">Station Assets</span>
                <span className="font-bold text-[#111111]">{assetCount}</span>
              </div>

              <div className="flex justify-between bg-white p-3 rounded border border-[#E5E5E5]">
                <span className="text-[#555555] font-bold">Availability</span>
                <span className="font-bold text-[#111111]">{availability}%</span>
              </div>
            </div>

            {/* Quick metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-lg border border-[#E5E5E5]">
                <Wrench className="w-4 h-4 text-[#111111] mb-2" />
                <div className="text-[9px] text-[#777777] font-mono font-bold">ACTIVE BLOCKS</div>
                <div className="text-lg font-bold text-[#111111]">{activeMaintenance}</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#E5E5E5]">
                <ShieldAlert className="w-4 h-4 text-[#111111] mb-2" />
                <div className="text-[9px] text-[#777777] font-mono font-bold">ALERTS</div>
                <div className="text-lg font-bold text-[#111111]">{alertsCount}</div>
              </div>
            </div>
          </div>

          {/* Department status */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 shadow-sm space-y-3">
            <div className="text-xs font-mono font-bold text-[#555555] uppercase">
              ACTIVE DEPARTMENT STATUS
            </div>

            <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-[#111111]">TRACK</span>
                <span className="text-[9px] font-mono text-[#555555] font-bold">
                  {stationAssets.filter((a) => normalize(a.dept) === 'TRACK').length} Assets
                </span>
              </div>
              <p className="text-[10px] text-[#555555] mt-1 font-medium">
                Track assets and maintenance conditions are monitored through the station asset layer.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-[#111111]">S&T</span>
                <span className="text-[9px] font-mono text-[#555555] font-bold">
                  {stationAssets.filter((a) => normalize(a.dept) === 'S&T').length} Assets
                </span>
              </div>
              <p className="text-[10px] text-[#555555] mt-1 font-medium">
                Signalling and telecom assets are available for condition inspection.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-[#111111]">TRD</span>
                <span className="text-[9px] font-mono text-[#555555] font-bold">
                  {stationAssets.filter((a) => normalize(a.dept) === 'TRD').length} Assets
                </span>
              </div>
              <p className="text-[10px] text-[#555555] mt-1 font-medium">
                OHE and traction power assets are monitored for maintenance planning.
              </p>
            </div>
          </div>

          {/* AI Planner */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-[#111111]" />
              <span className="text-xs font-mono font-bold text-[#111111]">
                AI BLOCK OPTIMIZATION
              </span>
            </div>

            <p className="text-[11px] text-[#555555] leading-relaxed font-medium">
              Generate a coordinated maintenance block plan for{' '}
              <strong className="text-[#111111]">{station.name}</strong>{' '}
              using available station assets, maintenance activities and departmental constraints.
            </p>

            <button
              onClick={openAIPlanner}
              className="w-full mt-4 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-mono font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-white" />
              <span>GENERATE COMBINED AI BLOCK PLAN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}