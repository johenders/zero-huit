"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useSupabaseClient } from "@/lib/supabase/useClient";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  defaultEmail?: string;
  onSignedIn?: () => void;
};

export function AuthModal({
  open,
  onClose,
  defaultName,
  defaultEmail,
  onSignedIn,
}: Props) {
  const supabase = useSupabaseClient();
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "signed_in" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setStatus("idle");
      setMessage(null);
    });
  }, [open]);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event !== "SIGNED_IN" || !session?.user) return;

      const userName = name.trim();
      if (userName) {
        await supabase
          .from("profiles")
          .update({ name: userName })
          .eq("user_id", session.user.id);
      }

      setStatus("signed_in");
      onSignedIn?.();
      onClose();
      },
    );

    return () => data.subscription.unsubscribe();
  }, [name, onClose, onSignedIn, supabase]);

  if (!open) return null;

  async function sendLink() {
    if (!supabase) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setStatus("sending");
    setMessage(null);

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: redirectTo,
        data: { name: name.trim() },
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Lien envoyé. Vérifie tes courriels pour te connecter.");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Enregistrer tes favoris</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Entre ton nom et ton courriel, on t’enverra un lien magique.
            </p>
          </div>
          <button
            className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Fermer
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Nom</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marie Tremblay"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Courriel</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie@exemple.com"
              autoComplete="email"
              inputMode="email"
            />
          </label>

          {message ? (
            <p
              className={`text-sm ${status === "error" ? "text-red-400" : "text-zinc-300"}`}
            >
              {message}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            onClick={sendLink}
            disabled={status === "sending" || !email.trim() || !supabase}
            type="button"
          >
            {status === "sending" ? "Envoi…" : "Envoyer le lien magique"}
          </button>
        </div>
      </div>
    </div>
  );
}
