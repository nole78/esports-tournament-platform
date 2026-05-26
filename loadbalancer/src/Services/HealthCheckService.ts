import { ServerInstance } from "../Domain/models/ServerInstance";
import { ILoggerService } from "../Domain/interfaces/ILoggerService";
import { ServerStatus } from "../Domain/enums/ServerStatus";
import { ApiStatusDto } from "../Domain/DTOs/ApiStatusDto";
import { LoadBalancerConfig } from "../Domain/types/LoadBalancerConfig";

export class HealthCheckService {
    private running = false;
    private config: LoadBalancerConfig;
    private servers: ServerInstance[] = [];

    public constructor(
        private readonly logger: ILoggerService,
        config: LoadBalancerConfig,
        servers: ServerInstance[]
    ) {
        this.config = config;
        this.servers = servers;
    }

    public async init(): Promise<void> {
        await this.run();
        setInterval(() => {
            void this.run();
        }, this.config.healthCheckInterval);
    }

    public async getApiHealth(): Promise<ApiStatusDto[]> {
        return this.servers.map((server) => (new ApiStatusDto(server.id, server.url, server.status, server.lastCheck, server.latency)));
    }

    private async run(): Promise<void> {
        if (this.running) return;
        this.running = true;
        try {
            const results = await Promise.all(
                this.servers.map(async (server) => {
                    const result = await this.checkServer(server);
                    return { server, result };
                    }
                )
            );
            let running = 0;
            for (const { server, result } of results) {
                server.latency = result.latency;
                server.lastCheck = new Date();
                if (!result.alive) {
                    server.status = ServerStatus.UNREACHABLE;
                    this.logger.warn("API", `${server.id} failed health check`);
                    continue;
                }
                running++;
                if (server.latency > this.config.healthCheckThreshold)
                    server.status = ServerStatus.DEGRADED;
                else
                    server.status = ServerStatus.HEALTHY;
            }
            if(running === 0) this.logger.error("API","There is no server running");
            this.logger.info("API", this.servers.map((s) => `${s.id}=${s.status}`).join(" | "));
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
                    signal: AbortSignal.timeout(this.config.healthCheckTimeout)
                }
            );
            return {alive:res.ok, latency: performance.now() - start};
        } catch {
            return {alive:false, latency: performance.now() - start};
        }
    }
}