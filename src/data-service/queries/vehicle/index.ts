import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axiosInstance } from '@/utils/axiosInstance/axios';

import type { QueriesDataService, Vehicle, VehicleStatus } from '../../types';

export type VehicleQueryKeys = 'vehicles' | 'vehicles-detail';

export const vehicleQueries: QueriesDataService<VehicleQueryKeys> = {
  vehicles: 'vehicles',
  'vehicles-detail': 'vehicles/:id',
};

export const vehicleQueryKeys = {
  all: ['vehicles'] as const,
  list: (page: number, pageSize: number) => [...vehicleQueryKeys.all, 'list', page, pageSize] as const,
  summary: () => [...vehicleQueryKeys.all, 'summary'] as const,
  detail: (id: string) => [...vehicleQueryKeys.all, 'detail', id] as const,
};

export type RouteOption = {
  id: string;
  label: string;
  shortName: string;
  longName: string;
};

export type TripOption = {
  id: string;
  label: string;
  routeId: string | null;
};

export type RouteRow = {
  id: string;
  shortName: string;
  longName: string;
  type: number | null;
  color: string | null;
  directionNames: string[];
};

export type TripRow = {
  id: string;
  routeId: string | null;
  routeName: string;
  headsign: string;
  directionId: number | null;
  startTime: string | null;
  endTime: string | null;
  wheelchairAccessible: number | null;
};

type MbtaPage = {
  data: MbtaResource[];
  included: MbtaResource[];
  nextOffset: number | undefined;
};

type MbtaResource = {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: { id: string; type: string } | null }>;
};

type MbtaVehiclesResponse = {
  data: MbtaResource[];
  included: MbtaResource[];
  total: number;
  hasNext: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMbtaResource(value: unknown): value is MbtaResource {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    (value.attributes === undefined || isRecord(value.attributes)) &&
    (value.relationships === undefined || isRecord(value.relationships))
  );
}

function parseVehiclesResponse(value: unknown): MbtaVehiclesResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !value.data.every(isMbtaResource)) {
    throw new Error('Respons API MBTA tidak memiliki format daftar kendaraan yang valid.');
  }

  const included = value.included ?? [];
  if (!Array.isArray(included) || !included.every(isMbtaResource)) {
    throw new Error('Respons API MBTA memiliki data relasi kendaraan yang tidak valid.');
  }

  const meta = isRecord(value.meta) ? value.meta : undefined;
  const pagination = meta && isRecord(meta.pagination) ? meta.pagination : undefined;
  const total = pagination && typeof pagination.total === 'number'
    ? pagination.total
    : value.data.length;
  const links = isRecord(value.links) ? value.links : undefined;
  return {
    data: value.data,
    included,
    total,
    hasNext: typeof links?.next === 'string' && links.next.length > 0,
  };
}

const statusMap: Record<string, VehicleStatus> = {
  IN_TRANSIT_TO: 'Bergerak',
  STOPPED_AT: 'Berhenti',
  INCOMING_AT: 'Mendekati',
};

const occupancyLabels: Record<string, string> = {
  MANY_SEATS_AVAILABLE: 'Banyak kursi tersedia',
  FEW_SEATS_AVAILABLE: 'Sedikit kursi tersedia',
  STANDING_ROOM_ONLY: 'Hanya ruang berdiri',
  CRUSHED_STANDING_ROOM_ONLY: 'Sangat padat',
  FULL: 'Penuh',
  NOT_ACCEPTING_PASSENGERS: 'Tidak menerima penumpang',
  NO_DATA_AVAILABLE: 'Tidak ada data',
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

function parsePage(value: unknown, offset: number, limit: number): MbtaPage {
  const response = parseVehiclesResponse(value);
  return {
    ...response,
    nextOffset: response.data.length === limit ? offset + limit : undefined,
  };
}

async function getRoutesPage(
  offset: number,
): Promise<{ items: RouteOption[]; nextOffset?: number }> {
  const limit = 30;
  const response = await axiosInstance.get<unknown>('/routes', {
    params: {
      'page[limit]': limit,
      'page[offset]': offset,
      sort: 'short_name',
    },
  });
  const page = parsePage(response.data, offset, limit);
  const items = page.data.map((route) => {
    const attributes = route.attributes ?? {};
    const shortName = getString(attributes.short_name) ?? '';
    return {
      id: route.id,
      shortName,
      label: shortName || getString(attributes.long_name) || route.id,
      longName: getString(attributes.long_name) ?? '',
    };
  });

  return { items, nextOffset: page.nextOffset };
}

async function getTripsPage(
  routeIds: string[],
  offset: number,
): Promise<{ items: TripOption[]; nextOffset?: number }> {
  const limit = 30;
  const response = await axiosInstance.get<unknown>('/trips', {
    params: {
      'filter[route]': routeIds.join(','),
      'page[limit]': limit,
      'page[offset]': offset,
      sort: 'id',
    },
  });
  const page = parsePage(response.data, offset, limit);
  const items = page.data.map((trip) => {
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
}

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
    tripHeadsign ??
    routeLongName ??
    `Rute ${routeShortName ?? routeId ?? 'tidak diketahui'}`;
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
        ? routeAttributes.direction_names.filter(
            (name): name is string => typeof name === 'string',
          )
        : [],
    },
    shapeId,
    routePolyline: getString(shape?.attributes?.polyline),
    destination,
    origin: getString(stopAttributes.name) ?? 'Halte tidak diketahui',
    stopId,
    status: currentStatus ? (statusMap[currentStatus] ?? 'Tidak diketahui') : 'Tidak diketahui',
    currentStatus,
    currentStopSequence: getNumber(attributes.current_stop_sequence),
    directionId: getNumber(attributes.direction_id),
    speedKph: (() => {
      const speedMetersPerSecond = getNumber(attributes.speed);
      return speedMetersPerSecond === null ? null : speedMetersPerSecond * 3.6;
    })(),
    bearing: getNumber(attributes.bearing),
    occupancy: occupancyStatus
      ? (occupancyLabels[occupancyStatus] ?? 'Tidak ada data')
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

export async function getVehicles(page: number, pageSize: number): Promise<{ items: Vehicle[]; hasNext: boolean }> {
  const offset = (page - 1) * pageSize;
  const response = await axiosInstance.get<unknown>('/vehicles', {
    params: {
      include: 'route,stop,trip,trip.shape',
      'page[limit]': pageSize,
      'page[offset]': offset,
    },
  });
  const payload = parseVehiclesResponse(response.data);
  const includedByType = new Map<string, Map<string, MbtaResource>>();
  for (const resource of payload.included) {
    const resources = includedByType.get(resource.type) ?? new Map<string, MbtaResource>();
    resources.set(resource.id, resource);
    includedByType.set(resource.type, resources);
  }

  return {
    items: payload.data.map((resource) => mapVehicle(resource, includedByType)),
    hasNext: payload.hasNext || payload.data.length === pageSize,
  };
}

export type VehicleSummary = {
  total: number;
  moving: number;
  stopped: number;
  approaching: number;
  routes: number;
};

export async function getVehicleSummary(): Promise<VehicleSummary> {
  const limit = 1000;
  let offset = 0;
  let total = 0;
  let moving = 0;
  let stopped = 0;
  let approaching = 0;
  const routeIds = new Set<string>();

  while (true) {
    const response = await axiosInstance.get<unknown>('/vehicles', {
      params: {
        include: 'route',
        'fields[vehicle]': 'current_status,route',
        'fields[route]': 'short_name,type',
        'page[limit]': limit,
        'page[offset]': offset,
      },
    });
    const page = parseVehiclesResponse(response.data);
    total += page.data.length;
    for (const vehicle of page.data) {
      const status = getString(vehicle.attributes?.current_status);
      if (status === 'IN_TRANSIT_TO') moving += 1;
      else if (status === 'STOPPED_AT') stopped += 1;
      else if (status === 'INCOMING_AT') approaching += 1;
      const routeId = vehicle.relationships?.route?.data?.id;
      if (routeId) routeIds.add(routeId);
    }
    if (page.data.length < limit) break;
    offset += limit;
  }

  return { total, moving, stopped, approaching, routes: routeIds.size };
}

export function useVehiclesQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: vehicleQueryKeys.list(page, pageSize),
    queryFn: () => getVehicles(page, pageSize),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useVehicleSummaryQuery() {
  return useQuery({
    queryKey: vehicleQueryKeys.summary(),
    queryFn: getVehicleSummary,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

async function getCollectionCount(resource: 'routes' | 'trips', routeIds: string[] = []) {
  const pageSize = 1000;
  let offset = 0;
  let count = 0;

  while (true) {
    const response = await axiosInstance.get<unknown>(`/${resource}`, {
      params: {
        [`fields[${resource.slice(0, -1)}]`]: resource === 'routes' ? 'short_name' : 'route',
        ...(resource === 'trips' ? { 'filter[route]': routeIds.join(',') } : {}),
        'page[limit]': pageSize,
        'page[offset]': offset,
      },
    });
    const page = parseVehiclesResponse(response.data);
    count += page.data.length;
    if (page.data.length < pageSize) return count;
    offset += pageSize;
  }
}

export function useRoutesCountQuery(enabled = true) {
  return useQuery({
    queryKey: [...vehicleQueryKeys.all, 'route-count'],
    queryFn: () => getCollectionCount('routes'),
    enabled,
    staleTime: 5 * 60_000,
  });
}

async function getAllRouteIds(): Promise<string[]> {
  const response = await axiosInstance.get<unknown>('/routes', {
    params: {
      'fields[route]': 'short_name',
      'page[limit]': 1000,
      'page[offset]': 0,
    },
  });
  return parseVehiclesResponse(response.data).data.map((route) => route.id);
}

export function useRouteIdsQuery(enabled = true) {
  return useQuery({
    queryKey: [...vehicleQueryKeys.all, 'route-ids'],
    queryFn: getAllRouteIds,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useTripsCountQuery(routeIds: string[], enabled = true) {
  return useQuery({
    queryKey: [...vehicleQueryKeys.all, 'trip-count', routeIds],
    queryFn: () => getCollectionCount('trips', routeIds),
    enabled: enabled && routeIds.length > 0,
    staleTime: 60_000,
  });
}

export function useRoutesPageQuery(page: number, pageSize: number, enabled = true) {
  return useQuery({
    queryKey: [...vehicleQueryKeys.all, 'routes-page', page, pageSize],
    enabled,
    queryFn: async () => {
      const response = await axiosInstance.get<unknown>('/routes', {
        params: {
          'page[limit]': pageSize,
          'page[offset]': (page - 1) * pageSize,
          sort: 'short_name',
        },
      });
      const payload = parseVehiclesResponse(response.data);
      return payload.data.map((route): RouteRow => {
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
    },
    staleTime: 5 * 60_000,
  });
}

export function useTripsPageQuery(page: number, pageSize: number, routeIds: string[], enabled = true) {
  return useQuery({
    queryKey: [...vehicleQueryKeys.all, 'trips-page', page, pageSize, routeIds],
    enabled: enabled && routeIds.length > 0,
    queryFn: async () => {
      const response = await axiosInstance.get<unknown>('/trips', {
        params: {
          include: 'route',
          'filter[route]': routeIds.join(','),
          'page[limit]': pageSize,
          'page[offset]': (page - 1) * pageSize,
          sort: 'id',
        },
      });
      const payload = parseVehiclesResponse(response.data);
      const routeNames = new Map(
        payload.included
          .filter((resource) => resource.type === 'route')
          .map((route) => [route.id, getString(route.attributes?.short_name) ?? route.id]),
      );
      return payload.data.map((trip): TripRow => {
        const attributes = trip.attributes ?? {};
        const routeId = trip.relationships?.route?.data?.id ?? null;
        return {
          id: trip.id,
          routeId,
          routeName: routeId ? routeNames.get(routeId) ?? routeId : '—',
          headsign: getString(attributes.headsign) ?? getString(attributes.name) ?? 'Tujuan tidak tersedia',
          directionId: getNumber(attributes.direction_id),
          startTime: getString(attributes.start_time),
          endTime: getString(attributes.end_time),
          wheelchairAccessible: getNumber(attributes.wheelchair_accessible),
        };
      });
    },
    staleTime: 60_000,
  });
}

export function useRoutesInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: [...vehicleQueryKeys.all, 'route-options'],
    queryFn: ({ pageParam }) => getRoutesPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 5 * 60_000,
  });
}

export function useTripsInfiniteQuery(routeIds: string[]) {
  const normalizedRouteIds = [...routeIds].sort();

  return useInfiniteQuery({
    queryKey: [...vehicleQueryKeys.all, 'trip-options', normalizedRouteIds],
    queryFn: ({ pageParam }) => getTripsPage(normalizedRouteIds, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: normalizedRouteIds.length > 0,
    staleTime: 60_000,
  });
}
