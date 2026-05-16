import { servers } from '../config/servers';

import { ServerInstance } from '../types/ServerInstance';

import { roundRobin } from '../algorithms/roundRobin';
import { LoadBalancingAlgorithm } from '../types/LoadBalancingAlgorithm';
import { leastConnections } from '../algorithms/leastConnections';
import { loadBalancerConfig } from '../config/loadBalancerConfig';

const algorithm = loadBalancerConfig.algorithm;

class ServerPoolService {

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

        server.currentConnections--;
    }

    public markServerAsDead(serverId: string): void {

        const server = servers.find(s => s.id === serverId);

        if (!server) {
            return;
        }

        server.alive = false;
    }

    public markServerAsAlive(serverId: string): void {

        const server = servers.find(s => s.id === serverId);

        if (!server) {
            return;
        }

        server.alive = true;
    }

    public getServers(): ServerInstance[] {
        return servers;
    }
}

export const serverPoolService = new ServerPoolService();