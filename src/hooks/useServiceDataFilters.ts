import { useCallback } from 'react';

import type { RouteGroup } from '../constants/routes-vehicle';
import { ROUTE_GROUPS } from '../constants/routes-vehicle';
import { useUrlSearchParams } from './useUrlSearchParams';

const parsePositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePageSize = (value: string | null) => {
  const parsed = parsePositiveInteger(value, 5);
  return [5, 10, 20, 50].includes(parsed) ? parsed : 5;
};

const parseIdList = (value: string | null) =>
  value ? [...new Set(value.split(',').filter(Boolean))] : [];

export function useServiceDataFilters() {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const pageSize = parsePageSize(searchParams.get('pageSize'));
  const search = searchParams.get('search') ?? '';
  const selectedRouteIds = parseIdList(searchParams.get('routes'));
  const rawRouteGroup = searchParams.get('group') as RouteGroup | null;
  const routeGroup = ROUTE_GROUPS.some((group) => group.id === rawRouteGroup)
    ? rawRouteGroup!
    : 'all';

  const setPage = useCallback(
    (value: number) => updateSearchParams({ page: value > 1 ? String(value) : null }),
    [updateSearchParams],
  );
  const setPageSize = useCallback(
    (value: number) =>
      updateSearchParams({ pageSize: value === 5 ? null : String(value), page: null }),
    [updateSearchParams],
  );
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
  };
}
