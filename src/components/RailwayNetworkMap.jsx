import React, { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Tooltip,
    Popup,
    useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import {
    Sun,
    Moon,
    Layers,
    MapPin,
    ExternalLink,
    Satellite
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import StationSatelliteModal from "./map/StationSatelliteModal";

import {
    STATIONS,
    STATION_ASSETS,
    RAILWAY_ZONES,
    DIVISIONS,
} from "../data/mockData";


// ============================================================
// IMPORTANT / MAJOR STATIONS
// ============================================================

const IMPORTANT_STATION_CODES = [
    "NDLS",
    "CSMT",
    "MAS",
    "SA",
    "ED",
    "CBE",
    "SBC",
    "HWH",
    "SC",
    "ADI",
];


// ============================================================
// MAP DEFAULT VIEW
// ============================================================

const INDIA_CENTER = [21.0, 78.9];
const INDIA_ZOOM = 5;


// ============================================================
// MAP THEME
// ============================================================

const MAP_THEMES = {
    dark: {
        name: "Dark",

        baseUrl:
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        baseAttribution:
            "&copy; OpenStreetMap contributors",

        railwayOpacity: 0.98,

        panel:
            "rgba(7,17,31,0.95)",

        panelSoft:
            "rgba(9,25,45,0.92)",

        border:
            "rgba(255,255,255,0.10)",

        text:
            "#ffffff",

        secondary:
            "#94a3b8",

        muted:
            "#64748b",

        accent:
            "#3b82f6",

        stationLabelBg:
            "rgba(7,20,38,0.96)",

        stationLabelText:
            "#ffffff",
    },

    light: {
        name: "Light",

        baseUrl:
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        baseAttribution:
            '&copy; OpenStreetMap contributors',

        railwayOpacity: 0.95,

        panel:
            "rgba(255,255,255,0.96)",

        panelSoft:
            "rgba(248,250,252,0.96)",

        border:
            "rgba(15,23,42,0.12)",

        text:
            "#0f172a",

        secondary:
            "#475569",

        muted:
            "#64748b",

        accent:
            "#1d4ed8",

        stationLabelBg:
            "rgba(255,255,255,0.96)",

        stationLabelText:
            "#0f172a",
    },
};


// ============================================================
// MAP VIEW RESET
// ============================================================

function FitIndiaView() {
    const map = useMap();

    useEffect(() => {
        map.setView(
            INDIA_CENTER,
            INDIA_ZOOM
        );
    }, [map]);

    return null;
}


// ============================================================
// SAFE VALUE
// ============================================================

function safeText(
    value,
    fallback = "—"
) {
    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {
        return fallback;
    }

    return String(value);
}


// ============================================================
// LOOKUPS
// ============================================================

function getZoneName(zoneId) {
    const zone = Array.isArray(
        RAILWAY_ZONES
    )
        ? RAILWAY_ZONES.find(
            (item) =>
                item?.id === zoneId ||
                item?.code === zoneId
        )
        : null;

    return (
        zone?.name ||
        safeText(
            zoneId,
            "Railway Zone"
        )
    );
}


function getDivisionName(
    divisionId
) {
    const division = Array.isArray(
        DIVISIONS
    )
        ? DIVISIONS.find(
            (item) =>
                item?.id === divisionId ||
                item?.code === divisionId
        )
        : null;

    return (
        division?.name ||
        safeText(
            divisionId,
            "Division"
        )
    );
}


// ============================================================
// ASSETS FOR STATION
// ============================================================

function getStationAssets(
    stationCode
) {
    if (!Array.isArray(STATION_ASSETS)) {
        return [];
    }

    return STATION_ASSETS.filter(
        (asset) => {
            const assetCode =
                asset?.stationCode ??
                asset?.station_code;

            return (
                String(
                    assetCode || ""
                ).toUpperCase() ===
                String(
                    stationCode || ""
                ).toUpperCase()
            );
        }
    );
}


// ============================================================
// NORMALIZE ASSET STATUS
// ============================================================

function getAssetStatus(
    asset
) {
    return String(
        asset?.status ||
        asset?.condition ||
        asset?.assetStatus ||
        ""
    )
        .trim()
        .toUpperCase();
}


// ============================================================
// STATION STATUS
// ============================================================

function getStationStatus(
    stationCode
) {
    const assets =
        getStationAssets(
            stationCode
        );

    const critical =
        assets.some(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status ===
                    "CRITICAL" ||
                    status ===
                    "FAILED" ||
                    status ===
                    "FAILURE"
                );
            }
        );

    const activeBlock =
        assets.some(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status.includes(
                        "ACTIVE"
                    ) ||
                    status.includes(
                        "BLOCK"
                    )
                );
            }
        );

    const upcoming =
        assets.some(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status ===
                    "UPCOMING" ||
                    status.includes(
                        "DUE"
                    ) ||
                    status.includes(
                        "SCHEDULED"
                    )
                );
            }
        );

    if (critical) {
        return "CRITICAL";
    }

    if (activeBlock) {
        return "ACTIVE_BLOCK";
    }

    return null;
}


// ============================================================
// STATION COLORS
// No red used.
// ============================================================

function getStationColor(
    status
) {
    switch (status) {
        case "CRITICAL":
            return "#111827";

        case "ACTIVE_BLOCK":
            return "#2563eb";

        case "UPCOMING":
            return "#d97706";

        case "HEALTHY":
        default:
            return "#16a34a";
    }
}


// ============================================================
// STATION STATUS LABEL
// ============================================================

function getStatusLabel(
    status
) {
    switch (status) {
        case "CRITICAL":
            return "Critical";

        case "ACTIVE_BLOCK":
            return "Active Block";

        case "UPCOMING":
            return "Upcoming";

        default:
            return "Healthy";
    }
}


// ============================================================
// INFO CARD
// ============================================================

function InfoBox({
    label,
    value,
    theme,
}) {
    return (
        <div
            style={{
                background:
                    theme === "dark"
                        ? "#f8fafc"
                        : "#f8fafc",

                border:
                    "1px solid #e2e8f0",

                borderRadius:
                    "8px",

                padding:
                    "7px 9px",
            }}
        >
            <div
                style={{
                    fontSize:
                        "8px",

                    textTransform:
                        "uppercase",

                    letterSpacing:
                        "0.08em",

                    color:
                        "#64748b",

                    fontWeight:
                        700,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    marginTop:
                        "4px",

                    fontSize:
                        "11px",

                    fontWeight:
                        700,

                    color:
                        "#0f172a",
                }}
            >
                {safeText(value)}
            </div>
        </div>
    );
}


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
    status,
}) {
    const config = {
        CRITICAL: {
            bg: "#e5e7eb",
            color: "#111827",
            border: "#d1d5db",
            text: "Critical",
        },

        ACTIVE_BLOCK: {
            bg: "#dbeafe",
            color: "#1d4ed8",
            border: "#bfdbfe",
            text: "Active Block",
        },

        UPCOMING: {
            bg: "#fef3c7",
            color: "#b45309",
            border: "#fde68a",
            text: "Upcoming",
        },

        HEALTHY: {
            bg: "#dcfce7",
            color: "#15803d",
            border: "#bbf7d0",
            text: "Healthy",
        },
    };

    const item =
        config[status] ||
        config.HEALTHY;

    return (
        <span
            style={{
                display:
                    "inline-flex",

                alignItems:
                    "center",

                background:
                    item.bg,

                color:
                    item.color,

                border:
                    `1px solid ${item.border}`,

                borderRadius:
                    "999px",

                padding:
                    "4px 8px",

                fontSize:
                    "9px",

                fontWeight:
                    800,

                whiteSpace:
                    "nowrap",
            }}
        >
            {item.text}
        </span>
    );
}


// ============================================================
// LEGEND ITEM
// ============================================================

function Legend({
    color,
    text,
    theme,
}) {
    return (
        <div
            style={{
                display:
                    "flex",

                alignItems:
                    "center",

                gap:
                    "6px",
            }}
        >
            <span
                style={{
                    width:
                        "8px",

                    height:
                        "8px",

                    borderRadius:
                        "50%",

                    background:
                        color,

                    boxShadow:
                        `0 0 0 2px ${color}22`,
                }}
            />

            <span
                style={{
                    fontSize:
                        "10px",

                    color:
                        theme.text,

                    fontWeight:
                        600,
                }}
            >
                {text}
            </span>
        </div>
    );
}


// ============================================================
// STATION MARKER
// ============================================================

function StationMarker({
    station,
    selected,
    onSelect,
}) {
    const navigate =
        useNavigate();

    const assets =
        getStationAssets(
            station.code
        );

    const criticalAssets =
        assets.filter(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status ===
                    "CRITICAL" ||
                    status ===
                    "FAILED" ||
                    status ===
                    "FAILURE"
                );
            }
        );

    const upcomingAssets =
        assets.filter(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status ===
                    "UPCOMING" ||
                    status.includes(
                        "DUE"
                    ) ||
                    status.includes(
                        "SCHEDULED"
                    )
                );
            }
        );

    const activeBlocks =
        assets.filter(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status.includes(
                        "ACTIVE"
                    ) ||
                    status.includes(
                        "BLOCK"
                    )
                );
            }
        );

    const status =
        getStationStatus(
            station.code
        );

    const markerColor =
        getStationColor(
            status
        );

    const isImportant =
        IMPORTANT_STATION_CODES.includes(
            station.code
        );

    // ========================================================
    // DIRECT STATION OPEN
    // ========================================================

    const openStationDetails =
        () => {
            const code =
                station?.code ||
                station?.stationCode ||
                station?.station_code;

            const name =
                station?.name ||
                station?.stationName ||
                station?.station_name;

            const value =
                code || name;

            if (!value) {
                return;
            }

            onSelect?.(station);

            navigate(
                `/stations?code=${encodeURIComponent(
                    value
                )}`
            );
        };

    return (
        <CircleMarker
            center={[
                station.coordinates.lat,
                station.coordinates.lng,
            ]}
            radius={
                selected
                    ? 10
                    : isImportant
                        ? 7
                        : 4
            }
            pathOptions={{
                color:
                    markerColor,

                fillColor:
                    markerColor,

                fillOpacity:
                    0.96,

                weight:
                    selected
                        ? 3
                        : 2,
            }}
            eventHandlers={{
                click:
                    openStationDetails,
            }}
        >
            {/* =================================================
                PERMANENT SHORT LABEL
            ================================================= */}

            {isImportant && (
                <Tooltip
                    permanent
                    direction="top"
                    offset={[
                        0,
                        -8,
                    ]}
                    opacity={1}
                    className="railway-station-label"
                >
                    <span>
                        {station.code}
                    </span>
                </Tooltip>
            )}

            {/* =================================================
                HOVER INFORMATION
            ================================================= */}

            {!isImportant && (
                <Tooltip
                    direction="top"
                    offset={[
                        0,
                        -5,
                    ]}
                >
                    <div
                        style={{
                            minWidth:
                                "145px",
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    "12px",

                                fontWeight:
                                    800,

                                color:
                                    "#0f172a",
                            }}
                        >
                            {station.code ||
                                "STATION"}
                        </div>

                        <div
                            style={{
                                fontSize:
                                    "10px",

                                marginTop:
                                    "3px",

                                color:
                                    "#475569",
                            }}
                        >
                            {safeText(
                                station.name,
                                "Railway Station"
                            )}
                        </div>

                        <div
                            style={{
                                fontSize:
                                    "8px",

                                marginTop:
                                    "6px",

                                color:
                                    "#64748b",

                                fontWeight:
                                    700,
                            }}
                        >
                            CLICK TO OPEN DETAILS
                        </div>
                    </div>
                </Tooltip>
            )}

            {/* =================================================
                POPUP
            ================================================= */}

            <Popup>
                <div
                    style={{
                        minWidth:
                            "265px",

                        maxWidth:
                            "290px",

                        fontFamily:
                            "Inter, system-ui, sans-serif",
                    }}
                >
                    {/* Header */}

                    <div
                        style={{
                            display:
                                "flex",

                            justifyContent:
                                "space-between",

                            alignItems:
                                "flex-start",

                            gap:
                                "10px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize:
                                        "19px",

                                    lineHeight:
                                        1,

                                    fontWeight:
                                        800,

                                    color:
                                        "#0f172a",
                                }}
                            >
                                {station.code ||
                                    "STATION"}
                            </div>

                            <div
                                style={{
                                    marginTop:
                                        "5px",

                                    fontSize:
                                        "12px",

                                    fontWeight:
                                        600,

                                    color:
                                        "#475569",
                                }}
                            >
                                {safeText(
                                    station.name
                                )}
                            </div>
                        </div>

                        <StatusBadge
                            status={
                                status
                            }
                        />
                    </div>

                    {/* Station information */}

                    <div
                        style={{
                            display:
                                "grid",

                            gridTemplateColumns:
                                "1fr 1fr",

                            gap:
                                "7px",

                            marginTop:
                                "12px",
                        }}
                    >
                        <InfoBox
                            label="Zone"
                            value={getZoneName(
                                station.zoneId
                            )}
                        />

                        <InfoBox
                            label="Division"
                            value={getDivisionName(
                                station.divisionId
                            )}
                        />

                        <InfoBox
                            label="Platforms"
                            value={
                                station.platforms
                            }
                        />

                        <InfoBox
                            label="Tracks"
                            value={
                                station.tracks
                            }
                        />

                        <InfoBox
                            label="Assets"
                            value={
                                station.assetsCount ??
                                assets.length
                            }
                        />

                        <InfoBox
                            label="Availability"
                            value={
                                station.availability !==
                                    undefined &&
                                    station.availability !==
                                    null
                                    ? `${station.availability}%`
                                    : "—"
                            }
                        />
                    </div>

                    {/* Asset summary */}

                    <div
                        style={{
                            borderTop:
                                "1px solid #e2e8f0",

                            marginTop:
                                "12px",

                            paddingTop:
                                "10px",
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    "9px",

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.10em",

                                color:
                                    "#64748b",

                                fontWeight:
                                    800,

                                marginBottom:
                                    "7px",
                            }}
                        >
                            Asset Status
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",

                                gap:
                                    "6px",

                                flexWrap:
                                    "wrap",
                            }}
                        >
                            {criticalAssets.length >
                                0 && (
                                    <span
                                        style={{
                                            background:
                                                "#e5e7eb",

                                            color:
                                                "#111827",

                                            border:
                                                "1px solid #d1d5db",

                                            padding:
                                                "4px 8px",

                                            borderRadius:
                                                "999px",

                                            fontSize:
                                                "9px",

                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        {
                                            criticalAssets.length
                                        }{" "}
                                        Critical
                                    </span>
                                )}

                            {upcomingAssets.length >
                                0 && (
                                    <span
                                        style={{
                                            background:
                                                "#fef3c7",

                                            color:
                                                "#b45309",

                                            border:
                                                "1px solid #fde68a",

                                            padding:
                                                "4px 8px",

                                            borderRadius:
                                                "999px",

                                            fontSize:
                                                "9px",

                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        {
                                            upcomingAssets.length
                                        }{" "}
                                        Upcoming
                                    </span>
                                )}

                            {activeBlocks.length >
                                0 && (
                                    <span
                                        style={{
                                            background:
                                                "#dbeafe",

                                            color:
                                                "#1d4ed8",

                                            border:
                                                "1px solid #bfdbfe",

                                            padding:
                                                "4px 8px",

                                            borderRadius:
                                                "999px",

                                            fontSize:
                                                "9px",

                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        {
                                            activeBlocks.length
                                        }{" "}
                                        Active Block
                                    </span>
                                )}

                            {criticalAssets.length ===
                                0 &&
                                upcomingAssets.length ===
                                0 &&
                                activeBlocks.length ===
                                0 && (
                                    <span
                                        style={{
                                            background:
                                                "#dcfce7",

                                            color:
                                                "#15803d",

                                            border:
                                                "1px solid #bbf7d0",

                                            padding:
                                                "4px 8px",

                                            borderRadius:
                                                "999px",

                                            fontSize:
                                                "9px",

                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        Healthy
                                    </span>
                                )}
                        </div>
                    </div>

                    {/* Open button */}

                    <button
                        type="button"
                        onClick={
                            openStationDetails
                        }
                        style={{
                            width:
                                "100%",

                            marginTop:
                                "12px",

                            padding:
                                "10px 12px",

                            borderRadius:
                                "9px",

                            border:
                                "1px solid #1d4ed8",

                            background:
                                "#1d4ed8",

                            color:
                                "#ffffff",

                            fontSize:
                                "10px",

                            fontWeight:
                                800,

                            cursor:
                                "pointer",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            gap:
                                "6px",
                        }}
                    >
                        OPEN STATION DETAILS

                        <ExternalLink
                            size={12}
                        />
                    </button>
                </div>
            </Popup>
        </CircleMarker>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RailwayNetworkMap({
    height = "680px",
}) {
    const [
        selectedStation,
        setSelectedStation,
    ] = useState(null);

    const [
        mapTheme,
        setMapTheme,
    ] = useState("dark");

    const [
        satelliteStation,
        setSatelliteStation,
    ] = useState(null);

    const theme =
        MAP_THEMES[mapTheme];

    // ========================================================
    // VALID STATIONS
    // ========================================================

    const mappedStations =
        useMemo(() => {
            if (
                !Array.isArray(
                    STATIONS
                )
            ) {
                return [];
            }

            return STATIONS.filter(
                (station) => {
                    const lat =
                        Number(
                            station
                                ?.coordinates
                                ?.lat
                        );

                    const lng =
                        Number(
                            station
                                ?.coordinates
                                ?.lng
                        );

                    return (
                        Number.isFinite(
                            lat
                        ) &&
                        Number.isFinite(
                            lng
                        )
                    );
                }
            );
        }, []);

    // ========================================================
    // MAJOR STATIONS
    // ========================================================

    const majorStationCount =
        useMemo(() => {
            return mappedStations.filter(
                (station) =>
                    IMPORTANT_STATION_CODES.includes(
                        station.code
                    )
            ).length;
        }, [
            mappedStations,
        ]);

    // ========================================================
    // SELECTED STATION
    // ========================================================

    const selectedStatus =
        selectedStation
            ? getStationStatus(
                selectedStation.code
            )
            : null;

    // ========================================================
    // STATION ASSET COUNT
    // ========================================================

    const selectedAssets =
        selectedStation
            ? getStationAssets(
                selectedStation.code
            )
            : [];

    const selectedCriticalCount =
        selectedAssets.filter(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status ===
                    "CRITICAL" ||
                    status ===
                    "FAILED" ||
                    status ===
                    "FAILURE"
                );
            }
        ).length;

    const selectedUpcomingCount =
        selectedAssets.filter(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status ===
                    "UPCOMING" ||
                    status.includes(
                        "DUE"
                    ) ||
                    status.includes(
                        "SCHEDULED"
                    )
                );
            }
        ).length;

    const selectedBlockCount =
        selectedAssets.filter(
            (asset) => {
                const status =
                    getAssetStatus(
                        asset
                    );

                return (
                    status.includes(
                        "ACTIVE"
                    ) ||
                    status.includes(
                        "BLOCK"
                    )
                );
            }
        ).length;


    return (
        <>
            {/* ==================================================
                MAP CSS
            ================================================== */}

            <style>
                {`
                    .railway-network-map-container {
                        position: relative;
                        width: 100%;
                        overflow: hidden;
                    }

                    .railway-network-map-container
                    .leaflet-container {
                        width: 100%;
                        height: 100%;
                        font-family:
                            Inter,
                            system-ui,
                            -apple-system,
                            BlinkMacSystemFont,
                            "Segoe UI",
                            sans-serif;
                    }

                    .railway-network-map-container
                    .leaflet-control-zoom {
                        border: none !important;
                        box-shadow:
                            0 12px 30px rgba(0,0,0,0.22) !important;
                    }

                    .railway-network-map-container
                    .leaflet-control-zoom a {
                        border: none !important;
                    }

                    .railway-station-label {
                        background:
                            ${theme.stationLabelBg}
                            !important;

                        color:
                            ${theme.stationLabelText}
                            !important;

                        border:
                            1px solid
                            ${theme.border}
                            !important;

                        border-radius:
                            6px !important;

                        padding:
                            3px 6px !important;

                        font-size:
                            9px !important;

                        font-weight:
                            800 !important;

                        box-shadow:
                            0 8px 18px
                            rgba(0,0,0,0.20)
                            !important;
                    }

                    .railway-station-label::before {
                        display:
                            none !important;
                    }

                    .leaflet-popup-content-wrapper {
                        border-radius:
                            12px !important;
                    }

                    .leaflet-popup-content {
                        margin:
                            12px !important;
                    }
                `}
            </style>


            {/* ==================================================
                MAIN MAP
            ================================================== */}

            <div
                className="railway-network-map-container"
                style={{
                    height,

                    borderRadius:
                        "22px",

                    border:
                        `1px solid ${theme.border}`,

                    background:
                        mapTheme ===
                            "dark"
                            ? "#07111f"
                            : "#e2e8f0",

                    boxShadow:
                        "0 22px 55px rgba(0,0,0,0.26)",
                }}
            >

                {/* ==================================================
                    LEAFLET MAP
                ================================================== */}

                <MapContainer
                    center={
                        INDIA_CENTER
                    }
                    zoom={
                        INDIA_ZOOM
                    }
                    minZoom={4}
                    maxZoom={19}
                    scrollWheelZoom
                    zoomControl
                    style={{
                        width:
                            "100%",

                        height:
                            "100%",
                    }}
                >
                    <FitIndiaView />

                    {/* ==============================================
                        BASE MAP
                    ============================================== */}

                    <TileLayer
                        key={
                            mapTheme
                        }
                        url={
                            theme.baseUrl
                        }
                        attribution={
                            theme.baseAttribution
                        }
                        maxZoom={
                            19
                        }
                    />

                    {/* ==============================================
                        RAILWAY TRACK OVERLAY
                    ============================================== */}

                    <TileLayer
                        url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                        attribution='Railway layer: OpenRailwayMap &amp; OpenStreetMap'
                        minZoom={2}
                        maxZoom={19}
                        opacity={
                            theme.railwayOpacity
                        }
                    />

                    {/* ==============================================
                        STATIONS
                    ============================================== */}

                    {mappedStations.map(
                        (
                            station
                        ) => (
                            <StationMarker
                                key={
                                    station.id ||
                                    station.code ||
                                    station.name
                                }
                                station={
                                    station
                                }
                                selected={
                                    selectedStation?.id ===
                                    station.id
                                }
                                onSelect={
                                    setSelectedStation
                                }
                            />
                        )
                    )}
                </MapContainer>


                {/* ==================================================
                    MAP HEADER
                ================================================== */}

                <div
                    style={{
                        position:
                            "absolute",

                        top:
                            "16px",

                        left:
                            "16px",

                        zIndex:
                            1000,

                        pointerEvents:
                            "none",
                    }}
                >
                    <div
                        style={{
                            background:
                                theme.panel,

                            backdropFilter:
                                "blur(16px)",

                            border:
                                `1px solid ${theme.border}`,

                            borderRadius:
                                "15px",

                            padding:
                                "12px 15px",

                            boxShadow:
                                "0 14px 35px rgba(0,0,0,0.25)",
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                gap:
                                    "7px",

                                fontSize:
                                    "9px",

                                color:
                                    theme.secondary,

                                letterSpacing:
                                    "0.16em",

                                textTransform:
                                    "uppercase",

                                fontWeight:
                                    700,
                            }}
                        >
                            <span
                                style={{
                                    width:
                                        "7px",

                                    height:
                                        "7px",

                                    borderRadius:
                                        "50%",

                                    background:
                                        "#22c55e",
                                }}
                            />

                            Indian Railways
                        </div>

                        <div
                            style={{
                                color:
                                    theme.text,

                                fontSize:
                                    "15px",

                                fontWeight:
                                    800,

                                marginTop:
                                    "4px",
                            }}
                        >
                            Railway Network Map
                        </div>

                        <div
                            style={{
                                color:
                                    theme.muted,

                                fontSize:
                                    "9px",

                                marginTop:
                                    "3px",
                            }}
                        >
                            Interactive
                            station &
                            railway
                            infrastructure
                        </div>
                    </div>
                </div>


                {/* ==================================================
                    THEME SWITCH
                ================================================== */}

                <div
                    style={{
                        position:
                            "absolute",

                        top:
                            "16px",

                        right:
                            "16px",

                        zIndex:
                            1000,
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                "4px",

                            background:
                                theme.panel,

                            backdropFilter:
                                "blur(16px)",

                            border:
                                `1px solid ${theme.border}`,

                            borderRadius:
                                "13px",

                            padding:
                                "4px",

                            boxShadow:
                                "0 14px 35px rgba(0,0,0,0.22)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setMapTheme(
                                    "dark"
                                )
                            }
                            aria-label="Dark map"
                            style={{
                                width:
                                    "32px",

                                height:
                                    "30px",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                borderRadius:
                                    "9px",

                                border:
                                    "none",

                                background:
                                    mapTheme ===
                                        "dark"
                                        ? "#1d4ed8"
                                        : "transparent",

                                color:
                                    mapTheme ===
                                        "dark"
                                        ? "#ffffff"
                                        : theme.muted,

                                cursor:
                                    "pointer",
                            }}
                        >
                            <Moon
                                size={15}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setMapTheme(
                                    "light"
                                )
                            }
                            aria-label="Light map"
                            style={{
                                width:
                                    "32px",

                                height:
                                    "30px",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                borderRadius:
                                    "9px",

                                border:
                                    "none",

                                background:
                                    mapTheme ===
                                        "light"
                                        ? "#1d4ed8"
                                        : "transparent",

                                color:
                                    mapTheme ===
                                        "light"
                                        ? "#ffffff"
                                        : theme.muted,

                                cursor:
                                    "pointer",
                            }}
                        >
                            <Sun
                                size={15}
                            />
                        </button>
                    </div>
                </div>


                {/* ==================================================
                    MAP MODE LABEL
                ================================================== */}

                <div
                    style={{
                        position:
                            "absolute",

                        top:
                            "76px",

                        right:
                            "16px",

                        zIndex:
                            1000,

                        pointerEvents:
                            "none",
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                "6px",

                            background:
                                theme.panel,

                            border:
                                `1px solid ${theme.border}`,

                            borderRadius:
                                "9px",

                            padding:
                                "6px 9px",

                            color:
                                theme.secondary,

                            fontSize:
                                "8px",

                            fontWeight:
                                800,

                            textTransform:
                                "uppercase",

                            letterSpacing:
                                "0.08em",
                        }}
                    >
                        <Layers
                            size={11}
                        />

                        {theme.name} Map
                    </div>
                </div>


                {/* ==================================================
                    MAJOR STATION COUNT
                ================================================== */}

                <div
                    style={{
                        position:
                            "absolute",

                        right:
                            "16px",

                        top:
                            "116px",

                        zIndex:
                            1000,
                    }}
                >
                    <div
                        style={{
                            background:
                                theme.panel,

                            backdropFilter:
                                "blur(16px)",

                            border:
                                `1px solid ${theme.border}`,

                            borderRadius:
                                "13px",

                            padding:
                                "10px 13px",

                            minWidth:
                                "108px",

                            boxShadow:
                                "0 14px 35px rgba(0,0,0,0.20)",
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    "8px",

                                color:
                                    theme.muted,

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.14em",

                                fontWeight:
                                    700,
                            }}
                        >
                            Major Stations
                        </div>

                        <div
                            style={{
                                fontSize:
                                    "20px",

                                lineHeight:
                                    1,

                                fontWeight:
                                    800,

                                color:
                                    theme.text,

                                marginTop:
                                    "5px",
                            }}
                        >
                            {
                                majorStationCount
                            }
                        </div>
                    </div>
                </div>


                {/* ==================================================
                    LEGEND
                ================================================== */}

                <div
                    style={{
                        position:
                            "absolute",

                        bottom:
                            "16px",

                        left:
                            "16px",

                        zIndex:
                            1000,
                    }}
                >
                    <div
                        style={{
                            background:
                                theme.panel,

                            backdropFilter:
                                "blur(16px)",

                            border:
                                `1px solid ${theme.border}`,

                            borderRadius:
                                "14px",

                            padding:
                                "10px 12px",

                            boxShadow:
                                "0 14px 35px rgba(0,0,0,0.22)",
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    "8px",

                                color:
                                    theme.muted,

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.15em",

                                fontWeight:
                                    700,

                                marginBottom:
                                    "8px",
                            }}
                        >
                            Station Status
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",

                                gap:
                                    "12px",

                                flexWrap:
                                    "wrap",
                            }}
                        >
                            <Legend
                                color="#16a34a"
                                text="Healthy"
                                theme={
                                    theme
                                }
                            />

                            <Legend
                                color="#d97706"
                                text="Upcoming"
                                theme={
                                    theme
                                }
                            />

                            <Legend
                                color="#111827"
                                text="Critical"
                                theme={
                                    theme
                                }
                            />

                            <Legend
                                color="#2563eb"
                                text="Active Block"
                                theme={
                                    theme
                                }
                            />
                        </div>
                    </div>
                </div>


                {/* ==================================================
                    SELECTED STATION PANEL
                ================================================== */}

                {selectedStation && (
                    <div
                        style={{
                            position:
                                "absolute",

                            right:
                                "16px",

                            bottom:
                                "16px",

                            zIndex:
                                1000,

                            width:
                                "300px",

                            maxWidth:
                                "calc(100% - 32px)",
                        }}
                    >
                        <div
                            style={{
                                background:
                                    theme.panel,

                                backdropFilter:
                                    "blur(18px)",

                                border:
                                    `1px solid ${theme.border}`,

                                borderRadius:
                                    "18px",

                                padding:
                                    "14px",

                                boxShadow:
                                    "0 18px 45px rgba(0,0,0,0.30)",
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        "flex",

                                    justifyContent:
                                        "space-between",

                                    gap:
                                        "10px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize:
                                                "8px",

                                            textTransform:
                                                "uppercase",

                                            letterSpacing:
                                                "0.15em",

                                            color:
                                                theme.muted,

                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        Selected Station
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "21px",

                                            fontWeight:
                                                800,

                                            color:
                                                theme.text,

                                            marginTop:
                                                "4px",

                                            lineHeight:
                                                1,
                                        }}
                                    >
                                        {
                                            selectedStation.code
                                        }
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "10px",

                                            color:
                                                theme.secondary,

                                            marginTop:
                                                "5px",
                                        }}
                                    >
                                        {
                                            selectedStation.name
                                        }
                                    </div>
                                </div>

                                <div
                                    style={{
                                        width:
                                            "9px",

                                        height:
                                            "9px",

                                        borderRadius:
                                            "50%",

                                        background:
                                            getStationColor(
                                                selectedStatus
                                            ),

                                        marginTop:
                                            "5px",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "repeat(3, 1fr)",

                                    gap:
                                        "7px",

                                    marginTop:
                                        "13px",
                                }}
                            >
                                <div
                                    style={{
                                        background:
                                            theme.panelSoft,

                                        border:
                                            `1px solid ${theme.border}`,

                                        borderRadius:
                                            "9px",

                                        padding:
                                            "8px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                "8px",

                                            color:
                                                theme.muted,

                                            textTransform:
                                                "uppercase",
                                        }}
                                    >
                                        Tracks
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "14px",

                                            color:
                                                theme.text,

                                            fontWeight:
                                                800,

                                            marginTop:
                                                "3px",
                                        }}
                                    >
                                        {safeText(
                                            selectedStation.tracks,
                                            "0"
                                        )}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background:
                                            theme.panelSoft,

                                        border:
                                            `1px solid ${theme.border}`,

                                        borderRadius:
                                            "9px",

                                        padding:
                                            "8px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                "8px",

                                            color:
                                                theme.muted,

                                            textTransform:
                                                "uppercase",
                                        }}
                                    >
                                        Platforms
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "14px",

                                            color:
                                                theme.text,

                                            fontWeight:
                                                800,

                                            marginTop:
                                                "3px",
                                        }}
                                    >
                                        {safeText(
                                            selectedStation.platforms,
                                            "0"
                                        )}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background:
                                            theme.panelSoft,

                                        border:
                                            `1px solid ${theme.border}`,

                                        borderRadius:
                                            "9px",

                                        padding:
                                            "8px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                "8px",

                                            color:
                                                theme.muted,

                                            textTransform:
                                                "uppercase",
                                        }}
                                    >
                                        Assets
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "14px",

                                            color:
                                                theme.text,

                                            fontWeight:
                                                800,

                                            marginTop:
                                                "3px",
                                        }}
                                    >
                                        {safeText(
                                            selectedStation.assetsCount ??
                                            selectedAssets.length,
                                            "0"
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* status */}

                            <div
                                style={{
                                    display:
                                        "flex",

                                    gap:
                                        "6px",

                                    flexWrap:
                                        "wrap",

                                    marginTop:
                                        "11px",
                                }}
                            >
                                {selectedCriticalCount >
                                    0 && (
                                        <span
                                            style={{
                                                background:
                                                    "#e5e7eb",

                                                color:
                                                    "#111827",

                                                border:
                                                    "1px solid #d1d5db",

                                                borderRadius:
                                                    "999px",

                                                padding:
                                                    "4px 8px",

                                                fontSize:
                                                    "9px",

                                                fontWeight:
                                                    800,
                                            }}
                                        >
                                            {
                                                selectedCriticalCount
                                            }{" "}
                                            Critical
                                        </span>
                                    )}

                                {selectedUpcomingCount >
                                    0 && (
                                        <span
                                            style={{
                                                background:
                                                    "#fef3c7",

                                                color:
                                                    "#b45309",

                                                border:
                                                    "1px solid #fde68a",

                                                borderRadius:
                                                    "999px",

                                                padding:
                                                    "4px 8px",

                                                fontSize:
                                                    "9px",

                                                fontWeight:
                                                    800,
                                            }}
                                        >
                                            {
                                                selectedUpcomingCount
                                            }{" "}
                                            Upcoming
                                        </span>
                                    )}

                                {selectedBlockCount >
                                    0 && (
                                        <span
                                            style={{
                                                background:
                                                    "#dbeafe",

                                                color:
                                                    "#1d4ed8",

                                                border:
                                                    "1px solid #bfdbfe",

                                                borderRadius:
                                                    "999px",

                                                padding:
                                                    "4px 8px",

                                                fontSize:
                                                    "9px",

                                                fontWeight:
                                                    800,
                                            }}
                                        >
                                            {
                                                selectedBlockCount
                                            }{" "}
                                            Active Block
                                        </span>
                                    )}
                            </div>

                            {/* Details button */}

                            <button
                                type="button"
                                onClick={() => {
                                    const value =
                                        selectedStation.code ||
                                        selectedStation.name;

                                    if (!value) {
                                        return;
                                    }

                                    window.location.href =
                                        `/stations?code=${encodeURIComponent(
                                            value
                                        )}`;
                                }}
                                style={{
                                    width:
                                        "100%",

                                    marginTop:
                                        "12px",

                                    padding:
                                        "9px 12px",

                                    borderRadius:
                                        "9px",

                                    border:
                                        "1px solid #1d4ed8",

                                    background:
                                        "#1d4ed8",

                                    color:
                                        "#ffffff",

                                    fontSize:
                                        "10px",

                                    fontWeight:
                                        800,

                                    cursor:
                                        "pointer",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    gap:
                                        "6px",
                                }}
                            >
                                OPEN STATION DETAILS
                                <MapPin size={12} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setSatelliteStation(selectedStation)}
                                style={{
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "9px 12px",
                                    borderRadius: "9px",
                                    border: "1px solid #16a34a",
                                    background: "#16a34a",
                                    color: "#ffffff",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px"
                                }}
                            >
                                VIEW SATELLITE MAP 🛰️
                                <Satellite size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STATION SATELLITE VIEW MODAL */}
                {satelliteStation && (
                    <StationSatelliteModal
                        station={satelliteStation}
                        onClose={() => setSatelliteStation(null)}
                    />
                )}
            </div>
        </>
    );
}