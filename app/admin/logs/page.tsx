import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  User,
  Zap,
} from 'lucide-react';

export default function AdminLogsPage() {
  // Mock data - replace with real data from your API
  const logs = [
    {
      id: '1',
      timestamp: '2025-06-04T10:30:00Z',
      level: 'INFO',
      event: 'User Login',
      user: 'marie.dubois@email.com',
      ip: '192.168.1.100',
      details: 'Successful authentication',
      category: 'auth',
    },
    {
      id: '2',
      timestamp: '2025-06-04T10:25:00Z',
      level: 'WARNING',
      event: 'Failed Login Attempt',
      user: 'unknown@email.com',
      ip: '192.168.1.101',
      details: 'Invalid credentials - 3rd attempt',
      category: 'security',
    },
    {
      id: '3',
      timestamp: '2025-06-04T10:20:00Z',
      level: 'INFO',
      event: 'Notice Published',
      user: 'jean.martin@email.com',
      ip: '192.168.1.102',
      details: 'Notice "Les Nymphéas de Monet" published',
      category: 'content',
    },
    {
      id: '4',
      timestamp: '2025-06-04T10:15:00Z',
      level: 'ERROR',
      event: 'System Error',
      user: 'system',
      ip: 'localhost',
      details: 'Database connection timeout',
      category: 'system',
    },
    {
      id: '5',
      timestamp: '2025-06-04T10:10:00Z',
      level: 'INFO',
      event: 'User Role Changed',
      user: 'admin@artnote.com',
      ip: '192.168.1.103',
      details: 'pierre.moreau@email.com promoted to WRITER',
      category: 'admin',
    },
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Erreur
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Attention
          </span>
        );
      case 'INFO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <Zap className="w-3 h-3 mr-1" />
            Info
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <User className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'content':
        return <Calendar className="h-4 w-4" />;
      case 'system':
        return <Zap className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journaux d'Audit</h1>
          <p className="text-muted-foreground">
            Surveillance de l'activité système et sécurité
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Événements Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">147</div>
            <p className="text-xs text-muted-foreground">+12% vs hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Erreurs Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">-2 vs hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connexions Échouées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <p className="text-xs text-muted-foreground">+3 vs hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actions Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+5 vs hier</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Niveau: Tous
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Période: Aujourd'hui
            </Button>
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Utilisateur: Tous
            </Button>
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Rechercher dans les détails
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journaux d'Activité</CardTitle>
          <CardDescription>
            Événements récents du système et actions utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                    {getCategoryIcon(log.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{log.event}</h4>
                      {getLevelBadge(log.level)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.details}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {log.user} • {log.ip} •{' '}
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Search className="mr-2 h-4 w-4" />
                      Voir les détails
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrer par cet utilisateur
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Exporter cet événement
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Affichage de 5 sur 147 événements
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Précédent
              </Button>
              <Button variant="outline" size="sm">
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
