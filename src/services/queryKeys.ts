export const vehicleQueryKeys = {
  all: ['vehicles'] as const,
  list: (page: number, pageSize: number) => ['vehicles', 'list', page, pageSize] as const,
  summary: () => ['vehicles', 'summary'] as const,
  detail: (id: string) => ['vehicles', 'detail', id] as const,
};

export const routeQueryKeys = {
  all: ['routes'] as const,
  page: (page: number, pageSize: number) => ['routes', 'page', page, pageSize] as const,
  options: () => ['routes', 'options'] as const,
  ids: () => ['routes', 'ids'] as const,
  tripCount: (routeId: string) => ['routes', 'trip-count', routeId] as const,
};

export const tripQueryKeys = {
  all: ['trips'] as const,
  page: (page: number, pageSize: number, routeIds: string[]) =>
    ['trips', 'page', page, pageSize, routeIds] as const,
  options: (routeIds: string[]) => ['trips', 'options', routeIds] as const,
};
