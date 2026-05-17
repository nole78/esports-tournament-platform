import { ServerInstance } from '../models/ServerInstance';

export interface ILoadBalancingStrategy {
    getNextServer(
        servers: ServerInstance[],
        clientIp?: string
    ): ServerInstance | null;
}
