import type { SSEEvent } from "@esd/shared";

export function connectSSE(
  gameId: string,
  sessionToken: string,
  onEvent: (event: SSEEvent) => void,
  onError?: () => void
): () => void {
  const url = `/api/games/${gameId}/events?token=${sessionToken}`;
  const eventSource = new EventSource(url);

  const eventTypes = [
    "game_state",
    "player_joined",
    "vote_started",
    "vote_update",
    "vote_result",
    "winner",
    "error",
  ];

  for (const type of eventTypes) {
    eventSource.addEventListener(type, (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        onEvent(data);
      } catch {
        console.error("Failed to parse SSE event:", e.data);
      }
    });
  }

  eventSource.onerror = () => {
    console.error("SSE connection error, will auto-reconnect");
    onError?.();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}
