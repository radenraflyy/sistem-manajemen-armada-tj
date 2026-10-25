import { ROUTE_GROUPS, type RouteGroup } from '../../constants/routes-vehicle';
import type { RouteOption, RouteRow } from '../../types/fleet';
import { matchesRouteGroup } from '../../utils/routeGroups';
import InfiniteMultiSelect from '../InfiniteMultiSelect';

type ServiceDataToolbarProps = {
  kind: 'routes' | 'trips';
  search: string;
  onSearchChange: (value: string) => void;
  routes: RouteOption[];
  routeRows: RouteRow[];
  selectedRouteIds: string[];
  onToggleRoute: (routeId: string) => void;
  onSelectLoadedRoutes: () => void;
  onClearRoutes: () => void;
  routesLoading: boolean;
  routesError: string | null;
  routesHasNextPage: boolean;
  routesFetchingNextPage: boolean;
  onLoadMoreRoutes: () => void;
  onRetryRoutes: () => void;
  routeGroup: RouteGroup;
  onRouteGroupChange: (group: RouteGroup) => void;
};

const ServiceDataToolbar = ({
  kind,
  search,
  onSearchChange,
  routes,
  routeRows,
  selectedRouteIds,
  onToggleRoute,
  onSelectLoadedRoutes,
  onClearRoutes,
  routesLoading,
  routesError,
  routesHasNextPage,
  routesFetchingNextPage,
  onLoadMoreRoutes,
  onRetryRoutes,
  routeGroup,
  onRouteGroupChange,
}: ServiceDataToolbarProps) => (
  <>
    <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4'>
      <label className='flex h-10 min-w-60 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 sm:max-w-md'>
        <svg
          aria-hidden='true'
          className='size-4'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.8'
          viewBox='0 0 24 24'
        >
          <circle cx='11' cy='11' r='7' />
          <path d='m16 16 4 4' />
        </svg>
        <input
          className='w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400'
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={
            kind === 'routes' ? 'Cari nama atau ID rute...' : 'Cari trip, rute, atau tujuan...'
          }
          type='search'
          value={search}
        />
      </label>
      {kind === 'trips' && (
        <div className='w-full sm:w-72'>
          <InfiniteMultiSelect
            label='Filter rute'
            placeholder='Semua rute'
            options={routes.map((route) => ({
              id: route.id,
              label: route.shortName,
              description: route.longName,
            }))}
            selectedIds={selectedRouteIds}
            onToggle={onToggleRoute}
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
      )}
    </div>

    {kind === 'routes' && (
      <div className='flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3'>
        {ROUTE_GROUPS.map((group) => {
          const count =
            group.id === 'all'
              ? routeRows.length
              : routeRows.filter((route) => matchesRouteGroup(route, group.id)).length;
          const active = routeGroup === group.id;
          return (
            <button
              aria-pressed={active}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition ${active ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              key={group.id}
              onClick={() => onRouteGroupChange(group.id)}
              type='button'
            >
              {group.label}{' '}
              <span className={active ? 'text-blue-500' : 'text-slate-400'}>({count})</span>
            </button>
          );
        })}
      </div>
    )}
  </>
);

export default ServiceDataToolbar;
