"use client";

import { useEffect, useState, useCallback } from "react";

const TOAST_MS = 2800;

export function DevSeederShortcut() {
  const [visible, setVisible] = useState(false);

  const showToast = useCallback(() => {
    setVisible(true);
    window.setTimeout(() => setVisible(false), TOAST_MS);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const q = e.key.toLowerCase() === "q";
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || !e.shiftKey || !q) return;
      e.preventDefault();
      void fetch("/api/dev-seed", { method: "POST" })
        .then((res) => {
          if (res.ok) showToast();
        })
        .catch(() => {
          /* silent fail for dev shortcut */
        });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showToast]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-8 left-1/2 z-[100] -translate-x-1/2"
    >
      <div
        className="lqrs-dev-toast-enter rounded-2xl border border-blush-soft/80 bg-gradient-to-r from-blush-soft/95 to-lilac-soft/40 px-5 py-2.5 text-center font-medium text-mauve-deep shadow-soft backdrop-blur-sm"
        style={{ boxShadow: "0 8px 32px -8px rgba(200, 140, 160, 0.35)" }}
      >
        <span className="text-sm tracking-tight">Dev Cast Injected.</span>
      </div>
    </div>
  );
}
