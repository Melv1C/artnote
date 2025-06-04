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
import { Input } from '@/components/ui/input';
import {
  Activity,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export default function AdminUsersPage() {
  // Mock data - replace with real data from your API
  const users = [
    {
      id: '1',
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      role: 'WRITER',
      lastActive: '2025-06-03',
      artworkCount: 5,
      joinedAt: '2025-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jean Martin',
      email: 'jean.martin@email.com',
      role: 'WRITER',
      lastActive: '2025-06-01',
      artworkCount: 12,
      joinedAt: '2024-11-20',
      status: 'active',
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      role: 'ADMIN',
      lastActive: '2025-06-02',
      artworkCount: 8,
      joinedAt: '2024-08-10',
      status: 'active',
    },
    {
      id: '4',
      name: 'Pierre Moreau',
      email: 'pierre.moreau@email.com',
      role: 'VIEWER',
      lastActive: '2025-05-30',
      artworkCount: 0,
      joinedAt: '2025-02-28',
      status: 'active',
    },
    {
      id: '5',
      name: 'Claire Rousseau',
      email: 'claire.rousseau@email.com',
      role: 'WRITER',
      lastActive: '2025-03-15',
      artworkCount: 3,
      joinedAt: '2025-03-01',
      status: 'inactive',
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Admin
          </span>
        );
      case 'WRITER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Rédacteur
          </span>
        );
      case 'VIEWER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Lecteur
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Actif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Inactif
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Suspendu
          </span>
        );
      default:
        return null;
    }
  };

  const roleStats = {
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    WRITER: users.filter((u) => u.role === 'WRITER').length,
    VIEWER: users.filter((u) => u.role === 'VIEWER').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestion des Utilisateurs
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les comptes utilisateur, rôles et permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un utilisateur
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter((u) => u.status === 'active').length} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administrateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.ADMIN}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((roleStats.ADMIN / users.length) * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rédacteurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.WRITER}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((roleStats.WRITER / users.length) * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lecteurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.VIEWER}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((roleStats.VIEWER / users.length) * 100)}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer par rôle
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer par statut
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Utilisateurs</CardTitle>
          <CardDescription>
            Liste complète des utilisateurs avec leurs rôles et statuts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-6 hover:bg-muted/50 transition-colors ${
                  index !== users.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{user.name}</h4>
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le{' '}
                      {new Date(user.joinedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {user.artworkCount}
                    </div>
                    <div className="text-xs text-muted-foreground">notices</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {new Date(user.lastActive).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      dernière activité
                    </div>
                  </div>

                  <div className="text-center">{getRoleBadge(user.role)}</div>

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
                        <UserCheck className="mr-2 h-4 w-4" />
                        Voir le profil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Changer le rôle
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Activity className="mr-2 h-4 w-4" />
                        Voir l'activité
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === 'active' ? (
                        <DropdownMenuItem className="text-orange-600">
                          Suspendre le compte
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          Réactiver le compte
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        Supprimer le compte
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de {users.length} utilisateurs
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Précédent
          </Button>
          <Button variant="outline" size="sm">
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
