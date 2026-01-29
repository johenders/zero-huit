import Image from "next/image";
import Link from "next/link";
import { fallbackArticles } from "@/lib/articles";
import { getUiDictionary } from "@/lib/i18n/server";
import { withLocaleHref } from "@/lib/i18n/shared";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

type DisplayArticle = {
  title: string;
  excerpt: string;
  author: string;
  authorRole?: string | null;
  authorAvatarUrl?: string | null;
  dateLabel: string;
  href: string;
  imageUrl?: string | null;
  image?: (typeof fallbackArticles)[number]["image"];
};

function formatDateLabel(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "—";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase() || "—";
}

export async function NouvellesPage({ locale }: { locale: "fr" | "en" }) {
  let articles: DisplayArticle[] = [];
  const dictionary = await getUiDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = getSupabasePublicServerClient();
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id,title,slug,excerpt,cover_image_url,author,author_id,published_at,is_published",
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (!error && (data ?? []).length > 0) {
    const rows = data as (Pick<
      Article,
      "id" | "title" | "slug" | "excerpt" | "cover_image_url" | "author" | "published_at"
    > & { author_id?: string | null })[];

    const authorIds = Array.from(
      new Set(rows.map((article) => article.author_id).filter(Boolean)) as Set<string>,
    );
    let authorById = new Map<
      string,
      { name: string; role_title: string | null; avatar_url: string | null }
    >();
    if (authorIds.length > 0) {
      const { data: authorRows } = await supabase
        .from("authors")
        .select("id,name,role_title,avatar_url")
        .in("id", authorIds);
      authorById = new Map(
        (authorRows ?? []).map((author) => [
          author.id,
          {
            name: author.name,
            role_title: author.role_title ?? null,
            avatar_url: author.avatar_url ?? null,
          },
        ]),
      );
    }

    articles = rows.map((article) => {
      const authorProfile = article.author_id
        ? authorById.get(article.author_id) ?? null
        : null;
      return {
        title: article.title,
        excerpt: article.excerpt ?? "",
        author: authorProfile?.name ?? article.author ?? "Zéro huit",
        authorRole: authorProfile?.role_title ?? null,
        authorAvatarUrl: authorProfile?.avatar_url ?? null,
        dateLabel: formatDateLabel(article.published_at, locale),
        href: withLocaleHref(locale, `/nouvelles/${article.slug}`),
        imageUrl: article.cover_image_url,
      };
    });
  }
  }

  if (articles.length === 0) {
    articles = fallbackArticles.map((article) => ({
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      authorRole: null,
      authorAvatarUrl: null,
      dateLabel: article.dateLabel,
      href: withLocaleHref(locale, article.href),
      image: article.image,
    }));
  }

  return (
    <div className="min-h-screen bg-[#fefefe] text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-10 pt-16">
        <span className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">
          {t("news.label")}
        </span>
        <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
          {t("news.title")}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          {t("news.subtitle")}
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
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
                  {t("home.latest.badge")}
                </span>
              </div>
              <div className="space-y-4 px-5 pb-6 pt-5">
                <div className="text-xs text-slate-500">{article.dateLabel}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {article.authorAvatarUrl ? (
                    <img
                      src={article.authorAvatarUrl}
                      alt={article.author}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                      {getInitials(article.author)}
                    </span>
                  )}
                  <span>
                    {t("home.latest.by")} {article.author}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{article.title}</h3>
                <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default async function NouvellesPageDefault() {
  return NouvellesPage({ locale: "fr" });
}
