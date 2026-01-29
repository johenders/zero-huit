import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Taxonomy, Video } from "@/lib/types";
import { ProjectsApp } from "@/components/ProjectsApp";
import type { Metadata } from "next";
import { applyTaxonomyTranslations } from "@/lib/i18n/server";
import { normalizeLocale } from "@/lib/i18n/shared";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projets — Zéro huit",
  description:
    "Explorez nos projets vidéo récents et découvrez des références adaptées à vos objectifs.",
  openGraph: {
    title: "Projets — Zéro huit",
    description:
      "Explorez nos projets vidéo récents et découvrez des références adaptées à vos objectifs.",
  },
  twitter: {
    title: "Projets — Zéro huit",
    description:
      "Explorez nos projets vidéo récents et découvrez des références adaptées à vos objectifs.",
  },
};

export default async function ProjectsPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-zinc-100">
        <h1 className="text-lg font-semibold">Configuration requise</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Ajoute <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans ton environnement
          (Vercel ou <code>.env.local</code>).
        </p>
      </div>
    );
  }

  const supabase = getSupabasePublicServerClient();

  async function fetchAllVideoTaxonomies() {
    const allRows: { video_id: string; taxonomy_id: string }[] = [];
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("video_taxonomies")
        .select("video_id,taxonomy_id")
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...(data as { video_id: string; taxonomy_id: string }[]));
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return allRows;
  }

  const [
    { data: videos, error: videosError },
    { data: taxonomies, error: taxonomiesError },
    videoTaxonomiesResult,
  ] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "id,title,cloudflare_uid,status,thumbnail_time_seconds,duration_seconds,budget_min,budget_max,is_featured,created_at",
      )
      .order("created_at", { ascending: false }),
    supabase.from("taxonomies").select("id,kind,label"),
    fetchAllVideoTaxonomies()
      .then((data) => ({ data, error: null as unknown }))
      .catch((error) => ({ data: null, error })),
  ]);

  const videoTaxonomies = videoTaxonomiesResult.data as
    | { video_id: string; taxonomy_id: string }[]
    | null;
  const videoTaxonomiesError = videoTaxonomiesResult.error as { message?: string } | null;

  const anyError = videosError ?? taxonomiesError ?? videoTaxonomiesError;
  if (anyError) {
    const maybeAnyError = anyError as unknown as { cause?: unknown };
    const cause = maybeAnyError?.cause ? String(maybeAnyError.cause) : "";
    return (
      <div className="mx-auto max-w-3xl p-6 text-zinc-100">
        <h1 className="text-lg font-semibold">Erreur de chargement</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Supabase a retourné une erreur:
        </p>
        <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
          {anyError.message}
          {cause ? `\n\nCause: ${cause}` : ""}
        </pre>
        <p className="mt-3 text-sm text-zinc-300">
          Si tu vois des erreurs TLS (certificat), utilise{" "}
          <code>npm run dev:secure</code>.
        </p>
      </div>
    );
  }

  const translatedTaxonomies = await applyTaxonomyTranslations(
    (taxonomies ?? []) as Taxonomy[],
    locale,
  );

  const taxonomyById = new Map<string, Taxonomy>();
  for (const t of translatedTaxonomies) taxonomyById.set(t.id, t);

  const taxonomyIdsByVideoId = new Map<string, string[]>();
  for (const row of (videoTaxonomies ?? []) as { video_id: string; taxonomy_id: string }[]) {
    const list = taxonomyIdsByVideoId.get(row.video_id) ?? [];
    list.push(row.taxonomy_id);
    taxonomyIdsByVideoId.set(row.video_id, list);
  }

  const hydratedVideos: Video[] = ((videos ?? []) as Omit<
    Video,
    "taxonomies"
  >[]).map((v) => ({
    ...v,
    taxonomies: (taxonomyIdsByVideoId.get(v.id) ?? [])
      .map((id) => taxonomyById.get(id))
      .filter(Boolean) as Taxonomy[],
  }));

  const visibleVideos = hydratedVideos.filter(
    (video) => !video.cloudflare_uid.startsWith("pending:"),
  );

  return <ProjectsApp initialVideos={visibleVideos} />;
}
