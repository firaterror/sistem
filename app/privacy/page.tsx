import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — KAGAN",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
      <Link
        href="/"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to home
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 25, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <p>
            When you create an account or use our services we may collect
            personal information such as your name, email address, company name,
            and billing details. We also collect usage data including pages
            visited, features used, and interactions with AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To provide, maintain, and improve our services</li>
            <li>To personalize your experience and deliver relevant content</li>
            <li>To process transactions and send billing-related communications</li>
            <li>To send product updates and service announcements</li>
            <li>To detect, prevent, and address technical or security issues</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            3. Data Storage &amp; Security
          </h2>
          <p>
            Your data is stored on secure, encrypted servers. We implement
            industry-standard security measures including encryption in transit
            (TLS) and at rest, access controls, and regular security audits. We
            retain your data only as long as necessary to fulfil the purposes
            described in this policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            4. AI &amp; Conversation Data
          </h2>
          <p>
            Conversations processed by KAGAN&apos;s AI are used solely to
            deliver the service. We do not use your conversation data to train
            general-purpose models. You retain full ownership of your data and
            may request deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            5. Third-Party Services
          </h2>
          <p>
            We may share limited information with trusted third-party providers
            (e.g. payment processors, hosting, analytics) that help us operate
            the platform. These providers are bound by contractual obligations to
            protect your data and use it only for the purposes we specify.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            6. Cookies
          </h2>
          <p>
            We use essential cookies to maintain your session and preferences.
            Optional analytics cookies are only set with your consent. You can
            manage cookie preferences through your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            7. Your Rights
          </h2>
          <p>
            Depending on your jurisdiction you may have the right to access,
            correct, delete, or export your personal data. You may also withdraw
            consent or object to certain processing. To exercise any of these
            rights, contact us at{" "}
            <a
              href="mailto:privacy@kagan.ai"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              privacy@kagan.ai
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            8. Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. When we do, we will
            revise the &ldquo;last updated&rdquo; date at the top of this page.
            Continued use of the service after changes constitutes acceptance of
            the updated policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            9. Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy, please reach out
            at{" "}
            <a
              href="mailto:privacy@kagan.ai"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              privacy@kagan.ai
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
