"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type { Article, Author } from "@/lib/types";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

type ArticleWithAuthor = Article & {
  authorProfile?: Author | null;
};

type ArticleState =
  | { status: "idle" | "loading" }
  | { status: "ready"; article: ArticleWithAuthor }
  | {
      status: "error";
      message: string;
      slug: string | null;
      publishedSlugs: string[];
      normalizedSlugs: string[];
      normalizedParam: string | null;
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

function slugify(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00a0]/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "—";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase() || "—";
}

export default function NouvellesDetailClient() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const slugParam = useMemo(() => {
    const raw = params?.slug;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0] ?? "";
    return "";
  }, [params]);

  const [state, setState] = useState<ArticleState>({ status: "idle" });

  useEffect(() => {
    let active = true;
    async function fetchArticle() {
      if (!slugParam) {
        if (!active) return;
        setState({
          status: "error",
          message: "Slug manquant dans l'URL.",
          slug: null,
          publishedSlugs: [],
          normalizedSlugs: [],
          normalizedParam: null,
        });
        return;
      }

      setState({ status: "loading" });
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id,title,slug,excerpt,content,cover_image_url,author,author_id,published_at,is_published,created_at,updated_at",
        )
        .eq("slug", slugParam)
        .eq("is_published", true)
        .maybeSingle();

      let resolvedArticle = data as (Article & { author_id?: string | null }) | null;
      let publishedSlugs: string[] = [];
      let normalizedSlugs: string[] = [];
      const normalizedParam = slugify(slugParam);

      if (!resolvedArticle) {
        const { data: fallbackRows } = await supabase
          .from("articles")
          .select(
            "id,title,slug,excerpt,content,cover_image_url,author,author_id,published_at,is_published,created_at,updated_at",
          )
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(50);

        normalizedSlugs = (fallbackRows ?? []).map((row) => slugify(row.slug));
        resolvedArticle =
          (fallbackRows ?? []).find(
            (row) => slugify(row.slug) === normalizedParam,
          ) ?? null;
        publishedSlugs = (fallbackRows ?? []).map((row) => row.slug);
      }

      if (!active) return;

      if (resolvedArticle) {
        let authorProfile: Author | null = null;
        if (resolvedArticle.author_id) {
          const { data: authorRow } = await supabase
            .from("authors")
            .select("id,name,role_title,avatar_url,created_at,updated_at")
            .eq("id", resolvedArticle.author_id)
            .maybeSingle();
          authorProfile = (authorRow as Author | null) ?? null;
        }
        setState({
          status: "ready",
          article: { ...resolvedArticle, authorProfile },
        });
        return;
      }

      setState({
        status: "error",
        message: error?.message || "Aucune ligne trouvée (slug inexistant ou accès refusé).",
        slug: slugParam,
        publishedSlugs,
        normalizedSlugs,
        normalizedParam,
      });
    }

    void fetchArticle();
    return () => {
      active = false;
    };
  }, [slugParam, supabase]);

  if (state.status === "ready") {
    const { article } = state;
    const rawContent = article.content ?? "";
    const sanitizedContent = sanitizeHtml(rawContent);
    const resolvedContent = sanitizedContent.trim() ? sanitizedContent : rawContent;
    const authorName = article.authorProfile?.name ?? article.author ?? "Zéro huit";
    const authorRole = article.authorProfile?.role_title ?? null;
    const authorAvatar = article.authorProfile?.avatar_url ?? null;
    return (
      <div className="min-h-screen bg-[#fefefe] text-slate-900">
        <section className="mx-auto w-full max-w-3xl px-6 pb-6 pt-16">
          <Link
            href="/nouvelles"
            className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700"
          >
            Retour aux nouvelles
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-slate-900 sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{formatDateLabel(article.published_at)}</span>
            <span className="flex items-center gap-2">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                  {getInitials(authorName)}
                </span>
              )}
              par {authorName}
            </span>
          </div>
        </section>

        {article.cover_image_url ? (
          <div className="mx-auto w-full max-w-5xl px-6">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="h-[360px] w-full rounded-3xl object-cover shadow-lg shadow-slate-200/60"
            />
          </div>
        ) : null}

        <section className="mx-auto w-full max-w-3xl px-6 pb-16 pt-10">
          <div
            className="article-content max-w-none text-slate-700"
            dangerouslySetInnerHTML={{
              __html: resolvedContent,
            }}
          />
          <div className="mt-10 flex items-center gap-4 border-t border-slate-200 pt-6">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                {getInitials(authorName)}
              </div>
            )}
            <div>
              <div className="text-lg font-semibold text-slate-900">{authorName}</div>
              <div className="text-sm text-slate-500">
                {authorRole ?? "Auteur"}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const isLoading = state.status === "loading" || state.status === "idle";
  return (
    <div className="min-h-screen bg-[#fefefe] text-slate-900">
      <section className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
        <h1 className="text-2xl font-semibold">
          {isLoading ? "Chargement..." : "Article introuvable"}
        </h1>
        {!isLoading && state.status === "error" ? (
          <>
            <p className="mt-4 text-sm text-slate-600">
              Impossible de charger l'article{" "}
              <span className="font-semibold">{state.slug ?? "—"}</span>.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
              <div>{state.message}</div>
            </div>
            <Link
              href="/nouvelles"
              className="mt-6 inline-flex items-center text-sm font-semibold text-emerald-700"
            >
              Retour aux nouvelles
            </Link>
          </>
        ) : null}
      </section>
    </div>
  );
}
