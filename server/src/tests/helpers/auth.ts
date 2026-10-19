import jwt, { SignOptions } from "jsonwebtoken";
import { makeUser } from "../factories";
import { query } from "./db";
import { UserRole } from "../../Domain/enums/UserRole";
import { JwtPayload } from "../../Domain/types/auth/JwtPayload";

export function signToken(
  payload: JwtPayload,
  options: SignOptions = {},
  secret: string = process.env.JWT_SECRET!
) {
  return jwt.sign(payload, secret, { expiresIn: "1h", ...options });
}

export async function loginAs(role: UserRole = UserRole.PLAYER, overrides: Record<string, unknown> = {}) {
  const id = await makeUser({ role, ...overrides });
  const [{ gamer_tag }] = await query<{ gamer_tag: string }>(
    "SELECT gamer_tag FROM users WHERE id = ?",
    [id]
  );

  const payload: JwtPayload = { id, username: gamer_tag, role };
  const token = signToken(payload);

  return { id, username: gamer_tag, token, headers: { Authorization: `Bearer ${token}` } };
}