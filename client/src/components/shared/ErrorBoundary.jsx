import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="learner-card p-5 text-center" style={{ maxWidth: 500, margin: "0 auto" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                margin: "0 auto 20px",
                background: "#fee2e2",
                display: "grid",
                placeItems: "center",
              }}
            >
              <i className="fa fa-exclamation-triangle" style={{ color: "#dc2626", fontSize: "1.8rem" }} />
            </div>
            <h4 className="fw-bold mb-2">Something went wrong</h4>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              {this.props.fallbackMessage || "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-primary rounded-pill px-4 fw-semibold"
                onClick={() => window.location.reload()}
              >
                <i className="fa fa-refresh me-2" />Refresh Page
              </button>
              <button
                className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </button>
            </div>
            {this.props.showDetails && this.state.error && (
              <details className="mt-4 text-start">
                <summary className="text-muted small fw-semibold" style={{ cursor: "pointer" }}>Error Details</summary>
                <pre className="mt-2 p-3 bg-light rounded-3 small" style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: 200 }}>
                  {this.state.error.stack || this.state.error.message || String(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
