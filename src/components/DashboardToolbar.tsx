import LoadingIndicator from '@/components/LoadingIndicator';

export type DashboardView = 'grid' | 'table' | 'map';

type DashboardToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
  isFetching: boolean;
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
};

const DashboardToolbar = ({
  query,
  onQueryChange,
  resultCount,
  isFetching,
  view,
  onViewChange,
}: DashboardToolbarProps) => {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4'>
      <label className='flex h-11 min-w-55 flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-400 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 sm:max-w-md'>
        <svg
          aria-hidden='true'
          className='size-4 shrink-0'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.8'
          viewBox='0 0 24 24'
        >
          <circle cx='11' cy='11' r='7' />
          <path d='m16 16 4 4' />
        </svg>
        <input
          className='w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400'
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder='Cari nomor armada, rute, atau tujuan...'
          type='search'
          value={query}
        />
      </label>

      <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end'>
        {isFetching && (
          <LoadingIndicator
            className='whitespace-nowrap'
            label='Memperbarui data...'
            size='small'
          />
        )}
        <span className='whitespace-nowrap text-xs font-medium text-slate-500'>
          <strong className='text-slate-700'>{resultCount}</strong> kendaraan ditampilkan
        </span>
        <span className='hidden h-6 w-px bg-slate-200 sm:block' />
        <div className='flex rounded-xl bg-slate-100 p-1'>
          <button
            aria-pressed={view === 'grid'}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition active:scale-[0.98] ${
              view === 'grid'
                ? 'bg-white text-tj-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => onViewChange('grid')}
            type='button'
          >
            <span aria-hidden='true'>▦</span>
            Grid
          </button>
          <button
            aria-pressed={view === 'table'}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition active:scale-[0.98] ${
              view === 'table'
                ? 'bg-white text-tj-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => onViewChange('table')}
            type='button'
          >
            <span aria-hidden='true'>☷</span>
            Tabel
          </button>
          <button
            aria-pressed={view === 'map'}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition active:scale-[0.98] ${
              view === 'map'
                ? 'bg-white text-tj-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => onViewChange('map')}
            type='button'
          >
            <span aria-hidden='true'>⌖</span>
            Map Views
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardToolbar;
