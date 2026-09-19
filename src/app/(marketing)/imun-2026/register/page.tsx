import { FormPageShell } from "@/components/ui/FormPageShell";
import { MunApplicationForm } from "@/components/marketing/MunApplicationForm";

export const metadata = {
  title: "Delegate Application — PUNAB IMUN 2026",
  description: "Apply as a delegate for PUNAB International Model United Nations Conference 2026.",
};

export default function ImunRegisterPage() {
  return (
    <>
      <FormPageShell
        title="Delegate Application Form"
        lead="PUNAB IMUN 2026 — complete every section below. Registration is confirmed only after payment is verified."
        backHref="/imun-2026"
        backLabel="PUNAB IMUN 2026"
      >
          <MunApplicationForm />
        </FormPageShell>
    </>
  );
}
