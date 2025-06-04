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
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';

export default function AdminContentPage() {
  // Mock data - replace with real data from your API
  const notices = [
    {
      id: '1',
      title: 'Les Nymphéas de Monet - Une révolution impressionniste',
      author: 'Jean Martin',
      status: 'published',
      publishedAt: '2025-06-01',
      views: 3245,
      wordCount: 1250,
      lastModified: '2025-06-01',
      excerpt:
        'Une analyse approfondie de cette série iconique de Claude Monet...',
    },
    {
      id: '2',
      title: 'La Joconde - Secrets et mystères de Léonard de Vinci',
      author: 'Marie Dubois',
      status: 'draft',
      publishedAt: null,
      views: 0,
      wordCount: 890,
      lastModified: '2025-06-03',
      excerpt:
        'Découvrez les techniques révolutionnaires utilisées par le maître...',
    },
    {
      id: '3',
      title: 'Guernica de Picasso - Art et engagement politique',
      author: 'Sophie Laurent',
      status: 'review',
      publishedAt: null,
      views: 0,
      wordCount: 1450,
      lastModified: '2025-06-02',
      excerpt: "Comment Picasso a transformé l'art en arme contre la guerre...",
    },
    {
      id: '4',
      title: 'La Nuit étoilée - Le génie torturé de Van Gogh',
      author: 'Jean Martin',
      status: 'published',
      publishedAt: '2025-05-28',
      views: 1987,
      wordCount: 1100,
      lastModified: '2025-05-28',
      excerpt: "L'histoire derrière l'une des œuvres les plus célèbres...",
    },
    {
      id: '5',
      title: "Le Cri de Munch - Expression de l'angoisse moderne",
      author: 'Marie Dubois',
      status: 'archived',
      publishedAt: '2025-04-15',
      views: 1654,
      wordCount: 980,
      lastModified: '2025-04-15',
      excerpt: "Une exploration de l'expressionnisme et de l'art moderne...",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Publié
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <Edit className="mr-1 h-3 w-3" />
            Brouillon
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            <Clock className="mr-1 h-3 w-3" />
            En révision
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="mr-1 h-3 w-3" />
            Archivé
          </span>
        );
      default:
        return null;
    }
  };

  const statusCounts = {
    published: notices.filter((n) => n.status === 'published').length,
    draft: notices.filter((n) => n.status === 'draft').length,
    review: notices.filter((n) => n.status === 'review').length,
    archived: notices.filter((n) => n.status === 'archived').length,
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestion du Contenu
            </h1>
            <p className="text-muted-foreground mt-2">
              Modérez et gérez toutes les notices de la plateforme
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Rapports de contenu
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Nouvelle notice
            </Button>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notices Publiées
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.published}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((statusCounts.published / notices.length) * 100)}% du
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Révision
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.review}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Brouillons
              </CardTitle>
              <Edit className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.draft}</div>
            <p className="text-xs text-muted-foreground">
              En cours de rédaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total des Vues
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                notices.reduce((sum, notice) => sum + notice.views, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
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
                  placeholder="Rechercher par titre, auteur ou contenu..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer par statut
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer par auteur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions for Review */}
      {statusCounts.review > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Actions Prioritaires
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              {statusCounts.review} notice(s) en attente de révision nécessitent
              votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="default" size="sm">
                Réviser maintenant
              </Button>
              <Button variant="outline" size="sm">
                Voir la file d'attente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Notices</CardTitle>
          <CardDescription>
            Gérez le contenu de votre plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {notices.map((notice, index) => (
              <div
                key={notice.id}
                className={`p-6 hover:bg-muted/50 transition-colors ${
                  index !== notices.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-lg">
                            {notice.title}
                          </h3>
                          {getStatusBadge(notice.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notice.excerpt}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Par {notice.author}</span>
                          <span>•</span>
                          <span>{notice.wordCount} mots</span>
                          {notice.status === 'published' && (
                            <>
                              <span>•</span>
                              <span>{formatNumber(notice.views)} vues</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            Modifié le{' '}
                            {new Date(notice.lastModified).toLocaleDateString(
                              'fr-FR'
                            )}
                          </span>
                          {notice.publishedAt && (
                            <>
                              <span>•</span>
                              <span>
                                Publié le{' '}
                                {new Date(
                                  notice.publishedAt
                                ).toLocaleDateString('fr-FR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {notice.status === 'review' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approuver
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="mr-1 h-3 w-3" />
                          Rejeter
                        </Button>
                      </div>
                    )}

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
                          <Eye className="mr-2 h-4 w-4" />
                          Prévisualiser
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {notice.status === 'published' && (
                          <DropdownMenuItem>
                            <XCircle className="mr-2 h-4 w-4" />
                            Dépublier
                          </DropdownMenuItem>
                        )}
                        {notice.status === 'draft' && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Publier
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de {notices.length} notices
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
