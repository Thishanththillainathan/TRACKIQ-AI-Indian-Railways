import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Bot } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { OPERATIONAL_ALERTS } from '../data/mockData';

export default function Alerts() {
  const navigate = useNavigate();
  const [dbAlerts, setDbAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_planner_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDbAlerts(data);
      }
    } catch (err) {
      console.warn('Alerts fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Merge database alerts with system operational alerts
  const combinedAlerts = [
    ...dbAlerts.map(a => ({
      id: a.id,
      title: a.message,
      dept: a.department || 'AI_PLANNER',
      severity: a.alert_type === 'AI_REQUEST_RECEIVED' ? 'HIGH' : 'MEDIUM',
      time: a.created_at ? new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      date: a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      location: `Request ID: ${a.request_id || 'System'}`,
      targetType: 'AI_PLANNER',
      isDbAlert: true
    })),
    ...OPERATIONAL_ALERTS.map(a => ({ ...a, isDbAlert: false }))
  ];

  const handleAlertClick = (alt) => {
    if (alt.targetType === 'STATION') navigate(`/stations?code=CBE`);
    else if (alt.targetType === 'ASSET') navigate(`/assets?id=${alt.targetId}`);
    else if (alt.targetType === 'AI_PLANNER') navigate(`/ai-planner`);
    else if (alt.targetType === 'EXECUTION') navigate(`/execution`);
    else navigate(`/ai-planner`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans bg-white text-black">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9D9D9] rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#333333] font-bold uppercase mb-1">
            <Bell className="w-4 h-4 text-black" />
            <span>DATABASE-BACKED OPERATIONAL ALERTS & NOTIFICATIONS CENTER</span>
          </div>
          <h2 className="text-xl font-extrabold text-black tracking-tight">
            RAILWAY OPERATIONAL ALERTS FEED
          </h2>
          <p className="text-xs text-[#333333] max-w-3xl mt-1">
            Real-time database-backed notifications for AI Planner intake, maintenance request submissions, and corridor conflict warnings.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="p-2.5 bg-black hover:bg-[#333333] disabled:opacity-40 text-white rounded-lg border border-black font-mono text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 font-sans">
        {combinedAlerts.map((alt) => (
          <div
            key={alt.id}
            onClick={() => handleAlertClick(alt)}
            className={`rounded-xl p-5 border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm group bg-white border-[#D9D9D9] hover:bg-[#F5F5F5] hover:border-black`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl border shrink-0 bg-[#F5F5F5] border-[#D9D9D9] text-black">
                {alt.isDbAlert ? (
                  <Bot className="w-6 h-6 text-black" />
                ) : alt.severity === 'CRITICAL' ? (
                  <ShieldAlert className="w-6 h-6 text-black" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-black" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    alt.isDbAlert ? 'bg-black text-white border-black' : 'bg-[#F5F5F5] text-black border-[#D9D9D9]'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="text-[#333333] font-bold">DEPT: {alt.dept}</span>
                  <span className="text-[#808080]">{alt.time} {alt.date ? `• ${alt.date}` : ''}</span>
                  {alt.isDbAlert && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-black text-white border border-black font-bold">
                      DATABASE STORED
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-black text-base group-hover:underline leading-tight">
                  {alt.title}
                </h4>
                <p className="text-xs text-[#333333] font-mono">
                  Location / Details: <strong className="text-black">{alt.location}</strong>
                </p>
              </div>
            </div>

            <button className="flex items-center gap-1.5 font-mono text-xs font-bold text-black group-hover:translate-x-1 transition-all shrink-0">
              <span>Inspect & Resolve</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

