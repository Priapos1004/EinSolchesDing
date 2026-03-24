const BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// Admin endpoints
export async function adminLogin(username: string, password: string) {
  return request<{ token: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function createGame(
  token: string,
  playerCount: number,
  language: "de" | "en"
) {
  return request<{
    game_id: string;
    invite_token: string;
    invite_url: string;
  }>("/admin/games", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ player_count: playerCount, language }),
  });
}

// Player endpoints
export async function getGameInfo(gameId: string, inviteToken: string) {
  return request<{
    game_id: string;
    player_count: number;
    language: string;
    joined_count: number;
    players: { index: number; name: string }[];
  }>(`/games/${gameId}/info?token=${inviteToken}`);
}

export async function joinGame(
  gameId: string,
  token: string,
  displayName: string
) {
  return request<{
    player_id: string;
    player_index: number;
    session_token: string;
  }>(`/games/${gameId}/join`, {
    method: "POST",
    body: JSON.stringify({ token, display_name: displayName }),
  });
}

// Game action endpoints
export async function playCardAction(
  gameId: string,
  sessionToken: string,
  keyword: string
) {
  return request<{ ok: boolean }>(`/games/${gameId}/play`, {
    method: "POST",
    headers: authHeaders(sessionToken),
    body: JSON.stringify({ keyword }),
  });
}

export async function startVote(gameId: string, sessionToken: string) {
  return request<{ ok: boolean }>(`/games/${gameId}/vote/start`, {
    method: "POST",
    headers: authHeaders(sessionToken),
  });
}

export async function castVote(
  gameId: string,
  sessionToken: string,
  valid: boolean
) {
  return request<{ ok: boolean }>(`/games/${gameId}/vote/cast`, {
    method: "POST",
    headers: authHeaders(sessionToken),
    body: JSON.stringify({ valid }),
  });
}
