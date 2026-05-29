import React from "react";

const baseStyle = {
  background: "linear-gradient(90deg, #eef2f7 25%, #e2e8f0 50%, #eef2f7 75%)",
  backgroundSize: "200px 100%",
  animation: "skeleton-shimmer 1.5s ease-in-out infinite",
  borderRadius: 8,
};

const styles = `
@keyframes skeleton-shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skeleton-row > * {
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
`;

export const SkeletonBox = ({ width = "100%", height = 20, style, className = "" }) => (
  <div className={className} style={{ ...baseStyle, width, height, ...style }} />
);

export const CardSkeleton = ({ lines = 3 }) => (
  <div className="learner-card p-4" style={{ minHeight: 160 }}>
    <SkeletonBox height={16} width="40%" style={{ marginBottom: 16 }} />
    <SkeletonBox height={12} width="80%" style={{ marginBottom: 8 }} />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox key={i} height={10} width={`${70 - i * 15}%`} style={{ marginBottom: 6 }} />
    ))}
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="col-sm-6 col-xl-3">
    <div className="learner-card p-4 h-100">
      <div className="d-flex align-items-center justify-content-between">
        <div style={{ flex: 1 }}>
          <SkeletonBox height={10} width="60%" style={{ marginBottom: 8 }} />
          <SkeletonBox height={24} width="40%" />
        </div>
        <SkeletonBox width={48} height={48} style={{ borderRadius: 12, flexShrink: 0 }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <SkeletonBox height={3} width="100%" style={{ borderRadius: 999 }} />
      </div>
    </div>
  </div>
);

export const SessionCardSkeleton = () => (
  <div className="col-md-6 col-xl-4">
    <div className="card learner-session-card h-100 border-0 shadow-sm">
      <SkeletonBox height={180} width="100%" style={{ borderRadius: "12px 12px 0 0" }} />
      <div className="card-body p-4">
        <SkeletonBox height={12} width="30%" style={{ marginBottom: 12, borderRadius: 4 }} />
        <SkeletonBox height={18} width="85%" style={{ marginBottom: 8, borderRadius: 4 }} />
        <SkeletonBox height={12} width="50%" style={{ marginBottom: 16, borderRadius: 4 }} />
        <div className="d-flex" style={{ gap: 8, marginBottom: 12 }}>
          <SkeletonBox height={10} width={60} style={{ borderRadius: 4 }} />
          <SkeletonBox height={10} width={80} style={{ borderRadius: 4 }} />
          <SkeletonBox height={10} width={50} style={{ borderRadius: 4 }} />
        </div>
        <SkeletonBox height={12} width="100%" style={{ marginBottom: 6, borderRadius: 4 }} />
        <SkeletonBox height={12} width="70%" style={{ marginBottom: 16, borderRadius: 4 }} />
        <div className="d-flex align-items-center justify-content-between">
          <SkeletonBox height={20} width={60} style={{ borderRadius: 4 }} />
          <SkeletonBox height={34} width={120} style={{ borderRadius: 999 }} />
        </div>
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="learner-card learner-table-card p-4">
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead className="table-light">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><SkeletonBox height={14} width={`${60 + i * 10}%`} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <SkeletonBox height={12} width={`${50 + (c % 3) * 20}%`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ListSkeleton = ({ rows = 4, avatar = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="learner-card p-3" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {avatar && <SkeletonBox width={40} height={40} style={{ borderRadius: "50%", flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <SkeletonBox height={14} width="45%" style={{ marginBottom: 6 }} />
          <SkeletonBox height={10} width="65%" />
        </div>
        <SkeletonBox width={80} height={30} style={{ borderRadius: 999, flexShrink: 0 }} />
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <>
    <div className="row g-4 mb-4">
      {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
    </div>
    <div className="row g-4">
      <div className="col-lg-7"><CardSkeleton lines={5} /></div>
      <div className="col-lg-5"><CardSkeleton lines={3} /></div>
    </div>
  </>
);

export const SkeletonInjector = () => <style>{styles}</style>;

export default SkeletonBox;
