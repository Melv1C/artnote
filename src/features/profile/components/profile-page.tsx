import { FullPageMessage } from '@/components/full-page-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor, RichTextViewer } from '@/components/ui/rich-text-editor';
import { AvatarUpload } from './avatar-upload';
import { useProfileStats } from '../hooks/use-profile-stats';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { USER_ROLE_LABELS } from '@/features/user-management/lib/user-accounts';
import { updateProfile } from '../actions/profile-mutations';
import { formatCount, formatShortDate } from '@/lib/format';
import { runMutation } from '@/lib/run-mutation';
import {
  CvLinkSchema,
  UserProfileFormSchema,
  type User,
  type UserProfileForm,
} from '@/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as LinkIcon, Save, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const profileValues = (user: User): UserProfileForm => ({
  name: user.name,
  bio: user.bio ?? '',
  cv: user.cv ?? '',
});

export function ProfilePage() {
  const { user, isLoading: isAuthLoading, refetch, canViewDashboard } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const stats = useProfileStats({ enabled: canViewDashboard });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserProfileForm>({
    resolver: zodResolver(UserProfileFormSchema),
    // Follows the saved profile: filled once the session loads, and again after each save
    values: user ? profileValues(user) : undefined,
  });

  const onSubmit = async (data: UserProfileForm) => {
    const saved = await runMutation(
      async () => {
        await updateProfile({ data });
        await refetch();
      },
      { success: 'Profil mis à jour !', failure: 'Erreur lors de la mise à jour du profil' },
    );
    if (saved) setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center" aria-busy="true">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement du profil…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <FullPageMessage title="Connectez-vous">
        Votre profil s’affiche une fois connecté, avec le bouton « Se connecter » en haut de la
        page.
      </FullPageMessage>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-4xl px-4 pt-6 pb-10 sm:px-6 md:pt-12 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl font-medium tracking-tight">Mon profil</h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos informations personnelles et votre profil public
              </p>
            </div>
          </div>
        </div>

        <div
          className={
            canViewDashboard
              ? 'grid grid-cols-1 lg:grid-cols-3 gap-8'
              : 'flex items-center justify-center min-h-[60vh]'
          }
        >
          <div
            className={
              canViewDashboard
                ? 'lg:col-span-1'
                : 'flex items-center justify-center min-h-[60vh] w-full'
            }
          >
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
                <CardDescription>Votre photo apparaîtra sur vos notices publiées</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload user={user} />

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rôle</span>
                    <span className="text-sm font-medium">{USER_ROLE_LABELS[user.role]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Membre depuis</span>
                    <span className="text-sm">{formatShortDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email vérifié</span>
                    <span className="text-sm">{user.emailVerified ? 'Oui' : 'Non'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canViewDashboard && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Mes statistiques</CardTitle>
                  <CardDescription>Aperçu de votre activité sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stats.data ? formatCount(stats.data.published) : '—'}
                      </div>
                      <p className="text-sm text-muted-foreground">Notices publiées</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stats.data ? formatCount(stats.data.views) : '—'}
                      </div>
                      <p className="text-sm text-muted-foreground">Vues totales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {canViewDashboard && (
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Informations personnelles</CardTitle>
                        <CardDescription>
                          Ces informations seront visibles sur votre profil public
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          Modifier le profil
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button type="button" variant="outline" onClick={handleCancel}>
                            Annuler
                          </Button>
                          <Button type="submit" disabled={isSubmitting || !isDirty}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      {isEditing ? (
                        <div>
                          <Input id="name" {...register('name')} placeholder="Votre nom complet" />
                          {errors.name && (
                            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                          )}
                        </div>
                      ) : (
                        <div className="py-2 px-3 border rounded-md bg-muted/50">{user.name}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <div className="py-2 px-3 border rounded-md bg-muted/50 text-muted-foreground">
                        {user.email}
                        <span className="text-xs ml-2">(non modifiable)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <p className="text-sm text-muted-foreground">
                        Parlez de votre expertise en art et histoire de l’art
                      </p>
                      {isEditing ? (
                        <div>
                          <RichTextEditor
                            label="Biographie"
                            value={watch('bio') || ''}
                            onChange={value =>
                              setValue('bio', value || '', {
                                shouldDirty: true,
                              })
                            }
                            placeholder="Décrivez votre parcours, vos spécialisations, votre passion pour l’art…"
                            className="min-h-[200px]"
                          />
                          {errors.bio && (
                            <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
                          )}
                        </div>
                      ) : (
                        <div className="py-2 px-3 border rounded-md bg-muted/50 min-h-[100px]">
                          {user.bio ? (
                            <RichTextViewer content={user.bio} />
                          ) : (
                            <span className="text-muted-foreground italic">
                              Aucune biographie renseignée
                            </span>
                          )}
                        </div>
                      )}
                    </div>

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
                              {...register('cv')}
                              placeholder="https://mon-portfolio.com"
                              type="url"
                            />
                            {errors.cv && (
                              <p className="text-sm text-destructive mt-1">{errors.cv.message}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 px-3 border rounded-md bg-muted/50">
                          {/* Checked again before it becomes an href: the row may predate the check */}
                          {user.cv && CvLinkSchema.safeParse(user.cv).success ? (
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
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
