import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Cpu, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'railopt_optimization_settings';

const DEFAULTS = {
  safety_weight: 45,
  train_buffer_weight: 35,
  resource_synergy_weight: 20,
  max_delay_mins: 15,
  approval_stages: 4,
  self_learning: true,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    // corrupted storage — fall back to defaults
  }
  return { ...DEFAULTS };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings);
  const [saveState, setSaveState] = useState(null); // null | 'saving' | 'saved' | 'error'

  // Live total so sliders stay coherent
  const weightTotal = settings.safety_weight + settings.train_buffer_weight + settings.resource_synergy_weight;
  const weightsValid = weightTotal === 100;

  const updateWeight = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: Number(value) }));
    setSaveState(null);
  };

  const handleSave = () => {
    setSaveState('saving');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
    setTimeout(() => setSaveState(null), 3000);
  };

  const handleReset = () => {
    setSettings({ ...DEFAULTS });
    setSaveState(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-white p-2">
      {/* Header */}
      <div className="vision-card rounded-2xl p-5 border border-white/12 backdrop-blur-2xl bg-white/[0.045] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C6F432] font-bold uppercase mb-1">
            <Settings className="w-4 h-4 text-[#C6F432]" />
            <span>AI ENGINE CONFIGURATION & PARAMETERS</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            TRACKIQ AI SYSTEM SETTINGS
          </h2>
          <p className="text-xs text-white/70 max-w-3xl mt-1 font-medium">
            Configure safety thresholds, maximum train delay tolerance, and cross-department job matching rules.
            Settings are saved to local storage and survive page refreshes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-white hover:bg-[#F0F0F0] text-[#111111] font-mono font-bold text-xs px-4 py-2.5 rounded-lg border border-[#E5E5E5] transition shadow-sm"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!weightsValid}
            className="flex items-center gap-2 bg-[#111111] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4 text-white" />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </div>

      {/* Save feedback */}
      {saveState === 'saved' && (
        <div className="flex items-center gap-2 bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] px-4 py-2.5 rounded-lg text-xs font-mono font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#111111]" />
          Settings saved to local storage. Configuration will persist on page refresh.
        </div>
      )}
      {saveState === 'error' && (
        <div className="flex items-center gap-2 bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] px-4 py-2.5 rounded-lg text-xs font-mono font-bold">
          <AlertTriangle className="w-4 h-4 text-[#111111]" />
          Failed to save settings — local storage may be unavailable or full.
        </div>
      )}
      {!weightsValid && (
        <div className="flex items-center gap-2 bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] px-4 py-2.5 rounded-lg text-xs font-mono font-bold">
          <AlertTriangle className="w-4 h-4 text-[#111111]" />
          Optimization weights must sum to 100%. Current total: {weightTotal}%. Adjust sliders before saving.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Optimization Weights */}
        <div className="rounded-xl p-5 border border-[#E5E5E5] bg-[#F7F7F7] space-y-4 shadow-sm">
          <h3 className="font-bold text-[#111111] uppercase border-b border-[#E5E5E5] pb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#111111]" />
              AI OPTIMIZATION WEIGHTS
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${weightsValid ? 'text-[#111111] border-[#E5E5E5] bg-white' : 'text-[#111111] border-[#E5E5E5] bg-white'
              }`}>
              Total: {weightTotal}%
            </span>
          </h3>

          <div className="space-y-4">
            {[
              { key: 'safety_weight', label: 'Safety Priority Weight' },
              { key: 'train_buffer_weight', label: 'Train Timetable Buffer Weight' },
              { key: 'resource_synergy_weight', label: 'Resource Synergy Weight' },
            ].map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between text-[#555555] font-bold mb-1">
                  <span>{label}:</span>
                  <span className="text-[#111111] font-bold">{settings[key]}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  step="5"
                  value={settings[key]}
                  onChange={(e) => updateWeight(key, e.target.value)}
                  className="w-full accent-[#111111] cursor-pointer"
                />
              </div>
            ))}
          </div>

          <p className="text-[#777777] text-[10px] pt-1 border-t border-[#E5E5E5] font-bold">
            These weights influence the AI block optimizer's scoring function. Weights must total 100% to save.
          </p>
        </div>

        {/* Safety & Operational Constraints */}
        <div className="rounded-xl p-5 border border-[#E5E5E5] bg-[#F7F7F7] space-y-4 shadow-sm">
          <h3 className="font-bold text-[#111111] uppercase border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#111111]" />
            SAFETY & OPERATIONAL CONSTRAINTS
          </h3>

          <div className="space-y-4 text-[#555555] font-bold">
            <div>
              <div className="flex justify-between mb-1">
                <span>Max Allowable Passenger Delay (Minutes):</span>
                <span className="text-[#111111] font-bold">{settings.max_delay_mins} min</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.max_delay_mins}
                onChange={(e) => updateWeight('max_delay_mins', e.target.value)}
                className="w-full accent-[#111111] cursor-pointer"
              />
            </div>

            <div className="flex justify-between items-center bg-white p-2.5 rounded border border-[#E5E5E5]">
              <span>Mandatory Approval Stages:</span>
              <span className="font-bold text-[#111111]">{settings.approval_stages}-Stage</span>
            </div>

            <div className="flex justify-between items-center bg-white p-2.5 rounded border border-[#E5E5E5]">
              <span>Re-Entrant Self-Learning Mode:</span>
              <button
                onClick={() => { setSettings(prev => ({ ...prev, self_learning: !prev.self_learning })); setSaveState(null); }}
                className={`font-bold text-xs px-3 py-1 rounded border transition ${settings.self_learning
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-[#F7F7F7] text-[#111111] border-[#E5E5E5]'
                  }`}
              >
                {settings.self_learning ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Saved Config Readout */}
      <div className="rounded-xl p-4 border border-[#E5E5E5] bg-[#F7F7F7] font-mono text-xs shadow-sm">
        <p className="text-[#555555] uppercase font-bold mb-2">Current Persisted Configuration (localStorage key: <span className="text-[#111111]">{STORAGE_KEY}</span>)</p>
        <pre className="text-[#111111] overflow-x-auto bg-white p-3 rounded border border-[#E5E5E5] font-bold">
          {JSON.stringify(loadSettings(), null, 2)}
        </pre>
      </div>
    </div>
  );
}
