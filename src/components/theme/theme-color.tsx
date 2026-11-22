import { useTheme } from 'next-themes';
import { useEffect } from 'react';

/** The browser bar's colour for each theme; the same values as the manifest and the head. */
const THEME_COLORS = { light: '#fafafc', dark: '#121016' } as const;

/**
 * Keep the browser bar (and an installed app's status bar) in the theme the reader chose, not
 * only the system's: the head's media-specific values follow the system alone.
 */
export function ThemeColor() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return;
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = THEME_COLORS[resolvedTheme];
    }
  }, [resolvedTheme]);

  return null;
}
