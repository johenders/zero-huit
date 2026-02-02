import NouvellesDetailClient from "./NouvellesDetailClient";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/shared";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function fetchArticle(slug: string) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  const supabase = getSupabasePublicServerClient();
  const { data } = await supabase
    .from("articles")
    .select(
      "id,title,slug,excerpt,cover_image_url,author,published_at,is_published,created_at,updated_at",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ?? null;
}

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const slug = resolvedParams.slug ?? "";
  const article = slug ? await fetchArticle(slug) : null;
  const title = article?.title ?? "Article — Zéro huit";
  const description =
    article?.excerpt ??
    "Articles, idées et nouvelles de notre équipe de production vidéo.";
  return buildPageMetadata({
    locale,
    path: `/nouvelles/${slug}`,
    title,
    description,
  });
}

export default async function NouvellesDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug ?? "";
  const article = slug ? await fetchArticle(slug) : null;
  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        datePublished: article.published_at ?? article.created_at,
        dateModified: article.updated_at ?? article.published_at ?? article.created_at,
        author: {
          "@type": "Person",
          name: article.author ?? "Zéro huit",
        },
        image: article.cover_image_url ? [article.cover_image_url] : undefined,
        description: article.excerpt ?? undefined,
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <NouvellesDetailClient />
    </>
  );
}
