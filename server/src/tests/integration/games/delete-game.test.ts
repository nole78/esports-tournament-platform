import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeGame, makeTournament } from "../../factories";
import { loginAs } from "../../helpers/auth";
import { query } from "../../helpers/db";
import { UserRole } from "../../../Domain/enums/UserRole";

const api = supertest(app);

const gameRows = (id: number) =>
  query("SELECT * FROM games WHERE game_id = ?", [id]);

describe("DELETE /api/v1/games/:id", () => {
  it("returns 401 without a token and keeps the game", async () => {
    const gameId = await makeGame();

    const res = await api.delete(`/api/v1/games/${gameId}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(await gameRows(gameId)).toHaveLength(1);
  });

  it("returns 403 for a non-admin user and keeps the game", async () => {
    const gameId = await makeGame();
    const { headers } = await loginAs(UserRole.PLAYER);

    const res = await api.delete(`/api/v1/games/${gameId}`).set(headers);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(await gameRows(gameId)).toHaveLength(1);
  });

  it("returns 404 when the game does not exist", async () => {
    const { headers } = await loginAs(UserRole.ADMIN);

    const res = await api.delete("/api/v1/games/1234").set(headers);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a non-numeric id", async () => {
    const { headers } = await loginAs(UserRole.ADMIN);

    const res = await api.delete("/api/v1/games/abc").set(headers);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("deletes the game and leaves other games alone", async () => {
    const otherId = await makeGame();
    const gameId = await makeGame();
    const { headers } = await loginAs(UserRole.ADMIN);

    const res = await api.delete(`/api/v1/games/${gameId}`).set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(await gameRows(gameId)).toHaveLength(0);
    expect(await gameRows(otherId)).toHaveLength(1);
  });

  it("refuses to delete a game that a tournament uses", async () => {
    const gameId = await makeGame();
    await makeTournament({ tournament_game_id: gameId });
    const { headers } = await loginAs(UserRole.ADMIN);

    const res = await api.delete(`/api/v1/games/${gameId}`).set(headers);

    expect(res.status).toBe(409); // adjust to what your app should return
    expect(res.body.success).toBe(false);
    expect(await gameRows(gameId)).toHaveLength(1);
  });
});
