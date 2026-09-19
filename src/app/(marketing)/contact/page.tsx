import { ContactForm } from "@/components/contact/ContactForm";
import { InView } from "@/components/home/InView";
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
              <InView variant="paste" delay={150}>
                <div className="wall-sheet wall-text rotate-1 p-6 pt-9 sm:p-8 sm:pt-10">
                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#a5182f]">Office</p>
                  <p className="mt-1 text-lg font-semibold leading-snug text-[#1b1a17]">{address}</p>
                  <p className="mt-6 border-t-2 border-dashed border-[#1b1a17]/25 pt-5 text-sm font-extrabold uppercase tracking-wide text-[#a5182f]">
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 inline-block break-all border-b-[3px] border-[#c41e3a] pb-0.5 text-lg font-semibold text-[#1b1a17] motion-safe:transition-colors hover:text-[#a5182f]"
                  >
                    {email}
                  </a>
                </div>
              </InView>
            </div>
          </Reveal>
        </div>
      </MarketingContainer>
    </>
  );
}
