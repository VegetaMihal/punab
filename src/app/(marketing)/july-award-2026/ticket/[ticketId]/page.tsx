import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Card } from "@/components/ui/Card";
import { isVolunteerAuthenticated, lookupJulyAwardTicket } from "@/actions/july-award-ticket-verify";
import { VolunteerPasscodeForm } from "@/components/marketing/JulyAwardVolunteerPasscodeForm";
import { JulyAwardTicketVerifyPanel } from "@/components/marketing/JulyAwardTicketVerifyPanel";

export const metadata = {
  title: "July Award — Ticket verification",
};

export default async function JulyAwardTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const authenticated = await isVolunteerAuthenticated().catch(() => false);

  return (
    <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="3xl">
        <Card variant="elevated" className="space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Ticket verification</h1>
          {!authenticated ? (
            <VolunteerPasscodeForm />
          ) : (
            <JulyAwardTicketVerifyPanel ticketId={ticketId} initial={await lookupJulyAwardTicket(ticketId).catch(() => null)} />
          )}
        </Card>
      </MarketingContainer>
    </main>
  );
}
