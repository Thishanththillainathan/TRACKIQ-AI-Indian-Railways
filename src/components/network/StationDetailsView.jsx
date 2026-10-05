import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  ArrowLeft,
  Wrench,
  Activity,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Radio,
  Layers,
  TrainTrack
} from 'lucide-react';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import StationSatelliteView from '../../pages/StationSatelliteView';
import { getStations } from '../../services/railwayNetworkService';
import { supabase } from '../../lib/supabaseClient';

export default function StationDetailsView() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const {
    stations,
    selectedStation: contextStation,
    setSelectedStation,
    selectedZone,
    selectedDivision,
    setSelectedDivision,
    setSelectedZone
  } = useRailwayNetwork();

  const [activeWorkRecords, setActiveWorkRecords] = useState([]);
  const [loadingWork, setLoadingWork] = useState(true);

  // Determine actual station from route param, context, or master dataset lookup
  const foundInContext = (stations || []).find(s =>
    s.code?.toUpperCase() === stationId?.toUpperCase() ||
    s.id?.toUpperCase() === stationId?.toUpperCase()
  );

  const foundInMaster = !foundInContext && stationId
    ? getStations({ search: stationId, limit: 20 }).stations.find(s =>
        s.code?.toUpperCase() === stationId?.toUpperCase() ||
        s.id?.toUpperCase() === stationId?.toUpperCase() ||
        s.name?.toUpperCase() === stationId?.toUpperCase()
      )
    : null;

  const currentStation = contextStation || foundInContext || foundInMaster;

  useEffect(() => {
    if (currentStation && !contextStation) {
      setSelectedStation(currentStation);
    }
  }, [currentStation, contextStation, setSelectedStation]);

  useEffect(() => {
    if (!currentStation) return;
    fetchStationWork();
  }, [currentStation]);

  const fetchStationWork = async () => {
    setLoadingWork(true);
    try {
      const stnCode = currentStation.code;
      const stnName = currentStation.name;

      // Query railway_work or track_requests for this station
      const { data: workData } = await supabase
        .from('railway_work')
        .select('*')
        .or(`station.ilike.%${stnCode}%,station.ilike.%${stnName}%`)
        .limit(5);

      const { data: reqData } = await supabase
        .from('track_requests')
        .select('*')
        .or(`station.ilike.%${stnCode}%,station_code.ilike.%${stnCode}%`)
        .limit(5);

      setActiveWorkRecords([...(workData || []), ...(reqData || [])]);
    } catch (err) {
      console.warn('Error fetching station work:', err);
    } finally {
      setLoadingWork(false);
    }
  };

  if (!currentStation) {
    return (
      <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl my-6">
        <p className="text-sm font-mono text-[#555555]">No Station selected or found for code: "{stationId}".</p>
        <button
          onClick={() => navigate('/railway-network/stations')}
          className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-[#333333]"
        >
          Return to Station Directory
        </button>
      </div>
    );
  }

  // Station view format compatible with StationSatelliteView
  const rawLat = currentStation.latitude ?? currentStation.lat ?? currentStation.coordinates?.lat ?? null;
  const rawLng = currentStation.longitude ?? currentStation.lng ?? currentStation.lon ?? currentStation.coordinates?.lng ?? null;

  const latVal = (rawLat !== null && rawLat !== undefined && !isNaN(Number(rawLat))) ? Number(rawLat) : null;
  const lngVal = (rawLng !== null && rawLng !== undefined && !isNaN(Number(rawLng))) ? Number(rawLng) : null;

  const stationObj = {
    id: currentStation.id || currentStation.code,
    code: currentStation.code,
    name: currentStation.name,
    station_code: currentStation.code,
    station_name: currentStation.name,
    zone_code: currentStation.zoneCode || currentStation.zone_code || selectedZone?.code || '',
    zone_name: currentStation.zoneName || currentStation.zone_name || selectedZone?.name || '',
    zoneId: currentStation.zoneCode || currentStation.zone_code || selectedZone?.code || '',
    division: currentStation.division || selectedDivision?.name || '',
    state: currentStation.state || '',
    latitude: latVal,
    longitude: lngVal,
    lat: latVal,
    lon: lngVal,
    station_type: currentStation.stationType || currentStation.station_type || 'Broad Gauge',
    google_maps_url: currentStation.googleMapsUrl || currentStation.google_maps_url || currentStation.google_maps || '',
    platforms: currentStation.platforms || '4-8',
    tracks: currentStation.tracks || '6 Lines',
    assetsCount: currentStation.assetsCount || 12,
    availability: currentStation.availability || 98,
    activeMaintenance: activeWorkRecords.length,
    alertsCount: 0,
    aliases: currentStation.aliases || []
  };

  return (
    <div className="space-y-6 pb-12 font-sans bg-white text-[#111111]">
      {/* NAVIGATION BAR & BACK BUTTON */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/railway-network/stations')}
            className="flex items-center gap-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-black border border-[#D9D9D9] px-4 py-2 rounded-lg text-xs font-bold transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Stations</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2 bg-white hover:bg-[#F7F7F7] text-[#555555] hover:text-black border border-[#E5E5E5] rounded-lg text-xs font-semibold transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#555555] font-bold">
          <span>RAILWAY NETWORK</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
          {selectedZone && (
            <>
              <button
                onClick={() => navigate(`/railway-network/zones/${selectedZone.code}`)}
                className="hover:underline text-[#333333]"
              >
                {selectedZone.code}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
            </>
          )}
          {selectedDivision && (
            <>
              <button
                onClick={() => navigate(`/railway-network/divisions/${selectedDivision.name}`)}
                className="hover:underline text-[#333333]"
              >
                {selectedDivision.name}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
            </>
          )}
          <span className="text-black bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]">
            STATION: {currentStation.code}
          </span>
        </div>
      </div>

      {/* RENDER SATELLITE & INFRASTRUCTURE DETAIL VIEW */}
      <StationSatelliteView
        station={stationObj}
        onBack={() => navigate('/railway-network/stations')}
      />
    </div>
  );
}

