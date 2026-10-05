import React, { useState, useEffect } from 'react';
import { Clock, Layers, ShieldCheck, LogOut, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRailwayNetwork } from '../../context/RailwayNetworkContext';
import { Network, X } from 'lucide-react';

export default function Header() {
  const [timeStr, setTimeStr] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedZone, selectedDivision, selectedStation, clearNetworkFilter, isFilterActive } = useRailwayNetwork();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getBreadcrumbs = (path) => {
    switch (path) {
      case '/': return 'INDIA NETWORK / GLOBAL DASHBOARD';
      case '/department/tmd': return 'TRACK MANAGEMENT DEPARTMENT (TMD) DASHBOARD';
      case '/department/st': return 'SIGNAL & TELECOM DEPARTMENT (S&T) DASHBOARD';
      case '/department/trd': return 'TRACTION DISTRIBUTION DEPARTMENT (TRD) DASHBOARD';
      case '/network': return 'INDIAN RAILWAYS NETWORK OVERVIEW';
      case '/zones': return 'ZONES & DIVISIONS HIERARCHY';
      case '/stations': return 'STATION NETWORK DIRECTORY';
      case '/assets': return 'RAILWAY ASSET MANAGEMENT';
      case '/requests': return 'MAINTENANCE REQUEST QUEUE';
      case '/ai-planner': return 'AI AUTOMATIC BLOCK PLANNER';
      case '/schedule': return 'CORRIDOR BLOCK SCHEDULE';
      case '/digital-twin': return 'DIGITAL TWIN SIMULATION';
      case '/approval': return 'HUMAN-IN-THE-LOOP APPROVAL WORKFLOW';
      case '/execution': return 'REAL-TIME BLOCK EXECUTION MONITOR';
      case '/learning': return 'AI SELF-LEARNING FEEDBACK LOOP';
      case '/analytics': return 'ANALYTICS & PERFORMANCE METRICS';
      case '/alerts': return 'OPERATIONAL ALERTS CENTER';
      case '/reports': return 'REPORTS & EXPORTS';
      case '/settings': return 'SYSTEM CONFIGURATION & SETTINGS';
      case '/system-monitor': return 'CENTRAL BACKEND & SYSTEM CONTROL MONITOR';
      default: return 'OPERATIONS CONTROL CENTER';
    }
  };

  return (
    <>
      <header className="bg-white/[0.03] backdrop-blur-2xl border-b border-white/10 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20 mb-3 text-white">
        {/* Left Title & Breadcrumbs */}
        <div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#C6F432] font-mono font-bold tracking-wider uppercase">
            <Layers className="w-3 h-3 text-[#C6F432]" />
            <span>{getBreadcrumbs(location.pathname)}</span>
          </div>
          <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
            <span>INDIAN RAILWAYS — AI CONTROL</span>
          </h1>
        </div>

        {/* Center Search Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/12 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white/70 w-56 focus-within:w-72 focus-within:border-[#C6F432]/60 transition-all duration-300">
          <span className="text-white/40 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search Station, Corridor, Block..."
            className="bg-transparent border-none text-white text-[11px] placeholder-white/35 focus:outline-none w-full p-0"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* IST Live Clock */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/12 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono font-bold text-white/90">
            <Clock className="w-3 h-3 text-[#C6F432]" />
            <span>{timeStr || "11:48:00 IST"}</span>
          </div>

          {/* Operational Officer Badge or Login Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-white/5 border border-white/12 backdrop-blur-md px-2.5 py-1 rounded-full text-xs">
              <div className="w-6 h-6 rounded-full bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-extrabold flex items-center justify-center text-[9px] shadow-sm shadow-[#C6F432]/10">
                {(user.role || 'OFF').substring(0, 3)}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-[10px] font-extrabold text-white leading-none truncate max-w-[130px]">{user.name || user.userId}</p>
                <p className="text-[8px] text-[#C6F432] font-mono font-bold uppercase">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout from System"
                className="ml-0.5 text-[#C6F432] hover:text-white hover:bg-[#C6F432]/30 transition font-bold text-[10px] flex items-center gap-1 bg-[#C6F432]/18 border border-[#C6F432]/45 px-2 py-0.5 rounded-full shadow-sm shadow-[#C6F432]/10"
              >
                <LogOut className="w-3 h-3 text-[#C6F432]" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1 bg-[#C6F432]/18 border border-[#C6F432]/45 hover:bg-[#C6F432]/30 text-[#C6F432] px-3 py-1 rounded-full text-xs font-bold transition shadow-sm shadow-[#C6F432]/10"
            >
              <ShieldCheck className="w-3 h-3 text-[#C6F432]" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Active Railway Network Selection Banner */}
      {isFilterActive && (
        <div className="bg-white/5 backdrop-blur-2xl text-white px-6 py-2 border-b border-white/10 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 font-bold truncate">
            <Network className="w-4 h-4 text-[#C6F432] shrink-0" />
            <span className="text-white/60">ACTIVE LOCATION CONTEXT:</span>
            {selectedZone && (
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-white border border-white/20">
                Zone: <strong className="text-white">{selectedZone.name} ({selectedZone.code})</strong>
              </span>
            )}
            {selectedDivision && (
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-white border border-white/20">
                Division: <strong className="text-white">{selectedDivision.name}</strong>
              </span>
            )}
            {selectedStation && (
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-white border border-white/20">
                Station: <strong className="text-white">{selectedStation.name} ({selectedStation.code})</strong>
              </span>
            )}
          </div>

          <button
            onClick={clearNetworkFilter}
            className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 ml-3 border border-white/15"
          >
            <X className="w-3 h-3" />
            <span>Reset Context</span>
          </button>
        </div>
      )}
    </>
  );
}
