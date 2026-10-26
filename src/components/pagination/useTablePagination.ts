import { useCallback } from 'react';

type UseTablePaginationParams = {
  page: number;
  pageSize: number;
  count: number | null;
  fallbackPageCount?: number | null;
  hasNext?: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
};

export function useTablePagination({
  page,
  pageSize,
  count,
  fallbackPageCount = null,
  hasNext = false,
  onPageChange,
  onRowsPerPageChange,
}: UseTablePaginationParams) {
  const pageCount = count === null ? fallbackPageCount : Math.max(1, Math.ceil(count / pageSize));
  const currentPage = pageCount === null ? page : Math.min(page, pageCount);
  const handlePageChange = useCallback(
    (nextPage: number) => onPageChange(nextPage),
    [onPageChange],
  );
  const handleRowsPerPageChange = useCallback(
    (rowsPerPage: number) => onRowsPerPageChange(rowsPerPage),
    [onRowsPerPageChange],
  );
  const paginationProps = {
    page: currentPage,
    pageCount,
    pageSize,
    total: count,
    hasNext,
    onPageChange: handlePageChange,
    onPageSizeChange: handleRowsPerPageChange,
  };

  return {
    count,
    page: currentPage,
    rowsPerPage: pageSize,
    handlePageChange,
    handleRowsPerPageChange,
    paginationProps,
  };
}
