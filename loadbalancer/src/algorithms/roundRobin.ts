import { ServerInstance } from "../types/ServerInstance";
import { ILoadBalancingStrategy } from './ILoadbalancingStrategy';



export class RoundRobin implements ILoadBalancingStrategy{
    private currentIdx = 0;
    public getNextServer(servers: ServerInstance[]):ServerInstance{
        const n = servers.length;
        
        const server = servers[this.currentIdx];
        this.currentIdx = (this.currentIdx + 1) % n;
        
        return server;
}
}