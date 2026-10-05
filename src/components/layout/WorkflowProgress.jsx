import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Brain,
  Cpu,
  Calendar,
  Activity,
  ShieldCheck,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { id: 'requests', label: '1. Requests', path: '/requests', icon: FileText },
  { id: 'ml', label: '2. ML Predictions', path: '/ml-predictions', icon: Brain },
  { id: 'planner', label: '3. AI Planner', path: '/ai-planner', icon: Cpu },
  { id: 'schedule', label: '4. Schedule', path: '/schedule', icon: Calendar },
  { id: 'digital-twin', label: '5. Digital Twin', path: '/digital-twin', icon: Activity },
  { id: 'approval', label: '6. Approval', path: '/approval', icon: ShieldCheck },
  { id: 'execution', label: '7. Execution', path: '/execution', icon: PlayCircle },
  { id: 'learning', label: '8. Self-Learning', path: '/learning', icon: RefreshCw }
];

export default function WorkflowProgress({ currentStepId }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active step index
  const activeIndex = WORKFLOW_STEPS.findIndex(
    (s) => s.id === currentStepId || location.pathname.includes(s.path.replace('/', ''))
  );

  return (
    <div className="bg-[#0b1b36]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 mb-6 shadow-lg">
      <div className="flex items-center justify-between overflow-x-auto custom-scrollbar gap-1 text-xs">
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx || (activeIndex === -1 && idx === 0);

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => navigate(step.path)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap text-[11px] shrink-0 ${
                  isActive
                    ? 'bg-[#C6F432] text-[#071426] font-bold shadow-md shadow-[#C6F432]/20 scale-[1.02]'
                    : isCompleted
                    ? 'bg-white/10 text-white/90 hover:bg-white/15 hover:text-white border border-white/10'
                    : 'bg-white/[0.03] text-white/40 hover:bg-white/5 hover:text-white/60 border border-transparent'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C6F432] shrink-0" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#071426]' : 'text-white/50'}`} />
                )}
                <span>{step.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#071426] animate-ping ml-0.5" />
                )}
              </button>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-white/20 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
