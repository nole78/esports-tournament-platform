import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeUser } from "../../factories";
import { loginAs } from "../../helpers/auth";
import { UserRole } from "../../../Domain/enums/UserRole";

const api = supertest(app);

describe("GET /api/v1/users", () => {
    it("returns 401 when missing token", async () => {
        const res = await api.get("/api/v1/users");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    })

    it("returns 403 when non-admin user", async () => {
        const { headers } = await loginAs(UserRole.PLAYER);

        const res = await api.get("/api/v1/users")
                            .set(headers);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    })

    it("returns paginated list of users", async () => {
        for(let i = 1; i < 3; i ++)
            await makeUser();
        const { headers } = await loginAs(UserRole.ADMIN); // this creates another user!!!

        const res = await api.get("/api/v1/users")
                            .query({ page: 2, limit: 2})
                            .set(headers);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const data = res.body.data;
        expect(data.items).toHaveLength(1);
        expect(data.total).toBe(3);
        expect(data.pageSize).toBe(2);
    })
})