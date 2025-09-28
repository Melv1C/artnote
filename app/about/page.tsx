import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'À propos',
};

export default function AboutPage() {
  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl">
        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center mb-12 lg:mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">À propos</h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Fondé en 2025 par notre couple aux compétences complémentaires, ArtNote réunit l'univers
            de l'histoire de l'art et celui de l'informatique autour d'une vision partagée.
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
        <div className="space-y-10 lg:space-y-16 mb-12 lg:mb-20">
          {/* Melvyn */}
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            {/* Image placeholder - left */}
            <div className="md:col-span-4">
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
            {/* Text - right */}
            <div className="md:col-span-8">
              <Card className="border-none shadow-none bg-transparent p-0">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Melvyn Claes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4 text-base leading-relaxed text-muted-foreground">
                  « Passionné par le développement web, j'ai récemment obtenu mon diplômé de master
                  en ingénieur informatique à l'UCLouvain. A présent, je travaille chez Qualifio en
                  tant que Software Developer, où je mets mes compétences techniques au service de
                  projets innovants. Chez ArtNote, je suis en charge de la conception et du
                  développement du site ».
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Elise */}
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            {/* Text - left on md+ */}
            <div className="md:col-span-8 md:order-1 order-2">
              <Card className="border-none shadow-none bg-transparent p-0">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Elise Poot</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4 text-base leading-relaxed text-muted-foreground">
                  « Pour ma part, je suis diplômée d'un master en Histoire de l'art à l'UCLouvain.
                  Spécialisée dans la peinture des XVIe et XVIIe siècles, je souhaite contribuer à
                  rendre les œuvres d'art accessibles à tous, sans pour autant sacrifier la rigueur
                  scientifique. J'assure la rédaction et la supervision des notices ».
                </CardContent>
              </Card>
            </div>
            {/* Image placeholder - right on md+ */}
            <div className="md:col-span-4 md:order-2 order-1">
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
          </div>
        </div>

        {/* Mission + Values */}
        <div className="mb-12 lg:mb-20">
          <h2 className="text-2xl font-semibold mb-6">Notre mission</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6 space-y-4 text-base leading-relaxed">
                <p>
                  Notre objectif est de proposer des notices scientifiques complètes et accessibles
                  sur des tableaux exposés dans les musées belges. Que vous soyez curieux d'art,
                  amateur passionné ou historien de l'art confirmé, ArtNote vous offre un contenu
                  fiable, documenté et enrichi.
                </p>
                <p>
                  Par le biais de ces notices, nous souhaitons contribuer à la (re)découverte
                  d'œuvres, d'artistes ou des courants parfois laissés dans l'ombre, pour contribuer
                  à une meilleure connaissance du patrimoine artistique en Belgique.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nos valeurs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="list-disc pl-6 space-y-2 text-base">
                  <li>Qualité : Des textes précis, rédigés à partir de sources solides.</li>
                  <li>Accessibilité : Une lecture fluide et claire pour tous les publics.</li>
                  <li>
                    Exigence scientifique : Chaque notice respecte les standards de la recherche en
                    histoire de l'art.
                  </li>
                  <li>
                    Transmission : Partager le savoir de manière intergénérationnelle et
                    transdisciplinaire.
                  </li>
                </ul>
              </CardContent>
            </Card>
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
