import { type RouteQueryKeys, routeQueries } from '@/data-service/queries/routes-vehicle';
import { type TripQueryKeys, tripQueries } from '@/data-service/queries/trips';
import { type VehicleQueryKeys, vehicleQueries } from '@/data-service/queries/vehicles';
import type { QueriesDataService } from '@/types/api';

export type AllQueriesKeys = VehicleQueryKeys | RouteQueryKeys | TripQueryKeys;

export const allQueries: QueriesDataService<AllQueriesKeys> = {
  ...vehicleQueries,
  ...routeQueries,
  ...tripQueries,
};
