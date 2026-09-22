import { z } from "zod";
import { maxCriticality, type BloodHeroCriticality } from "@/lib/bloodhero/classify-criticality";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const TIMEOUT_MS = 5000;

const aiReplySchema = z.object({ criticality: z.enum(["normal", "urgent", "critical"]) });

/**
 * Asks Groq to rate the condition text (English or Bangla).
 * Returns null on any failure (no key, timeout, bad JSON) so callers fall back to rules.
 */
export async function classifyCriticalityWithAi(condition: string): Promise<BloodHeroCriticality | null> {
  const key = process.env.GROQ_API_KEY?.trim();
  const text = condition.trim();
  if (!key || !text) return null;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You triage blood requests. Read the patient condition (English or Bangla). Reply only with JSON {"criticality":"normal"|"urgent"|"critical"}. critical = life-threatening or surgery/ICU/bleeding/delivery within hours; urgent = serious but stable, needed within a day; normal = planned or routine.',
          },
          { role: "user", content: text.slice(0, 1200) },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = aiReplySchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data.criticality : null;
  } catch {
    return null;
  }
}

/** AI can only raise the rule-based level, never lower it. */
export async function upgradeCriticalityWithAi(
  rules: BloodHeroCriticality,
  condition: string
): Promise<{ criticality: BloodHeroCriticality; source: "rules" | "ai" }> {
  const ai = await classifyCriticalityWithAi(condition);
  if (!ai) return { criticality: rules, source: "rules" };
  const merged = maxCriticality(rules, ai);
  return { criticality: merged, source: merged !== rules ? "ai" : "rules" };
}
