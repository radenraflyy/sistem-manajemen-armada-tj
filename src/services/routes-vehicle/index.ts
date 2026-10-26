import { useInfiniteQuery } from '@tanstack/react-query';

import {
  FILTER_OPTIONS_PAGE_SIZE,
  FLEET_API_PAGE_SIZE,
  FLEET_QUERY_STALE_TIME,
} from '@/constants/fleet';
import { requestApiData } from '@/data-service/apiClient';
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

async function getRoutesPage(
  offset: number,
): Promise<{ items: RouteOption[]; nextOffset?: number }> {
  const limit = FILTER_OPTIONS_PAGE_SIZE;
  const payload = await requestApiData<unknown>({
    key: 'routes',
    config: {
      query: {
        'page[limit]': limit,
        'page[offset]': offset,
        'fields[route]': 'short_name,long_name,color',
        sort: 'short_name',
      },
    },
  });
  const page = parsePage(payload, offset, limit);
  const items = page.data.map((route) => {
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
}

async function getAllRouteIds(): Promise<string[]> {
  const payload = await requestApiData<unknown>({
    key: 'routes',
    config: {
      query: {
        'fields[route]': 'short_name',
        'page[limit]': FLEET_API_PAGE_SIZE,
        'page[offset]': 0,
      },
    },
  });
  return parseVehiclesResponse(payload).data.map((route) => route.id);
}

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
    queryFn: getAllRouteIds,
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
    queryFn: async () => {
      const rawPayload = await requestApiData<unknown>({
        key: 'routes',
        config: { query: params },
      });
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
  return useInfiniteQuery({
    queryKey: routeQueryKeys.options(),
    queryFn: ({ pageParam }) => getRoutesPage(pageParam),
    initialPageParam: 0,
    enabled,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: FLEET_QUERY_STALE_TIME.routeOptions,
  });
}
