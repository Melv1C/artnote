'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/hooks';
import {
  Camera,
  Download,
  Eye,
  Link as LinkIcon,
  Save,
  Upload,
  User,
} from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state - in real app, this would be managed with a form library like react-hook-form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    cv: user?.cv || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Implement save logic with your API
    try {
      // await updateProfile(formData);
      console.log('Saving profile:', formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      cv: user?.cv || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos informations personnelles et votre profil public
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <User className="mr-2 h-4 w-4" />
                Modifier le profil
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Quick Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
                <CardDescription>
                  Votre photo apparaîtra sur vos notices publiées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-lg">
                      {user.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Camera className="mr-2 h-4 w-4" />
                        Changer
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rôle</span>
                    <span className="text-sm font-medium capitalize">
                      {user.role?.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Membre depuis
                    </span>
                    <span className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Email vérifié
                    </span>
                    <span className="text-sm">
                      {user.emailVerified ? '✅ Oui' : '❌ Non'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir le profil public
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger mes données
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Ces informations seront visibles sur votre profil public
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Votre nom complet"
                    />
                  ) : (
                    <div className="py-2 px-3 border rounded-md bg-muted/50">
                      {user.name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="py-2 px-3 border rounded-md bg-muted/50 text-muted-foreground">
                    {user.email}
                    <span className="text-xs ml-2">(non modifiable)</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <p className="text-sm text-muted-foreground">
                    Parlez de votre expertise en art et histoire de l'art
                  </p>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Décrivez votre parcours, vos spécialisations, votre passion pour l'art..."
                      rows={4}
                    />
                  ) : (
                    <div className="py-2 px-3 border rounded-md bg-muted/50 min-h-[100px]">
                      {user.bio || (
                        <span className="text-muted-foreground italic">
                          Aucune biographie renseignée
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CV */}
                <div className="space-y-2">
                  <Label htmlFor="cv">CV / Portfolio</Label>
                  <p className="text-sm text-muted-foreground">
                    Lien vers votre CV en ligne ou portfolio
                  </p>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          id="cv"
                          value={formData.cv}
                          onChange={(e) =>
                            setFormData({ ...formData, cv: e.target.value })
                          }
                          placeholder="https://mon-portfolio.com"
                          type="url"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-2 px-3 border rounded-md bg-muted/50">
                      {user.cv ? (
                        <a
                          href={user.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          {user.cv}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Aucun CV/Portfolio renseigné
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mes statistiques</CardTitle>
                <CardDescription>
                  Aperçu de votre activité sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">5</div>
                    <p className="text-sm text-muted-foreground">
                      Notices publiées
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1,234</div>
                    <p className="text-sm text-muted-foreground">
                      Vues totales
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-sm text-muted-foreground">
                      Concepts créés
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <p className="text-sm text-muted-foreground">
                      Mots-clés ajoutés
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
