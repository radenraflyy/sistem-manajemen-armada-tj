import { useCallback } from 'react';

import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { useLocation } from 'react-router';

import type { SuccessResponse } from '@/types';

import type { ResponsePayload } from './types';

export const axiosInstance = axios.create({
  withCredentials: true,
});

function useAxiosWithoutAuth<T = any>() {
  const location = useLocation();
  const clientPath = `${location.pathname}${location.search}${location.hash}`;
  const axiosFetch = useCallback(
    async (config: AxiosRequestConfig) => {
      if (!axiosInstance.defaults.baseURL) throw new Error('Base URL is required.');
      if (!config.url) throw new Error('Request URL is required.');
      if (config.url.includes('undefined')) {
        throw new Error('Request URL contains an undefined value.');
      }

      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: { ...config.headers, clientPath },
      };

      return await axiosInstance<SuccessResponse<T>>(requestConfig).catch(
        async (err: AxiosError<ResponsePayload>) => {
          if (![401].includes(err.response?.status || 0)) throw err;
        },
      );
    },
    [clientPath],
  );

  return axiosFetch;
}

export default useAxiosWithoutAuth;
