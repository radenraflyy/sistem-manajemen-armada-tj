import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import DashboardToolbar, { type DashboardView } from './components/DashboardToolbar';
import Footer from './components/Footer';
import Header from './components/Header';
import LoadingIndicator from './components/LoadingIndicator';
import Pagination from './components/Pagination';
import Sidebar from './components/Sidebar';
import VehicleCard from './components/VehicleCard';
import {
  useRoutesInfiniteQuery,
  useTripsInfiniteQuery,
  useVehiclesQuery,
  useVehicleSummaryQuery,
} from './data-service/queries/vehicle';
import type { Vehicle, VehicleStatus } from './data-service/types';
import { getFriendlyErrorMessage } from './utils/getFriendlyErrorMessage';

const InteractiveMap = lazy(() => import('./components/InteractiveMap'));

type StatusFilter = 'Semua' | VehicleStatus;

function App({ initialView = 'grid' }: { initialView?: DashboardView } = {}) {
  const [view, setView] = useState<DashboardView>(initialView);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const vehiclesQuery = useVehiclesQuery(view === 'map' ? 1 : page, view === 'map' ? 1000 : pageSize);
  const vehicleSummaryQuery = useVehicleSummaryQuery();
  const routesQuery = useRoutesInfiniteQuery();
  const vehicles = vehiclesQuery.data?.items ?? [];
  const totalVehicles = vehicleSummaryQuery.data?.total ?? 0;
  const hasVehicleData = vehiclesQuery.data !== undefined;
  const routeOptions = useMemo(
    () => routesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [routesQuery.data],
  );
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const tripsQuery = useTripsInfiniteQuery(selectedRouteIds);
  const tripOptions = useMemo(
    () =>
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
      ) ?? [],
    [routeOptions, tripsQuery.data],
  );
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

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedMapVehicleId, setSelectedMapVehicleId] = useState<string | null>(null);
  const closeVehicleDialog = useCallback(() => setSelectedVehicle(null), []);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [
          vehicle.id,
          vehicle.number,
          vehicle.route,
          vehicle.destination,
          vehicle.origin,
          vehicle.tripId ?? '',
        ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      const matchesStatus = statusFilter === 'Semua' || vehicle.status === statusFilter;
      const matchesRoute =
        selectedRouteIds.length === 0 ||
        (vehicle.routeId !== null && selectedRouteIds.includes(vehicle.routeId));
      const matchesTrip =
        selectedTripIds.length === 0 ||
        (vehicle.tripId !== null && selectedTripIds.includes(vehicle.tripId));

      return matchesSearch && matchesStatus && matchesRoute && matchesTrip;
    });
  }, [query, selectedRouteIds, selectedTripIds, statusFilter, vehicles]);

  useEffect(() => {
    if (
      selectedMapVehicleId &&
      !filteredVehicles.some((vehicle) => vehicle.id === selectedMapVehicleId)
    ) {
      setSelectedMapVehicleId(null);
    }
  }, [filteredVehicles, selectedMapVehicleId]);

  const pageCount = Math.max(1, Math.ceil(totalVehicles / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleVehicles = filteredVehicles;

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('Semua');
    setSelectedRouteIds([]);
    setSelectedTripIds([]);
    setPage(1);
  };

  const toggleRoute = (routeId: string) => {
    setSelectedRouteIds((current) => {
      const next = current.includes(routeId)
        ? current.filter((item) => item !== routeId)
        : [...current, routeId];
      return next;
    });
    setSelectedTripIds([]);
    setPage(1);
  };

  const toggleTrip = (tripId: string) => {
    setSelectedTripIds((current) =>
      current.includes(tripId) ? current.filter((item) => item !== tripId) : [...current, tripId],
    );
    setPage(1);
  };

  const requestError = getFriendlyErrorMessage(
    vehiclesQuery.error ?? vehicleSummaryQuery.error,
    'armada',
  );
  const lastUpdatedLabel = vehiclesQuery.dataUpdatedAt
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(
        new Date(vehiclesQuery.dataUpdatedAt),
      )
    : null;

  return (
    <div className='min-h-screen bg-[#f4f7fb] font-pt-sans text-slate-800 antialiased'>
      <Header />
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
            routesError={routesQuery.isError ? getFriendlyErrorMessage(routesQuery.error, 'rute') : null}
            routesHasNextPage={routesQuery.hasNextPage}
            routesFetchingNextPage={routesQuery.isFetchingNextPage}
            tripsLoading={tripsQuery.isPending}
            tripsError={tripsQuery.isError ? getFriendlyErrorMessage(tripsQuery.error, 'trip') : null}
            tripsHasNextPage={tripsQuery.hasNextPage}
            tripsFetchingNextPage={tripsQuery.isFetchingNextPage}
            operationalCounts={operationalCounts}
            statusFilter={statusFilter}
            tripsDisabled={selectedRouteIds.length === 0}
            onReset={resetFilters}
            onClearRoutes={() => {
              setSelectedRouteIds([]);
              setSelectedTripIds([]);
              setPage(1);
            }}
            onClearTrips={() => {
              setSelectedTripIds([]);
              setPage(1);
            }}
            onSelectLoadedRoutes={() => {
              setSelectedRouteIds(routeOptions.map((route) => route.id));
              setSelectedTripIds([]);
              setPage(1);
            }}
            onSelectLoadedTrips={() => {
              setSelectedTripIds(tripOptions.map((trip) => trip.id));
              setPage(1);
            }}
            onStatusChange={(status) => {
              setStatusFilter(status);
              setPage(1);
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
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            resultCount={filteredVehicles.length}
            isFetching={
              vehiclesQuery.isFetching || vehicleSummaryQuery.isFetching || routesQuery.isFetching || tripsQuery.isFetching
            }
            view={view}
            onViewChange={setView}
          />

          {view !== 'map' && (
            <div className='mb-4 mt-6 flex flex-wrap items-end justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.16em] text-tj-blue'>
                  Pusat kendali · Data MBTA
                </p>
                <h1 className='mt-1 text-2xl font-bold tracking-tight text-tj-ink sm:text-[28px]'>
                  Armada jaringan
                </h1>
                <p className='mt-1 text-sm text-slate-500'>
                  Posisi dan status kendaraan dari API MBTA.
                </p>
              </div>
              <span
                aria-live='polite'
                className={`inline-flex items-center gap-2 text-xs font-medium ${
                  vehiclesQuery.isError
                    ? 'text-amber-700'
                    : 'text-slate-500'
                }`}
              >
                {vehiclesQuery.isFetching ? (
                  <LoadingIndicator className='text-inherit' label='Memperbarui data...' size='small' />
                ) : (
                  <>
                    <svg aria-hidden='true' className='size-4' fill='none' stroke='currentColor' strokeWidth='1.7' viewBox='0 0 24 24'>
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

          {vehiclesQuery.isPending && !hasVehicleData && (
            <section
              aria-label='Memuat daftar armada'
              aria-busy='true'
              className='flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white'
            >
              <LoadingIndicator label='Memuat data armada...' size='large' />
            </section>
          )}

          {vehiclesQuery.isError && !hasVehicleData && (
            <div
              className='rounded-2xl border border-red-200 bg-white px-6 py-14 text-center'
              role='alert'
            >
              <p className='font-semibold text-slate-800'>Data armada gagal dimuat</p>
              <p className='mt-2 text-sm text-slate-500'>{requestError}</p>
              <button
                className='mt-4 rounded-lg bg-tj-blue px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98]'
                onClick={() => void vehiclesQuery.refetch()}
                type='button'
              >
                Coba lagi
              </button>
            </div>
          )}

          {!vehiclesQuery.isPending && hasVehicleData && vehicles.length === 0 && (
            <div className='rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
              <p className='font-semibold text-slate-700'>Tidak ada kendaraan aktif</p>
              <p className='mt-1 text-sm text-slate-500'>
                API MBTA belum mengembalikan data kendaraan.
              </p>
            </div>
          )}

          {!vehiclesQuery.isPending && hasVehicleData && vehicles.length > 0 && (
            <>
              {view === 'map' ? (
                <section
                  className='grid h-[calc(100dvh-190px)] min-h-130 grid-cols-1 grid-rows-[minmax(320px,1fr)_minmax(180px,0.7fr)] gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-1'
                  aria-label='Peta dan kendaraan aktif'
                >
                  <Suspense fallback={<div className='h-full min-h-80 animate-pulse rounded-2xl bg-slate-200' />}>
                    <InteractiveMap
                      className='h-full min-h-0 rounded-2xl'
                      onVehicleDetails={setSelectedVehicle}
                      onVehicleSelect={(vehicle) => setSelectedMapVehicleId(vehicle?.id ?? null)}
                      selectedVehicleId={selectedMapVehicleId}
                      vehicles={filteredVehicles}
                    />
                  </Suspense>
                  <aside
                    className='flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
                    aria-label='Kendaraan aktif'
                  >
                    <div className='border-b border-slate-100 px-5 py-4'>
                      <div className='flex items-center justify-between'>
                        <h2 className='text-lg font-bold tracking-tight text-slate-800'>
                          Kendaraan aktif
                        </h2>
                        <span className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-tj-blue'>
                          {filteredVehicles.length}
                        </span>
                      </div>
                      <p className='mt-1 text-xs text-slate-500'>
                        Pilih kendaraan untuk melihat detail.
                      </p>
                    </div>
                    <div className='min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto'>
                      {visibleVehicles.map((vehicle) => (
                        <button
                          aria-pressed={selectedMapVehicleId === vehicle.id}
                          className={`flex w-full items-start gap-3 px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${selectedMapVehicleId === vehicle.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                          key={vehicle.id}
                          onClick={() => setSelectedMapVehicleId(vehicle.id)}
                          type='button'
                        >
                          <span
                            className='flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700'
                            aria-hidden='true'
                          >
                            <svg
                              className='size-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                              strokeWidth='1.8'
                            >
                              <rect x='5' y='3' width='14' height='17' rx='3' />
                              <path
                                d='M8 7h8v5H8zM8 16h.01M16 16h.01M8 20l-1 2m9-2 1 2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </span>
                          <span className='min-w-0 flex-1'>
                            <span className='block truncate text-sm font-bold text-slate-800'>
                              Armada {vehicle.number}
                            </span>
                            <span className='mt-1 flex flex-wrap gap-1.5'>
                              <span className='rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600'>
                                Rute {vehicle.route}
                              </span>
                              {vehicle.tripId && (
                                <span className='max-w-32 truncate rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500'>
                                  Trip {vehicle.tripId}
                                </span>
                              )}
                            </span>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[vehicle.status]}`}
                            >
                              {vehicle.status}
                            </span>
                            <span className='mt-2 block truncate text-xs text-slate-400'>
                              {vehicle.destination}
                            </span>
                          </span>
                        </button>
                      ))}
                      {filteredVehicles.length === 0 && (
                        <p className='p-6 text-center text-sm text-slate-500'>
                          Tidak ada kendaraan yang cocok.
                        </p>
                      )}
                    </div>
                  </aside>
                </section>
              ) : view === 'grid' ? (
                <section
                  id='armada'
                  className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
                  aria-label='Daftar armada'
                >
                  {visibleVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onDetails={setSelectedVehicle}
                    />
                  ))}
                </section>
              ) : view === 'table' ? (
                <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                  <div className='overflow-x-auto'>
                    <table className='w-full min-w-220 border-collapse text-left text-sm'>
                      <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                        <tr>
                          <th className='px-5 py-4 font-semibold'>Armada</th>
                          <th className='px-5 py-4 font-semibold'>Tujuan / halte</th>
                          <th className='px-5 py-4 font-semibold'>Status</th>
                          <th className='px-5 py-4 font-semibold'>Kecepatan</th>
                          <th className='px-5 py-4 font-semibold'>Kapasitas</th>
                          <th className='px-5 py-4 font-semibold'>Detail</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-100'>
                        {visibleVehicles.map((vehicle) => (
                          <tr className='hover:bg-slate-50/80' key={vehicle.id}>
                            <td className='px-5 py-4'>
                              <span className='font-bold text-slate-800'>{vehicle.number}</span>
                              <span
                                className={`ml-2 rounded px-2 py-1 text-xs font-semibold text-white ${vehicle.routeColor}`}
                              >
                                {vehicle.route}
                              </span>
                            </td>
                            <td className='px-5 py-4'>
                              <p className='font-medium text-slate-700'>{vehicle.destination}</p>
                              <p className='mt-0.5 text-xs text-slate-400'>{vehicle.origin}</p>
                            </td>
                            <td className='px-5 py-4'>
                              <StatusPill status={vehicle.status} />
                            </td>
                            <td className='px-5 py-4'>
                              {vehicle.speedKph === null
                                ? '—'
                                : `${vehicle.speedKph.toFixed(1)} km/jam`}
                            </td>
                            <td className='px-5 py-4'>{vehicle.occupancy}</td>
                            <td className='px-5 py-4'>
                              <button
                                className='font-semibold text-tj-blue hover:underline'
                                onClick={() => setSelectedVehicle(vehicle)}
                                type='button'
                              >
                                Lihat detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {(view === 'map' ? filteredVehicles : visibleVehicles).length === 0 && (
                <div className='mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
                  <p className='font-semibold text-slate-700'>Kendaraan tidak ditemukan</p>
                  <p className='mt-1 text-sm text-slate-500'>
                    Ubah pencarian atau filter untuk melihat kendaraan.
                  </p>
                  <button
                    className='mt-4 rounded-lg bg-tj-blue px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98]'
                    onClick={resetFilters}
                    type='button'
                  >
                    Reset filter
                  </button>
                </div>
              )}

              {view !== 'map' && (
                <Pagination
                  page={currentPage}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  total={totalVehicles}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
      <Footer />

      {selectedVehicle && (
        <VehicleDialog
          vehicle={vehicles.find((vehicle) => vehicle.id === selectedVehicle.id) ?? selectedVehicle}
          onClose={closeVehicleDialog}
        />
      )}
    </div>
  );
}

const statusStyles: Record<VehicleStatus, string> = {
  Bergerak: 'bg-blue-50 text-blue-700',
  Berhenti: 'bg-emerald-50 text-emerald-700',
  Mendekati: 'bg-amber-50 text-amber-700',
  'Tidak diketahui': 'bg-slate-100 text-slate-600',
};

function StatusPill({ status }: { status: VehicleStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function VehicleDialog({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  const openMapUrl =
    vehicle.latitude !== null && vehicle.longitude !== null
      ? `https://www.openstreetmap.org/?mlat=${vehicle.latitude}&mlon=${vehicle.longitude}#map=16/${vehicle.latitude}/${vehicle.longitude}`
      : null;
  const updatedAt = vehicle.updatedAt ? new Date(vehicle.updatedAt) : null;
  const updatedAtLabel =
    updatedAt && !Number.isNaN(updatedAt.getTime())
      ? updatedAt.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' })
      : 'Tidak tersedia';
  const routeDirectionLabel = vehicle.routeDetails.directionDestinations.join(' / ');
  const routeDirectionNames = vehicle.routeDetails.directionNames.join(' / ');
  const accessibilityLabel = (value: number | null) =>
    value === 1 ? 'Ya' : value === 2 ? 'Tidak' : 'Tidak tersedia';
  const detailSections = [
    {
      title: 'Status & posisi',
      fields: [
        ['Label kendaraan', vehicle.number],
        ['ID kendaraan', vehicle.id],
        ['Status saat ini', vehicle.currentStatus ?? 'Tidak tersedia'],
        ['Status', vehicle.status],
        ['Latitude', vehicle.latitude?.toFixed(6) ?? 'Tidak tersedia'],
        ['Longitude', vehicle.longitude?.toFixed(6) ?? 'Tidak tersedia'],
        [
          'Kecepatan',
          vehicle.speedKph === null ? 'Tidak tersedia' : `${vehicle.speedKph.toFixed(1)} km/jam`,
        ],
        ['Arah kendaraan', vehicle.bearing === null ? 'Tidak tersedia' : `${vehicle.bearing}°`],
        ['Urutan halte berikutnya', vehicle.currentStopSequence?.toString() ?? 'Tidak tersedia'],
        ['ID halte saat ini', vehicle.stopId ?? 'Tidak tersedia'],
        ['Halte saat ini', vehicle.origin],
      ],
    },
    {
      title: 'Data rute',
      fields: [
        ['ID rute', vehicle.routeDetails.id ?? 'Tidak tersedia'],
        ['Nama rute', vehicle.routeDetails.longName ?? vehicle.route],
        ['Deskripsi', vehicle.routeDetails.description ?? 'Tidak tersedia'],
        ['Tipe rute MBTA', vehicle.routeDetails.type?.toString() ?? 'Tidak tersedia'],
        ['Arah / tujuan rute', routeDirectionLabel || 'Tidak tersedia'],
        ['Nama arah rute', routeDirectionNames || 'Tidak tersedia'],
      ],
    },
    {
      title: 'Data trip',
      fields: [
        ['ID trip', vehicle.tripDetails.id ?? 'Tidak tersedia'],
        ['Headsign', vehicle.tripDetails.headsign ?? 'Tidak tersedia'],
        ['Nama trip', vehicle.tripDetails.name || 'Tidak tersedia'],
        ['Arah trip', vehicle.tripDetails.directionId?.toString() ?? 'Tidak tersedia'],
        ['ID blok', vehicle.tripDetails.blockId ?? 'Tidak tersedia'],
        ['Akses kursi roda', accessibilityLabel(vehicle.tripDetails.wheelchairAccessible)],
        ['Sepeda diizinkan', accessibilityLabel(vehicle.tripDetails.bikesAllowed)],
        ['Gerbong', vehicle.carriageLabels.join(', ') || 'Tidak tersedia'],
      ],
    },
    {
      title: 'Info lainnya',
      fields: [
        ['Kapasitas', vehicle.occupancy],
        ['Status kapasitas MBTA', vehicle.occupancyStatus ?? 'Tidak tersedia'],
        ['Layanan', vehicle.revenue ?? 'Tidak tersedia'],
        ['Waktu update terakhir', updatedAtLabel],
      ],
    },
  ];

  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4'
      onClick={onClose}
      role='presentation'
    >
      <section
        aria-labelledby='vehicle-dialog-title'
        aria-modal='true'
        className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6'
        onClick={(event) => event.stopPropagation()}
        role='dialog'
        tabIndex={-1}
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-tj-blue'>
              Detail kendaraan · MBTA
            </p>
            <h2 className='mt-1 text-2xl font-bold text-tj-ink' id='vehicle-dialog-title'>
              {vehicle.number} <span className='text-slate-400'>· {vehicle.route}</span>
            </h2>
          </div>
          <button
            aria-label='Tutup detail'
            autoFocus
            className='grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50'
            onClick={onClose}
            type='button'
          >
            ×
          </button>
        </div>
        <div className='mt-5 rounded-xl bg-blue-50 p-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-tj-blue'>
            Tujuan perjalanan
          </p>
          <p className='mt-1 font-semibold text-slate-800'>
            {vehicle.tripDetails.headsign ?? vehicle.destination}
          </p>
          <p className='mt-1 text-sm text-slate-500'>Halte: {vehicle.origin}</p>
        </div>
        {openMapUrl ? (
          <section className='mt-5' aria-label='Peta lokasi kendaraan'>
            <div className='mb-2 flex items-center justify-between gap-3'>
              <h3 className='text-sm font-semibold text-slate-700'>Posisi kendaraan</h3>
              <a
                className='text-xs font-semibold text-tj-blue hover:underline'
                href={openMapUrl}
                rel='noreferrer'
                target='_blank'
              >
                Buka peta
              </a>
            </div>
            <Suspense fallback={<div className='h-64 animate-pulse rounded-2xl bg-slate-200' />}>
              <InteractiveMap
                className='h-64'
                showLegend={false}
                variant='detail'
                vehicles={[vehicle]}
              />
            </Suspense>
          </section>
        ) : (
          <p className='mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500'>
            Koordinat belum tersedia, jadi peta tidak dapat ditampilkan.
          </p>
        )}
        <div className='mt-5 space-y-4'>
          {detailSections.map(({ title, fields }) => (
            <section aria-label={title} key={title}>
              <h3 className='mb-2 text-sm font-semibold text-slate-700'>{title}</h3>
              <dl className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {fields.map(([label, value]) => (
                  <div className='min-w-0 rounded-lg border border-slate-200 px-3 py-2' key={label}>
                    <dt className='text-[11px] text-slate-400'>{label}</dt>
                    <dd className='mt-1 wrap-break-word text-sm font-medium text-slate-700'>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
