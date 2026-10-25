import { useCallback, useMemo, useState } from 'react';

import DashboardToolbar, { type DashboardView } from '../components/DashboardToolbar';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingIndicator from '../components/LoadingIndicator';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import VehicleDetailModal from '../components/VehicleDetailModal';
import VehicleGrid from '../components/vehicles/VehicleGrid';
import VehicleGridSkeleton from '../components/vehicles/VehicleGridSkeleton';
import VehicleMapPane from '../components/vehicles/VehicleMapPane';
import VehicleTable from '../components/vehicles/VehicleTable';
import { FLEET_API_PAGE_SIZE } from '../constants/fleet';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { useFleetFilters } from '../hooks/useFleetFilters';
import { useRoutesInfiniteQuery } from '../services/routes-vehicle';
import { useTripsInfiniteQuery } from '../services/trips';
import { useVehicleSummaryQuery, useVehiclesQuery } from '../services/vehicles';
import type { Vehicle } from '../types/fleet';
import { filterVehicles } from '../utils/filterVehicles';

const EMPTY_VEHICLES: Vehicle[] = [];

function FleetPage({ initialView = 'grid' }: { initialView?: DashboardView } = {}) {
  const {
    page,
    pageSize,
    query,
    resetFilters,
    selectedRouteIds,
    selectedTripIds,
    setPage,
    setPageSize,
    setQuery,
    setSelectedRouteIds,
    setSelectedTripIds,
    setStatusFilter,
    setView,
    statusFilter,
    toggleRoute,
    toggleTrip,
    view,
  } = useFleetFilters(initialView);
  const [searchInput, setSearchInput] = useDebouncedSearch(query, setQuery);
  const vehiclesQuery = useVehiclesQuery(
    view === 'map' ? 1 : page,
    view === 'map' ? FLEET_API_PAGE_SIZE : pageSize,
    selectedRouteIds,
    selectedTripIds,
  );
  const vehicleSummaryQuery = useVehicleSummaryQuery();
  const routesQuery = useRoutesInfiniteQuery();
  const vehicles = vehiclesQuery.data?.items ?? EMPTY_VEHICLES;
  const totalVehicles = vehicleSummaryQuery.data?.total ?? 0;
  const hasVehicleData = vehiclesQuery.data !== undefined;
  const routeOptions = useMemo(() => {
    const routes = routesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const activeRouteIds = new Set(Object.keys(vehicleSummaryQuery.data?.vehiclesByRoute ?? {}));
    return routes.toSorted(
      (left, right) => Number(activeRouteIds.has(right.id)) - Number(activeRouteIds.has(left.id)),
    );
  }, [routesQuery.data, vehicleSummaryQuery.data?.vehiclesByRoute]);
  const tripsQuery = useTripsInfiniteQuery(selectedRouteIds);
  const tripOptions = useMemo(() => {
    const loadedTrips =
      tripsQuery.data?.pages.flatMap((page) =>
        page.items.map((trip) => ({
          id: trip.id,
          label: trip.id,
          description: [
            trip.label.replace(trip.id, '').trim().replace(/^·\s*/, ''),
            trip.routeId ? routeOptions.find((route) => route.id === trip.routeId)?.label : '',
          ]
            .filter(Boolean)
            .join(' · '),
        })),
      ) ?? [];
    const activeTrips = new Map<string, (typeof loadedTrips)[number]>();
    for (const trip of vehicleSummaryQuery.data?.activeTrips ?? []) {
      if (
        activeTrips.has(trip.id) ||
        (selectedRouteIds.length > 0 && !selectedRouteIds.includes(trip.routeId))
      ) {
        continue;
      }
      const route = routeOptions.find((option) => option.id === trip.routeId);
      activeTrips.set(trip.id, {
        id: trip.id,
        label: trip.id,
        description: `Aktif · ${route?.label ?? trip.routeId}`,
      });
    }

    return [...activeTrips.values(), ...loadedTrips.filter((trip) => !activeTrips.has(trip.id))];
  }, [routeOptions, selectedRouteIds, tripsQuery.data, vehicleSummaryQuery.data]);
  const operationalCounts = useMemo(
    () => ({
      total: vehicleSummaryQuery.data?.total ?? 0,
      moving: vehicleSummaryQuery.data?.moving ?? 0,
      stopped: vehicleSummaryQuery.data?.stopped ?? 0,
      approaching: vehicleSummaryQuery.data?.approaching ?? 0,
      routes: vehicleSummaryQuery.data?.routes ?? 0,
    }),
    [vehicleSummaryQuery.data],
  );

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedMapVehicleId, setSelectedMapVehicleId] = useState<string | null>(null);
  const closeVehicleDialog = useCallback(() => setSelectedVehicle(null), []);

  const filteredVehicles = useMemo(
    () =>
      filterVehicles(vehicles, {
        query,
        status: statusFilter,
        routeIds: selectedRouteIds,
        tripIds: selectedTripIds,
      }),
    [query, selectedRouteIds, selectedTripIds, statusFilter, vehicles],
  );

  const activeSelectedMapVehicleId =
    selectedMapVehicleId && filteredVehicles.some((vehicle) => vehicle.id === selectedMapVehicleId)
      ? selectedMapVehicleId
      : null;

  const hasVehicleApiFilters = selectedRouteIds.length > 0 || selectedTripIds.length > 0;
  const displayedTotal = hasVehicleApiFilters ? (vehiclesQuery.data?.total ?? null) : totalVehicles;
  const pageCount =
    displayedTotal === null
      ? (vehiclesQuery.data?.pageCount ?? null)
      : Math.max(1, Math.ceil(displayedTotal / pageSize));
  const currentPage = pageCount === null ? page : Math.min(page, pageCount);
  const visibleVehicles = filteredVehicles;
  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== 'Semua' ||
    selectedRouteIds.length > 0 ||
    selectedTripIds.length > 0;
  const mapVehicleCount = hasActiveFilters ? filteredVehicles.length : totalVehicles;

  const requestError =
    vehiclesQuery.error?.message ??
    vehicleSummaryQuery.error?.message ??
    'Data armada gagal dimuat. Coba lagi beberapa saat.';
  const lastUpdatedLabel = vehiclesQuery.dataUpdatedAt
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(
        new Date(vehiclesQuery.dataUpdatedAt),
      )
    : null;

  return (
    <>
      <div
        className={`mx-auto grid min-h-screen w-full max-w-[1800px] grid-cols-1 content-start ${view === 'map' ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : 'lg:grid-cols-[300px_minmax(0,1fr)]'}`}
      >
        <Sidebar
          routes={routeOptions.map((route) => ({
            id: route.id,
            label: route.label,
            description: route.longName || undefined,
          }))}
          trips={tripOptions}
          selectedRouteIds={selectedRouteIds}
          selectedTripIds={selectedTripIds}
          routesLoading={routesQuery.isPending}
          routesError={routesQuery.isError ? routesQuery.error.message : null}
          routesHasNextPage={routesQuery.hasNextPage}
          routesFetchingNextPage={routesQuery.isFetchingNextPage}
          tripsLoading={tripsQuery.isPending}
          tripsError={tripsQuery.isError ? tripsQuery.error.message : null}
          tripsHasNextPage={tripsQuery.hasNextPage}
          tripsFetchingNextPage={tripsQuery.isFetchingNextPage}
          operationalCounts={operationalCounts}
          statusFilter={statusFilter}
          tripsDisabled={selectedRouteIds.length === 0}
          onReset={resetFilters}
          onClearRoutes={() => {
            setSelectedRouteIds([]);
          }}
          onClearTrips={() => {
            setSelectedTripIds([]);
          }}
          onSelectLoadedRoutes={() => {
            setSelectedRouteIds(routeOptions.map((route) => route.id));
          }}
          onSelectLoadedTrips={() => {
            // The selected routes already scope this view. Selecting every loaded
            // scheduled trip would send hundreds of IDs and can exclude live
            // vehicles whose current trip is not in the loaded option pages.
            setSelectedTripIds([]);
          }}
          onStatusChange={(status) => {
            setStatusFilter(status);
          }}
          onRouteToggle={toggleRoute}
          onTripToggle={toggleTrip}
          onLoadMoreRoutes={() => {
            if (routesQuery.hasNextPage && !routesQuery.isFetchingNextPage) {
              void routesQuery.fetchNextPage();
            }
          }}
          onRetryRoutes={() => void routesQuery.refetch()}
          onLoadMoreTrips={() => {
            if (tripsQuery.hasNextPage && !tripsQuery.isFetchingNextPage) {
              void tripsQuery.fetchNextPage();
            }
          }}
          onRetryTrips={() => void tripsQuery.refetch()}
        />

        <main className={`min-w-0 ${view === 'map' ? 'p-3 sm:p-4' : 'p-4 sm:p-6 lg:p-7'}`}>
          <DashboardToolbar
            query={searchInput}
            onQueryChange={setSearchInput}
            resultCount={filteredVehicles.length}
            isFetching={
              vehiclesQuery.isFetching ||
              vehicleSummaryQuery.isFetching ||
              routesQuery.isFetching ||
              tripsQuery.isFetching
            }
            view={view}
            onViewChange={setView}
          />

          {view !== 'map' && (
            <div className='mb-4 mt-6 flex flex-wrap items-end justify-between gap-3'>
              <span
                aria-live='polite'
                className={`inline-flex items-center gap-2 text-xs font-medium ${
                  vehiclesQuery.isError ? 'text-amber-700' : 'text-slate-500'
                }`}
              >
                {vehiclesQuery.isFetching ? (
                  <LoadingIndicator
                    className='text-inherit'
                    label='Memperbarui data...'
                    size='small'
                  />
                ) : (
                  <>
                    <svg
                      aria-hidden='true'
                      className='size-4'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.7'
                      viewBox='0 0 24 24'
                    >
                      {vehiclesQuery.isError ? (
                        <path d='M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z' />
                      ) : (
                        <>
                          <path d='M20 7v5h-5M4 17v-5h5' />
                          <path d='M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2' />
                        </>
                      )}
                    </svg>
                    {vehiclesQuery.isError
                      ? `Pembaruan gagal${lastUpdatedLabel ? ` · data ${lastUpdatedLabel}` : ''}`
                      : lastUpdatedLabel
                        ? `Terakhir diperbarui ${lastUpdatedLabel}`
                        : 'Menunggu data'}
                  </>
                )}
              </span>
            </div>
          )}

          {(vehiclesQuery.isError || vehicleSummaryQuery.isError) && hasVehicleData && (
            <div
              className='mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'
              role='alert'
            >
              <span>
                Gagal memperbarui data. Menampilkan data terakhir yang berhasil dimuat.{' '}
                {requestError}
              </span>
              <button
                className='font-semibold underline underline-offset-2'
                onClick={() => {
                  if (vehiclesQuery.isError) void vehiclesQuery.refetch();
                  if (vehicleSummaryQuery.isError) void vehicleSummaryQuery.refetch();
                }}
                type='button'
              >
                Coba lagi
              </button>
            </div>
          )}

          {vehiclesQuery.isPending && !hasVehicleData && view === 'grid' && (
            <VehicleGridSkeleton count={pageSize} />
          )}

          {vehiclesQuery.isPending && !hasVehicleData && view !== 'grid' && (
            <section
              aria-label='Memuat daftar armada'
              aria-busy='true'
              className='flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white'
            >
              <LoadingIndicator label='Memuat data armada...' size='large' />
            </section>
          )}

          {vehiclesQuery.isError && !hasVehicleData && (
            <ErrorState
              className='rounded-2xl border border-red-200 bg-white px-6 py-14 text-center'
              title='Data armada gagal dimuat'
              description={requestError}
              onRetry={() => void vehiclesQuery.refetch()}
            />
          )}

          {!vehiclesQuery.isPending && hasVehicleData && vehicles.length === 0 && (
            <div className='rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
              <p className='font-semibold text-slate-700'>
                {selectedTripIds.length > 0
                  ? 'Tidak ada kendaraan pada trip terpilih'
                  : 'Tidak ada kendaraan aktif'}
              </p>
              <p className='mt-1 text-sm text-slate-500'>
                {selectedTripIds.length > 0
                  ? 'Trip yang dipilih mungkin tidak sedang beroperasi. Hapus filter trip untuk melihat kendaraan pada rute terpilih.'
                  : 'API MBTA belum mengembalikan data kendaraan.'}
              </p>
              {selectedTripIds.length > 0 && (
                <button
                  className='mt-4 rounded-lg bg-tj-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800'
                  onClick={() => setSelectedTripIds([])}
                  type='button'
                >
                  Tampilkan semua trip di rute
                </button>
              )}
            </div>
          )}

          {!vehiclesQuery.isPending && hasVehicleData && vehicles.length > 0 && (
            <>
              {view === 'map' ? (
                <VehicleMapPane
                  vehicles={filteredVehicles}
                  vehicleCount={mapVehicleCount}
                  isFetching={vehiclesQuery.isFetching}
                  selectedVehicleId={activeSelectedMapVehicleId}
                  onVehicleSelect={setSelectedMapVehicleId}
                  onVehicleDetails={setSelectedVehicle}
                />
              ) : view === 'grid' ? (
                <VehicleGrid vehicles={visibleVehicles} onDetails={setSelectedVehicle} />
              ) : view === 'table' ? (
                <VehicleTable vehicles={visibleVehicles} onDetails={setSelectedVehicle} />
              ) : null}

              {(view === 'map' ? filteredVehicles : visibleVehicles).length === 0 && (
                <EmptyState
                  title='Kendaraan tidak ditemukan'
                  description='Ubah pencarian atau filter untuk melihat kendaraan.'
                  actionLabel='Reset filter'
                  onAction={resetFilters}
                />
              )}

              {view !== 'map' && (
                <Pagination
                  page={currentPage}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  total={displayedTotal}
                  hasNext={vehiclesQuery.data?.hasNext ?? false}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={vehicles.find((vehicle) => vehicle.id === selectedVehicle.id) ?? selectedVehicle}
          onClose={closeVehicleDialog}
        />
      )}
    </>
  );
}

export default FleetPage;
