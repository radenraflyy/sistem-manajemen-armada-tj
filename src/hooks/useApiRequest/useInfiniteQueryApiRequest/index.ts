import { useCallback } from 'react';

import { type QueryKey, useInfiniteQuery } from '@tanstack/react-query';

import { type ApiRequestConfig, requestApiData } from '@/data-service/apiClient';
import { type AllQueriesKeys } from '@/data-service/queries';

interface UseInfiniteQueryApiRequestProps<TPage, TPageParam> {
  key: AllQueriesKeys;
  queryKey: QueryKey;
  initialPageParam: TPageParam;
  config: (pageParam: TPageParam) => ApiRequestConfig;
  transform: (response: unknown, pageParam: TPageParam) => TPage | Promise<TPage>;
  getNextPageParam: (lastPage: TPage) => TPageParam | undefined;
  enabled?: boolean;
  staleTime?: number;
}

export default function useInfiniteQueryApiRequest<TPage, TPageParam>({
  key,
  queryKey,
  initialPageParam,
  config,
  transform,
  getNextPageParam,
  enabled,
  staleTime,
}: UseInfiniteQueryApiRequestProps<TPage, TPageParam>) {
  const fetchPage = useCallback(
    async ({ pageParam }: { pageParam: TPageParam }) => {
      const response = await requestApiData<unknown>({ key, config: config(pageParam) });
      return transform(response, pageParam);
    },
    [config, key, transform],
  );

  return useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam,
    getNextPageParam,
    enabled,
    staleTime,
  });
}
