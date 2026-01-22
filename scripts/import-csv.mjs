import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const budgetLevels = [
  2000, 3000, 4000, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000,
  45000, 50000,
];

const pendingCloudflarePrefix = "pending:";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00a0]/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function splitTags(raw) {
  if (!raw) return [];
  if (raw.trim() === "—") return [];
  return raw
    .split(/[|•·]/g)
    .flatMap((chunk) => chunk.split(/[,;/]/g))
    .flatMap((chunk) => chunk.split(/\s+\/\s+/g))
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function detectDelimiter(headerLine) {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = 0;
  for (const candidate of candidates) {
    const count = headerLine.split(candidate).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = candidate;
    }
  }
  return best;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  const delimiter = detectDelimiter(lines[0] ?? "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      field = "";
      const isEmpty = row.every((cell) => !cell.trim());
      if (!isEmpty) rows.push(row);
      row = [];
      continue;
    }

    if (char === "\r") continue;

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    const isEmpty = row.every((cell) => !cell.trim());
    if (!isEmpty) rows.push(row);
  }

  return rows;
}

function parseBudgetRange(raw) {
  if (!raw) return { min: null, max: null };
  const matches = raw.match(/\d[\d\s]*/g);
  if (!matches || matches.length === 0) return { min: null, max: null };
  const numbers = matches
    .map((match) => Number.parseInt(match.replace(/\s+/g, ""), 10))
    .filter((value) => Number.isFinite(value));
  if (numbers.length === 0) return { min: null, max: null };
  const min = numbers[0];
  const max = numbers.length > 1 ? numbers[1] : numbers[0];
  return { min, max };
}

function coerceBudgetLevel(value) {
  if (!value || !Number.isFinite(value)) return null;
  let closest = budgetLevels[0];
  let bestDelta = Math.abs(value - closest);
  for (const level of budgetLevels) {
    const delta = Math.abs(value - level);
    if (delta < bestDelta) {
      bestDelta = delta;
      closest = level;
    }
  }
  return closest;
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

async function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Ignore when .env.local is missing.
  }
}

async function main() {
  await loadEnv();

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node scripts/import-csv.mjs <path> [--dry-run]");
    process.exit(1);
  }

  const filePath = args[0];
  const dryRun = args.includes("--dry-run");

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE).",
    );
    process.exit(1);
  }

  const raw = await fs.readFile(filePath, "utf8");
  const rows = parseCsv(raw);
  if (rows.length < 2) {
    console.error("CSV is empty or missing data rows.");
    process.exit(1);
  }

  const header = rows[0] ?? [];
  const normalizedHeader = header.map((cell) => normalizeText(cell));
  const resolveColumn = (aliases) =>
    normalizedHeader.findIndex((value) =>
      aliases.some((alias) => value === normalizeText(alias)),
    );

  const titleIndex = resolveColumn(["Nom", "Titre", "Name"]);
  const keywordsIndex = resolveColumn(["Keywords", "Mots clés", "Mots cles"]);
  const budgetIndex = resolveColumn(["Budget"]);
  const feelIndex = resolveColumn(["Feel"]);
  const styleIndex = resolveColumn(["Style"]);
  const typeIndex = resolveColumn(["Type de vidéo", "Type de video", "Type"]);

  const missingColumns = [];
  if (titleIndex === -1) missingColumns.push("Nom");
  if (keywordsIndex === -1) missingColumns.push("Keywords");
  if (budgetIndex === -1) missingColumns.push("Budget");
  if (feelIndex === -1) missingColumns.push("Feel");
  if (styleIndex === -1) missingColumns.push("Style");
  if (typeIndex === -1) missingColumns.push("Type de vidéo");

  if (missingColumns.length > 0) {
    console.error(`Missing columns: ${missingColumns.join(", ")}`);
    process.exit(1);
  }

  const entries = rows
    .slice(1)
    .map((row) => {
      const title = (row[titleIndex] ?? "").trim();
      if (!title) return null;

      const { min, max } = parseBudgetRange(row[budgetIndex]);
      const coercedMin = coerceBudgetLevel(min);
      const coercedMax = coerceBudgetLevel(max);
      let budgetMin = coercedMin ?? null;
      let budgetMax = coercedMax ?? null;
      if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
        [budgetMin, budgetMax] = [budgetMax, budgetMin];
      }

      return {
        title,
        budgetMin,
        budgetMax,
        keywords: splitTags(row[keywordsIndex]),
        feel: splitTags(row[feelIndex]),
        style: splitTags(row[styleIndex]),
        type: splitTags(row[typeIndex]),
        pendingUid: `${pendingCloudflarePrefix}${crypto.randomUUID()}`,
      };
    })
    .filter(Boolean);

  if (entries.length === 0) {
    console.error("No valid rows found in CSV.");
    process.exit(1);
  }

  if (dryRun) {
    console.log(`Dry run: ${entries.length} rows parsed.`);
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: existingTaxonomies, error: existingError } = await supabase
    .from("taxonomies")
    .select("id,kind,label");
  if (existingError) throw new Error(existingError.message);

  const taxonomyMap = new Map();
  for (const t of existingTaxonomies ?? []) {
    const kindMap = taxonomyMap.get(t.kind) ?? new Map();
    kindMap.set(normalizeText(t.label), t);
    taxonomyMap.set(t.kind, kindMap);
  }

  const missingTaxonomies = [];
  const queueMissing = (kind, label) => {
    const normalized = normalizeText(label);
    const map = taxonomyMap.get(kind) ?? new Map();
    if (map.has(normalized)) return;
    missingTaxonomies.push({ kind, label });
    map.set(normalized, { id: normalized, kind, label });
    taxonomyMap.set(kind, map);
  };

  for (const entry of entries) {
    entry.type.forEach((label) => queueMissing("type", label));
    entry.keywords.forEach((label) => queueMissing("keyword", label));
    entry.style.forEach((label) => queueMissing("style", label));
    entry.feel.forEach((label) => queueMissing("feel", label));
  }

  let insertedTaxonomiesCount = 0;
  if (missingTaxonomies.length > 0) {
    const { data: insertedTaxonomies, error: taxError } = await supabase
      .from("taxonomies")
      .upsert(missingTaxonomies, { onConflict: "kind,label" })
      .select("id,kind,label");
    if (taxError) throw new Error(taxError.message);
    insertedTaxonomiesCount = insertedTaxonomies?.length ?? 0;
  }

  const { data: refreshedTaxonomies, error: refreshedError } = await supabase
    .from("taxonomies")
    .select("id,kind,label");
  if (refreshedError) throw new Error(refreshedError.message);

  taxonomyMap.clear();
  for (const t of refreshedTaxonomies ?? []) {
    const kindMap = taxonomyMap.get(t.kind) ?? new Map();
    kindMap.set(normalizeText(t.label), t);
    taxonomyMap.set(t.kind, kindMap);
  }

  let totalVideosInserted = 0;
  let totalLinksInserted = 0;
  const entryBatches = chunkArray(entries, 50);
  for (const batch of entryBatches) {
    const videosToInsert = batch.map((entry) => ({
      title: entry.title,
      cloudflare_uid: entry.pendingUid,
      status: "processing",
      thumbnail_time_seconds: 1,
      budget_min: entry.budgetMin,
      budget_max: entry.budgetMax,
    }));

    const { data: insertedVideos, error: insertError } = await supabase
      .from("videos")
      .insert(videosToInsert)
      .select("id,cloudflare_uid");
    if (insertError) throw new Error(insertError.message);
    totalVideosInserted += insertedVideos?.length ?? 0;

    const idByPendingUid = new Map();
    for (const row of insertedVideos ?? []) {
      idByPendingUid.set(row.cloudflare_uid, row.id);
    }

    const linkRows = [];
    for (const entry of batch) {
      const videoId = idByPendingUid.get(entry.pendingUid);
      if (!videoId) continue;
      const labelsByKind = [
        ["type", entry.type],
        ["keyword", entry.keywords],
        ["style", entry.style],
        ["feel", entry.feel],
      ];

      const taxonomyIds = new Set();
      for (const [kind, labels] of labelsByKind) {
        const map = taxonomyMap.get(kind);
        if (!map) continue;
        for (const label of labels) {
          const taxonomy = map.get(normalizeText(label));
          if (taxonomy) taxonomyIds.add(taxonomy.id);
        }
      }

      for (const taxonomyId of taxonomyIds) {
        linkRows.push({ video_id: videoId, taxonomy_id: taxonomyId });
      }
    }

    if (linkRows.length > 0) {
      const linkBatches = chunkArray(linkRows, 500);
      for (const linkBatch of linkBatches) {
        const { error: linkError } = await supabase
          .from("video_taxonomies")
          .insert(linkBatch);
        if (linkError) throw new Error(linkError.message);
        totalLinksInserted += linkBatch.length;
      }
    }
  }

  console.log(
    `Done: ${entries.length} rows, ${totalVideosInserted} videos, ${insertedTaxonomiesCount} tags, ${totalLinksInserted} links.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
