import { pageMeta } from '@/lib/seo';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/confidentialite')({
  head: () => ({
    meta: pageMeta(
      'ArtNote - Confidentialité',
      "Ce qu'ArtNote mesure de ses visites, comment, et les cookies utilisés par le site.",
    ),
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl py-10 lg:py-16 space-y-10 leading-relaxed">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Confidentialité</h1>
        <p className="text-lg text-muted-foreground">
          ArtNote mesure la fréquentation de ses pages pour savoir quelles notices intéressent ses
          lecteurs. Cette page explique ce qui est mesuré, comment, et ce qui est conservé.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Mesure d'audience</h2>
        <p>
          La fréquentation est mesurée avec{' '}
          <a
            href="https://umami.is"
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            Umami
          </a>
          , un outil de mesure d'audience respectueux de la vie privée, hébergé dans l'Union
          européenne.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Umami ne dépose aucun cookie et n'enregistre rien d'autre dans votre navigateur : vous
            n'êtes pas suivi d'une visite à l'autre.
          </li>
          <li>
            Aucune donnée personnelle n'est collectée : ni nom, ni adresse e-mail, ni adresse réseau
            (IP) conservée. Umami retient seulement les pages consultées, le site d'où vous venez,
            votre pays, votre type d'appareil et votre navigateur, ainsi que le temps passé sur une
            notice, par tranche (moins de 30 secondes, 30 secondes à 2 minutes, etc.).
          </li>
          <li>
            Les paramètres des adresses visitées, comme les termes de recherche, ne sont pas
            envoyés.
          </li>
          <li>
            Si votre navigateur envoie le signal « Do Not Track » (« Ne pas me pister »), rien n'est
            mesuré.
          </li>
          <li>Les pages réservées aux administrateurs ne sont pas mesurées.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Nombre de vues des notices</h2>
        <p>
          Chaque notice affiche son nombre de vues. Pour ne compter qu'une fois un même lecteur qui
          recharge la page, ArtNote compte une vue au plus une fois toutes les 30 minutes par
          adresse réseau (IP).
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            L'adresse réseau n'est jamais enregistrée telle quelle : seule une empreinte salée (un «
            hachage ») en est conservée, qui ne permet pas de retrouver l'adresse.
          </li>
          <li>Ces empreintes sont supprimées après un jour.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Cookies</h2>
        <p>
          La lecture du site ne dépose aucun cookie. Seuls les comptes connectés reçoivent des
          cookies de connexion, strictement nécessaires pour rester connecté. Ils sont supprimés à
          la déconnexion ou à leur expiration.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p>
          Pour toute question sur vos données, écrivez-nous à l'une des adresses de la page{' '}
          <Link to="/about" className="underline underline-offset-4">
            À propos
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
