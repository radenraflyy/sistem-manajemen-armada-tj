import type { AxiosError } from 'axios';

export interface Data<T> {
  page: number;
  perPage: number;
  totalItems: number;
  items: T[];
}

export type ListPagination<T> = Data<T>;

export interface InfiniteList<T> {
  perPage: number;
  next: string | null;
  items: T[];
}

export interface ErrorResponse {
  error?: string;
  message: string;
}

export type AxiosErrorResponse = AxiosError<ErrorResponse>;

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface QueryPagination<T = unknown, O = unknown> {
  count: number;
  page: number;
  rowsPerPage: number;
  items: T[];
  otherItem?: O;
}

export interface SuccessResponse<T = unknown> {
  message: string;
  data: T;
}

export type TRefDialogFilter<T> = {
  open(dataFilter?: T): void;
  close?(): void;
};

export type TDialogFilterProps<T> = {
  onSubmit(data: T | null): void;
  onDelete(): void;
};
