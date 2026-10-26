import { useCallback } from 'react';

import { useUrlSearchParams } from '@/hooks/useUrlSearchParams';

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZES = [5, 10, 20, 50];

const parsePositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function usePaginationParams() {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const parsedPageSize = parsePositiveInteger(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
  const pageSize = PAGE_SIZES.includes(parsedPageSize) ? parsedPageSize : DEFAULT_PAGE_SIZE;

  const setPage = useCallback(
    (value: number) =>
      updateSearchParams({ page: Number.isSafeInteger(value) && value > 1 ? String(value) : null }),
    [updateSearchParams],
  );
  const setPageSize = useCallback(
    (value: number) =>
      updateSearchParams({
        pageSize: PAGE_SIZES.includes(value) && value !== DEFAULT_PAGE_SIZE ? String(value) : null,
        page: null,
      }),
    [updateSearchParams],
  );

  return { page, pageSize, setPage, setPageSize };
}
