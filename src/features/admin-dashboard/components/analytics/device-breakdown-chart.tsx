'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';
import { type DeviceBreakdown } from './analytics-data';

type DeviceBreakdownChartProps = {
  data: DeviceBreakdown[];
};

const chartConfig = {
  visitors: {
    label: 'Visiteurs',
  },
  Desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  Mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
  Tablet: {
    label: 'Tablet',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function DeviceBreakdownChart({ data }: DeviceBreakdownChartProps) {
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Appareils</CardTitle>
        <CardDescription>Répartition par type d&apos;appareil</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="visitors"
                nameKey="device"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalVisitors.toLocaleString('fr-FR')}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            Visiteurs
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
        {data.length > 0 && (
          <div className="flex justify-center gap-4 mt-2">
            {data.map(item => (
              <div key={item.device} className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-muted-foreground">
                  {item.device} ({Math.round((item.visitors / totalVisitors) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
