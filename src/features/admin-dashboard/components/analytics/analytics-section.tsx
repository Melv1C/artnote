import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, use } from 'react';
import type { AdminDashboardData } from '../../dashboard-queries';
import { AnalyticsOverviewCards } from './analytics-overview-cards';
import { BrowserStatsChart } from './browser-stats-chart';
import { DeviceBreakdownChart } from './device-breakdown-chart';
import { PageCategoryChart } from './page-category-chart';
import { TopNoticesTable } from './top-notices-table';
import { TrafficTrendsChart } from './traffic-trends-chart';

// Skeleton components for loading states
function OverviewCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type AnalyticsData = AdminDashboardData['analytics'];

// Data components resolving deferred loader promises
function OverviewCardsLoader({ data }: { data: AnalyticsData['overview'] }) {
  const { summary, realtimeStats } = use(data);
  return <AnalyticsOverviewCards summary={summary} realtimeStats={realtimeStats} />;
}

function TrafficTrendsLoader({ data }: { data: AnalyticsData['dailyTrends'] }) {
  return <TrafficTrendsChart data={use(data)} />;
}

function DeviceBreakdownLoader({ data }: { data: AnalyticsData['deviceBreakdown'] }) {
  return <DeviceBreakdownChart data={use(data)} />;
}

function PageCategoryLoader({ data }: { data: AnalyticsData['pageCategories'] }) {
  return <PageCategoryChart data={use(data)} />;
}

function BrowserStatsLoader({ data }: { data: AnalyticsData['browserStats'] }) {
  return <BrowserStatsChart data={use(data)} />;
}

function TopNoticesLoader({ data }: { data: AnalyticsData['topNotices'] }) {
  return <TopNoticesTable data={use(data)} />;
}

export function AnalyticsSection({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Statistiques</h2>
        <p className="text-muted-foreground">
          Analyse du trafic et des performances sur les 30 derniers jours
        </p>
      </div>

      {/* Overview Cards */}
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsLoader data={data.overview} />
      </Suspense>

      {/* Traffic Trends Chart - Full Width */}
      <Suspense fallback={<ChartSkeleton title="Tendances du trafic" />}>
        <TrafficTrendsLoader data={data.dailyTrends} />
      </Suspense>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Suspense fallback={<ChartSkeleton title="Appareils" />}>
          <DeviceBreakdownLoader data={data.deviceBreakdown} />
        </Suspense>

        <Suspense fallback={<ChartSkeleton title="Pages visitées" />}>
          <PageCategoryLoader data={data.pageCategories} />
        </Suspense>

        <Suspense fallback={<ChartSkeleton title="Navigateurs" />}>
          <BrowserStatsLoader data={data.browserStats} />
        </Suspense>
      </div>

      {/* Top Notices Table */}
      <Suspense fallback={<TableSkeleton />}>
        <TopNoticesLoader data={data.topNotices} />
      </Suspense>
    </div>
  );
}
