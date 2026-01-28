"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type { Author } from "@/lib/types";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";

type AuthorInput = {
  name: string;
  roleTitle: string;
  avatarUrl: string;
};

const defaultInput = (): AuthorInput => ({
  name: "",
  roleTitle: "",
  avatarUrl: "",
});

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

export default function AdminAuthorsPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState<AuthorInput>(() => defaultInput());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedAuthors = useMemo(
    () => [...authors].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [authors],
  );

  const refreshAuthors = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("authors")
      .select("id,name,role_title,avatar_url,created_at,updated_at")
      .order("name");
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    setAuthors((data ?? []) as Author[]);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    void refreshAuthors();
  }, [supabase, refreshAuthors]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  async function uploadAvatar(file: File, name: string) {
    if (!supabase) return null;
    const extension = file.name.split(".").pop() || "jpg";
    const safeName = slugify(file.name.replace(/\.[^/.]+$/, ""));
    const base = slugify(name) || safeName || "auteur";
    const filePath = `authors/${base}-${Date.now()}.${extension}`;
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

  function resetForm() {
    setForm(defaultInput());
    setEditingId(null);
    setAvatarFile(null);
    setAvatarPreview(null);
  }

  async function handleSaveAuthor() {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Accès refusé (admin requis).");
      return;
    }
    setStatusMessage(null);
    const name = form.name.trim();
    if (!name) {
      setStatusMessage("Le nom est requis.");
      return;
    }

    setIsSaving(true);
    let avatarUrl = form.avatarUrl.trim() || null;
    if (avatarFile) {
      try {
        avatarUrl = await uploadAvatar(avatarFile, name);
      } catch (error) {
        setIsSaving(false);
        setStatusMessage(
          error instanceof Error ? error.message : "Upload de l'image échoué.",
        );
        return;
      }
    }

    const payload = {
      name,
      role_title: form.roleTitle.trim() || null,
      avatar_url: avatarUrl,
    };

    const { error } = editingId
      ? await supabase.from("authors").update(payload).eq("id", editingId)
      : await supabase.from("authors").insert(payload);

    setIsSaving(false);
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    resetForm();
    await refreshAuthors();
  }

  async function handleDeleteAuthor(author: Author) {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Accès refusé (admin requis).");
      return;
    }
    const confirmed = window.confirm(
      `Supprimer "${author.name}" ? Cet auteur sera retiré des articles associés.`,
    );
    if (!confirmed) return;
    setStatusMessage(null);
    const { error } = await supabase.from("authors").delete().eq("id", author.id);
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await refreshAuthors();
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4">
      {isAdmin === false ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
          Connecte-toi avec un compte admin pour gérer les auteurs.
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
        <h2 className="text-sm font-semibold">
          {editingId ? "Modifier l'auteur" : "Nouvel auteur"}
        </h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-zinc-400">
            Nom
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Ex: Jean-Benoit Monnière"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-zinc-400">
            Poste
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              value={form.roleTitle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, roleTitle: event.target.value }))
              }
              placeholder="Ex: Directeur créatif"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-zinc-400 lg:col-span-2">
            Photo de profil
            <input
              type="file"
              accept="image/*"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-white/20"
              onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
            />
            {form.avatarUrl ? (
              <span className="text-[11px] text-zinc-500">
                Image actuelle: {form.avatarUrl}
              </span>
            ) : null}
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Aperçu avatar"
                className="mt-2 h-24 w-24 rounded-full object-cover"
              />
            ) : null}
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            type="button"
            onClick={() => void handleSaveAuthor()}
            disabled={!isAdmin || isSaving}
          >
            {isSaving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
          </button>
          {editingId ? (
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
        <h2 className="text-sm font-semibold">Auteurs existants</h2>
        <div className="mt-4 space-y-3">
          {sortedAuthors.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
              Aucun auteur pour le moment.
            </div>
          ) : (
            sortedAuthors.map((author) => (
              <div
                key={author.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 text-xs text-zinc-400">
                      —
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {author.name}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {author.role_title ?? "Poste non défini"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                    onClick={() => {
                      setEditingId(author.id);
                      setForm({
                        name: author.name,
                        roleTitle: author.role_title ?? "",
                        avatarUrl: author.avatar_url ?? "",
                      });
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                    onClick={() => void handleDeleteAuthor(author)}
                  >
                    Supprimer
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
