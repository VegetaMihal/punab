import { ContactForm } from "@/components/contact/ContactForm";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getPublicSettings } from "@/lib/data/site-content";
import { getSetting } from "@/lib/site-defaults";

export const metadata = {
  title: "Contact PUNAB",
};

export default async function ContactPage() {
  const settings = await getPublicSettings().catch(() => ({}) as Record<string, string>);
  const address = getSetting(settings, "footer.address");
  const email = getSetting(settings, "footer.email");

  return (
    <>
      <PageHeader
        title="Contact PUNAB"
        description={getSetting(settings, "contact.intro")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <MarketingContainer className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div>
              <h2 className="text-h3 text-[color:var(--color-text)]">Message the secretariat</h2>
              <p className="text-small mt-1 text-[color:var(--color-text-muted)]">{getSetting(settings, "contact.form_note")}</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
          <Reveal staggerIndex={1}>
            <div className="space-y-6">
              <p className="text-body text-[color:var(--color-text-muted)]">{getSetting(settings, "contact.welcome")}</p>
              <Card variant="default" className="p-6">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-brand-light)] text-[color:var(--color-brand)]" aria-hidden>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-small font-semibold text-[color:var(--color-text)]">Office</p>
                    <p className="text-body mt-1 text-[color:var(--color-text-muted)]">{address}</p>
                  </div>
                </div>
              </Card>
              <Card variant="default" className="p-6">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-brand-light)] text-[color:var(--color-brand)]" aria-hidden>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-small font-semibold text-[color:var(--color-text)]">Email</p>
                    <a
                      href={`mailto:${email}`}
                      className="text-body mt-1 inline-block font-medium text-[color:var(--accent)] hover:text-[color:var(--color-brand)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)]"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              </Card>
              <div
                className="relative flex min-h-[140px] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] text-small text-[color:var(--color-text-muted)]"
                aria-hidden
              >
                <div className="punab-hero-sheen absolute inset-0 opacity-40" />
                <span className="relative z-[1]">Map / location graphic placeholder</span>
              </div>
            </div>
          </Reveal>
        </div>
      </MarketingContainer>
    </>
  );
}
