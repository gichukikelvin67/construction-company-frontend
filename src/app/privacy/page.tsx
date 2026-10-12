
import Link from "next/link";

const sections = [
  {
    title: "1. Who we are",
    paragraphs: [
      "Aesthetics provides a construction management platform for organizing projects, workers, materials, suppliers, expenses, invoices and related business operations.",
      "This policy explains how personal information may be collected and used when you visit our website, submit an enquiry or use the platform. Before publication, the business should confirm its legal name and contact details as the responsible organization.",
    ],
  },
  {
    title: "2. Information we may collect",
    paragraphs: [
      "Website enquiries may include your name, email address, phone number, company name, enquiry type and message.",
      "When you use the platform, information may include account details, company and project records, worker information, supplier details, attendance records, expenses, invoices, payments, audit logs and other information entered by authorized users.",
      "Technical information such as browser details, access times, diagnostic logs and security events may also be processed where the application or its hosting services generate it.",
    ],
  },
  {
    title: "3. How information is used",
    paragraphs: [
      "Information may be used to respond to enquiries, create and administer accounts, provide platform features, maintain business records, support authorized workflows, troubleshoot faults and protect the service from misuse.",
      "We may also use relevant information to meet legal obligations, resolve disputes and maintain appropriate security and accountability records.",
    ],
  },
  {
    title: "4. Lawful processing",
    paragraphs: [
      "Personal information should be processed only where an appropriate lawful basis applies, such as fulfilling a service agreement, complying with a legal obligation, pursuing a legitimate interest that does not override individual rights, or obtaining consent where required.",
      "The responsible business should assess the lawful basis for each category of information and provide any additional notices required by applicable law.",
    ],
  },
  {
    title: "5. Sharing and service providers",
    paragraphs: [
      "Information may be accessible to authorized users according to their assigned roles and permissions. Business customers are responsible for ensuring that their staff are authorized to access the records available to them.",
      "Information may be processed by service providers supporting database hosting, application hosting, communications, email delivery, security or maintenance, subject to appropriate safeguards and applicable law.",
      "Information should not be sold to third parties for their independent marketing purposes. Any other sharing must have an appropriate legal basis.",
    ],
  },
  {
    title: "6. Storage, security and retention",
    paragraphs: [
      "Appropriate technical and organizational safeguards should be used to protect personal information against unauthorized access, loss, alteration or disclosure.",
      "No online system can guarantee absolute security. Users should protect their credentials, follow access rules and report suspected unauthorized access promptly.",
      "Information should be retained only for as long as necessary for the stated purposes, contractual obligations, legitimate business needs and applicable legal requirements. Actual retention periods should be established and documented by the business.",
    ],
  },
  {
    title: "7. Your rights",
    paragraphs: [
      "Subject to applicable law, individuals may have rights to be informed about processing, access their personal information, request correction, request deletion where appropriate, object to or restrict certain processing, and exercise rights relating to consent or data portability where applicable.",
      "Requests should be sent through the website contact form. We may need to verify identity and clarify the request before responding. Some information may need to be retained where the law permits or requires it.",
    ],
  },
  {
    title: "8. Data about workers and other people",
    paragraphs: [
      "Customers and authorized platform users must have an appropriate reason and authority to enter personal information about workers, customers, suppliers or other individuals.",
      "Customers remain responsible for their own notices, permissions, employment obligations and lawful use of records they manage through the platform, where those responsibilities apply.",
    ],
  },
  {
    title: "9. Cookies and similar technologies",
    paragraphs: [
      "The website and its service providers may use cookies or similar technologies for functions such as essential application operation, security, preferences or analytics if those tools are enabled.",
      "The actual technologies in use should be verified before this policy is published. Where consent is required for non-essential technologies, an appropriate consent mechanism should be provided.",
      "See our Cookie Policy for further information.",
    ],
  },
  {
    title: "10. Changes and contact",
    paragraphs: [
      "This policy may be updated as the platform, its data practices or applicable requirements change. Material updates should be communicated through an appropriate channel.",
      "For privacy questions or requests, use the contact form on our website and clearly identify your request as a privacy matter.",
    ],
  },
];

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="mt-5 max-w-3xl leading-7 text-[#002147]/70">
          This policy describes how personal information may be handled when
          you visit the Aesthetics website, contact our team or use the
          Construction Management Platform.
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
          <Link className="text-[#9b111e] hover:underline" href="/cookies">
            Cookie Policy
          </Link>
          <Link className="text-[#9b111e] hover:underline" href="/#contact">
            Contact us
          </Link>
        </div>

        <p className="mt-10 text-xs leading-6 text-[#002147]/50">
          Working draft: confirm actual data practices, service providers,
          retention periods and privacy contact details before publication.
        </p>
      </section>

      <footer className="bg-[#00172f] px-6 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Aesthetics. All rights reserved.
      </footer>
    </main>
  );
}
