/**
 * Affichage du contenu non validé.
 *
 * En production : rien de non validé n'est rendu. Aucune exception.
 *
 * En développement : les brouillons s'affichent NORMALEMENT, sans marqueur
 * visuel, pour qu'on puisse juger la mise en page avec une densité de texte
 * réaliste. Ce qui manque est signalé une seule fois, dans une pastille
 * discrète en coin d'écran — pas 76 fois par-dessus la page.
 */
export const PREVIEW_DRAFTS = process.env.NODE_ENV !== "production";

/**
 * Rend `children` si le contenu est publiable. Sinon : en développement, rend
 * `preview` (le brouillon) ; en production, rend `null`.
 */
export function Draft({
  ready,
  preview,
  children,
}: {
  ready: boolean;
  preview?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (ready) return <>{children}</>;
  if (PREVIEW_DRAFTS && preview !== undefined) return <>{preview}</>;
  return null;
}

/** Valeur absente, en attente d'une donnée humaine (prix, NEQ, chiffre client). */
export function Pending({ children }: { children?: React.ReactNode }) {
  if (!PREVIEW_DRAFTS) return null;
  return <span className="text-zinc-600">{children ?? "à confirmer"}</span>;
}

/**
 * Pastille unique, en coin d'écran, listant ce qui bloque la mise en ligne.
 * Invisible en production.
 */
export function DevChecklist({ items }: { items: readonly string[] }) {
  if (!PREVIEW_DRAFTS || items.length === 0) return null;
  return (
    <details className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border border-white/15 bg-black/85 text-left backdrop-blur print:hidden">
      <summary className="cursor-pointer list-none px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-zinc-400 hover:text-white">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-amber-400 align-middle" />
        {items.length} à compléter
      </summary>
      <ul className="max-h-80 overflow-y-auto border-t border-white/10 px-4 py-3">
        {items.map((item) => (
          <li key={item} className="py-1 text-xs leading-5 text-zinc-400">
            {item}
          </li>
        ))}
      </ul>
      <p className="border-t border-white/10 px-4 py-2 text-[0.65rem] leading-4 text-zinc-500">
        Aperçu : les brouillons sont affichés. En production, seul le contenu
        validé apparaît. <code>npm run check:secteurs</code>
      </p>
    </details>
  );
}
