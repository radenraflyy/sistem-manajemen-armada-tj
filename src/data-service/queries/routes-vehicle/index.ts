import type { QueriesDataService } from '@/types/api';

export type RouteQueryKeys = 'routes' | 'routes-detail';

export const routeQueries: QueriesDataService<RouteQueryKeys> = {
  routes: 'routes',
  'routes-detail': 'routes/:id',
};
