import { ServerInstance } from '../domain/models/ServerInstance';
import { ILoadBalancingStrategy } from '../domain/interfaces/ILoadbalancingStrategy';

export class  LeastConnectionsStrategy implements ILoadBalancingStrategy{
    public getNextServer(servers: ServerInstance[]): ServerInstance {
        return servers[0];
    }
}