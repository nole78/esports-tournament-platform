import { describe, it, expect } from "vitest"
import app from "../../../app"
import supertest from "supertest"
import { makeGame } from "../../factories";
import { query } from "../../helpers/db";
import { loginAs } from "../../helpers/auth";
import { UserRole } from "../../../Domain/enums/UserRole";

const api = supertest(app)


const gameRows = (name: string) =>
  query("SELECT * FROM games WHERE game_name = ?", [name]);

const validData = { gameName: "Brawl Stars", gameGenre: "moba", gamePlayers: 3};

const without = (field: keyof typeof validData) => {
    const { [field]: _omitted, ...rest} = validData
    return rest;
}

describe("POST /api/v1/games", () => {
    it("returns 401 without token and doesn't create game", async () => {
        const res = await api.post("/api/v1/games")
                            .send(validData);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(await gameRows(validData.gameName)).toHaveLength(0);
    })

    it("returns 403 for non-admin user and doesn't create game", async () => {
        const { headers } = await loginAs(UserRole.PLAYER);
        
        const res = await api.post("/api/v1/games")
                            .set(headers)
                            .send(validData);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(await gameRows(validData.gameName)).toHaveLength(0);
    })

    it("returns 409 when the game with same name already exists", async () => {
        await makeGame({game_name: "Brawl Stars", game_genre: "shooter", players_per_team: 3});
        const { headers } = await loginAs(UserRole.ADMIN);

        const res = await api.post("/api/v1/games")
                            .set(headers)
                            .send(validData);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        const [game] = await gameRows("Brawl Stars");
        expect(game.game_genre).toBe("shooter"); // not overwritten by the failed create
    })

    it.each([
        ["missing gameName",without("gameName")],
        ["empty gameName", { ...validData, gameName: "" }],
        ["whitespace only gameName", { ...validData, gameName: "   " }],
        ["gameName under 3 chars", {...validData, gameName: "ab"}],
        ["gameName over 100 chars", { ...validData, gameName: "x".repeat(101) }],
        ["missing gamePlayers", without("gamePlayers")],
        ["gamePlayers as text", { ...validData, gamePlayers: "abc" }],
        ["gamePlayers zero", { ...validData, gamePlayers: 0 }],
        ["negative gamePlayers", { ...validData, gamePlayers: -1 }],
        ["missing gameGenre",without("gameGenre")],
        ["whitespace only gameGenre", { ...validData, gameGenre: "   " }],
        ["gameGenre under 3 chars", {...validData, gameGenre: "ab"}],
        ["empty payload", {}]
    ])("returns 400 when %s", async (_name, payload) => {
        const { headers } = await loginAs(UserRole.ADMIN);

        const res = await api.post("/api/v1/games")
                            .set(headers)
                            .send(payload);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(await query("SELECT * FROM games")).toHaveLength(0);
    })

    it("creates new game", async () => {

        const { headers } = await loginAs(UserRole.ADMIN);

        const res = await api.post("/api/v1/games")
                            .set(headers)
                            .send(validData);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const rows = await gameRows(validData.gameName);
        expect(rows).toHaveLength(1);
        const game = rows[0];
        expect(game.game_genre).toBe(validData.gameGenre);
        expect(game.players_per_team).toBe(validData.gamePlayers);
        expect(res.body.data).toEqual({
            gameId: game.game_id,
            gameName: game.game_name,
            gameLogotip: game.game_logotip,
            gameGenre: game.game_genre,
            gamePlayers: game.players_per_team,
        });
    })
})