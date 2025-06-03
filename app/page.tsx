import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Découvrez l'art à travers des{' '}
            <span className="text-primary">notices enrichies</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explorez les œuvres d'art avec des notices détaillées, découvrez les
            artistes qui ont marqué l'histoire et visitez les lieux qui abritent
            ces trésors culturels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/artworks">
                Découvrir les œuvres
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
