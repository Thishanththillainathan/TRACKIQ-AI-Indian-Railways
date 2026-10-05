import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, MapPin, Navigation, Satellite, Building2, ShieldAlert } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function StationSatelliteModal({ station, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  if (!station) return null;

  const rawLat = station?.latitude ?? station?.lat ?? station?.coordinates?.lat ?? null;
  const rawLng = station?.longitude ?? station?.lng ?? station?.lon ?? station?.coordinates?.lng ?? null;

  const lat = (rawLat !== null && rawLat !== undefined && !isNaN(Number(rawLat))) ? Number(rawLat) : null;
  const lng = (rawLng !== null && rawLng !== undefined && !isNaN(Number(rawLng))) ? Number(rawLng) : null;

  const code = station?.station_code || station?.code || station?.id || 'STN';
  const name = station?.station_name || station?.name || 'Railway Station';
  const zone = station?.zone_code || station?.zoneCode || station?.zone || 'IR';
  const division = station?.division || 'Divisional HQ';
  const state = station?.state || 'India';

  let googleMapsUrl = station?.google_maps_url || station?.googleMapsUrl || station?.google_maps || '';
  if (!googleMapsUrl && lat !== null && lng !== null) {
    googleMapsUrl = `https://www.google.com/maps/@${lat},${lng},18z/data=!3m1!1e3`;
  }

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

    let satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    if (mapboxToken) {
      satelliteTileUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`;
    } else if (googleApiKey) {
      satelliteTileUrl = `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${googleApiKey}`;
    }

    L.tileLayer(satelliteTileUrl, {
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
          <strong style="color: #0F172A; font-size: 13px;">${name} (${code})</strong><br/>
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
  }, [lat, lng, name, code, mapboxToken, googleApiKey, googleMapsUrl]);

  return createPortal(
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999999] flex items-center justify-center p-4 font-sans">
      <div className="vision-card border border-white/15 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] bg-[#0B0C0D] text-white">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6F432]/18 border border-[#C6F432]/45 flex items-center justify-center text-[#C6F432] font-bold shadow-sm">
              <Satellite className="w-5 h-5 text-[#C6F432] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#C6F432] font-bold px-2 py-0.5 rounded bg-[#C6F432]/20 border border-[#C6F432]/30">
                  {code}
                </span>
                <span className="text-xs font-mono text-white/60">{zone} ZONE</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#C6F432]/85 hover:bg-[#C6F432] text-black px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition shadow"
              >
                <Navigation className="w-3.5 h-3.5 text-black" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 text-black" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Station Details & Satellite Map View */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto">
          
          {/* Left Metadata Panel */}
          <div className="space-y-4 font-mono text-xs vision-card p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider border-b border-white/10 pb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C6F432]" />
                <span>Station Metadata</span>
              </h4>

              <div className="space-y-1.5 text-white/90">
                <div className="flex justify-between">
                  <span className="text-white/50">Station Code:</span>
                  <span className="font-bold text-[#C6F432]">{code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Station Name:</span>
                  <span className="font-bold text-white">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Railway Zone:</span>
                  <span className="text-white/80">{zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Division:</span>
                  <span className="text-white/80">{division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">State:</span>
                  <span className="text-white/80">{state}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider pb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Geographic Coordinates</span>
              </h4>

              {lat !== null && lng !== null ? (
                <div className="p-2.5 rounded bg-white/5 border border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/50">Latitude:</span>
                    <span className="text-emerald-400 font-bold">{lat.toFixed(6)}° N</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Longitude:</span>
                    <span className="text-emerald-400 font-bold">{lng.toFixed(6)}° E</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                  Coordinates unavailable for this station.
                </div>
              )}
            </div>

            {/* Satellite Provider Status */}
            <div className="p-2.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/60 space-y-1">
              <p className="font-bold text-white flex items-center gap-1">
                <Satellite className="w-3 h-3 text-[#C6F432]" />
                <span>Satellite Tile Provider</span>
              </p>
              <p>{mapboxToken ? 'Mapbox High-Res Satellite' : googleApiKey ? 'Google Maps Satellite' : 'Esri World Imagery (High-Res)'}</p>
            </div>
          </div>

          {/* Right Satellite Map Render Container */}
          <div className="lg:col-span-2 relative min-h-[420px] rounded-xl overflow-hidden border border-white/10 vision-card">
            {lat !== null && lng !== null ? (
              <>
                <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-10" />

                {/* Map Top Badge */}
                <div className="absolute top-3 right-3 z-20 bg-black/80 backdrop-blur border border-white/15 px-3 py-1.5 rounded-lg text-[10px] font-mono text-white flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#C6F432] animate-pulse"></span>
                  <span>HD Satellite View Locked</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full min-h-[420px] flex items-center justify-center p-6 bg-white/[0.02]">
                <div className="text-center max-w-sm space-y-2">
                  <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-white font-mono">
                    Satellite imagery unavailable for this station because coordinates are missing.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
