import type { QueriesDataService } from '@/types/api';

export type VehicleQueryKeys = 'vehicles' | 'vehicles-detail';

export const vehicleQueries: QueriesDataService<VehicleQueryKeys> = {
  vehicles: 'vehicles',
  'vehicles-detail': 'vehicles/:id',
};
