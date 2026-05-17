import { ServerInstance } from '../domain/models/ServerInstance';
import { ILoadBalancingStrategy } from '../domain/interfaces/ILoadbalancingStrategy';

export class  LeastConnectionsStrategy implements ILoadBalancingStrategy{
    public getNextServer(servers: ServerInstance[]): ServerInstance {
        return servers.reduce((least,current) => {
            return (current.currentConnections < least.currentConnections) 
                ? current
                : least;
        })
    }
}