import React from "react";

const ErrorFallback = ({ error, message, onRetry }) => {
  const errMsg = error?.response?.data?.message || error?.message || message || "Something went wrong";

  return (
    <div className="learner-card p-5 text-center" style={{ maxWidth: 480, margin: "2rem auto" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          margin: "0 auto 16px",
          background: "#fef2f2",
          display: "grid",
          placeItems: "center",
        }}
      >
        <i className="fa fa-exclamation-circle" style={{ color: "#dc2626", fontSize: "1.5rem" }} />
      </div>
      <h5 className="fw-bold mb-2">Failed to load data</h5>
      <p className="text-muted mb-4" style={{ fontSize: "0.88rem" }}>{errMsg}</p>
      {onRetry && (
        <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={onRetry}>
          <i className="fa fa-refresh me-2" />Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
