import { useCallback } from 'react';

import type { DashboardView } from '../components/DashboardToolbar';
import type { VehicleStatus } from '../types/fleet';
import { useUrlSearchParams } from './useUrlSearchParams';

type StatusFilter = 'Semua' | VehicleStatus;

const statusFilters = new Set<StatusFilter>([
  'Semua',
  'Berjalan',
  'Berhenti',
  'Mendekati',
  'Tidak diketahui',
]);
const dashboardViews = new Set<DashboardView>(['grid', 'table', 'map']);

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

export function useFleetFilters(initialView: DashboardView) {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const pageSize = parsePageSize(searchParams.get('pageSize'));
  const query = searchParams.get('q') ?? '';
  const rawStatus = searchParams.get('status') as StatusFilter | null;
  const statusFilter = rawStatus && statusFilters.has(rawStatus) ? rawStatus : 'Semua';
  const rawView = searchParams.get('view') as DashboardView | null;
  const view = rawView && dashboardViews.has(rawView) ? rawView : initialView;
  const selectedRouteIds = parseIdList(searchParams.get('routes'));
  const selectedTripIds = parseIdList(searchParams.get('trips'));

  const setPage = useCallback(
    (value: number) => updateSearchParams({ page: value > 1 ? String(value) : null }),
    [updateSearchParams],
  );
  const setPageSize = useCallback(
    (value: number) =>
      updateSearchParams({ pageSize: value === 5 ? null : String(value), page: null }),
    [updateSearchParams],
  );
  const setQuery = useCallback(
    (value: string) => updateSearchParams({ q: value || null, page: null }),
    [updateSearchParams],
  );
  const setStatusFilter = useCallback(
    (value: StatusFilter) =>
      updateSearchParams({ status: value === 'Semua' ? null : value, page: null }),
    [updateSearchParams],
  );
  const setView = useCallback(
    (value: DashboardView) => updateSearchParams({ view: value }),
    [updateSearchParams],
  );
  const setSelectedRouteIds = useCallback(
    (ids: string[]) =>
      updateSearchParams({ routes: ids.join(',') || null, trips: null, page: null }),
    [updateSearchParams],
  );
  const setSelectedTripIds = useCallback(
    (ids: string[]) => updateSearchParams({ trips: ids.join(',') || null, page: null }),
    [updateSearchParams],
  );
  const toggleRoute = useCallback(
    (routeId: string) => {
      const currentIds = parseIdList(searchParams.get('routes'));
      const nextIds = currentIds.includes(routeId)
        ? currentIds.filter((id) => id !== routeId)
        : [...currentIds, routeId];
      setSelectedRouteIds(nextIds);
    },
    [searchParams, setSelectedRouteIds],
  );
  const toggleTrip = useCallback(
    (tripId: string) => {
      const currentIds = parseIdList(searchParams.get('trips'));
      setSelectedTripIds(
        currentIds.includes(tripId)
          ? currentIds.filter((id) => id !== tripId)
          : [...currentIds, tripId],
      );
    },
    [searchParams, setSelectedTripIds],
  );
  const resetFilters = useCallback(
    () => updateSearchParams({ q: null, status: null, routes: null, trips: null, page: null }),
    [updateSearchParams],
  );

  return {
    page,
    pageSize,
    query,
    resetFilters,
    selectedRouteIds,
    selectedTripIds,
    setPage,
    setPageSize,
    setQuery,
    setSelectedRouteIds,
    setSelectedTripIds,
    setStatusFilter,
    setView,
    statusFilter,
    toggleRoute,
    toggleTrip,
    view,
  };
}
