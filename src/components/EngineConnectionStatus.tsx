"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type Status = "loading" | "ready" | "missing";

export function EngineConnectionStatus() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/engine-status")
      .then((res) => {
        if (!res.ok) throw new Error("bad status");
        return res.json() as Promise<{ configured?: boolean }>;
      })
      .then((data) => {
        if (cancelled) return;
        setStatus(data.configured ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div
        className="flex items-center gap-2 rounded-2xl border border-lilac-soft/50 bg-cream/60 px-3 py-2.5 text-xs text-mauve/70 shadow-soft-inner"
        aria-busy="true"
        aria-label="Checking engine configuration"
      >
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-lilac-deep" aria-hidden />
        <span>Checking engine…</span>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div
        className="flex items-start gap-2 rounded-2xl border border-mint/40 bg-mint-soft/45 px-3 py-2.5 text-xs text-mauve-deep shadow-soft"
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-deep" aria-hidden />
        <div>
          <p className="font-medium">Drama engine ready</p>
          <p className="mt-0.5 text-mauve/65">LLM credentials are set on the server.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2 rounded-2xl border border-blush-soft/70 bg-gradient-to-br from-blush-soft/50 to-cream-deep/60 px-3 py-2.5 text-xs text-mauve-deep shadow-soft"
      role="status"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rosegold-accent" aria-hidden />
      <div>
        <p className="font-medium">LLM not configured</p>
        <p className="mt-0.5 leading-relaxed text-mauve/70">
          Add your key to{" "}
          <code className="rounded-md bg-white/70 px-1.5 py-0.5 font-mono text-[11px] text-mauve-deep shadow-soft-inner">
            .env.local
          </code>{" "}
          — the app never reads or displays the secret value.
        </p>
      </div>
    </div>
  );
}
