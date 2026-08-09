/**
 * ErrorBoundary - Catches and displays errors in child components
 * Prevents the entire extension UI from crashing
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    
    // Optionally send error to error tracking service
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            color: '#d32f2f',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '400px',
            margin: '20px auto',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Something went wrong</h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            The extension encountered an error and cannot continue.
          </p>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            <summary style={{ cursor: 'pointer', color: '#7f3f3f' }}>Error details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>{this.state.errorInfo?.componentStack}</p>
          </details>
          {this.props.onReset && (
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                this.props.onReset();
              }}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
