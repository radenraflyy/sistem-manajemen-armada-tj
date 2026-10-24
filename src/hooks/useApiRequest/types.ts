import { AxiosError } from 'axios';

import type { ErrorResponse } from '@/types';

export interface AxiosErrorResponse extends AxiosError<ErrorResponse> {}