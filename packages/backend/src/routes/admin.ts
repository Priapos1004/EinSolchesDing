import type { AdminLoginRequest, CreateGameRequest } from "@esd/shared";
import {
  validateAdminCredentials,
  createAdminToken,
  verifyAdminToken,
  generateInviteToken,
} from "../auth";
import { loadCards } from "../card-loader";
import { createGameState } from "../game-logic";
import { gameManager } from "../game-manager";

const cards = loadCards();

function gameId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export async function handleAdminLogin(req: Request): Promise<Response> {
  const body = (await req.json()) as AdminLoginRequest;

  if (!validateAdminCredentials(body.username, body.password)) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminToken(body.username);
  return Response.json({ token });
}

export async function handleCreateGame(req: Request): Promise<Response> {
  // Verify admin token
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await verifyAdminToken(auth.slice(7));
  if (!admin) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = (await req.json()) as CreateGameRequest;
  if (body.player_count < 2 || body.player_count > 5) {
    return Response.json(
      { error: "Player count must be 2-5" },
      { status: 400 }
    );
  }
  if (body.language !== "de" && body.language !== "en") {
    return Response.json(
      { error: "Language must be 'de' or 'en'" },
      { status: 400 }
    );
  }

  const id = gameId();
  const inviteToken = generateInviteToken();
  const state = createGameState(id, cards, body.player_count, body.language);

  await gameManager.saveGameState(state, inviteToken);

  const host = req.headers.get("Host") || "localhost";
  const protocol = req.headers.get("X-Forwarded-Proto") || "http";

  return Response.json({
    game_id: id,
    invite_token: inviteToken,
    invite_url: `${protocol}://${host}/join/${id}?token=${inviteToken}`,
  });
}
