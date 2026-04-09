"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useGeneration } from "@/contexts/GenerationContext";

export function GeneratingBadge() {
  const { logStatus, scriptText } = useGeneration();
  const pathname = usePathname();

  // On the input page, the user can already see the progress inline
  const onInputPage = pathname === "/input";

  // Show only while generating AND not on the input page
  if (logStatus !== "submitting" || onInputPage) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4 lg:left-[calc(50%+144px)]">
      <div className="pointer-events-auto lqrs-fade-up flex items-center gap-3 rounded-2xl border border-blush/40 bg-gradient-to-r from-cream-muted/97 to-blush-soft/80 px-5 py-3 shadow-glow backdrop-blur-md">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-rosegold-accent" aria-hidden />
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-mauve-deep">Drama Engine is writing…</span>
          {scriptText ? (
            <span className="text-[10px] text-mauve/55">
              {scriptText.length} chars streamed so far
            </span>
          ) : (
            <span className="text-[10px] text-mauve/55">reasoning through your scenario</span>
          )}
        </div>
        <Link
          href="/input"
          className="ml-1 inline-flex items-center gap-1 rounded-xl border border-blush-soft/80 bg-white/80 px-2.5 py-1.5 text-[11px] font-medium text-mauve-deep transition hover:bg-white"
        >
          <Sparkles className="h-3 w-3 text-rosegold-accent" aria-hidden />
          Watch it
        </Link>
      </div>
    </div>
  );
}
