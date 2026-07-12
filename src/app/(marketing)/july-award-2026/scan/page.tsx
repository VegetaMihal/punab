import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Card } from "@/components/ui/Card";
import { isVolunteerAuthenticated } from "@/actions/july-award-ticket-verify";
import { VolunteerPasscodeForm } from "@/components/marketing/JulyAwardVolunteerPasscodeForm";
import { JulyAwardScanPanel } from "@/components/marketing/JulyAwardScanPanel";
import { VolunteerSwitchClubButton } from "@/components/marketing/JulyAwardVolunteerSwitchClubButton";

export const metadata = {
  title: "July Award — Check tickets",
};

export default async function JulyAwardScanPage() {
  const authenticated = await isVolunteerAuthenticated().catch(() => false);

  return (
    <main className="min-h-[calc(100dvh-12rem)] bg-[color:var(--color-surface-2)] py-12 md:py-16">
      <MarketingContainer maxWidth="3xl">
        <Card variant="elevated" className="space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Check tickets</h1>
          {!authenticated ? (
            <VolunteerPasscodeForm />
          ) : (
            <>
              <JulyAwardScanPanel />
              <VolunteerSwitchClubButton />
            </>
          )}
        </Card>
      </MarketingContainer>
    </main>
  );
}
