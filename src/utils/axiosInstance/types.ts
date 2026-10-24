import type { AxiosRequestConfig } from 'axios';

import type { WithRequired } from '@/types';

export interface AxiosFetchParams<D = unknown> extends WithRequired<AxiosRequestConfig<D>, 'url'> {}
export interface ResponsePayload {
  name: string;
  message: string;
  statusCode: number;
}
