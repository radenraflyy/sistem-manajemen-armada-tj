import { useCallback, useEffect } from 'react';

import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { type AllQueriesKeys, allQueries } from '@/data-service/queries';
import { axiosInstance } from '@/utils/axiosInstance/axios';
import { constructUrl } from '@/utils/constructUrl';

import type { AxiosErrorResponse } from '../types';

export interface UseQueryApiRequestProps<T> {
  key: AllQueriesKeys;
  config?: {
    params?: { [key: string]: string };
    query?: { [key: string]: unknown };
  };
  options?: Omit<UseQueryOptions<T, AxiosErrorResponse>, 'queryKey'>;
  needAuth?: boolean;
}
function useQueryApiRequest<T = unknown>({
  key,
  options,
  config,
  needAuth = true,
}: UseQueryApiRequestProps<T>) {
  const url = allQueries[key];
  const queryClient = useQueryClient();
  const replacedUrl = constructUrl(url, config);

  const axiosFetch = useCallback(
    async (requestConfig: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      url: string;
      params?: any;
    }) => {
      try {
        const response = await axiosInstance.request({
          method: requestConfig.method,
          url: requestConfig.url,
          params: requestConfig.params,
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  const fetchData = useCallback(async () => {
    const response = await axiosFetch({
      method: 'GET',
      url: replacedUrl,
      params: config?.query,
    });

    if (!response) return null;
    if (response.data.message) return response.data.data;
    return response.data;
  }, [axiosFetch, config?.query, replacedUrl]);

  const queryOptions: Partial<
    Omit<UseQueryOptions<T, AxiosErrorResponse, T, QueryKey>, 'queryKey' | 'queryFn'>
  > = {
    retry: 1,
    ...options,
  };

  const queryFetch = useQuery<T, AxiosErrorResponse>({
    queryKey: [key, url, config],
    queryFn: fetchData,
    ...queryOptions,
  });
  useEffect(() => {
    if (queryFetch.isError) {
      <p role='alert'>{queryFetch.error.response?.data.message ?? queryFetch.error.message}</p>;
    }
  }, [queryFetch, queryClient]);

  return queryFetch;
}

export default useQueryApiRequest;
