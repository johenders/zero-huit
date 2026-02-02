export const metadata = {
  title: "Privacy Policy — Zéro huit",
  description:
    "Privacy policy of Zéro huit, including cookie usage and Google Analytics.",
  alternates: {
    canonical: "/en/privacy",
    languages: {
      "fr-CA": "/politique-de-confidentialite",
      "en-CA": "/en/privacy",
    },
  },
};

export default function PrivacyPolicyEnPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-16 text-white">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-white/70">Last updated: February 2, 2026</p>
      </header>

      <section className="space-y-3 text-sm text-white/80">
        <p>
          Zéro huit respects your privacy. This policy explains how we collect,
          use, and protect personal information when you use our website.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Privacy Officer</h2>
        <p>
          Contact: <strong>Jonathan Henderson</strong>
          <br />
          Title: <strong>Producer</strong>
          <br />
          Email: <strong>jo@zerohuit.ca</strong>
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Contact details submitted through forms (name, email, phone).</li>
          <li>Message content and details related to your request.</li>
          <li>
            Aggregated usage data via Google Analytics, only if you consent.
          </li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Purposes</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Respond to your requests and follow up.</li>
          <li>Improve the website and our services.</li>
          <li>Measure audience (Google Analytics, with consent).</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Service providers</h2>
        <p>
          We use trusted providers to host and process data, including Vercel (hosting),
          Supabase (database), Resend (email delivery), and Cloudflare Stream
          (video delivery). These providers may process data outside Canada, including
          in the United States.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Cookies & Google Analytics</h2>
        <p>
          We use Google Analytics only if you consent. This service may set cookies
          to measure traffic and performance. Without consent, no analytics cookies
          are activated.
        </p>
        <p>Your choice is stored for a maximum of six months.</p>
        <p>
          You can change your choice at any time using the “Manage consent” link
          in the site footer.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Retention</h2>
        <p>
          We keep personal information for as long as needed to fulfill the purposes
          above, and typically up to 24 months after the last interaction, unless a
          longer period is required by law. We then delete or anonymize it.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Your rights</h2>
        <p>
          You can request access, correction, or withdrawal of your personal
          information. To exercise your rights, contact the Privacy Officer above.
        </p>
      </section>
    </main>
  );
}
