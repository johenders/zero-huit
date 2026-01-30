"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cloudflareIframeSrc } from "@/lib/cloudflare";
import type { Taxonomy, TaxonomyKind, Video } from "@/lib/types";
import { stripLocalePrefix, withLocaleHref } from "@/lib/i18n/shared";

type Props = {
  video: Video | null;
  open: boolean;
  onClose: () => void;
};

const kindLabels: Record<"type" | "objectif" | "feel" | "keywords", string> = {
  type: "Type",
  objectif: "Objectifs",
  feel: "Ton",
  keywords: "Mots clés",
};

function formatDuration(seconds: number | null) {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function VideoModal({ video, open, onClose }: Props) {
  if (!open || !video) return null;
  const pathname = usePathname();
  const locale = stripLocalePrefix(pathname).locale;
  const byKind: Record<TaxonomyKind, Taxonomy[]> = {
    type: [],
    objectif: [],
    keyword: [],
    style: [],
    feel: [],
    parametre: [],
  };
  for (const t of video.taxonomies) byKind[t.kind].push(t);
  for (const kind of Object.keys(byKind) as TaxonomyKind[]) {
    byKind[kind].sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }

  const keywordGroup = [...byKind.keyword, ...byKind.style, ...byKind.parametre].sort(
    (a, b) => a.label.localeCompare(b.label, "fr"),
  );

  const sections: Array<{ key: keyof typeof kindLabels; tags: Taxonomy[] }> = [
    { key: "type", tags: byKind.type },
    { key: "objectif", tags: byKind.objectif },
    { key: "feel", tags: byKind.feel },
    { key: "keywords", tags: keywordGroup },
  ];

  const durationText = formatDuration(video.duration_seconds);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        <div className="flex items-center justify-between gap-4 bg-zinc-950 px-4 py-3">
          <div className="truncate text-sm font-medium text-white">{video.title}</div>
          <button
            className="rounded-md px-2 py-1 text-sm text-zinc-200 hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Fermer
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 bg-zinc-950/70 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <iframe
              className="h-full w-full"
              src={cloudflareIframeSrc(video.cloudflare_uid)}
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              title={video.title}
            />
          </div>
          <aside className="flex h-full flex-col gap-4">
            <div>
            <div className="text-lg font-semibold text-white">{video.title}</div>
            <div className="mt-1 text-sm text-zinc-400">Durée: {durationText}</div>
            <div className="mt-4">
              <Link
                href={withLocaleHref(
                  locale,
                  `/request?referenceId=${encodeURIComponent(video.id)}`,
                )}
                className="inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/20"
              >
                Demande de soumission
              </Link>
            </div>
          </div>
            <div className="space-y-3 overflow-y-auto pr-1">
              {sections.map((section) => (
                <div key={section.key}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {kindLabels[section.key]}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {section.tags.length === 0 ? (
                      <span className="text-xs text-zinc-500">—</span>
                    ) : (
                      section.tags.map((t) => (
                        <span
                          key={t.id}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200"
                        >
                          {t.label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
