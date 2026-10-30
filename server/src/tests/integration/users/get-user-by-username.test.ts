import { describe, it, expect} from "vitest"
import supertest from "supertest"
import app from "../../../app"
import { makeUser } from "../../factories"

const api = supertest(app);

describe("GET /api/v1/users/search/:username", () => {
    it("returns empty list when user doesn't exist", async () => {
        const res = await api.get("/api/v1/users/search/admin");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
    });

    it("returns all users that contain search string", async () => {
        for(let i = 0; i < 5; i++)
            await makeUser({ gamer_tag: "user" + i})
        const res = await api.get("/api/v1/users/search/user");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(5);
    })

    it("returns user with username", async () => {
        await makeUser({ gamer_tag: "admin"});
        await makeUser();

        const res = await api.get("/api/v1/users/search/admin");
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const data = res.body.data;
        expect(data[0].gamerTag).toBe("admin");
    })
})