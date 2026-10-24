import { useMemo, useState } from 'react';

import DashboardToolbar from './components/DashboardToolbar';
import Footer from './components/Footer';
import Header from './components/Header';
import Pagination from './components/Pagination';
import Sidebar from './components/Sidebar';
import VehicleCard from './components/VehicleCard';
import { useVehiclesQuery } from './data-service/vehicles';
import type { Vehicle, VehicleStatus } from './data-service/types';

type StatusFilter = 'Semua' | VehicleStatus;

function App() {
  const vehiclesQuery = useVehiclesQuery();
  const hasVehicleData = vehiclesQuery.data !== undefined;
  const vehicles: Vehicle[] = vehiclesQuery.data ?? [];
  const routes = useMemo<string[]>(
    () => [...new Set(vehicles.map((vehicle) => vehicle.route))],
    [vehicles],
  );
  const operationalCounts = useMemo(
    () => ({
      total: vehicles.length,
      moving: vehicles.filter((vehicle) => vehicle.status === 'Bergerak').length,
      stopped: vehicles.filter((vehicle) => vehicle.status === 'Berhenti').length,
      approaching: vehicles.filter((vehicle) => vehicle.status === 'Mendekati').length,
    }),
    [vehicles],
  );
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua');
  const [tripFilter, setTripFilter] = useState('all');
  const [selectedRoutes, setSelectedRoutes] = useState<string[] | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const activeRoutes = selectedRoutes ?? routes;

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [
          vehicle.number,
          vehicle.route,
          vehicle.destination,
          vehicle.origin,
          vehicle.coordinates,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesStatus = statusFilter === 'Semua' || vehicle.status === statusFilter;
      const matchesTrip =
        tripFilter === 'all' ||
        (tripFilter === 'shuttle' ? vehicle.route === 'Shuttle' : vehicle.route !== 'Shuttle');

      return matchesSearch && matchesStatus && matchesTrip && activeRoutes.includes(vehicle.route);
    });
  }, [activeRoutes, query, statusFilter, tripFilter, vehicles]);

  const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleVehicles = filteredVehicles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('Semua');
    setTripFilter('all');
    setSelectedRoutes(null);
    setPage(1);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateStatus = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const toggleRoute = (route: string) => {
    setSelectedRoutes((current) => {
      const selected = current ?? routes;
      return selected.includes(route)
        ? selected.filter((item) => item !== route)
        : [...selected, route];
    });
    setPage(1);
  };

  const focusFirstRoute = () => {
    const firstRoute = routes[0];
    if (!firstRoute) return;
    setSelectedRoutes((current) => {
      const selected = current ?? routes;
      return selected.length === 1 && selected[0] === firstRoute ? routes : [firstRoute];
    });
    setPage(1);
  };

  const exportLog = () => {
    const rows = [
      ['Nomor Armada', 'Rute', 'Status', 'Tujuan', 'Kecepatan', 'Kapasitas'],
      ...filteredVehicles.map((vehicle) => [
        vehicle.number,
        vehicle.route,
        vehicle.status,
        vehicle.destination,
        `${vehicle.speed} km/jam`,
        `${vehicle.capacity}%`,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'log-armada.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className='min-h-screen bg-[#f4f7fb] font-pt-sans text-slate-800 antialiased'>
      <Header />
      <div className='mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 content-start lg:grid-cols-[300px_minmax(0,1fr)]'>
        <Sidebar
          routes={routes}
          operationalCounts={operationalCounts}
          selectedRoutes={activeRoutes}
          statusFilter={statusFilter}
          tripFilter={tripFilter}
          onReset={resetFilters}
          onSelectAllRoutes={() => setSelectedRoutes(routes)}
          onFocusRoute={focusFirstRoute}
          onStatusChange={updateStatus}
          onTripFilterChange={(value) => {
            setTripFilter(value);
            setPage(1);
          }}
          onRouteToggle={toggleRoute}
          onExport={exportLog}
        />

        <main className='min-w-0 p-4 sm:p-6 lg:p-7'>
          <DashboardToolbar
            query={query}
            onQueryChange={updateQuery}
            resultCount={filteredVehicles.length}
            view={view}
            onViewChange={setView}
          />

          <div className='mb-4 mt-6 flex flex-wrap items-end justify-between gap-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.16em] text-tj-blue'>
                Pusat kendali
              </p>
              <h1 className='mt-1 text-2xl font-bold tracking-tight text-tj-ink sm:text-[28px]'>
                Armada jaringan
              </h1>
              <p className='mt-1 text-sm text-slate-500'>
                Pantau posisi dan status operasional armada secara langsung.
              </p>
            </div>
            <span
              aria-live='polite'
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                vehiclesQuery.isError
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  vehiclesQuery.isFetching ? 'animate-pulse bg-blue-500' : 'bg-current'
                }`}
              />
              {vehiclesQuery.isFetching
                ? 'Memperbarui data...'
                : vehiclesQuery.isError
                  ? 'Menampilkan data tersimpan'
                  : vehiclesQuery.isStale
                    ? 'Data mungkin sudah usang'
                    : 'Data tersinkronisasi'}
            </span>
          </div>

          {vehiclesQuery.isError && hasVehicleData && (
            <div
              className='mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'
              role='alert'
            >
              <span>
                Gagal memperbarui armada. Data sebelumnya tetap ditampilkan.
                {vehiclesQuery.error instanceof Error ? ` ${vehiclesQuery.error.message}` : ''}
              </span>
              <button
                className='font-semibold underline underline-offset-2'
                onClick={() => void vehiclesQuery.refetch()}
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
              className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
            >
              {[0, 1, 2].map((item) => (
                <div
                  className='h-67.5 animate-pulse rounded-2xl border border-slate-200 bg-white'
                  key={item}
                />
              ))}
            </section>
          )}

          {vehiclesQuery.isError && !hasVehicleData && (
            <div
              className='rounded-2xl border border-red-200 bg-white px-6 py-14 text-center'
              role='alert'
            >
              <p className='font-semibold text-slate-800'>Data armada gagal dimuat</p>
              <p className='mt-2 text-sm text-slate-500'>
                {vehiclesQuery.error instanceof Error
                  ? vehiclesQuery.error.message
                  : 'Terjadi kesalahan saat menghubungi server.'}
              </p>
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
              <p className='font-semibold text-slate-700'>Belum ada data armada</p>
              <p className='mt-1 text-sm text-slate-500'>
                Data armada akan muncul di sini setelah tersedia.
              </p>
            </div>
          )}

          {!vehiclesQuery.isPending && hasVehicleData && vehicles.length > 0 && (view === 'grid' ? (
            <section
              id='armada'
              className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
              aria-label='Daftar armada'
            >
              {visibleVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onDetails={setSelectedVehicle} />
              ))}
            </section>
          ) : (
            <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
              <div className='overflow-x-auto'>
                <table className='w-full min-w-180 border-collapse text-left text-sm'>
                  <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                    <tr>
                      <th className='px-5 py-4 font-semibold'>Armada</th>
                      <th className='px-5 py-4 font-semibold'>Tujuan</th>
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
                          <span className='font-bold text-slate-800'>TJ—{vehicle.number}</span>
                          <span className='ml-2 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800'>
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
                        <td className='px-5 py-4'>{vehicle.speed} km/jam</td>
                        <td className='px-5 py-4'>{vehicle.capacity}%</td>
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
                    {visibleVehicles.length === 0 && (
                      <tr>
                        <td className='px-5 py-16 text-center text-slate-500' colSpan={6}>
                          Tidak ada armada yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {!vehiclesQuery.isPending && hasVehicleData && vehicles.length > 0 && view === 'grid' && visibleVehicles.length === 0 && (
            <div className='rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
              <p className='font-semibold text-slate-700'>Armada tidak ditemukan</p>
              <p className='mt-1 text-sm text-slate-500'>
                Coba ubah kata pencarian atau reset filter.
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

          {!vehiclesQuery.isPending && hasVehicleData && vehicles.length > 0 && (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              pageSize={pageSize}
              total={filteredVehicles.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </main>
      </div>
      <Footer />

      {selectedVehicle && (
        <VehicleDialog vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: VehicleStatus }) {
  const style =
    status === 'Bergerak'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : status === 'Mendekati'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      <span className='size-1.5 rounded-full bg-current' />
      {status === 'Berhenti'
        ? 'Berhenti di halte'
        : status === 'Mendekati'
          ? 'Mendekati halte'
          : 'Sedang berjalan'}
    </span>
  );
}

function VehicleDialog({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4'
      onClick={onClose}
      role='presentation'
    >
      <section
        aria-labelledby='vehicle-dialog-title'
        aria-modal='true'
        className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl'
        onClick={(event) => event.stopPropagation()}
        role='dialog'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-tj-blue'>
              Detail armada
            </p>
            <h2 className='mt-1 text-2xl font-bold text-tj-ink' id='vehicle-dialog-title'>
              TJ—{vehicle.number}
            </h2>
          </div>
          <button
            aria-label='Tutup detail'
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
          <p className='mt-1 font-semibold text-slate-800'>{vehicle.destination}</p>
          <p className='mt-1 text-sm text-slate-500'>{vehicle.origin}</p>
        </div>
        <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {[
            ['Status', vehicle.status],
            ['Kecepatan', `${vehicle.speed} km/jam`],
            ['Kapasitas', `${vehicle.capacity}%`],
            ['Arah', `${vehicle.direction}°`],
          ].map(([label, value]) => (
            <div className='rounded-xl border border-slate-200 p-3' key={label}>
              <p className='text-xs text-slate-400'>{label}</p>
              <p className='mt-1 text-sm font-semibold text-slate-700'>{value}</p>
            </div>
          ))}
        </div>
        <p className='mt-4 text-xs text-slate-400'>Koordinat terakhir: {vehicle.coordinates}</p>
      </section>
    </div>
  );
}

export default App;
