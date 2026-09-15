"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";
import { getSupabaseEnv, readSupabaseEnv } from "./env";

export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

export function useSupabaseClient() {
  return useMemo(() => {
    const { url, anonKey } = getSupabaseEnv();
    return createBrowserClient(url, anonKey, {
      auth: { flowType: "pkce" },
    });
  }, []);
}

/**
 * Variante tolérante, pour les éléments présents sur TOUTES les pages — le
 * pied de page, par exemple. Sans configuration Supabase, ils doivent se
 * passer de leurs données, pas faire tomber le site entier.
 */
export function useOptionalSupabaseClient(): SupabaseBrowserClient | null {
  return useMemo(() => {
    const env = readSupabaseEnv();
    if (!env) return null;
    return createBrowserClient(env.url, env.anonKey, {
      auth: { flowType: "pkce" },
    });
  }, []);
}
