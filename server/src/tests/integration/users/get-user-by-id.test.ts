import { describe, it, expect} from "vitest"
import supertest from "supertest"
import app from "../../../app"
import { makeUser } from "../../factories"
import { query } from "../../helpers/db";

const api = supertest(app);

describe("GET /api/v1/users/:id", () => {
    it("returns 404 when user doesn't exist", async () => {
        const res = await api.get("/api/v1/users/1");

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("returns 400 when not numerical id", async () => {
        const res = await api.get("/api/v1/users/abc");

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    })

    it("returns users with id", async () => {
        const userId = await makeUser();
        await makeUser();

        const res = await api.get("/api/v1/users/" + userId);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const user = await query("SELECT * FROM users WHERE id = ?", [userId]);
        const data = res.body.data;
        expect(data.gamerTag).toBe(user[0].gamer_tag);
        expect(data.id).toBe(user[0].id);
    })
})