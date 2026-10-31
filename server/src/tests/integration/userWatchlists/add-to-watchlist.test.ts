import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeTournament, makeUser, makeWatchlistEntry } from "../../factories";
import { loginAs } from "../../helpers/auth";
import { query } from "../../helpers/db";

const api = supertest(app);

const watchlistRows = () => query("SELECT * from user_watchlist");

describe("POST /api/v1/watchlist/:tournamentId",() => {
    it("returns 401 when missing token", async () => {
        const tournamentId = makeTournament();
        const res = await api.post("/api/v1/watchlist/" + tournamentId);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(await watchlistRows()).toHaveLength(0);
    })

    it("returns 400 when tournament id not a number", async () => {
        const { headers } = await loginAs();
        
        const res = await api.post("/api/v1/watchlist/abc")
                                .set(headers);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(await watchlistRows()).toHaveLength(0);
    })

    it("returns 409 when tournament already in watchlist", async () => {
        const tournamentId = await makeTournament();
        const { headers, id} = await loginAs();
        await makeWatchlistEntry({tournament_id: tournamentId, user_id: id});

        const res = await api.post("/api/v1/watchlist/" + tournamentId)
                                .set(headers);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(await watchlistRows()).toHaveLength(1);
    })

    it("adds tournament to watchlist", async () => {
        const tournamentId = await makeTournament();
        const { headers, id } = await loginAs();
        
        const res = await api.post("/api/v1/watchlist/" + tournamentId)
                                .set(headers);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const data = res.body.data;
        const watchlist = await query("SELECT * FROM user_watchlist WHERE user_id = ? and tournament_id = ?",[id, tournamentId])
        expect(data.userId).toBe(watchlist[0].user_id);
        expect(data.tournamentId).toBe(watchlist[0].tournament_id);
    })

    it("let two user watchlist the same tournament", async () => {
        const tournamentId = await makeTournament();
        const userA = await loginAs();
        const userB = await loginAs();
        await makeWatchlistEntry({user_id: userA.id, tournament_id: tournamentId});

        const res = await api.post("/api/v1/watchlist/" + tournamentId)
                                .set(userB.headers);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const watchlists = await watchlistRows();
        expect(watchlists).toHaveLength(2);
        expect(watchlists.map(r => r.user_id)).toEqual(expect.arrayContaining([userA.id, userB.id]))
    })
})