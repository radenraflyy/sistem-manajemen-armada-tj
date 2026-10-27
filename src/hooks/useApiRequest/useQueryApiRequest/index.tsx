import { useCallback } from 'react';

import { type QueryKey, type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { type ApiRequestConfig, requestApiData } from '@/data-service/apiClient';
import { type AllQueriesKeys, allQueries } from '@/data-service/queries';

export interface UseQueryApiRequestProps<T> {
  key: AllQueriesKeys;
  config?: ApiRequestConfig;
  queryKey?: QueryKey;
  transform?: (response: unknown) => T | Promise<T>;
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>;
}

export function apiQueryOptions<T>({
  key,
  config,
  transform,
}: Pick<UseQueryApiRequestProps<T>, 'key' | 'config' | 'transform'>) {
  return {
    queryFn: async () => {
      const response = await requestApiData<unknown>({ key, config });
      return transform ? transform(response) : (response as T);
    },
  };
}

function useQueryApiRequest<T = unknown>({
  key,
  options,
  config,
  queryKey,
  transform,
}: UseQueryApiRequestProps<T>) {
  const url = allQueries[key];

  const fetchData = useCallback(async () => {
    const response = await requestApiData<unknown>({ key, config });
    return transform ? transform(response) : (response as T);
  }, [config, key, transform]);

  const queryOptions: Partial<
    Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>
  > = {
    retry: 1,
    ...options,
  };

  return useQuery<T, Error>({
    queryKey: queryKey ?? [key, url, config],
    queryFn: fetchData,
    ...queryOptions,
  });
}

export default useQueryApiRequest;
