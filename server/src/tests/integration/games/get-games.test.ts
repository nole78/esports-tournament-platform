import { describe, it, expect } from "vitest"
import app from "../../../app"
import supertest from "supertest"
import { makeGame } from "../../fatories";

const api = supertest(app);

describe("GET /api/v1/games - Integration Test", () => {
    it("returns an empty page when there are no games", async () => {
        const res = await api.get("/api/v1/games");

        expect(res.status).toBe(200);
        expect(res.body.data.items).toEqual([]);
        expect(res.body.data.total).toBe(0);
    });

    it("returns paginated list of games", async () => {
        await makeGame({ game_name: "League Of Legends", game_genre: "MOBA", players_per_team: 5});
        
        const response = await api.get("/api/v1/games")

        expect(response.status).toBe(200);

        const body = response.body;
        expect(body).toHaveProperty("success", true);
        expect(body).toHaveProperty("data");
        expect(body.data).toMatchObject({
            page: expect.any(Number),
            pageSize: expect.any(Number),
            total: 1
        });
        expect(body.data.items).toHaveLength(1);
        expect(body.data.items[0]).toMatchObject({
            gameId: expect.any(Number),
            gameName: "League Of Legends",
            gameGenre: "MOBA",
            gamePlayers: 5,
            gameLogotip: expect.any(String),
        });
    });
        
    it("respects pagination", async () => {
        for (let i = 0; i < 5; i++) await makeGame();

        const res = await api.get("/api/v1/games?page=1&limit=2");

        expect(res.body.data.items).toHaveLength(2);
        expect(res.body.data.total).toBe(5);
    });
})