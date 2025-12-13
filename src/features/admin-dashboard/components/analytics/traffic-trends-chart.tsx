'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { type DailyTrendData } from './analytics-data';

type TrafficTrendsChartProps = {
  data: DailyTrendData[];
};

const chartConfig = {
  pageViews: {
    label: 'Pages vues',
    color: 'hsl(var(--chart-1))',
  },
  uniqueVisitors: {
    label: 'Visiteurs uniques',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TrafficTrendsChart({ data }: TrafficTrendsChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendances du trafic</CardTitle>
        <CardDescription>Pages vues et visiteurs uniques sur les 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDate}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
              <ChartTooltip content={<ChartTooltipContent labelFormatter={formatDate} />} />
              <Area
                type="monotone"
                dataKey="pageViews"
                stroke="var(--color-pageViews)"
                fill="var(--color-pageViews)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="var(--color-uniqueVisitors)"
                fill="var(--color-uniqueVisitors)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
