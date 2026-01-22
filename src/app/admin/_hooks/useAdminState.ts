"use client";

import { useCallback, useEffect, useState } from "react";
import type { useSupabaseClient } from "@/lib/supabase/useClient";

export function useAdminState(supabase: ReturnType<typeof useSupabaseClient> | null) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const refreshAdminState = useCallback(async () => {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setIsAdmin(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", auth.user.id)
      .single();
    setIsAdmin(profile?.role === "admin");
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    void refreshAdminState();

    const { data } = supabase.auth.onAuthStateChange(() => {
      void refreshAdminState();
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, refreshAdminState]);

  return { isAdmin, refreshAdminState };
}
