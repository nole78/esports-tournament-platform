import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeTournament, makeUser, makeWatchlistEntry } from "../../factories";
import { loginAs } from "../../helpers/auth";
import { UserRole } from "../../../Domain/enums/UserRole";
import { query } from "../../helpers/db";

const api = supertest(app);

const watchlistRows = () => query("SELECT * FROM user_watchlist");

describe("DELETE /api/v1/watchlist/:tournamentId", () => {
    it("returns 401 when missing token", async () => {
        const res = await api.delete("/api/v1/watchlist/123");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    })

    it("returns 404 when tournament doesn't exist", async () => {
        const { headers } = await loginAs();

        const res = await api.delete("/api/v1/watchlist/123")
                                .set(headers);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    })

    it("returns 404 when watchlist entry doesn't exist", async () => {
        const { headers } = await loginAs();
        const tournamentId = await makeTournament();

        const res = await api.delete("/api/v1/watchlist/" + tournamentId)
                                .set(headers);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    })

    it("deletes watchlist entry", async () => {
        const { headers, id } = await loginAs();
        const tournamentId = await makeTournament();
        await makeWatchlistEntry({user_id: id, tournament_id: tournamentId});        
        await makeWatchlistEntry({user_id: id});

        const res = await api.delete("/api/v1/watchlist/" + tournamentId)
                                .set(headers);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(await watchlistRows()).toHaveLength(1);
    })

    it("it deletes only one entry if two user watch tournament", async () => {
        const userA = await loginAs();
        const userB = await loginAs();
        const tournamentId =  await makeTournament();
        await makeWatchlistEntry({user_id: userA.id, tournament_id: tournamentId});
        await makeWatchlistEntry({user_id: userB.id, tournament_id: tournamentId});

        const res = await api.delete("/api/v1/watchlist/" + tournamentId)
                                .set(userA.headers);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const watchlist = await watchlistRows();
        expect(watchlist).toHaveLength(1);
        expect(watchlist[0].user_id).toBe(userB.id);
    })
})