export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de la plateforme ArtNote</p>
      </div>
      <div className="flex gap-2"></div>
    </div>
  );
}
