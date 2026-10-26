import type { Vehicle, VehicleStatus } from '@/types/fleet';

export type VehicleFilters = {
  query: string;
  status: 'Semua' | VehicleStatus;
  routeIds: string[];
  tripIds: string[];
};

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase();

  return vehicles.filter((vehicle) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      [
        vehicle.id,
        vehicle.number,
        vehicle.route,
        vehicle.destination,
        vehicle.origin,
        vehicle.tripId ?? '',
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    const matchesStatus = filters.status === 'Semua' || vehicle.status === filters.status;
    const matchesRoute =
      filters.routeIds.length === 0 ||
      (vehicle.routeId !== null && filters.routeIds.includes(vehicle.routeId));
    const matchesTrip =
      filters.tripIds.length === 0 ||
      (vehicle.tripId !== null && filters.tripIds.includes(vehicle.tripId));

    return matchesSearch && matchesStatus && matchesRoute && matchesTrip;
  });
}
