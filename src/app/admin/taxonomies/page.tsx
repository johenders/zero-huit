"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type { Taxonomy, TaxonomyKind } from "@/lib/types";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";
import { mergeTaxonomiesByKinds, taxonomyGroups } from "@/app/admin/_lib/taxonomies";

export default function AdminTaxonomiesPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);

  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [newTaxKind, setNewTaxKind] = useState<TaxonomyKind>("type");
  const [newTaxLabel, setNewTaxLabel] = useState("");
  const [taxMessage, setTaxMessage] = useState<string | null>(null);

  const groupedTaxonomies = useMemo(() => {
    const groups: Record<TaxonomyKind, Taxonomy[]> = {
      type: [],
      objectif: [],
      keyword: [],
      style: [],
      feel: [],
      parametre: [],
    };
    for (const t of taxonomies) groups[t.kind].push(t);
    for (const kind of Object.keys(groups) as TaxonomyKind[]) {
      groups[kind].sort((a, b) => a.label.localeCompare(b.label, "fr"));
    }
    return groups;
  }, [taxonomies]);

  const refreshTaxonomies = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("taxonomies")
      .select("id,kind,label")
      .order("label");
    setTaxonomies((data ?? []) as Taxonomy[]);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    void refreshTaxonomies();
  }, [supabase, refreshTaxonomies]);

  async function addTaxonomy() {
    if (!supabase) return;
    if (!isAdmin) {
      setTaxMessage("Accès refusé (admin requis).");
      return;
    }
    setTaxMessage(null);
    const label = newTaxLabel.trim();
    if (!label) return;

    const { error } = await supabase
      .from("taxonomies")
      .insert({ kind: newTaxKind, label });
    if (error) {
      setTaxMessage(error.message);
      return;
    }

    setNewTaxLabel("");
    await refreshTaxonomies();
  }

  async function deleteTaxonomy(taxonomy: Taxonomy) {
    if (!supabase) return;
    if (!isAdmin) {
      setTaxMessage("Accès refusé (admin requis).");
      return;
    }
    const confirmed = window.confirm(
      `Supprimer "${taxonomy.label}" ? Il sera retiré de toutes les vidéos.`,
    );
    if (!confirmed) return;
    setTaxMessage(null);
    const { error } = await supabase.from("taxonomies").delete().eq("id", taxonomy.id);
    if (error) {
      setTaxMessage(error.message);
      return;
    }
    await refreshTaxonomies();
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4">
      {isAdmin === false ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-400">
          Connecte-toi avec un compte admin pour gérer les taxonomies.
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
        <h2 className="text-sm font-semibold">Taxonomies</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
            value={newTaxKind}
            onChange={(e) => setNewTaxKind(e.target.value as TaxonomyKind)}
          >
            {taxonomyGroups.map((group) => (
              <option key={group.kind} value={group.kind}>
                {group.label}
              </option>
            ))}
          </select>
          <input
            className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            value={newTaxLabel}
            onChange={(e) => setNewTaxLabel(e.target.value)}
            placeholder="Ex: Publicité"
          />
          <button
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            type="button"
            onClick={() => void addTaxonomy()}
            disabled={!isAdmin}
          >
            Ajouter
          </button>
        </div>
        {taxMessage ? <div className="mt-2 text-sm text-red-600">{taxMessage}</div> : null}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {taxonomyGroups.map((group) => {
            const options = mergeTaxonomiesByKinds(groupedTaxonomies, group.kinds);
            return (
              <div
                key={group.kind}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {group.label}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {options.length === 0 ? (
                    <div className="text-sm text-zinc-400">Aucune option</div>
                  ) : (
                    options.map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-200"
                      >
                        {t.label}
                        <button
                          type="button"
                          onClick={() => void deleteTaxonomy(t)}
                          className="rounded-full px-1 text-[10px] text-zinc-300 hover:bg-white/10 hover:text-white"
                          aria-label={`Supprimer ${t.label}`}
                          disabled={!isAdmin}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
