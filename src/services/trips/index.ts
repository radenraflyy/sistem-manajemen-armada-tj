import { FILTER_OPTIONS_PAGE_SIZE, FLEET_QUERY_STALE_TIME } from '@/constants/fleet';
import useInfiniteQueryApiRequest from '@/hooks/useApiRequest/useInfiniteQueryApiRequest';
import useQueryApiRequest, { apiQueryOptions } from '@/hooks/useApiRequest/useQueryApiRequest';
import {
  getNumber,
  getPageTotal,
  getString,
  parsePage,
  parseVehiclesResponse,
} from '@/services/mbtaApi';
import { tripQueryKeys } from '@/services/queryKeys';
import type { TripOption, TripRow } from '@/types/fleet';

export function routeTripCountQueryOptions(routeId: string) {
  const params = {
    'filter[route]': routeId,
    'fields[trip]': 'route',
    'page[limit]': 1,
    'page[offset]': 0,
  };
  return {
    queryKey: ['routes', 'trip-count', routeId],
    ...apiQueryOptions({
      key: 'trips',
      config: { query: params },
      transform: async (rawPayload) => {
        const payload = parseVehiclesResponse(rawPayload);
        return getPageTotal('trips', params, payload, 0);
      },
    }),
  };
}

export function useTripsPageQuery(
  page: number,
  pageSize: number,
  routeIds: string[],
  enabled = true,
) {
  const offset = (page - 1) * pageSize;
  const params = {
    include: 'route',
    'filter[route]': routeIds.join(','),
    'page[limit]': pageSize,
    'page[offset]': offset,
    sort: 'id',
  };
  return useQueryApiRequest<{ items: TripRow[]; total: number | null; hasNext: boolean }>({
    key: 'trips',
    queryKey: tripQueryKeys.page(page, pageSize, routeIds),
    config: { query: params },
    transform: async (rawPayload) => {
      const payload = parseVehiclesResponse(rawPayload);
      const routeNames = new Map(
        payload.included
          .filter((resource) => resource.type === 'route')
          .map((route) => [route.id, getString(route.attributes?.short_name) ?? route.id]),
      );
      const items = payload.data.map((trip): TripRow => {
        const attributes = trip.attributes ?? {};
        const routeId = trip.relationships?.route?.data?.id ?? null;
        return {
          id: trip.id,
          routeId,
          routeName: routeId ? (routeNames.get(routeId) ?? routeId) : '—',
          headsign:
            getString(attributes.headsign) ?? getString(attributes.name) ?? 'Tujuan tidak tersedia',
          directionId: getNumber(attributes.direction_id),
          startTime: getString(attributes.start_time),
          endTime: getString(attributes.end_time),
          wheelchairAccessible: getNumber(attributes.wheelchair_accessible),
        };
      });
      return {
        items,
        total: await getPageTotal('trips', params, payload, offset),
        hasNext: payload.hasNext || payload.data.length === pageSize,
      };
    },
    options: {
      enabled: enabled && routeIds.length > 0,
      staleTime: FLEET_QUERY_STALE_TIME.tripsPage,
    },
  });
}

export function useTripsInfiniteQuery(routeIds: string[]) {
  const normalizedRouteIds = [...routeIds].sort();

  return useInfiniteQueryApiRequest({
    key: 'trips',
    queryKey: tripQueryKeys.options(normalizedRouteIds),
    initialPageParam: 0,
    enabled: normalizedRouteIds.length > 0,
    staleTime: FLEET_QUERY_STALE_TIME.tripOptions,
    config: (offset: number) => ({
      query: {
        'filter[route]': normalizedRouteIds.join(','),
        'page[limit]': FILTER_OPTIONS_PAGE_SIZE,
        'page[offset]': offset,
        sort: 'id',
      },
    }),
    transform: (response, offset) => {
      const page = parsePage(response, offset, FILTER_OPTIONS_PAGE_SIZE);
      const items: TripOption[] = page.data.map((trip) => {
        const attributes = trip.attributes ?? {};
        const routeId = trip.relationships?.route?.data?.id ?? null;
        const headsign = getString(attributes.headsign);
        const name = getString(attributes.name);
        return {
          id: trip.id,
          label: [trip.id, headsign || name].filter(Boolean).join(' · '),
          routeId,
        };
      });
      return { items, nextOffset: page.nextOffset };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}
