"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { clearCertificateSignature, uploadCertificateSignature } from "@/actions/certificates";
import type { Certificate } from "@/types/database";

export function CertificateSignatureUploads({ certificate }: { certificate: Certificate }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("certificateId", certificate.id);
      fd.set("slot", "1");
      fd.set("file", file);
      const res = await uploadCertificateSignature(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Signature saved — regenerate the PDF to see it.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onClear() {
    if (!window.confirm("Remove this signature from the certificate?")) {
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("certificateId", certificate.id);
      fd.set("slot", "1");
      const res = await clearCertificateSignature(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Signature removed");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const previewUrl = certificate.signatorySignature1Url;

  return (
    <div className="max-w-md rounded-lg border border-stone-200 p-4 dark:border-stone-700">
      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">Validator signature</div>
      <p className="mt-1 text-xs text-muted">
        PNG with transparent background works best. After uploading, click <strong>Generate Certificate</strong> again.
      </p>
      <div className="mt-3 flex min-h-[88px] items-center justify-center rounded-md bg-stone-50 py-4 dark:bg-stone-900/40">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="max-h-20 max-w-[220px] object-contain" />
        ) : (
          <span className="text-xs text-muted">No signature uploaded</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-md bg-brand-red px-3 py-2 text-xs font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              onUpload(e.target.files);
              e.target.value = "";
            }}
          />
          {busy ? "Working…" : "Upload image"}
        </label>
        <button
          type="button"
          disabled={busy || !previewUrl}
          onClick={() => void onClear()}
          className="rounded-md border border-stone-300 px-3 py-2 text-xs font-medium hover:bg-stone-100 disabled:opacity-50 dark:border-stone-600 dark:hover:bg-stone-800"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
