"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global root error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 480, margin: "6rem auto", padding: "0 1rem", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#c41e3a" }}>Something went wrong</p>
          <h1 style={{ marginTop: 8, fontSize: 24, fontWeight: 600 }}>The site could not load</h1>
          <p style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
            A server error occurred. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              borderRadius: 8,
              background: "#c41e3a",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
