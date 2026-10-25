import { useCallback } from 'react';

import { type QueryKey, type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { type ApiRequestConfig, requestApiData } from '@/data-service/apiClient';
import { type AllQueriesKeys, allQueries } from '@/data-service/queries';

export interface UseQueryApiRequestProps<T> {
  key: AllQueriesKeys;
  config?: ApiRequestConfig;
  queryKey?: QueryKey;
  queryFn?: () => Promise<T>;
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>;
}

function useQueryApiRequest<T = unknown>({
  key,
  options,
  config,
  queryKey,
  queryFn,
}: UseQueryApiRequestProps<T>) {
  const url = allQueries[key];

  const fetchData = useCallback(
    () => (queryFn ? queryFn() : requestApiData<T>({ key, config })),
    [config, key, queryFn],
  );

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
