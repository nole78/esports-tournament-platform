import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeGame } from "../../factories";
import { loginAs, signToken } from "../../helpers/auth";
import { UserRole } from "../../../Domain/enums/UserRole";

const api = supertest(app);

describe("authenticate middleware (via DELETE /api/v1/games/:id)", () => {
  it("rejects a request with no Authorization header", async () => {
    const gameId = await makeGame();
    const res = await api.delete(`/api/v1/games/${gameId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Missing token");
  });

  it("rejects a non-Bearer scheme", async () => {
    const gameId = await makeGame();
    const res = await api.delete(`/api/v1/games/${gameId}`).set("Authorization", "Token abc");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Missing token");
  });

  it("rejects a garbage token", async () => {
    const gameId = await makeGame();
    const res = await api.delete(`/api/v1/games/${gameId}`).set("Authorization", "Bearer not.a.jwt");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid token");
  });

  it("rejects an expired token", async () => {
    const gameId = await makeGame();
    const { id, username } = await loginAs(UserRole.ADMIN);
    const token = signToken({ id, username, role: UserRole.ADMIN }, { expiresIn: -10 });

    const res = await api.delete(`/api/v1/games/${gameId}`).set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid token");
  });

  it("rejects a token signed with a different secret", async () => {
    const gameId = await makeGame();
    const { id, username } = await loginAs(UserRole.ADMIN);
    const token = signToken({ id, username, role: UserRole.ADMIN }, {}, "some-other-secret");

    const res = await api.delete(`/api/v1/games/${gameId}`).set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});