import type { QueriesDataService } from '../types';
import { type VehicleQueryKeys, vehicleQueries } from './vehicle';

export type AllQueriesKeys = VehicleQueryKeys;

export const allQueries: QueriesDataService<AllQueriesKeys> = {
  ...vehicleQueries,
};
