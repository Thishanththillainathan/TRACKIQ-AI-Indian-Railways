// ============================================================
// INDIAN RAILWAYS AI CONTROL CENTER
// MASTER PROTOTYPE DATASET
//
// IMPORTANT:
// 1. Existing UI/demo data is preserved.
// 2. PDF-derived axle-counter asset registry is added.
// 3. Asset hierarchy:
//    ZONE -> HQ -> DIVISION -> STATION/BLOCK SECTION -> ASSET TYPE
//
// PDF-derived asset types:
// SSDAC
// MSDAC
// BPAC
// DAC
// Analog Axle Counter
// Wheel Sensor - Axle Detector
// Axle Counter Evaluator
// Reset Box - Reset Unit
// Other Axle Counter Equipment
//
// PDF records are marked as installation-level verification required.
// ============================================================


// ============================================================
// 1. GLOBAL SYSTEM STATS
// ============================================================

export const GLOBAL_SYSTEM_STATS = {
  totalZones: 17,
  totalDivisions: 68,
  totalStations: 7325,
  totalAssets: 1420850,

  activeMaintenanceRequests: 142,
  todaysPlannedBlocks: 38,
  trainsOperatingNow: 12450,

  overallAssetAvailability: 94.8,
  aiOptimizationScore: 96.2,

  lastSyncTime: "Just now",
  isLiveSimulated: true,
};


// ============================================================
// 2. RAILWAY ZONES
// ============================================================

export const RAILWAY_ZONES = [
  {
    id: "SR",
    name: "Southern Railway",
    hq: "Chennai",
    code: "SR",
    divisionsCount: 6,
    stationsCount: 720,
    assetsCount: 145000,
    activeBlocks: 4,
    requestsCount: 18,
    availability: 95.4,
    trainCount: 1280,
    color: "#1D4ED8",
    mapPos: { x: 42, y: 78 },
  },
  {
    id: "CR",
    name: "Central Railway",
    hq: "Mumbai",
    code: "CR",
    divisionsCount: 5,
    stationsCount: 612,
    assetsCount: 132000,
    activeBlocks: 3,
    requestsCount: 14,
    availability: 94.1,
    trainCount: 1420,
    color: "#12345A",
    mapPos: { x: 32, y: 52 },
  },
  {
    id: "ER",
    name: "Eastern Railway",
    hq: "Kolkata Fairlie",
    code: "ER",
    divisionsCount: 4,
    stationsCount: 580,
    assetsCount: 110000,
    activeBlocks: 2,
    requestsCount: 11,
    availability: 93.8,
    trainCount: 1150,
    color: "#0B1F3A",
    mapPos: { x: 74, y: 44 },
  },
  {
    id: "NR",
    name: "Northern Railway",
    hq: "New Delhi",
    code: "NR",
    divisionsCount: 5,
    stationsCount: 1042,
    assetsCount: 210000,
    activeBlocks: 5,
    requestsCount: 22,
    availability: 92.6,
    trainCount: 1890,
    color: "#1D4ED8",
    mapPos: { x: 40, y: 22 },
  },
  {
    id: "WR",
    name: "Western Railway",
    hq: "Mumbai Churchgate",
    code: "WR",
    divisionsCount: 6,
    stationsCount: 910,
    assetsCount: 180000,
    activeBlocks: 4,
    requestsCount: 16,
    availability: 96.1,
    trainCount: 1510,
    color: "#12345A",
    mapPos: { x: 26, y: 42 },
  },
  {
    id: "SCR",
    name: "South Central Railway",
    hq: "Secunderabad",
    code: "SCR",
    divisionsCount: 6,
    stationsCount: 755,
    assetsCount: 152000,
    activeBlocks: 3,
    requestsCount: 15,
    availability: 95.2,
    trainCount: 1340,
    color: "#0B1F3A",
    mapPos: { x: 44, y: 62 },
  },
  {
    id: "ECR",
    name: "East Central Railway",
    hq: "Hajipur",
    code: "ECR",
    divisionsCount: 5,
    stationsCount: 640,
    assetsCount: 118000,
    activeBlocks: 2,
    requestsCount: 9,
    availability: 94.5,
    trainCount: 980,
    color: "#12345A",
    mapPos: { x: 65, y: 35 },
  },
  {
    id: "ECOR",
    name: "East Coast Railway",
    hq: "Bhubaneswar",
    code: "ECoR",
    divisionsCount: 3,
    stationsCount: 380,
    assetsCount: 88000,
    activeBlocks: 2,
    requestsCount: 7,
    availability: 96.8,
    trainCount: 840,
    color: "#0B1F3A",
    mapPos: { x: 64, y: 54 },
  },
  {
    id: "NCR",
    name: "North Central Railway",
    hq: "Prayagraj",
    code: "NCR",
    divisionsCount: 3,
    stationsCount: 420,
    assetsCount: 95000,
    activeBlocks: 3,
    requestsCount: 12,
    availability: 93.4,
    trainCount: 1620,
    color: "#12345A",
    mapPos: { x: 48, y: 32 },
  },
  {
    id: "NER",
    name: "North Eastern Railway",
    hq: "Gorakhpur",
    code: "NER",
    divisionsCount: 3,
    stationsCount: 510,
    assetsCount: 92000,
    activeBlocks: 1,
    requestsCount: 6,
    availability: 95.9,
    trainCount: 720,
    color: "#0B1F3A",
    mapPos: { x: 56, y: 28 },
  },
  {
    id: "NFR",
    name: "Northeast Frontier Railway",
    hq: "Guwahati",
    code: "NFR",
    divisionsCount: 5,
    stationsCount: 560,
    assetsCount: 84000,
    activeBlocks: 2,
    requestsCount: 8,
    availability: 91.8,
    trainCount: 540,
    color: "#1D4ED8",
    mapPos: { x: 86, y: 28 },
  },
  {
    id: "NWR",
    name: "North Western Railway",
    hq: "Jaipur",
    code: "NWR",
    divisionsCount: 4,
    stationsCount: 590,
    assetsCount: 105000,
    activeBlocks: 2,
    requestsCount: 8,
    availability: 95.0,
    trainCount: 890,
    color: "#12345A",
    mapPos: { x: 30, y: 28 },
  },
  {
    id: "SER",
    name: "South Eastern Railway",
    hq: "Kolkata Garden Reach",
    code: "SER",
    divisionsCount: 4,
    stationsCount: 360,
    assetsCount: 99000,
    activeBlocks: 2,
    requestsCount: 10,
    availability: 94.9,
    trainCount: 1100,
    color: "#0B1F3A",
    mapPos: { x: 68, y: 48 },
  },
  {
    id: "SECR",
    name: "South East Central Railway",
    hq: "Bilaspur",
    code: "SECR",
    divisionsCount: 3,
    stationsCount: 320,
    assetsCount: 94000,
    activeBlocks: 1,
    requestsCount: 5,
    availability: 97.2,
    trainCount: 920,
    color: "#12345A",
    mapPos: { x: 56, y: 48 },
  },
  {
    id: "SWR",
    name: "South Western Railway",
    hq: "Hubballi",
    code: "SWR",
    divisionsCount: 3,
    stationsCount: 410,
    assetsCount: 89000,
    activeBlocks: 2,
    requestsCount: 8,
    availability: 96.0,
    trainCount: 780,
    color: "#1D4ED8",
    mapPos: { x: 36, y: 72 },
  },
  {
    id: "WCR",
    name: "West Central Railway",
    hq: "Jabalpur",
    code: "WCR",
    divisionsCount: 3,
    stationsCount: 390,
    assetsCount: 91000,
    activeBlocks: 1,
    requestsCount: 6,
    availability: 95.6,
    trainCount: 1050,
    color: "#12345A",
    mapPos: { x: 44, y: 42 },
  },
  {
    id: "METRO",
    name: "Metro Railway, Kolkata",
    hq: "Kolkata",
    code: "METRO",
    divisionsCount: 0,
    stationsCount: 0,
    assetsCount: 15000,
    activeBlocks: 1,
    requestsCount: 2,
    availability: 99.1,
    trainCount: 320,
    color: "#1D4ED8",
    mapPos: { x: 77, y: 46 },
  },
];


// ============================================================
// 3. DIVISIONS
// ============================================================

export const DIVISIONS = [
  // SOUTHERN RAILWAY
  {
    id: "DIV-MAS",
    name: "Chennai",
    code: "MAS",
    zoneId: "SR",
    hq: "Chennai",
  },
  {
    id: "DIV-MDU",
    name: "Madurai",
    code: "MDU",
    zoneId: "SR",
    hq: "Chennai",
  },
  {
    id: "DIV-PGT",
    name: "Palakkad",
    code: "PGT",
    zoneId: "SR",
    hq: "Chennai",
  },
  {
    id: "DIV-TPJ",
    name: "Tiruchchirappalli",
    code: "TPJ",
    zoneId: "SR",
    hq: "Chennai",
  },
  {
    id: "DIV-TVC",
    name: "Thiruvananthapuram",
    code: "TVC",
    zoneId: "SR",
    hq: "Chennai",
  },
  {
    id: "DIV-SA",
    name: "Salem",
    code: "SA",
    zoneId: "SR",
    hq: "Chennai",
  },

  // CENTRAL RAILWAY
  {
    id: "DIV-BB",
    name: "Mumbai",
    code: "BB",
    zoneId: "CR",
    hq: "Mumbai",
  },
  {
    id: "DIV-BSL",
    name: "Bhusaval",
    code: "BSL",
    zoneId: "CR",
    hq: "Mumbai",
  },
  {
    id: "DIV-NGP",
    name: "Nagpur",
    code: "NGP",
    zoneId: "CR",
    hq: "Mumbai",
  },
  {
    id: "DIV-SUR",
    name: "Solapur",
    code: "SUR",
    zoneId: "CR",
    hq: "Mumbai",
  },
  {
    id: "DIV-PNQ",
    name: "Pune",
    code: "PUNE",
    zoneId: "CR",
    hq: "Mumbai",
  },

  // EASTERN RAILWAY
  {
    id: "DIV-ASN",
    name: "Asansol",
    code: "ASN",
    zoneId: "ER",
    hq: "Kolkata",
  },
  {
    id: "DIV-HWH",
    name: "Howrah",
    code: "HWH",
    zoneId: "ER",
    hq: "Kolkata",
  },
  {
    id: "DIV-MLDT",
    name: "Malda",
    code: "MLDT",
    zoneId: "ER",
    hq: "Kolkata",
  },
  {
    id: "DIV-SDAH",
    name: "Sealdah",
    code: "SDAH",
    zoneId: "ER",
    hq: "Kolkata",
  },

  // EAST CENTRAL RAILWAY
  {
    id: "DIV-SEE",
    name: "Sonpur",
    code: "SEE",
    zoneId: "ECR",
    hq: "Hajipur",
  },
  {
    id: "DIV-SPJ",
    name: "Samastipur",
    code: "SPJ",
    zoneId: "ECR",
    hq: "Hajipur",
  },
  {
    id: "DIV-DNR",
    name: "Danapur",
    code: "DNR",
    zoneId: "ECR",
    hq: "Hajipur",
  },
  {
    id: "DIV-DHN",
    name: "Dhanbad",
    code: "DHN",
    zoneId: "ECR",
    hq: "Hajipur",
  },
  {
    id: "DIV-DDU",
    name: "Pt. Deen Dayal Upadhyaya",
    code: "DDU",
    zoneId: "ECR",
    hq: "Hajipur",
  },

  // EAST COAST RAILWAY
  {
    id: "DIV-KUR",
    name: "Khurda Road",
    code: "KUR",
    zoneId: "ECOR",
    hq: "Bhubaneswar",
  },
  {
    id: "DIV-SBP",
    name: "Sambalpur",
    code: "SBP",
    zoneId: "ECOR",
    hq: "Bhubaneswar",
  },
  {
    id: "DIV-VSKP",
    name: "Waltair",
    code: "WAT",
    zoneId: "ECOR",
    hq: "Bhubaneswar",
  },

  // NORTHERN RAILWAY
  {
    id: "DIV-UMB",
    name: "Ambala",
    code: "UMB",
    zoneId: "NR",
    hq: "New Delhi",
  },
  {
    id: "DIV-DLI",
    name: "Delhi",
    code: "DLI",
    zoneId: "NR",
    hq: "New Delhi",
  },
  {
    id: "DIV-LKO",
    name: "Lucknow",
    code: "LKO",
    zoneId: "NR",
    hq: "New Delhi",
  },
  {
    id: "DIV-MB",
    name: "Moradabad",
    code: "MB",
    zoneId: "NR",
    hq: "New Delhi",
  },
  {
    id: "DIV-FZR",
    name: "Firozpur",
    code: "FZR",
    zoneId: "NR",
    hq: "New Delhi",
  },

  // NORTH CENTRAL RAILWAY
  {
    id: "DIV-PRYJ",
    name: "Prayagraj",
    code: "PRYJ",
    zoneId: "NCR",
    hq: "Prayagraj",
  },
  {
    id: "DIV-AGC",
    name: "Agra",
    code: "AGC",
    zoneId: "NCR",
    hq: "Prayagraj",
  },
  {
    id: "DIV-JHS",
    name: "Jhansi",
    code: "JHS",
    zoneId: "NCR",
    hq: "Prayagraj",
  },

  // NORTH EASTERN RAILWAY
  {
    id: "DIV-LJN",
    name: "Lucknow",
    code: "LJN",
    zoneId: "NER",
    hq: "Gorakhpur",
  },
  {
    id: "DIV-IZN",
    name: "Izzatnagar",
    code: "IZN",
    zoneId: "NER",
    hq: "Gorakhpur",
  },
  {
    id: "DIV-BSB",
    name: "Varanasi",
    code: "BSB",
    zoneId: "NER",
    hq: "Gorakhpur",
  },

  // NORTHEAST FRONTIER RAILWAY
  {
    id: "DIV-APDJ",
    name: "Alipurduar",
    code: "APDJ",
    zoneId: "NFR",
    hq: "Guwahati",
  },
  {
    id: "DIV-KIR",
    name: "Katihar",
    code: "KIR",
    zoneId: "NFR",
    hq: "Guwahati",
  },
  {
    id: "DIV-LMG",
    name: "Lumding",
    code: "LMG",
    zoneId: "NFR",
    hq: "Guwahati",
  },
  {
    id: "DIV-RNY",
    name: "Rangiya",
    code: "RNY",
    zoneId: "NFR",
    hq: "Guwahati",
  },
  {
    id: "DIV-TSK",
    name: "Tinsukia",
    code: "TSK",
    zoneId: "NFR",
    hq: "Guwahati",
  },

  // NORTH WESTERN RAILWAY
  {
    id: "DIV-AII",
    name: "Ajmer",
    code: "AII",
    zoneId: "NWR",
    hq: "Jaipur",
  },
  {
    id: "DIV-BKN",
    name: "Bikaner",
    code: "BKN",
    zoneId: "NWR",
    hq: "Jaipur",
  },
  {
    id: "DIV-JP",
    name: "Jaipur",
    code: "JP",
    zoneId: "NWR",
    hq: "Jaipur",
  },
  {
    id: "DIV-JU",
    name: "Jodhpur",
    code: "JU",
    zoneId: "NWR",
    hq: "Jaipur",
  },

  // SOUTH CENTRAL RAILWAY
  {
    id: "DIV-GTL",
    name: "Guntakal",
    code: "GTL",
    zoneId: "SCR",
    hq: "Secunderabad",
  },
  {
    id: "DIV-GNT",
    name: "Guntur",
    code: "GNT",
    zoneId: "SCR",
    hq: "Secunderabad",
  },
  {
    id: "DIV-HYB",
    name: "Hyderabad",
    code: "HYB",
    zoneId: "SCR",
    hq: "Secunderabad",
  },
  {
    id: "DIV-NED",
    name: "Nanded",
    code: "NED",
    zoneId: "SCR",
    hq: "Secunderabad",
  },
  {
    id: "DIV-SC",
    name: "Secunderabad",
    code: "SC",
    zoneId: "SCR",
    hq: "Secunderabad",
  },
  {
    id: "DIV-BZA",
    name: "Vijayawada",
    code: "BZA",
    zoneId: "SCR",
    hq: "Secunderabad",
  },

  // SOUTH EASTERN RAILWAY
  {
    id: "DIV-ADRA",
    name: "Adra",
    code: "ADRA",
    zoneId: "SER",
    hq: "Kolkata",
  },
  {
    id: "DIV-CKP",
    name: "Chakradharpur",
    code: "CKP",
    zoneId: "SER",
    hq: "Kolkata",
  },
  {
    id: "DIV-KGP",
    name: "Kharagpur",
    code: "KGP",
    zoneId: "SER",
    hq: "Kolkata",
  },
  {
    id: "DIV-RNC",
    name: "Ranchi",
    code: "RNC",
    zoneId: "SER",
    hq: "Kolkata",
  },

  // SOUTH EAST CENTRAL RAILWAY
  {
    id: "DIV-R",
    name: "Raipur",
    code: "R",
    zoneId: "SECR",
    hq: "Bilaspur",
  },
  {
    id: "DIV-NGP-SECR",
    name: "Nagpur",
    code: "NGP",
    zoneId: "SECR",
    hq: "Bilaspur",
  },
  {
    id: "DIV-BSP",
    name: "Bilaspur",
    code: "BSP",
    zoneId: "SECR",
    hq: "Bilaspur",
  },

  // SOUTH WESTERN RAILWAY
  {
    id: "DIV-SBC",
    name: "Bengaluru",
    code: "SBC",
    zoneId: "SWR",
    hq: "Hubballi",
  },
  {
    id: "DIV-UBL",
    name: "Hubballi",
    code: "UBL",
    zoneId: "SWR",
    hq: "Hubballi",
  },
  {
    id: "DIV-MYS",
    name: "Mysuru",
    code: "MYS",
    zoneId: "SWR",
    hq: "Hubballi",
  },

  // WESTERN RAILWAY
  {
    id: "DIV-BCT",
    name: "Mumbai Central",
    code: "BCT",
    zoneId: "WR",
    hq: "Mumbai",
  },
  {
    id: "DIV-BRC",
    name: "Vadodara",
    code: "BRC",
    zoneId: "WR",
    hq: "Mumbai",
  },
  {
    id: "DIV-RJT",
    name: "Rajkot",
    code: "RJT",
    zoneId: "WR",
    hq: "Mumbai",
  },
  {
    id: "DIV-RATLAM",
    name: "Ratlam",
    code: "RTM",
    zoneId: "WR",
    hq: "Mumbai",
  },
  {
    id: "DIV-ADI",
    name: "Ahmedabad",
    code: "ADI",
    zoneId: "WR",
    hq: "Mumbai",
  },
  {
    id: "DIV-Bhavnagar",
    name: "Bhavnagar",
    code: "BVC",
    zoneId: "WR",
    hq: "Mumbai",
  },

  // WEST CENTRAL RAILWAY
  {
    id: "DIV-BPL",
    name: "Bhopal",
    code: "BPL",
    zoneId: "WCR",
    hq: "Jabalpur",
  },
  {
    id: "DIV-JBP",
    name: "Jabalpur",
    code: "JBP",
    zoneId: "WCR",
    hq: "Jabalpur",
  },
  {
    id: "DIV-KOTA",
    name: "Kota",
    code: "KOTA",
    zoneId: "WCR",
    hq: "Jabalpur",
  },
];


// ============================================================
// 4. PDF-DERIVED ASSET TYPES
// ============================================================

export const RAILWAY_ASSET_TYPES = [
  {
    id: "SSDAC",
    name: "SSDAC",
    description: "Single Section Digital Axle Counter",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
  {
    id: "MSDAC",
    name: "MSDAC",
    description: "Multi Section Digital Axle Counter",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
  {
    id: "BPAC",
    name: "BPAC",
    description: "Block Proving by Axle Counter",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
  {
    id: "DAC",
    name: "DAC",
    description: "Digital Axle Counter",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
  {
    id: "ANALOG_AXLE_COUNTER",
    name: "Analog Axle Counter",
    description: "Legacy / analog axle counter",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
  {
    id: "WHEEL_SENSOR",
    name: "Wheel Sensor - Axle Detector",
    description: "Trackside wheel / axle detection sensor",
    department: "S&T",
    category: "Train Detection / Axle Detection",
  },
  {
    id: "AXLE_COUNTER_EVALUATOR",
    name: "Axle Counter Evaluator",
    description: "Axle counter processing / evaluation equipment",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
  {
    id: "RESET_BOX",
    name: "Reset Box - Reset Unit",
    description: "Reset / recovery unit",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
  {
    id: "OTHER_AXLE_COUNTER",
    name: "Other Axle Counter Equipment",
    description: "Other axle-counter-related equipment",
    department: "S&T",
    category: "Train Detection / Axle Counter",
  },
];


// ============================================================
// 5. PDF-DERIVED INSTALLATION / LOCATION MASTER
// ============================================================
//
// NOTE:
// These are the Zone -> Division mappings explicitly represented
// in the PDF. The source marks these as requiring
// installation-level verification.
// ============================================================

export const PDF_AXLE_COUNTER_LOCATIONS = [
  // ----------------------------------------------------------
  // CENTRAL RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "CR",
    zoneName: "Central Railway",
    headquarters: "Mumbai",
    divisionName: "Mumbai",
    section: "Mumbai",
  },
  {
    zoneCode: "CR",
    zoneName: "Central Railway",
    headquarters: "Mumbai",
    divisionName: "Bhusaval",
    section: "Bhusaval",
  },
  {
    zoneCode: "CR",
    zoneName: "Central Railway",
    headquarters: "Mumbai",
    divisionName: "Nagpur",
    section: "Nagpur",
  },
  {
    zoneCode: "CR",
    zoneName: "Central Railway",
    headquarters: "Mumbai",
    divisionName: "Solapur",
    section: "Solapur",
  },
  {
    zoneCode: "CR",
    zoneName: "Central Railway",
    headquarters: "Mumbai",
    divisionName: "Pune",
    section: "Pune",
  },

  // ----------------------------------------------------------
  // EASTERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "ER",
    zoneName: "Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Asansol",
    section: "Asansol",
  },
  {
    zoneCode: "ER",
    zoneName: "Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Howrah",
    section: "Howrah",
  },
  {
    zoneCode: "ER",
    zoneName: "Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Malda",
    section: "Malda",
  },
  {
    zoneCode: "ER",
    zoneName: "Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Sealdah",
    section: "Sealdah",
  },

  // ----------------------------------------------------------
  // EAST CENTRAL RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "ECR",
    zoneName: "East Central Railway",
    headquarters: "Hajipur",
    divisionName: "Sonpur",
    section: "Sonpur",
  },
  {
    zoneCode: "ECR",
    zoneName: "East Central Railway",
    headquarters: "Hajipur",
    divisionName: "Samastipur",
    section: "Samastipur",
  },
  {
    zoneCode: "ECR",
    zoneName: "East Central Railway",
    headquarters: "Hajipur",
    divisionName: "Danapur",
    section: "Danapur",
  },
  {
    zoneCode: "ECR",
    zoneName: "East Central Railway",
    headquarters: "Hajipur",
    divisionName: "Dhanbad",
    section: "Dhanbad",
  },
  {
    zoneCode: "ECR",
    zoneName: "East Central Railway",
    headquarters: "Hajipur",
    divisionName: "Pt. Deen Dayal Upadhyaya",
    section: "Pt. Deen Dayal Upadhyaya",
  },

  // ----------------------------------------------------------
  // EAST COAST RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "ECOR",
    zoneName: "East Coast Railway",
    headquarters: "Bhubaneswar",
    divisionName: "Khurda Road",
    section: "Khurda Road",
  },
  {
    zoneCode: "ECOR",
    zoneName: "East Coast Railway",
    headquarters: "Bhubaneswar",
    divisionName: "Sambalpur",
    section: "Sambalpur",
  },
  {
    zoneCode: "ECOR",
    zoneName: "East Coast Railway",
    headquarters: "Bhubaneswar",
    divisionName: "Waltair",
    section: "Waltair",
  },

  // ----------------------------------------------------------
  // NORTHERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "NR",
    zoneName: "Northern Railway",
    headquarters: "New Delhi",
    divisionName: "Ambala",
    section: "Ambala",
  },
  {
    zoneCode: "NR",
    zoneName: "Northern Railway",
    headquarters: "New Delhi",
    divisionName: "Delhi",
    section: "Delhi",
  },
  {
    zoneCode: "NR",
    zoneName: "Northern Railway",
    headquarters: "New Delhi",
    divisionName: "Lucknow",
    section: "Lucknow",
  },
  {
    zoneCode: "NR",
    zoneName: "Northern Railway",
    headquarters: "New Delhi",
    divisionName: "Moradabad",
    section: "Moradabad",
  },
  {
    zoneCode: "NR",
    zoneName: "Northern Railway",
    headquarters: "New Delhi",
    divisionName: "Firozpur",
    section: "Firozpur",
  },

  // ----------------------------------------------------------
  // NORTH CENTRAL RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "NCR",
    zoneName: "North Central Railway",
    headquarters: "Prayagraj",
    divisionName: "Prayagraj",
    section: "Prayagraj",
  },
  {
    zoneCode: "NCR",
    zoneName: "North Central Railway",
    headquarters: "Prayagraj",
    divisionName: "Agra",
    section: "Agra",
  },
  {
    zoneCode: "NCR",
    zoneName: "North Central Railway",
    headquarters: "Prayagraj",
    divisionName: "Jhansi",
    section: "Jhansi",
  },

  // ----------------------------------------------------------
  // NORTH EASTERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "NER",
    zoneName: "North Eastern Railway",
    headquarters: "Gorakhpur",
    divisionName: "Lucknow",
    section: "Lucknow",
  },
  {
    zoneCode: "NER",
    zoneName: "North Eastern Railway",
    headquarters: "Gorakhpur",
    divisionName: "Izzatnagar",
    section: "Izzatnagar",
  },
  {
    zoneCode: "NER",
    zoneName: "North Eastern Railway",
    headquarters: "Gorakhpur",
    divisionName: "Varanasi",
    section: "Varanasi",
  },

  // ----------------------------------------------------------
  // NORTHEAST FRONTIER RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "NFR",
    zoneName: "Northeast Frontier Railway",
    headquarters: "Guwahati",
    divisionName: "Alipurduar",
    section: "Alipurduar",
  },
  {
    zoneCode: "NFR",
    zoneName: "Northeast Frontier Railway",
    headquarters: "Guwahati",
    divisionName: "Katihar",
    section: "Katihar",
  },
  {
    zoneCode: "NFR",
    zoneName: "Northeast Frontier Railway",
    headquarters: "Guwahati",
    divisionName: "Lumding",
    section: "Lumding",
  },
  {
    zoneCode: "NFR",
    zoneName: "Northeast Frontier Railway",
    headquarters: "Guwahati",
    divisionName: "Rangiya",
    section: "Rangiya",
  },
  {
    zoneCode: "NFR",
    zoneName: "Northeast Frontier Railway",
    headquarters: "Guwahati",
    divisionName: "Tinsukia",
    section: "Tinsukia",
  },

  // ----------------------------------------------------------
  // NORTH WESTERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "NWR",
    zoneName: "North Western Railway",
    headquarters: "Jaipur",
    divisionName: "Ajmer",
    section: "Ajmer",
  },
  {
    zoneCode: "NWR",
    zoneName: "North Western Railway",
    headquarters: "Jaipur",
    divisionName: "Bikaner",
    section: "Bikaner",
  },
  {
    zoneCode: "NWR",
    zoneName: "North Western Railway",
    headquarters: "Jaipur",
    divisionName: "Jaipur",
    section: "Jaipur",
  },
  {
    zoneCode: "NWR",
    zoneName: "North Western Railway",
    headquarters: "Jaipur",
    divisionName: "Jodhpur",
    section: "Jodhpur",
  },

  // ----------------------------------------------------------
  // SOUTHERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "SR",
    zoneName: "Southern Railway",
    headquarters: "Chennai",
    divisionName: "Chennai",
    section: "Chennai",
  },
  {
    zoneCode: "SR",
    zoneName: "Southern Railway",
    headquarters: "Chennai",
    divisionName: "Madurai",
    section: "Madurai",
  },
  {
    zoneCode: "SR",
    zoneName: "Southern Railway",
    headquarters: "Chennai",
    divisionName: "Palakkad",
    section: "Palakkad",
  },
  {
    zoneCode: "SR",
    zoneName: "Southern Railway",
    headquarters: "Chennai",
    divisionName: "Tiruchchirappalli",
    section: "Tiruchchirappalli",
  },
  {
    zoneCode: "SR",
    zoneName: "Southern Railway",
    headquarters: "Chennai",
    divisionName: "Thiruvananthapuram",
    section: "Thiruvananthapuram",
  },
  {
    zoneCode: "SR",
    zoneName: "Southern Railway",
    headquarters: "Chennai",
    divisionName: "Salem",
    section: "Salem",
  },

  // ----------------------------------------------------------
  // SOUTH CENTRAL RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "SCR",
    zoneName: "South Central Railway",
    headquarters: "Secunderabad",
    divisionName: "Guntakal",
    section: "Guntakal",
  },
  {
    zoneCode: "SCR",
    zoneName: "South Central Railway",
    headquarters: "Secunderabad",
    divisionName: "Guntur",
    section: "Guntur",
  },
  {
    zoneCode: "SCR",
    zoneName: "South Central Railway",
    headquarters: "Secunderabad",
    divisionName: "Hyderabad",
    section: "Hyderabad",
  },
  {
    zoneCode: "SCR",
    zoneName: "South Central Railway",
    headquarters: "Secunderabad",
    divisionName: "Nanded",
    section: "Nanded",
  },
  {
    zoneCode: "SCR",
    zoneName: "South Central Railway",
    headquarters: "Secunderabad",
    divisionName: "Secunderabad",
    section: "Secunderabad",
  },
  {
    zoneCode: "SCR",
    zoneName: "South Central Railway",
    headquarters: "Secunderabad",
    divisionName: "Vijayawada",
    section: "Vijayawada",
  },

  // ----------------------------------------------------------
  // SOUTH EASTERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "SER",
    zoneName: "South Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Adra",
    section: "Adra",
  },
  {
    zoneCode: "SER",
    zoneName: "South Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Chakradharpur",
    section: "Chakradharpur",
  },
  {
    zoneCode: "SER",
    zoneName: "South Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Kharagpur",
    section: "Kharagpur",
  },
  {
    zoneCode: "SER",
    zoneName: "South Eastern Railway",
    headquarters: "Kolkata",
    divisionName: "Ranchi",
    section: "Ranchi",
  },

  // ----------------------------------------------------------
  // SOUTH EAST CENTRAL RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "SECR",
    zoneName: "South East Central Railway",
    headquarters: "Bilaspur",
    divisionName: "Raipur",
    section: "Raipur",
  },
  {
    zoneCode: "SECR",
    zoneName: "South East Central Railway",
    headquarters: "Bilaspur",
    divisionName: "Nagpur",
    section: "Nagpur",
  },
  {
    zoneCode: "SECR",
    zoneName: "South East Central Railway",
    headquarters: "Bilaspur",
    divisionName: "Bilaspur",
    section: "Bilaspur",
  },

  // ----------------------------------------------------------
  // SOUTH WESTERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "SWR",
    zoneName: "South Western Railway",
    headquarters: "Hubballi",
    divisionName: "Bengaluru",
    section: "Bengaluru",
  },
  {
    zoneCode: "SWR",
    zoneName: "South Western Railway",
    headquarters: "Hubballi",
    divisionName: "Hubballi",
    section: "Hubballi",
  },
  {
    zoneCode: "SWR",
    zoneName: "South Western Railway",
    headquarters: "Hubballi",
    divisionName: "Mysuru",
    section: "Mysuru",
  },

  // ----------------------------------------------------------
  // WESTERN RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "WR",
    zoneName: "Western Railway",
    headquarters: "Mumbai",
    divisionName: "Mumbai Central",
    section: "Mumbai Central",
  },
  {
    zoneCode: "WR",
    zoneName: "Western Railway",
    headquarters: "Mumbai",
    divisionName: "Vadodara",
    section: "Vadodara",
  },
  {
    zoneCode: "WR",
    zoneName: "Western Railway",
    headquarters: "Mumbai",
    divisionName: "Ratlam",
    section: "Ratlam",
  },
  {
    zoneCode: "WR",
    zoneName: "Western Railway",
    headquarters: "Mumbai",
    divisionName: "Ahmedabad",
    section: "Ahmedabad",
  },
  {
    zoneCode: "WR",
    zoneName: "Western Railway",
    headquarters: "Mumbai",
    divisionName: "Rajkot",
    section: "Rajkot",
  },
  {
    zoneCode: "WR",
    zoneName: "Western Railway",
    headquarters: "Mumbai",
    divisionName: "Bhavnagar",
    section: "Bhavnagar",
  },

  // ----------------------------------------------------------
  // WEST CENTRAL RAILWAY
  // ----------------------------------------------------------

  {
    zoneCode: "WCR",
    zoneName: "West Central Railway",
    headquarters: "Jabalpur",
    divisionName: "Bhopal",
    section: "Bhopal",
  },
  {
    zoneCode: "WCR",
    zoneName: "West Central Railway",
    headquarters: "Jabalpur",
    divisionName: "Jabalpur",
    section: "Jabalpur",
  },
  {
    zoneCode: "WCR",
    zoneName: "West Central Railway",
    headquarters: "Jabalpur",
    divisionName: "Kota",
    section: "Kota",
  },

  // ----------------------------------------------------------
  // METRO RAILWAY KOLKATA
  // ----------------------------------------------------------

  {
    zoneCode: "METRO",
    zoneName: "Metro Railway, Kolkata",
    headquarters: "Kolkata",
    divisionName: null,
    section: "N/A",
  },
];


// ============================================================
// 6. PDF-DERIVED ASSET REGISTRY
// ============================================================
//
// Each location receives the Asset Types explicitly represented
// in the PDF.
//
// This does NOT claim that every installation physically exists
// at a verified installation level.
//
// verificationStatus is deliberately retained.
// ============================================================

export const PDF_AXLE_COUNTER_ASSETS =
  PDF_AXLE_COUNTER_LOCATIONS.flatMap((location) =>
    RAILWAY_ASSET_TYPES.map((assetType) => ({
      id: [
        assetType.id,
        location.zoneCode,
        location.divisionName || "NA",
        location.section,
      ]
        .join("-")
        .replace(/[^A-Za-z0-9-]/g, "-")
        .toUpperCase(),

      assetTypeCode: assetType.id,
      assetType: assetType.name,
      assetDescription: assetType.description,

      department: assetType.department,
      category: assetType.category,

      railwayZone: location.zoneName,
      zoneCode: location.zoneCode,

      headquarters: location.headquarters,

      division: location.divisionName,
      stationOrBlockSection: location.section,

      manufacturer: null,
      model: null,
      quantity: null,
      installationYear: null,

      status: "VERIFICATION_REQUIRED",

      source: "PDF_DATASET",
      verificationStatus:
        "Not yet verified at installation level",

      remarks:
        "Location and asset type derived from the supplied railway asset dataset. Installation-level verification required.",

      isPdfDerived: true,
    }))
  );


// ============================================================
// 7. EXISTING PROTOTYPE STATIONS
// ============================================================

export const STATIONS = [
  {
    id: "STN-CBE",
    code: "CBE",
    name: "Coimbatore Junction",
    aliases: ["Coimbatore", "CBE Jn", "Coimbatore Jn"],
    zoneId: "SR",
    divisionId: "DIV-SA",
    platforms: 6,
    tracks: 10,
    assetsCount: 420,
    availability: 94.2,
    activeMaintenance: 2,
    alertsCount: 3,
    state: "Tamil Nadu",
    latitude: 10.9974912,
    longitude: 76.9664837,
    lat: 10.9974912,
    lng: 76.9664837,
    lon: 76.9664837,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=10.9974912,76.9664837",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=10.9974912,76.9664837",
    coordinates: {
      lat: 10.9974912,
      lng: 76.9664837,
    },
  },

  {
    id: "STN-MAS",
    code: "MAS",
    name:
      "Puratchi Thalaivar Dr. M.G. Ramachandran Central (Chennai Central)",
    aliases: ["Chennai Central", "Chennai", "MAS Jn"],
    zoneId: "SR",
    divisionId: "DIV-MAS",
    platforms: 12,
    tracks: 18,
    assetsCount: 890,
    availability: 96.1,
    activeMaintenance: 1,
    alertsCount: 1,
    state: "Tamil Nadu",
    latitude: 13.0865965,
    longitude: 80.2745107,
    lat: 13.0865965,
    lng: 80.2745107,
    lon: 80.2745107,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=13.0865965,80.2745107",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=13.0865965,80.2745107",
    coordinates: {
      lat: 13.0865965,
      lng: 80.2745107,
    },
  },

  {
    id: "STN-ED",
    code: "ED",
    name: "Erode Junction",
    aliases: ["Erode", "Erode Jn"],
    zoneId: "SR",
    divisionId: "DIV-SA",
    platforms: 5,
    tracks: 9,
    assetsCount: 380,
    availability: 95.8,
    activeMaintenance: 1,
    alertsCount: 2,
    state: "Tamil Nadu",
    latitude: 11.3286258,
    longitude: 77.7257896,
    lat: 11.3286258,
    lng: 77.7257896,
    lon: 77.7257896,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=11.3286258,77.7257896",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=11.3286258,77.7257896",
    coordinates: {
      lat: 11.3286258,
      lng: 77.7257896,
    },
  },

  {
    id: "STN-SA",
    code: "SA",
    name: "Salem Junction",
    aliases: ["Salem", "Salem Jn"],
    zoneId: "SR",
    divisionId: "DIV-SA",
    platforms: 6,
    tracks: 10,
    assetsCount: 410,
    availability: 96.5,
    activeMaintenance: 0,
    alertsCount: 1,
    state: "Tamil Nadu",
    latitude: 11.6707553,
    longitude: 78.1135427,
    lat: 11.6707553,
    lng: 78.1135427,
    lon: 78.1135427,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=11.6707553,78.1135427",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=11.6707553,78.1135427",
    coordinates: {
      lat: 11.6707553,
      lng: 78.1135427,
    },
  },

  {
    id: "STN-MDU",
    code: "MDU",
    name: "Madurai Junction",
    aliases: ["Madurai", "Madurai Jn"],
    zoneId: "SR",
    divisionId: "DIV-MDU",
    platforms: 8,
    tracks: 12,
    assetsCount: 460,
    availability: 95.1,
    activeMaintenance: 1,
    alertsCount: 1,
    state: "Tamil Nadu",
    latitude: 9.9195505,
    longitude: 78.1102197,
    lat: 9.9195505,
    lng: 78.1102197,
    lon: 78.1102197,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=9.9195505,78.1102197",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=9.9195505,78.1102197",
    coordinates: {
      lat: 9.9195505,
      lng: 78.1102197,
    },
  },

  {
    id: "STN-SBC",
    code: "SBC",
    name: "KSR Bengaluru City Junction",
    aliases: ["Bengaluru", "Bangalore", "Bengaluru City"],
    zoneId: "SWR",
    divisionId: "DIV-SBC",
    platforms: 10,
    tracks: 14,
    assetsCount: 650,
    availability: 95,
    activeMaintenance: 1,
    alertsCount: 2,
    state: "Karnataka",
    coordinates: {
      lat: 12.9784,
      lng: 77.5684,
    },
  },

  {
    id: "STN-CSMT",
    code: "CSMT",
    name:
      "Chhatrapati Shivaji Maharaj Terminus (Mumbai)",
    aliases: ["Mumbai CSMT", "CSMT", "Mumbai"],
    zoneId: "CR",
    divisionId: "DIV-BB",
    platforms: 18,
    tracks: 24,
    assetsCount: 1250,
    availability: 93.9,
    activeMaintenance: 3,
    alertsCount: 4,
    state: "Maharashtra",
    coordinates: {
      lat: 18.9402,
      lng: 72.8354,
    },
  },

  {
    id: "STN-NDLS",
    code: "NDLS",
    name: "New Delhi Railway Station",
    aliases: ["New Delhi", "Delhi", "NDLS"],
    zoneId: "NR",
    divisionId: "DIV-DLI",
    platforms: 16,
    tracks: 22,
    assetsCount: 1410,
    availability: 92.4,
    activeMaintenance: 4,
    alertsCount: 5,
    state: "Delhi",
    coordinates: {
      lat: 28.6431,
      lng: 77.2197,
    },
  },

  {
    id: "STN-HWH",
    code: "HWH",
    name: "Howrah Junction (Kolkata)",
    aliases: ["Howrah", "Howrah Jn", "Kolkata Howrah"],
    zoneId: "ER",
    divisionId: "DIV-HWH",
    platforms: 23,
    tracks: 28,
    assetsCount: 1680,
    availability: 94.3,
    activeMaintenance: 2,
    alertsCount: 3,
    state: "West Bengal",
    coordinates: {
      lat: 22.5839,
      lng: 88.3426,
    },
  },

  {
    id: "STN-SC",
    code: "SC",
    name: "Secunderabad Junction",
    aliases: ["Secunderabad", "SC Jn"],
    zoneId: "SCR",
    divisionId: "DIV-SC",
    platforms: 10,
    tracks: 14,
    assetsCount: 720,
    availability: 95.7,
    activeMaintenance: 1,
    alertsCount: 2,
    state: "Telangana",
    coordinates: {
      lat: 17.4338,
      lng: 78.5016,
    },
  },

  {
    id: "STN-ADI",
    code: "ADI",
    name: "Ahmedabad Junction",
    aliases: ["Ahmedabad", "ADI Jn"],
    zoneId: "WR",
    divisionId: "DIV-ADI",
    platforms: 12,
    tracks: 16,
    assetsCount: 810,
    availability: 96,
    activeMaintenance: 1,
    alertsCount: 1,
    state: "Gujarat",
    coordinates: {
      lat: 23.0225,
      lng: 72.5714,
    },
  },
];


// ============================================================
// 8. EXISTING PROTOTYPE ASSETS
// ============================================================

export const STATION_ASSETS = [
  {
    id: "TRK-CBE-P4-S12",
    stationId: "STN-CBE",
    stationCode: "CBE",
    name: "High-Speed Turnout Switch #102B",
    aliases: ["Turnout 102B", "Switch 102B", "Point 102B"],
    dept: "TRACK",
    type: "Points & Crossings",
    condition: "Critical Fault Risk",
    healthPct: 58,
    lastMaintenance: "2026-08-10",
    nextMaintenance: "Overdue by 3 days",
    status: "CRITICAL",
    aiPriorityScore: 94,
    pos: {
      x: 38,
      y: 46,
    },
  },

  {
    id: "SIG-CBE-S104",
    stationId: "STN-CBE",
    stationCode: "CBE",
    name: "Multi-Aspect LED Color Light Signal S-104",
    aliases: ["Signal S-104", "LED Signal S104", "S104"],
    dept: "S&T",
    type: "Signalling Gantry",
    condition: "Upcoming Maintenance Required",
    healthPct: 76,
    lastMaintenance: "2026-07-28",
    nextMaintenance: "Due in 2 days",
    status: "UPCOMING",
    aiPriorityScore: 82,
    pos: {
      x: 55,
      y: 38,
    },
  },

  {
    id: "TRD-CBE-OHE-P4",
    stationId: "STN-CBE",
    stationCode: "CBE",
    name: "OHE Catenary Wire Portal #412/18 (25kV AC)",
    aliases: ["OHE Portal 412/18", "Catenary 412/18"],
    dept: "TRD",
    type: "Traction Distribution OHE",
    condition: "Pending Contact Wire Wear Measurement",
    healthPct: 72,
    lastMaintenance: "2026-07-15",
    nextMaintenance: "Due in 4 days",
    status: "UPCOMING",
    aiPriorityScore: 80,
    pos: {
      x: 42,
      y: 44,
    },
  },

  {
    id: "AXL-CBE-DAC-09",
    stationId: "STN-CBE",
    stationCode: "CBE",
    name: "Digital Axle Counter Sensor DAC-09 (Track 4 Loop)",
    aliases: ["DAC-09", "Axle Counter DAC09"],
    dept: "S&T",
    type: "Train Detection",
    condition: "Normal Operational",
    healthPct: 96,
    lastMaintenance: "2026-08-25",
    nextMaintenance: "Due in 30 days",
    status: "HEALTHY",
    aiPriorityScore: 30,
    pos: {
      x: 62,
      y: 52,
    },
  },

  {
    id: "TRK-CBE-USFD-03",
    stationId: "STN-CBE",
    stationCode: "CBE",
    name: "Rail Weld Joint #44B (Ultrasonic Inspection Node)",
    aliases: ["Weld Joint 44B", "USFD 44B", "Rail Weld 44B"],
    dept: "TRACK",
    type: "Track Structure",
    condition:
      "Micro-fissure detected during USFD testing",
    healthPct: 62,
    lastMaintenance: "2026-08-01",
    nextMaintenance: "Urgent block required",
    status: "CRITICAL",
    aiPriorityScore: 91,
    pos: {
      x: 28,
      y: 48,
    },
  },

  {
    id: "TRD-CBE-ISO-12",
    stationId: "STN-CBE",
    stationCode: "CBE",
    name: "25kV Isolator Switch IS-102 (Track 6 Yard Isolation)",
    aliases: ["IS-102", "25kV Isolator IS102"],
    dept: "TRD",
    type: "Substation Switchgear",
    condition: "Under Active Maintenance Block",
    healthPct: 88,
    lastMaintenance: "2026-09-03",
    nextMaintenance: "In Progress",
    status: "ACTIVE_BLOCK",
    aiPriorityScore: 75,
    pos: {
      x: 70,
      y: 64,
    },
  },

  {
    id: "TRK-MAS-P1-09",
    stationId: "STN-MAS",
    stationCode: "MAS",
    name: "Deep Screening Ballast Section Track 1",
    aliases: ["Track 1 Ballast Section"],
    dept: "TRACK",
    type: "Track Structure",
    condition: "Ballast degradation",
    healthPct: 68,
    lastMaintenance: "2026-07-22",
    nextMaintenance: "Maintenance Required",
    status: "UPCOMING",
    aiPriorityScore: 84,
    pos: {
      x: 35,
      y: 45,
    },
  },

  {
    id: "SIG-MAS-201",
    stationId: "STN-MAS",
    stationCode: "MAS",
    name: "Electronic Interlocking Signal Unit MAS-201",
    aliases: ["Signal MAS201"],
    dept: "S&T",
    type: "Electronic Interlocking",
    condition: "Normal Operational",
    healthPct: 91,
    lastMaintenance: "2026-08-15",
    nextMaintenance: "Due in 45 days",
    status: "HEALTHY",
    aiPriorityScore: 35,
    pos: {
      x: 54,
      y: 42,
    },
  },

  {
    id: "TRD-MAS-OHE-21",
    stationId: "STN-MAS",
    stationCode: "MAS",
    name: "25kV OHE Mast Assembly MAS-21",
    aliases: ["OHE Mast MAS21"],
    dept: "TRD",
    type: "Traction Distribution OHE",
    condition: "Routine Inspection Due",
    healthPct: 82,
    lastMaintenance: "2026-07-30",
    nextMaintenance: "Due in 12 days",
    status: "UPCOMING",
    aiPriorityScore: 62,
    pos: {
      x: 65,
      y: 58,
    },
  },
];


// ============================================================
// 9. MASTER ASSET DATASET
// ============================================================
//
// Combines prototype assets + PDF-derived assets.
//
// IMPORTANT:
// PDF assets stay explicitly marked as PDF-derived and
// verification-required instead of pretending they are
// installation-confirmed.
// ============================================================

export const ASSET_MASTER = [
  ...STATION_ASSETS.map((asset) => {
    const station = STATIONS.find(
      (s) =>
        s.id === asset.stationId ||
        s.code === asset.stationCode
    );

    const division = station
      ? DIVISIONS.find(
        (d) => d.id === station.divisionId
      )
      : null;

    const zone = division
      ? RAILWAY_ZONES.find(
        (z) => z.id === division.zoneId
      )
      : null;

    return {
      ...asset,

      source: "PROTOTYPE_DATA",

      railwayZone:
        zone?.name || null,

      zoneCode:
        zone?.code || null,

      headquarters:
        zone?.hq || null,

      division:
        division?.name || null,

      divisionCode:
        division?.code || null,

      stationOrBlockSection:
        station?.name || asset.stationCode || null,

      assetType:
        asset.type || null,

      verificationStatus:
        "Prototype / Demo Asset",
    };
  }),

  ...PDF_AXLE_COUNTER_ASSETS,
];


// ============================================================
// 10. SIMPLE LOOKUP HELPERS
// ============================================================

export const normalizeRailwayText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();


// ------------------------------------------------------------
// Find Zone
// ------------------------------------------------------------

export const findZone = (value = "") => {
  const input = normalizeRailwayText(value);

  if (!input) return null;

  return (
    RAILWAY_ZONES.find(
      (z) =>
        normalizeRailwayText(z.code) === input ||
        normalizeRailwayText(z.name) === input
    ) || null
  );
};


// ------------------------------------------------------------
// Find Division
// ------------------------------------------------------------

export const findDivision = (
  divisionName = "",
  zoneCode = ""
) => {
  const input = normalizeRailwayText(divisionName);

  if (!input) return null;

  const matching = DIVISIONS.filter(
    (division) =>
      !zoneCode ||
      division.zoneId === zoneCode
  );

  return (
    matching.find(
      (division) =>
        normalizeRailwayText(
          division.name
        ) === input
    ) ||

    matching.find(
      (division) =>
        normalizeRailwayText(
          division.code
        ) === input
    ) ||

    matching.find((division) => {
      const value = normalizeRailwayText(
        division.name
      );

      return (
        value.includes(input) ||
        input.includes(value)
      );
    }) ||

    null
  );
};


// ------------------------------------------------------------
// Find PDF asset type
// ------------------------------------------------------------

export const findAssetType = (value = "") => {
  const input = normalizeRailwayText(value);

  if (!input) return null;

  return (
    RAILWAY_ASSET_TYPES.find(
      (type) =>
        normalizeRailwayText(type.id) ===
        input ||
        normalizeRailwayText(type.name) ===
        input ||
        normalizeRailwayText(
          type.description
        ) === input
    ) || null
  );
};


// ------------------------------------------------------------
// Find station
// ------------------------------------------------------------

export const findStation = (value = "") => {
  const input = normalizeRailwayText(value);

  if (!input) return null;

  return (
    STATIONS.find(
      (station) =>
        normalizeRailwayText(
          station.code
        ) === input
    ) ||

    STATIONS.find(
      (station) =>
        normalizeRailwayText(
          station.name
        ) === input
    ) ||

    STATIONS.find((station) =>
      (station.aliases || []).some(
        (alias) =>
          normalizeRailwayText(
            alias
          ) === input
      )
    ) ||

    STATIONS.find((station) => {
      const stationName =
        normalizeRailwayText(
          station.name
        );

      return (
        stationName.includes(input) ||
        input.includes(stationName)
      );
    }) ||

    null
  );
};


// ============================================================
// 11. FIND PDF AXLE COUNTER LOCATION
// ============================================================

export const findPdfAssetLocations = ({
  zone = "",
  division = "",
  section = "",
  assetType = "",
} = {}) => {
  const normalizedZone =
    normalizeRailwayText(zone);

  const normalizedDivision =
    normalizeRailwayText(division);

  const normalizedSection =
    normalizeRailwayText(section);

  const normalizedAssetType =
    normalizeRailwayText(assetType);

  return PDF_AXLE_COUNTER_ASSETS.filter(
    (asset) => {
      const zoneMatch =
        !normalizedZone ||
        normalizeRailwayText(
          asset.zoneCode
        ) === normalizedZone ||
        normalizeRailwayText(
          asset.railwayZone
        ) === normalizedZone;

      const divisionMatch =
        !normalizedDivision ||
        normalizeRailwayText(
          asset.division
        ) === normalizedDivision;

      const sectionMatch =
        !normalizedSection ||
        normalizeRailwayText(
          asset.stationOrBlockSection
        ) === normalizedSection;

      const assetTypeMatch =
        !normalizedAssetType ||
        normalizeRailwayText(
          asset.assetTypeCode
        ) === normalizedAssetType ||
        normalizeRailwayText(
          asset.assetType
        ) === normalizedAssetType;

      return (
        zoneMatch &&
        divisionMatch &&
        sectionMatch &&
        assetTypeMatch
      );
    }
  );
};


// ============================================================
// 12. COMPLETE ASSET CONTEXT
// ============================================================

export const getAssetContext = ({
  assetId = "",
  assetName = "",
  assetType = "",
  zone = "",
  division = "",
  stationOrSection = "",
} = {}) => {
  let asset = null;

  if (assetId) {
    asset =
      ASSET_MASTER.find(
        (item) =>
          normalizeRailwayText(
            item.id
          ) === normalizeRailwayText(
            assetId
          )
      ) || null;
  }

  if (!asset && assetName) {
    const normalized =
      normalizeRailwayText(assetName);

    asset =
      ASSET_MASTER.find(
        (item) =>
          normalizeRailwayText(
            item.name || item.assetType
          ) === normalized
      ) ||
      ASSET_MASTER.find((item) =>
        normalizeRailwayText(
          item.name || item.assetType
        ).includes(normalized)
      ) ||
      null;
  }

  if (!asset && assetType) {
    const candidates =
      findPdfAssetLocations({
        zone,
        division,
        section: stationOrSection,
        assetType,
      });

    asset = candidates[0] || null;
  }

  const resolvedZone =
    findZone(
      asset?.zoneCode ||
      zone
    );

  const resolvedDivision =
    findDivision(
      asset?.division ||
      division,
      resolvedZone?.code
    );

  const resolvedStation =
    findStation(
      asset?.stationCode ||
      stationOrSection
    );

  return {
    asset,

    zone: resolvedZone,

    division: resolvedDivision,

    station: resolvedStation,

    matched: {
      asset: Boolean(asset),
      zone: Boolean(resolvedZone),
      division: Boolean(resolvedDivision),
      station: Boolean(resolvedStation),
    },

    verificationStatus:
      asset?.verificationStatus ||
      "Location verification required",
  };
};


// ============================================================
// 13. ASSET FILTER HELPERS
// ============================================================

export const getAssetsByType = (
  assetType
) => {
  const normalized =
    normalizeRailwayText(assetType);

  return ASSET_MASTER.filter(
    (asset) =>
      normalizeRailwayText(
        asset.assetTypeCode ||
        asset.assetType ||
        asset.type
      ) === normalized ||
      normalizeRailwayText(
        asset.assetType ||
        asset.type
      ) === normalized
  );
};


export const getAssetsByDepartment = (
  department
) => {
  if (
    !department ||
    department === "ALL"
  ) {
    return ASSET_MASTER;
  }

  return ASSET_MASTER.filter(
    (asset) =>
      asset.department === department ||
      asset.dept === department
  );
};


export const getAssetsByZone = (
  zoneCode
) => {
  return ASSET_MASTER.filter(
    (asset) =>
      asset.zoneCode === zoneCode
  );
};


export const getAssetsByDivision = (
  divisionName
) => {
  const normalized =
    normalizeRailwayText(
      divisionName
    );

  return ASSET_MASTER.filter(
    (asset) =>
      normalizeRailwayText(
        asset.division
      ) === normalized
  );
};


// ============================================================
// 14. AI / ML FEATURE RECORD
// ============================================================
//
// This creates structured tabular data later usable by
// Python / TensorFlow / ML training.
//
// No fake training is performed here.
// ============================================================

export const buildAssetFeatureRecord = (
  asset
) => ({
  assetId:
    asset.id || null,

  assetType:
    asset.assetTypeCode ||
    asset.assetType ||
    asset.type ||
    null,

  assetDescription:
    asset.assetDescription ||
    null,

  department:
    asset.department ||
    asset.dept ||
    null,

  zone:
    asset.zoneCode ||
    null,

  zoneName:
    asset.railwayZone ||
    null,

  headquarters:
    asset.headquarters ||
    null,

  division:
    asset.division ||
    null,

  stationOrBlockSection:
    asset.stationOrBlockSection ||
    asset.stationCode ||
    null,

  healthPct:
    typeof asset.healthPct ===
      "number"
      ? asset.healthPct
      : null,

  aiPriorityScore:
    typeof asset.aiPriorityScore ===
      "number"
      ? asset.aiPriorityScore
      : null,

  condition:
    asset.condition ||
    null,

  status:
    asset.status ||
    null,

  verificationStatus:
    asset.verificationStatus ||
    null,

  source:
    asset.source ||
    null,
});


// ============================================================
// 15. AI READY ASSET DATASET
// ============================================================

export const AI_READY_ASSET_DATASET =
  ASSET_MASTER.map(
    buildAssetFeatureRecord
  );


// ============================================================
// 16. MAINTENANCE REQUESTS
// ============================================================

export const MAINTENANCE_REQUESTS = [
  {
    id: "REQ-2026-0891",
    dept: "TRACK",
    assetId: "TRK-CBE-P4-S12",
    assetName:
      "High-Speed Turnout Switch #102B",
    stationCode: "CBE",
    stationName:
      "Coimbatore Junction",
    division: "Salem (SA)",
    zone: "Southern Railway (SR)",
    problem:
      "Ultrasonic flaw detected in tongue rail weld & sleeper plate loose bolts",
    safetyCriticality: "CRITICAL",
    urgency: "HIGH",
    assetCriticality:
      "HIGH (Mainline Passenger Track)",
    durationMins: 75,
    resourcesRequired:
      "Track Tamping Machine (CSM), 12 P-Way Labor, USFD Rig",
    trainImpact:
      "Moderate",
    requestedWindow:
      "02:00 AM - 04:00 AM",
    status: "PENDING_AI",
    requestDate: "2026-09-03",
  },

  {
    id: "REQ-2026-0892",
    dept: "S&T",
    assetId: "SIG-CBE-S104",
    assetName:
      "Multi-Aspect LED Signal S-104",
    stationCode: "CBE",
    stationName:
      "Coimbatore Junction",
    division: "Salem (SA)",
    zone: "Southern Railway (SR)",
    problem:
      "Point Machine #102B circuit cable insulation degradation & signal aspect check",
    safetyCriticality: "HIGH",
    urgency: "MEDIUM",
    assetCriticality: "HIGH",
    durationMins: 45,
    resourcesRequired:
      "S&T Tower Inspection Van, 4 Cable Techs, Multimeter Rig",
    trainImpact: "Low",
    requestedWindow:
      "02:15 AM - 03:30 AM",
    status: "PENDING_AI",
    requestDate: "2026-09-03",
  },

  {
    id: "REQ-2026-0893",
    dept: "TRD",
    assetId: "TRD-CBE-OHE-P4",
    assetName:
      "OHE Catenary Wire Portal #412/18",
    stationCode: "CBE",
    stationName:
      "Coimbatore Junction",
    division: "Salem (SA)",
    zone: "Southern Railway (SR)",
    problem:
      "OHE Contact wire stagger adjustment & insulator washing over Track 4",
    safetyCriticality: "HIGH",
    urgency: "MEDIUM",
    assetCriticality: "MEDIUM",
    durationMins: 60,
    resourcesRequired:
      "8-Wheeler OHE Tower Wagon, 6 Electric Linemen, Power Block Rig",
    trainImpact: "Low",
    requestedWindow:
      "02:30 AM - 04:00 AM",
    status: "PENDING_AI",
    requestDate: "2026-09-03",
  },
];


// ============================================================
// 17. CORRIDORS
// ============================================================

export const CORRIDORS = [
  {
    id: "COR-MAS-CBE",
    name:
      "Chennai Central ── Coimbatore Main Trunk Corridor",
    divisionId: "DIV-MAS",
    zoneId: "SR",
    lengthKm: 494,
    tracks: 2,
    dailyTrains: 114,
    stations: [
      {
        code: "MAS",
        name: "Chennai Central",
        distKm: 0,
      },
      {
        code: "AJJ",
        name: "Arakkonam Junction",
        distKm: 69,
      },
      {
        code: "KPD",
        name: "Katpadi Junction",
        distKm: 130,
      },
      {
        code: "JTJ",
        name: "Jolarpettai Junction",
        distKm: 214,
      },
      {
        code: "SA",
        name: "Salem Junction",
        distKm: 334,
      },
      {
        code: "ED",
        name: "Erode Junction",
        distKm: 394,
      },
      {
        code: "CBE",
        name: "Coimbatore Junction",
        distKm: 494,
      },
    ],
    activeBlocks: 2,
    aiRecommendationAvailable: true,
  },

  {
    id: "COR-NDLS-BPL",
    name:
      "New Delhi ── Bhopal Superfast Trunk Line",
    divisionId: "DIV-DLI",
    zoneId: "NR",
    lengthKm: 701,
    tracks: 3,
    dailyTrains: 186,
    stations: [
      {
        code: "NDLS",
        name: "New Delhi",
        distKm: 0,
      },
      {
        code: "MTJ",
        name: "Mathura Junction",
        distKm: 141,
      },
      {
        code: "AGC",
        name: "Agra Cantt",
        distKm: 195,
      },
      {
        code: "GWL",
        name: "Gwalior Junction",
        distKm: 313,
      },
      {
        code: "VGLJ",
        name: "VGL Jhansi Junction",
        distKm: 410,
      },
      {
        code: "BPL",
        name: "Bhopal Junction",
        distKm: 701,
      },
    ],
    activeBlocks: 3,
    aiRecommendationAvailable: true,
  },
];


// ============================================================
// 18. AI BLOCK PLANNER RESULT
// ============================================================

export const AI_BLOCK_PLANNER_RESULT = {
  planId: "BLOCK-CBE-2026-017",
  stationCode: "CBE",
  stationName: "Coimbatore Junction",
  date: "2026-09-04",
  windowStart: "02:30 AM",
  windowEnd: "03:45 AM",
  totalDurationMins: 75,

  aiConfidenceScore: 94.6,
  expectedDelayRiskPct: 7.2,
  assetAvailabilityGainPct: 8.4,

  combinedJobsCount: 5,

  departmentsCombined: [
    "TRACK",
    "S&T",
    "TRD",
  ],

  combinedJobs: [
    {
      id: "J1",
      dept: "TRACK",
      assetId: "TRK-CBE-P4-S12",
      task:
        "Ultrasonic weld repair & sleeper fastening on Turnout #102B",
      estMins: 75,
    },

    {
      id: "J2",
      dept: "S&T",
      assetId: "SIG-CBE-S104",
      task:
        "Point machine #102B locking test & cable insulation check",
      estMins: 35,
    },

    {
      id: "J3",
      dept: "TRD",
      assetId: "TRD-CBE-OHE-P4",
      task:
        "OHE catenary wire stagger correction & insulator wash",
      estMins: 50,
    },

    {
      id: "J4",
      dept: "S&T",
      assetId: "AXL-CBE-DAC-09",
      task:
        "Digital Axle Counter DAC-09 wheel sensor recalibration",
      estMins: 20,
    },

    {
      id: "J5",
      dept: "TRACK",
      assetId: "TRK-CBE-USFD-03",
      task:
        "Joint bolt tightening & track gauge checking",
      estMins: 30,
    },
  ],

  reasoningSummary: [
    {
      title: "Safety Priority Alignment",
      score: "100%",
      detail:
        "Critical maintenance activities are prioritized first.",
    },

    {
      title: "Cross-Department Combination",
      score: "HIGH",
      detail:
        "Track, S&T and TRD activities are evaluated for common block compatibility.",
    },

    {
      title: "Train Timetable Window",
      score: "OPTIMAL",
      detail:
        "Low-conflict maintenance window selected from available operational information.",
    },

    {
      title: "Resource Synergy",
      score: "92%",
      detail:
        "Shared setup and coordinated isolation can reduce duplicated effort.",
    },
  ],

  beforeVsAfter: {
    beforeAI: {
      separateWindows: 3,
      totalClosureMins: 180,
      passengerTrainDelaysMins: 42,
      manpowerHours: 72,
      assetAvailabilityImpact: "+2.1%",
    },

    afterAI: {
      separateWindows: 1,
      totalClosureMins: 75,
      passengerTrainDelaysMins: 0,
      manpowerHours: 34,
      assetAvailabilityImpact: "+8.4%",
    },
  },
};


// ============================================================
// 19. DIGITAL TWIN SIMULATION
// ============================================================

export const DIGITAL_TWIN_SIMULATION = {
  corridor:
    "Chennai Central ── Coimbatore Junction (Down Main Line)",

  simulationTimeFrame:
    "01:30 AM to 05:00 AM",

  activeTrainsInSim: [
    {
      id: "T-12675",
      name:
        "Cheran Superfast Express (12675)",
      speedKmH: 110,
      status: "CLEAR",
      posPct: 15,
    },

    {
      id: "T-20643",
      name:
        "Vande Bharat Express (20643)",
      speedKmH: 130,
      status: "CLEAR",
      posPct: 45,
    },

    {
      id: "T-FGT-5602",
      name:
        "BOXN Coal Freight (5602)",
      speedKmH: 65,
      status: "REGULATED",
      posPct: 82,
    },
  ],

  scenarios: {
    currentUnoptimized: {
      delayRiskPct: 28.4,
      cumulativeDelayMins: 46,
      throughputPct: 74,
      conflictPoints: 2,

      conflicts: [
        {
          location: "Erode Yard",
          train: "Cheran Express",
          description:
            "Signal hold due to uncoordinated Track block",
        },

        {
          location:
            "Coimbatore Outer",
          train: "Freight 5602",
          description:
            "Delay waiting for TRD OHE power clearance",
        },
      ],
    },

    aiOptimized: {
      delayRiskPct: 4.1,
      cumulativeDelayMins: 0,
      throughputPct: 98,
      conflictPoints: 0,
      conflicts: [],
    },
  },
};


// ============================================================
// 20. GANTT TIMELINE
// ============================================================

export const GANTT_TIMELINE_SCHEDULE = {
  hours: [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
  ],

  rows: [
    {
      label:
        "Train 12675 (Cheran Exp)",
      type: "TRAIN",
      blocks: [
        {
          start: 0.5,
          end: 1.75,
          title:
            "12675 Cheran Express (MAS -> CBE)",
          status: "RUNNING",
          color: "#12345A",
        },
      ],
    },

    {
      label:
        "Train 20643 (Vande Bharat)",
      type: "TRAIN",
      blocks: [
        {
          start: 1.0,
          end: 2.2,
          title:
            "20643 Vande Bharat Express",
          status: "RUNNING",
          color: "#0B1F3A",
        },
      ],
    },

    {
      label: "Train Freight 5602",
      type: "TRAIN",
      blocks: [
        {
          start: 3.8,
          end: 5.5,
          title:
            "Freight 5602 Coal Rake",
          status: "SCHEDULED",
          color: "#12345A",
        },
      ],
    },

    {
      label: "Track Maintenance",
      type: "MAINTENANCE",
      blocks: [
        {
          start: 2.5,
          end: 3.75,
          title:
            "BLOCK B-017: Track Switch #102B Weld Repair",
          status: "AI_RECOMMENDED",
          color: "#1D4ED8",
        },
      ],
    },

    {
      label: "S&T Signalling",
      type: "MAINTENANCE",
      blocks: [
        {
          start: 2.5,
          end: 3.2,
          title:
            "BLOCK B-017: Point Machine & Cable Testing",
          status: "COMBINED_WITH_TRACK",
          color: "#0B1F3A",
        },
      ],
    },

    {
      label:
        "TRD OHE Electrical",
      type: "MAINTENANCE",
      blocks: [
        {
          start: 2.5,
          end: 3.5,
          title:
            "BLOCK B-017: 25kV Power Isolation & Catenary Stagger",
          status: "COMBINED_WITH_TRACK",
          color: "#12345A",
        },
      ],
    },
  ],
};


// ============================================================
// 21. APPROVAL WORKFLOW
// ============================================================

export const APPROVAL_WORKFLOW_DATA = {
  planId:
    "BLOCK-CBE-2026-017",

  currentStage:
    "STAGE_2_DOM_REVIEW",

  stages: [
    {
      stage: 1,
      role:
        "AI Recommendation Engine",
      officer:
        "RAILOPT-AI",
      status:
        "COMPLETED",
      timestamp:
        "2026-09-03 10:15 IST",
      note:
        "Optimized block generated.",
    },

    {
      stage: 2,
      role:
        "Senior Divisional Operations Manager",
      officer:
        "Operations Officer",
      status:
        "IN_REVIEW",
      timestamp:
        "Pending Sign-off",
      note:
        "Verifying train timetable buffer.",
    },

    {
      stage: 3,
      role:
        "Senior Divisional Engineer",
      officer:
        "Engineering Officer",
      status:
        "PENDING",
      timestamp:
        "Awaiting Stage 2",
      note:
        "Track safety compliance verification.",
    },

    {
      stage: 4,
      role:
        "Chief Controller Sign-Off",
      officer:
        "Control Office",
      status:
        "PENDING",
      timestamp:
        "Awaiting Stage 3",
      note:
        "Final block grant and section isolation.",
    },
  ],
};


// ============================================================
// 22. LIVE EXECUTION
// ============================================================

export const LIVE_EXECUTION_DATA = {
  blockId:
    "BLOCK-CBE-2026-017",

  status:
    "IN_PROGRESS",

  scheduledStart:
    "02:30 AM",

  actualStart:
    "02:32 AM",

  scheduledEnd:
    "03:45 AM",

  estimatedEnd:
    "03:41 AM",

  elapsedMins: 42,
  totalMins: 75,
  progressPct: 56,

  fieldCrewStatus:
    "All 18 Technicians On-Site & Safety Harness Verified",

  ohePowerIsolation:
    "ISOLATED & EARTHED (25kV De-energized)",

  speedRestriction:
    "TSR 30 km/h active until 04:00 AM",

  liveLog: [
    {
      time: "02:32 AM",
      event:
        "Block Granted by Chief Controller. Track #4 isolated.",
    },

    {
      time: "02:35 AM",
      event:
        "TRD Overhead Power Isolation confirmed.",
    },

    {
      time: "02:40 AM",
      event:
        "Track Gang commenced ultrasonic weld grinding.",
    },

    {
      time: "03:05 AM",
      event:
        "S&T point machine cable insulation testing completed.",
    },
  ],
};


// ============================================================
// 23. LEARNING LOOP
// ============================================================

export const LEARNING_LOOP_FEEDBACK = {
  cycleName:
    "PLAN ➔ EXECUTE ➔ ANALYZE ➔ LEARN",

  recentClosedBlocks: [
    {
      id: "BLK-MAS-104",
      date: "2026-08-30",
      location:
        "Arakkonam Jn",
      predictedDuration: 90,
      actualDuration: 82,
      predictedDelay: "12%",
      actualDelay: "4%",
      modelAdjustment:
        "Tamping speed model tuned +4.2%",
    },

    {
      id: "BLK-SA-088",
      date: "2026-08-28",
      location:
        "Salem Jn",
      predictedDuration: 60,
      actualDuration: 58,
      predictedDelay: "5%",
      actualDelay: "2%",
      modelAdjustment:
        "OHE isolation setup time reduced 5 mins",
    },

    {
      id: "BLK-NDLS-220",
      date: "2026-08-25",
      location:
        "Agra Cantt",
      predictedDuration: 120,
      actualDuration: 115,
      predictedDelay: "18%",
      actualDelay: "9%",
      modelAdjustment:
        "Cross-dept buffer optimized",
    },
  ],

  overallModelAccuracy:
    "Prototype metric only",

  totalFeedbackLoopsCompleted: 0,
};


// ============================================================
// 24. OPERATIONAL ALERTS
// ============================================================

export const OPERATIONAL_ALERTS = [
  {
    id: "ALT-01",
    severity: "CRITICAL",
    title:
      "Track Switch #102B Micro-fissure Alert",
    location:
      "Coimbatore Junction",
    dept: "TRACK",
    time: "10 mins ago",
    targetType: "STATION",
    targetId: "STN-CBE",
  },

  {
    id: "ALT-02",
    severity: "WARNING",
    title:
      "Signal S-104 Cable Insulation Wear",
    location:
      "Coimbatore Junction",
    dept: "S&T",
    time: "25 mins ago",
    targetType: "ASSET",
    targetId: "SIG-CBE-S104",
  },

  {
    id: "ALT-03",
    severity: "OPTIMIZATION",
    title:
      "AI Cross-Department Block Opportunity Detected",
    location:
      "Salem Division Corridor",
    dept: "AI_PLANNER",
    time: "1 hour ago",
    targetType: "AI_PLANNER",
    targetId:
      "BLOCK-CBE-2026-017",
  },
];


// ============================================================
// 25. ANALYTICS
// ============================================================

export const ANALYTICS_DATA = {
  assetAvailabilityTrend: [
    {
      month: "Jan",
      beforeAI: 88.2,
      afterAI: 91.5,
    },
    {
      month: "Feb",
      beforeAI: 88.5,
      afterAI: 92.4,
    },
    {
      month: "Mar",
      beforeAI: 89.0,
      afterAI: 93.1,
    },
    {
      month: "Apr",
      beforeAI: 88.7,
      afterAI: 94.0,
    },
    {
      month: "May",
      beforeAI: 89.2,
      afterAI: 94.8,
    },
    {
      month: "Jun",
      beforeAI: 89.5,
      afterAI: 95.4,
    },
  ],

  blockUtilizationRate: [
    {
      category: "Track Only",
      count: 18,
    },
    {
      category: "S&T Only",
      count: 12,
    },
    {
      category: "TRD Only",
      count: 14,
    },
    {
      category:
        "AI Combined Mega-Blocks",
      count: 38,
    },
  ],

  trainDisruptionSavedMins: [
    {
      week: "W1",
      minsSaved: 420,
    },
    {
      week: "W2",
      minsSaved: 580,
    },
    {
      week: "W3",
      minsSaved: 740,
    },
    {
      week: "W4",
      minsSaved: 920,
    },
  ],

  predictionVsActualAccuracy: [
    {
      metric: "Block Duration",
      accuracyPct: 96.2,
    },
    {
      metric:
        "Train Delay Risk",
      accuracyPct: 94.8,
    },
    {
      metric:
        "Resource Readiness",
      accuracyPct: 97.1,
    },
    {
      metric:
        "Safety Risk Score",
      accuracyPct: 98.4,
    },
  ],
};