import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  Calendar,
  Download,
  Eye,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  // Mock data - replace with real data from your API
  const analyticsData = {
    overview: {
      totalViews: 45620,
      uniqueVisitors: 12890,
      avgSessionDuration: '4m 32s',
      bounceRate: '34%',
    },
    trends: {
      viewsGrowth: 18.5,
      visitorsGrowth: 12.3,
      sessionGrowth: -2.1,
      bounceRateChange: -5.2,
    },
    topNotices: [
      {
        id: '1',
        title: 'Les Nymphéas de Monet',
        views: 3245,
        uniqueViews: 2891,
        avgTime: '6m 12s',
        author: 'Jean Martin',
      },
      {
        id: '2',
        title: 'La Joconde - Secrets de Léonard',
        views: 2876,
        uniqueViews: 2543,
        avgTime: '5m 45s',
        author: 'Marie Dubois',
      },
      {
        id: '3',
        title: 'Guernica de Picasso',
        views: 2234,
        uniqueViews: 1987,
        avgTime: '4m 23s',
        author: 'Sophie Laurent',
      },
      {
        id: '4',
        title: 'La Nuit étoilée de Van Gogh',
        views: 1987,
        uniqueViews: 1756,
        avgTime: '5m 02s',
        author: 'Jean Martin',
      },
      {
        id: '5',
        title: 'Le Cri de Munch',
        views: 1654,
        uniqueViews: 1432,
        avgTime: '3m 56s',
        author: 'Marie Dubois',
      },
    ],
    recentActivity: [
      { date: '04/06', views: 1245, visitors: 432 },
      { date: '03/06', views: 1156, visitors: 398 },
      { date: '02/06', views: 1387, visitors: 445 },
      { date: '01/06', views: 1023, visitors: 356 },
      { date: '31/05', views: 1298, visitors: 421 },
      { date: '30/05', views: 987, visitors: 334 },
      { date: '29/05', views: 1134, visitors: 387 },
    ],
    demographics: {
      countries: [
        { name: 'France', percentage: 68.4, visitors: 8812 },
        { name: 'Belgique', percentage: 12.3, visitors: 1585 },
        { name: 'Suisse', percentage: 8.9, visitors: 1147 },
        { name: 'Canada', percentage: 6.2, visitors: 799 },
        { name: 'Autres', percentage: 4.2, visitors: 541 },
      ],
      devices: [
        { type: 'Desktop', percentage: 52.1 },
        { type: 'Mobile', percentage: 39.7 },
        { type: 'Tablet', percentage: 8.2 },
      ],
    },
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR');
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Statistiques & Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Analysez les performances et l'engagement de votre plateforme
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Période personnalisée
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter les données
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vues Totales
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsData.overview.totalViews)}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.trends.viewsGrowth)}
              <span className={getTrendColor(analyticsData.trends.viewsGrowth)}>
                +{analyticsData.trends.viewsGrowth}% ce mois
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visiteurs Uniques
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsData.overview.uniqueVisitors)}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.trends.visitorsGrowth)}
              <span
                className={getTrendColor(analyticsData.trends.visitorsGrowth)}
              >
                +{analyticsData.trends.visitorsGrowth}% ce mois
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Durée Moyenne
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.avgSessionDuration}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.trends.sessionGrowth)}
              <span
                className={getTrendColor(analyticsData.trends.sessionGrowth)}
              >
                {analyticsData.trends.sessionGrowth}% ce mois
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de Rebond
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.bounceRate}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.trends.bounceRateChange)}
              <span
                className={getTrendColor(analyticsData.trends.bounceRateChange)}
              >
                {analyticsData.trends.bounceRateChange}% ce mois
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Notices */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notices les Plus Populaires
              </CardTitle>
              <CardDescription>
                Classement des notices par nombre de vues (30 derniers jours)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {analyticsData.topNotices.map((notice, index) => (
                  <div
                    key={notice.id}
                    className={`p-4 ${
                      index !== analyticsData.topNotices.length - 1
                        ? 'border-b'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {notice.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              par {notice.author}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {formatNumber(notice.views)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notice.avgTime}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demographics */}
        <div className="space-y-6">
          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition Géographique</CardTitle>
              <CardDescription>Origine des visiteurs par pays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.demographics.countries.map((country) => (
                  <div
                    key={country.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">
                        {country.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {country.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(country.visitors)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Types */}
          <Card>
            <CardHeader>
              <CardTitle>Types d'Appareils</CardTitle>
              <CardDescription>Répartition par type d'appareil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.demographics.devices.map((device) => (
                  <div
                    key={device.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-sm font-medium">{device.type}</span>
                    </div>
                    <div className="text-sm font-bold">
                      {device.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Chart */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Activité des 7 Derniers Jours</CardTitle>
            <CardDescription>
              Évolution des vues et visiteurs jour par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.recentActivity.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center"
                >
                  <div className="w-full space-y-1">
                    <div
                      className="bg-primary/80 rounded-t"
                      style={{
                        height: `${
                          (day.views /
                            Math.max(
                              ...analyticsData.recentActivity.map(
                                (d) => d.views
                              )
                            )) *
                          200
                        }px`,
                        minHeight: '10px',
                      }}
                    ></div>
                    <div
                      className="bg-secondary rounded-t"
                      style={{
                        height: `${
                          (day.visitors /
                            Math.max(
                              ...analyticsData.recentActivity.map(
                                (d) => d.visitors
                              )
                            )) *
                          100
                        }px`,
                        minHeight: '8px',
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary/80 rounded"></div>
                <span>Vues</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded"></div>
                <span>Visiteurs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
