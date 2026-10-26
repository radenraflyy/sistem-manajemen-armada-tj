import { Suspense, lazy, useEffect } from 'react';

import LoadingIndicator from '@/components/LoadingIndicator';
import type { Vehicle } from '@/types/fleet';

const InteractiveMap = lazy(() => import('@/components/InteractiveMap'));

const VehicleDetailModal = ({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) => {
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
            <Suspense
              fallback={
                <div className='grid h-64 place-items-center rounded-2xl bg-slate-50'>
                  <LoadingIndicator label='Memuat peta lokasi...' size='small' />
                </div>
              }
            >
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
};

export default VehicleDetailModal;
