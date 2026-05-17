import { ServerInstance } from '../types/ServerInstance';

export interface ILoadBalancingStrategy {
    getNextServer(
        servers: ServerInstance[]
    ): ServerInstance;
}
