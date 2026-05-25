import { ILoadBalancingStrategy } from "../Domain/interfaces/ILoadbalancingStrategy";
import { ServerInstance } from "../Domain/models/ServerInstance";

export class WeightedRoundRobinStrategy implements ILoadBalancingStrategy{
    private currentIdx = 0;
    private timesHit = 0;
    public getNextServer(servers: ServerInstance[]) {
        const n = servers.length;
        if(n === 0) return new ServerInstance;

        const server = servers[this.currentIdx];
        this.timesHit++;
        if(this.timesHit === server.weight)
        {
            this.currentIdx = (this.currentIdx + 1) % n;
            this.timesHit = 0;
        }
        
        return server;
    }
}