import { useEffect, useState } from 'react';

/** How long typing pauses before a search runs. */
const TYPING_PAUSE_MS = 300;

/** `value` once it has stopped changing for a typing pause: what a search box queries. */
export function useDebounce<T>(value: T): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), TYPING_PAUSE_MS);
    return () => clearTimeout(timeout);
  }, [value]);

  return debouncedValue;
}
