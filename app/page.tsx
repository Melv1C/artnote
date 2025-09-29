import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 text-primary">
            La peinture dans tout son art
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            (Re)découvrez l'histoire de la peinture à travers des notices scientifiques et visitez
            les musées belges autrement grâce à cette plateforme accessible et didactique
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/artworks">Voir toutes les notices</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/whats-new">Dernière notice publiée</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
