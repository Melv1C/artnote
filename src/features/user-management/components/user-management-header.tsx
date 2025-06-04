export function UserManagementHeader() {
  return (
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
        <div className="flex gap-2"></div>
      </div>
    </div>
  );
}
