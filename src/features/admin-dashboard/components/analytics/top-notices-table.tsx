import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { type TopNoticeData } from './analytics-data';

type TopNoticesTableProps = {
  data: TopNoticeData[];
};

function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function TopNoticesTable({ data }: TopNoticesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notices les plus consultées</CardTitle>
        <CardDescription>Top 10 des notices sur les 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Notice</TableHead>
                <TableHead className="text-right">Vues</TableHead>
                <TableHead className="text-right">Visiteurs</TableHead>
                <TableHead className="text-right">Durée moy.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((notice, index) => (
                <TableRow key={notice.id}>
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/artworks/${notice.id}`}
                      className="flex items-center gap-2 hover:underline"
                      target="_blank"
                    >
                      <span className="truncate max-w-[300px]">{notice.title}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {notice.views.toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    {notice.uniqueVisitors.toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDuration(notice.avgDurationMs)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
