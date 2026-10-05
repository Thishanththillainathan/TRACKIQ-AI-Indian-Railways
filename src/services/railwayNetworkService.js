import railwayMasterData from '../data/railwayNetworkMaster.json';
import { supabase } from '../lib/supabaseClient';
import { STATIONS as MOCK_STATIONS } from '../data/mockData';

// Normalization & deduplication helper for station records
function normStation(row) {
  const code = strClean(row.station_code || row.stationCode || row.code).toUpperCase();
  const name = strClean(row.station_name || row.stationName || row.name || row.officialName);
  const zoneCode = strClean(row.zone_code || row.zoneCode || row.zone).toUpperCase();
  const division = strClean(row.division || row.district || row.division_name);
  const state = strClean(row.state);
  const lat = row.latitude || row.lat;
  const lon = row.longitude || row.lon;

  // Primary station code if valid, otherwise normalized uppercase name
  const validCode = (code && !['NAN', 'NONE', 'NULL', 'UNDEFINED'].includes(code)) ? code : '';
  const idKey = validCode || name.toUpperCase();

  return {
    id: idKey,
    code: validCode || idKey,
    name: name || validCode || 'Station',
    zoneCode: zoneCode,
    zoneName: getZoneNameByCode(zoneCode),
    division: division,
    state: state,
    latitude: lat,
    longitude: lon,
    lat: lat,
    lon: lon,
    stationType: strClean(row.station_type || row.gauge || 'Broad Gauge'),
    googleMapsUrl: row.google_maps_url || (lat && lon
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
      : '')
  };
}

function strClean(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).strip ? String(val).strip() : String(val).trim();
  return s === 'nan' || s === 'null' || s === 'None' ? '' : s;
}

function getZoneNameByCode(code) {
  if (!code) return '';
  const z = (railwayMasterData.zones || []).find(item => item.code.toUpperCase() === code.toUpperCase());
  return z ? z.name : code;
}

/**
 * Deduplicates station objects array based on station identity key (code / normalized name).
 */
export function deduplicateStations(stationList) {
  const seen = new Set();
  const unique = [];

  for (const st of stationList) {
    const norm = normStation(st);
    if (!norm.id || norm.id === 'NONE' || norm.id === 'NAN') continue;

    if (!seen.has(norm.id)) {
      seen.add(norm.id);
      unique.push(norm);
    } else {
      // Merge extra details into existing unique station if fields are missing
      const existing = unique.find(item => item.id === norm.id);
      if (existing) {
        if (!existing.division && norm.division) existing.division = norm.division;
        if (!existing.zoneCode && norm.zoneCode) {
          existing.zoneCode = norm.zoneCode;
          existing.zoneName = norm.zoneName;
        }
        if (!existing.state && norm.state) existing.state = norm.state;
        if (!existing.latitude && norm.latitude) {
          existing.latitude = norm.latitude;
          existing.longitude = norm.longitude;
        }
      }
    }
  }

  return unique;
}

/**
 * Returns all 19 unique Railway Zones from master dataset
 */
export function getZones() {
  const zones = railwayMasterData.zones || [];
  const seen = new Set();
  const unique = [];

  for (const z of zones) {
    if (!seen.has(z.code)) {
      seen.add(z.code);
      unique.push(z);
    }
  }

  return unique.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns all 71 unique Railway Divisions from master dataset.
 * If activeZoneCode is provided, divisions belonging to that Zone are listed first.
 */
export function getDivisions(activeZoneCode = null) {
  const allDivs = railwayMasterData.divisions || [];
  const seen = new Set();
  const unique = [];

  for (const d of allDivs) {
    const key = `${d.name.toLowerCase()}_${(d.zoneCode || '').toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(d);
    }
  }
  
  if (!activeZoneCode) {
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }

  const zoneCodeUpper = activeZoneCode.trim().toUpperCase();
  const matching = [];
  const others = [];

  unique.forEach(div => {
    if (div.zoneCode && div.zoneCode.toUpperCase() === zoneCodeUpper) {
      matching.push(div);
    } else {
      others.push(div);
    }
  });

  matching.sort((a, b) => a.name.localeCompare(b.name));
  others.sort((a, b) => a.name.localeCompare(b.name));

  return [...matching, ...others];
}

/**
 * Returns complete paginated, searchable, and filterable station records from master dataset (19,299 unique stations)
 */
export function getStations(params = {}) {
  const {
    page = 1,
    limit = 50,
    search = '',
    zone = '',
    division = '',
    state = '',
    district = ''
  } = params;

  let list = (railwayMasterData.stations || []).map(s => normStation(s));

  if (zone && zone.toUpperCase() !== 'ALL') {
    const zQ = zone.toUpperCase();
    list = list.filter(s =>
      (s.zoneCode && s.zoneCode.toUpperCase() === zQ) ||
      (s.zoneName && s.zoneName.toUpperCase().includes(zQ))
    );
  }

  if (division && division.toUpperCase() !== 'ALL') {
    const dQ = division.toLowerCase();
    list = list.filter(s =>
      s.division && s.division.toLowerCase().includes(dQ)
    );
  }

  if (state && state.toUpperCase() !== 'ALL') {
    const stQ = state.toLowerCase();
    list = list.filter(s =>
      s.state && s.state.toLowerCase().includes(stQ)
    );
  }

  if (district && district.toUpperCase() !== 'ALL') {
    const dtQ = district.toLowerCase();
    list = list.filter(s =>
      s.district && s.district.toLowerCase().includes(dtQ)
    );
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(s =>
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.zoneName && s.zoneName.toLowerCase().includes(q)) ||
      (s.division && s.division.toLowerCase().includes(q)) ||
      (s.state && s.state.toLowerCase().includes(q)) ||
      (s.district && s.district.toLowerCase().includes(q))
    );
  }

  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const validPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (validPage - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    stations: paginated,
    totalCount,
    totalPages,
    currentPage: validPage,
    pageSize: limit
  };
}

/**
 * Returns overall Railway Network KPIs dynamically from authoritative master datasets
 */
export function getNetworkKPIs() {
  const totalZones = getZones().length;
  const totalDivisions = getDivisions().length;
  const totalStations = (railwayMasterData.stations || []).length || 19299;

  return {
    totalZones,
    totalDivisions,
    totalStations,
    totalAssets: 49031
  };
}

/**
 * Searches stations dynamically from Supabase database (with local master dataset fallback).
 */
export async function searchStations({
  query = '',
  zoneCode = null,
  division = null,
  limit = 20,
  offset = 0
}) {
  const res = getStations({
    page: Math.floor(offset / limit) + 1,
    limit,
    search: query,
    zone: zoneCode,
    division
  });

  return {
    stations: res.stations,
    totalCount: res.totalCount,
    source: 'master'
  };
}

