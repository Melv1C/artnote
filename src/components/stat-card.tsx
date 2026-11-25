import { Skeleton } from '@/components/ui/skeleton';
import { formatCount } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Suspense, use, type ReactNode } from 'react';

interface StatCardProps<T> {
  title: string;
  icon: LucideIcon;
  /** Colours the icon: published notices are a success, drafts wait */
  tone?: 'success' | 'warning';
  /** The loader's promise the figure comes from; the card shows a skeleton until it resolves */
  data: Promise<T>;
  value: (data: T) => number;
  subtitle?: (data: T) => string;
}

/** One figure of the dashboard, streamed in behind its own skeleton. */
export function StatCard<T>({ title, icon, tone, data, value, subtitle }: StatCardProps<T>) {
  return (
    <StatCardFrame title={title} icon={icon} tone={tone}>
      <Suspense fallback={<Skeleton className="mt-3 h-9 w-16" />}>
        <StatFigure data={data} value={value} subtitle={subtitle} />
      </Suspense>
    </StatCardFrame>
  );
}

function StatFigure<T>({
  data,
  value,
  subtitle,
}: Pick<StatCardProps<T>, 'data' | 'value' | 'subtitle'>) {
  const resolved = use(data);
  return (
    <>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {formatCount(value(resolved))}
      </p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle(resolved)}</p>}
    </>
  );
}

function StatCardFrame({
  title,
  icon: Icon,
  tone,
  children,
}: Pick<StatCardProps<unknown>, 'title' | 'icon' | 'tone'> & { children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground',
            tone === 'success' && 'bg-success/12 text-success',
            tone === 'warning' &&
              'bg-warning/15 text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      {children}
    </div>
  );
}
