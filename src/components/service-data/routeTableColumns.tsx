import { ROUTE_TYPE_LABELS } from '../../constants/routes-vehicle';
import type { RouteRow } from '../../types/fleet';
import type { DataTableColumn } from '../DataTable';

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
    key: 'color',
    header: 'Warna',
    cell: ({ route }) =>
      route.color ? (
        <span className='inline-flex items-center gap-2 text-xs text-slate-600'>
          <span
            aria-label={`Warna ${route.color}`}
            className='size-4 rounded-full border border-black/10'
            style={{ backgroundColor: route.color }}
          />
          {route.color.toUpperCase()}
        </span>
      ) : (
        '—'
      ),
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
