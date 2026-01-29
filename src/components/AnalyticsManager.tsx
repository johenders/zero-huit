"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getAnalyticsConsent } from "@/lib/consent";

export function AnalyticsManager() {
  const [enabled, setEnabled] = useState(false);
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    const sync = () => {
      const consent = getAnalyticsConsent();
      setEnabled(consent === "granted");
    };

    sync();

    const handleConsent = () => sync();
    window.addEventListener("consent:ga", handleConsent);
    return () => window.removeEventListener("consent:ga", handleConsent);
  }, []);

  if (!measurementId || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
