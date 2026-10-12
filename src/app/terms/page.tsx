
import Link from "next/link";

const sections = [
  {
    title: "1. About Aesthetics",
    content: [
      "Aesthetics is a construction management platform designed to help construction businesses organize projects, workers, materials, suppliers, expenses, invoices and related operations.",
      "These Terms govern your access to and use of the website and platform. By using the platform, you agree to comply with these Terms and applicable law.",
    ],
  },
  {
    title: "2. Accounts and access",
    content: [
      "You must provide accurate information when creating or using an account and keep your account details up to date.",
      "You are responsible for protecting your login credentials and for activities carried out through your account. Notify the platform administrator promptly if you suspect unauthorized access.",
      "Only access projects, company records and other information that you are authorized to use. Your access may depend on your assigned role and permissions.",
    ],
  },
  {
    title: "3. Acceptable use",
    content: [
      "You must not use the platform for unlawful activity, attempt to bypass access controls, interfere with its operation, introduce malicious code or access another user's information without authorization.",
      "You must ensure that information you upload or enter is accurate to the best of your knowledge and that you have the right to submit it.",
    ],
  },
  {
    title: "4. Business records and responsibility",
    content: [
      "The platform provides tools for recording and organizing operational and financial information. You remain responsible for reviewing records, verifying calculations and maintaining any supporting documents required for your business.",
      "Do not rely solely on the platform as a substitute for professional accounting, legal, engineering, safety or other specialist advice.",
    ],
  },
  {
    title: "5. Plans, fees and payments",
    content: [
      "Any prices, plans, features or service descriptions displayed on the website are subject to the applicable quotation or service agreement.",
      "Before purchasing a paid service, confirm the price, billing arrangement, scope, payment deadlines, cancellation terms and any applicable taxes with Aesthetics.",
      "No price displayed on the website should be treated as a final binding quotation unless it has been confirmed through the applicable agreement.",
    ],
  },
  {
    title: "6. Data and privacy",
    content: [
      "Your use of personal information through the platform is described in our Privacy Policy. You should only upload personal or business information that you are authorized to provide.",
      "You are responsible for ensuring that information about workers, customers, suppliers and other individuals is handled appropriately within your organization.",
    ],
  },
  {
    title: "7. Availability and changes",
    content: [
      "We aim to maintain a useful and reliable service, but uninterrupted access cannot be guaranteed. Maintenance, technical problems, connectivity issues or third-party service disruptions may affect availability.",
      "We may update features or these Terms as the platform develops. Material changes should be communicated appropriately, and the updated Terms will display their revision date.",
    ],
  },
  {
    title: "8. Intellectual property",
    content: [
      "The platform's branding, original interface, software and other protected materials belong to their respective owners or licensors. You may not copy, distribute, reverse engineer or commercially exploit protected materials except as permitted by law or with appropriate authorization.",
      "You retain responsibility for ensuring that content you submit does not infringe another person's rights.",
    ],
  },
  {
    title: "9. Suspension and termination",
    content: [
      "Access may be restricted or suspended where reasonably necessary to protect the platform, investigate suspected misuse, enforce these Terms or comply with legal obligations.",
      "Where appropriate, we will provide notice and an opportunity to address the issue. Account closure and handling of associated records remain subject to applicable agreements and legal obligations.",
    ],
  },
  {
    title: "10. Liability",
    content: [
      "To the extent permitted by applicable law, Aesthetics is not responsible for losses caused by inaccurate information entered by users, unauthorized activity resulting from a failure to protect account credentials, or interruptions beyond its reasonable control.",
      "Nothing in these Terms excludes or limits liability where doing so would be unlawful. Any additional limitations must be consistent with applicable law and the relevant service agreement.",
    ],
  },
  {
    title: "11. Governing law and contact",
    content: [
      "These Terms are intended to operate subject to the applicable laws of Kenya and any other mandatory law that applies to your use of the service.",
      "For questions about these Terms, use the contact form on our website to reach the Aesthetics team.",
    ],
  },
];

export default function TermsPage() {
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
          Terms and Conditions
        </h1>

        <p className="mt-5 max-w-3xl leading-7 text-[#002147]/70">
          These Terms explain the rules for accessing and using the Aesthetics
          Construction Management Platform. Please read them before using the
          service.
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
                  {section.content.map((paragraph) => (
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
          <Link className="text-[#9b111e] hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="text-[#9b111e] hover:underline" href="/cookies">
            Cookie Policy
          </Link>
          <Link className="text-[#9b111e] hover:underline" href="/#contact">
            Contact us
          </Link>
        </div>

        <p className="mt-10 text-xs leading-6 text-[#002147]/50">
          This is a working draft for the platform. Review it against your
          actual business arrangements before publishing it as a final legal
          agreement.
        </p>
      </section>

      <footer className="bg-[#00172f] px-6 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Aesthetics. All rights reserved.
      </footer>
    </main>
  );
}
