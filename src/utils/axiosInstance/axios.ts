import { useCallback } from 'react';

import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

import type { SuccessResponse } from '@/types';

import type { ResponsePayload } from './types';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api-v3.mbta.com',
});

function useAxiosWithoutAuth<T = any>() {
  const axiosFetch = useCallback(
    async (config: AxiosRequestConfig) => {
      if (!axiosInstance.defaults.baseURL) throw new Error('Base URL is required.');
      if (!config.url) throw new Error('Request URL is required.');
      if (config.url.includes('undefined')) {
        throw new Error('Request URL contains an undefined value.');
      }

      return await axiosInstance<SuccessResponse<T>>(config).catch(
        async (err: AxiosError<ResponsePayload>) => {
          if (![401].includes(err.response?.status || 0)) throw err;
        },
      );
    },
    [],
  );

  return axiosFetch;
}

export default useAxiosWithoutAuth;
