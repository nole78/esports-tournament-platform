import { loadBalancerConfig } from "../config/loadBalancerConfig";
import { servers } from "../config/servers";
import { ServerInstance } from "../domain/models/ServerInstance";
import { ILoggerService } from "../domain/interfaces/ILoggerService";
import { ServerStatus } from "../domain/enums/ServerStatus";

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

    public async runHealthCheck(): Promise<ServerInstance[]> {
        await this.run();
        return servers;
    }

    private async run(): Promise<void> {
        if (this.running) return;
        this.running = true;
        try {
            const results = await Promise.all(
                servers.map(async (server) => {
                    const result = await this.checkServer(server);
                    return { server, result };
                    }
                )
            );
            let running = 0;
            for (const { server, result } of results) {
                server.latency = result.latency;

                if (!result.alive) {
                    server.status = ServerStatus.UNREACHABLE;
                    this.logger.warn("API", `${server.id} failed health check`);
                    continue;
                }
                running++;
                if (server.latency > loadBalancerConfig.healthCheckThreshold)
                    server.status = ServerStatus.DEGRADED;
                else
                    server.status = ServerStatus.HEALTHY;
            }
            if(running === 0) this.logger.error("API","There is no server running");
            this.logger.info("API",servers.map((s) => `${s.id}=${s.status}`).join(" | "));
        } finally {
            this.running = false;
        }
    }

    private async checkServer(server: ServerInstance): Promise<{ alive: boolean; latency: number }> {
        const start = performance.now();
        try {
            const res = await fetch(
                `${server.url}/api/v1/health`,
                {
                    method: "GET",
                    signal: AbortSignal.timeout(loadBalancerConfig.healthCheckTimeout)
                }
            );
            return {alive:res.ok, latency: performance.now() - start};
        } catch {
            return {alive:false, latency: performance.now() - start};
        }
    }
}