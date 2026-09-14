"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    // Could send to error tracking service here
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHome = () => {
    window.location.href = "/talk";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          className="min-h-dvh bg-[#FDFBF7] flex flex-col items-center justify-center px-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" 
                 style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)" }}>
              <AlertTriangle size={40} className="text-[#F97316]" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-[#1C1917] mb-2" 
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Something went wrong
            </h1>
            <p className="text-[#78716C] mb-6">
              We caught an error and things aren't working as expected.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left mb-6 p-4 rounded-xl bg-[#F5F5F4] text-[12px] text-[#A8A29E]">
                <summary className="font-semibold text-[#78716C] mb-2">Error details</summary>
                <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                <pre className="whitespace-pre-wrap mt-2">{this.state.error.stack}</pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={this.handleRetry}
                className="px-6 py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={18} strokeWidth={2} className="inline-block mr-2" />
                Try again
              </motion.button>
              <motion.button
                onClick={this.handleHome}
                className="px-6 py-3 rounded-xl font-semibold text-[#78716C] bg-white border border-[#F0EDE8]"
                whileTap={{ scale: 0.95 }}
              >
                <Home size={18} strokeWidth={2} className="inline-block mr-2" />
                Go home
              </motion.button>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}