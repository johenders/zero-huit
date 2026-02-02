export const metadata = {
  title: "Politique de confidentialité — Zéro huit",
  description:
    "Politique de confidentialité de Zéro huit, incluant l’utilisation de cookies et Google Analytics.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-16 text-white">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Politique de confidentialité</h1>
        <p className="text-sm text-white/70">Dernière mise à jour : 2 février 2026</p>
      </header>

      <section className="space-y-3 text-sm text-white/80">
        <p>
          Zéro huit respecte votre vie privée. Cette politique explique comment nous
          recueillons, utilisons et protégeons vos renseignements personnels lorsque vous
          utilisez notre site web.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Responsable de la protection</h2>
        <p>
          Responsable : <strong>Jonathan Henderson</strong>
          <br />
          Titre : <strong>Producteur</strong>
          <br />
          Courriel : <strong>jo@zerohuit.ca</strong>
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Renseignements collectés</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Coordonnées transmises via les formulaires (nom, courriel, téléphone).</li>
          <li>Contenu des messages et informations liées à votre demande.</li>
          <li>
            Données d’usage anonymisées via Google Analytics, si vous l’acceptez.
          </li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Finalités</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Répondre à vos demandes et assurer le suivi.</li>
          <li>Améliorer le site et la qualité de nos services.</li>
          <li>Mesurer l’audience (Google Analytics, sur consentement).</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Fournisseurs</h2>
        <p>
          Nous utilisons des fournisseurs de confiance pour héberger et traiter les
          données, notamment Vercel (hébergement), Supabase (base de données), Resend
          (envoi de courriels) et Cloudflare Stream (diffusion vidéo). Ces fournisseurs
          peuvent traiter des données à l’extérieur du Canada, notamment aux États-Unis.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Cookies et Google Analytics</h2>
        <p>
          Nous utilisons Google Analytics uniquement si vous y consentez. Ce service
          peut déposer des cookies pour mesurer la fréquentation et les performances du
          site. Sans votre consentement, aucun cookie d’analyse n’est activé.
        </p>
        <p>
          Votre choix est conservé pour une durée maximale de six mois.
        </p>
        <p>
          Vous pouvez modifier votre choix à tout moment via le lien « Gérer le
          consentement » au bas du site.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Conservation</h2>
        <p>
          Les renseignements sont conservés pour la durée nécessaire aux finalités
          ci-dessus, et généralement jusqu’à 24 mois après la dernière interaction,
          sauf obligation légale. Ils sont ensuite supprimés ou anonymisés.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification ou le retrait de vos
          renseignements personnels. Pour exercer vos droits, écrivez au responsable
          indiqué ci-dessus.
        </p>
      </section>
    </main>
  );
}
