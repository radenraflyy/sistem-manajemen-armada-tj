import { requestApiData } from '@/data-service/apiClient';

export type MbtaResource = {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: { id: string; type: string } | null }>;
};

export type MbtaResponse = {
  data: MbtaResource[];
  included: MbtaResource[];
  total: number | null;
  hasNext: boolean;
  lastOffset: number | null;
};

export type MbtaPage = MbtaResponse & {
  nextOffset: number | undefined;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
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

export function parseVehiclesResponse(value: unknown): MbtaResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !value.data.every(isMbtaResource)) {
    throw new Error('Respons API MBTA tidak memiliki format daftar data yang valid.');
  }

  const included = value.included ?? [];
  if (!Array.isArray(included) || !included.every(isMbtaResource)) {
    throw new Error('Respons API MBTA memiliki data relasi yang tidak valid.');
  }

  const meta = isRecord(value.meta) ? value.meta : undefined;
  const pagination = meta && isRecord(meta.pagination) ? meta.pagination : undefined;
  const total = pagination && typeof pagination.total === 'number' ? pagination.total : null;
  const links = isRecord(value.links) ? value.links : undefined;
  let lastOffset: number | null = null;
  if (typeof links?.last === 'string') {
    try {
      const lastUrl = new URL(links.last, window.location.origin);
      const parsedOffset = Number(lastUrl.searchParams.get('page[offset]'));
      if (Number.isFinite(parsedOffset)) lastOffset = parsedOffset;
    } catch {
      lastOffset = null;
    }
  }

  return {
    data: value.data,
    included,
    total,
    hasNext: typeof links?.next === 'string' && links.next.length > 0,
    lastOffset,
  };
}

export const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

export const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function parsePage(value: unknown, offset: number, limit: number): MbtaPage {
  const response = parseVehiclesResponse(value);
  return {
    ...response,
    nextOffset: response.data.length === limit ? offset + limit : undefined,
  };
}

export async function getPageTotal(
  resource: 'routes' | 'trips',
  params: Record<string, string | number>,
  payload: MbtaResponse,
  offset: number,
) {
  if (payload.total !== null) return payload.total;
  if (!payload.hasNext) return offset + payload.data.length;
  if (payload.lastOffset === null) return null;
  if (payload.lastOffset === offset) return offset + payload.data.length;

  const lastPayload = await requestApiData<unknown>({
    key: resource,
    config: { query: { ...params, 'page[offset]': payload.lastOffset } },
  });
  const lastPage = parseVehiclesResponse(lastPayload);
  return payload.lastOffset + lastPage.data.length;
}
