import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";

export const metadata = {
  title: "Register",
};

export default async function RegisterPage() {
  const universities = await listUniversitiesForOptions().catch(() => []);

  return (
    <AuthShell
      title="Join PUNAB"
      lead="Register, complete your membership application, and connect with students, faculty, and alumni across Bangladesh's private universities. The secretariat reviews each application."
      switchText="Already have an account?"
      switchLabel="Log in"
      switchHref="/login"
    >
      <SignupForm universities={universities} />
    </AuthShell>
  );
}
