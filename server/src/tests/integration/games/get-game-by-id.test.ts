import { describe, it, expect } from "vitest"
import app from "../../../app"
import supertest from "supertest"
import { makeGame } from "../../factories";

const api = supertest(app)

describe("GET /api/v1/games/:id", () => {
    it("returns 404 when the game does not exist", async () => {
        const response = await api.get("/api/v1/games/1234");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual(expect.any(String));
    });

    it("returns game when id exists", async () => {
        await makeGame({ game_name: "Other Game" });
        const gameId = await makeGame({ game_name: "Brawl Stars", game_genre: "MOBA", players_per_team: 3});

        const response = await api.get(`/api/v1/games/${gameId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
            gameId: gameId,
            gameName: "Brawl Stars",
            gameGenre: "MOBA",
            gamePlayers: 3,
            gameLogotip: expect.any(String),
        });
    });

    it("returns 400 for a non-numeric id", async () => {
        const response = await api.get("/api/v1/games/abc");

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
})