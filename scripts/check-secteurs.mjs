#!/usr/bin/env node
/**
 * Vérifie qu'une page sectorielle est publiable.
 *
 * Le guide impose que certains blocs existent AVANT la mise en ligne :
 * fourchette de prix, étude de cas chiffrée, témoignage nominatif, bande démo
 * sectorielle, 8 objections, 6 questions de FAQ, coordonnées vérifiables.
 *
 * Ce script lit les fichiers de contenu en texte brut (aucune compilation
 * requise) et signale tout ce qui bloque. Sortie non nulle = page non publiable.
 *
 *   npm run check:secteurs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CONTENT_DIR = "src/content/secteurs";
const PLACEHOLDER = /\{\{([A-Z0-9_]+)\}\}/g;

const files = readdirSync(CONTENT_DIR).filter(
  (name) => name.endsWith(".ts") && name !== "types.ts",
);

let blocking = 0;

for (const file of files) {
  const secteur = file.replace(/\.ts$/, "");
  const source = readFileSync(join(CONTENT_DIR, file), "utf8");

  const placeholders = [...new Set([...source.matchAll(PLACEHOLDER)].map((m) => m[1]))];
  const aValider = (source.match(/status:\s*"a-valider"/g) ?? []).length;
  const valide = (source.match(/status:\s*"valide"/g) ?? []).length;
  const logosAObtenir = (source.match(/authorization:\s*"a-obtenir"/g) ?? []).length;

  console.log(`\n\x1b[1m${secteur.toUpperCase()}\x1b[0m`);
  console.log("─".repeat(60));

  if (placeholders.length > 0) {
    blocking += placeholders.length;
    console.log(
      `\x1b[33m${placeholders.length} valeur(s) manquante(s)\x1b[0m — seul un humain peut les fournir :`,
    );
    for (const name of placeholders.sort()) console.log(`   • ${name}`);
  }

  if (aValider > 0) {
    blocking += aValider;
    console.log(
      `\n\x1b[33m${aValider} texte(s) en brouillon\x1b[0m (status: "a-valider") — ` +
        `visibles en développement, jamais publiés. ${valide} déjà validé(s).`,
    );
  }

  if (logosAObtenir > 0) {
    blocking += logosAObtenir;
    console.log(
      `\n\x1b[33m${logosAObtenir} logo(s)\x1b[0m sans autorisation écrite documentée — non rendus.`,
    );
  }

  if (placeholders.length === 0 && aValider === 0 && logosAObtenir === 0) {
    console.log("\x1b[32m✓ Publiable.\x1b[0m");
  }
}

console.log("\n" + "═".repeat(60));
if (blocking > 0) {
  console.log(
    `\x1b[33m${blocking} élément(s) à régler avant mise en ligne.\x1b[0m\n` +
      `Rien de non validé n'est publié : la page se construit et se déploie,\n` +
      `mais ces blocs restent masqués en production.`,
  );
  process.exit(1);
}
console.log("\x1b[32mToutes les pages sectorielles sont publiables.\x1b[0m");
