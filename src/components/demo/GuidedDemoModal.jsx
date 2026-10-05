import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2, Play } from 'lucide-react';

export default function GuidedDemoModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: "1. Global Control Center Dashboard",
      path: "/",
      desc: "Overview of Indian Railways operations across 17 Zones & 68 Divisions. Hero India map shows active maintenance blocks & corridor availability.",
      actionText: "View India Network Map"
    },
    {
      title: "2. Zone & Division Drilldown",
      path: "/zones",
      desc: "Drill down into Southern Railway (SR) and Salem Division (SA) to inspect regional asset availability and corridor throughput.",
      actionText: "Open Zones & Divisions"
    },
    {
      title: "3. Division Corridor Route Schematics",
      path: "/zones?corridor=COR-MAS-CBE",
      desc: "Inspect the Chennai-Coimbatore trunk corridor: Station ➔ Station connected lines showing active maintenance windows & train traffic.",
      actionText: "View Corridor Schematic"
    },
    {
      title: "4. Station Network Directory",
      path: "/stations",
      desc: "Browse searchable station cards (Coimbatore Jn, Chennai Central, Erode, Salem, New Delhi) with platform & track health indicators.",
      actionText: "Explore Station Directory"
    },
    {
      title: "5. Station Satellite Layout & Asset Inspection",
      path: "/stations?code=CBE",
      desc: "High-resolution satellite view of Coimbatore Junction yard. Click interactive markers for Turnout Switch #102B & Signals to see condition metrics.",
      actionText: "Open Station Satellite View"
    },
    {
      title: "6. Cross-Department Maintenance Requests",
      path: "/requests",
      desc: "View incoming uncoordinated requests from Track, S&T, and TRD departments. Notice critical USFD flaw alert on Turnout #102B.",
      actionText: "Inspect Maintenance Requests"
    },
    {
      title: "7. AI Automatic Block Planner",
      path: "/ai-planner",
      desc: "Click 'GENERATE AI BLOCK PLAN'. Watch the AI reasoning engine merge 3 separate Track + S&T + TRD requests into 1 Mega-Block (B-017).",
      actionText: "Launch AI Block Planner"
    },
    {
      title: "8. Digital Twin Operational Corridor Simulation",
      path: "/digital-twin",
      desc: "Simulate train movement in real-time. Compare Current Plan (28% delay risk) vs AI Optimized Plan (4% delay risk, zero passenger holds).",
      actionText: "Run Digital Twin Simulation"
    },
    {
      title: "9. Interactive Gantt Block Schedule",
      path: "/schedule",
      desc: "24-hour visual schedule mapping passenger trains (Cheran Express, Vande Bharat) around combined maintenance windows.",
      actionText: "View Gantt Schedule"
    },
    {
      title: "10. Human-in-the-Loop Officer Approval Workflow",
      path: "/approval",
      desc: "AI recommendations require authorized Railway Operations review. DOM & DEN officers review conflict safety analysis and sign off digitally.",
      actionText: "Review Approval Workflow"
    },
    {
      title: "11. Real-Time Execution Monitoring",
      path: "/execution",
      desc: "Track live block execution: Field crew check-in, 25kV OHE power isolation, speed restriction limits, and real-time safety logs.",
      actionText: "Open Execution Monitor"
    },
    {
      title: "12. AI Self-Learning Feedback Loop",
      path: "/learning",
      desc: "Plan ➔ Execute ➔ Analyze ➔ Learn loop. Compares predicted vs actual execution time to automatically retrain optimization parameters.",
      actionText: "Inspect Learning Feedback Loop"
    }
  ];

  const step = demoSteps[currentStep];

  const handleGoToStep = (index) => {
    setCurrentStep(index);
    navigate(demoSteps[index].path);
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      handleGoToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      handleGoToStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg bg-[#0B1F3A]/95 backdrop-blur-md border border-[#1D4ED8]/60 rounded-xl shadow-2xl p-5 text-white font-sans animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#12345A]">
        <div className="flex items-center gap-2 text-white font-mono font-bold text-xs">
          <Sparkles className="w-4 h-4 text-[#1D4ED8] animate-spin-slow" />
          <span>EVALUATOR GUIDED DEMO TOUR</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-300 bg-[#071426] px-2 py-0.5 rounded border border-[#12345A]">
            Step {currentStep + 1} of {demoSteps.length}
          </span>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white hover:bg-[#12345A] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="py-4 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
          {step.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#071426]/80 p-3 rounded-lg border border-[#12345A]">
          {step.desc}
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-[#12345A]">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-mono"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={() => navigate(step.path)}
          className="flex items-center gap-1.5 text-xs bg-[#12345A] text-white hover:bg-[#12345A]/80 border border-[#12345A] px-3 py-1.5 rounded font-mono font-bold transition-all"
        >
          <Play className="w-3 h-3 text-[#1D4ED8] fill-current" />
          {step.actionText}
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === demoSteps.length - 1}
          className="flex items-center gap-1 text-xs bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white font-mono font-bold px-3.5 py-1.5 rounded transition-all shadow-md disabled:opacity-30"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
