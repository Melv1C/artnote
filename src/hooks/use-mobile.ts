import { useSyncExternalStore } from 'react';

// Below Tailwind's `md` breakpoint (48rem unless styles.css sets --breakpoint-md), as `max-md:`
const MOBILE_QUERY = '(width < 48rem)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** Whether the screen is phone-sized; false on the server and during hydration. */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
