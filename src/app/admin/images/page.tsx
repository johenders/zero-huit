"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";

type StorageItem = {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  metadata?: { size?: number; mimetype?: string };
};

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
}

export default function AdminImagesPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);

  const [items, setItems] = useState<StorageItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const refreshImages = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.storage.from("articles").list("articles", {
      limit: 100,
      sortBy: { column: "updated_at", order: "desc" },
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((data ?? []) as StorageItem[]);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    void refreshImages();
  }, [supabase, refreshImages]);

  const filteredItems = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, filter]);

  async function handleUpload(files: FileList | null) {
    if (!supabase || !files || files.length === 0) return;
    if (!isAdmin) {
      setMessage("Accès refusé (admin requis).");
      return;
    }
    setMessage(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      const extension = file.name.split(".").pop() || "jpg";
      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const filePath = `articles/${Date.now()}-${safeName}.${extension}`;
      const { error } = await supabase.storage.from("articles").upload(filePath, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });
      if (error) {
        setMessage(error.message);
        break;
      }
    }

    setUploading(false);
    await refreshImages();
  }

  async function copyUrl(path: string) {
    if (!supabase) return;
    const { data } = supabase.storage.from("articles").getPublicUrl(path);
    const url = data.publicUrl;
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4">
      {isAdmin === false ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
          Connecte-toi avec un compte admin pour gérer les images.
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Bibliothèque d'images</h2>
          <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => void handleUpload(event.target.files)}
              disabled={!isAdmin || uploading}
            />
            {uploading ? "Upload en cours..." : "Ajouter des images"}
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            placeholder="Rechercher une image"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          {copiedUrl ? (
            <span className="text-xs text-emerald-300">URL copiée !</span>
          ) : null}
        </div>
        {message ? <div className="mt-2 text-sm text-red-400">{message}</div> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            Aucune image trouvée.
          </div>
        ) : (
          filteredItems.map((item) => {
            const { data } = supabase.storage
              .from("articles")
              .getPublicUrl(`articles/${item.name}`);
            return (
              <div
                key={item.name}
                className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40"
              >
                <div className="h-44 w-full overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.publicUrl} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2 p-3 text-xs text-zinc-400">
                  <div className="truncate">{item.name}</div>
                  <div>{formatBytes(item.metadata?.size)}</div>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                    onClick={() => void copyUrl(`articles/${item.name}`)}
                  >
                    Copier l'URL
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
