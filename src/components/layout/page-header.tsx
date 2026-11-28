interface PageHeaderProps {
  title: string;
  description?: string;
  /** The page's main actions, on the right */
  actions?: React.ReactNode;
}

/** The title row of a dashboard page. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <h1 className="font-serif text-3xl font-medium tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
