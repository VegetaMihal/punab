import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      lead="We'll email you a link to reset your password."
      switchText="Remembered it?"
      switchLabel="Log in"
      switchHref="/login"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
