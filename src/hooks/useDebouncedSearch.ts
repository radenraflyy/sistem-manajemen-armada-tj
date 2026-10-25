import { useCallback, useEffect, useState } from 'react';

import { SEARCH_DEBOUNCE_MS } from '../constants/search';

export function useDebouncedSearch(
  value: string,
  onDebouncedChange: (value: string) => void,
  delay = SEARCH_DEBOUNCE_MS,
) {
  const [searchState, setSearchState] = useState({ sourceValue: value, inputValue: value });

  if (searchState.sourceValue !== value) {
    setSearchState({ sourceValue: value, inputValue: value });
  }

  const inputValue = searchState.sourceValue === value ? searchState.inputValue : value;
  const setInputValue = useCallback(
    (nextValue: string) => setSearchState({ sourceValue: value, inputValue: nextValue }),
    [value],
  );

  useEffect(() => {
    if (inputValue === value) return;
    const timeoutId = window.setTimeout(() => onDebouncedChange(inputValue), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay, inputValue, onDebouncedChange, value]);

  return [inputValue, setInputValue] as const;
}

export function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}
