import type { ReactNode } from 'react';
import { PageHeader } from './page-header';

/** A dashboard page that is one form: its title above the form, on a card. */
export function FormPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={title} description={description} />
      <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">{children}</div>
    </div>
  );
}
