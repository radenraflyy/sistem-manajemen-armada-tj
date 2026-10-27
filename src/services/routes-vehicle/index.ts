import {
  FILTER_OPTIONS_PAGE_SIZE,
  FLEET_API_PAGE_SIZE,
  FLEET_QUERY_STALE_TIME,
} from '@/constants/fleet';
import useInfiniteQueryApiRequest from '@/hooks/useApiRequest/useInfiniteQueryApiRequest';
import useQueryApiRequest from '@/hooks/useApiRequest/useQueryApiRequest';
import {
  getNumber,
  getPageTotal,
  getString,
  parsePage,
  parseVehiclesResponse,
} from '@/services/mbtaApi';
import { routeQueryKeys } from '@/services/queryKeys';
import type { RouteOption, RouteRow } from '@/types/fleet';

export function useRouteIdsQuery(enabled = true) {
  return useQueryApiRequest<string[]>({
    key: 'routes',
    queryKey: routeQueryKeys.ids(),
    config: {
      query: {
        'fields[route]': 'short_name',
        'page[limit]': FLEET_API_PAGE_SIZE,
        'page[offset]': 0,
      },
    },
    transform: (response) => parseVehiclesResponse(response).data.map((route) => route.id),
    options: {
      enabled,
      staleTime: FLEET_QUERY_STALE_TIME.routeOptions,
    },
  });
}

export function useRoutesPageQuery(page: number, pageSize: number, enabled = true) {
  const offset = (page - 1) * pageSize;
  const params = {
    'page[limit]': pageSize,
    'page[offset]': offset,
    sort: 'short_name',
  };
  return useQueryApiRequest<{ items: RouteRow[]; total: number | null; hasNext: boolean }>({
    key: 'routes',
    queryKey: routeQueryKeys.page(page, pageSize),
    config: { query: params },
    transform: async (rawPayload) => {
      const payload = parseVehiclesResponse(rawPayload);
      const items = payload.data.map((route): RouteRow => {
        const attributes = route.attributes ?? {};
        const rawColor = getString(attributes.color);
        return {
          id: route.id,
          shortName: getString(attributes.short_name) ?? route.id,
          longName: getString(attributes.long_name) ?? 'Nama rute tidak tersedia',
          type: getNumber(attributes.type),
          color: rawColor && /^[\da-f]{6}$/i.test(rawColor) ? `#${rawColor}` : null,
          directionNames: Array.isArray(attributes.direction_names)
            ? attributes.direction_names.filter((name): name is string => typeof name === 'string')
            : [],
        };
      });
      return {
        items,
        total: await getPageTotal('routes', params, payload, offset),
        hasNext: payload.hasNext || payload.data.length === pageSize,
      };
    },
    options: { enabled, staleTime: FLEET_QUERY_STALE_TIME.routesPage },
  });
}

export function useRoutesInfiniteQuery(enabled = true) {
  return useInfiniteQueryApiRequest({
    key: 'routes',
    queryKey: routeQueryKeys.options(),
    initialPageParam: 0,
    enabled,
    staleTime: FLEET_QUERY_STALE_TIME.routeOptions,
    config: (offset: number) => ({
      query: {
        'page[limit]': FILTER_OPTIONS_PAGE_SIZE,
        'page[offset]': offset,
        'fields[route]': 'short_name,long_name,color',
        sort: 'short_name',
      },
    }),
    transform: (response, offset) => {
      const page = parsePage(response, offset, FILTER_OPTIONS_PAGE_SIZE);
      const items: RouteOption[] = page.data.map((route) => {
        const attributes = route.attributes ?? {};
        const shortName = getString(attributes.short_name) ?? '';
        const rawColor = getString(attributes.color);
        return {
          id: route.id,
          shortName,
          label: shortName || getString(attributes.long_name) || route.id,
          longName: getString(attributes.long_name) ?? '',
          color: rawColor && /^[\da-f]{6}$/i.test(rawColor) ? `#${rawColor}` : null,
        };
      });
      return { items, nextOffset: page.nextOffset };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}
