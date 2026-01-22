import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl shadow-black/40">
            <h1 className="text-xl font-semibold text-white">Accès privé</h1>
            <p className="mt-2 text-sm text-zinc-400">Chargement…</p>
          </div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
