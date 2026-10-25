import type { RouteRow, TripRow } from '../../types/fleet';
import DataTable from '../DataTable';
import { type RouteTableRow, routeTableColumns } from './routeTableColumns';
import { tripTableColumns } from './tripTableColumns';

type RouteTripCountQuery = {
  isPending: boolean;
  data?: number | null;
};

type ServiceDataTableProps = {
  kind: 'routes' | 'trips';
  routes: RouteRow[];
  trips: TripRow[];
  vehiclesByRoute?: Record<string, number>;
  routeTripCounts: RouteTripCountQuery[];
  isEmpty: boolean;
};

const tableClassName = 'rounded-none border-0 bg-transparent shadow-none';

const ServiceDataTable = ({
  kind,
  routes,
  trips,
  vehiclesByRoute,
  routeTripCounts,
  isEmpty,
}: ServiceDataTableProps) => {
  const routeRows: RouteTableRow[] = routes.map((route, index) => ({
    route,
    activeVehicleCount: vehiclesByRoute?.[route.id],
    tripCountQuery: routeTripCounts[index],
  }));

  return (
    <>
      {kind === 'routes' ? (
        <DataTable
          rows={routeRows}
          columns={routeTableColumns}
          getRowKey={({ route }) => route.id}
          minWidthClass='min-w-[1080px]'
          className={tableClassName}
        />
      ) : (
        <DataTable
          rows={trips}
          columns={tripTableColumns}
          getRowKey={(trip) => trip.id}
          minWidthClass='min-w-[820px]'
          className={tableClassName}
        />
      )}
      {isEmpty && (
        <p className='px-6 py-16 text-center text-sm text-slate-500'>
          Tidak ada data yang cocok di halaman ini.
        </p>
      )}
    </>
  );
};

export default ServiceDataTable;
