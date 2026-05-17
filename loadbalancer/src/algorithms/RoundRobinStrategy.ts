import { ServerInstance } from "../domain/models/ServerInstance";
import { ILoadBalancingStrategy } from '../domain/interfaces/ILoadbalancingStrategy';



export class RoundRobinStrategy implements ILoadBalancingStrategy{
    private currentIdx = 0;
    public getNextServer(servers: ServerInstance[]):ServerInstance{
        const n = servers.length;

        const server = servers[this.currentIdx];
        this.currentIdx = (this.currentIdx + 1) % n;
        
        return server;
}
}