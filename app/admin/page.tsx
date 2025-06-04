import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  Clock,
  FileText,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  // Mock data - replace with real data from your API
  const stats = {
    totalUsers: 24,
    activeWriters: 8,
    publishedNotices: 47,
    monthlyViews: 12400,
    recentActivity: [
      {
        id: '1',
        type: 'user_registered',
        description: "Marie Dubois s'est inscrite",
        timestamp: '2025-06-04 09:30',
        user: 'Marie Dubois',
      },
      {
        id: '2',
        type: 'notice_published',
        description: 'Notice publiée: "Les Nymphéas de Monet"',
        timestamp: '2025-06-04 08:15',
        user: 'Jean Martin',
      },
      {
        id: '3',
        type: 'user_promoted',
        description: "Sophie Laurent promue en tant qu'admin",
        timestamp: '2025-06-03 16:45',
        user: 'Admin System',
      },
    ],
  };

  const quickActions = [
    {
      title: 'Gestion Utilisateurs',
      description: 'Gérer les rôles et permissions',
      href: '/admin/users',
      icon: Users,
      stats: `${stats.totalUsers} utilisateurs`,
      color: 'text-blue-600',
    },
    {
      title: 'Modération Contenu',
      description: 'Réviser et approuver les notices',
      href: '/admin/content',
      icon: FileText,
      stats: '3 en attente',
      color: 'text-orange-600',
    },
    {
      title: 'Statistiques',
      description: 'Analyser les performances',
      href: '/admin/analytics',
      icon: BarChart3,
      stats: `${stats.monthlyViews.toLocaleString()} vues ce mois`,
      color: 'text-green-600',
    },
    {
      title: 'Configuration',
      description: 'Paramètres système',
      href: '/admin/settings',
      icon: Settings,
      stats: 'Système en ligne',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Tableau de Bord
            </h1>
            <p className="text-muted-foreground mt-2">
              Vue d'ensemble de la plateforme ArtNote
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Activité en temps réel
            </Button>
            <Link href="/admin/settings">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Utilisateurs Total
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+2 ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rédacteurs Actifs
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWriters}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeWriters / stats.totalUsers) * 100)}% du
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notices Publiées
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedNotices}</div>
            <p className="text-xs text-muted-foreground">+8 cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vues Mensuelles
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.monthlyViews / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">
              +18% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
          <div className="space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg bg-muted ${action.color}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {action.stats}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Activité Récente</h2>
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`p-4 ${
                      index !== stats.recentActivity.length - 1
                        ? 'border-b'
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'user_registered' && (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        {activity.type === 'notice_published' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'user_promoted' && (
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Link href="/admin/logs">
              <Button variant="outline" size="sm">
                Voir tous les logs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* System Health Alert (if needed) */}
      <div className="mt-8">
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Information système
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Sauvegarde automatique prévue ce soir à 02:00. Aucune action
                  requise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
