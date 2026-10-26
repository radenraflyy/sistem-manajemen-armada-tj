import { useMemo } from 'react';

import type { DashboardView } from '@/components/DashboardToolbar';
import { FLEET_API_PAGE_SIZE } from '@/constants/fleet';
import { usePaginationMeta } from '@/hooks/shared/usePaginationMeta';
import { useRoutesInfiniteQuery } from '@/services/routes-vehicle';
import { useTripsInfiniteQuery } from '@/services/trips';
import { useVehicleSummaryQuery, useVehiclesQuery } from '@/services/vehicles';
import type { Vehicle, VehicleStatus } from '@/types/fleet';
import { filterVehicles } from '@/utils/filterVehicles';

const EMPTY_VEHICLES: Vehicle[] = [];

type FleetPageDataParams = {
  view: DashboardView;
  page: number;
  pageSize: number;
  query: string;
  statusFilter: 'Semua' | VehicleStatus;
  selectedRouteIds: string[];
  selectedTripIds: string[];
};

export function useFleetPageData({
  view,
  page,
  pageSize,
  query,
  statusFilter,
  selectedRouteIds,
  selectedTripIds,
}: FleetPageDataParams) {
  const vehiclesQuery = useVehiclesQuery(
    view === 'map' ? 1 : page,
    view === 'map' ? FLEET_API_PAGE_SIZE : pageSize,
    selectedRouteIds,
    selectedTripIds,
  );
  const vehicleSummaryQuery = useVehicleSummaryQuery();
  const routesQuery = useRoutesInfiniteQuery();
  const tripsQuery = useTripsInfiniteQuery(selectedRouteIds);
  const vehicles = vehiclesQuery.data?.items ?? EMPTY_VEHICLES;
  const totalVehicles = vehicleSummaryQuery.data?.total ?? 0;
  const hasVehicleData = vehiclesQuery.data !== undefined;
  const filteredVehicles = useMemo(
    () =>
      filterVehicles(vehicles, {
        query,
        status: statusFilter,
        routeIds: selectedRouteIds,
        tripIds: selectedTripIds,
      }),
    [query, selectedRouteIds, selectedTripIds, statusFilter, vehicles],
  );
  const routeOptions = useMemo(() => {
    const routes = routesQuery.data?.pages.flatMap((routePage) => routePage.items) ?? [];
    const activeRouteIds = new Set(Object.keys(vehicleSummaryQuery.data?.vehiclesByRoute ?? {}));
    return routes.toSorted(
      (left, right) => Number(activeRouteIds.has(right.id)) - Number(activeRouteIds.has(left.id)),
    );
  }, [routesQuery.data, vehicleSummaryQuery.data?.vehiclesByRoute]);
  const tripOptions = useMemo(() => {
    const loadedTrips =
      tripsQuery.data?.pages.flatMap((tripPage) =>
        tripPage.items.map((trip) => ({
          id: trip.id,
          label: trip.id,
          description: [
            trip.label.replace(trip.id, '').trim().replace(/^·\s*/, ''),
            trip.routeId ? routeOptions.find((route) => route.id === trip.routeId)?.label : '',
          ]
            .filter(Boolean)
            .join(' · '),
        })),
      ) ?? [];
    const activeTrips = new Map<string, (typeof loadedTrips)[number]>();
    for (const trip of vehicleSummaryQuery.data?.activeTrips ?? []) {
      if (
        activeTrips.has(trip.id) ||
        (selectedRouteIds.length > 0 && !selectedRouteIds.includes(trip.routeId))
      ) {
        continue;
      }
      const route = routeOptions.find((option) => option.id === trip.routeId);
      activeTrips.set(trip.id, {
        id: trip.id,
        label: trip.id,
        description: `Aktif · ${route?.label ?? trip.routeId}`,
      });
    }

    return [...activeTrips.values(), ...loadedTrips.filter((trip) => !activeTrips.has(trip.id))];
  }, [routeOptions, selectedRouteIds, tripsQuery.data, vehicleSummaryQuery.data]);
  const operationalCounts = useMemo(
    () => ({
      total: vehicleSummaryQuery.data?.total ?? 0,
      moving: vehicleSummaryQuery.data?.moving ?? 0,
      stopped: vehicleSummaryQuery.data?.stopped ?? 0,
      approaching: vehicleSummaryQuery.data?.approaching ?? 0,
      routes: vehicleSummaryQuery.data?.routes ?? 0,
    }),
    [vehicleSummaryQuery.data],
  );
  const requestError =
    vehiclesQuery.error?.message ??
    vehicleSummaryQuery.error?.message ??
    'Data armada gagal dimuat. Coba lagi beberapa saat.';
  const lastUpdatedLabel = vehiclesQuery.dataUpdatedAt
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(
        new Date(vehiclesQuery.dataUpdatedAt),
      )
    : null;
  const hasVehicleApiFilters = selectedRouteIds.length > 0 || selectedTripIds.length > 0;
  const displayedTotal = hasVehicleApiFilters ? (vehiclesQuery.data?.total ?? null) : totalVehicles;
  const { currentPage, pageCount } = usePaginationMeta({
    page,
    pageSize,
    total: displayedTotal,
    fallbackPageCount: vehiclesQuery.data?.pageCount,
  });
  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== 'Semua' ||
    selectedRouteIds.length > 0 ||
    selectedTripIds.length > 0;
  const mapVehicleCount = hasActiveFilters ? filteredVehicles.length : totalVehicles;

  return {
    currentPage,
    displayedTotal,
    filteredVehicles,
    hasVehicleData,
    lastUpdatedLabel,
    mapVehicleCount,
    operationalCounts,
    pageCount,
    requestError,
    routeOptions,
    routesQuery,
    tripOptions,
    tripsQuery,
    vehicleSummaryQuery,
    vehicles,
    vehiclesQuery,
  };
}
