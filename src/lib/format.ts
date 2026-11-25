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
