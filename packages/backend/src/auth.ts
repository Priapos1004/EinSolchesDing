import { SignJWT, jwtVerify } from "jose";
import { config } from "./config";

const secret = new TextEncoder().encode(config.jwtSecret);

export interface AdminTokenPayload {
  sub: string;
  role: "admin";
}

export interface SessionTokenPayload {
  game_id: string;
  player_index: number;
  display_name: string;
}

export async function createAdminToken(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("48h")
    .sign(secret);
}

export async function createSessionToken(
  gameId: string,
  playerIndex: number,
  displayName: string
): Promise<string> {
  return new SignJWT({
    game_id: gameId,
    player_index: playerIndex,
    display_name: displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("48h")
    .sign(secret);
}

export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role === "admin") {
      return payload as unknown as AdminTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifySessionToken(
  token: string
): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.game_id !== undefined) {
      return payload as unknown as SessionTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function generateInviteToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function validateAdminCredentials(
  username: string,
  password: string
): boolean {
  return username === config.adminUsername && password === config.adminPassword;
}
