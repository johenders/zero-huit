"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import type { Editor } from "@ckeditor/ckeditor5-core";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type { Article } from "@/lib/types";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string;
  isPublished: boolean;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00a0]/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function toDatetimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const defaultInput = (): ArticleInput => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  author: "Jean-Benoit Monni\u00e8re",
  publishedAt: toDatetimeLocal(new Date().toISOString()),
  isPublished: true,
});

type UploadAdapterOptions = {
  loader: {
    file: Promise<File>;
  };
  supabase: SupabaseClient | null;
  onError: (message: string) => void;
};

class SupabaseUploadAdapter {
  private loader: UploadAdapterOptions["loader"];
  private supabase: SupabaseClient | null;
  private onError: UploadAdapterOptions["onError"];

  constructor({ loader, supabase, onError }: UploadAdapterOptions) {
    this.loader = loader;
    this.supabase = supabase;
    this.onError = onError;
  }

  async upload() {
    const file = await this.loader.file;
    if (!file) {
      const message = "Aucun fichier image \u00e0 importer.";
      this.onError(message);
      throw new Error(message);
    }
    if (!this.supabase) {
      const message = "Supabase n'est pas disponible pour l'upload d'image.";
      this.onError(message);
      throw new Error(message);
    }

    const extension = file.name.split(".").pop() || "jpg";
    const safeName = slugify(file.name.replace(/\.[^/.]+$/, ""));
    const filePath = `articles/${Date.now()}-${safeName}.${extension}`;
    const { error } = await this.supabase.storage.from("articles").upload(filePath, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (error) {
      this.onError(error.message);
      throw new Error(error.message);
    }
    const { data } = this.supabase.storage.from("articles").getPublicUrl(filePath);
    if (!data.publicUrl) {
      const message = "Impossible de g\u00e9n\u00e9rer l'URL publique de l'image.";
      this.onError(message);
      throw new Error(message);
    }

    return { default: data.publicUrl };
  }

  abort() {
    // Uploads are handled by Supabase; no abort callback available.
  }
}

export default function AdminArticlesPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);

  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState<ArticleInput>(() => defaultInput());
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [libraryItems, setLibraryItems] = useState<
    { name: string; publicUrl: string }[]
  >([]);
  const [libraryFilter, setLibraryFilter] = useState("");
  const editorRef = useRef<Editor | null>(null);
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");

  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
      ),
    [articles],
  );

  const refreshArticles = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id,title,slug,excerpt,content,cover_image_url,author,published_at,is_published,created_at,updated_at",
      )
      .order("published_at", { ascending: false });
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    setArticles((data ?? []) as Article[]);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    void refreshArticles();
  }, [supabase, refreshArticles]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [coverFile]);

  useEffect(() => {
    const sanitized = sanitizeHtml(form.content || "");
    setPreviewHtml(sanitized || form.content || "");
  }, [form.content]);

  async function uploadCoverImage(file: File, slug: string) {
    if (!supabase) return null;
    const extension = file.name.split(".").pop() || "jpg";
    const safeName = slugify(file.name.replace(/\.[^/.]+$/, ""));
    const filePath = `articles/${slug}-${Date.now()}-${safeName}.${extension}`;
    const { error } = await supabase.storage.from("articles").upload(filePath, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (error) {
      throw new Error(error.message);
    }
    const { data } = supabase.storage.from("articles").getPublicUrl(filePath);
    return data.publicUrl || null;
  }

  const refreshLibrary = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.storage.from("articles").list("articles", {
      limit: 200,
      sortBy: { column: "updated_at", order: "desc" },
    });
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    const items = (data ?? []).map((item) => {
      const { data: urlData } = supabase.storage
        .from("articles")
        .getPublicUrl(`articles/${item.name}`);
      return { name: item.name, publicUrl: urlData.publicUrl };
    });
    setLibraryItems(items);
  }, [supabase]);

  function resetForm() {
    setForm(defaultInput());
    setCoverFile(null);
    setCoverPreview(null);
    setEditingArticleId(null);
    setSlugEdited(false);
    setPreviewHtml("");
    editorRef.current?.setData("");
  }

  async function handleSaveArticle() {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Acc\u00e8s refus\u00e9 (admin requis).");
      return;
    }
    setStatusMessage(null);

    const title = form.title.trim();
    if (!title) {
      setStatusMessage("Le titre est requis.");
      return;
    }
    const slug = slugify(form.slug || title);
    if (!slug) {
      setStatusMessage("Le slug est requis.");
      return;
    }
    const publishedAt = fromDatetimeLocal(form.publishedAt);
    if (!publishedAt) {
      setStatusMessage("La date de publication est invalide.");
      return;
    }

    setIsSaving(true);
    let coverUrl = form.coverImageUrl.trim() || null;
    if (coverFile) {
      try {
        coverUrl = await uploadCoverImage(coverFile, slug);
      } catch (error) {
        setIsSaving(false);
        setStatusMessage(
          error instanceof Error ? error.message : "Upload de l'image \u00e9chou\u00e9.",
        );
        return;
      }
    }

    const payload = {
      title,
      slug,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_image_url: coverUrl,
      author: form.author.trim() || null,
      published_at: publishedAt,
      is_published: form.isPublished,
    };

    const { error } = editingArticleId
      ? await supabase.from("articles").update(payload).eq("id", editingArticleId)
      : await supabase.from("articles").insert(payload);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    resetForm();
    setPreviewHtml("");
    await refreshArticles();
  }

  async function handleNormalizeSlugs() {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Acc\u00e8s refus\u00e9 (admin requis).");
      return;
    }
    setStatusMessage(null);
    setIsNormalizing(true);

    const existing = new Set<string>();
    for (const article of articles) {
      existing.add(article.slug);
    }

    for (const article of articles) {
      const base = slugify(article.slug || article.title);
      let nextSlug = base;
      if (!nextSlug) continue;
      if (existing.has(nextSlug) && nextSlug !== article.slug) {
        nextSlug = `${base}-${article.id.slice(0, 6)}`;
      }
      if (nextSlug !== article.slug) {
        const { error } = await supabase
          .from("articles")
          .update({ slug: nextSlug })
          .eq("id", article.id);
        if (error) {
          setStatusMessage(error.message);
          setIsNormalizing(false);
          return;
        }
        existing.delete(article.slug);
        existing.add(nextSlug);
      }
    }

    setIsNormalizing(false);
    await refreshArticles();
  }

  const uploadAdapterPlugin = useCallback(
    (editor: Editor) => {
      const fileRepository = editor.plugins.get("FileRepository") as {
        createUploadAdapter: (loader: { file: Promise<File> }) => SupabaseUploadAdapter;
      };
      fileRepository.createUploadAdapter = (loader: { file: Promise<File> }) =>
        new SupabaseUploadAdapter({
          loader,
          supabase,
          onError: (message) => setStatusMessage(message),
        });
    },
    [supabase],
  );

  const editorConfig = useMemo(
    () => ({
      toolbar: {
        items: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "imageUpload",
          "|",
          "undo",
          "redo",
        ],
      },
      heading: {
        options: [
          { model: "paragraph", title: "Paragraphe", class: "ck-heading_paragraph" },
          { model: "heading1", view: "h1", title: "H1", class: "ck-heading_heading1" },
          { model: "heading2", view: "h2", title: "H2", class: "ck-heading_heading2" },
          { model: "heading3", view: "h3", title: "H3", class: "ck-heading_heading3" },
        ],
      },
      image: {
        toolbar: [
          "imageTextAlternative",
          "imageStyle:inline",
          "imageStyle:block",
          "imageStyle:side",
          "|",
          "resizeImage",
        ],
      },
      extraPlugins: [uploadAdapterPlugin],
    }),
    [uploadAdapterPlugin],
  );

  function insertImageUrl(url: string) {
    const editor = editorRef.current;
    if (!editor) {
      setStatusMessage("L'\u00e9diteur n'est pas pr\u00eat.");
      return;
    }
    editor.execute("insertImage", { source: url });
    editor.editing.view.focus();
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4" suppressHydrationWarning>
      {isAdmin === false ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
          Connecte-toi avec un compte admin pour g\u00e9rer les articles.
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
        <h2 className="text-sm font-semibold">
          {editingArticleId ? "Modifier l'article" : "Nouvel article"}
        </h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-zinc-400">
            Titre
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              value={form.title}
              onChange={(event) => {
                const title = event.target.value;
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: slugEdited ? prev.slug : slugify(title),
                }));
              }}
              placeholder="Ex: La vid\u00e9o corporative qui convertit"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-zinc-400">
            Slug
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              value={form.slug}
              onChange={(event) => {
                setSlugEdited(true);
                setForm((prev) => ({ ...prev, slug: event.target.value }));
              }}
              placeholder="ex: video-corporative-convertit"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-zinc-400">
            Auteur
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              value={form.author}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, author: event.target.value }))
              }
              placeholder="Ex: Jean-Benoit Monni\u00e8re"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-zinc-400">
            Date de publication
            <input
              type="datetime-local"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
              value={form.publishedAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, publishedAt: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-zinc-400 lg:col-span-2">
            Image de couverture
            <input
              type="file"
              accept="image/*"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-white/20"
              onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
            />
            {form.coverImageUrl ? (
              <span className="text-[11px] text-zinc-500">
                Image actuelle: {form.coverImageUrl}
              </span>
            ) : null}
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Aper\u00e7u couverture"
                className="mt-2 h-40 w-full rounded-xl object-cover"
              />
            ) : null}
          </label>
          <label className="flex flex-col gap-2 text-xs text-zinc-400 lg:col-span-2">
            Extrait
            <textarea
              className="min-h-[96px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              value={form.excerpt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, excerpt: event.target.value }))
              }
              placeholder="Court r\u00e9sum\u00e9 affich\u00e9 sur la page Nouvelles."
            />
          </label>
          <div className="flex flex-col gap-2 text-xs text-zinc-400 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Contenu</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                    editorMode === "edit"
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                      : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                  }`}
                  onClick={() => setEditorMode("edit")}
                >
                  Édition
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                    editorMode === "preview"
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                      : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                  }`}
                  onClick={() => setEditorMode("preview")}
                >
                  Prévisualiser
                </button>
              </div>
            </div>
            {editorMode === "edit" ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-white/10"
                    onClick={() => {
                      const url = window.prompt("URL de l'image");
                      if (url) insertImageUrl(url);
                    }}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-white/10"
                    onClick={() => {
                      setShowImagePicker((prev) => !prev);
                      if (!showImagePicker) void refreshLibrary();
                    }}
                  >
                    Sélecteur d'images
                  </button>
                </div>
                <div className="min-h-[220px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100">
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.content}
                    config={editorConfig}
                    onReady={(editor) => {
                      editorRef.current = editor;
                      if (form.content && editor.getData() !== form.content) {
                        editor.setData(form.content);
                      }
                    }}
                    onChange={(_event, editor) => {
                      const html = editor.getData();
                      setForm((prev) => ({ ...prev, content: html }));
                      const sanitized = sanitizeHtml(html);
                      setPreviewHtml(sanitized || html);
                    }}
                  />
                </div>
                <div className="text-[11px] text-zinc-500">
                  Tu peux coller du texte, t\u00e9l\u00e9verser une image ou glisser-d\u00e9poser.
                </div>
              </>
            ) : (
              <div
                className="prose prose-invert min-h-[220px] max-w-none rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-100"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>
        </div>
        {showImagePicker ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Sélecteur d'images
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-white/10"
                onClick={() => setShowImagePicker(false)}
              >
                Fermer
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                placeholder="Rechercher une image"
                value={libraryFilter}
                onChange={(event) => setLibraryFilter(event.target.value)}
              />
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                onClick={() => void refreshLibrary()}
              >
                Rafraîchir
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {libraryItems
                .filter((item) =>
                  libraryFilter
                    ? item.name.toLowerCase().includes(libraryFilter.toLowerCase())
                    : true,
                )
                .map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="group overflow-hidden rounded-xl border border-white/10 bg-black/40 text-left"
                    onClick={() => {
                      insertImageUrl(item.publicUrl);
                      setShowImagePicker(false);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.publicUrl}
                      alt={item.name}
                      className="h-28 w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="truncate px-2 py-2 text-xs text-zinc-300">
                      {item.name}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-white/20 bg-white/10"
              checked={form.isPublished}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isPublished: event.target.checked }))
              }
            />
            Publier l'article
          </label>
          <button
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            type="button"
            onClick={() => void handleSaveArticle()}
            disabled={!isAdmin || isSaving}
          >
            {isSaving
              ? "Enregistrement..."
              : editingArticleId
                ? "Mettre \u00e0 jour"
                : "Cr\u00e9er l'article"}
          </button>
          {editingArticleId ? (
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
              type="button"
              onClick={() => resetForm()}
              disabled={isSaving}
            >
              Annuler
            </button>
          ) : null}
          {statusMessage ? (
            <span className="text-xs text-red-400">{statusMessage}</span>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
        <h2 className="text-sm font-semibold">Articles existants</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-60"
            onClick={() => void handleNormalizeSlugs()}
            disabled={!isAdmin || isNormalizing || articles.length === 0}
          >
            {isNormalizing ? "Normalisation..." : "Normaliser les slugs"}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {sortedArticles.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
              Aucun article pour le moment.
            </div>
          ) : (
            sortedArticles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white">{article.title}</div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      article.is_published
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-zinc-500/20 text-zinc-300"
                    }`}
                  >
                    {article.is_published ? "Publi\u00e9" : "Brouillon"}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">/{article.slug}</div>
                <div className="text-xs text-zinc-400">
                  Publi\u00e9 le {new Date(article.published_at).toLocaleDateString("fr-CA")}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                    onClick={() => {
                      setEditingArticleId(article.id);
                      const normalized = slugify(article.title);
                      setSlugEdited(article.slug !== normalized);
                      setForm({
                        title: article.title,
                        slug: article.slug,
                        excerpt: article.excerpt ?? "",
                        content: article.content ?? "",
                        coverImageUrl: article.cover_image_url ?? "",
                        author: article.author ?? "Jean-Benoit Monni\u00e8re",
                        publishedAt: toDatetimeLocal(article.published_at),
                        isPublished: article.is_published,
                      });
                      setPreviewHtml(sanitizeHtml(article.content ?? ""));
                      setCoverFile(null);
                      setCoverPreview(null);
                      editorRef.current?.setData(article.content ?? "");
                    }}
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
