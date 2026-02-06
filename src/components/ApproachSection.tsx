const steps = [
  {
    title: "Consultation gratuite",
    body:
      "Une première discussion pour comprendre votre réalité et vos objectifs. Pas de pitch, pas de pression. Juste un échange honnête pour bien poser les bases.",
  },
  {
    title: "La planification",
    body:
      "On transforme les idées en une direction solide. Tout est pensé pour que le projet soit clair avant d’être produit.",
  },
  {
    title: "La production",
    body:
      "On dirige le tournage avec une équipe légère, efficace et alignée sur votre message. Chaque plan sert l’intention.",
  },
  {
    title: "La livraison",
    body:
      "On assemble les morceaux, on garde seulement le meilleur. Un rendu propre, cohérent et facile à déployer.",
  },
];

export function ApproachSection() {
  return (
    <section className="relative overflow-hidden bg-black/95 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(92,195,215,0.12),_transparent_55%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/80">
            Notre approche
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            On part toujours de vos objectifs d&apos;affaires.
          </h2>
          <p className="mt-5 text-base text-white/80 sm:text-lg">
            On cherche d&apos;abord à comprendre ce que vous voulez atteindre,
            puis on bâtit la vidéo autour de ça. Résultat : des contenus clairs,
            cohérents et faciles à utiliser dans votre réalité.
          </p>
        </div>

        <div className="mt-14">
          <div className="relative hidden md:block">
            <div className="absolute left-0 right-0 top-5 h-px border-t border-emerald-400/60" />
            <div className="relative z-10 grid gap-10 md:grid-cols-4">
              {["1", "2", "3", "4"].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center justify-start"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/80 bg-black text-sm font-semibold text-emerald-200">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-4">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className="group pr-2"
              >
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200 text-left transition-transform duration-200 ease-in group-hover:-translate-y-1">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/80 text-left transition-transform duration-200 ease-in group-hover:-translate-y-1">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
