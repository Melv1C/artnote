import { BarChart3, ExternalLink } from 'lucide-react';

/** Umami Cloud's dashboard, where admins read the audience figures (ADR 0010). */
const UMAMI_DASHBOARD_URL = 'https://cloud.umami.is';

export function AudienceLinkCard() {
  return (
    <a
      href={UMAMI_DASHBOARD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border bg-card p-5 shadow-xs transition-colors outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">Audience</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <BarChart3 className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-base font-semibold text-primary group-hover:underline">
        Voir les statistiques
        <ExternalLink className="size-4" aria-hidden="true" />
        <span className="sr-only">(nouvel onglet)</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Visiteurs et lectures, sur Umami</p>
    </a>
  );
}
