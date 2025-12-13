import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import {
  getAnalyticsSummary,
  getBrowserStats,
  getDailyTrends,
  getDeviceBreakdown,
  getPageCategoryBreakdown,
  getRealtimeStats,
  getTopNotices,
} from './analytics-data';
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

// Async data-fetching components
async function OverviewCardsLoader() {
  const [summary, realtimeStats] = await Promise.all([getAnalyticsSummary(), getRealtimeStats()]);
  return <AnalyticsOverviewCards summary={summary} realtimeStats={realtimeStats} />;
}

async function TrafficTrendsLoader() {
  const data = await getDailyTrends(30);
  return <TrafficTrendsChart data={data} />;
}

async function DeviceBreakdownLoader() {
  const data = await getDeviceBreakdown(30);
  return <DeviceBreakdownChart data={data} />;
}

async function PageCategoryLoader() {
  const data = await getPageCategoryBreakdown(30);
  return <PageCategoryChart data={data} />;
}

async function BrowserStatsLoader() {
  const data = await getBrowserStats(30);
  return <BrowserStatsChart data={data} />;
}

async function TopNoticesLoader() {
  const data = await getTopNotices(10, 30);
  return <TopNoticesTable data={data} />;
}

export function AnalyticsSection() {
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
        <OverviewCardsLoader />
      </Suspense>

      {/* Traffic Trends Chart - Full Width */}
      <Suspense fallback={<ChartSkeleton title="Tendances du trafic" />}>
        <TrafficTrendsLoader />
      </Suspense>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Suspense fallback={<ChartSkeleton title="Appareils" />}>
          <DeviceBreakdownLoader />
        </Suspense>

        <Suspense fallback={<ChartSkeleton title="Pages visitées" />}>
          <PageCategoryLoader />
        </Suspense>

        <Suspense fallback={<ChartSkeleton title="Navigateurs" />}>
          <BrowserStatsLoader />
        </Suspense>
      </div>

      {/* Top Notices Table */}
      <Suspense fallback={<TableSkeleton />}>
        <TopNoticesLoader />
      </Suspense>
    </div>
  );
}
