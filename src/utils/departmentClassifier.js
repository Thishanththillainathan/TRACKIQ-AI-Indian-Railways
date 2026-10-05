/**
 * Central Department Classifier & Metadata Module for Railway System
 * Maps records deterministically into: SMMS, TMS, or TRD
 */

export const DEPARTMENT_KEYS = {
  SMMS: 'SMMS',
  TMS: 'TMS',
  TRD: 'TRD'
};

export const DEPARTMENT_METADATA = {
  SMMS: {
    id: 'SMMS',
    code: 'SMMS',
    legacyId: 'st',
    name: 'Signal & Telecom Department (SMMS)',
    shortName: 'SMMS (S&T)',
    wing: 'Signalling, Interlocking, Axle Counters, Kavach ATP & Telecom Grid',
    color: 'monochrome',
    badgeClass: 'bg-[#F5F5F5] text-black border-[#D9D9D9]',
    activeBadgeClass: 'bg-black text-white',
    borderClass: 'border-[#D9D9D9]',
    bgClass: 'bg-[#F5F5F5]',
    textClass: 'text-black',
    mlModel: 'RandomForest S&T Failure Risk Predictor',
    mlTarget: 'High_Failure_Risk (Major/Critical S&T Failure Severity)',
    mlMetrics: 'Accuracy: 98.20%, F1: 0.9819, ROC-AUC: 0.9957',
    blockType: 'S&T Block'
  },
  TMS: {
    id: 'TMS',
    code: 'TMS',
    legacyId: 'tmd',
    name: 'Track Management Department (TMS)',
    shortName: 'TMS (Track/Civil)',
    wing: 'Civil Engineering Wing — Track Infrastructure, Geometry & Heavy Machinery',
    color: 'monochrome',
    badgeClass: 'bg-[#F5F5F5] text-black border-[#D9D9D9]',
    activeBadgeClass: 'bg-black text-white',
    borderClass: 'border-[#D9D9D9]',
    bgClass: 'bg-[#F5F5F5]',
    textClass: 'text-black',
    mlModel: 'LinearRegression Track Duration Overrun Predictor',
    mlTarget: 'Actual Duration (Engineering Block Execution Time)',
    mlMetrics: 'R²: 0.9660, MAE: 2.556h (Low Duration MAE: 0.489h)',
    blockType: 'Engineering Block'
  },
  TRD: {
    id: 'TRD',
    code: 'TRD',
    legacyId: 'trd',
    name: 'Traction Distribution Department (TRD)',
    shortName: 'TRD (Traction OHE)',
    wing: 'Electrical Engineering Wing — 25kV OHE Overhead Power Grid & TSS Substations',
    color: 'monochrome',
    badgeClass: 'bg-[#F5F5F5] text-black border-[#D9D9D9]',
    activeBadgeClass: 'bg-black text-white',
    borderClass: 'border-[#D9D9D9]',
    bgClass: 'bg-[#F5F5F5]',
    textClass: 'text-black',
    mlModel: 'HistGradientBoosting Affected Trains Predictor',
    mlTarget: 'Affected Trains (Train Disruption Count)',
    mlMetrics: 'R²: 0.7323, MAE: 7.592 trains (Low Traffic MAE: 3.46 trains)',
    blockType: 'Traction (OHE) Block / Traction Power Block'
  }
};

/**
 * Classifies any record into 'SMMS', 'TMS', or 'TRD'
 */
export function getDepartment(record) {
  if (!record) return 'TMS';

  // 1. Direct explicit department string check
  const deptStr = String(
    record.department || record.dept || record.maintenance_type || record['Block Type'] || record.block_type || ''
  ).trim().toUpperCase();

  if (['SMMS', 'S&T', 'ST', 'S&T BLOCK'].includes(deptStr)) return 'SMMS';
  if (['TMS', 'TMD', 'TRACK', 'CIVIL', 'ENGINEERING BLOCK'].includes(deptStr)) return 'TMS';
  if (['TRD', 'TRACTION', 'ELECTRICAL', 'OHE', 'TRACTION POWER BLOCK', 'TRACTION (OHE) BLOCK'].includes(deptStr)) return 'TRD';

  // 2. Block Type check
  const blockType = String(record['Block Type'] || record.block_type || record.blockType || '').trim();
  if (blockType === 'S&T Block') return 'SMMS';
  if (blockType === 'Engineering Block') return 'TMS';
  if (blockType === 'Traction (OHE) Block' || blockType === 'Traction Power Block') return 'TRD';

  // 3. Asset Type / Asset Name / Problem Type Keyword Match
  const assetStr = String(
    record['Asset Type'] || record.asset_type || record['Asset Name'] || record.asset_name || record['Problem Type'] || record.problem_type || record.asset_code || ''
  ).toLowerCase();

  if (
    assetStr.includes('signal') || assetStr.includes('point & crossing') || assetStr.includes('axle counter') ||
    assetStr.includes('track circuit') || assetStr.includes('interlocking') || assetStr.includes('ofc') ||
    assetStr.includes('kavach') || assetStr.includes('station info') || assetStr.includes('telecom') || assetStr.includes('s&t')
  ) {
    return 'SMMS';
  }

  if (
    assetStr.includes('ohe') || assetStr.includes('traction') || assetStr.includes('tss') ||
    assetStr.includes('substation') || assetStr.includes('paralleling') || assetStr.includes('locomotive') ||
    assetStr.includes('pantograph') || assetStr.includes('catenary') || assetStr.includes('dg power')
  ) {
    return 'TRD';
  }

  // Default for track, rail, bridge, tunnel, level crossing
  return 'TMS';
}

/**
 * Filters array of records by target department ('ALL', 'SMMS', 'TMS', 'TRD')
 */
export function filterByDepartment(records = [], targetDept = 'ALL') {
  if (!Array.isArray(records)) return [];
  if (!targetDept || targetDept.toUpperCase() === 'ALL') return records;

  const normalizedTarget = targetDept.toUpperCase() === 'ST' ? 'SMMS' : (targetDept.toUpperCase() === 'TMD' ? 'TMS' : targetDept.toUpperCase());

  return records.filter(record => {
    const dept = getDepartment(record);
    return dept === normalizedTarget;
  });
}
