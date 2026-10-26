import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { FLEET_API_PAGE_SIZE, FLEET_QUERY_STALE_TIME } from '@/constants/fleet';
import { usePaginationMeta } from '@/hooks/shared/usePaginationMeta';
import {
  useRouteIdsQuery,
  useRoutesInfiniteQuery,
  useRoutesPageQuery,
} from '@/services/routes-vehicle';
import { getRouteTripCount, useTripsPageQuery } from '@/services/trips';
import { useVehicleSummaryQuery } from '@/services/vehicles';
import type { RouteRow, TripRow } from '@/types/fleet';
import { matchesRouteGroup } from '@/utils/routeGroups';

const EMPTY_ROUTE_ROWS: RouteRow[] = [];
const EMPTY_TRIP_ROWS: TripRow[] = [];

type ServiceDataPageDataParams = {
  kind: 'routes' | 'trips';
  page: number;
  pageSize: number;
  search: string;
  routeGroup: Parameters<typeof matchesRouteGroup>[1];
  selectedRouteIds: string[];
};

export function useServiceDataPageData({
  kind,
  page,
  pageSize,
  search,
  routeGroup,
  selectedRouteIds,
}: ServiceDataPageDataParams) {
  const isRoutes = kind === 'routes';
  const routesPage = useRoutesPageQuery(1, FLEET_API_PAGE_SIZE, isRoutes);
  const routeRows = routesPage.data?.items ?? EMPTY_ROUTE_ROWS;
  const allRouteIdsQuery = useRouteIdsQuery(!isRoutes);
  const routeOptionsQuery = useRoutesInfiniteQuery(!isRoutes);
  const routeOptions = routeOptionsQuery.data?.pages.flatMap((routePage) => routePage.items) ?? [];
  const routeIds = selectedRouteIds.length > 0 ? selectedRouteIds : (allRouteIdsQuery.data ?? []);
  const tripsPage = useTripsPageQuery(
    page,
    pageSize,
    routeIds,
    !isRoutes && allRouteIdsQuery.isSuccess,
  );
  const vehicleSummaryQuery = useVehicleSummaryQuery(isRoutes);
  const isLoading = isRoutes
    ? routesPage.isPending
    : allRouteIdsQuery.isPending || tripsPage.isPending;
  const error = isRoutes ? routesPage.error : (allRouteIdsQuery.error ?? tripsPage.error);
  const retry = () => {
    if (isRoutes) {
      void routesPage.refetch();
    } else {
      if (allRouteIdsQuery.isError) void allRouteIdsQuery.refetch();
      void tripsPage.refetch();
    }
  };
  const total = tripsPage.data?.total;
  const hasNext = tripsPage.data?.hasNext ?? false;
  const tripRows = tripsPage.data?.items ?? EMPTY_TRIP_ROWS;
  const matchingRouteRows = useMemo(
    () => routeRows.filter((row) => matchesRouteGroup(row, routeGroup)),
    [routeGroup, routeRows],
  );
  const filteredRouteRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return matchingRouteRows;
    return matchingRouteRows.filter((row) =>
      [row.id, row.shortName, row.longName, ...row.directionNames].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [matchingRouteRows, search]);
  const filteredTripRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return tripRows;
    return tripRows.filter((row) =>
      [row.id, row.routeId ?? '', row.routeName, row.headsign].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [search, tripRows]);
  const filteredRows = isRoutes ? filteredRouteRows : filteredTripRows;
  const paginationTotal = isRoutes ? filteredRouteRows.length : total;
  const { pageCount } = usePaginationMeta({ page, pageSize, total: paginationTotal });
  const canGoNext = isRoutes ? pageCount !== null && page < pageCount : hasNext;
  const displayTotal = isRoutes ? filteredRouteRows.length : total;
  const visibleRouteRows = filteredRouteRows.slice((page - 1) * pageSize, page * pageSize);
  const routeTripCounts = useQueries({
    queries: isRoutes
      ? visibleRouteRows.map((route) => ({
          queryKey: ['routes', 'trip-count', route.id],
          queryFn: () => getRouteTripCount(route.id),
          staleTime: FLEET_QUERY_STALE_TIME.routeOptions,
        }))
      : [],
  });

  return {
    allRouteIdsQuery,
    canGoNext,
    displayTotal,
    error,
    filteredRows,
    filteredTripRows,
    isLoading,
    isRoutes,
    pageCount,
    retry,
    routeOptions,
    routeOptionsQuery,
    routeRows,
    routeTripCounts,
    tripRows,
    tripsPage,
    vehicleSummaryQuery,
    visibleRouteRows,
  };
}
