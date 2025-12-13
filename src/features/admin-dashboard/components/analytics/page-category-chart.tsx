'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { type PageCategoryData } from './analytics-data';

type PageCategoryChartProps = {
  data: PageCategoryData[];
};

const chartConfig = {
  views: {
    label: 'Vues',
  },
  Accueil: {
    label: 'Accueil',
    color: 'hsl(var(--chart-1))',
  },
  Notices: {
    label: 'Notices',
    color: 'hsl(var(--chart-2))',
  },
  'À propos': {
    label: 'À propos',
    color: 'hsl(var(--chart-3))',
  },
  Dashboard: {
    label: 'Dashboard',
    color: 'hsl(var(--chart-4))',
  },
  Autres: {
    label: 'Autres',
    color: 'hsl(var(--chart-5))',
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
