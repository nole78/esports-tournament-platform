import { ServerInstance } from "../models/ServerInstance";

export interface IServerPoolService {
    getAvailableServers(): ServerInstance[];
    getNextServer(clientIp?: string): ServerInstance;
    incrementConnections(serverId: string): void;
    decrementConnections(serverId: string): void;
}