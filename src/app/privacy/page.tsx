import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Siira",
  description: "How Siira collects, uses, and protects your data.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2
        className="text-base font-bold text-[#1C1917] mb-1.5"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h2>
      <div className="text-sm text-[#78716C] leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#FDFBF7] flex flex-col">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col px-5 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#F97316] mb-5 min-h-[44px]"
        >
          ← Back
        </Link>
        <h1
          className="text-2xl font-bold text-[#1C1917] mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-[12px] text-[#A8A29E] mb-6">Last updated: September 2026</p>

        <Section title="What we collect">
          <p>
            <strong className="text-[#1C1917]">Account data:</strong> your email address,
            used only to sign you in via a passwordless magic link.
          </p>
          <p>
            <strong className="text-[#1C1917]">Learning data:</strong> your practice
            conversations, pronunciation attempts, review history, streaks, and
            preferences — so we can personalize lessons and track your progress.
          </p>
          <p>
            <strong className="text-[#1C1917]">Audio:</strong> microphone input is used
            in the moment for speech recognition and pronunciation feedback. Voice
            clips are processed to provide the service and are not sold or used for
            advertising.
          </p>
        </Section>

        <Section title="How we use it">
          <p>
            We use your data to operate Siira: signing you in, generating lessons
            and quizzes, giving feedback, saving your progress, and improving the
            learning experience. We never sell your personal data.
          </p>
        </Section>

        <Section title="Third-party processing">
          <p>
            To provide the service we work with infrastructure providers (hosting,
            database, speech recognition, and AI language models). They process data
            only on our behalf and under contractual safeguards.
          </p>
        </Section>

        <Section title="Your controls">
          <p>
            You can sign out at any time from Settings. To export or permanently
            delete your data, use the Export option in Settings or contact us and
            we will handle your request promptly.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Siira is not directed at children under 13. If you believe a child has
            provided us personal data, contact us and we will delete it.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about privacy? Reach us at{" "}
            <span className="font-semibold text-[#1C1917]">privacy@siira.chat</span>.
          </p>
        </Section>
      </div>
    </div>
  );
}
