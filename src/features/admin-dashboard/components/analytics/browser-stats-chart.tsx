'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { type BrowserData } from './analytics-data';

type BrowserStatsChartProps = {
  data: BrowserData[];
};

const chartConfig = {
  count: {
    label: 'Visiteurs',
  },
} satisfies ChartConfig;

export function BrowserStatsChart({ data }: BrowserStatsChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Navigateurs</CardTitle>
        <CardDescription>Top 5 des navigateurs utilisés</CardDescription>
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
                dataKey="browser"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={70}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
