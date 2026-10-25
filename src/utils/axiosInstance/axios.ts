import { useCallback } from 'react';

import axios, { type AxiosError } from 'axios';

import type { SuccessResponse } from '@/types';

import type { AxiosFetchParams, ResponsePayload } from './types';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api-v3.mbta.com',
});

function useAxiosWithoutAuth<T = unknown>() {
  return useCallback(async (config: AxiosFetchParams) => {
    if (!axiosInstance.defaults.baseURL) throw new Error('Base URL is required.');
    if (config.url.includes('undefined')) {
      throw new Error('Request URL contains an undefined value.');
    }

    try {
      return await axiosInstance<SuccessResponse<T>>(config);
    } catch (error) {
      if (axios.isAxiosError<ResponsePayload>(error) && error.response?.status === 401) {
        return undefined;
      }
      throw error as AxiosError<ResponsePayload>;
    }
  }, []);
}

export default useAxiosWithoutAuth;
