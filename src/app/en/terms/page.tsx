export const metadata = {
  title: "Terms of Use — Zéro huit",
  description: "Terms of use for the Zéro huit website.",
};

export default function TermsEnPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-16 text-white">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Terms of Use</h1>
        <p className="text-sm text-white/70">Last updated: February 2, 2026</p>
      </header>

      <section className="space-y-3 text-sm text-white/80">
        <p>
          By accessing this website, you agree to these Terms of Use. If you do not
          agree, please do not use the site.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Use of the site</h2>
        <p>
          You agree to use the site lawfully and respectfully, and not to attempt to
          compromise its security or operation.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Intellectual property</h2>
        <p>
          Content, trademarks, images, videos, and text on this site are owned by
          Zéro huit or its partners and are protected by applicable laws. Unauthorized
          reproduction is prohibited.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Limitation of liability</h2>
        <p>
          The site is provided “as is.” Zéro huit does not guarantee error-free or
          uninterrupted access and is not liable for damages resulting from its use.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">External links</h2>
        <p>
          The site may contain links to third-party sites. Zéro huit is not responsible
          for their content or practices.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Governing law</h2>
        <p>
          These Terms are governed by the laws applicable in Quebec and Canada.
        </p>
      </section>

      <section className="space-y-2 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Contact</h2>
        <p>
          For any questions, contact us at <strong>info@zerohuit.ca</strong>.
        </p>
      </section>
    </main>
  );
}
