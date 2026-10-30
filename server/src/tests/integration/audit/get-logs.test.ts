import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../../app";
import { makeAuditLog } from "../../factories";
import { loginAs } from "../../helpers/auth";
import { UserRole } from "../../../Domain/enums/UserRole";

const api = supertest(app)

describe("GET /api/v1/audit_log", () => {
    it("returns 200 and paginated list of logs", async () => {
        const { headers } = await loginAs(UserRole.ADMIN);
        for(let i = 0; i < 5; i++)
            await makeAuditLog();
        
        const res = await api.get("/api/v1/audit_log")
                        .query({page: 3, limit: 2})
                        .set(headers);

        expect(res.status).toBe(200);
        const data = res.body.data;
        expect(data.total).toBe(5);
        expect(data.pageSize).toBe(2);
        expect(data.items).toHaveLength(1);
    })

    it("returns 401 without the token", async () => {
        const res = await api.get("/api/v1/audit_log")
                            .query({page: 1, limit: 2});

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    })

    it("returns 403 when non-admin user", async () =>  {
        const { headers } = await loginAs(UserRole.PLAYER);

        const res = await api.get("/api/v1/audit_log")
                            .query({page: 1, limit: 2})
                            .set(headers)
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    })
})