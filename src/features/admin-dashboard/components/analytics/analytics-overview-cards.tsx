import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Cookie, Eye, Home, NotebookPen, Users, Zap } from 'lucide-react';
import { type AnalyticsSummary } from './analytics-data';

type AnalyticsOverviewCardsProps = {
  summary: AnalyticsSummary;
  realtimeStats: {
    last24hViews: number;
    last1hViews: number;
    totalNotices: number;
  };
};

function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString('fr-FR');
}

export function AnalyticsOverviewCards({ summary, realtimeStats }: AnalyticsOverviewCardsProps) {
  const cards = [
    {
      title: 'Pages vues (30j)',
      value: formatNumber(summary.totalPageViews),
      icon: Eye,
      description: 'Total des pages consultées',
    },
    {
      title: 'Visiteurs uniques (30j)',
      value: formatNumber(summary.uniqueVisitors),
      icon: Users,
      description: 'Visiteurs distincts',
    },
    {
      title: 'Durée moyenne',
      value: formatDuration(summary.avgSessionDurationMs),
      icon: Clock,
      description: 'Temps moyen par session',
    },
    {
      title: "Taux d'acceptation cookies",
      value: `${Math.round(summary.cookieAcceptRate)}%`,
      icon: Cookie,
      description: 'Consentement analytics',
    },
    {
      title: 'Vues dernière heure',
      value: formatNumber(realtimeStats.last1hViews),
      icon: Zap,
      description: 'Activité récente',
    },
    {
      title: 'Vues dernières 24h',
      value: formatNumber(realtimeStats.last24hViews),
      icon: Activity,
      description: 'Activité journalière',
    },
    {
      title: 'Vues accueil',
      value: formatNumber(summary.homeViews),
      icon: Home,
      description: "Page d'accueil (30j)",
    },
    {
      title: 'Notices publiées',
      value: formatNumber(realtimeStats.totalNotices),
      icon: NotebookPen,
      description: 'Total des notices actives',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
