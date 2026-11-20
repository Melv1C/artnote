import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import type { PageCategoryRow } from '@/features/analytics/actions/analytics-queries';

type PageCategoryChartProps = {
  data: PageCategoryRow[];
};

const chartConfig = {
  views: {
    label: 'Vues',
  },
  Accueil: {
    label: 'Accueil',
    color: 'var(--chart-1)',
  },
  Notices: {
    label: 'Notices',
    color: 'var(--chart-2)',
  },
  'À propos': {
    label: 'À propos',
    color: 'var(--chart-3)',
  },
  Dashboard: {
    label: 'Dashboard',
    color: 'var(--chart-4)',
  },
  Autres: {
    label: 'Autres',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

export function PageCategoryChart({ data }: PageCategoryChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Pages visitées</CardTitle>
        <CardDescription>Répartition des vues par section</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12 }}>
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="views" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
