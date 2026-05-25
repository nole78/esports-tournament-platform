import { ServerInstance } from "../Domain/models/ServerInstance";
import { ILoadBalancingStrategy } from '../Domain/interfaces/ILoadbalancingStrategy';



export class RoundRobinStrategy implements ILoadBalancingStrategy{
    private currentIdx = 0;
    public getNextServer(servers: ServerInstance[]) {
        if(servers.length === 0) return new ServerInstance;
        
        const n = servers.length;

        const server = servers[this.currentIdx];
        this.currentIdx = (this.currentIdx + 1) % n;
        
        return server;
    }
}