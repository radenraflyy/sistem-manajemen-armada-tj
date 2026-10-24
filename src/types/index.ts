import { AxiosError } from 'axios';

export interface Data<T> {
  page: number;
  perPage: number;
  totalItems: number;
  items: T[];
}

export interface ListPagination<T> {
  page: number;
  perPage: number;
  totalItems: number;
  items: T[];
}

export interface InfiniteList<T> {
  perPage: number;
  next: string;
  items: T[];
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface AxiosErrorResponse extends AxiosError<ErrorResponse> {}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface QueryPagination<T = unknown, O = unknown> {
  count: number;
  page: number;
  rowsPerPage: number;
  items: T[];
  otherItem?: O;
}
// eslint-disable-next-line
export interface SuccessResponse<T = any> {
  message: string;
  data: T;
}

export interface AxiosErrorResponse extends AxiosError<ErrorResponse> {}

export type TRefDialogFilter<T> = {
  open(dataFilter?: T): void;
  close?(): void;
};

export type TDialogFilterProps<T> = {
  onSubmit(data: T | null): void;
  onDelete(): void;
};