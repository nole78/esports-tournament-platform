import { describe, it, expect } from "vitest"
import app from "../../../app"
import supertest from "supertest"
import { makeGame } from "../../factories";
import { query } from "../../helpers/db";
import { loginAs } from "../../helpers/auth";
import { UserRole } from "../../../Domain/enums/UserRole";

const api = supertest(app);

const gameRows = (id: number) =>
  query("SELECT * FROM games WHERE game_id = ?", [id]);

describe('PATCH /api/v1/games/:id', () => { 
    it("returns 401 without token and doesn't change game", async () => {
        const gameId = await makeGame();
        const res = await api.patch("/api/v1/games/" + gameId)
                        .send({ gameName: "Brawl Stars"})
        
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        const rows = await gameRows(gameId);
        expect(rows).toHaveLength(1);
        expect(rows[0].game_name).not.toBe("Brawl Stars");
    });

    it("returns 403 for non-admin role and doesn't change game", async () => {
        const gameId = await makeGame();
        const { headers } = await loginAs(UserRole.PLAYER);

        const res = await api.patch("/api/v1/games/" + gameId)
                        .set(headers)
                        .send({ gameName: "Brawl Stars"})
        
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        const rows = await gameRows(gameId);
        expect(rows).toHaveLength(1);
        expect(rows[0].game_name).not.toBe("Brawl Stars");
    })

    it("returns 404 when the game doesn't exist and creates nothing", async () => {
        const { headers } = await loginAs(UserRole.ADMIN);

        const res = await api.patch("/api/v1/games/" + 123)
                        .set(headers)
                        .send({ gameName: "Brawl Stars"})
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        const rows = await query("SELECT * FROM games");
        expect(rows).toHaveLength(0);
    })

    it("returns 400 for a non numeric id", async () => {
        const { headers } = await loginAs(UserRole.ADMIN);

        const res = await api.patch("/api/v1/games/abc")
                        .set(headers)
                        .send({ gameName: "Brawl Stars"})
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    })

    it.each([
        ["whitespace only gameName", { gameName: "   " }],
        ["gameName under 3 chars",{ gameName: "ab"}],
        ["gameName over 100 chars", {gameName: "x".repeat(101)}],
        ["whitespace only gameGenre", { gameGenre: "   " }],
        ["gameGenre under 3 chars",{ gameGenre: "ab"}],
        ["gamePlayers zero", {gamePlayers: 0}],
        ["negative gamePlayers",{ gamePlayers: -2}],
        ["gamePlayers as text", {gamePlayers: "abc"}],
        ["empty payload", {}]
    ])
    ("returns 400 when %s", async (_name, payload) => {
        const gameId = await makeGame();
        const { headers } = await loginAs(UserRole.ADMIN);

        const res = await api.patch("/api/v1/games/" + gameId)
                        .set(headers)
                        .send(payload)
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        const rows = await gameRows(gameId);
        expect(rows).toHaveLength(1);
        expect(rows[0].game_name).not.toBe("Brawl Stars");
    })

    it("changes the right game", async () => {
        const otherId = await makeGame();
        const gameId = await makeGame();
        const { headers } = await loginAs(UserRole.ADMIN);

        const res = await api.patch("/api/v1/games/" + gameId)
                        .set(headers)
                        .send({gameName: "Brawl Stars"})
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect((await gameRows(gameId))[0].game_name).toBe("Brawl Stars");
        expect((await gameRows(otherId))[0].game_name).not.toBe("Brawl Stars");
    })
});