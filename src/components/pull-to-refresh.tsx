import { RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';

const THRESHOLD = 70;
const MAX_PULL = 110;
const RESISTANCE = 0.5;

// Where pulling down already means something else
const IGNORE_SELECTOR = '.maplibregl-map, [role="dialog"], [contenteditable="true"]';

/** An app opened from the home screen has no browser gesture to reload its page. */
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isAtTop(target: Element | null) {
  if (window.scrollY > 0) return false;
  for (let el = target; el && el !== document.body; el = el.parentElement) {
    if (el.scrollTop > 0) return false;
  }
  return true;
}

/** Pull the page down from its top to reload it, in the installed app only. */
export function PullToRefresh() {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const indicator = indicatorRef.current;
    const icon = iconRef.current;
    if (!isStandalone() || !indicator || !icon) return;

    let startX = 0;
    let startY = 0;
    let pull = 0;
    let tracking = false;
    let refreshing = false;

    const render = (animate: boolean) => {
      indicator.style.transition = animate ? 'transform 200ms ease, opacity 200ms ease' : 'none';
      indicator.style.transform = `translate(-50%, ${pull - 48}px)`;
      indicator.style.opacity = String(Math.min(pull / THRESHOLD, 1));
      icon.style.transform = `rotate(${pull * 3}deg)`;
    };

    const onStart = (e: TouchEvent) => {
      const target = e.target as Element | null;
      tracking =
        !refreshing &&
        e.touches.length === 1 &&
        !target?.closest(IGNORE_SELECTOR) &&
        isAtTop(target);
      if (!tracking) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      pull = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (pull === 0 && (dy <= 0 || Math.abs(dx) > dy)) {
        tracking = false;
        return;
      }
      pull = Math.min(Math.max(dy * RESISTANCE, 0), MAX_PULL);
      render(false);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (pull >= THRESHOLD && navigator.onLine) {
        refreshing = true;
        pull = THRESHOLD;
        render(true);
        // The inline rotation would override the spin animation's transform
        icon.style.transform = '';
        icon.classList.add('animate-spin');
        window.location.reload();
        return;
      }
      pull = 0;
      render(true);
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return (
    <div
      ref={indicatorRef}
      aria-hidden
      className="pointer-events-none fixed top-[env(safe-area-inset-top)] left-1/2 z-50 flex size-9 items-center justify-center rounded-full border bg-background text-foreground opacity-0 shadow-md"
      style={{ transform: 'translate(-50%, -48px)' }}
    >
      <RefreshCw ref={iconRef} className="size-4" />
    </div>
  );
}
