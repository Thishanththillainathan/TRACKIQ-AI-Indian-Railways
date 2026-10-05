import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Brain,
  Bot,
  Calendar,
  Dna,
  ShieldCheck,
  Activity,
  BarChart3,
  RotateCcw,
  HardHat,
  RadioTower,
  Zap,
  Server,
  FileSpreadsheet,
  Settings,
  Radio,
  TrainTrack,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import SidebarRailwayNetwork from './SidebarRailwayNetwork';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout, isAuthorized } = useAuth();

  // 1. EXACT 9 MAIN WORKFLOW SIDEBAR ITEMS
  const workflowNavItems = [
    { label: "1. Maintenance Requests", icon: Wrench, path: "/requests", badge: "340K Data" },
    { label: "2. ML Predictions", icon: Brain, path: "/ml-predictions", badge: "3 Models" },
    { label: "3. AI Block Planner", icon: Bot, path: "/ai-planner", badge: "10 Constraints" },
    { label: "4. Block Schedule", icon: Calendar, path: "/schedule", badge: "26-Field" },
    { label: "5. Digital Twin", icon: Dna, path: "/digital-twin", badge: "Live Twin" },
    { label: "6. Approval Workflow", icon: ShieldCheck, path: "/approval", badge: "Officer Signoff" },
    { label: "7. Execution Monitor", icon: Activity, path: "/execution", badge: "Live Status" },
    { label: "8. Analytics & Graphs", icon: BarChart3, path: "/analytics", badge: "KPIs" },
    { label: "9. Self-Learning AI", icon: RotateCcw, path: "/learning", badge: "Closed Loop" },
  ];

  // 2. TOP-LEVEL DEPARTMENTS SECTION (EXACT ORDER: TMS, SMMS, TRD)
  const deptNavItems = [
    { label: "Track Management System (TMS)", icon: HardHat, path: "/departments/tms", badge: "TMS" },
    { label: "Signal & Telecommunication System (SMMS)", icon: RadioTower, path: "/departments/smms", badge: "SMMS" },
    { label: "Track Distribution System (TRD)", icon: Zap, path: "/departments/trd", badge: "TRD" },
  ];

  // 3. AUXILIARY / MANAGEMENT SECTION
  const auxNavItems = [
    { label: "Backend / System Monitor", icon: Server, path: "/system-monitor", badge: "API Live" },
    { label: "AI Assistant", icon: Bot, path: "/ai-assistant", badge: "Chat AI" },
    { label: "System Reports", icon: FileSpreadsheet, path: "/reports" },
    { label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Filter items by role permission
  const allowedWorkflow = workflowNavItems.filter(item => isAuthorized(item.path));
  const allowedDept = deptNavItems.filter(item => isAuthorized(item.path));
  const allowedAux = auxNavItems.filter(item => isAuthorized(item.path));
  const isDashboardAllowed = isAuthorized('/');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-[190px] bg-white/[0.03] border-r border-white/10 text-white flex flex-col justify-between shrink-0 h-full select-none z-30 overflow-hidden">
      {/* Brand Header */}
      <div>
        <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-transparent">
          <div className="w-8 h-8 rounded-xl bg-[#C6F432]/18 border border-[#C6F432]/45 flex items-center justify-center text-[#C6F432] font-extrabold shadow-sm shadow-[#C6F432]/10">
            <TrainTrack className="w-4 h-4 text-[#C6F432]" />
          </div>
          <div>
            <div className="font-black tracking-wider text-sm text-white flex items-center gap-1">
              <span>TRACKIQ</span>
            </div>
            <p className="text-[8px] text-white/40 font-mono tracking-tight uppercase">AI CONTROL</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-210px)] custom-scrollbar">
          
          {/* Top-Level Dashboard Navigation */}
          {isDashboardAllowed && (
            <div className="space-y-0.5">
              <NavLink
                to="/"
                end
              >
                {({ isActive }) => (
                  <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all duration-200 ${
                    isActive
                      ? 'bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold shadow-sm shadow-[#C6F432]/10'
                      : 'text-white/70 bg-transparent border border-transparent hover:bg-white/5 hover:text-white font-medium'
                  }`}>
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C6F432]' : 'text-white/80'}`} />
                      <span>Dashboard</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold ${
                      isActive ? 'bg-[#C6F432]/25 text-[#C6F432]' : 'bg-white/10 text-white/60'
                    }`}>HQ</span>
                  </div>
                )}
              </NavLink>
            </div>
          )}
          
          {/* Main System Workflow Order (9 Items) */}
          {allowedWorkflow.length > 0 && (
            <div className="space-y-0.5 pt-1.5 border-t border-white/10">
              <div className="px-2 py-0.5 flex items-center justify-between text-[9px] font-extrabold text-white/40 uppercase tracking-widest font-mono">
                <span>Workflow</span>
              </div>
              
              {allowedWorkflow.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                >
                  {({ isActive }) => (
                    <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all duration-200 ${
                      isActive
                        ? 'bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold shadow-sm shadow-[#C6F432]/10'
                        : 'text-white/70 bg-transparent border border-transparent hover:bg-white/5 hover:text-white font-medium'
                    }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C6F432]' : 'text-white/80'}`} />
                        <span className="truncate">{item.label.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          )}

          {/* Department Section (Exact Order: TMS, SMMS, TRD) */}
          {allowedDept.length > 0 && (
            <div className="space-y-0.5 pt-1.5 border-t border-white/10">
              <p className="px-2 text-[9px] font-extrabold text-white/40 uppercase tracking-widest font-mono mb-0.5">Departments</p>
              {allowedDept.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                >
                  {({ isActive }) => (
                    <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
                      isActive
                        ? 'bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold shadow-sm shadow-[#C6F432]/10'
                        : 'text-white/70 bg-transparent border border-transparent hover:bg-white/5 hover:text-white font-medium'
                    }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C6F432]' : 'text-white/80'}`} />
                        <span className="truncate">{item.badge || item.label}</span>
                      </div>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          )}

          {/* Railway Network Section (Zones, Divisions, Stations) */}
          <SidebarRailwayNetwork />

          {/* Management / System Monitoring */}
          {allowedAux.length > 0 && (
            <div className="space-y-0.5 pt-1.5 border-t border-white/10">
              <p className="px-2 text-[9px] font-extrabold text-white/40 uppercase tracking-widest font-mono mb-0.5">System</p>
              {allowedAux.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                >
                  {({ isActive }) => (
                    <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
                      isActive
                        ? 'bg-[#C6F432]/18 border border-[#C6F432]/45 text-[#C6F432] font-bold shadow-sm shadow-[#C6F432]/10'
                        : 'text-white/70 bg-transparent border border-transparent hover:bg-white/5 hover:text-white font-medium'
                    }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C6F432]' : 'text-white/80'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          )}

        </nav>
      </div>

      {/* Footer System Status & Logout */}
      <div className="p-2 border-t border-white/10 bg-white/[0.01] space-y-1.5">
        {user && (
          <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/10 font-mono text-[10px] text-white">
            <div className="truncate mr-1">
              <span className="text-[9px] text-[#C6F432] font-extrabold block truncate">{user.role}</span>
              <span className="text-white font-bold block text-[10px] truncate">{user.name || user.userId}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout from System"
              className="p-1 bg-[#C6F432]/18 border border-[#C6F432]/45 hover:bg-[#C6F432]/30 text-[#C6F432] hover:text-white font-bold rounded-lg transition-colors shrink-0 flex items-center justify-center shadow-sm shadow-[#C6F432]/10"
            >
              <LogOut className="w-3 h-3 text-[#C6F432]" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] px-1">
          <div className="flex items-center gap-1 text-white/70 font-semibold">
            <Radio className="w-3 h-3 text-[#C6F432] animate-pulse" />
            <span>AI Live</span>
          </div>
          <span className="text-[8px] text-[#C6F432] font-extrabold bg-[#C6F432]/18 border border-[#C6F432]/40 px-1.5 py-0.2 rounded-full">OK</span>
        </div>
      </div>
    </aside>
  );
}

