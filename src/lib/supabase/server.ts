import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function getSupabasePublicServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        return fetch(input, { ...init, cache: "no-store" });
      },
    },
  });
}

export function getSupabaseServiceRoleClient() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env: SUPABASE_URL");
  if (!serviceRoleKey) {
    throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        return fetch(input, { ...init, cache: "no-store" });
      },
    },
  });
}

export async function getSupabaseServerComponentClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

export async function getSupabaseRouteHandlerClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}
