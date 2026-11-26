import { Component } from 'react';

/**
 * Top-level React Error Boundary wrapping public and CMS routes so an
 * unexpected render failure never leaves visitors on a blank white screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[RAZH] Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-canvas text-ink flex items-center justify-center p-6 font-body"
        >
          <div className="max-w-md w-full rounded-2xl bg-surface border border-border-subtle p-7 sm:p-8 text-center shadow-sm space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Application Error
              </p>
              <h1 className="font-heading text-2xl font-medium text-ink">
                Something went wrong
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                An unexpected error interrupted rendering. Reload the page or return to the home view.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-surface border border-border-subtle text-ink text-sm font-medium transition-colors hover:border-border-strong cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
