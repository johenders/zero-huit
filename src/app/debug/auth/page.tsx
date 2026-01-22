"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { parseUrlHashParams } from "@/lib/supabase/debug";

function safeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function AuthDebugPage() {
  const [next, setNext] = useState<string>("/");

  const supabase = useMemo(() => {
    const { url, anonKey } = getSupabaseEnv();
    return createBrowserClient(url, anonKey);
  }, []);

  const [href, setHref] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [cookies, setCookies] = useState<string>("");
  const [session, setSession] = useState<unknown>(null);
  const [user, setUser] = useState<unknown>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHref(window.location.href);
    setHash(window.location.hash);
    setCookies(document.cookie || "(vide)");
    setNext(new URL(window.location.href).searchParams.get("next") ?? "/");
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const [{ data: sessionData }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);
      if (ignore) return;
      setSession(sessionData.session);
      setUser(userData.user);
    }
    void load();

    const { data } = supabase.auth.onAuthStateChange(async () => {
      const [{ data: sessionData }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);
      if (ignore) return;
      setSession(sessionData.session);
      setUser(userData.user);
    });

    return () => {
      ignore = true;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function parseImplicitGrantFromHash() {
    setMessage(null);
    try {
      const params = parseUrlHashParams(window.location.hash);
      if (params.error) {
        setMessage(
          `Erreur dans le hash: ${params.error} (${params.error_code ?? "no_code"}) - ${params.error_description ?? ""}`,
        );
        return;
      }
      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;
      if (!accessToken || !refreshToken) {
        setMessage("Aucun access_token/refresh_token dans le hash.");
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
      setMessage("Session récupérée depuis le hash (implicit grant).");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function exchangeCodeIfPresent() {
    setMessage(null);
    try {
      const code = new URL(window.location.href).searchParams.get("code");
      if (!code) {
        setMessage("Aucun paramètre ?code= dans l’URL.");
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      setMessage("Code échangé: session créée.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function goNext() {
    window.location.href = next;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 text-zinc-100">
      <h1 className="text-lg font-semibold">Debug Auth</h1>
      <p className="mt-2 text-sm text-zinc-300">
        Cette page aide à diagnostiquer les magic links (hash d’erreur, code PKCE,
        cookies/session).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          type="button"
          onClick={() => void parseImplicitGrantFromHash()}
        >
          Lire session depuis le hash
        </button>
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
          type="button"
          onClick={() => void exchangeCodeIfPresent()}
        >
          Échanger ?code=
        </button>
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
          type="button"
          onClick={() => void goNext()}
        >
          Aller à {next}
        </button>
      </div>

      {message ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            URL
          </div>
          <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
            {href || "(chargement…)"}
          </pre>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Hash
          </div>
          <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
            {hash || "(vide)"}
          </pre>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            document.cookie (non-HttpOnly)
          </div>
          <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
            {cookies}
          </pre>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Session (supabase.auth.getSession)
          </div>
          <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
            {safeJson(session)}
          </pre>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            User (supabase.auth.getUser)
          </div>
          <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
            {safeJson(user)}
          </pre>
        </section>
      </div>
    </div>
  );
}
