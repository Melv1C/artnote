import { Link } from '@tanstack/react-router';
import { FilePlus2, MapPinPlus, UserRoundPlus } from 'lucide-react';

const ACTIONS = [
  {
    to: '/dashboard/artworks/create',
    icon: FilePlus2,
    title: 'Nouvelle notice',
    text: 'Commencer un brouillon',
  },
  {
    to: '/dashboard/artists/create',
    icon: UserRoundPlus,
    title: 'Nouvel artiste',
    text: 'À citer dans les notices',
  },
  {
    to: '/dashboard/places/create',
    icon: MapPinPlus,
    title: 'Nouveau lieu',
    text: 'Musée, église, collection',
  },
] as const;

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions" className="rounded-xl border bg-card shadow-xs">
      <h2 id="quick-actions" className="border-b px-5 py-4 font-semibold">
        Ajouter
      </h2>
      <ul className="p-2">
        {ACTIONS.map(action => (
          <li key={action.to}>
            <Link
              to={action.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <action.icon className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-medium">{action.title}</span>
                <span className="block text-xs text-muted-foreground">{action.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
