import type { DataTableColumn } from '@/components/DataTable';
import type { TripRow } from '@/types/fleet';

export const tripTableColumns: DataTableColumn<TripRow>[] = [
  {
    key: 'id',
    header: 'ID trip',
    cell: (trip) => trip.id,
    cellClassName: 'font-semibold text-slate-800',
  },
  {
    key: 'route',
    header: 'Rute',
    cell: (trip) => (
      <span className='rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-tj-blue'>
        {trip.routeName}
      </span>
    ),
  },
  { key: 'destination', header: 'Tujuan', cell: (trip) => trip.headsign },
  {
    key: 'direction',
    header: 'Arah',
    cell: (trip) => (trip.directionId === null ? '—' : `Arah ${trip.directionId + 1}`),
  },
  {
    key: 'start',
    header: 'Mulai',
    cell: (trip) => trip.startTime ?? '—',
    cellClassName: 'tabular-nums',
  },
  {
    key: 'end',
    header: 'Selesai',
    cell: (trip) => trip.endTime ?? '—',
    cellClassName: 'tabular-nums',
  },
  {
    key: 'accessibility',
    header: 'Aksesibilitas',
    cell: (trip) =>
      trip.wheelchairAccessible === 1
        ? 'Ramah kursi roda'
        : trip.wheelchairAccessible === 2
          ? 'Tidak tersedia'
          : 'Tidak diketahui',
  },
];
