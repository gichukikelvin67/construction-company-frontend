
import Link from "next/link";

const sections = [
  {
    title: "1. What cookies are",
    paragraphs: [
      "Cookies are small text files stored by a website in your browser. Similar technologies may store or access information on your device.",
      "They can support essential website functions, remember preferences, help protect accounts or measure how a website is used.",
    ],
  },
  {
    title: "2. How Aesthetics may use them",
    paragraphs: [
      "Aesthetics may use strictly necessary technologies to support core website and platform functions, including authentication, session management and security, where implemented.",
      "Optional technologies, such as analytics or advertising tools, should only be enabled where their use has been assessed and any required consent has been obtained.",
      "The exact cookies and technologies used by the live website must be verified before this policy is treated as a complete inventory.",
    ],
  },
  {
    title: "3. Essential and optional technologies",
    paragraphs: [
      "Essential technologies support features necessary for a service you request, such as maintaining a secure sign-in session. Disabling them may prevent some platform functions from working.",
      "Optional analytics, personalization or advertising technologies may help measure usage or customize experiences. Where consent is required, these technologies should remain disabled until the user makes the appropriate choice.",
    ],
  },
  {
    title: "4. Managing cookies",
    paragraphs: [
      "You can review cookie controls in your browser and delete or block cookies through its settings. Blocking essential cookies may affect sign-in, security and other website features.",
      "Browser controls do not necessarily manage every form of tracking technology. If Aesthetics enables optional technologies that require consent, the website should provide a suitable preference mechanism.",
    ],
  },
  {
    title: "5. Third-party services",
    paragraphs: [
      "Hosting, authentication, analytics, embedded content or other integrations may involve third-party technologies if those services are configured.",
      "The website owner should verify which providers are actually in use, review their relevant privacy information and update this policy when the implementation changes.",
    ],
  },
  {
    title: "6. Updates and contact",
    paragraphs: [
      "This policy may be updated when the website's technologies or applicable requirements change. The latest revision date will be displayed on this page.",
      "For questions about cookies or privacy, use the contact form on the Aesthetics website.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f4ead7] text-[#002147]">
      <header className="border-b border-white/10 bg-[#002147] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="font-black tracking-wide">
            AESTHETICS
          </Link>
          <Link
            href="/"
            className="text-sm text-white/75 transition hover:text-[#f6c700]"
          >
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9b111e]">
          Legal information
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Cookie Policy
        </h1>

        <p className="mt-5 max-w-3xl leading-7 text-[#002147]/70">
          This page explains cookies and similar technologies that may be
          used when visiting the Aesthetics website or using the platform.
        </p>

        <p className="mt-3 text-xs text-[#002147]/50">
          Last updated: 12 October 2026
        </p>

        <div className="mt-10 rounded-2xl border border-[#002147]/10 bg-white p-6 shadow-sm sm:p-9">
          <div className="space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-[#002147]/70"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
          <Link className="text-[#9b111e] hover:underline" href="/terms">
            Terms and Conditions
          </Link>
          <Link className="text-[#9b111e] hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="text-[#9b111e] hover:underline" href="/#contact">
            Contact us
          </Link>
        </div>

        <p className="mt-10 text-xs leading-6 text-[#002147]/50">
          Working draft: confirm the cookies and third-party technologies
          actually used by the website before publishing this policy as final.
        </p>
      </section>

      <footer className="bg-[#00172f] px-6 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Aesthetics. All rights reserved.
      </footer>
    </main>
  );
}
