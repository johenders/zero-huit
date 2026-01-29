"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type { Taxonomy } from "@/lib/types";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";
import { groupUiEntriesBySection, uiKeys } from "@/lib/i18n/ui";
import { mergeTaxonomiesByKinds, taxonomyGroups } from "@/app/admin/_lib/taxonomies";

const locale = "en";

type TabKey = "ui" | "content" | "tags";

type UiEntry = {
  key: string;
  fr: string;
  section: "ui" | "content";
};

export default function AdminTranslationsPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);

  const [activeTab, setActiveTab] = useState<TabKey>("ui");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [taxonomyTranslations, setTaxonomyTranslations] = useState<Record<string, string>>({});
  const [entries, setEntries] = useState<{ ui: UiEntry[]; content: UiEntry[] }>({
    ui: [],
    content: [],
  });

  useEffect(() => {
    setEntries(groupUiEntriesBySection());
  }, []);

  const groupedTaxonomies = useMemo(() => {
    const groups: Record<string, Taxonomy[]> = {
      type: [],
      objectif: [],
      keyword: [],
      style: [],
      feel: [],
      parametre: [],
    };
    for (const taxonomy of taxonomies) {
      groups[taxonomy.kind]?.push(taxonomy);
    }
    return groups;
  }, [taxonomies]);

  const refreshTranslations = useCallback(async () => {
    if (!supabase) return;
    setStatusMessage(null);
    const { data, error } = await supabase
      .from("translations")
      .select("key,value")
      .eq("locale", locale)
      .in("key", uiKeys);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      map[row.key] = row.value;
    }
    setTranslations(map);
  }, [supabase]);

  const refreshTaxonomyTranslations = useCallback(async () => {
    if (!supabase) return;
    const { data: taxonomyRows, error: taxonomyError } = await supabase
      .from("taxonomies")
      .select("id,kind,label")
      .order("label");

    if (taxonomyError) {
      setStatusMessage(taxonomyError.message);
      return;
    }
    setTaxonomies((taxonomyRows ?? []) as Taxonomy[]);

    const taxonomyIds = (taxonomyRows ?? []).map((taxonomy) => taxonomy.id);
    if (taxonomyIds.length === 0) {
      setTaxonomyTranslations({});
      return;
    }

    const { data: translationRows, error: translationError } = await supabase
      .from("taxonomy_translations")
      .select("taxonomy_id,label")
      .eq("locale", locale)
      .in("taxonomy_id", taxonomyIds);

    if (translationError) {
      setStatusMessage(translationError.message);
      return;
    }

    const map: Record<string, string> = {};
    for (const row of translationRows ?? []) {
      map[row.taxonomy_id] = row.label;
    }
    setTaxonomyTranslations(map);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    void refreshTranslations();
    void refreshTaxonomyTranslations();
  }, [supabase, refreshTranslations, refreshTaxonomyTranslations]);

  const handleTranslationChange = (key: string, value: string) => {
    setTranslations((prev) => ({ ...prev, [key]: value }));
  };

  const handleTaxonomyChange = (taxonomyId: string, value: string) => {
    setTaxonomyTranslations((prev) => ({ ...prev, [taxonomyId]: value }));
  };

  const saveTranslation = async (key: string) => {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Accès refusé (admin requis).");
      return;
    }
    const value = translations[key]?.trim() ?? "";
    setSavingKey(key);
    setStatusMessage(null);

    if (!value) {
      const { error } = await supabase
        .from("translations")
        .delete()
        .eq("key", key)
        .eq("locale", locale);
      if (error) setStatusMessage(error.message);
      setSavingKey(null);
      return;
    }

    const { error } = await supabase
      .from("translations")
      .upsert({ key, locale, value }, { onConflict: "key,locale" });
    if (error) setStatusMessage(error.message);
    setSavingKey(null);
  };

  const saveAllTranslations = async () => {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Accès refusé (admin requis).");
      return;
    }
    setIsSavingAll(true);
    setStatusMessage(null);

    const keys = entriesForTab.map((entry) => entry.key);
    const toUpsert = keys
      .map((key) => ({ key, value: translations[key]?.trim() ?? "" }))
      .filter((row) => row.value.length > 0)
      .map((row) => ({ key: row.key, locale, value: row.value }));

    if (toUpsert.length > 0) {
      const { error } = await supabase
        .from("translations")
        .upsert(toUpsert, { onConflict: "key,locale" });
      if (error) {
        setStatusMessage(error.message);
        setIsSavingAll(false);
        return;
      }
    }

    const emptyKeys = keys.filter((key) => !(translations[key]?.trim() ?? ""));
    if (emptyKeys.length > 0) {
      const { error } = await supabase
        .from("translations")
        .delete()
        .eq("locale", locale)
        .in("key", emptyKeys);
      if (error) {
        setStatusMessage(error.message);
        setIsSavingAll(false);
        return;
      }
    }

    setIsSavingAll(false);
  };

  const saveTaxonomyTranslation = async (taxonomyId: string) => {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Accès refusé (admin requis).");
      return;
    }
    const value = taxonomyTranslations[taxonomyId]?.trim() ?? "";
    setSavingKey(taxonomyId);
    setStatusMessage(null);

    if (!value) {
      const { error } = await supabase
        .from("taxonomy_translations")
        .delete()
        .eq("taxonomy_id", taxonomyId)
        .eq("locale", locale);
      if (error) setStatusMessage(error.message);
      setSavingKey(null);
      return;
    }

    const { error } = await supabase
      .from("taxonomy_translations")
      .upsert(
        { taxonomy_id: taxonomyId, locale, label: value },
        { onConflict: "taxonomy_id,locale" },
      );
    if (error) setStatusMessage(error.message);
    setSavingKey(null);
  };

  const saveAllTaxonomyTranslations = async () => {
    if (!supabase) return;
    if (!isAdmin) {
      setStatusMessage("Accès refusé (admin requis).");
      return;
    }
    setIsSavingAll(true);
    setStatusMessage(null);

    const taxonomyIds = taxonomies.map((taxonomy) => taxonomy.id);
    const toUpsert = taxonomyIds
      .map((taxonomyId) => ({
        taxonomyId,
        value: taxonomyTranslations[taxonomyId]?.trim() ?? "",
      }))
      .filter((row) => row.value.length > 0)
      .map((row) => ({
        taxonomy_id: row.taxonomyId,
        locale,
        label: row.value,
      }));

    if (toUpsert.length > 0) {
      const { error } = await supabase
        .from("taxonomy_translations")
        .upsert(toUpsert, { onConflict: "taxonomy_id,locale" });
      if (error) {
        setStatusMessage(error.message);
        setIsSavingAll(false);
        return;
      }
    }

    const emptyIds = taxonomyIds.filter(
      (taxonomyId) => !(taxonomyTranslations[taxonomyId]?.trim() ?? ""),
    );
    if (emptyIds.length > 0) {
      const { error } = await supabase
        .from("taxonomy_translations")
        .delete()
        .eq("locale", locale)
        .in("taxonomy_id", emptyIds);
      if (error) {
        setStatusMessage(error.message);
        setIsSavingAll(false);
        return;
      }
    }

    setIsSavingAll(false);
  };

  const entriesForTab = activeTab === "ui" ? entries.ui : entries.content;

  return (
    <div className="grid w-full grid-cols-1 gap-4">
      {isAdmin === false ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
          Connecte-toi avec un compte admin pour gérer les traductions.
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ui")}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === "ui"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 text-zinc-300 hover:bg-white/5"
            }`}
          >
            UI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === "content"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 text-zinc-300 hover:bg-white/5"
            }`}
          >
            Contenu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tags")}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === "tags"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 text-zinc-300 hover:bg-white/5"
            }`}
          >
            Tags portfolio
          </button>
          <button
            type="button"
            onClick={() =>
              activeTab === "tags" ? void saveAllTaxonomyTranslations() : void saveAllTranslations()
            }
            className="ml-auto rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:opacity-95"
            disabled={!isAdmin || isSavingAll}
          >
            {isSavingAll ? "Enregistrement..." : "Enregistrer tout"}
          </button>
        </div>

        {statusMessage ? <div className="mt-3 text-sm text-red-400">{statusMessage}</div> : null}

        {activeTab !== "tags" ? (
          <div className="mt-4 space-y-3">
            {entriesForTab.map((entry) => (
              <div
                key={entry.key}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {entry.key}
                </div>
                <div className="mt-2 text-sm text-zinc-300">{entry.fr}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                    placeholder="Translation EN"
                    value={translations[entry.key] ?? ""}
                    onChange={(e) => handleTranslationChange(entry.key, e.target.value)}
                  />
                  <button
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                    type="button"
                    onClick={() => void saveTranslation(entry.key)}
                    disabled={!isAdmin || savingKey === entry.key}
                  >
                    {savingKey === entry.key ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {taxonomyGroups.map((group) => {
              const items = mergeTaxonomiesByKinds(
                groupedTaxonomies as Record<
                  "type" | "objectif" | "keyword" | "style" | "feel" | "parametre",
                  Taxonomy[]
                >,
                group.kinds,
              );
              return (
                <div
                  key={group.kind}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {group.label}
                  </div>
                  <div className="mt-3 space-y-3">
                    {items.length === 0 ? (
                      <div className="text-sm text-zinc-400">Aucun tag</div>
                    ) : (
                      items.map((taxonomy) => (
                        <div key={taxonomy.id} className="flex flex-wrap items-center gap-2">
                          <div className="min-w-[180px] text-sm text-zinc-300">
                            {taxonomy.label}
                          </div>
                          <input
                            className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                            placeholder="Translation EN"
                            value={taxonomyTranslations[taxonomy.id] ?? ""}
                            onChange={(e) =>
                              handleTaxonomyChange(taxonomy.id, e.target.value)
                            }
                          />
                          <button
                            className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                            type="button"
                            onClick={() => void saveTaxonomyTranslation(taxonomy.id)}
                            disabled={!isAdmin || savingKey === taxonomy.id}
                          >
                            {savingKey === taxonomy.id
                              ? "Enregistrement..."
                              : "Enregistrer"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
