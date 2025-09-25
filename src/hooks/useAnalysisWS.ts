"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createAnalysisWSClient, AnalysisWSClient } from "@/lib/ws/client";

export type AnalysisProgress = {
  stage: string;
  progress: number;
  message?: string;
};

export function useAnalysisWS() {
  const clientRef = useRef<AnalysisWSClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  // Queue a requirement if startAnalysis is called before session is ready
  const pendingRequirementRef = useRef<string | null>(null);

  useEffect(() => {
    const client = createAnalysisWSClient({
      onOpen: () => setConnected(true),
      onConnectAck: (payload) => {
        const id = payload?.sessionId;
        setSessionId(id);
        // If a start was requested before we had a session, send it now
        if (id && pendingRequirementRef.current) {
          try {
            client.startAnalysis(pendingRequirementRef.current);
          } finally {
            pendingRequirementRef.current = null;
          }
        }
      },
      onProgress: (payload) => {
        setProgress(payload);
      },
      onQuestion: (payload) => {
        const value = payload?.value ?? payload?.response ?? payload;
        setQuestion(typeof value === 'string' ? value : String(value));
      },
      onResults: (payload) => {
        setResults(payload);
        setQuestion(null);
      },
      onError: (payload) => {
        setError(payload?.message || "Unknown error");
      },
      onClose: () => setConnected(false),
    });
    clientRef.current = client;
    return () => {
      client.disconnect("unmount");
      clientRef.current = null;
    };
  }, []);

  const api = useMemo(
    () => ({
      startAnalysis: (requirement: string) => {
        // Clear previous run state
        setProgress(null);
        setResults(null);
        setError(null);
        // If we have an active client but it's not ready yet, queue the request
        const client = clientRef.current;
        const ready = !!client && (client as any)["ws"] && (client as any)["ws"].readyState === WebSocket.OPEN && !!sessionId;
        if (client && ready) {
          client.startAnalysis(requirement);
        } else if (client) {
          pendingRequirementRef.current = requirement;
        }
      },
      answerQuestion: (response: string) =>
        clientRef.current?.answerQuestion(response),
      disconnect: (reason?: string) => clientRef.current?.disconnect(reason),
    }),
    [sessionId]
  );

  return {
    connected,
    sessionId,
    progress,
    results,
    error,
    question,
    ...api,
  };
}
