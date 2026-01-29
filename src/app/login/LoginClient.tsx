"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@/lib/supabase/useClient";

type Status = "idle" | "checking" | "signing" | "error" | "no_access";

export function LoginClient() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string | null>(null);

  const redirectTarget = useMemo(() => {
    if (!next.startsWith("/")) return "/";
    return next;
  }, [next]);

  useEffect(() => {
    if (!supabase) return;
    let ignore = false;
    async function checkAdmin() {
      setStatus("checking");
      const { data: auth } = await supabase.auth.getUser();
      if (ignore) return;
      if (!auth.user) {
        setStatus(reason === "not_admin" ? "no_access" : "idle");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (ignore) return;
      if (profile?.role === "admin") {
        router.replace(redirectTarget);
        return;
      }
      setStatus("no_access");
    }

    void checkAdmin();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void checkAdmin();
    });

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [reason, redirectTarget, router, supabase]);

  async function signIn() {
    if (!supabase) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return;

    setStatus("signing");
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("idle");
    setMessage(null);
    router.replace(redirectTarget);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl shadow-black/40">
        <h1 className="text-xl font-semibold text-white">Accès privé</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Connecte-toi avec un compte admin pour accéder au site.
        </p>

        {status === "no_access" ? (
          <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
            Ce compte n’a pas accès. Assure-toi d’avoir le rôle{" "}
            <code>admin</code> dans la table <code>profiles</code>.
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Courriel</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemple.com"
              autoComplete="email"
              inputMode="email"
              disabled={status === "signing" || status === "checking"}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Mot de passe</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              type="password"
              disabled={status === "signing" || status === "checking"}
            />
          </label>

          {message ? (
            <p className={`text-sm ${status === "error" ? "text-red-400" : "text-zinc-300"}`}>
              {message}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            onClick={signIn}
            disabled={
              status === "signing" ||
              status === "checking" ||
              !email.trim() ||
              !password ||
              !supabase
            }
            type="button"
          >
            {status === "signing" ? "Connexion…" : "Se connecter"}
          </button>
        </div>
      </div>
    </main>
  );
}
