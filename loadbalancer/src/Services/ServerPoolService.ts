import { ServerInstance } from '../Domain/models/ServerInstance';
import { ILoadBalancingStrategy } from '../Domain/interfaces/ILoadbalancingStrategy';
import { ServerStatus } from '../Domain/enums/ServerStatus';
import { IServerPoolService } from '../Domain/interfaces/IServerPoolService';

export class ServerPoolService implements IServerPoolService {
    private servers :ServerInstance[] = []

    public constructor( 
        private readonly strategy: ILoadBalancingStrategy,
        servers: ServerInstance[]
    ){
        this.servers = servers;
    }

    public getAvailableServers(): ServerInstance[] {
        return this.servers.filter(server => server.status !== ServerStatus.UNREACHABLE);
    }

    public getNextServer(clientIp?: string): ServerInstance {

        const availableServers = this.getAvailableServers();

        if (availableServers.length === 0) {
            return new ServerInstance;
        }

        return this.strategy.getNextServer(availableServers, clientIp);
    }

    public incrementConnections(serverId: string): void {

        const server = this.servers.find(s => s.id === serverId);

        if (!server) {
            return;
        }

        server.currentConnections++;
    }

    public decrementConnections(serverId: string): void {

        const server = this.servers.find(s => s.id === serverId);

        if (!server) {
            return;
        }

        server.currentConnections = Math.max(0, server.currentConnections - 1);
    }
}