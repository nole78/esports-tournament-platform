import { ServerInstance } from "../types/ServerInstance";
import { servers } from '../config/servers';

let currentIdx = 0;

export function roundRobin (servers: ServerInstance[]):ServerInstance | null {
    const n = servers.length;
    if(n === 0) return null;

    const server = servers[currentIdx];
    currentIdx = (currentIdx + 1) % n;
    
    return server;
}