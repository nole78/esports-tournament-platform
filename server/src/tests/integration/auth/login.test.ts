import { describe, it, expect } from "vitest";
import supertest from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../../../app";
import { makeUser, makeGame } from "../../factories";
import { JwtPayload } from "../../../Domain/types/auth/JwtPayload";

const api = supertest(app);

const LOGIN_URL = "/api/v1/auth/login"; 
const PASSWORD = "Password123!";        

async function makeUserWithPassword(overrides: Record<string, unknown> = {}) {
  const passwordHash = await bcrypt.hash(PASSWORD, 4); // low rounds = fast tests
  return makeUser({ passwordHash, ...overrides });
}

describe("POST /api/v1/auth/login", () => {
  it("logs in with correct credentials and returns a token with the right payload", async () => {
    const id = await makeUserWithPassword({ gamer_tag: "player1", role: "player" });

    const res = await api.post(LOGIN_URL).send({ username: "player1", password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const token = res.body.data;
    expect(token).toEqual(expect.any(String));

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    expect(payload).toMatchObject({ id, username: "player1", role: "player" });
  });

  it("returns a token that works on a protected route", async () => {
    await makeUserWithPassword({ gamer_tag: "admin1", role: "admin" });
    const gameId = await makeGame();

    const login = await api.post(LOGIN_URL).send({ username: "admin1", password: PASSWORD });
    const token = login.body.data;

    const res = await api.delete(`/api/v1/games/${gameId}`).set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("rejects a wrong password", async () => {
    await makeUserWithPassword({ gamer_tag: "player1" });

    const res = await api.post(LOGIN_URL).send({ username: "player1", password: "WrongPassword1!" });

    expect(res.status).toBe(401); 
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
  });

  it("gives the same answer for an unknown username as for a wrong password", async () => {
    await makeUserWithPassword({ gamer_tag: "player1" });

    const wrongPassword = await api.post(LOGIN_URL).send({ username: "player1", password: "WrongPassword1!" });
    const unknownUser = await api.post(LOGIN_URL).send({ username: "nobody", password: PASSWORD });

    expect(unknownUser.status).toBe(wrongPassword.status);
    expect(unknownUser.body.message).toBe(wrongPassword.body.message); // no hint about which usernames exist
  });

  it("returns 400 when fields are missing", async () => {
    const noPassword = await api.post(LOGIN_URL).send({ username: "player1" });
    const noUsername = await api.post(LOGIN_URL).send({ password: PASSWORD });
    const empty = await api.post(LOGIN_URL).send({});

    for (const res of [noPassword, noUsername, empty]) {
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    }
  });
});