"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/consent";

export function CookieBanner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEnglish = pathname?.startsWith("/en");
  const privacyHref = useMemo(
    () => (isEnglish ? "/en/privacy" : "/politique-de-confidentialite"),
    [isEnglish],
  );

  useEffect(() => {
    const consent = getAnalyticsConsent();
    setOpen(consent === null);

    const handleOpen = () => setOpen(true);
    window.addEventListener("consent:open", handleOpen);
    return () => window.removeEventListener("consent:open", handleOpen);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[420px]">
      <div className="text-sm font-semibold">
        {isEnglish ? "Cookies and analytics" : "Cookies et mesure d’audience"}
      </div>
      <p className="mt-2 text-xs text-white/80">
        {isEnglish
          ? "We use Google Analytics only if you accept it, to measure traffic and improve the site. You can change your mind at any time."
          : "Nous utilisons Google Analytics uniquement si vous l’acceptez, pour mesurer l’audience et améliorer le site. Vous pouvez changer d’avis en tout temps."}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <Link
          href={privacyHref}
          className="text-white/70 underline underline-offset-4 hover:text-white"
        >
          {isEnglish ? "Privacy policy" : "Politique de confidentialité"}
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
          onClick={() => {
            setAnalyticsConsent("denied");
            setOpen(false);
          }}
        >
          {isEnglish ? "Decline" : "Refuser"}
        </button>
        <button
          type="button"
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-2 text-xs font-semibold text-white"
          onClick={() => {
            setAnalyticsConsent("granted");
            setOpen(false);
          }}
        >
          {isEnglish ? "Accept" : "Accepter"}
        </button>
      </div>
    </div>
  );
}
