import { describe, it, expect } from "vitest"
import supertest from "supertest"
import app from "../../../app"
import { makeUser } from "../../factories"
import { loginAs } from "../../helpers/auth"
import { query } from "../../helpers/db"
import { UserRole } from "../../../Domain/enums/UserRole"

const api = supertest(app);

describe("PUT /api/v1/users/:id/role",  () => {
    it("returns 401 when missing token", async () => {
        const userId = await makeUser();
        const res = await api.put("/api/v1/users/"+ userId +"/role")
                            .send({role: "admin"})

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        const user = await  query("SELECT * FROM users WHERE id = ?", [userId]);
        expect(user[0].role).toBe(UserRole.PLAYER);
    })

    it("returns 403 when non-admin user", async () => {
        const userId = await makeUser();
        const { headers } = await loginAs(UserRole.PLAYER);
        const res = await api.put("/api/v1/users/"+ userId +"/role")
                            .set(headers)
                            .send({role: "admin"})

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        const user = await  query("SELECT * FROM users WHERE id = ?", [userId]);
        expect(user[0].role).toBe(UserRole.PLAYER);
    }) 

    it("returns 403 when trying to change admin user role", async () => {
        const userId = await makeUser({role: "admin"});
        const { headers } = await loginAs(UserRole.ADMIN);
        const res = await api.put("/api/v1/users/"+ userId +"/role")
                            .set(headers)
                            .send({role: "player"})

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        const user = await  query("SELECT * FROM users WHERE id = ?", [userId]);
        expect(user[0].role).toBe(UserRole.ADMIN);
    })

    it("returns 404 when user does not exist", async () => {
        const { headers } = await loginAs(UserRole.ADMIN);
        const res = await api.put("/api/v1/users/123/role")
                            .set(headers)
                            .send({role: "admin"})

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    })

    it("changes the role of non-admin user", async () => {
        const userId = await makeUser();
        const { headers } = await loginAs(UserRole.ADMIN);
        const res = await api.put("/api/v1/users/"+ userId +"/role")
                            .set(headers)
                            .send({role: "admin"})

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const user = await  query("SELECT * FROM users WHERE id = ?", [userId]);
        expect(user[0].role).toBe(UserRole.ADMIN);
    })
})