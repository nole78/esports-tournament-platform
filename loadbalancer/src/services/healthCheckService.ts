import { servers } from "../config/servers";
import { ServerInstance } from "../types/ServerInstance";
import { ILoggerService } from '../utils/ILoggerService';

const HEALTH_CHECK_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL ?? "10000", 10);
const HEALTH_CHECK_TIMEOUT = parseInt(process.env.HEALTH_CHECK_TIMEOUT ?? "3000", 10);

export class HealthCheckService {
    public constructor(private readonly logger: ILoggerService){}

    public  async start() {
    setInterval(async () => {
        for (const server of servers) {
            const alive = await this.checkServer(server);
            server.alive = alive;
            if(!alive)
                this.logger.warn("LB", `Server ${server.id} failed health check`);
        }

        this.logger.info("LB",servers.map((s) => `${s.id}=${s.alive?"healthy":"unreachable"}`).join(" | "));
    }, HEALTH_CHECK_INTERVAL);
    }

    private async checkServer(server: ServerInstance): Promise<boolean> {
        try {
            const res = await fetch(`${server.url}/api/v1/health`, {
                method: "GET",
                signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT)
            });

            return res.ok;
        } catch {
            return false;
        }
    }
}