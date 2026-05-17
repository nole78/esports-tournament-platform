import { loadBalancerConfig } from "../config/loadBalancerConfig";
import { servers } from "../config/servers";
import { ServerInstance } from "../domain/models/ServerInstance";
import { ILoggerService } from "../domain/interfaces/ILoggerService";

export class HealthCheckService {

    private running = false;

    public constructor(
        private readonly logger: ILoggerService
    ) {}

    public async init(): Promise<void> {
        await this.run();
        setInterval(() => {
            void this.run();
        }, loadBalancerConfig.healthCheckInterval);
    }

    private async run(): Promise<void> {
        if (this.running) {
            return;
        }
        this.running = true;
        try {
            for (const server of servers) {
                const alive = await this.checkServer(server);
                server.alive = alive;

                if (!alive) {
                    this.logger.warn(
                        "LB",
                        `Server ${server.id} failed health check`
                    );
                }
            }
        } finally {
            this.running = false;
        }
    }

    private async checkServer(server: ServerInstance): Promise<boolean> {
        try {
            const res = await fetch(
                `${server.url}/api/v1/health`,
                {
                    method: "GET",
                    signal: AbortSignal.timeout(loadBalancerConfig.healthCheckTimeout)
                }
            );
            return res.ok;
        } catch {
            return false;
        }
    }
}