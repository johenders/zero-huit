"use client";

import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/60">
      <div className="mx-auto flex w-full max-w-none items-center justify-between px-4 py-4 text-xs text-zinc-400 lg:px-6">
        <span>Approx</span>
        <Link href="/admin" className="text-zinc-300 hover:text-white">
          Admin
        </Link>
      </div>
    </footer>
  );
}
