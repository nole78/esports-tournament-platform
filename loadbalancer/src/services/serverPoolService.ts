import { servers } from '../Config/servers';
import { ServerInstance } from '../Domain/models/ServerInstance';
import { ILoadBalancingStrategy } from '../Domain/interfaces/ILoadbalancingStrategy';
import { ServerStatus } from '../Domain/enums/ServerStatus';

export class ServerPoolService {
    public constructor( private readonly strategy: ILoadBalancingStrategy){}

    public getAvailableServers(): ServerInstance[] {
        return servers.filter(server => server.status !== ServerStatus.UNREACHABLE);
    }

    public getNextServer(clientIp?: string): ServerInstance | null {

        const availableServers = this.getAvailableServers();

        if (availableServers.length === 0) {
            return null;
        }

        return this.strategy.getNextServer(availableServers, clientIp);
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