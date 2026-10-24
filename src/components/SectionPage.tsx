import { useMemo, useState } from 'react';

import {
  useRoutesCountQuery,
  useRoutesPageQuery,
  useRouteIdsQuery,
  useTripsCountQuery,
  useTripsPageQuery,
} from '../data-service/queries/vehicle';
import Footer from './Footer';
import Header from './Header';
import LoadingIndicator from './LoadingIndicator';
import Pagination from './Pagination';
import { getFriendlyErrorMessage } from '../utils/getFriendlyErrorMessage';

type SectionPageProps = {
  kind: 'routes' | 'trips';
  title: string;
  description: string;
};

const routeTypeLabels: Record<number, string> = {
  0: 'Light rail',
  1: 'Subway',
  2: 'Commuter rail',
  3: 'Bus',
  4: 'Ferry',
};

const SectionPage = ({ kind, title, description }: SectionPageProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const isRoutes = kind === 'routes';
  const routeIdsQuery = useRouteIdsQuery(!isRoutes);
  const routeIds = routeIdsQuery.data ?? [];
  const routesPage = useRoutesPageQuery(page, pageSize, isRoutes);
  const tripsPage = useTripsPageQuery(page, pageSize, routeIds, !isRoutes && routeIdsQuery.isSuccess);
  const routesCount = useRoutesCountQuery(isRoutes);
  const tripsCount = useTripsCountQuery(routeIds, !isRoutes && routeIdsQuery.isSuccess);
  const isLoading = isRoutes
    ? routesPage.isPending || routesCount.isPending
    : routeIdsQuery.isPending || tripsPage.isPending || tripsCount.isPending;
  const error = isRoutes
    ? routesPage.error ?? routesCount.error
    : routeIdsQuery.error ?? tripsPage.error ?? tripsCount.error;
  const retry = () => {
    if (isRoutes) {
      void routesPage.refetch();
      void routesCount.refetch();
    } else {
      if (routeIdsQuery.isError) void routeIdsQuery.refetch();
      void tripsPage.refetch();
      void tripsCount.refetch();
    }
  };
  const total = isRoutes ? routesCount.data ?? 0 : tripsCount.data ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const routeRows = routesPage.data ?? [];
  const tripRows = tripsPage.data ?? [];
  const filteredRouteRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return routeRows;
    return routeRows.filter((row) =>
      [row.id, row.shortName, row.longName, ...row.directionNames]
        .some((value) => value.toLocaleLowerCase().includes(term)),
    );
  }, [routeRows, search]);
  const filteredTripRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return tripRows;
    return tripRows.filter((row) =>
      [row.id, row.routeId ?? '', row.routeName, row.headsign]
        .some((value) => value.toLocaleLowerCase().includes(term)),
    );
  }, [search, tripRows]);
  const filteredRows = isRoutes ? filteredRouteRows : filteredTripRows;

  const retryMessage = error ? getFriendlyErrorMessage(error, isRoutes ? 'rute' : 'trip') : null;

  return (
    <div className='flex min-h-screen flex-col bg-[#f4f7fb] font-pt-sans text-slate-800 antialiased'>
      <Header />
      <main className='mx-auto w-full max-w-[1600px] flex-1 px-5 py-7 sm:px-8 lg:px-10'>
        <div className='mb-5 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-tj-blue'>
              Pusat kendali · Data MBTA
            </p>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-tj-ink'>{title}</h1>
            <p className='mt-1 text-sm text-slate-500'>{description}</p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm'>
            <span className='font-bold text-slate-800'>{total.toLocaleString('id-ID')}</span>
            <span className='ml-2 text-slate-500'>{isRoutes ? 'rute terdaftar' : 'trip terdaftar'}</span>
          </div>
        </div>

        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4'>
            <label className='flex h-10 min-w-60 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 sm:max-w-md'>
              <svg aria-hidden='true' className='size-4' fill='none' stroke='currentColor' strokeWidth='1.8' viewBox='0 0 24 24'>
                <circle cx='11' cy='11' r='7' />
                <path d='m16 16 4 4' />
              </svg>
              <input
                className='w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400'
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isRoutes ? 'Cari nama atau ID rute...' : 'Cari trip, rute, atau tujuan...'}
                type='search'
                value={search}
              />
            </label>
            <span className='text-xs text-slate-500'>Pencarian pada halaman yang sedang dibuka</span>
          </div>

          {isLoading ? (
            <div aria-busy='true' className='flex min-h-80 items-center justify-center'>
              <LoadingIndicator label={`Memuat data ${isRoutes ? 'rute' : 'trip'}...`} size='large' />
            </div>
          ) : error ? (
            <div className='px-6 py-16 text-center' role='alert'>
              <p className='font-semibold text-slate-800'>Data gagal dimuat</p>
              <p className='mt-2 text-sm text-slate-500'>{retryMessage}</p>
              <button className='mt-4 rounded-lg bg-tj-blue px-4 py-2 text-sm font-semibold text-white' onClick={retry} type='button'>
                Coba lagi
              </button>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                {isRoutes ? (
                  <table className='w-full min-w-[760px] text-left text-sm'>
                    <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                      <tr>
                        <th className='px-5 py-3.5 font-semibold'>ID rute</th>
                        <th className='px-5 py-3.5 font-semibold'>Nama rute</th>
                        <th className='px-5 py-3.5 font-semibold'>Tipe</th>
                        <th className='px-5 py-3.5 font-semibold'>Warna</th>
                        <th className='px-5 py-3.5 font-semibold'>Arah layanan</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                      {(filteredRows as NonNullable<typeof routesPage.data>).map((route) => (
                        <tr className='hover:bg-slate-50/80' key={route.id}>
                          <td className='px-5 py-4 font-semibold text-slate-800'>{route.shortName}</td>
                          <td className='px-5 py-4 text-slate-600'>{route.longName}</td>
                          <td className='px-5 py-4'>
                            <span className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                              {route.type === null ? 'Tidak diketahui' : routeTypeLabels[route.type] ?? `Tipe ${route.type}`}
                            </span>
                          </td>
                          <td className='px-5 py-4'>
                            {route.color ? <span className='inline-flex items-center gap-2 text-xs text-slate-600'><span className='size-3 rounded-full border border-black/10' style={{ backgroundColor: route.color }} />{route.color.toUpperCase()}</span> : '—'}
                          </td>
                          <td className='px-5 py-4 text-slate-500'>{route.directionNames.join(' / ') || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className='w-full min-w-[820px] text-left text-sm'>
                    <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                      <tr>
                        <th className='px-5 py-3.5 font-semibold'>ID trip</th>
                        <th className='px-5 py-3.5 font-semibold'>Rute</th>
                        <th className='px-5 py-3.5 font-semibold'>Tujuan</th>
                        <th className='px-5 py-3.5 font-semibold'>Arah</th>
                        <th className='px-5 py-3.5 font-semibold'>Mulai</th>
                        <th className='px-5 py-3.5 font-semibold'>Selesai</th>
                        <th className='px-5 py-3.5 font-semibold'>Aksesibilitas</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                      {(filteredRows as NonNullable<typeof tripsPage.data>).map((trip) => (
                        <tr className='hover:bg-slate-50/80' key={trip.id}>
                          <td className='px-5 py-4 font-semibold text-slate-800'>{trip.id}</td>
                          <td className='px-5 py-4'><span className='rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-tj-blue'>{trip.routeName}</span></td>
                          <td className='px-5 py-4 text-slate-600'>{trip.headsign}</td>
                          <td className='px-5 py-4 text-slate-600'>{trip.directionId === null ? '—' : `Arah ${trip.directionId + 1}`}</td>
                          <td className='px-5 py-4 tabular-nums text-slate-600'>{trip.startTime ?? '—'}</td>
                          <td className='px-5 py-4 tabular-nums text-slate-600'>{trip.endTime ?? '—'}</td>
                          <td className='px-5 py-4 text-slate-600'>{trip.wheelchairAccessible === 1 ? 'Ramah kursi roda' : trip.wheelchairAccessible === 2 ? 'Tidak tersedia' : 'Tidak diketahui'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {filteredRows.length === 0 && (
                  <p className='px-6 py-16 text-center text-sm text-slate-500'>Tidak ada data yang cocok di halaman ini.</p>
                )}
              </div>
              <Pagination
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              />
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SectionPage;
