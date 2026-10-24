import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeGame } from "../../factories";

const api = supertest(app);

describe("GET /api/v1/games/names",() => {
    it("returns 200 and game names", async() => {
        for(let i = 0; i < 5; i++)
            await makeGame({game_name: "game" + i});

        const res = await api.get("/api/v1/games/names");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.gameNames).toHaveLength(5);
        expect(res.body.data.gameNames).toEqual(["game0","game1","game2","game3","game4"])
    })

    it("returns 200 and empty list when no games", async () => {
        const res = await api.get("/api/v1/games/names");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.gameNames).toHaveLength(0);
    })
})