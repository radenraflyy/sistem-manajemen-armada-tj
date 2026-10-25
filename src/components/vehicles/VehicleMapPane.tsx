import { Suspense, lazy } from 'react';

import type { Vehicle, VehicleStatus } from '../../types/fleet';
import LoadingIndicator from '../LoadingIndicator';

const InteractiveMap = lazy(() => import('../InteractiveMap'));

const statusStyles: Record<VehicleStatus, string> = {
  Berjalan: 'bg-blue-50 text-blue-700',
  Berhenti: 'bg-emerald-50 text-emerald-700',
  Mendekati: 'bg-amber-50 text-amber-700',
  'Tidak diketahui': 'bg-slate-100 text-slate-600',
};

type VehicleMapPaneProps = {
  vehicles: Vehicle[];
  vehicleCount: number;
  isFetching: boolean;
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicleId: string | null) => void;
  onVehicleDetails: (vehicle: Vehicle) => void;
};

const VehicleMapPane = ({
  vehicles,
  vehicleCount,
  isFetching,
  selectedVehicleId,
  onVehicleSelect,
  onVehicleDetails,
}: VehicleMapPaneProps) => (
  <section
    className='grid h-[calc(100dvh-190px)] min-h-130 grid-cols-1 grid-rows-[minmax(320px,1fr)_minmax(180px,0.7fr)] gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-1'
    aria-label='Peta dan kendaraan aktif'
  >
    <Suspense
      fallback={
        <div className='grid h-full min-h-80 place-items-center rounded-2xl bg-white'>
          <LoadingIndicator label='Memuat peta...' size='large' />
        </div>
      }
    >
      <InteractiveMap
        className='h-full min-h-0 rounded-2xl'
        onVehicleDetails={onVehicleDetails}
        onVehicleSelect={(vehicle) => onVehicleSelect(vehicle?.id ?? null)}
        selectedVehicleId={selectedVehicleId}
        vehicles={vehicles}
      />
    </Suspense>
    <aside
      className='flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
      aria-label='Kendaraan aktif'
    >
      <div className='border-b border-slate-100 px-5 py-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-bold tracking-tight text-slate-800'>Kendaraan aktif</h2>
          <span className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-tj-blue'>
            {vehicleCount}
          </span>
        </div>
        <p className='mt-1 text-xs text-slate-500'>Pilih kendaraan untuk melihat detail.</p>
      </div>
      <div
        aria-busy={isFetching}
        className='min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto'
      >
        {vehicles.map((vehicle) => (
          <button
            aria-pressed={selectedVehicleId === vehicle.id}
            className={`flex w-full items-start gap-3 px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${selectedVehicleId === vehicle.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            key={vehicle.id}
            onClick={() => onVehicleSelect(vehicle.id)}
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
        {vehicles.length === 0 && (
          <p className='p-6 text-center text-sm text-slate-500'>Tidak ada kendaraan yang cocok.</p>
        )}
      </div>
    </aside>
  </section>
);

export default VehicleMapPane;
