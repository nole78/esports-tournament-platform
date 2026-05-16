import { servers } from "../config/servers";
import { ServerInstance } from "../types/ServerInstance";

export async function startHealthCheck(interval = 5000) {
    setInterval(async () => {
        for (const server of servers) {
            const alive = await checkServer(server);

            server.alive = alive;

            if (!alive) {
                console.log(`[LB] Server down: ${server.id}`);
            }
        }
    }, interval);
}

async function checkServer(server: ServerInstance): Promise<boolean> {
    try {
        const res = await fetch(`${server.url}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(2000)
        });

        return res.ok;
    } catch {
        return false;
    }
}