import Image from "next/image";
import Link from "next/link";
import { HomeClientsSection } from "@/components/HomeClientsSection";
import { HomeFeaturedSection } from "@/components/HomeFeaturedSection";
import { HomeHero } from "@/components/HomeHero";
import { fallbackArticles } from "@/lib/articles";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Article, Taxonomy, Video } from "@/lib/types";
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

type DisplayArticle = {
  title: string;
  excerpt: string;
  author: string;
  dateLabel: string;
  href: string;
  imageUrl?: string | null;
  image?: (typeof fallbackArticles)[number]["image"];
};

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function Home() {
  let featuredVideos: Video[] = [];
  let latestArticles: DisplayArticle[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = getSupabasePublicServerClient();
    const [
      { data: videos, error: videosError },
      { data: taxonomies, error: taxonomiesError },
      { data: articles, error: articlesError },
    ] = await Promise.all([
      supabase
        .from("videos")
        .select(
          "id,title,cloudflare_uid,thumbnail_time_seconds,duration_seconds,budget_min,budget_max,is_featured,created_at",
        )
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("taxonomies").select("id,kind,label"),
      supabase
        .from("articles")
        .select("id,title,slug,excerpt,cover_image_url,author,published_at,is_published")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3),
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

    if (!articlesError && (articles ?? []).length > 0) {
      latestArticles = (articles as Pick<
        Article,
        "id" | "title" | "slug" | "excerpt" | "cover_image_url" | "author" | "published_at"
      >[]).map((article) => ({
        title: article.title,
        excerpt: article.excerpt ?? "",
        author: article.author ?? "Z\u00e9ro huit",
        dateLabel: formatDateLabel(article.published_at),
        href: `/nouvelles/${article.slug}`,
        imageUrl: article.cover_image_url,
      }));
    }
  }

  if (latestArticles.length === 0) {
    latestArticles = fallbackArticles.map((article) => ({
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      dateLabel: article.dateLabel,
      href: article.href,
      image: article.image,
    }));
  }

  return (
    <div className="min-h-screen text-zinc-100">
      <HomeHero />
      <HomeFeaturedSection featuredVideos={featuredVideos} />
      <HomeClientsSection />
      <section className="bg-[#f6f4ef] py-20 text-slate-900">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">
                Quoi de neuf
              </span>
              <h2 className="mt-6 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Les derniers articles du blog.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Conseils strat\u00e9giques, tendances et retours d'exp\u00e9rience pour am\u00e9liorer
                vos vid\u00e9os corporatives.
              </p>
            </div>
            <Link
              href="/nouvelles"
              className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-600 hover:text-emerald-800"
            >
              Voir les nouvelles
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className="relative">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src={article.image ?? fallbackArticles[0].image}
                      alt={article.title}
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                    Blog
                  </span>
                </div>
                <div className="space-y-4 px-5 pb-6 pt-5">
                  <div className="text-xs text-slate-500">{article.dateLabel}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                      JB
                    </span>
                    <span>par {article.author}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{article.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
