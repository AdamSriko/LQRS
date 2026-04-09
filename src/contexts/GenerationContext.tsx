"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LogStatus = "idle" | "submitting" | "done" | "error";

type SSEEvent =
  | { type: "log"; content: string }
  | { type: "thinking_chunk"; content: string }
  | { type: "text_chunk"; content: string }
  | { type: "done"; episodeFile: string }
  | { type: "error"; message: string };

export interface GenerationState {
  scenarioText: string;
  setScenarioText: (v: string) => void;
  softResetOutput: () => void;
  logStatus: LogStatus;
  agentLogs: string[];
  scriptText: string;
  thinkingText: string;
  isThinking: boolean;
  showReasoning: boolean;
  setShowReasoning: React.Dispatch<React.SetStateAction<boolean>>;
  logError: string | null;
  copied: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearAll: () => void;
  copyScript: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const GenerationContext = createContext<GenerationState | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [scenarioText, setScenarioTextRaw] = useState("");
  const [logStatus, setLogStatus] = useState<LogStatus>("idle");
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [scriptText, setScriptText] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Abort on unmount
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  // Warn before closing mid-generation
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (logStatus !== "submitting") return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [logStatus]);

  // Clears output state but keeps the scenario text
  const softResetOutput = useCallback(() => {
    setLogStatus("idle");
    setAgentLogs([]);
    setScriptText("");
    setThinkingText("");
    setIsThinking(false);
    setShowReasoning(false);
    setLogError(null);
    setCopied(false);
  }, []);

  const setScenarioText = useCallback((v: string) => {
    setScenarioTextRaw(v);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!scenarioText.trim()) return;

      setLogStatus("submitting");
      setAgentLogs([]);
      setScriptText("");
      setThinkingText("");
      setIsThinking(false);
      setShowReasoning(false);
      setLogError(null);
      setCopied(false);

      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch("/api/process-scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario: scenarioText }),
          signal: ac.signal,
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setLogStatus("error");
          setLogError(data.error ?? `Server error ${res.status}`);
          return;
        }

        if (!res.body) {
          setLogStatus("error");
          setLogError("Server returned no stream body.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";
        let seenText = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const parts = sseBuffer.split("\n\n");
          sseBuffer = parts.pop() ?? "";

          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              let event: SSEEvent;
              try {
                event = JSON.parse(line.slice(6)) as SSEEvent;
              } catch {
                continue;
              }

              if (event.type === "log") {
                setAgentLogs((prev) => [...prev, event.content]);
              } else if (event.type === "thinking_chunk") {
                setIsThinking(true);
                setThinkingText((prev) => prev + event.content);
              } else if (event.type === "text_chunk") {
                if (!seenText) {
                  seenText = true;
                  setIsThinking(false);
                }
                setScriptText((prev) => prev + event.content);
              } else if (event.type === "done") {
                setLogStatus("done");
              } else if (event.type === "error") {
                setLogStatus("error");
                setLogError(event.message);
              }
            }
          }
        }

        // Fallback: if stream ends without a "done" event but we got text
        setLogStatus((s) => (s === "submitting" ? "done" : s));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setLogStatus("error");
        setLogError("Connection lost — the Drama Engine went quiet. Try again.");
      }
    },
    [scenarioText]
  );

  const clearAll = useCallback(() => {
    abortRef.current?.abort();
    setLogStatus("idle");
    setAgentLogs([]);
    setScriptText("");
    setThinkingText("");
    setIsThinking(false);
    setShowReasoning(false);
    setLogError(null);
    setScenarioTextRaw("");
    setCopied(false);
  }, []);

  const copyScript = useCallback(async () => {
    if (!scriptText) return;
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [scriptText]);

  return (
    <GenerationContext.Provider
      value={{
        scenarioText,
        setScenarioText,
        softResetOutput,
        logStatus,
        agentLogs,
        scriptText,
        thinkingText,
        isThinking,
        showReasoning,
        setShowReasoning,
        logError,
        copied,
        handleSubmit,
        clearAll,
        copyScript,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGeneration(): GenerationState {
  const ctx = useContext(GenerationContext);
  if (!ctx) throw new Error("useGeneration must be used inside <GenerationProvider>");
  return ctx;
}
