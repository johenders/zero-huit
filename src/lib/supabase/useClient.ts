"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";
import { getSupabaseEnv } from "./env";

export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

export function useSupabaseClient() {
  return useMemo(() => {
    const { url, anonKey } = getSupabaseEnv();
    return createBrowserClient(url, anonKey, {
      auth: { flowType: "pkce" },
    });
  }, []);
}
