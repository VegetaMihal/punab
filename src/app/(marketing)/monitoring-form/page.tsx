import { FormPageShell } from "@/components/ui/FormPageShell";
import { MonitoringForm } from "@/components/marketing/MonitoringForm";
import { listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";

export const metadata = {
  title: "July Monitoring Form",
  description: "Report the status of the July programme on your campus.",
};

export default async function MonitoringFormPage() {
  const universities = await listUniversitiesForOptions().catch(() => []);

  return (
    <>
      <FormPageShell
        title="July Monitoring Form"
        lead="Help PUNAB track how universities across the country are observing July 2026. Reports are reviewed and verified before any publication."
        backHref="/"
        backLabel="Back"
      >
          <MonitoringForm universities={universities} />
        </FormPageShell>
    </>
  );
}
