import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeWatchlistEntry } from "../../factories";
import { loginAs } from "../../helpers/auth";

const api = supertest(app);

describe('GET /api/v1/watchlist', () => {
    it("returns 401 when missing token", async () => {

        const res = await api.get("/api/v1/watchlist")

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    })

    it.each([
        ["zero", 0],
        ["one", 1],
        ["three", 3]
    ])("returns %s watchlist items for logged user", async (_name, items_count) => {
        const { headers, id } = await loginAs();
        for(let i = 0; i < items_count; i++)
            await makeWatchlistEntry({user_id: id});
        
        const res = await api.get("/api/v1/watchlist")
                                .set(headers)

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items).toHaveLength(items_count);
    })

    it("returns watchlist items respecting pagination", async () => {
        const { headers, id } = await loginAs();
        for(let i = 0; i < 5; i++)
            await makeWatchlistEntry({user_id: id})

        const res = await api.get("/api/v1/watchlist")
                                .query({page: 3, limit:2})
                                .set(headers);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const data = res.body.data;
        expect(data.items).toHaveLength(5);
        expect(data.total).toBe(5);
        expect(data.pageSize).toBe(2);
        expect(data.page).toBe(3);
    })

})