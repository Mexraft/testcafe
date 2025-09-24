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

  useEffect(() => {
    const client = createAnalysisWSClient({
      onOpen: () => setConnected(true),
      onConnectAck: (payload) => {
        setSessionId(payload?.sessionId);
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
      startAnalysis: (requirement: string) =>
        clientRef.current?.startAnalysis(requirement),
      answerQuestion: (response: string) =>
        clientRef.current?.answerQuestion(response),
      disconnect: (reason?: string) => clientRef.current?.disconnect(reason),
    }),
    []
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
