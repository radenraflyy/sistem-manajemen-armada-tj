import type { AxiosError } from 'axios';

import type { ErrorResponse } from '@/types';

export type AxiosErrorResponse = AxiosError<ErrorResponse>;
