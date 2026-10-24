import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Vehicle } from './types';

type VehicleUpdate = Partial<Omit<Vehicle, 'id'>>;
const validStatuses = ['Bergerak', 'Berhenti', 'Mendekati'] as const;

export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: () => [...vehicleKeys.lists()] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
};

const isVehicle = (value: unknown): value is Vehicle => {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.number === 'string' &&
    typeof candidate.route === 'string' &&
    typeof candidate.routeColor === 'string' &&
    typeof candidate.destination === 'string' &&
    typeof candidate.origin === 'string' &&
    typeof candidate.status === 'string' &&
    validStatuses.some((status) => status === candidate.status) &&
    typeof candidate.progress === 'number' &&
    typeof candidate.speed === 'number' &&
    typeof candidate.direction === 'number' &&
    typeof candidate.capacity === 'number' &&
    typeof candidate.coordinates === 'string'
  );
};

const isVehicleList = (value: unknown): value is Vehicle[] =>
  Array.isArray(value) && value.every(isVehicle);

async function requestJson<T>(
  input: RequestInfo | URL,
  validate: (value: unknown) => value is T,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Permintaan API gagal (${response.status} ${response.statusText}).`);
  }

  const data: unknown = await response.json();
  if (!validate(data)) {
    throw new Error('Respons API armada memiliki format yang tidak valid.');
  }

  return data;
}

export const getVehicles = (): Promise<Vehicle[]> => requestJson('/api/vehicles', isVehicleList);

export const getVehicle = (id: string): Promise<Vehicle> =>
  requestJson(`/api/vehicles/${encodeURIComponent(id)}`, isVehicle);

export const updateVehicle = ({ id, ...patch }: VehicleUpdate & { id: string }): Promise<Vehicle> =>
  requestJson(`/api/vehicles/${encodeURIComponent(id)}`, isVehicle, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

export const useVehiclesQuery = () =>
  useQuery({
    queryKey: vehicleKeys.list(),
    queryFn: getVehicles,
  });

export const useVehicleQuery = (id: string) =>
  useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => getVehicle(id),
    enabled: id.length > 0,
  });

type UpdateContext = {
  previousLists: [readonly unknown[], Vehicle[] | undefined][];
  previousDetail: Vehicle | undefined;
};

function updateCachedVehicles(
  queryClient: QueryClient,
  vehicleId: string,
  update: (vehicle: Vehicle) => Vehicle,
) {
  queryClient.setQueriesData<Vehicle[]>({ queryKey: vehicleKeys.lists() }, (vehicles) =>
    vehicles?.map((vehicle) => (vehicle.id === vehicleId ? update(vehicle) : vehicle)),
  );
}

export const useUpdateVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVehicle,
    onMutate: async ({ id, ...patch }): Promise<UpdateContext> => {
      await queryClient.cancelQueries({ queryKey: vehicleKeys.all });
      const previousLists = queryClient.getQueriesData<Vehicle[]>({
        queryKey: vehicleKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Vehicle>(vehicleKeys.detail(id));
      const applyUpdate = (vehicle: Vehicle): Vehicle => ({ ...vehicle, ...patch });

      updateCachedVehicles(queryClient, id, applyUpdate);
      if (previousDetail) {
        queryClient.setQueryData(vehicleKeys.detail(id), applyUpdate(previousDetail));
      }

      return { previousLists, previousDetail };
    },
    onError: (_error, { id }, context) => {
      context?.previousLists.forEach(([queryKey, vehicles]) => {
        queryClient.setQueryData(queryKey, vehicles);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(vehicleKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: async (_data, _error, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() }),
      ]);
    },
  });
};
