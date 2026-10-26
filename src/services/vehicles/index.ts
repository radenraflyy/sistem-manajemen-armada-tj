import {
  FLEET_API_PAGE_SIZE,
  FLEET_QUERY_REFRESH_INTERVAL,
  FLEET_QUERY_STALE_TIME,
  OCCUPANCY_LABELS,
  VEHICLE_STATUS_BY_API_STATUS,
} from '@/constants/fleet';
import { requestApiData } from '@/data-service/apiClient';
import useQueryApiRequest from '@/hooks/useApiRequest/useQueryApiRequest';
import {
  type MbtaResource,
  getNumber,
  getString,
  isRecord,
  parseVehiclesResponse,
} from '@/services/mbtaApi';
import { vehicleQueryKeys } from '@/services/queryKeys';
import type { Vehicle, VehicleSummary } from '@/types/fleet';

export type { VehicleSummary } from '@/types/fleet';

function routeColor(type: number | null) {
  if (type === 0 || type === 1) return 'bg-emerald-500';
  if (type === 2) return 'bg-red-500';
  if (type === 4) return 'bg-blue-500';
  return 'bg-amber-500';
}

function mapVehicle(
  resource: MbtaResource,
  includedByType: Map<string, Map<string, MbtaResource>>,
): Vehicle {
  const attributes = resource.attributes ?? {};
  const relationship = (name: string) => resource.relationships?.[name]?.data;
  const routeId = relationship('route')?.id ?? null;
  const stopId = relationship('stop')?.id ?? null;
  const tripId = relationship('trip')?.id ?? null;
  const route = routeId ? includedByType.get('route')?.get(routeId) : undefined;
  const stop = stopId ? includedByType.get('stop')?.get(stopId) : undefined;
  const trip = tripId ? includedByType.get('trip')?.get(tripId) : undefined;
  const shapeId = trip?.relationships?.shape?.data?.id ?? null;
  const shape = shapeId ? includedByType.get('shape')?.get(shapeId) : undefined;
  const routeAttributes = route?.attributes ?? {};
  const tripAttributes = trip?.attributes ?? {};
  const stopAttributes = stop?.attributes ?? {};
  const number = getString(attributes.label) ?? resource.id;
  const latitude = getNumber(attributes.latitude);
  const longitude = getNumber(attributes.longitude);
  const routeShortName = getString(routeAttributes.short_name);
  const routeLongName = getString(routeAttributes.long_name);
  const tripHeadsign = getString(tripAttributes.headsign);
  const destination =
    tripHeadsign ?? routeLongName ?? `Rute ${routeShortName ?? routeId ?? 'tidak diketahui'}`;
  const currentStatus = getString(attributes.current_status);
  const occupancyStatus = getString(attributes.occupancy_status);

  return {
    id: resource.id,
    number,
    route: routeShortName ?? routeId ?? '—',
    routeId,
    routeColor: routeColor(getNumber(routeAttributes.type)),
    routeDetails: {
      id: routeId,
      longName: routeLongName,
      description: getString(routeAttributes.description),
      type: getNumber(routeAttributes.type),
      color: (() => {
        const color = getString(routeAttributes.color);
        return color && /^[\da-f]{6}$/i.test(color) ? `#${color}` : null;
      })(),
      directionDestinations: Array.isArray(routeAttributes.direction_destinations)
        ? routeAttributes.direction_destinations.filter(
            (destination): destination is string => typeof destination === 'string',
          )
        : [],
      directionNames: Array.isArray(routeAttributes.direction_names)
        ? routeAttributes.direction_names.filter((name): name is string => typeof name === 'string')
        : [],
    },
    shapeId,
    routePolyline: getString(shape?.attributes?.polyline),
    destination,
    origin: getString(stopAttributes.name) ?? 'Halte tidak diketahui',
    stopId,
    status: currentStatus
      ? (VEHICLE_STATUS_BY_API_STATUS[currentStatus] ?? 'Tidak diketahui')
      : 'Tidak diketahui',
    currentStatus,
    currentStopSequence: getNumber(attributes.current_stop_sequence),
    directionId: getNumber(attributes.direction_id),
    speedKph: (() => {
      const speedMetersPerSecond = getNumber(attributes.speed);
      return speedMetersPerSecond === null ? null : speedMetersPerSecond * 3.6;
    })(),
    bearing: getNumber(attributes.bearing),
    occupancy: occupancyStatus
      ? (OCCUPANCY_LABELS[occupancyStatus] ?? 'Tidak ada data')
      : 'Tidak ada data',
    occupancyStatus,
    coordinates:
      latitude !== null && longitude !== null
        ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        : 'Koordinat tidak tersedia',
    latitude,
    longitude,
    updatedAt: getString(attributes.updated_at),
    tripId,
    tripDetails: {
      id: tripId,
      headsign: tripHeadsign,
      name: getString(tripAttributes.name),
      directionId: getNumber(tripAttributes.direction_id),
      blockId: getString(tripAttributes.block_id),
      wheelchairAccessible: getNumber(tripAttributes.wheelchair_accessible),
      bikesAllowed: getNumber(tripAttributes.bikes_allowed),
    },
    carriageLabels: Array.isArray(attributes.carriages)
      ? attributes.carriages.flatMap((carriage) => {
          if (!isRecord(carriage)) return [];
          const label = getString(carriage.label);
          return label ? [label] : [];
        })
      : [],
    revenue: getString(attributes.revenue),
  };
}

export async function getVehicles(
  page: number,
  pageSize: number,
  routeIds: string[] = [],
  tripIds: string[] = [],
): Promise<{ items: Vehicle[]; hasNext: boolean; total: number | null; pageCount: number | null }> {
  const offset = (page - 1) * pageSize;
  const vehicleFilters =
    tripIds.length > 0
      ? { 'filter[trip]': tripIds.join(',') }
      : routeIds.length > 0
        ? { 'filter[route]': routeIds.join(',') }
        : {};
  const payload = await requestApiData<unknown>({
    key: 'vehicles',
    config: {
      query: {
        include: 'route,stop,trip,trip.shape',
        'page[limit]': pageSize,
        'page[offset]': offset,
        ...vehicleFilters,
      },
    },
  });
  return mapVehiclesPayload(payload, pageSize, offset);
}

function mapVehiclesPayload(
  value: unknown,
  pageSize: number,
  offset: number,
): { items: Vehicle[]; hasNext: boolean; total: number | null; pageCount: number | null } {
  const payload = parseVehiclesResponse(value);
  const includedByType = new Map<string, Map<string, MbtaResource>>();
  for (const resource of payload.included) {
    const resources = includedByType.get(resource.type) ?? new Map<string, MbtaResource>();
    resources.set(resource.id, resource);
    includedByType.set(resource.type, resources);
  }
  return {
    items: payload.data.map((resource) => mapVehicle(resource, includedByType)),
    hasNext: payload.hasNext || payload.data.length === pageSize,
    total: payload.total,
    pageCount:
      payload.total !== null
        ? Math.max(1, Math.ceil(payload.total / pageSize))
        : payload.lastOffset !== null
          ? Math.floor(payload.lastOffset / pageSize) + 1
          : payload.hasNext
            ? null
            : Math.max(1, Math.ceil((offset + payload.data.length) / pageSize)),
  };
}

export async function getVehicleSummary(): Promise<VehicleSummary> {
  const limit = FLEET_API_PAGE_SIZE;
  let offset = 0;
  let total = 0;
  let moving = 0;
  let stopped = 0;
  let approaching = 0;
  const routeIds = new Set<string>();
  const vehiclesByRoute: Record<string, number> = {};
  const activeTrips = new Map<string, string>();

  while (true) {
    const payload = await requestApiData<unknown>({
      key: 'vehicles',
      config: {
        query: {
          include: 'route,trip',
          'fields[vehicle]': 'current_status,route,trip',
          'fields[route]': 'short_name,type',
          'page[limit]': limit,
          'page[offset]': offset,
        },
      },
    });
    const page = parseVehiclesResponse(payload);
    total += page.data.length;
    for (const vehicle of page.data) {
      const status = getString(vehicle.attributes?.current_status);
      if (status === 'IN_TRANSIT_TO') moving += 1;
      else if (status === 'STOPPED_AT') stopped += 1;
      else if (status === 'INCOMING_AT') approaching += 1;
      const routeId = vehicle.relationships?.route?.data?.id;
      const tripId = vehicle.relationships?.trip?.data?.id;
      if (routeId) {
        routeIds.add(routeId);
        vehiclesByRoute[routeId] = (vehiclesByRoute[routeId] ?? 0) + 1;
      }
      if (routeId && tripId) activeTrips.set(tripId, routeId);
    }
    if (page.data.length < limit) break;
    offset += limit;
  }

  return {
    total,
    moving,
    stopped,
    approaching,
    routes: routeIds.size,
    vehiclesByRoute,
    activeTrips: [...activeTrips].map(([id, routeId]) => ({ id, routeId })),
  };
}

export function useVehiclesQuery(
  page: number,
  pageSize: number,
  routeIds: string[] = [],
  tripIds: string[] = [],
) {
  const offset = (page - 1) * pageSize;
  const vehicleFilters =
    tripIds.length > 0
      ? { 'filter[trip]': tripIds.join(',') }
      : routeIds.length > 0
        ? { 'filter[route]': routeIds.join(',') }
        : {};
  return useQueryApiRequest<{
    items: Vehicle[];
    hasNext: boolean;
    total: number | null;
    pageCount: number | null;
  }>({
    key: 'vehicles',
    queryKey: vehicleQueryKeys.list(page, pageSize, routeIds, tripIds),
    config: {
      query: {
        include: 'route,stop,trip,trip.shape',
        'page[limit]': pageSize,
        'page[offset]': offset,
        ...vehicleFilters,
      },
    },
    queryFn: () => getVehicles(page, pageSize, routeIds, tripIds),
    options: {
      staleTime: FLEET_QUERY_STALE_TIME.vehicles,
      refetchInterval: FLEET_QUERY_REFRESH_INTERVAL.vehicles,
    },
  });
}

export function useVehicleSummaryQuery(enabled = true) {
  return useQueryApiRequest<VehicleSummary>({
    key: 'vehicles',
    queryKey: vehicleQueryKeys.summary(),
    config: { query: { include: 'route' } },
    queryFn: getVehicleSummary,
    options: {
      enabled,
      staleTime: FLEET_QUERY_STALE_TIME.summary,
      refetchInterval: FLEET_QUERY_REFRESH_INTERVAL.summary,
    },
  });
}
