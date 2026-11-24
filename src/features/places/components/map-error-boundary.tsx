import { Component, type ReactNode } from 'react';

interface MapErrorBoundaryProps {
  children: ReactNode;
  /** What shows instead of the map. */
  fallback: ReactNode;
}

/**
 * Without WebGL, or when the map's code fails to load (a deploy since the page opened), the
 * page shows `fallback` instead: nothing else on it falls with the map.
 */
export class MapErrorBoundary extends Component<MapErrorBoundaryProps, { failed: boolean }> {
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
