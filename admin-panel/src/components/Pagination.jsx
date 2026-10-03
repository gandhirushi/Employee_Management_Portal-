import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange, perPage, onPerPageChange, totalItems }) {
  if (totalItems === 0) return null;

  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <div className="per-page-select">
        <span>Rows per page</span>
        <select value={perPage} onChange={(e) => onPerPageChange(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <span>
          · {totalItems} total
        </span>
      </div>
      <div className="pagination-pages">
        <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {start > 1 && <span className="text-muted" style={{ padding: '0 4px' }}>…</span>}
        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="text-muted" style={{ padding: '0 4px' }}>…</span>}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
