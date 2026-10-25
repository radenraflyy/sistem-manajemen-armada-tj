import type { Vehicle } from '../types/fleet';

type VehicleCardProps = {
  vehicle: Vehicle;
  onDetails: (vehicle: Vehicle) => void;
};

const statusStyles: Record<Vehicle['status'], string> = {
  Berjalan: 'bg-blue-50 text-blue-700',
  Berhenti: 'bg-emerald-50 text-emerald-700',
  Mendekati: 'bg-amber-50 text-amber-700',
  'Tidak diketahui': 'bg-slate-100 text-slate-600',
};

const updatedLabel = (updatedAt: string | null) => {
  if (!updatedAt) return 'Waktu pembaruan tidak tersedia';
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime())
    ? 'Waktu pembaruan tidak tersedia'
    : `Diperbarui ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
};

const VehicleCard = ({ vehicle, onDetails }: VehicleCardProps) => (
  <article className='flex min-h-67.5 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgb(15_23_42/4%)] transition-shadow hover:shadow-md sm:p-5'>
    <div className='flex items-start justify-between gap-2'>
      <div className='flex min-w-0 items-center gap-2.5'>
        <span
          className={`inline-flex min-h-7 min-w-9 shrink-0 items-center justify-center rounded-md px-1.5 text-[10px] font-bold text-white ${vehicle.routeColor}`}
        >
          {vehicle.route}
        </span>
        <h2 className='truncate text-base font-bold tracking-tight text-slate-800'>
          {vehicle.number}
        </h2>
      </div>
      <span
        className={`inline-flex max-w-34.5 shrink-0 items-center rounded-md px-2.5 py-1.5 text-[10px] font-semibold leading-tight ${statusStyles[vehicle.status]}`}
      >
        {vehicle.status}
      </span>
    </div>

    <div className='mt-4 min-h-12'>
      <p className='text-xs leading-relaxed text-slate-500'>
        Tujuan: <strong className='font-semibold text-slate-700'>{vehicle.destination}</strong>
      </p>
      <p className='mt-1 text-xs leading-relaxed text-slate-500'>Halte: {vehicle.origin}</p>
    </div>

    <div className='mt-4 flex items-center justify-between gap-2 text-[11px]'>
      <span className='font-medium text-slate-500'>Kapasitas</span>
      <span className='truncate text-right font-semibold text-tj-blue'>{vehicle.occupancy}</span>
    </div>
    <div className='mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 px-1 py-3'>
      <div className='px-2'>
        <p className='text-[10px] text-slate-400'>Kecepatan</p>
        <p className='mt-1 whitespace-nowrap text-xs font-semibold text-slate-700'>
          {vehicle.speedKph === null ? '—' : `${vehicle.speedKph.toFixed(1)} km/jam`}
        </p>
      </div>
      <div className='px-2'>
        <p className='text-[10px] text-slate-400'>Arah</p>
        <p className='mt-1 whitespace-nowrap text-xs font-semibold text-slate-700'>
          {vehicle.bearing === null ? '—' : `${vehicle.bearing}°`}
        </p>
      </div>
      <div className='min-w-0 px-2'>
        <p className='text-[10px] text-slate-400'>Trip</p>
        <p className='mt-1 truncate text-xs font-semibold text-slate-700'>
          {vehicle.tripId ?? '—'}
        </p>
      </div>
    </div>

    <div className='mt-auto flex items-center justify-between gap-2 pt-4'>
      <span className='truncate text-[11px] text-slate-400' title={vehicle.coordinates}>
        {vehicle.coordinates}
      </span>
      <button
        className='shrink-0 rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] font-semibold text-tj-blue transition hover:bg-blue-50 active:scale-[0.98]'
        onClick={() => onDetails(vehicle)}
        type='button'
      >
        Detail <span aria-hidden='true'>›</span>
      </button>
    </div>
    <p className='mt-2 text-[10px] text-slate-400'>{updatedLabel(vehicle.updatedAt)}</p>
  </article>
);

export default VehicleCard;
