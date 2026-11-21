import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ExternalLink } from 'lucide-react';

/** Umami Cloud's dashboard, where admins read the audience figures (ADR 0010). */
const UMAMI_DASHBOARD_URL = 'https://cloud.umami.is';

export function AudienceLinkCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Audience</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm">
          <a href={UMAMI_DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
            Voir les statistiques
            <ExternalLink aria-hidden="true" />
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </Button>
        <p className="text-xs text-muted-foreground mt-2">Visiteurs et lectures, sur Umami</p>
      </CardContent>
    </Card>
  );
}
