import React, { createContext, useContext, useState } from 'react';
import { getZones, getDivisions } from '../services/railwayNetworkService';

const RailwayNetworkContext = createContext();

export function RailwayNetworkProvider({ children }) {
  const [selectedZone, setSelectedZoneState] = useState(null);
  const [selectedDivision, setSelectedDivisionState] = useState(null);
  const [selectedStation, setSelectedStationState] = useState(null);
  const [selectedDepartment, setSelectedDepartmentState] = useState('TMS');

  // activeView: 'dashboard' | 'zone_directory' | 'division_directory' | 'station_directory' | 'zone' | 'division' | 'station' | 'department'
  const [activeView, setActiveView] = useState('dashboard');

  // Department Opener
  const openDepartment = (deptKey = 'TMS') => {
    const key = (deptKey || 'TMS').toUpperCase();
    setSelectedDepartmentState(key);
    setActiveView('department');
  };

  // Directory Openers
  const openZoneDirectory = () => {
    setActiveView('zone_directory');
  };

  const openDivisionDirectory = () => {
    setActiveView('division_directory');
  };

  const openStationDirectory = () => {
    setActiveView('station_directory');
  };

  // Set active Zone -> Opens Zone Details View in Main Content Area
  const setSelectedZone = (zone) => {
    if (!zone) {
      setSelectedZoneState(null);
      setActiveView('zone_directory');
      return;
    }
    const zoneObj = typeof zone === 'string'
      ? getZones().find(z => z.code.toUpperCase() === zone.toUpperCase() || z.name.toLowerCase() === zone.toLowerCase()) || { code: zone, name: zone }
      : zone;

    setSelectedZoneState(zoneObj);
    setActiveView('zone');

    // Reset division/station if they don't match new zone
    if (selectedDivision && selectedDivision.zoneCode && zoneObj.code &&
        selectedDivision.zoneCode.toUpperCase() !== zoneObj.code.toUpperCase()) {
      setSelectedDivisionState(null);
      setSelectedStationState(null);
    }
  };

  // Set active Division -> Opens Division Details View in Main Content Area
  const setSelectedDivision = (div) => {
    if (!div) {
      setSelectedDivisionState(null);
      setActiveView('division_directory');
      return;
    }
    const divObj = typeof div === 'string'
      ? getDivisions().find(d => d.name.toLowerCase() === div.toLowerCase()) || { name: div }
      : div;

    setSelectedDivisionState(divObj);
    setActiveView('division');

    // Auto-select parent zone if division specifies zoneCode
    if (divObj.zoneCode) {
      const matchZone = getZones().find(z => z.code.toUpperCase() === divObj.zoneCode.toUpperCase());
      if (matchZone) {
        setSelectedZoneState(matchZone);
      }
    }
  };

  // Set active Station -> Opens Station Details View in Main Content Area
  const setSelectedStation = (stn) => {
    if (!stn) {
      setSelectedStationState(null);
      setActiveView('station_directory');
      return;
    }
    setSelectedStationState(stn);
    setActiveView('station');

    // Auto-sync parent division & zone
    if (stn.division) {
      const matchDiv = getDivisions().find(d => d.name.toLowerCase() === stn.division.toLowerCase());
      if (matchDiv) {
        setSelectedDivisionState(matchDiv);
      } else {
        setSelectedDivisionState({ name: stn.division, zoneCode: stn.zoneCode || '' });
      }
    }
    if (stn.zoneCode) {
      const matchZone = getZones().find(z => z.code.toUpperCase() === stn.zoneCode.toUpperCase());
      if (matchZone) {
        setSelectedZoneState(matchZone);
      }
    }
  };

  // Return to normal Dashboard view
  const showDashboard = () => {
    setActiveView('dashboard');
  };

  // Clear all filters & return to normal Dashboard
  const clearNetworkFilter = () => {
    setSelectedZoneState(null);
    setSelectedDivisionState(null);
    setSelectedStationState(null);
    setActiveView('dashboard');
  };

  const value = {
    selectedZone,
    selectedDivision,
    selectedStation,
    selectedDepartment,
    activeView,
    openZoneDirectory,
    openDivisionDirectory,
    openStationDirectory,
    openDepartment,
    setSelectedZone,
    setSelectedDivision,
    setSelectedStation,
    showDashboard,
    clearNetworkFilter,
    isFilterActive: Boolean(selectedZone || selectedDivision || selectedStation)
  };

  return (
    <RailwayNetworkContext.Provider value={value}>
      {children}
    </RailwayNetworkContext.Provider>
  );
}

export function useRailwayNetwork() {
  const context = useContext(RailwayNetworkContext);
  if (!context) {
    throw new Error('useRailwayNetwork must be used within a RailwayNetworkProvider');
  }
  return context;
}
