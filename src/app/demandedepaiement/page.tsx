import { headers } from "next/headers";
import { PaymentRequestForm } from "@/components/PaymentRequestForm";
import { normalizeLocale } from "@/lib/i18n/shared";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));

  return buildPageMetadata({
    locale,
    path: "/demandedepaiement",
    title:
      locale === "en"
        ? "Payment Request — Zéro huit"
        : "Demande de paiement — Zéro huit",
    description:
      locale === "en"
        ? "Payment request form for sending project and Interac payment details to Zéro huit."
        : "Formulaire de demande de paiement pour envoyer les details du projet et du virement Interac a Zéro huit.",
  });
}

export default async function PaymentRequestPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));

  return <PaymentRequestForm locale={locale} />;
}
