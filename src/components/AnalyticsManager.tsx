"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getAnalyticsConsent } from "@/lib/consent";

export function AnalyticsManager() {
  const [enabled, setEnabled] = useState(false);
  const measurementId =
    process.env.NEXT_PUBLIC_GA_ID ??
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const linkedInPartnerId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? "9493097";

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

  if (!enabled) return null;

  return (
    <>
      {measurementId ? (
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
      ) : null}
      <Script id="linkedin-partner-id" strategy="afterInteractive">
        {`
          _linkedin_partner_id = "${linkedInPartnerId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        `}
      </Script>
      <Script id="linkedin-insight" strategy="afterInteractive">
        {`
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://px.ads.linkedin.com/collect/?pid=${linkedInPartnerId}&fmt=gif`}
        />
      </noscript>
    </>
  );
}
