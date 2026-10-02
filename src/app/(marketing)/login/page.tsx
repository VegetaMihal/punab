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
      <p className="mt-4 text-center text-small">
        <a
          href="/forgot-password"
          className="border-b-[3px] border-[#c41e3a] pb-0.5 font-extrabold uppercase tracking-wide text-[#a5182f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#a5182f]"
        >
          Forgot password?
        </a>
      </p>
    </AuthShell>
  );
}
