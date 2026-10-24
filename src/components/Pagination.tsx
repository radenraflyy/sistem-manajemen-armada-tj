type PaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const Pagination = ({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
      <span>
        Menampilkan{" "}
        <strong className="text-slate-700">
          {firstItem}–{lastItem}
        </strong>{" "}
        dari <strong className="text-slate-700">{total}</strong> armada
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span className="hidden sm:inline">Per halaman</span>
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 outline-none focus:border-blue-400"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={pageSize}
          >
            {[6, 9, 12].map((size) => (
              <option key={size} value={size}>
                {size} unit
              </option>
            ))}
          </select>
        </label>
        <button
          className="h-9 rounded-lg border border-slate-200 px-3 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          ‹ <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        <span className="grid size-9 place-items-center rounded-lg bg-tj-navy font-bold text-white">
          {page}
        </span>
        <button
          className="h-9 rounded-lg border border-slate-200 px-3 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <span className="hidden sm:inline">Berikutnya</span> ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
