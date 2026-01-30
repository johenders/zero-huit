"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { withLocaleHref } from "@/lib/i18n/shared";

const socialLinks = [
  {
    href: "https://www.facebook.com/productionszerohuit",
    label: "Facebook",
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.1V12h2.1V9.8c0-2.1 1.2-3.2 3.1-3.2.9 0 1.9.2 1.9.2v2.1h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/zerohuit.ca",
    label: "Instagram",
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    href: "https://vimeo.com/zerohuit",
    label: "Vimeo",
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 8.5c-.2 2.6-1.9 6.1-5 10.4-3.2 4.4-5.8 6.6-7.8 6.6-1.3 0-2.4-1.2-3.2-3.6l-2-7.4c-.4-1.4-.8-2.1-1.4-2.1-.1 0-.6.3-1.4.9L0 11.7 2.5 9c1.6-1.4 3.2-2.7 4.7-2.9 1.8-.2 2.9 1 3.4 3.5.6 2.8 1 4.6 1.2 5.3.7 2.2 1.5 3.3 2.3 3.3.7 0 1.7-1.1 3.1-3.2 1.4-2.1 2.2-3.7 2.3-4.8.2-1.8-.5-2.8-2.2-2.8-.8 0-1.6.2-2.5.5 1.6-5.1 4.6-7.5 9-7.2 3.2.2 4.7 2.2 4.5 5.8z" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/company/zerohuit/",
    label: "LinkedIn",
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.4 20.4h-3.6v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9.1V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.4zM5.1 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM6.9 20.4H3.3V9h3.6z" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  const { locale, t } = useI18n();
  const privacyHref = locale === "en" ? "/en/privacy" : "/politique-de-confidentialite";
  const privacyLabel = locale === "en" ? "Privacy policy" : "Politique de confidentialité";
  const consentLabel = locale === "en" ? "Manage consent" : "Gérer le consentement";
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16 pb-24">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <h2 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
            {t("footer.cta.label")}
          </h2>
          <Link
            href={withLocaleHref(locale, "/contact")}
            className="inline-flex items-center justify-center rounded-full bg-[#8acd5f] px-10 py-4 text-base font-semibold text-zinc-950 transition hover:opacity-90"
          >
            {t("footer.cta.button")}
          </Link>
        </div>
        <div className="mt-6 border-t border-white/10" />
        <div className="mt-10 grid gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
          <div>
            <div className="text-base font-semibold">{t("footer.social.label")}</div>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/80 sm:justify-start">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-white/40 hover:text-white"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-base font-semibold">{t("footer.nav.label")}</div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>
                <Link href={withLocaleHref(locale, "/portfolio")} className="hover:text-white">
                  {t("nav.portfolio")}
                </Link>
              </li>
              <li>
                <Link href={withLocaleHref(locale, "/about")} className="hover:text-white">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href={withLocaleHref(locale, "/services")} className="hover:text-white">
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link href={withLocaleHref(locale, "/nouvelles")} className="hover:text-white">
                  {t("footer.news.label")}
                </Link>
              </li>
              <li>
                <Link href={withLocaleHref(locale, "/contact")} className="hover:text-white">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-base font-semibold">{t("footer.articles.label")}</div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>
                <Link href="/articles/combien-coute-une-production-video" className="hover:text-white">
                  Combien coûte une production vidéo
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/comment-bien-realiser-une-video-corporative"
                  className="hover:text-white"
                >
                  Comment bien réaliser une vidéo corporative
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/les-videos-pour-se-demarquer-sur-les-reseaux-sociaux"
                  className="hover:text-white"
                >
                  Se démarquer sur les réseaux sociaux avec la vidéo
                </Link>
              </li>
              <li>
                <Link href="/articles/production-video-montreal" className="hover:text-white">
                  Production vidéo Montréal : choisir le bon partenaire
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-base font-semibold">{t("footer.contact.label")}</div>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <a href="mailto:info@zerohuit.ca" className="hover:text-white">
                info@zerohuit.ca
              </a>
              <a href="tel:+14503951777" className="block hover:text-white">
                450-395-1777
              </a>
              <div>74 rue St-Laurent</div>
              <div>Beauharnois</div>
              <div>Qu&#233;bec, J6N 1V6</div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-6 right-6 text-[11px] text-white/50">
          <div className="flex items-center gap-4">
            <Link href={privacyHref} className="pointer-events-auto hover:text-white/80">
              {privacyLabel}
            </Link>
            <button
              type="button"
              className="pointer-events-auto hover:text-white/80"
              onClick={() => window.dispatchEvent(new CustomEvent("consent:open"))}
            >
              {consentLabel}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
