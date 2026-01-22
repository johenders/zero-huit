import { HomeClientsSection } from "@/components/HomeClientsSection";
import { HomeFeaturedSection } from "@/components/HomeFeaturedSection";
import { HomeHero } from "@/components/HomeHero";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Taxonomy, Video } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zéro huit — Production vidéo sur la Rive-Sud",
  description:
    "Agence de production vidéo haut de gamme pour entreprises et organismes de la Rive-Sud de Montréal. Une équipe lean pour des projets sur mesure.",
  openGraph: {
    title: "Zéro huit — Production vidéo sur la Rive-Sud",
    description:
      "Agence de production vidéo haut de gamme pour entreprises et organismes de la Rive-Sud de Montréal. Une équipe lean pour des projets sur mesure.",
  },
  twitter: {
    title: "Zéro huit — Production vidéo sur la Rive-Sud",
    description:
      "Agence de production vidéo haut de gamme pour entreprises et organismes de la Rive-Sud de Montréal. Une équipe lean pour des projets sur mesure.",
  },
};

export default async function Home() {
  let featuredVideos: Video[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = getSupabasePublicServerClient();
    const [{ data: videos, error: videosError }, { data: taxonomies, error: taxonomiesError }] =
      await Promise.all([
        supabase
          .from("videos")
          .select(
            "id,title,cloudflare_uid,thumbnail_time_seconds,duration_seconds,budget_min,budget_max,is_featured,created_at",
          )
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("taxonomies").select("id,kind,label"),
      ]);

    if (!videosError && !taxonomiesError) {
      const ids = (videos ?? []).map((video) => video.id);
      let videoTaxonomies: { video_id: string; taxonomy_id: string }[] = [];
      if (ids.length > 0) {
        const { data: videoTaxonomyRows } = await supabase
          .from("video_taxonomies")
          .select("video_id,taxonomy_id")
          .in("video_id", ids);
        videoTaxonomies = (videoTaxonomyRows ??
          []) as { video_id: string; taxonomy_id: string }[];
      }

      const taxonomyById = new Map<string, Taxonomy>();
      for (const t of (taxonomies ?? []) as Taxonomy[]) taxonomyById.set(t.id, t);

      const taxonomyIdsByVideoId = new Map<string, string[]>();
      for (const row of videoTaxonomies) {
        const list = taxonomyIdsByVideoId.get(row.video_id) ?? [];
        list.push(row.taxonomy_id);
        taxonomyIdsByVideoId.set(row.video_id, list);
      }

      const hydratedVideos: Video[] = ((videos ?? []) as Omit<
        Video,
        "taxonomies"
      >[]).map((video) => ({
        ...video,
        taxonomies: (taxonomyIdsByVideoId.get(video.id) ?? [])
          .map((id) => taxonomyById.get(id))
          .filter(Boolean) as Taxonomy[],
      }));

      featuredVideos = hydratedVideos
        .filter((video) => !video.cloudflare_uid.startsWith("pending:"))
        .slice(0, 6);
    }
  }

  return (
    <div className="min-h-screen text-zinc-100">
      <HomeHero />
      <HomeFeaturedSection featuredVideos={featuredVideos} />
      <HomeClientsSection />
    </div>
  );
}
