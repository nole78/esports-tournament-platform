import { ServerInstance } from '../Domain/models/ServerInstance';
import { ILoadBalancingStrategy } from '../Domain/interfaces/ILoadbalancingStrategy';

export class  LeastConnectionsStrategy implements ILoadBalancingStrategy{
    public getNextServer(servers: ServerInstance[]): ServerInstance {
        return servers[0];
    }
}