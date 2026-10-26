import type { VehicleStatus } from '@/types/fleet';

export const FLEET_API_PAGE_SIZE = 1000;
export const FILTER_OPTIONS_PAGE_SIZE = 30;

export const FLEET_QUERY_STALE_TIME = {
  vehicles: 30_000,
  summary: 60_000,
  routeOptions: 5 * 60_000,
  routesPage: 5 * 60_000,
  tripsPage: 60_000,
  tripOptions: 60_000,
} as const;

export const FLEET_QUERY_REFRESH_INTERVAL = {
  vehicles: 30_000,
  summary: 60_000,
} as const;

export const VEHICLE_STATUS_BY_API_STATUS: Record<string, VehicleStatus> = {
  IN_TRANSIT_TO: 'Berjalan',
  STOPPED_AT: 'Berhenti',
  INCOMING_AT: 'Mendekati',
};

export const OCCUPANCY_LABELS: Record<string, string> = {
  MANY_SEATS_AVAILABLE: 'Banyak kursi tersedia',
  FEW_SEATS_AVAILABLE: 'Sedikit kursi tersedia',
  STANDING_ROOM_ONLY: 'Hanya ruang berdiri',
  CRUSHED_STANDING_ROOM_ONLY: 'Sangat padat',
  FULL: 'Penuh',
  NOT_ACCEPTING_PASSENGERS: 'Tidak menerima penumpang',
  NO_DATA_AVAILABLE: 'Tidak ada data',
};
