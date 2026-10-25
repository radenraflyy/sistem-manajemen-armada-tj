import type { QueriesDataService } from '@/types/api';

export type TripQueryKeys = 'trips' | 'trips-detail';

export const tripQueries: QueriesDataService<TripQueryKeys> = {
  trips: 'trips',
  'trips-detail': 'trips/:id',
};
