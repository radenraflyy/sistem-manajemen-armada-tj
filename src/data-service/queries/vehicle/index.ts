import type { QueriesDataService } from "../../types";

export type VehicleQueryKeys = 'vehicles' | 'vehicle-detail';

export const vehicleQueries: QueriesDataService<VehicleQueryKeys> = {
  vehicles: 'vehicles',
  'vehicle-detail': 'vehicle/:id',
};