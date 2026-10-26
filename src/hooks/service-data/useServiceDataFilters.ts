import { useCallback } from 'react';

import type { RouteGroup } from '@/constants/routes-vehicle';
import { ROUTE_GROUPS } from '@/constants/routes-vehicle';
import { usePaginationParams } from '@/hooks/shared/usePaginationParams';
import { useUrlSearchParams } from '@/hooks/useUrlSearchParams';

const parseIdList = (value: string | null) =>
  value ? [...new Set(value.split(',').filter(Boolean))] : [];

export function useServiceDataFilters() {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const search = searchParams.get('search') ?? '';
  const selectedRouteIds = parseIdList(searchParams.get('routes'));
  const rawRouteGroup = searchParams.get('group') as RouteGroup | null;
  const routeGroup = ROUTE_GROUPS.some((group) => group.id === rawRouteGroup)
    ? rawRouteGroup!
    : 'all';

  const setSearch = useCallback(
    (value: string) => updateSearchParams({ search: value || null, page: null }),
    [updateSearchParams],
  );
  const setSelectedRouteIds = useCallback(
    (ids: string[]) => updateSearchParams({ routes: ids.join(',') || null, page: null }),
    [updateSearchParams],
  );
  const setRouteGroup = useCallback(
    (value: RouteGroup) =>
      updateSearchParams({ group: value === 'all' ? null : value, page: null }),
    [updateSearchParams],
  );
  const toggleRoute = useCallback(
    (routeId: string) => {
      const currentIds = parseIdList(searchParams.get('routes'));
      setSelectedRouteIds(
        currentIds.includes(routeId)
          ? currentIds.filter((id) => id !== routeId)
          : [...currentIds, routeId],
      );
    },
    [searchParams, setSelectedRouteIds],
  );

  return {
    page,
    pageSize,
    routeGroup,
    search,
    selectedRouteIds,
    setPage,
    setPageSize,
    setRouteGroup,
    setSearch,
    setSelectedRouteIds,
    toggleRoute,
  };
}
