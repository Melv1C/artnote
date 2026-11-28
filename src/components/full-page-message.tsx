import type { ReactNode } from 'react';

/** A page that is only a message: not found, an error, no access. */
export function FullPageMessage({
  illustration,
  title,
  children,
  actions,
}: {
  illustration?: ReactNode;
  title: string;
  children: ReactNode;
  /** Buttons, the first one the way forward */
  actions?: ReactNode;
}) {
  return (
    <div className="page-width flex min-h-[60svh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        {illustration}
        <h1 className="font-serif text-3xl font-medium tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{children}</p>
        {actions && (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row [&>*]:rounded-full">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
