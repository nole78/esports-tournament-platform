import { ServerStatus } from "../enums/ServerStatus";

export interface ServerInstance {
    id: string;
    url: string;

    weight: number;

    status: ServerStatus;
    latency: number,

    currentConnections: number;
}