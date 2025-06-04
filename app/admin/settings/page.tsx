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
import {
  Database,
  Globe,
  Mail,
  Save,
  Server,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Configuration Système
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les paramètres globaux de la plateforme ArtNote
            </p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder les modifications
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres Généraux
              </CardTitle>
              <CardDescription>
                Configuration de base de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Nom du site</Label>
                <Input id="site-name" defaultValue="ArtNote" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Description</Label>
                <Textarea
                  id="site-description"
                  defaultValue="Plateforme de notices d'art pour découvrir et comprendre les œuvres artistiques"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email de contact</Label>
                <Input
                  id="contact-email"
                  type="email"
                  defaultValue="contact@artnote.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email administrateur</Label>
                <Input
                  id="admin-email"
                  type="email"
                  defaultValue="admin@artnote.fr"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Utilisateurs
              </CardTitle>
              <CardDescription>
                Paramètres liés aux comptes utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Inscription ouverte</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux nouveaux utilisateurs de s'inscrire
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modération des inscriptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Approuver manuellement les nouveaux comptes
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Désactivé
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-role">Rôle par défaut</Label>
                <select
                  id="default-role"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  defaultValue="VIEWER"
                >
                  <option value="VIEWER">Lecteur</option>
                  <option value="WRITER">Rédacteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localisation
              </CardTitle>
              <CardDescription>Paramètres de langue et région</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Langue par défaut</Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  defaultValue="fr"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  defaultValue="Europe/Paris"
                >
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">
                    America/New_York (EST)
                  </option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Technical Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité et authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Obligatoire pour les administrateurs
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configuré
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">
                  Durée de session (heures)
                </Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="24"
                  min="1"
                  max="168"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">
                  Tentatives de connexion max
                </Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  defaultValue="5"
                  min="3"
                  max="10"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Logs de sécurité</Label>
                  <p className="text-sm text-muted-foreground">
                    Enregistrer les tentatives de connexion
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base de Données
              </CardTitle>
              <CardDescription>Maintenance et sauvegarde</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Sauvegarde quotidienne à 02:00
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configuré
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Dernière sauvegarde</Label>
                <p className="text-sm">04/06/2025 à 02:00 - Succès</p>
              </div>
              <div className="space-y-2">
                <Label>Espace utilisé</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: '34%' }}
                    ></div>
                  </div>
                  <span className="text-sm">2.1 GB / 6.0 GB</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Créer une sauvegarde maintenant
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notifications Email
              </CardTitle>
              <CardDescription>
                Configuration des emails automatiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-server">Serveur SMTP</Label>
                <Input id="smtp-server" defaultValue="smtp.artnote.fr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input id="smtp-port" defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-security">Sécurité</Label>
                  <select
                    id="smtp-security"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    defaultValue="tls"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">Aucune</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications admin</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les alertes système
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Performance
              </CardTitle>
              <CardDescription>Optimisation et cache</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cache des pages</Label>
                  <p className="text-sm text-muted-foreground">
                    Mise en cache pour améliorer les performances
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compression des images</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimisation automatique des images
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cache-duration">Durée du cache (minutes)</Label>
                <Input
                  id="cache-duration"
                  type="number"
                  defaultValue="60"
                  min="5"
                  max="1440"
                />
              </div>
              <Button variant="outline" className="w-full">
                <Server className="mr-2 h-4 w-4" />
                Vider le cache
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>État du Système</CardTitle>
            <CardDescription>
              Surveillance en temps réel des services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <div className="font-medium">Base de données</div>
                <div className="text-sm text-muted-foreground">
                  Opérationnelle
                </div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <div className="font-medium">Serveur web</div>
                <div className="text-sm text-muted-foreground">
                  Opérationnel
                </div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground">
                  Opérationnel
                </div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <div className="font-medium">Stockage</div>
                <div className="text-sm text-muted-foreground">34% utilisé</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
