import { useCallback } from 'react';

import { useSearchParams } from 'react-router';

type UrlParamUpdates = Record<string, string | null>;

export function useUrlSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateSearchParams = useCallback(
    (updates: UrlParamUpdates) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value.length === 0) next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { searchParams, updateSearchParams };
}
