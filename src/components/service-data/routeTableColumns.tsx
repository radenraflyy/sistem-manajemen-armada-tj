import type { DataTableColumn } from '@/components/DataTable';
import { ROUTE_TYPE_LABELS } from '@/constants/routes-vehicle';
import type { RouteRow } from '@/types/fleet';

type RouteTripCountQuery = {
  isPending: boolean;
  data?: number | null;
};

export type RouteTableRow = {
  route: RouteRow;
  activeVehicleCount: number | undefined;
  tripCountQuery: RouteTripCountQuery | undefined;
};

export const routeTableColumns: DataTableColumn<RouteTableRow>[] = [
  { key: 'id', header: 'ID rute', cell: ({ route }) => route.shortName },
  { key: 'name', header: 'Nama rute', cell: ({ route }) => route.longName },
  {
    key: 'type',
    header: 'Tipe',
    cell: ({ route }) => (
      <span className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700'>
        {route.type === null
          ? 'Tidak diketahui'
          : (ROUTE_TYPE_LABELS[route.type] ?? `Tipe ${route.type}`)}
      </span>
    ),
  },
  {
    key: 'directions',
    header: 'Arah layanan',
    cell: ({ route }) => route.directionNames.join(' · ') || '—',
  },
  {
    key: 'vehicles',
    header: 'Kendaraan aktif',
    cell: ({ activeVehicleCount }) => activeVehicleCount ?? '—',
    cellClassName: 'font-semibold tabular-nums text-slate-700',
  },
  {
    key: 'trips',
    header: 'Total trip',
    cell: ({ tripCountQuery }) => (tripCountQuery?.isPending ? '…' : (tripCountQuery?.data ?? '—')),
    cellClassName: 'tabular-nums text-slate-700',
  },
  {
    key: 'status',
    header: 'Status',
    cell: ({ activeVehicleCount }) => (
      <span
        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${activeVehicleCount === undefined ? 'bg-slate-100 text-slate-600' : activeVehicleCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
      >
        {activeVehicleCount === undefined
          ? 'Memuat'
          : activeVehicleCount > 0
            ? 'Aktif'
            : 'Tidak terpantau'}
      </span>
    ),
  },
];
