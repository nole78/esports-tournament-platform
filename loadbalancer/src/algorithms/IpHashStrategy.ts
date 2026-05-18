import { ILoadBalancingStrategy } from "../Domain/interfaces/ILoadbalancingStrategy";
import { ServerInstance } from "../Domain/models/ServerInstance";
import crypto from 'crypto';

export class IpHashStrategy implements ILoadBalancingStrategy{
    public getNextServer(servers: ServerInstance[], clientIp?: string): ServerInstance | null {
        if(!clientIp || servers.length === 0) return null;
        const hash = this.hashIp(clientIp);
        const index = hash % servers.length;
        
        return servers[index];
    }

    private hashIp(ip: string): number {
        return crypto
            .createHash('md5')
            .update(ip)
            .digest()
            .readUInt32BE(0);
    }
}