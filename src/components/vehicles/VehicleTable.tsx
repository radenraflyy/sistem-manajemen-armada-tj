import DataTable, { type DataTableColumn } from '@/components/DataTable';
import type { Vehicle, VehicleStatus } from '@/types/fleet';
import { formatSpeedKph } from '@/utils/formatters';

type VehicleTableProps = {
  vehicles: Vehicle[];
  onDetails: (vehicle: Vehicle) => void;
};

const statusStyles: Record<VehicleStatus, string> = {
  Berjalan: 'bg-blue-50 text-blue-700',
  Berhenti: 'bg-emerald-50 text-emerald-700',
  Mendekati: 'bg-amber-50 text-amber-700',
  'Tidak diketahui': 'bg-slate-100 text-slate-600',
};

const VehicleTable = ({ vehicles, onDetails }: VehicleTableProps) => {
  const columns: DataTableColumn<Vehicle>[] = [
    {
      key: 'vehicle',
      header: 'Armada',
      cell: (vehicle) => (
        <>
          <span className='font-bold text-slate-800'>{vehicle.number}</span>
          <span
            className={`ml-2 rounded px-2 py-1 text-xs font-semibold text-white ${vehicle.routeColor}`}
          >
            {vehicle.route}
          </span>
        </>
      ),
    },
    {
      key: 'destination',
      header: 'Tujuan / halte',
      cell: (vehicle) => (
        <>
          <p className='font-medium text-slate-700'>{vehicle.destination}</p>
          <p className='mt-0.5 text-xs text-slate-400'>{vehicle.origin}</p>
        </>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (vehicle) => (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[vehicle.status]}`}
        >
          {vehicle.status}
        </span>
      ),
    },
    {
      key: 'speed',
      header: 'Kecepatan',
      cell: (vehicle) => formatSpeedKph(vehicle.speedKph, '—'),
    },
    { key: 'occupancy', header: 'Kapasitas', cell: (vehicle) => vehicle.occupancy },
    {
      key: 'details',
      header: 'Detail',
      cell: (vehicle) => (
        <button
          className='font-semibold text-tj-blue hover:underline'
          onClick={() => onDetails(vehicle)}
          type='button'
        >
          Lihat detail
        </button>
      ),
    },
  ];

  return (
    <DataTable
      rows={vehicles}
      columns={columns}
      getRowKey={(vehicle) => vehicle.id}
      minWidthClass='min-w-220'
      headerCellClassName='px-5 py-4 font-semibold'
    />
  );
};

export default VehicleTable;
