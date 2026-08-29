'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureDiagnosticError } from '@/lib/telemetry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  boundaryName?: string;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

/**
 * ============================================================================
 * DIAGNOSTIC ERROR BOUNDARY
 * ============================================================================
 * Catches unhandled React component exceptions, reports a silent diagnostic
 * payload to /api/telemetry/error, and presents a graceful fallback UI.
 */
export class DiagnosticErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
      errorId: `err_${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Silently capture diagnostic to backend
    captureDiagnosticError({
      error: {
        message: error.message,
        stack: error.stack,
      },
      table: 'react_component_tree',
      context: {
        boundaryName: this.props.boundaryName || 'RootDiagnosticBoundary',
        componentStack: errorInfo.componentStack?.slice(0, 1000),
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-center space-y-3 my-4">
          <div className="text-2xl">⚠️</div>
          <h3 className="font-bold text-sm">Something went wrong in this section</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            A silent diagnostic report has been logged to our engineers. Please refresh the page or continue browsing other modules.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, errorId: null })}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
