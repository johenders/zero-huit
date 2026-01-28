"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";

const navItems = [
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/reglages-references", label: "Réglages références" },
  { href: "/admin/taxonomies", label: "Taxonomies" },
  { href: "/admin/auteurs", label: "Auteurs" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/images", label: "Images" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-none items-center justify-between px-4 py-4 lg:px-6">
          <div>
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-xs text-zinc-400">
              Upload Cloudflare Stream + gestion des options
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
              href="/"
            >
              Retour
            </Link>
            <button
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:opacity-95"
              type="button"
              onClick={() => setAuthOpen(true)}
            >
              Se connecter
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-none gap-4 p-4 lg:gap-6 lg:p-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="rounded-2xl border border-white/10 bg-zinc-950/40 p-3 backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Navigation
            </div>
            <div className="mt-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span className="text-xs text-zinc-500">→</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 lg:hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
