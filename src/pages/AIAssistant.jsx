import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, RefreshCw, Database, Cpu, MessageSquareText, Trash2, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../config/api.js';

const SUGGESTED_QUESTIONS = [
  'Which stations have active blocks today?',
  'Which assets are unavailable right now?',
  'Which department has the highest workload?',
  'What work is scheduled at NDLS today?',
  'What conflicts exist in current block schedule?',
  'Explain the most recent optimized schedule.',
  'What is the predicted delay for a 120-minute Track Management block at NDLS?',
  'What is the predicted risk level for a Signal & Telecom block at CSMT?',
  'Which stations have high predicted congestion?',
  'Show historical work records for Chennai Central.',
];

const DEPT_OPTIONS = [
  { label: 'All Departments', value: '' },
  { label: 'Track Management (TMD)', value: 'Track Management' },
  { label: 'Signal & Telecom (S&T)', value: 'Signal & Telecommunication' },
  { label: 'Traction Distribution (TRD)', value: 'Traction Distribution' },
];

const PROVIDER_LABELS = {
  OpenAI: { color: 'text-[#000000]', bg: 'bg-[#F5F5F5] border-[#D9D9D9]' },
  'Anthropic Claude': { color: 'text-[#000000]', bg: 'bg-[#F5F5F5] border-[#D9D9D9]' },
  'Google Gemini': { color: 'text-[#000000]', bg: 'bg-[#F5F5F5] border-[#D9D9D9]' },
  'Deterministic Railway AI Engine (Backend Verified)': { color: 'text-[#000000]', bg: 'bg-[#F5F5F5] border-[#D9D9D9]' },
};

function getProviderStyle(provider = '') {
  for (const key of Object.keys(PROVIDER_LABELS)) {
    if (provider.includes(key)) return PROVIDER_LABELS[key];
  }
  return { color: 'text-[#333333]', bg: 'bg-[#F5F5F5] border-[#D9D9D9]' };
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello. I am TRACKIQ AI — your operational assistant for Indian Railways maintenance block planning.\n\nI answer questions about active blocks, asset availability, department workload, schedules, conflicts, and predicted delays and risks — all based on your live database records.\n\nAsk me anything about the current operational state.',
      provider: 'TRACKIQ AI',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [department, setDepartment] = useState('');
  const [stationCode, setStationCode] = useState('');
  const [provider, setProvider] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const [assistantInfo, setAssistantInfo] = useState({
    model_loaded: false,
    model_version: 'v1.0.0',
    confidence_threshold: 0.45,
    assistant_status: 'CHECKING...'
  });

  /* ── Backend health check on mount ── */
  useEffect(() => {
    checkBackendHealth();
  }, []);

  /* ── Auto-scroll to latest message ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-assistant/status`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      setBackendOnline(data.model_loaded === true);
      setAssistantInfo(data);
    } catch {
      setBackendOnline(false);
      setAssistantInfo({
        model_loaded: false,
        model_version: 'v1.0.0',
        confidence_threshold: 0.45,
        assistant_status: 'OFFLINE'
      });
    }
  };

  const sendMessage = async (questionOverride) => {
    const question = (questionOverride ?? input).trim();
    if (!question || loading) return;

    const userMsg = {
      role: 'user',
      text: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });

      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.response || 'I\'m not fully sure what you mean. Please rephrase your question.',
          intent: data.intent || 'unknown',
          confidence: data.confidence !== undefined ? data.confidence : 1.0,
          is_data_grounded: !!data.is_data_grounded,
          grounded_source: data.grounded_source || null,
          provider: data.is_data_grounded ? 'Railway Dataset' : 'TRACKIQ AI Assistant',
          timestamp: data.timestamp || new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Backend unreachable. Ensure the TRACKIQ AI backend is running at the configured VITE_API_URL. If the backend is offline, queries cannot be answered — no fabricated responses are returned.',
          provider: 'Connection Error',
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Conversation cleared. Ask me anything about the current operational state.',
        provider: 'TRACKIQ AI',
        timestamp: new Date().toISOString(),
      },
    ]);
    setShowSuggestions(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] space-y-4 font-sans bg-white text-black">

      {/* ── Header ── */}
      <div className="bg-white border border-[#D9D9D9] rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#333333] font-bold uppercase mb-1">
            <Bot className="w-4 h-4 text-black" />
            <span>TRACKIQ AI — OPERATIONAL ASSISTANT</span>
            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold border ${backendOnline === true
                ? 'bg-[#000000] text-white border-black'
                : backendOnline === false
                  ? 'bg-[#F5F5F5] text-black border-[#D9D9D9]'
                  : 'bg-[#F5F5F5] text-[#808080] border-[#D9D9D9]'
              }`}>
              {backendOnline === true ? '● BACKEND ONLINE' : backendOnline === false ? '● BACKEND OFFLINE' : '● CHECKING...'}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-black tracking-tight">
            AI Assistant — Live Database Query Interface
          </h2>
          <p className="text-xs text-[#333333] mt-0.5">
            Answers drawn from live Supabase records. No fabricated responses. If data is unavailable, says so.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkBackendHealth}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F5F5F5] text-black font-mono text-xs px-3 py-2 rounded-lg border border-[#D9D9D9] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Backend</span>
          </button>
          <button
            onClick={clearConversation}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F5F5F5] text-black font-mono text-xs px-3 py-2 rounded-lg border border-[#D9D9D9] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* ── Context Controls ── */}
      <div className="flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#333333]">Department context:</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-white border border-[#D9D9D9] rounded px-2.5 py-1.5 text-black text-xs focus:outline-none focus:border-black"
          >
            {DEPT_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#333333]">Station code:</span>
          <input
            type="text"
            value={stationCode}
            onChange={(e) => setStationCode(e.target.value.toUpperCase())}
            placeholder="e.g. NDLS"
            maxLength={8}
            className="bg-white border border-[#D9D9D9] rounded px-2.5 py-1.5 text-black text-xs w-24 focus:outline-none focus:border-black uppercase"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#333333]">AI provider:</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-white border border-[#D9D9D9] rounded px-2.5 py-1.5 text-black text-xs focus:outline-none focus:border-black"
          >
            <option value="auto">Auto (OpenAI → Anthropic → Gemini → Deterministic)</option>
            <option value="openai">OpenAI GPT</option>
            <option value="anthropic">Anthropic Claude</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto bg-[#F5F5F5] border border-[#D9D9D9] rounded-xl p-4 space-y-4 min-h-0">

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>

              {/* Bubble */}
              <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-black text-white rounded-br-sm'
                  : msg.isError
                    ? 'bg-[#F5F5F5] border border-black text-black rounded-bl-sm font-bold'
                    : 'bg-white border border-[#D9D9D9] text-black rounded-bl-sm'
                }`}>
                {msg.role === 'assistant' && !msg.isError && (
                  <div className="flex items-center justify-between gap-1.5 mb-2 pb-2 border-b border-[#D9D9D9] font-mono text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-black shrink-0" />
                      <span className="text-black font-bold">TRACKIQ AI ASSISTANT</span>
                    </div>
                    {msg.intent && (
                      <span className="px-1.5 py-0.5 rounded bg-[#F5F5F5] border border-[#D9D9D9] text-black font-bold uppercase">
                        Intent: {msg.intent}
                      </span>
                    )}
                  </div>
                )}
                {msg.text}
              </div>

              {/* Badges + confidence + timestamp */}
              <div className="flex flex-wrap items-center gap-2 px-1 font-mono text-[10px]">
                {msg.role === 'assistant' && msg.is_data_grounded && (
                  <span className="px-2 py-0.5 rounded bg-black text-white font-bold flex items-center gap-1">
                    <Database className="w-3 h-3 text-white" />
                    {msg.grounded_source || 'Data-grounded response'}
                  </span>
                )}
                {msg.role === 'assistant' && msg.confidence !== undefined && !msg.isError && (
                  <span className="px-2 py-0.5 rounded bg-[#F5F5F5] border border-[#D9D9D9] text-black font-bold">
                    Confidence: {(msg.confidence * 100).toFixed(1)}%
                  </span>
                )}
                {msg.role === 'assistant' && msg.provider && !msg.isError && (
                  <span className={`px-2 py-0.5 rounded border ${getProviderStyle(msg.provider).color} ${getProviderStyle(msg.provider).bg}`}>
                    {msg.provider}
                  </span>
                )}
                {msg.source && (
                  <span className="text-[10px] font-mono text-[#808080] flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {msg.source}
                  </span>
                )}
                <span className="text-[10px] font-mono text-[#808080]">
                  {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#D9D9D9] rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-black shrink-0" />
              <span className="text-xs text-black font-mono">Querying database and AI reasoning engine</span>
              <RefreshCw className="w-3.5 h-3.5 text-black animate-spin" />
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested questions ── */}
      {showSuggestions && (
        <div className="shrink-0">
          <button
            onClick={() => setShowSuggestions(false)}
            className="flex items-center gap-1 text-xs font-mono text-[#333333] hover:text-black mb-2 transition"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Suggested questions</span>
          </button>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-[11px] font-mono px-3 py-1.5 bg-white border border-[#D9D9D9] hover:bg-[#F5F5F5] hover:border-black text-black rounded-lg transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="shrink-0 flex gap-2 items-end">
        <div className="flex-1 bg-white border border-[#D9D9D9] focus-within:border-black rounded-xl px-4 py-3 transition">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about active blocks, unavailable assets, department workload, predicted delays…"
            rows={2}
            className="w-full bg-transparent text-sm text-black placeholder-[#808080] resize-none focus:outline-none font-sans leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-mono text-[#808080]">
              Enter to send · Shift+Enter for new line
            </span>
            <span className="text-[10px] font-mono text-[#808080]">
              {input.length}/500
            </span>
          </div>
        </div>

        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="flex items-center justify-center w-12 h-12 bg-black hover:bg-[#333333] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow transition shrink-0"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

    </div>
  );
}

