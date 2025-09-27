export const WS_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8080`
    : process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:8080`;

export const WS_MAX_RECONNECT_ATTEMPTS = Number(
  process.env.NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS ?? 5
);
