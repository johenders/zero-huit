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
    <section className="relative overflow-hidden bg-white py-20 text-zinc-900">
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10">
        <div className="max-w-none">
          <h2 className="text-[2.9rem] font-semibold leading-tight sm:text-[3.6rem]">
            Notre{" "}
            <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text font-extrabold text-transparent">
              approche
            </span>
          </h2>
          <p className="mt-5 max-w-6xl text-xs text-zinc-700 sm:text-sm leading-relaxed">
            Tout commence par{" "}
            <span className="font-semibold text-emerald-500">vos objectifs d&apos;affaires</span>.
            On cherche d&apos;abord à comprendre ce que vous voulez atteindre,
            puis on bâtit la vidéo autour de ça.
          </p>
          <p className="mt-2 max-w-6xl text-xs text-zinc-700 sm:text-sm leading-relaxed">
            <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text font-extrabold text-transparent">
              Résultat
            </span>{" "}
            : des contenus clairs, cohérents et faciles à utiliser dans votre réalité.
          </p>
        </div>

        <div className="mt-14">
          <div className="relative hidden md:block">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-emerald-200" />
            <div className="relative z-10 grid gap-10 md:grid-cols-4">
              {["1", "2", "3", "4"].map((step) => (
                <div key={step} className="flex items-center justify-start">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-xs font-semibold text-white">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-4">
            {steps.map((item) => (
              <div key={item.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 text-left">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600 text-left">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center md:justify-end">
          <button
            type="button"
            className="rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20"
          >
            Consultation gratuite
          </button>
        </div>
      </div>
    </section>
  );
}
