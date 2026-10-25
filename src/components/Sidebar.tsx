import type { VehicleStatus } from '../types/fleet';
import InfiniteMultiSelect, { type MultiSelectOption } from './InfiniteMultiSelect';

type StatusFilter = 'Semua' | VehicleStatus;

type OperationalCounts = {
  total: number;
  moving: number;
  stopped: number;
  approaching: number;
  routes: number;
};

type SidebarProps = {
  routes: MultiSelectOption[];
  trips: MultiSelectOption[];
  selectedRouteIds: string[];
  selectedTripIds: string[];
  routesLoading: boolean;
  routesError: string | null;
  routesHasNextPage: boolean;
  routesFetchingNextPage: boolean;
  tripsLoading: boolean;
  tripsError: string | null;
  tripsHasNextPage: boolean;
  tripsFetchingNextPage: boolean;
  operationalCounts: OperationalCounts;
  statusFilter: StatusFilter;
  onReset: () => void;
  onClearRoutes: () => void;
  onClearTrips: () => void;
  onSelectLoadedTrips: () => void;
  onSelectLoadedRoutes: () => void;
  onStatusChange: (status: StatusFilter) => void;
  onRouteToggle: (routeId: string) => void;
  onTripToggle: (tripId: string) => void;
  onLoadMoreRoutes: () => void;
  onRetryRoutes: () => void;
  onLoadMoreTrips: () => void;
  onRetryTrips: () => void;
  tripsDisabled: boolean;
};

const Sidebar = ({
  routes,
  trips,
  selectedRouteIds,
  selectedTripIds,
  routesLoading,
  routesError,
  routesHasNextPage,
  routesFetchingNextPage,
  tripsLoading,
  tripsError,
  tripsHasNextPage,
  tripsFetchingNextPage,
  operationalCounts,
  statusFilter,
  onReset,
  onClearRoutes,
  onClearTrips,
  onSelectLoadedTrips,
  onSelectLoadedRoutes,
  onStatusChange,
  onRouteToggle,
  onTripToggle,
  onLoadMoreRoutes,
  onRetryRoutes,
  onLoadMoreTrips,
  onRetryTrips,
  tripsDisabled,
}: SidebarProps) => {
  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'Semua armada', value: 'Semua' },
    { label: 'Sedang berjalan', value: 'Berjalan' },
    { label: 'Berhenti di halte', value: 'Berhenti' },
    { label: 'Mendekati halte', value: 'Mendekati' },
  ];

  return (
    <aside className='border-b border-slate-200 bg-white p-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-6'>
      <div className='flex items-center justify-between gap-2'>
        <h2 className='flex items-center gap-2 text-xs font-bold tracking-wide text-slate-700'>
          FILTER
        </h2>
        <button
          className='text-xs font-semibold text-tj-blue hover:underline cursor-pointer'
          onClick={onReset}
          type='button'
        >
          Reset
        </button>
      </div>

      <section className='mt-6 border-t border-slate-100 pt-5'>
        <h3 className='mb-3 text-sm font-semibold text-slate-700'>Status operasional</h3>
        <div className='grid grid-cols-2 gap-2'>
          {statusOptions.map(({ label, value }) => {
            const active = statusFilter === value;
            return (
              <button
                aria-pressed={active}
                className={`rounded-lg border px-2.5 py-2.5 text-left text-xs font-medium transition active:scale-[0.98] ${
                  active
                    ? 'border-blue-200 bg-blue-50 text-tj-blue'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                key={value}
                onClick={() => onStatusChange(value)}
                type='button'
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className='mt-6 space-y-5 border-t border-slate-100 pt-5'>
        <div>
          <InfiniteMultiSelect
            label='Rute / koridor'
            placeholder='Semua rute'
            options={routes}
            selectedIds={selectedRouteIds}
            onToggle={onRouteToggle}
            onSelectLoaded={onSelectLoadedRoutes}
            onClear={onClearRoutes}
            hasNextPage={routesHasNextPage}
            isFetchingNextPage={routesFetchingNextPage}
            isLoading={routesLoading}
            error={routesError}
            onLoadMore={onLoadMoreRoutes}
            onRetry={onRetryRoutes}
          />
        </div>
        <div>
          <InfiniteMultiSelect
            label='Trip'
            placeholder='Semua trip'
            options={trips}
            selectedIds={selectedTripIds}
            onToggle={onTripToggle}
            onSelectLoaded={onSelectLoadedTrips}
            onClear={onClearTrips}
            hasNextPage={tripsHasNextPage}
            isFetchingNextPage={tripsFetchingNextPage}
            isLoading={tripsLoading}
            error={tripsError}
            onLoadMore={onLoadMoreTrips}
            onRetry={onRetryTrips}
            disabled={tripsDisabled}
          />
          {tripsDisabled && (
            <p className='mt-1 text-[11px] text-slate-400'>Pilih rute untuk memuat pilihan trip.</p>
          )}
        </div>
      </section>

      <section className='mt-7' aria-labelledby='network-title'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <h3 id='network-title' className='text-[11px] font-bold tracking-widest text-slate-500'>
            Informasi
          </h3>
        </div>
        <div className='rounded-xl bg-linear-to-br from-tj-navy to-tj-blue p-4 text-white shadow-sm'>
          <div className='flex items-center justify-between text-xs text-blue-100'>
            <span>Total armada jaringan</span>
          </div>
          <div className='mt-2 flex items-baseline gap-2'>
            <strong className='text-3xl leading-none'>{operationalCounts.total}</strong>
            <span className='text-xs text-blue-100'>unit armada</span>
          </div>
          <p className='mt-2 text-xs text-blue-100'>Armada terdaftar pada jaringan</p>
        </div>
      </section>

      <div className='mt-4 grid grid-cols-2 gap-2'>
        {[
          ['BERJALAN', String(operationalCounts.moving), 'Dalam perjalanan', 'text-blue-600'],
          ['DI HALTE', String(operationalCounts.stopped), 'Berhenti di halte', 'text-emerald-600'],
          [
            'RUTE AKTIF',
            String(operationalCounts.routes),
            'Rute dengan kendaraan',
            'text-cyan-600',
          ],
          ['MENDEKATI', String(operationalCounts.approaching), 'Tiba di halte', 'text-amber-600'],
        ].map(([label, value, caption, color]) => (
          <div className='rounded-xl border border-slate-200 bg-white p-3' key={label}>
            <p className='text-[10px] font-bold tracking-wide text-slate-400'>{label}</p>
            <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
            <p className='mt-0.5 text-[10px] text-slate-400'>{caption}</p>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
