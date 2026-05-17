import { servers } from '../config/servers';
import { ServerInstance } from '../Domain/models/ServerInstance';
import { ILoadBalancingStrategy } from '../Domain/interfaces/ILoadbalancingStrategy';

export class ServerPoolService {
    public constructor( private readonly strategy: ILoadBalancingStrategy){}

    public getAvailableServers(): ServerInstance[] {
        return servers.filter(server => server.alive);
    }

    public getNextServer(): ServerInstance | null {

        const availableServers = this.getAvailableServers();

        if (availableServers.length === 0) {
            return null;
        }

        return this.strategy.getNextServer(availableServers);
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