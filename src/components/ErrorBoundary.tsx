'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex flex-col items-center justify-center p-8 text-white font-[Tahoma,Arial,sans-serif]"
          style={{ background: '#000080', minHeight: 200 }}
        >
          <div className="max-w-md text-center">
            <div className="mb-3">
              <span
                className="inline-block px-2 py-0.5 text-xs font-bold"
                style={{ background: '#aaa', color: '#000080' }}
              >
                Windows
              </span>
            </div>
            <p className="text-sm mb-4">
              An error occurred in this window. The component has been stopped to prevent further issues.
            </p>
            <p className="text-xs opacity-60 font-mono mb-4">
              {this.state.error?.message}
            </p>
            <button
              className="px-4 py-1.5 text-xs border border-white/50 hover:bg-white/10 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
