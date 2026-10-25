import type { AxiosRequestConfig } from 'axios';

import { type AllQueriesKeys, allQueries } from '@/data-service/queries';
import { axiosInstance } from '@/utils/axiosInstance/axios';
import { constructUrl } from '@/utils/constructUrl';

export type ApiRequestConfig = {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
};

type ApiRequestProps = {
  key: AllQueriesKeys;
  config?: ApiRequestConfig;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function requestApiData<T = unknown>({ key, config }: ApiRequestProps): Promise<T> {
  const url = constructUrl(allQueries[key], config);
  const response = await axiosInstance.request<unknown>({
    method: 'GET',
    url,
    params: config?.query as AxiosRequestConfig['params'],
  });
  const payload = response.data;

  if (isRecord(payload) && typeof payload.message === 'string' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}
