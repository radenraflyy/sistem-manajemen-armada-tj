import { formatNumber } from '@/utils/formatters';

type PaginationProps = {
  page: number;
  pageCount: number | null;
  pageSize: number;
  total: number | null;
  hasNext?: boolean;
  compact?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const Pagination = ({
  page,
  pageCount,
  pageSize,
  total,
  hasNext = false,
  compact = false,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = total === null ? page * pageSize : Math.min(page * pageSize, total);

  return (
    <div
      className={`${compact ? 'mt-0 rounded-none border-0 border-t px-3 py-3 shadow-none' : 'mt-5 rounded-2xl border border-slate-200 px-4 py-3 shadow-sm'} flex flex-wrap items-center justify-between gap-3 bg-white text-xs text-slate-500`}
    >
      <span>
        Menampilkan{' '}
        <strong className='text-slate-700'>
          {firstItem}–{lastItem}
        </strong>
        {total === null ? (
          ' data'
        ) : (
          <>
            {' '}
            dari <strong className='text-slate-700'>{formatNumber(total)}</strong> data
          </>
        )}
      </span>

      <div className='flex flex-wrap items-center gap-2'>
        <label className='flex items-center gap-2'>
          <span className='hidden sm:inline'>Data per halaman</span>
          <select
            className='h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 outline-none focus:border-blue-400'
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={pageSize}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          className='h-9 cursor-pointer rounded-lg border border-slate-200 px-3 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type='button'
        >
          ‹ <span className='hidden sm:inline'>Sebelumnya</span>
        </button>
        <span className='whitespace-nowrap px-1 font-medium text-slate-600'>
          Halaman <strong className='text-slate-800'>{page}</strong>
          {pageCount === null ? null : (
            <>
              {' '}
              dari <strong className='text-slate-800'>{pageCount}</strong>
            </>
          )}
        </span>
        <button
          className='h-9 cursor-pointer rounded-lg border border-slate-200 px-3 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
          disabled={pageCount === null ? !hasNext : page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          type='button'
        >
          <span className='hidden sm:inline'>Berikutnya</span> ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
