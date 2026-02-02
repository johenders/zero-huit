export const metadata = {
  title: "Conditions d'utilisation — Zéro huit",
  description:
    "Conditions d'utilisation du site web de Zéro huit.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-16 text-white">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Conditions d'utilisation</h1>
        <p className="text-sm text-white/70">Dernière mise à jour : 2 février 2026</p>
      </header>

      <section className="space-y-3 text-sm text-white/80">
        <p>
          En accédant à ce site, vous acceptez les présentes conditions d'utilisation.
          Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le site.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Utilisation du site</h2>
        <p>
          Vous vous engagez à utiliser le site de manière légale et respectueuse, sans
          tenter d'en compromettre la sécurité ou le fonctionnement.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Propriété intellectuelle</h2>
        <p>
          Les contenus, marques, images, vidéos et textes présents sur ce site sont
          la propriété de Zéro huit ou de ses partenaires et sont protégés par les lois
          applicables. Toute reproduction non autorisée est interdite.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Limitation de responsabilité</h2>
        <p>
          Le site est fourni « tel quel ». Zéro huit ne garantit pas l'absence d'erreurs
          ni l'accès continu au site et ne peut être tenue responsable des dommages
          résultant de son utilisation.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Liens externes</h2>
        <p>
          Le site peut contenir des liens vers des sites tiers. Zéro huit n'est pas
          responsable de leur contenu ou de leurs pratiques.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Droit applicable</h2>
        <p>
          Les présentes conditions sont régies par les lois applicables au Québec
          et au Canada.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Contact</h2>
        <p>
          Pour toute question, écrivez-nous à <strong>info@zerohuit.ca</strong>.
        </p>
      </section>
    </main>
  );
}
