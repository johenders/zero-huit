"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";

export default function AdminReferenceSettingsPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);

  const [recommendationSettingsText, setRecommendationSettingsText] = useState("");
  const [recommendationSettingsStatus, setRecommendationSettingsStatus] = useState<
    "idle" | "loading" | "saving" | "error" | "success"
  >("idle");
  const [recommendationSettingsMessage, setRecommendationSettingsMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!supabase || !isAdmin) return;
    setRecommendationSettingsStatus("loading");
    setRecommendationSettingsMessage(null);
    fetch("/api/admin/recommendations-settings")
      .then(async (response) => {
        const json = (await response.json()) as { settings: unknown } | { error: string };
        if (!response.ok || "error" in json) {
          throw new Error("error" in json ? json.error : "Erreur");
        }
        setRecommendationSettingsText(JSON.stringify(json.settings, null, 2));
        setRecommendationSettingsStatus("idle");
      })
      .catch((error) => {
        setRecommendationSettingsStatus("error");
        setRecommendationSettingsMessage(
          error instanceof Error ? error.message : "Erreur chargement.",
        );
      });
  }, [supabase, isAdmin]);

  return (
    <div className="grid w-full grid-cols-1 gap-4">
      {isAdmin === false ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
          Connecte-toi avec un compte admin pour modifier les réglages.
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Réglages références (local)</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-60"
              onClick={() => {
                setRecommendationSettingsStatus("loading");
                setRecommendationSettingsMessage(null);
                fetch("/api/admin/recommendations-settings")
                  .then(async (response) => {
                    const json = (await response.json()) as
                      | { settings: unknown }
                      | { error: string };
                    if (!response.ok || "error" in json) {
                      throw new Error("error" in json ? json.error : "Erreur");
                    }
                    setRecommendationSettingsText(JSON.stringify(json.settings, null, 2));
                    setRecommendationSettingsStatus("idle");
                  })
                  .catch((error) => {
                    setRecommendationSettingsStatus("error");
                    setRecommendationSettingsMessage(
                      error instanceof Error ? error.message : "Erreur chargement.",
                    );
                  });
              }}
              disabled={recommendationSettingsStatus === "loading" || !isAdmin}
            >
              Recharger
            </button>
            <button
              type="button"
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              onClick={() => {
                try {
                  const parsed = JSON.parse(recommendationSettingsText || "{}");
                  setRecommendationSettingsStatus("saving");
                  setRecommendationSettingsMessage(null);
                  fetch("/api/admin/recommendations-settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ settings: parsed }),
                  })
                    .then(async (response) => {
                      const json = (await response.json()) as { ok: true } | { error: string };
                      if (!response.ok || "error" in json) {
                        throw new Error("error" in json ? json.error : "Erreur");
                      }
                      setRecommendationSettingsStatus("success");
                    })
                    .catch((error) => {
                      setRecommendationSettingsStatus("error");
                      setRecommendationSettingsMessage(
                        error instanceof Error ? error.message : "Erreur sauvegarde.",
                      );
                    });
                } catch (error) {
                  setRecommendationSettingsStatus("error");
                  setRecommendationSettingsMessage(
                    error instanceof Error ? error.message : "JSON invalide.",
                  );
                }
              }}
              disabled={recommendationSettingsStatus === "saving" || !isAdmin}
            >
              Sauvegarder
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Modifie le JSON local utilisé pour le filtrage des références (formulaire
          /request).
        </p>
        <textarea
          className="mt-4 h-72 w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-zinc-100 outline-none"
          value={recommendationSettingsText}
          onChange={(event) => setRecommendationSettingsText(event.target.value)}
          spellCheck={false}
          readOnly={!isAdmin}
        />
        {recommendationSettingsMessage ? (
          <div className="mt-2 text-xs text-red-400">{recommendationSettingsMessage}</div>
        ) : null}
        {recommendationSettingsStatus === "success" ? (
          <div className="mt-2 text-xs text-emerald-300">Sauvegardé ✅</div>
        ) : null}
      </section>
    </div>
  );
}
