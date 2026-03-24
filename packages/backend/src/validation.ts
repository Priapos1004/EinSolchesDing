import { z } from "zod/v4";

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const createGameSchema = z.object({
  player_count: z.number().int().min(2).max(5),
  language: z.enum(["de", "en"]),
});

export const joinGameSchema = z.object({
  token: z.string().min(1),
  display_name: z.string().min(1).max(20).trim(),
});

export const playCardSchema = z.object({
  keyword: z.string().min(1),
});

export const castVoteSchema = z.object({
  valid: z.boolean(),
});

export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<T | Response> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return Response.json(
        { error: issue.message },
        { status: 400 }
      );
    }
    return result.data;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
