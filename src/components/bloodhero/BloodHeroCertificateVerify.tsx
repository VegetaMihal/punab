"use client";

import { useState, useTransition } from "react";
import { verifyBloodHeroCertificate, type BloodHeroCertificateVerifyResult } from "@/actions/bloodhero-admin-requests";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return iso;
  }
}

export function BloodHeroCertificateVerify() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<BloodHeroCertificateVerifyResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await verifyBloodHeroCertificate(value);
            setResult(res);
          });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          name="certificateNumber"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. BH-2026-PB-000123"
          className="min-h-11 flex-1 rounded-xl border border-(--bh-line) bg-(--bh-panel) px-4 text-sm text-(--bh-ink) placeholder:text-(--bh-ink-soft) focus-visible:outline focus-visible:ring-2 focus-visible:ring-(--bh-blood)"
        />
        <button
          type="submit"
          disabled={pending || value.trim().length < 3}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-(--bh-blood) px-5 text-sm font-semibold text-(--bh-on-blood) transition duration-150 hover:bg-(--bh-blood-deep) active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 motion-reduce:active:scale-100"
        >
          {pending ? "Verifying..." : "Verify"}
        </button>
      </form>

      {result && !result.found && (
        <p className="bh-rise-in mt-4 rounded-xl border border-(--bh-warn-border) bg-(--bh-warn-bg) px-4 py-3 text-sm text-(--bh-warn-ink)">
          {result.error ?? "No certificate found with that number."}
        </p>
      )}

      {result?.found && (
        <div className="bh-rise-in mt-4 rounded-xl border border-(--bh-success-border) bg-(--bh-success-bg) px-4 py-4 text-sm text-(--bh-success-ink)">
          <p className="font-semibold">Certificate verified</p>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-(--bh-success-body)">Certificate</dt>
              <dd className="font-mono">{result.certificateNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-(--bh-success-body)">Donor</dt>
              <dd>{result.donorFirstName ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-(--bh-success-body)">Blood group</dt>
              <dd>{result.bloodGroup ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-(--bh-success-body)">District</dt>
              <dd>{result.district ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-(--bh-success-body)">Issued</dt>
              <dd>{formatDate(result.issuedAt)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
