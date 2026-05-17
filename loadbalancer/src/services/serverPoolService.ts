import { servers } from '../config/servers';

import { ServerInstance } from '../types/ServerInstance';

import { roundRobin } from '../algorithms/roundRobin';
import { LoadBalancingAlgorithm } from '../types/LoadBalancingAlgorithm';
import { leastConnections } from '../algorithms/leastConnections';
import { loadBalancerConfig } from '../config/loadBalancerConfig';
import { ILoggerService } from '../utils/ILoggerService';

const algorithm = loadBalancerConfig.algorithm;

export class ServerPoolService {
    private healthCheckRunning = false;
    public constructor(private readonly logger: ILoggerService){}

    public async init() {
        await this.runHealthCheck();
        setInterval(() => {
            void this.runHealthCheck();
        }, loadBalancerConfig.healthCheckInterval);
    }

    private async runHealthCheck() : Promise<void>{
        if(this.healthCheckRunning) return;

        this.healthCheckRunning = true;
        try
        {
            for (const server of servers) {
                const alive = await this.checkServer(server);
                server.alive = alive;
                if(!alive)
                    this.logger.warn("LB", `Server ${server.id} failed health check`);
            }
            this.logger.info("LB",servers.map((s) => `${s.id}=${s.alive?"healthy":"unreachable"}`).join(" | "));
        }
        finally{
            this.healthCheckRunning = false;
        }
    }

    private async checkServer(server: ServerInstance): Promise<boolean> {
        try {
            const res = await fetch(`${server.url}/api/v1/health`, {
                method: "GET",
                signal: AbortSignal.timeout(loadBalancerConfig.healthCheckTimeout)
            });

            return res.ok;
        } catch {
            return false;
        }
    }

    public getAvailableServers(): ServerInstance[] {
        return servers.filter(server => server.alive);
    }

    public getNextServer(): ServerInstance | null {

        const availableServers = this.getAvailableServers();

        if (availableServers.length === 0) {
            return null;
        }

        switch (algorithm) {
            case LoadBalancingAlgorithm.ROUND_ROBIN:
                return roundRobin(availableServers);
            case LoadBalancingAlgorithm.LEAST_CONNECTIONS:
                return leastConnections(availableServers);
            default:
                return roundRobin(availableServers);
        }
    }

    public incrementConnections(serverId: string): void {

        const server = servers.find(s => s.id === serverId);

        if (!server) {
            return;
        }

        server.currentConnections++;
    }

    public decrementConnections(serverId: string): void {

        const server = servers.find(s => s.id === serverId);

        if (!server) {
            return;
        }

        server.currentConnections = Math.max(0, server.currentConnections - 1);
    }
}