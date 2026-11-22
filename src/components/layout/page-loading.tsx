/** Shown while a page loads: a thin bar along the top edge, so the current page stays readable. */
export function PageLoading() {
  return (
    <div
      role="progressbar"
      aria-label="Chargement de la page"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-primary/15"
    >
      <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] bg-primary" />
    </div>
  );
}
