"use client";

import { useState, useRef, useCallback } from "react";
import type { ToastEntry } from "@/components/ui/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastEntry | null>(null);
  const counter = useRef(0);

  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    counter.current += 1;
    setToast({ id: counter.current, message, type });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}
