import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'ArtNote - À propos',
  description: "Découvrez l'équipe derrière ArtNote, notre mission et nos valeurs.",
};

export default function AboutPage() {
  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl">
        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center mb-12 lg:mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">À propos</h1>
          <p className="mt-6 text-xl text-muted-foreground">
            ArtNote est un projet fondé en 2025, né de la rencontre entre deux univers
            complémentaires : l'informatique et l'histoire de l'art.
          </p>
        </div>

        {/* Founders photo */}
        <div className="mx-auto max-w-2xl mb-12 lg:mb-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-muted to-muted-foreground/10">
            <Image
              src="/founders.jpeg"
              alt="Melvyn Claes & Elise Poot"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Founders alternating blocks */}
        <div className="space-y-8 lg:space-y-12 mb-12 lg:mb-20">
          {/* Elise */}
          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-6 sm:gap-8 items-start sm:items-center">
            {/* Mobile: Avatar */}
            <div className="flex-shrink-0 mx-auto sm:hidden">
              <div className="relative w-24 h-24 overflow-hidden rounded-full border-2 border-muted bg-gradient-to-br from-muted to-muted-foreground/10">
                <Image
                  src="/elise.jpeg"
                  alt="Elise Poot"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
            {/* Desktop: Large image */}
            <div className="hidden sm:block sm:col-span-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-muted to-muted-foreground/10">
                <Image
                  src="/elise.jpeg"
                  alt="Elise Poot"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
            <div className="flex-1 sm:col-span-8 text-center sm:text-left">
              <Card className="border-none shadow-none bg-transparent p-0">
                <CardHeader className="p-0">
                  <CardTitle className="text-xl lg:text-2xl">Elise Poot</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  « Je suis diplômée d'un master en Histoire de l'art à l'UCLouvain. Spécialisée
                  dans la peinture des XVIe et XVIIe siècles, je souhaite contribuer à rendre les
                  œuvres d'art accessibles à tous, sans pour autant sacrifier la rigueur
                  scientifique. J'assure la rédaction et la supervision des notices ».
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Melvyn */}
          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-6 sm:gap-8 items-start sm:items-center">
            {/* Mobile: Avatar */}
            <div className="flex-shrink-0 mx-auto sm:hidden">
              <div className="relative w-24 h-24 overflow-hidden rounded-full border-2 border-muted bg-gradient-to-br from-muted to-muted-foreground/10">
                <Image
                  src="/melvyn.jpeg"
                  alt="Melvyn Claes"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
            {/* Desktop: Text first (alternating layout) */}
            <div className="flex-1 sm:col-span-8 text-center sm:text-left">
              <Card className="border-none shadow-none bg-transparent p-0">
                <CardHeader className="p-0">
                  <CardTitle className="text-xl lg:text-2xl">Melvyn Claes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  « Pour ma part, passionné par le développement web, j'ai récemment obtenu mon
                  diplôme de master en ingénieur informatique à l'UCLouvain. A présent, je travaille
                  chez Qualifio en tant que Software Developer, où je mets mes compétences
                  techniques au service de projets innovants. Chez ArtNote, je suis en charge de la
                  conception et du développement du site ».
                </CardContent>
              </Card>
            </div>
            {/* Desktop: Large image */}
            <div className="hidden sm:block sm:col-span-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-muted to-muted-foreground/10">
                <Image
                  src="/melvyn.jpeg"
                  alt="Melvyn Claes"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission + Values */}
        <div className="mb-12 lg:mb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
              Notre mission & nos valeurs
            </h2>

            <div className="space-y-8">
              {/* Mission */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardContent className="p-8 pl-12">
                  <h3 className="text-xl font-semibold mb-4">Notre mission</h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Notre objectif est de proposer des notices scientifiques complètes et
                      accessibles sur des tableaux exposés dans les musées belges. Que vous soyez
                      curieux d'art, amateur passionné ou historien de l'art confirmé, ArtNote vous
                      offre un contenu fiable, documenté et enrichi.
                    </p>
                    <p>
                      Par le biais de ces notices, nous souhaitons contribuer à la (re)découverte
                      d'œuvres, d'artistes ou des courants parfois laissés dans l'ombre, pour
                      contribuer à une meilleure connaissance du patrimoine artistique en Belgique.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Values */}
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6">Nos valeurs</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary/60" />
                      <h4 className="font-medium mb-2">Qualité</h4>
                      <p className="text-sm text-muted-foreground">
                        Des textes précis, rédigés à partir de sources solides.
                      </p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary/60" />
                      <h4 className="font-medium mb-2">Accessibilité</h4>
                      <p className="text-sm text-muted-foreground">
                        Une lecture fluide et claire pour tous les publics.
                      </p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary/60" />
                      <h4 className="font-medium mb-2">Exigence scientifique</h4>
                      <p className="text-sm text-muted-foreground">
                        Chaque notice respecte les standards de la recherche en histoire de l'art.
                      </p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary/60" />
                      <h4 className="font-medium mb-2">Transmission</h4>
                      <p className="text-sm text-muted-foreground">
                        Partager le savoir de manière intergénérationnelle et transdisciplinaire.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="pt-6 space-y-4 text-base leading-relaxed">
              <p>Une question, une suggestion, ou simplement envie d'échanger ?</p>
              <p>
                <a href="mailto:elisepoot02@gmail.com" className="underline underline-offset-4">
                  elisepoot02@gmail.com
                </a>
                <br />
                <a href="mailto:claes.melvyn@gmail.com" className="underline underline-offset-4">
                  claes.melvyn@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
