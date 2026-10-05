import React from 'react';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TRACKIQ ErrorBoundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const pageTitle = this.props.pageTitle || 'Department System';
      return (
        <div className="p-6 my-4 vision-card border border-rose-500/30 bg-rose-950/20 backdrop-blur-2xl rounded-2xl text-white font-sans space-y-4">
          <div className="flex items-center gap-3 border-b border-rose-500/20 pb-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                SYSTEM RUNTIME RECOVERY
              </span>
              <h2 className="text-lg font-bold text-white">
                Unable to render {pageTitle}
              </h2>
            </div>
          </div>

          <p className="text-xs text-white/80 font-medium">
            An unexpected client-side error occurred while rendering this module. The rest of TRACKIQ remains fully operational.
          </p>

          {this.state.error && (
            <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] text-rose-300 overflow-x-auto">
              <p className="font-bold">{this.state.error.toString()}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 bg-[#C6F432]/85 hover:bg-[#C6F432] text-black font-mono font-bold text-xs px-4 py-2 rounded-lg shadow transition"
            >
              <RefreshCw className="w-4 h-4 text-black" />
              <span>Retry Component Render</span>
            </button>

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs px-4 py-2 rounded-lg border border-white/15 transition"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
