import ErrorState from '@/components/ErrorState';
import LoadingIndicator from '@/components/LoadingIndicator';
import Pagination from '@/components/Pagination';
import { useTablePagination } from '@/components/pagination/useTablePagination';
import ServiceDataTable from '@/components/service-data/ServiceDataTable';
import ServiceDataToolbar from '@/components/service-data/ServiceDataToolbar';
import { useServiceDataFilters } from '@/hooks/service-data/useServiceDataFilters';
import { useServiceDataPageData } from '@/hooks/service-data/useServiceDataPageData';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { formatNumber } from '@/utils/formatters';

type SectionPageProps = {
  kind: 'routes' | 'trips';
  title: string;
  description: string;
};

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
    toggleRoute,
  } = useServiceDataFilters();
  const [searchInput, setSearchInput] = useDebouncedSearch(search, setSearch);
  const {
    displayTotal,
    error,
    filteredRows,
    filteredTripRows,
    isLoading,
    isRoutes,
    hasNextPage,
    paginationTotal,
    retry,
    routeOptions,
    routeOptionsQuery,
    routeRows,
    routeTripCounts,
    tripRows,
    vehicleSummaryQuery,
    visibleRouteRows,
  } = useServiceDataPageData({ kind, page, pageSize, search, routeGroup, selectedRouteIds });
  const { paginationProps } = useTablePagination({
    page,
    pageSize,
    count: paginationTotal,
    hasNext: hasNextPage,
    onPageChange: setPage,
    onRowsPerPageChange: setPageSize,
  });

  const retryMessage = error?.message ?? `Data ${isRoutes ? 'rute' : 'trip'} gagal dimuat.`;

  return (
    <main className='mx-auto w-full max-w-[1600px] flex-1 px-5 py-7 sm:px-8 lg:px-10'>
      <div className='mb-5 flex flex-wrap items-end justify-between gap-4'>
        <div className='rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm'>
          <span className='font-bold text-slate-800'>
            {displayTotal === null || displayTotal === undefined
              ? formatNumber(tripRows.length)
              : formatNumber(displayTotal)}
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
          onToggleRoute={toggleRoute}
          onSelectLoadedRoutes={() => setSelectedRouteIds(routeOptions.map((route) => route.id))}
          onClearRoutes={() => setSelectedRouteIds([])}
          routesLoading={routeOptionsQuery.isPending}
          routesError={routeOptionsQuery.isError ? routeOptionsQuery.error.message : null}
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
            <Pagination {...paginationProps} />
          </>
        )}
      </section>
    </main>
  );
};

export default ServiceDataView;
