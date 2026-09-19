import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? "/dashboard";

  return (
    <AuthShell
      title="Welcome back"
      lead="Log in to your PUNAB member area."
      switchText="No account?"
      switchLabel="Sign up"
      switchHref="/register"
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
