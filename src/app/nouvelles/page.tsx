import Image from "next/image";
import Link from "next/link";
import { fallbackArticles } from "@/lib/articles";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

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

export default async function NouvellesPage() {
  let articles: DisplayArticle[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = getSupabasePublicServerClient();
    const { data, error } = await supabase
      .from("articles")
      .select("id,title,slug,excerpt,cover_image_url,author,published_at,is_published")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (!error && (data ?? []).length > 0) {
      articles = (data as Pick<
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

  if (articles.length === 0) {
    articles = fallbackArticles.map((article) => ({
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      dateLabel: article.dateLabel,
      href: article.href,
      image: article.image,
    }));
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-10 pt-16">
        <span className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">
          Nouvelles
        </span>
        <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
          Articles, id\u00e9es et strat\u00e9gies qui font avancer vos vid\u00e9os.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          D\u00e9couvrez nos analyses, inspirations et conseils pour vos projets corporatifs,
          RH et marketing.
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
      </section>
    </div>
  );
}
