import { useEffect, useMemo, useRef, useState } from 'react';

import LoadingIndicator from './LoadingIndicator';

export type MultiSelectOption = {
  id: string;
  label: string;
  description?: string;
};

type InfiniteMultiSelectProps = {
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectLoaded: () => void;
  onClear: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  onLoadMore: () => void;
  onRetry: () => void;
  disabled?: boolean;
};

const InfiniteMultiSelect = ({
  label,
  placeholder,
  options,
  selectedIds,
  onToggle,
  onSelectLoaded,
  onClear,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  error,
  onLoadMore,
  onRetry,
  disabled = false,
}: InfiniteMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;
  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return options;
    return options.filter((option) =>
      `${option.label} ${option.description ?? ''}`.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [options, search]);

  useEffect(() => {
    if (!open || !sentinelRef.current || !scrollRef.current || !hasNextPage) return;
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          loadMoreRef.current();
        }
      },
      { root, rootMargin: '0px 0px 100px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, open]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const selectedLabel =
    selectedIds.length === 0
      ? placeholder
      : `${selectedIds.length} dipilih`;

  return (
    <div className='relative' ref={rootRef}>
      <span className='mb-2 block text-sm font-semibold text-slate-700'>{label}</span>
      <button
        aria-expanded={open}
        className='flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-600 outline-none transition hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        type='button'
      >
        <span className='truncate'>{selectedLabel}</span>
        <span aria-hidden='true' className='text-xs'>⌄</span>
      </button>

      {error && !open && (
        <div className='mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2' role='alert'>
          <p className='text-xs text-red-700'>{error}</p>
          <button
            className='mt-1 text-xs font-semibold text-tj-blue hover:underline'
            onClick={onRetry}
            type='button'
          >
            Coba lagi
          </button>
        </div>
      )}

      {open && (
        <div className='absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl'>
          <input
            aria-label={`Cari ${label.toLocaleLowerCase()}`}
            className='h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400'
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Cari ${label.toLocaleLowerCase()}...`}
            type='search'
            value={search}
          />
          <div className='flex items-center justify-between gap-2 px-1 py-2'>
            <button
              className='text-xs font-semibold text-tj-blue hover:underline disabled:text-slate-400'
              disabled={options.length === 0}
              onClick={onSelectLoaded}
              type='button'
            >
              Pilih yang dimuat ({options.length})
            </button>
            <button
              className='text-xs font-semibold text-slate-500 hover:underline disabled:text-slate-300'
              disabled={selectedIds.length === 0}
              onClick={onClear}
              type='button'
            >
              Hapus pilihan
            </button>
          </div>
          <div
            aria-busy={isLoading || isFetchingNextPage}
            className='max-h-56 overflow-y-auto overscroll-contain'
            ref={scrollRef}
          >
            {isLoading && options.length === 0 && (
              <LoadingIndicator
                className='w-full justify-center px-3 py-5'
                label={`Memuat ${label.toLocaleLowerCase()}...`}
                size='small'
              />
            )}
            {!isLoading && filteredOptions.length === 0 && !error && (
              <p className='px-3 py-5 text-center text-xs text-slate-500'>
                {options.length === 0 ? 'Belum ada pilihan.' : 'Tidak ada hasil yang cocok.'}
              </p>
            )}
            {filteredOptions.map((option) => (
              <label
                className='flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50'
                key={option.id}
              >
                <input
                  checked={selectedIds.includes(option.id)}
                  className='mt-0.5 size-4 shrink-0 accent-tj-blue'
                  onChange={() => onToggle(option.id)}
                  type='checkbox'
                />
                <span className='min-w-0'>
                  <span className='block truncate font-medium'>{option.label}</span>
                  {option.description && (
                    <span className='mt-0.5 block truncate text-[10px] text-slate-400'>
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
            {hasNextPage && <div aria-hidden='true' className='h-px' ref={sentinelRef} />}
            {isFetchingNextPage && (
              <LoadingIndicator
                className='w-full justify-center px-3 py-3'
                label='Memuat berikutnya...'
                size='small'
              />
            )}
            {error && (
              <div className='px-3 py-3 text-center' role='alert'>
                <p className='text-xs text-red-600'>{error}</p>
                <button
                  className='mt-1 text-xs font-semibold text-tj-blue hover:underline'
                  onClick={onRetry}
                  type='button'
                >
                  Coba lagi
                </button>
              </div>
            )}
            {!hasNextPage && options.length > 0 && (
              <p className='px-3 py-2 text-center text-[10px] text-slate-400'>
                Semua pilihan sudah dimuat
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfiniteMultiSelect;
