import { cn } from '@/lib/utils';
import { ClientOnly } from '@tanstack/react-router';
import { Component, Suspense, type ReactNode } from 'react';

/**
 * Where a map goes. MapLibre runs in the browser only and is heavy, so the map is a `lazy`
 * component that loads after hydration; until then the placeholder keeps its space. Without WebGL,
 * or when the map's code fails to load (a deploy since the page opened), the placeholder shows
 * `unavailable` instead: nothing else on the page falls with the map.
 */
export function MapSlot({
  children,
  unavailable,
  className,
}: {
  /** The lazy map */
  children: ReactNode;
  unavailable: string;
  /** The placeholder's size and shape, the map's own */
  className?: string;
}) {
  const placeholder = (message?: string) => (
    <div
      className={cn(
        'flex items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground',
        className,
      )}
    >
      {message}
    </div>
  );

  return (
    <ClientOnly fallback={placeholder()}>
      <MapErrorBoundary fallback={placeholder(unavailable)}>
        <Suspense fallback={placeholder()}>{children}</Suspense>
      </MapErrorBoundary>
    </ClientOnly>
  );
}

class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Loading the map failed:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
