import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — KAGAN",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
      <Link
        href="/"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to home
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 25, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using KAGAN (&ldquo;the Service&rdquo;), you agree
            to be bound by these Terms of Service and our Privacy Policy. If you
            do not agree, you may not use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            2. Description of Service
          </h2>
          <p>
            KAGAN provides an AI-powered sales execution platform that includes
            lead capture, automated conversations, workflow automation, and
            analytics. Features and availability may change as we continue to
            develop the product.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            3. Accounts &amp; Access
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You must provide accurate and complete information during
            registration and keep it up to date. We reserve the right to suspend
            or terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            4. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Use the Service for any unlawful purpose</li>
            <li>Send spam, unsolicited messages, or deceptive content through the platform</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Reverse-engineer, decompile, or otherwise attempt to derive the source code</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            5. Intellectual Property
          </h2>
          <p>
            The Service, including its design, code, AI models, and
            documentation, is owned by KAGAN and protected by intellectual
            property laws. You retain ownership of the content you submit. By
            using the Service, you grant us a limited licence to process your
            content solely to deliver and improve the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            6. Billing &amp; Subscriptions
          </h2>
          <p>
            Paid plans are billed in advance on a recurring basis.
            You may cancel at any time; cancellation takes effect at the end of
            the current billing period. Refunds are issued at our discretion.
            We reserve the right to change pricing with 30 days&apos; notice.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            7. Data &amp; Privacy
          </h2>
          <p>
            Our collection and use of personal data is governed by our{" "}
            <Link
              href="/privacy"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              Privacy Policy
            </Link>
            . You are responsible for ensuring that your use of the Service
            complies with applicable data protection regulations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            8. Disclaimers
          </h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, express or implied.
            AI-generated responses may contain inaccuracies. You acknowledge
            that KAGAN is a tool to assist your sales operations and that
            human oversight remains your responsibility.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            9. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, KAGAN shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages, or any loss of profits or revenues, whether incurred
            directly or indirectly, arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            10. Changes to These Terms
          </h2>
          <p>
            We may revise these terms from time to time. Material changes will
            be communicated via email or an in-app notice at least 14 days
            before they take effect. Continued use of the Service after changes
            constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            11. Contact
          </h2>
          <p>
            Questions about these terms? Reach out at{" "}
            <a
              href="mailto:legal@kagan.ai"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              legal@kagan.ai
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
