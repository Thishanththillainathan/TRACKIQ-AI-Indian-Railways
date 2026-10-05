import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrainTrack,
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Server,
  HardHat,
  RadioTower,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getDefaultRoute, user } = useAuth();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to default landing page
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(getDefaultRoute(), { replace: true });
    }
  }, [isAuthenticated, navigate, getDefaultRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const authUser = await login(userId, password, rememberMe);
      const targetPath = authUser.role === ROLES.BACKEND_MONITOR ? '/system-monitor' : '/';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid User ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function for quick User ID selection
  const selectQuickUserId = (accUserId) => {
    setUserId(accUserId);
    setPassword('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans text-black select-none">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Header & Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-black text-white mb-1 shadow-none">
            <TrainTrack className="w-8 h-8 text-white" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-black">TRACKIQ</h1>
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded uppercase tracking-wider">
                PROD
              </span>
            </div>
            <p className="text-xs font-semibold text-[#333333] tracking-wide uppercase mt-1">
              AI-Powered Automatic Block Planning
            </p>
            <p className="text-[11px] text-[#777777] font-mono">
              Indian Railways Operational Security Control
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-5">
          <div className="border-b border-[#D9D9D9] pb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-black" />
              System Officer Authentication
            </span>
            <span className="text-[10px] font-mono text-white font-bold bg-black px-2 py-0.5 rounded">
              SECURE
            </span>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-black text-white rounded-md text-xs flex items-start gap-2.5 font-mono">
              <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-black font-bold text-[11px] uppercase tracking-wider block">
                User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User ID (e.g. Thishanth@123-MAIN OFFICER)"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#D9D9D9] rounded-md text-black placeholder-[#777777] focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-bold text-[11px] uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#D9D9D9] rounded-md text-black placeholder-[#777777] focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#333333] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D9D9D9] bg-white text-black focus:ring-0"
                />
                <span>Maintain Session</span>
              </label>
              <span className="text-[#333333] hover:underline cursor-pointer">Security Control</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black hover:bg-[#222222] text-white font-bold text-xs rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Officer...</span>
              ) : (
                <>
                  <span>LOGIN TO SYSTEM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Select User ID Shortcut */}
          <div className="pt-4 border-t border-[#D9D9D9] space-y-2 font-mono">
            <span className="text-[10px] text-[#333333] font-bold uppercase tracking-wider block">
              Select Authorized Officer User ID:
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => selectQuickUserId('Thishanth@123-MAIN OFFICER')}
                className="p-2 bg-[#F7F7F7] hover:bg-[#F0F0F0] border border-[#D9D9D9] rounded-md text-left flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span className="font-bold text-black text-[11px]">Thishanth@123-MAIN OFFICER</span>
                </div>
                <span className="text-[9px] text-white bg-black px-1.5 py-0.5 rounded font-bold">MAIN OFFICER</span>
              </button>

              <button
                type="button"
                onClick={() => selectQuickUserId('TRACK@123-TMS')}
                className="p-2 bg-[#F7F7F7] hover:bg-[#F0F0F0] border border-[#D9D9D9] rounded-md text-left flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HardHat className="w-3.5 h-3.5 text-black" />
                  <span className="font-bold text-black text-[11px]">TRACK@123-TMS</span>
                </div>
                <span className="text-[9px] text-[#333333] font-bold">TMS OFFICER</span>
              </button>

              <button
                type="button"
                onClick={() => selectQuickUserId('SIGNAL@123-SMMS')}
                className="p-2 bg-[#F7F7F7] hover:bg-[#F0F0F0] border border-[#D9D9D9] rounded-md text-left flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RadioTower className="w-3.5 h-3.5 text-black" />
                  <span className="font-bold text-black text-[11px]">SIGNAL@123-SMMS</span>
                </div>
                <span className="text-[9px] text-[#333333] font-bold">SMMS OFFICER</span>
              </button>

              <button
                type="button"
                onClick={() => selectQuickUserId('TRACTION@123-TRD')}
                className="p-2 bg-[#F7F7F7] hover:bg-[#F0F0F0] border border-[#D9D9D9] rounded-md text-left flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-black" />
                  <span className="font-bold text-black text-[11px]">TRACTION@123-TRD</span>
                </div>
                <span className="text-[9px] text-[#333333] font-bold">TRD OFFICER</span>
              </button>

              <button
                type="button"
                onClick={() => selectQuickUserId('Worker@123')}
                className="p-2 bg-[#F7F7F7] hover:bg-[#F0F0F0] border border-[#D9D9D9] rounded-md text-left flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-black" />
                  <span className="font-bold text-black text-[11px]">Worker@123</span>
                </div>
                <span className="text-[9px] text-[#333333] font-bold bg-[#E5E5E5] px-1.5 py-0.5 rounded border border-[#D9D9D9]">WORKER</span>
              </button>

              <button
                type="button"
                onClick={() => selectQuickUserId('BACKEND@123-BACKEND MONITOR')}
                className="p-2 bg-[#F7F7F7] hover:bg-[#F0F0F0] border border-[#D9D9D9] rounded-md text-left flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-black" />
                  <span className="font-bold text-black text-[11px]">BACKEND@123-BACKEND MONITOR</span>
                </div>
                <span className="text-[9px] text-white bg-black px-1.5 py-0.5 rounded font-bold">MONITOR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#777777] font-mono">
          Indian Railways TRACKIQ Operations Security Standard &copy; 2026
        </p>

      </div>
    </div>
  );
}
