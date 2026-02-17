import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import { normalizeLocale, withLocaleHref } from "@/lib/i18n/shared";
import { getUiDictionary } from "@/lib/i18n/server";
import { ApproachSection } from "@/components/ApproachSection";
import { ClientsMarqueeSection } from "@/components/ClientsMarqueeSection";
import { LeanFeaturedGrid } from "@/components/LeanFeaturedGrid";
import { MadeToFlexSection } from "@/components/MadeToFlexSection";
import { VideoStatsSection } from "@/components/VideoStatsSection";
import { fallbackArticles } from "@/lib/articles";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Article, Taxonomy, Video } from "@/lib/types";
import { buildPageMetadata } from "@/lib/seo";

import heroImage from "../../../assets/bts/zero_huit_production_video.jpg";
import ctaBg from "../../../assets/bts/IMG_2410.jpg";
import zerohuitLogo from "../../../assets/zerohuit_blanc.png";

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
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const dictionary = await getUiDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;
  return buildPageMetadata({
    locale,
    path: "/production-video-rive-sud-mtl",
    title: t("rive.meta.title"),
    description: t("rive.meta.description"),
  });
}

export default async function ProductionVideoRiveSudPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const dictionary = await getUiDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;
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
          .select(
            "id,title,slug,excerpt,cover_image_url,author,published_at,is_published",
          )
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
      const rows = articles as Pick<
        Article,
        "title" | "slug" | "excerpt" | "cover_image_url" | "author" | "published_at"
      >[];

      latestArticles = rows.map((article) => ({
        title: article.title,
        excerpt: article.excerpt ?? "",
        author: article.author ?? t("news.detail.author.fallback"),
        dateLabel: formatDateLabel(article.published_at),
        href: withLocaleHref(locale, `/nouvelles/${article.slug}`),
        imageUrl: article.cover_image_url,
      }));
    }
  }

  if (latestArticles.length === 0) {
    latestArticles = fallbackArticles.slice(0, 3).map((article) => ({
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      dateLabel: article.dateLabel,
      href: withLocaleHref(locale, `/nouvelles/${article.slug}`),
      image: article.image,
    }));
  }

  return (
    <div className="font-['Montserrat']">
    <section className="relative min-h-screen w-full overflow-hidden text-white">
      <Image
        src={heroImage}
        alt={t("rive.hero.image.alt")}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/75" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-none flex-col justify-center px-6 pb-16 pt-28">
        <div className="w-full pl-[10%] origin-left scale-[1.1] transform">
          <h1 className="font-['Montserrat'] text-[2.6rem] font-semibold leading-[1.1] sm:text-[3.2rem] lg:text-[3.8rem]">
            <span className="block">{t("rive.hero.title.line1")}</span>
            <span className="block">
              {t("rive.hero.title.line2")}{" "}
              <span className="relative inline-flex h-[1.4em] overflow-hidden align-baseline">
                <span className="word-slider flex flex-col">
                  {[
                    t("rive.hero.word.1"),
                    t("rive.hero.word.2"),
                    t("rive.hero.word.3"),
                    t("rive.hero.word.4"),
                  ].map((word) => (
                    <span
                      key={word}
                      className="word-item bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text font-semibold not-italic text-transparent"
                      style={{ height: "1.4em", lineHeight: "1.4" }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </h1>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={withLocaleHref(locale, "/portfolio")}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:text-emerald-200"
            >
              {t("rive.hero.cta.portfolio")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/request")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
            >
              {t("rive.hero.cta.create")}
            </Link>
          </div>
        </div>
      </div>
    </section>
    <ClientsMarqueeSection />
    <LeanFeaturedGrid videos={featuredVideos} />
    <VideoStatsSection />
    <MadeToFlexSection />
    <ApproachSection />
    <section className="bg-[#0c0b0b] pb-24 pt-14 text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[2.7rem] font-bold leading-[1.05] tracking-tight text-white sm:text-[3.4rem]">
              {t("rive.blog.title")}
            </h2>
          </div>
          <Link
            href={withLocaleHref(locale, "/nouvelles")}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-[0.84rem] font-semibold text-zinc-100 transition hover:border-white/40"
          >
            {t("home.latest.cta")}
          </Link>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {latestArticles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="group relative block min-h-[30rem] overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/20"
            >
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <Image
                  src={article.image ?? fallbackArticles[0].image}
                  alt={article.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.99) 0%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.58) 75%, rgba(0,0,0,0.08) 100%)",
                }}
              />
              <span className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-100">
                {t("home.latest.badge")}
              </span>
              <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 px-4 pb-5">
                <div className="text-[11px] text-zinc-300">
                  {article.dateLabel} <span className="mx-1 text-zinc-500">•</span>{" "}
                  {t("home.latest.by")} {article.author}
                </div>
                <h3 className="line-clamp-2 text-lg font-bold leading-7 tracking-tight text-white">
                  {article.title}
                </h3>
                <p className="mt-5 line-clamp-3 text-[0.84rem] leading-6 text-zinc-200">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
    <section className="relative overflow-hidden">
      <div className="relative min-h-[85vh] w-full overflow-hidden rounded-none">
        <Image
          src={ctaBg}
          alt={t("rive.cta.image.alt")}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
            {t("footer.cta.label")}
          </h2>
          <p className="mt-4 text-sm uppercase tracking-[0.1em] text-white/80">
            {t("rive.cta.subtitle")}
          </p>
          <Link
            href={withLocaleHref(locale, "/request")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-2.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
          >
            {t("rive.hero.cta.create")}
          </Link>
        </div>
        <div className="pointer-events-none absolute bottom-8 left-8 hidden flex-col items-start gap-2 pl-12 text-white/80 md:flex">
          <Image
            src={zerohuitLogo}
            alt={t("rive.cta.image.alt")}
            className="h-[84px] w-auto"
          />
          <div className="pl-6 text-xs text-white/70">
            {t("rive.footer.copy")}
          </div>
        </div>
        <div className="absolute bottom-8 right-8 hidden items-center gap-3 pr-12 md:flex">
          {[
            {
              href: "https://www.facebook.com/productionszerohuit",
              label: "Facebook",
              icon: (
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.1V12h2.1V9.8c0-2.1 1.2-3.2 3.1-3.2.9 0 1.9.2 1.9.2v2.1h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12z" />
                </svg>
              ),
            },
            {
              href: "https://www.instagram.com/zerohuit.ca",
              label: "Instagram",
              icon: (
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
                </svg>
              ),
            },
            {
              href: "https://vimeo.com/zerohuit",
              label: "Vimeo",
              icon: (
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 8.5c-.2 2.6-1.9 6.1-5 10.4-3.2 4.4-5.8 6.6-7.8 6.6-1.3 0-2.4-1.2-3.2-3.6l-2-7.4c-.4-1.4-.8-2.1-1.4-2.1-.1 0-.6.3-1.4.9L0 11.7 2.5 9c1.6-1.4 3.2-2.7 4.7-2.9 1.8-.2 2.9 1 3.4 3.5.6 2.8 1 4.6 1.2 5.3.7 2.2 1.5 3.3 2.3 3.3.7 0 1.7-1.1 3.1-3.2 1.4-2.1 2.2-3.7 2.3-4.8.2-1.8-.5-2.8-2.2-2.8-.8 0-1.6.2-2.5.5 1.6-5.1 4.6-7.5 9-7.2 3.2.2 4.7 2.2 4.5 5.8z" />
                </svg>
              ),
            },
            {
              href: "https://www.linkedin.com/company/zerohuit/",
              label: "LinkedIn",
              icon: (
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.4 20.4h-3.6v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9.1V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.4zM5.1 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM6.9 20.4H3.3V9h3.6z" />
                </svg>
              ),
            },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/50 hover:text-white"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}
