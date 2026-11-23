import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';

const noSubscription = () => () => {};

/** False on the server and during hydration, when the stored theme is not known yet. */
function useIsHydrated() {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

/**
 * Switches between the light and dark themes in one click. A first visit follows the device;
 * from the first click on, the reader's choice is kept.
 */
export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isHydrated = useIsHydrated();
  const isDark = resolvedTheme === 'dark';

  const label = !isHydrated
    ? 'Changer de thème'
    : isDark
      ? 'Passer au thème clair'
      : 'Passer au thème sombre';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun className="size-[1.15rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[1.15rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
