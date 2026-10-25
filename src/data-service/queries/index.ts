import type { QueriesDataService } from '../../types/api';
import { type RouteQueryKeys, routeQueries } from './routes-vehicle';
import { type TripQueryKeys, tripQueries } from './trips';
import { type VehicleQueryKeys, vehicleQueries } from './vehicles';

export type AllQueriesKeys = VehicleQueryKeys | RouteQueryKeys | TripQueryKeys;

export const allQueries: QueriesDataService<AllQueriesKeys> = {
  ...vehicleQueries,
  ...routeQueries,
  ...tripQueries,
};
