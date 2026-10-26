import { useCallback, useState } from 'react';

import DashboardToolbar, { type DashboardView } from '@/components/DashboardToolbar';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import LoadingIndicator from '@/components/LoadingIndicator';
import Pagination from '@/components/Pagination';
import Sidebar from '@/components/Sidebar';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import { useTablePagination } from '@/components/pagination/useTablePagination';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import VehicleGridSkeleton from '@/components/vehicles/VehicleGridSkeleton';
import VehicleMapPane from '@/components/vehicles/VehicleMapPane';
import VehicleTable from '@/components/vehicles/VehicleTable';
import { useFleetFilters } from '@/hooks/fleet/useFleetFilters';
import { useFleetPageData } from '@/hooks/fleet/useFleetPageData';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import type { Vehicle } from '@/types/fleet';

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
  const {
    displayedTotal,
    fallbackPageCount,
    filteredVehicles,
    hasNextPage,
    hasVehicleData,
    lastUpdatedLabel,
    mapVehicleCount,
    operationalCounts,
    requestError,
    refreshFleetData,
    routeOptions,
    routesQuery,
    tripOptions,
    tripsQuery,
    vehicleSummaryQuery,
    vehicles,
    vehiclesQuery,
  } = useFleetPageData({
    view,
    page,
    pageSize,
    query,
    statusFilter,
    selectedRouteIds,
    selectedTripIds,
  });
  const { paginationProps } = useTablePagination({
    page,
    pageSize,
    count: displayedTotal,
    fallbackPageCount,
    hasNext: hasNextPage,
    onPageChange: setPage,
    onRowsPerPageChange: setPageSize,
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedMapVehicleId, setSelectedMapVehicleId] = useState<string | null>(null);
  const closeVehicleDialog = useCallback(() => setSelectedVehicle(null), []);

  const activeSelectedMapVehicleId =
    selectedMapVehicleId && filteredVehicles.some((vehicle) => vehicle.id === selectedMapVehicleId)
      ? selectedMapVehicleId
      : null;

  const visibleVehicles = filteredVehicles;
  const isRefreshing = vehiclesQuery.isFetching || vehicleSummaryQuery.isFetching;

  return (
    <>
      <div
        className={`mx-auto grid min-h-screen w-full max-w-[1800px] grid-cols-1 content-start ${view === 'map' ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : 'lg:grid-cols-[300px_minmax(0,1fr)]'}`}
      >
        <Sidebar
          routes={routeOptions.map((route) => ({
            id: route.id,
            label: route.longName || route.label,
            description: `ID: ${route.shortName || route.id}`,
            color: route.color,
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
          onClearRoutes={() => setSelectedRouteIds([])}
          onClearTrips={() => {
            setSelectedTripIds([]);
          }}
          onSelectLoadedRoutes={() => {
            setSelectedRouteIds(routeOptions.map((route) => route.id));
          }}
          onSelectLoadedTrips={() => {
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

          <div className='mb-4 mt-6 flex flex-wrap items-end justify-between gap-3'>
            <div
              aria-live='polite'
              className={`inline-flex items-center gap-2 text-xs font-medium ${
                vehiclesQuery.isError ? 'text-amber-700' : 'text-slate-500'
              }`}
            >
              <button
                aria-label={isRefreshing ? 'Sedang memperbarui data' : 'Perbarui data sekarang'}
                className='rounded-full p-1 transition hover:bg-slate-200 disabled:cursor-not-allowed'
                disabled={isRefreshing}
                onClick={() => void refreshFleetData()}
                title='Perbarui data sekarang'
                type='button'
              >
                <svg
                  aria-hidden='true'
                  className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.7'
                  viewBox='0 0 24 24'
                >
                  <path d='M20 7v5h-5M4 17v-5h5' />
                  <path d='M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2' />
                </svg>
              </button>
              {isRefreshing
                ? 'Memperbarui data...'
                : vehiclesQuery.isError
                  ? `Pembaruan gagal${lastUpdatedLabel ? ` · data ${lastUpdatedLabel}` : ''}`
                  : lastUpdatedLabel
                    ? `Terakhir diperbarui ${lastUpdatedLabel}`
                    : 'Menunggu data'}
            </div>
          </div>

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

              {view !== 'map' && <Pagination {...paginationProps} />}
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
