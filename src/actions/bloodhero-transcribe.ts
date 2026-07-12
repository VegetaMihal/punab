"use server";

/** ISO-639-1 codes accepted by Groq/OpenAI-compatible audio transcription. */
function parseTranscriptionLanguage(raw: FormDataEntryValue | null): "en" | "bn" {
  if (typeof raw !== "string") return "en";
  const t = raw.trim().toLowerCase();
  return t === "bn" ? "bn" : "en";
}

function hasBanglaScript(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

function shouldRetryBangla(transcript: string): boolean {
  const t = transcript.trim();
  if (!t) return true;
  if (hasBanglaScript(t)) return false;
  // If mostly Latin output for Bangla input, try a stricter retry path.
  return /[A-Za-z]/.test(t);
}

export async function transcribeConditionAudio(
  formData: FormData
): Promise<{ success: boolean; transcript?: string; error?: string }> {
  const raw = formData.get("audio");
  if (!(raw instanceof File)) {
    return { success: false, error: "No audio file provided." };
  }
  const audioFile: File = raw;

  const mime = raw.type?.trim() ?? "";
  if (!mime.startsWith("audio/")) {
    return { success: false, error: "Uploaded file must be an audio file." };
  }

  const language = parseTranscriptionLanguage(formData.get("language"));
  const model = language === "bn" ? "whisper-large-v3" : "whisper-large-v3-turbo";

  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) {
    return { success: false, error: "Transcription is not configured (missing API key)." };
  }

  try {
    async function transcribeOnce(input: {
      modelName: string;
      languageCode?: "en" | "bn";
      prompt?: string;
    }): Promise<{ ok: true; transcript: string } | { ok: false; status: number }> {
      const body = new FormData();
      body.append("file", audioFile, audioFile.name || "audio.webm");
      body.append("model", input.modelName);
      if (input.languageCode) body.append("language", input.languageCode);
      if (input.prompt) body.append("prompt", input.prompt);
      body.append("temperature", "0");

      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body,
      });

      if (!res.ok) return { ok: false, status: res.status };
      const data = (await res.json()) as { text?: string };
      const transcript = typeof data.text === "string" ? data.text.trim() : "";
      if (!transcript) return { ok: false, status: 422 };
      return { ok: true, transcript };
    }

    const primary = await transcribeOnce({ modelName: model, languageCode: language });
    if (!primary.ok) {
      return { success: false, error: `Transcription failed (${primary.status}).` };
    }

    if (language !== "bn" || !shouldRetryBangla(primary.transcript)) {
      return { success: true, transcript: primary.transcript };
    }

    const retry = await transcribeOnce({
      modelName: "whisper-large-v3",
      languageCode: "bn",
      prompt: "বাংলা ভাষায় পরিষ্কারভাবে লিখুন।",
    });

    if (retry.ok && hasBanglaScript(retry.transcript)) {
      return { success: true, transcript: retry.transcript };
    }

    return { success: true, transcript: primary.transcript };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Transcription request failed.";
    return { success: false, error: message };
  }
}
