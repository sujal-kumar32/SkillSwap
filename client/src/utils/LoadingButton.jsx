import React from "react";
import { ScaleLoader } from "react-spinners";

const LoadingButton = ({ loading, children, onClick, disabled, className = "", style, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={className}
    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", ...style }}
    {...props}
  >
    {loading && <ScaleLoader height={14} width={2} color="currentColor" />}
    {children}
  </button>
);

export default LoadingButton;
