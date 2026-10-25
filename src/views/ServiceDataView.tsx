import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import ErrorState from '../components/ErrorState';
import LoadingIndicator from '../components/LoadingIndicator';
import Pagination from '../components/Pagination';
import ServiceDataTable from '../components/service-data/ServiceDataTable';
import ServiceDataToolbar from '../components/service-data/ServiceDataToolbar';
import { FLEET_API_PAGE_SIZE, FLEET_QUERY_STALE_TIME } from '../constants/fleet';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { useServiceDataFilters } from '../hooks/useServiceDataFilters';
import {
  useRouteIdsQuery,
  useRoutesInfiniteQuery,
  useRoutesPageQuery,
} from '../services/routes-vehicle';
import { getRouteTripCount, useTripsPageQuery } from '../services/trips';
import { useVehicleSummaryQuery } from '../services/vehicles';
import type { RouteRow, TripRow } from '../types/fleet';
import { getFriendlyErrorMessage } from '../utils/getFriendlyErrorMessage';
import { matchesRouteGroup } from '../utils/routeGroups';

type SectionPageProps = {
  kind: 'routes' | 'trips';
  title: string;
  description: string;
};

const EMPTY_ROUTE_ROWS: RouteRow[] = [];
const EMPTY_TRIP_ROWS: TripRow[] = [];

const ServiceDataView = ({ kind }: SectionPageProps) => {
  const {
    page,
    pageSize,
    routeGroup,
    search,
    selectedRouteIds,
    setPage,
    setPageSize,
    setRouteGroup,
    setSearch,
    setSelectedRouteIds,
  } = useServiceDataFilters();
  const [searchInput, setSearchInput] = useDebouncedSearch(search, setSearch);
  const isRoutes = kind === 'routes';
  const routesPage = useRoutesPageQuery(1, FLEET_API_PAGE_SIZE, isRoutes);
  const routeRows = routesPage.data?.items ?? EMPTY_ROUTE_ROWS;
  const allRouteIdsQuery = useRouteIdsQuery(!isRoutes);
  const routeOptionsQuery = useRoutesInfiniteQuery(!isRoutes);
  const routeOptions = routeOptionsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const routeIds = selectedRouteIds.length > 0 ? selectedRouteIds : (allRouteIdsQuery.data ?? []);
  const tripsPage = useTripsPageQuery(
    page,
    pageSize,
    routeIds,
    !isRoutes && allRouteIdsQuery.isSuccess,
  );
  const vehicleSummaryQuery = useVehicleSummaryQuery(isRoutes);
  const isLoading = isRoutes
    ? routesPage.isPending
    : allRouteIdsQuery.isPending || tripsPage.isPending;
  const error = isRoutes ? routesPage.error : (allRouteIdsQuery.error ?? tripsPage.error);
  const retry = () => {
    if (isRoutes) {
      void routesPage.refetch();
    } else {
      if (allRouteIdsQuery.isError) void allRouteIdsQuery.refetch();
      void tripsPage.refetch();
    }
  };
  const pageData = tripsPage.data;
  const total = pageData?.total;
  const hasNext = pageData?.hasNext ?? false;
  const tripRows = tripsPage.data?.items ?? EMPTY_TRIP_ROWS;
  const matchingRouteRows = useMemo(
    () => routeRows.filter((row) => matchesRouteGroup(row, routeGroup)),
    [routeGroup, routeRows],
  );
  const filteredRouteRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return matchingRouteRows;
    return matchingRouteRows.filter((row) =>
      [row.id, row.shortName, row.longName, ...row.directionNames].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [matchingRouteRows, search]);
  const filteredTripRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return tripRows;
    return tripRows.filter((row) =>
      [row.id, row.routeId ?? '', row.routeName, row.headsign].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [search, tripRows]);
  const filteredRows = isRoutes ? filteredRouteRows : filteredTripRows;
  const pageCount = isRoutes
    ? Math.max(1, Math.ceil(filteredRouteRows.length / pageSize))
    : total === null || total === undefined
      ? null
      : Math.max(1, Math.ceil(total / pageSize));
  const canGoNext = isRoutes ? pageCount !== null && page < pageCount : hasNext;
  const displayTotal = isRoutes ? filteredRouteRows.length : total;
  const visibleRouteRows = filteredRouteRows.slice((page - 1) * pageSize, page * pageSize);
  const routeTripCounts = useQueries({
    queries: isRoutes
      ? visibleRouteRows.map((route) => ({
          queryKey: ['routes', 'trip-count', route.id],
          queryFn: () => getRouteTripCount(route.id),
          staleTime: FLEET_QUERY_STALE_TIME.routeOptions,
        }))
      : [],
  });

  const retryMessage = error ? getFriendlyErrorMessage(error, isRoutes ? 'rute' : 'trip') : null;

  return (
    <main className='mx-auto w-full max-w-[1600px] flex-1 px-5 py-7 sm:px-8 lg:px-10'>
      <div className='mb-5 flex flex-wrap items-end justify-between gap-4'>
        <div className='rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm'>
          <span className='font-bold text-slate-800'>
            {displayTotal?.toLocaleString('id-ID') ?? tripRows.length}
          </span>
          <span className='ml-2 text-slate-500'>
            {displayTotal === null || displayTotal === undefined
              ? `${isRoutes ? 'rute' : 'trip'} di halaman ini`
              : `${isRoutes ? 'rute' : 'trip'} terdaftar`}
          </span>
        </div>
      </div>

      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <ServiceDataToolbar
          kind={kind}
          search={searchInput}
          onSearchChange={setSearchInput}
          routes={routeOptions}
          routeRows={routeRows}
          selectedRouteIds={selectedRouteIds}
          onToggleRoute={(routeId) =>
            setSelectedRouteIds(
              selectedRouteIds.includes(routeId)
                ? selectedRouteIds.filter((id) => id !== routeId)
                : [...selectedRouteIds, routeId],
            )
          }
          onSelectLoadedRoutes={() => setSelectedRouteIds(routeOptions.map((route) => route.id))}
          onClearRoutes={() => setSelectedRouteIds([])}
          routesLoading={routeOptionsQuery.isPending}
          routesError={
            routeOptionsQuery.isError
              ? getFriendlyErrorMessage(routeOptionsQuery.error, 'rute')
              : null
          }
          routesHasNextPage={routeOptionsQuery.hasNextPage ?? false}
          routesFetchingNextPage={routeOptionsQuery.isFetchingNextPage}
          onLoadMoreRoutes={() => {
            if (routeOptionsQuery.hasNextPage && !routeOptionsQuery.isFetchingNextPage)
              void routeOptionsQuery.fetchNextPage();
          }}
          onRetryRoutes={() => void routeOptionsQuery.refetch()}
          routeGroup={routeGroup}
          onRouteGroupChange={setRouteGroup}
        />

        {isLoading ? (
          <div aria-busy='true' className='flex min-h-80 items-center justify-center'>
            <LoadingIndicator label={`Memuat data ${isRoutes ? 'rute' : 'trip'}...`} size='large' />
          </div>
        ) : error ? (
          <ErrorState title='Data gagal dimuat' description={retryMessage ?? ''} onRetry={retry} />
        ) : (
          <>
            <ServiceDataTable
              kind={kind}
              routes={visibleRouteRows}
              trips={filteredTripRows}
              vehiclesByRoute={vehicleSummaryQuery.data?.vehiclesByRoute}
              routeTripCounts={routeTripCounts}
              isEmpty={filteredRows.length === 0}
            />
            <Pagination
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              total={displayTotal ?? null}
              hasNext={canGoNext}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
              }}
            />
          </>
        )}
      </section>
    </main>
  );
};

export default ServiceDataView;
