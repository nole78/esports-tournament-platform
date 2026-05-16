import { ServerInstance } from '../types/ServerInstance';

export function leastConnections(servers: ServerInstance[]) : ServerInstance | null{
    const n = servers.length;
    if(n === 0) return null;
    let server = servers[0];
    for(let i = 0; i < n; i++)
    {
        if(servers[i].currentConnections < server.currentConnections)
            server = servers[i];
    }
    return server;
}