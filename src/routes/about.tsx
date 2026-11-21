import { pageMeta } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';
import { Mail } from 'lucide-react';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: pageMeta(
      'ArtNote - À propos',
      "Découvrez l'équipe derrière ArtNote, notre mission et nos valeurs.",
    ),
  }),
  component: AboutPage,
});

const FOUNDERS = [
  {
    name: 'Elise Poot',
    role: 'Rédaction et supervision des notices',
    photo: '/elise.jpeg',
    quote:
      "Je suis diplômée d'un master en Histoire de l'art à l'UCLouvain. Spécialisée dans la peinture des XVIe et XVIIe siècles, je souhaite contribuer à rendre les œuvres d'art accessibles à tous, sans pour autant sacrifier la rigueur scientifique. J'assure la rédaction et la supervision des notices.",
    email: 'elisepoot02@gmail.com',
  },
  {
    name: 'Melvyn Claes',
    role: 'Conception et développement du site',
    photo: '/melvyn.jpeg',
    quote:
      "Pour ma part, passionné par le développement web, j'ai récemment obtenu mon diplôme de master en ingénieur informatique à l'UCLouvain. A présent, je travaille chez Qualifio en tant que Software Developer, où je mets mes compétences techniques au service de projets innovants. Chez ArtNote, je suis en charge de la conception et du développement du site.",
    email: 'claes.melvyn@gmail.com',
  },
];

const VALUES = [
  { title: 'Qualité', text: 'Des textes précis, rédigés à partir de sources solides.' },
  { title: 'Accessibilité', text: 'Une lecture fluide et claire pour tous les publics.' },
  {
    title: 'Exigence scientifique',
    text: "Chaque notice respecte les standards de la recherche en histoire de l'art.",
  },
  {
    title: 'Transmission',
    text: 'Partager le savoir de manière intergénérationnelle et transdisciplinaire.',
  },
];

function AboutPage() {
  return (
    <div className="page-width pt-6 pb-10 md:pt-12">
      <header className="max-w-3xl">
        <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">À propos</h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          ArtNote est un projet fondé en 2025, né de la rencontre entre deux univers complémentaires
          : l'informatique et l'histoire de l'art.
        </p>
      </header>

      <figure className="-mx-4 mt-8 sm:mx-0 md:mt-12">
        <img
          src="/founders.jpeg"
          alt="Elise Poot et Melvyn Claes"
          width={1536}
          height={2048}
          className="aspect-[4/5] w-full object-cover sm:aspect-[16/9] sm:rounded-3xl"
          decoding="async"
        />
      </figure>

      <section aria-labelledby="founders-heading" className="mt-14 md:mt-20">
        <h2 id="founders-heading" className="font-serif text-3xl font-medium tracking-tight">
          L’équipe
        </h2>
        <ul className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
          {FOUNDERS.map(founder => (
            <li key={founder.name} className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <img
                  src={founder.photo}
                  alt=""
                  width={1536}
                  height={2048}
                  className="size-20 rounded-full object-cover ring-1 ring-border"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h3 className="text-lg font-semibold">{founder.name}</h3>
                  <p className="text-sm text-muted-foreground">{founder.role}</p>
                </div>
              </div>
              <blockquote className="font-serif text-lg leading-relaxed">
                « {founder.quote} »
              </blockquote>
              <a
                href={`mailto:${founder.email}`}
                className="inline-flex w-fit items-center gap-2 rounded-full py-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                <Mail className="size-4" aria-hidden="true" />
                Écrire à {founder.name.split(' ')[0]}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="mission-heading"
        className="mt-14 grid gap-10 rounded-3xl bg-wall px-5 py-10 sm:px-10 md:mt-20 lg:grid-cols-2 lg:gap-16 lg:p-14"
      >
        <div>
          <h2 id="mission-heading" className="font-serif text-3xl font-medium tracking-tight">
            Notre mission
          </h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-wall-foreground">
            <p>
              Notre objectif est de proposer des notices scientifiques complètes et accessibles sur
              des tableaux exposés dans les musées belges. Que vous soyez curieux d'art, amateur
              passionné ou historien de l'art confirmé, ArtNote vous offre un contenu fiable,
              documenté et enrichi.
            </p>
            <p>
              Par le biais de ces notices, nous souhaitons contribuer à la (re)découverte d'œuvres,
              d'artistes ou des courants parfois laissés dans l'ombre, pour contribuer à une
              meilleure connaissance du patrimoine artistique en Belgique.
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-serif text-3xl font-medium tracking-tight">Nos valeurs</h2>
          <dl className="mt-5 grid gap-6 sm:grid-cols-2">
            {VALUES.map(value => (
              <div key={value.title} className="border-t border-foreground/15 pt-4">
                <dt className="font-semibold">{value.title}</dt>
                <dd className="mt-1 text-wall-foreground/80">{value.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
