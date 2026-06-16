"use client";
import { useEffect, useRef, useState } from "react";
import type { PublicSessionState } from "@/types/session";

const IDLE_MS = 30 * 60 * 1000; // 30 min inattività → overlay
const STOP_MS = 5 * 60 * 1000; // 5 min sull'overlay → polling fermo

export type IdleState = "active" | "idle" | "stopped";

export function useSessionPolling(
  sessionId: string | null,
  _intervalMs = 1500,
) {
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idleState, setIdleState] = useState<IdleState>("active");

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const pausedRef = useRef(false); // true = loop fermo
  const stoppedRef = useRef(false); // true = stato "stopped" (qualsiasi touch riprende)
  const sinceRef = useRef<string | null>(null);
  const lastInteractionRef = useRef(Date.now());
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    mountedRef.current = true;
    pausedRef.current = false;
    stoppedRef.current = false;

    const startPoll = () => {
      const run = async () => {
        while (mountedRef.current && !pausedRef.current) {
          abortRef.current = new AbortController();
          try {
            const url = sinceRef.current
              ? `/api/sessions/${sessionId}?since=${sinceRef.current}`
              : `/api/sessions/${sessionId}`;
            const res = await fetch(url, { signal: abortRef.current.signal });
            if (res.ok) {
              const data = (await res.json()) as PublicSessionState & {
                updatedAt: number;
              };
              sinceRef.current = String(data.updatedAt);
              if (mountedRef.current) {
                setSession(data);
                setError(null);
              }
            } else if (res.status === 404) {
              if (mountedRef.current) setError("Sessione non trovata");
              break;
            }
          } catch (e) {
            if ((e as Error).name !== "AbortError" && mountedRef.current) {
              setError("Connessione persa");
              await new Promise((r) => setTimeout(r, 2000));
            }
          }
        }
      };
      void run();
    };

    startPollRef.current = startPoll;
    startPoll();

    // Controlla inattività ogni 30s
    idleCheckRef.current = setInterval(() => {
      if (
        !pausedRef.current &&
        Date.now() - lastInteractionRef.current > IDLE_MS
      ) {
        pausedRef.current = true;
        abortRef.current?.abort();
        if (mountedRef.current) setIdleState("idle");
        stopTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            stoppedRef.current = true;
            setIdleState("stopped");
          }
        }, STOP_MS);
      }
    }, 30_000);

    // Qualsiasi interazione aggiorna il timestamp; se "stopped" riprende in automatico
    const onInteraction = () => {
      lastInteractionRef.current = Date.now();
      if (pausedRef.current && stoppedRef.current) {
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        stoppedRef.current = false;
        pausedRef.current = false;
        if (mountedRef.current) setIdleState("active");
        startPollRef.current?.();
      }
    };

    window.addEventListener("pointerdown", onInteraction);
    window.addEventListener("keydown", onInteraction);
    window.addEventListener("touchstart", onInteraction);

    return () => {
      mountedRef.current = false;
      pausedRef.current = true;
      abortRef.current?.abort();
      if (idleCheckRef.current) clearInterval(idleCheckRef.current);
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
    };
  }, [sessionId]);

  // Ripresa esplicita (bottone "Sì, continua") — funziona da "idle" e "stopped"
  const resume = () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stoppedRef.current = false;
    lastInteractionRef.current = Date.now();
    pausedRef.current = false;
    setIdleState("active");
    setError(null);
    startPollRef.current?.();
  };

  return { session, error, idleState, resume };
}
