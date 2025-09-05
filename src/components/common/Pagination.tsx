import React from 'react';
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from 'react-icons/fi';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // how many numbers to show on each side of current page
  className?: string;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getPageWindow(
  current: number,
  totalPages: number,
  siblingCount: number,
) {
  const desired = siblingCount * 2 + 1; // numbers to show total
  let start = Math.max(1, current - siblingCount);
  let end = Math.min(totalPages, current + siblingCount);

  // Expand window to keep consistent size when near edges
  while (end - start + 1 < desired) {
    if (start > 1) start--;
    else if (end < totalPages) end++;
    else break;
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
  className,
  showFirstLast = true,
  showPrevNext = true,
}) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const pages = getPageWindow(currentPage, totalPages, siblingCount);

  const goto = (p: number) => {
    const page = clamp(p, 1, totalPages);
    if (page !== currentPage) onPageChange(page);
  };

  return (
    <nav
      className={
        'flex items-center justify-center gap-1 select-none ' +
        (className ?? '')
      }
      aria-label="Pagination"
    >
      {showFirstLast && (
        <button
          type="button"
          aria-label="Go to first page"
          onClick={() => goto(1)}
          disabled={!canPrev}
          className={`p-2 rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FiChevronsLeft className="w-4 h-4" />
        </button>
      )}
      {showPrevNext && (
        <button
          type="button"
          aria-label="Go to previous page"
          onClick={() => goto(currentPage - 5)}
          disabled={!canPrev}
          className={`p-2 rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === currentPage ? 'page' : undefined}
          onClick={() => goto(p)}
          className={`min-w-8 h-8 px-2 rounded-full text-sm font-medium transition-colors ${p === currentPage ? 'bg-slate-400 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
        >
          {p}
        </button>
      ))}

      {showPrevNext && (
        <button
          type="button"
          aria-label="Go to next page"
          onClick={() => goto(currentPage + 5)}
          disabled={!canNext}
          className={`p-2 rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      )}
      {showFirstLast && (
        <button
          type="button"
          aria-label="Go to last page"
          onClick={() => goto(totalPages)}
          disabled={!canNext}
          className={`p-2 rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FiChevronsRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
};

export default Pagination;
