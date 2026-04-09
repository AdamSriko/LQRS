"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export type ToastEntry = { id: number; message: string; type: "success" | "error" };

export function Toast({ entry, onDismiss }: { entry: ToastEntry; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = entry.type === "success";
  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live="polite"
      className="pointer-events-none fixed bottom-8 left-1/2 z-[100] -translate-x-1/2"
    >
      <div
        className={`lqrs-dev-toast-enter flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-medium shadow-soft backdrop-blur-sm ${
          isSuccess
            ? "border-mint/60 bg-gradient-to-r from-mint-soft/95 to-cream/90 text-mauve-deep"
            : "border-blush/60 bg-gradient-to-r from-blush-soft/95 to-cream/90 text-rosegold-accent"
        }`}
        style={{ boxShadow: "0 8px 32px -8px rgba(200, 140, 160, 0.3)" }}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-mint-deep" aria-hidden />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        )}
        {entry.message}
      </div>
    </div>
  );
}
