import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const LOCALE = 'fr-BE';

/** "1 234": a count as Belgian readers write it. */
export const formatCount = (value: number) => value.toLocaleString(LOCALE);

/** "25/11/2026". */
export const formatShortDate = (date: Date) => date.toLocaleDateString(LOCALE);

/** "25 novembre 2026". */
export const formatLongDate = (date: Date) => format(date, 'd MMMM yyyy', { locale: fr });

/** "il y a 3 jours". */
export const formatAgo = (date: Date) => formatDistanceToNow(date, { addSuffix: true, locale: fr });

/** "1 notice", "3 notices": `count` and the noun, plural from 2 on as French counts. */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatCount(count)} ${count >= 2 ? pluralForm : singular}`;
}

const DURATION_UNITS = [
  { ms: 7 * 24 * 60 * 60 * 1000, name: 'semaine' },
  { ms: 60 * 60 * 1000, name: 'heure' },
  { ms: 60 * 1000, name: 'minute' },
  { ms: 1000, name: 'seconde' },
];

/** "30 secondes", "2 minutes", "24 heures": a duration in the largest unit that counts it whole. */
export function formatDuration(ms: number): string {
  const unit = DURATION_UNITS.find(({ ms: size }) => ms >= size && ms % size === 0);
  return unit ? plural(ms / unit.ms, unit.name) : plural(ms / 1000, 'seconde');
}
