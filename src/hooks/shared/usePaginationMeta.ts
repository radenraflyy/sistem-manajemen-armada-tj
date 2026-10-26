type PaginationMetaParams = {
  page: number;
  pageSize: number;
  total: number | null | undefined;
  fallbackPageCount?: number | null;
};

export function usePaginationMeta({
  page,
  pageSize,
  total,
  fallbackPageCount = null,
}: PaginationMetaParams) {
  const pageCount =
    total === null || total === undefined
      ? fallbackPageCount
      : Math.max(1, Math.ceil(total / pageSize));

  return {
    currentPage: pageCount === null ? page : Math.min(page, pageCount),
    pageCount,
  };
}
