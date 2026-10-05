import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, AlertOctagon, Home, Server } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AccessDenied({ pathOverride }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getDefaultRoute } = useAuth();

  const attemptedPath = pathOverride || location.pathname;
  const targetRoute = getDefaultRoute();

  return (
    <div className="min-h-screen bg-[#071426] flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-[#0B1F3A] border border-red-900/60 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        
        {/* Shield Icon */}
        <div className="w-16 h-16 bg-red-950/80 border border-red-800 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-950/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="px-3 py-1 bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold uppercase rounded font-mono tracking-wider">
            SECURITY ACCESS RESTRICTION
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            ACCESS DENIED
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            You do not have permission to access this module.
          </p>
        </div>

        {/* Technical Details Box */}
        <div className="bg-[#071426] p-4 rounded-xl border border-[#12345A] text-left font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 border-b border-[#12345A] pb-2">
            <span>Attempted Module:</span>
            <span className="text-red-400 font-bold">{attemptedPath}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 border-b border-[#12345A] pb-2">
            <span>User Account:</span>
            <span className="text-white font-bold">{user?.name || user?.userId || 'Authenticated User'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Assigned Role:</span>
            <span className="text-amber-400 font-bold px-2 py-0.5 bg-amber-950/60 rounded border border-amber-800/60 text-[10px]">
              {user?.role || 'UNAUTHORIZED'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate(targetRoute, { replace: true })}
            className="w-full py-3 bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2"
          >
            {user?.role === 'BACKEND_MONITOR' ? (
              <>
                <Server className="w-4 h-4" />
                <span>Return to System Monitor</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4" />
                <span>Return to Authorized Dashboard</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-mono">
          TRACKIQ Indian Railways Security & Access Control System
        </p>

      </div>
    </div>
  );
}
