import type { Vehicle } from '../../types/fleet';
import VehicleCard from '../VehicleCard';

type VehicleGridProps = {
  vehicles: Vehicle[];
  onDetails: (vehicle: Vehicle) => void;
};

const VehicleGrid = ({ vehicles, onDetails }: VehicleGridProps) => (
  <section
    id='armada'
    aria-label='Daftar armada'
    className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
  >
    {vehicles.map((vehicle) => (
      <VehicleCard key={vehicle.id} vehicle={vehicle} onDetails={onDetails} />
    ))}
  </section>
);

export default VehicleGrid;
