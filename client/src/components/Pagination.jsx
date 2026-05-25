const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
      <button
        className="btn btn-sm btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <i className="fa fa-chevron-left" style={{ marginRight: 10 }} />Prev
      </button>
      {start > 1 && (
        <>
          <button className="btn btn-sm btn-outline-secondary rounded-pill fw-semibold px-3 py-2" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="text-muted small px-1">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={`btn btn-sm rounded-pill fw-semibold px-3 py-2 ${p === page ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-muted small px-1">…</span>}
          <button className="btn btn-sm btn-outline-secondary rounded-pill fw-semibold px-3 py-2" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button
        className="btn btn-sm btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next<i className="fa fa-chevron-right ms-2" />
      </button>
    </div>
  );
};

export default Pagination;
