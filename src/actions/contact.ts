"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

export type ContactState = { error?: string; success?: boolean };

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      error: f.name?.[0] ?? f.email?.[0] ?? f.message?.[0] ?? parsed.error.message,
    };
  }
  // v1: no persistence — wire to email or a `messages` table later
  return { success: true };
}
